import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestLog = {};

const fetchAllLinks = async (pageTitle) => {
  let allLinks = [];
  let continueParam = null;

  do {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=links&titles=${encodeURI(
      pageTitle
    )}&format=json&pllimit=max${continueParam ? `&plcontinue=${continueParam}` : ""}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch links from Wikipedia API");
    }

    const apiData = await apiResponse.json();
    const pages = apiData.query?.pages || {};
    const page = Object.values(pages)[0];

    if (page.links) {
      allLinks = allLinks.concat(page.links);
    }

    // Update the continue parameter for the next request
    continueParam = apiData.continue?.plcontinue || null;
  } while (continueParam);

  return allLinks;
};

const fetchInfoboxImage = async (pageTitle) => {
  try {
    // Fetch the parsed content of the page
    const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURI(
      pageTitle
    )}&prop=wikitext&format=json`;
    const parseResponse = await fetch(parseUrl);

    if (!parseResponse.ok) {
      throw new Error("Failed to fetch parsed content from Wikipedia API");
    }

    const parseData = await parseResponse.json();
    const wikitext = parseData.parse?.wikitext?.["*"];

    if (!wikitext) {
      throw new Error("Failed to retrieve wikitext");
    }

    // Extract image file names from the infobox
    const imageRegex = /\| *image *= *([^|\n]+)/g; // Regex to find image files in the infobox
    const matches = [...wikitext.matchAll(imageRegex)];
    const imageFile = matches[0]?.[1]?.trim(); // Get the first image file

    if (!imageFile) {
      return null; // No image found in the infobox
    }

    // Fetch the image URL using the imageinfo property
    const imageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURI(
      imageFile
    )}&prop=imageinfo&iiprop=url&format=json`;
    const imageInfoResponse = await fetch(imageInfoUrl);

    if (!imageInfoResponse.ok) {
      throw new Error("Failed to fetch image info from Wikipedia API");
    }

    const imageInfoData = await imageInfoResponse.json();
    const pages = imageInfoData.query?.pages || {};
    const imagePage = Object.values(pages)[0];
    const imageUrl = imagePage.imageinfo?.[0]?.url;

    return imageUrl || null; // Return the image URL or null if not found
  } catch (error) {
    console.error("Error fetching infobox image:", error);
    return null;
  }
};

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
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info|pageimages&exintro&explaintext&titles=${encodeURI(
      pageTitle
    )}&format=json&inprop=url&pithumbsize=500`;
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

    // Extract title, summary, and image
    const title = page.title;
    const summary = page.extract || "";
    let image = page.thumbnail?.source || null;

    // Fallback to infobox image if no thumbnail is available
    if (!image) {
      image = await fetchInfoboxImage(pageTitle);
    }

    // Fetch all links using pagination
    const allLinks = await fetchAllLinks(pageTitle);

    const maxLinks = 20; // Limit number of links
    const links = allLinks
      .filter((link) => link.ns === 0) // Only include links to articles (namespace 0)
      .slice(0, maxLinks)
      .map((link) => ({
        title: link.title,
        url: `https://en.wikipedia.org/wiki/${encodeURI(link.title.replace(/ /g, "_"))}`, // Replace spaces with underscores
      }));

    return NextResponse.json({
      title,
      summary,
      image,
      links,
      url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURI(pageTitle)}`
    });
  } catch (error) {
    console.error("Error fetching Wikipedia API:", error);
    return NextResponse.json({ error: "Failed to fetch Wikipedia data" }, { status: 500 });
  }
}

