import { NextResponse } from "next/server";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestLog = {};

const fetchAllLinks = async (identifier, isPageId = true) => {
  let allLinks = [];
  let continueParam = null;

  do {
    // Construct the API URL based on whether the identifier is a pageId or pageTitle
    const apiUrl = isPageId
      ? `https://en.wikipedia.org/w/api.php?action=query&prop=links&pageids=${identifier}&format=json&pllimit=max${
          continueParam ? `&plcontinue=${continueParam}` : ""
        }`
      : `https://en.wikipedia.org/w/api.php?action=query&prop=links&titles=${encodeURIComponent(
          identifier
        )}&format=json&pllimit=max${
          continueParam ? `&plcontinue=${continueParam}` : ""
        }`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch links from Wikipedia API");
    }

    const apiData = await apiResponse.json();
    const pages = apiData.query?.pages || {};
    const page = Object.values(pages)[0];

    if (page.links) {
      // Construct URLs using the title.replace method
      const linksWithUrls = page.links.map((link) => ({
        ...link,
        url: `https://en.wikipedia.org/wiki/${link.title.replace(/ /g, "_")}`, // Always use /wiki/ format
      }));
      allLinks = allLinks.concat(linksWithUrls);
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
  try {
    const { url } = await request.json();

    // Validate the URL structure
    if (!url || (!url.includes("wikipedia.org/?curid=") && !url.includes("wikipedia.org/wiki/"))) {
      return NextResponse.json({ error: "Invalid Wikipedia URL. Only URLs with ?curid= or /wiki/ are supported." }, { status: 400 });
    }

    let pageId = null;
    let pageTitle = null;

    // Determine the type of URL and extract the relevant data
    if (url.includes("?curid=")) {
      pageId = url.split("?curid=")[1];
    } else if (url.includes("/wiki/")) {
      pageTitle = url.split("/wiki/")[1].replace(/_/g, " "); // Replace underscores with spaces
    }

    console.log("Page ID:", pageId);
    console.log("Page Title:", pageTitle);

    // Fetch data from the Wikipedia API
    const apiUrl = pageId
      ? `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info|pageimages&exintro&explaintext&pageids=${pageId}&format=json&inprop=url&pithumbsize=500`
      : `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info|pageimages&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&inprop=url&pithumbsize=500`;

    console.log("API URL:", apiUrl);

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
    if (!image && pageTitle) {
      image = await fetchInfoboxImage(pageTitle);
    }

    // Fetch all links using pageId or pageTitle
    const allLinks = pageId
      ? await fetchAllLinks(pageId, true) // Pass pageId and specify it's a pageId
      : await fetchAllLinks(pageTitle, false); // Pass pageTitle and specify it's a pageTitle

    const maxLinks = 20; // Limit number of links
    const links = allLinks
      .filter((link) => link.ns === 0) // Only include links to articles (namespace 0)
      .slice(0, maxLinks);

    return NextResponse.json({
      title,
      summary,
      image,
      links,
      url: page.fullurl || (pageId ? `https://en.wikipedia.org/?curid=${pageId}` : `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, "_")}`),
    });
  } catch (error) {
    console.error("Error fetching Wikipedia API:", error);
    return NextResponse.json({ error: "Failed to fetch Wikipedia data" }, { status: 500 });
  }
}

