import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check and install dependencies if needed
async function checkAndInstallDependencies() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!await fs.pathExists(nodeModulesPath)) {
    console.log("📦 Installing dependencies...");
    try {
      execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
      console.log("✅ Dependencies installed!\n");
    } catch (err) {
      console.log("❌ Failed to install dependencies. Please run 'npm install' manually.");
      process.exit(1);
    }
  }
}

const BASE_URL = process.argv[2];
const OUTPUT_DIR = path.join(__dirname, "../scraped-data");
const VISITED = new Set();
let websiteData = {
  pages: [],
  assets: {
    images: [],
    css: [],
    js: [],
    fonts: [],
    favicon: null
  },
  structure: {
    components: [],
    routes: []
  }
};

async function fetchHTML(url) {
  // Try Puppeteer first for sites with bot protection
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
    });
    const page = await browser.newPage();
    
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const html = await page.content();
    await browser.close();
    return html;
  } catch (e) {
    // Fallback to axios
    try {
      const { data } = await axios.get(url, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        },
        timeout: 30000
      });
      return data;
    } catch (err) {
      console.log(`❌ Failed to fetch: ${url}`);
      return null;
    }
  }
}

function extractLinks($, baseUrl) {
  const links = [];
  $("a[href]").each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    
    try {
      if (!href.startsWith("http")) {
        href = new URL(href, baseUrl).href;
      }
      if (href.startsWith(baseUrl) && !VISITED.has(href)) {
        links.push(href);
      }
    } catch (e) {}
  });
  return links;
}

async function extractAssets($, baseUrl, pageUrl) {
  // Extract images
  $("img[src]").each((_, el) => {
    let src = $(el).attr("src");
    if (!src) return;
    
    try {
      if (!src.startsWith("http")) {
        src = new URL(src, baseUrl).href;
      }
      if (!websiteData.assets.images.find(img => img.url === src)) {
        websiteData.assets.images.push({
          url: src,
          alt: $(el).attr("alt") || "",
          page: pageUrl
        });
      }
    } catch (e) {}
  });

  // Extract CSS
  $("link[rel='stylesheet']").each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    
    try {
      if (!href.startsWith("http")) {
        href = new URL(href, baseUrl).href;
      }
      if (!websiteData.assets.css.find(c => c.url === href)) {
        websiteData.assets.css.push({
          url: href,
          page: pageUrl
        });
      }
    } catch (e) {}
  });

  // Extract JS
  $("script[src]").each((_, el) => {
    let src = $(el).attr("src");
    if (!src) return;
    
    try {
      if (!src.startsWith("http")) {
        src = new URL(src, baseUrl).href;
      }
      if (!websiteData.assets.js.find(j => j.url === src)) {
        websiteData.assets.js.push({
          url: src,
          page: pageUrl
        });
      }
    } catch (e) {}
  });
}

async function analyzePageStructure($, url, baseUrl) {
  // Extract comprehensive metadata and SEO tags
  const meta = {
    // Basic meta tags
    description: $('meta[name="description"]').attr("content") || "",
    keywords: $('meta[name="keywords"]').attr("content") || "",
    author: $('meta[name="author"]').attr("content") || "",
    robots: $('meta[name="robots"]').attr("content") || "",
    viewport: $('meta[name="viewport"]').attr("content") || "",
    charset: $('meta[charset]').attr("charset") || "",
    
    // Open Graph tags
    ogTitle: $('meta[property="og:title"]').attr("content") || "",
    ogDescription: $('meta[property="og:description"]').attr("content") || "",
    ogImage: $('meta[property="og:image"]').attr("content") || "",
    ogUrl: $('meta[property="og:url"]').attr("content") || "",
    ogType: $('meta[property="og:type"]').attr("content") || "",
    ogSiteName: $('meta[property="og:site_name"]').attr("content") || "",
    ogLocale: $('meta[property="og:locale"]').attr("content") || "",
    
    // Twitter Card tags
    twitterCard: $('meta[name="twitter:card"]').attr("content") || "",
    twitterTitle: $('meta[name="twitter:title"]').attr("content") || "",
    twitterDescription: $('meta[name="twitter:description"]').attr("content") || "",
    twitterImage: $('meta[name="twitter:image"]').attr("content") || "",
    twitterSite: $('meta[name="twitter:site"]').attr("content") || "",
    twitterCreator: $('meta[name="twitter:creator"]').attr("content") || "",
    
    // Additional SEO
    canonical: $('link[rel="canonical"]').attr("href") || "",
    themeColor: $('meta[name="theme-color"]').attr("content") || "",
    appleMobileWebAppCapable: $('meta[name="apple-mobile-web-app-capable"]').attr("content") || "",
    appleMobileWebAppStatusBarStyle: $('meta[name="apple-mobile-web-app-status-bar-style"]').attr("content") || "",
    
    // Language
    lang: $('html').attr("lang") || "en"
  };
  
  const structure = {
    url,
    title: $("title").text().trim(),
    meta,
    sections: [],
    components: []
  };

  // Extract main sections
  $("header, nav, main, section, article, aside, footer").each((_, el) => {
    const tag = el.name;
    const id = $(el).attr("id") || "";
    const className = $(el).attr("class") || "";
    const text = $(el).text().trim().substring(0, 200);
    
    structure.sections.push({
      tag,
      id,
      className,
      text,
      children: $(el).children().length
    });
  });

  // Identify common components
  const componentPatterns = {
    navbar: ['nav', '.navbar', '.navigation', '#nav'],
    header: ['header', '.header', '#header'],
    hero: ['.hero', '.banner', '.jumbotron'],
    footer: ['footer', '.footer', '#footer'],
    card: ['.card', '.product-card', '.item-card'],
    button: ['button', '.btn', '.button'],
    form: ['form', '.form', '#contact-form']
  };

  Object.entries(componentPatterns).forEach(([name, selectors]) => {
    selectors.forEach(selector => {
      if ($(selector).length > 0) {
        structure.components.push({
          name,
          selector,
          count: $(selector).length
        });
      }
    });
  });

  return structure;
}

async function scrapePage(url, baseUrl) {
  if (VISITED.has(url)) return [];
  VISITED.add(url);

  console.log(`🔍 Scraping: ${url}`);

  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);

  // Extract assets
  await extractAssets($, baseUrl, url);

  // Analyze structure
  const structure = await analyzePageStructure($, url, baseUrl);

  // Get rendered HTML with Puppeteer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const renderedHTML = await page.content();
    
    websiteData.pages.push({
      url,
      originalHTML: html,
      renderedHTML,
      structure
    });

    websiteData.structure.routes.push({
      url,
      path: new URL(url).pathname,
      title: structure.title
    });
  } catch (err) {
    console.log(`⚠️ Puppeteer error for ${url}: ${err.message}`);
    websiteData.pages.push({
      url,
      originalHTML: html,
      renderedHTML: html,
      structure
    });
  }
  
  await browser.close();

  // Extract favicon
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]'
  ];
  
  for (const selector of faviconSelectors) {
    const faviconHref = $(selector).attr("href");
    if (faviconHref) {
      try {
        let faviconUrl = faviconHref;
        if (!faviconUrl.startsWith("http")) {
          faviconUrl = new URL(faviconUrl, baseUrl).href;
        }
        
        // Only set if not already set
        if (!websiteData.assets.favicon) {
          websiteData.assets.favicon = {
            url: faviconUrl,
            rel: $(selector).attr("rel") || "icon",
            sizes: $(selector).attr("sizes") || "",
            type: $(selector).attr("type") || ""
          };
        }
        break;
      } catch (e) {}
    }
  }
  
  // Fallback: try common favicon paths
  if (!websiteData.assets.favicon) {
    const commonFaviconPaths = [
      "/favicon.ico",
      "/favicon.svg",
      "/favicon.png",
      "/apple-touch-icon.png"
    ];
    
    for (const faviconPath of commonFaviconPaths) {
      try {
        const faviconUrl = new URL(faviconPath, baseUrl).href;
        websiteData.assets.favicon = {
          url: faviconUrl,
          rel: "icon",
          sizes: "",
          type: ""
        };
        break;
      } catch (e) {}
    }
  }

  // Extract links for crawling
  const links = extractLinks($, baseUrl);
  return links;
}

async function downloadAssets() {
  console.log(`\n⬇️ Downloading assets...`);
  
  await fs.ensureDir(path.join(OUTPUT_DIR, "assets", "images"));
  await fs.ensureDir(path.join(OUTPUT_DIR, "assets", "css"));
  await fs.ensureDir(path.join(OUTPUT_DIR, "assets", "js"));
  
  // Download favicon
  if (websiteData.assets.favicon && websiteData.assets.favicon.url) {
    try {
      console.log(`📎 Downloading favicon: ${websiteData.assets.favicon.url}`);
      const response = await axios.get(websiteData.assets.favicon.url, { 
        responseType: 'arraybuffer', 
        timeout: 30000 
      });
      
      // Detect file type
      const contentType = response.headers['content-type'] || '';
      let ext = '.ico';
      if (contentType.includes('svg')) {
        ext = '.svg';
      } else if (contentType.includes('png')) {
        ext = '.png';
      } else {
        // Try to detect from URL
        const urlPath = new URL(websiteData.assets.favicon.url).pathname;
        const urlExt = path.extname(urlPath);
        if (urlExt) {
          ext = urlExt;
        }
      }
      
      const faviconFilename = `favicon${ext}`;
      await fs.writeFile(path.join(OUTPUT_DIR, faviconFilename), response.data);
      websiteData.assets.favicon.localPath = faviconFilename;
      console.log(`✔ Downloaded favicon: ${faviconFilename}`);
    } catch (err) {
      console.log(`❌ Failed to download favicon: ${websiteData.assets.favicon.url}`);
    }
  }

  // Download images
  for (let i = 0; i < websiteData.assets.images.length; i++) {
    const img = websiteData.assets.images[i];
    try {
      const response = await axios.get(img.url, { responseType: 'arraybuffer', timeout: 30000 });
      
      // Detect file type from content-type header
      const contentType = response.headers['content-type'] || '';
      let ext = '.jpg';
      
      if (contentType.includes('svg')) {
        ext = '.svg';
      } else if (contentType.includes('png')) {
        ext = '.png';
      } else if (contentType.includes('gif')) {
        ext = '.gif';
      } else if (contentType.includes('webp')) {
        ext = '.webp';
      } else {
        // Try to detect from URL or Next.js path
        const urlPath = new URL(img.url).pathname;
        if (urlPath.includes('/_next/image?url=')) {
          try {
            const match = img.url.match(/url=([^&]+)/);
            if (match) {
              const decodedPath = decodeURIComponent(match[1]);
              const urlExt = path.extname(decodedPath);
              if (urlExt) {
                ext = urlExt;
              }
            }
          } catch {}
        } else {
          const urlExt = path.extname(urlPath);
          if (urlExt) {
            ext = urlExt;
          }
        }
      }
      
      const filename = `image_${i}${ext}`;
      await fs.writeFile(path.join(OUTPUT_DIR, "assets", "images", filename), response.data);
      img.localPath = `assets/images/${filename}`;
      img.contentType = contentType;
      console.log(`✔ Downloaded: ${filename} (${contentType})`);
    } catch (err) {
      console.log(`❌ Failed: ${img.url}`);
    }
  }

  // Download CSS
  for (let i = 0; i < websiteData.assets.css.length; i++) {
    const css = websiteData.assets.css[i];
    try {
      const response = await axios.get(css.url, { timeout: 30000 });
      const filename = `style_${i}.css`;
      await fs.writeFile(path.join(OUTPUT_DIR, "assets", "css", filename), response.data);
      css.localPath = `assets/css/${filename}`;
      console.log(`✔ Downloaded: ${filename}`);
    } catch (err) {
      console.log(`❌ Failed: ${css.url}`);
    }
  }
}

async function crawl(url, baseUrl, maxPages = 50) {
  const links = await scrapePage(url, baseUrl);
  
  if (links && links.length > 0 && VISITED.size < maxPages) {
    for (const link of links.slice(0, 10)) {
      if (VISITED.size >= maxPages) break;
      await crawl(link, baseUrl, maxPages);
    }
  }
}

async function main() {
  if (!BASE_URL) {
    console.log("❗ Usage: node scripts/scrape-website.js <website_url>");
    console.log("   Example: node scripts/scrape-website.js https://example.com");
    process.exit(1);
  }

  // Check and install dependencies if needed
  await checkAndInstallDependencies();

  console.log("🚀 Website Cloner - Scraper\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`🌐 Target URL: ${BASE_URL}\n`);

  const baseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

  // Clean output directory
  await fs.emptyDir(OUTPUT_DIR);

  // Crawl website
  console.log("📄 Crawling website...\n");
  await crawl(baseUrl, baseUrl, 10);

  // Download assets
  await downloadAssets();

  // Save all data
  await fs.writeJSON(path.join(OUTPUT_DIR, "website-data.json"), websiteData, { spaces: 2 });
  console.log(`\n📄 Saved: ${OUTPUT_DIR}/website-data.json`);

  // Save individual pages
  await fs.ensureDir(path.join(OUTPUT_DIR, "pages"));
  for (const page of websiteData.pages) {
    const filename = page.url
      .replace(/https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 100) + '.html';
    
    await fs.writeFile(path.join(OUTPUT_DIR, "pages", filename), page.renderedHTML);
  }

  console.log(`\n🎉 Scraping complete!`);
  console.log(`   • Pages: ${websiteData.pages.length}`);
  console.log(`   • Images: ${websiteData.assets.images.length}`);
  console.log(`   • CSS Files: ${websiteData.assets.css.length}`);
  console.log(`   • JS Files: ${websiteData.assets.js.length}`);
}

main().catch(console.error);
