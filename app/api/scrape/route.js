import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestLog = {};

export async function POST(request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }

  // Clean up old requests
  requestLog[ip] = requestLog[ip].filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);

  // Check if rate limit exceeded
  if (requestLog[ip].length >= MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  // Add current request to log
  requestLog[ip].push(now);

  try {
    const { url } = await request.json();

    if (!url || !url.includes("wikipedia.org/wiki/")) {
      return NextResponse.json({ error: "Invalid Wikipedia URL" }, { status: 400 });
    }

    // Extract the page title from the URL
    const pageTitle = url.split("/wiki/")[1];

    // Fetch data from the Wikipedia API
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&exintro&explaintext&titles=${encodeURIComponent(
      pageTitle
    )}&format=json&inprop=url`;
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch Wikipedia API" }, { status: 500 });
    }

    const apiData = await apiResponse.json();
    const pages = apiData.query?.pages || {};
    const page = Object.values(pages)[0];

    if (!page || page.missing) {
      return NextResponse.json({ error: "Wikipedia page not found" }, { status: 404 });
    }

    // Extract title, summary, and links
    const title = page.title;
    const summary = page.extract || "";
    const links = [];

    // Fetch the page HTML to extract links and images if needed
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Wikipedia page" }, { status: 500 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract internal Wikipedia links from the first few paragraphs
    const maxLinks = 15; // Limit number of links to prevent overwhelming the graph
    $(".mw-parser-output > p a").each((i, el) => {
      if (links.length >= maxLinks) return;

      const href = $(el).attr("href");
      const linkTitle = $(el).attr("title") || $(el).text();

      if (
        href &&
        href.startsWith("/wiki/") &&
        !href.includes(":") && // Skip special pages
        !href.includes("#") && // Skip section links
        linkTitle
      ) {
        const fullUrl = "https://en.wikipedia.org" + href;

        // Avoid duplicates
        if (!links.some((link) => link.url === fullUrl)) {
          links.push({
            title: linkTitle,
            url: fullUrl,
          });
        }
      }
    });

    // Attempt to get the og:image meta property
    let image = null;
    const ogImageElement = $('meta[property="og:image"]').attr("content");
    if (ogImageElement) {
      image = ogImageElement;
      console.log("Using og:image:", image);
    } else {
      // Fallback to the first image in an infobox
      const infoboxImage = $(".infobox img").first();
      if (infoboxImage.length) {
        image = infoboxImage.attr("src");
        console.log("Using infobox image:", image);
      } else {
        // Fallback to the first image inside a figure tag with typeof="mw:File/Thumb"
        const figureImage = $('figure[typeof="mw:File/Thumb"] img').first();
        if (figureImage.length) {
          image = figureImage.attr("src");
          console.log("Using figure image:", image);
        }
      }
    }

    // Ensure the image URL is complete
    if (image && image.startsWith("//")) {
      image = "https:" + image;
      console.log("Formatted image URL:", image);
    }

    if (!image) {
      console.log("No image found");
    }

    return NextResponse.json({
      title,
      summary,
      image,
      links,
    });
  } catch (error) {
    console.error("Error scraping Wikipedia:", error);
    return NextResponse.json({ error: "Failed to scrape Wikipedia page" }, { status: 500 });
  }
}

