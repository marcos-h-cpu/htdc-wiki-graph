import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0' });

    const data = await page.evaluate(async () => {
      const title = document.querySelector('h1#firstHeading')?.innerText.trim();
      const nodeId = title.replace(/\s+/g, '_'); // Create unique ID from title
      const paragraphs = Array.from(document.querySelectorAll('#mw-content-text p'));

      let content = paragraphs.map(p => p.innerText.trim().replace(/\[\d+\]/g, '')).join('\n\n'); // Remove references
      
      // Set max character length
      const maxLength = 500;
      if (content.length > maxLength) {
        content = content.slice(0, maxLength);
        const lastPeriodIndex = content.lastIndexOf('.');
        if (lastPeriodIndex !== -1) {
          content = content.slice(0, lastPeriodIndex + 1);
        } else {
          content = content.split(' ').slice(0, -1).join(' ') + '.';
        }
      }
  
      // Extract Open Graph Image URL
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
  
      // Function to determine aspect ratio
      async function getImageRatio(imgUrl) {
          return new Promise((resolve) => {
              if (!imgUrl) return resolve(null);
  
              const img = new Image();
              img.src = imgUrl;
              img.onload = () => {
                  const ratio = img.width / img.height;
                  if (ratio > 1.05) {
                      resolve("landscape");
                  } else if (ratio < 0.95) {
                      resolve("portrait");
                  } else {
                      resolve("square");
                  }
              };
              img.onerror = () => resolve(null); // Handle errors
          });
      }
  
      const imageRatio = await getImageRatio(ogImage); // Get image ratio
  
      const excludedSections = new Set([
        'Cast', 'Production', 'Accolades', 'Reception', 
        'Notes', 'References', 'See also', 'Further reading', 
        'Bibliography', 'External links', 'General references'
      ]);
    
      const sections = document.querySelectorAll('.mw-body-content .mw-heading.mw-heading2, .mw-body-content .mw-heading.mw-heading3');
      
      const linksSet = new Set();
    
      sections.forEach(section => {
        const header = section.innerText.trim();
        if (excludedSections.has(header)) return;
    
        let nextElem = section.nextElementSibling;
    
        // Traverse until the next section starts
        while (nextElem && !nextElem.matches('.mw-heading.mw-heading2, .mw-heading.mw-heading3')) {
            if (nextElem.tagName === 'P') {
                // Extract links only from paragraphs
                const sectionLinks = Array.from(nextElem.querySelectorAll('a[href^="/wiki/"]'))
                    .map(a => a.getAttribute('href').replace(/^\/wiki\//, ''))
                    .filter(link => 
                        !/^Wikipedia:|^File:/i.test(link) &&  // Ignore Wikipedia & File links
                        !/^[A-Z][a-z]+(_[A-Z][a-z]+)+$/.test(link) // Ignore proper names
                    );
    
                sectionLinks.forEach(link => linksSet.add(link));
            }
            nextElem = nextElem.nextElementSibling;
        }
      });
    
      const links = Array.from(linksSet);
    
      return { id: nodeId, title, content, links, ogImage, imageRatio };
  });
  
    await browser.close();
    res.status(200).json(data);
  } catch (error) {
    console.error('Scraping Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
