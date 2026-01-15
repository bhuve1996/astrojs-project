import { getAssets, PageData } from './loadWebsiteData';
import { siteConfig, applyPathMapping } from '../config/site.config';

/**
 * Creates a mapping from original image paths to local asset paths
 */
function createImageMap(): Map<string, string> {
  const assets = getAssets();
  const imageMap = new Map<string, string>();
  
  if (assets.images) {
    assets.images.forEach((img) => {
      // Extract original path from Next.js image URL
      try {
        const url = new URL(img.url);
        const imagePath = url.searchParams.get('url');
        if (imagePath) {
          // Decode the URL-encoded path (e.g., %2Fimages%2Flogo.svg -> /images/logo.svg)
          const decodedPath = decodeURIComponent(imagePath);
          // Map to local path (add leading slash for public directory)
          const localPath = `/${img.localPath || img.filename || ''}`;
          imageMap.set(decodedPath, localPath);
          // Also map without leading slash
          imageMap.set(decodedPath.replace(/^\//, ''), localPath);
        }
      } catch (e) {
        // If URL parsing fails, try to extract from the URL string directly
        const match = img.url.match(/[?&]url=([^&]+)/);
        if (match) {
          const decodedPath = decodeURIComponent(match[1]);
          const localPath = `/${img.localPath || img.filename || ''}`;
          imageMap.set(decodedPath, localPath);
          imageMap.set(decodedPath.replace(/^\//, ''), localPath);
        }
      }
    });
  }
  
  return imageMap;
}

/**
 * Replaces Next.js image optimization URLs with direct asset paths.
 * Uses config-driven replacements from site.config.ts
 */
export function processHtmlImages(html: string): string {
  if (!html) return html;
  
  const imageMap = createImageMap();
  
  // Apply config-driven URL replacements first
  for (const replacement of siteConfig.urlReplacements) {
    if (replacement.useRegex && replacement.pattern instanceof RegExp) {
      if (typeof replacement.replacement === 'string') {
        html = html.replace(replacement.pattern, replacement.replacement);
      } else if (typeof replacement.replacement === 'function') {
        html = html.replace(replacement.pattern, replacement.replacement);
      }
    } else if (typeof replacement.pattern === 'string') {
      if (typeof replacement.replacement === 'string') {
        html = html.split(replacement.pattern).join(replacement.replacement);
      }
    }
  }
  
  // Helper function to find and replace image URL
  const replaceImageUrl = (encodedPath: string): string | null => {
    try {
      const decodedPath = decodeURIComponent(encodedPath);
      let localPath = imageMap.get(decodedPath) || imageMap.get(decodedPath.replace(/^\//, ''));
      
      // Apply path mappings from config if no direct mapping found
      if (!localPath) {
        localPath = applyPathMapping(decodedPath);
        // Only use mapped path if it's different (was actually mapped)
        if (localPath === decodedPath) {
          localPath = null as any; // Reset if no mapping applied
        } else {
          localPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
        }
      }
      
      if (localPath) {
        return localPath;
      }
      
      // Try with partial path (in case of query params)
      const partialPath = encodedPath.split('&')[0];
      if (partialPath !== encodedPath) {
        try {
          const decoded = decodeURIComponent(partialPath);
          localPath = imageMap.get(decoded) || imageMap.get(decoded.replace(/^\//, ''));
          if (localPath) {
            return localPath;
          }
        } catch (e2) {
          // Ignore
        }
      }
    } catch (e) {
      // If decoding fails, try to find by partial match
      const partialPath = encodedPath.split('&')[0];
      try {
        const decoded = decodeURIComponent(partialPath);
        const localPath = imageMap.get(decoded) || imageMap.get(decoded.replace(/^\//, ''));
        if (localPath) {
          return localPath;
        }
      } catch (e2) {
        // Ignore
      }
    }
    return null;
  };
  
  // Replace Next.js image URLs in src attributes (handle both single and double quotes, and HTML entities like &amp;)
  html = html.replace(
    /src=(["'])\/_next\/image\?url=([^"'\s&]+)(?:[^"']*)?\1/g,
    (match, quote, encodedPath) => {
      // Decode HTML entities in the encoded path
      const decodedPath = encodedPath.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      const localPath = replaceImageUrl(decodedPath);
      if (localPath) {
        return `src=${quote}${localPath}${quote}`;
      }
      return match; // Return original if no match found
    }
  );
  
  // Replace Next.js image URLs in srcset attributes (handle HTML entities like &amp; in srcset)
  html = html.replace(
    /srcset=(["'])([^"']*\/_next\/image\?url=[^"'\s]+[^"']*)\1/g,
    (match, quote, srcsetValue) => {
      // Decode HTML entities in srcset value
      const decodedSrcset = srcsetValue.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      const processed = decodedSrcset.replace(
        /\/_next\/image\?url=([^\s&]+)(?:[^\s]*)?/g,
        (imgMatch: string, encodedPath: string) => {
          const localPath = replaceImageUrl(encodedPath);
          if (localPath) {
            // Preserve any size/quality info if present (e.g., " 1x" or " 2x")
            const suffix = imgMatch.match(/(\s+\d+x?|\s+\d+w)/)?.[0] || '';
            return localPath + suffix;
          }
          return imgMatch;
        }
      );
      return `srcset=${quote}${processed}${quote}`;
    }
  );
  
  // Also replace any remaining absolute Next.js image URLs (in any context)
  html = html.replace(
    /https?:\/\/[^/]+\/_next\/image\?url=([^"'\s&<>]+)(?:[^"'\s&<>]*)?/g,
    (match, encodedPath) => {
      const localPath = replaceImageUrl(encodedPath);
      if (localPath) {
        return localPath;
      }
      return match;
    }
  );
  
  // Remove Next.js-specific image attributes
  html = html.replace(/\s+data-nimg="[^"]*"/g, '');
  html = html.replace(/\s+style="color:transparent"/g, '');
  
  return html;
}

/**
 * Processes all HTML content in a page, fixing image URLs and other issues
 */
export function processPageHtml(page: PageData): string {
  if (!page.renderedHTML) return '';
  
  let html = page.renderedHTML;
  
  // Fix image URLs
  html = processHtmlImages(html);
  
  return html;
}
