import { getAssets } from './loadWebsiteData';
import type { PageData } from './loadWebsiteData';
import { siteConfig, applyPathMapping } from '../config/site.config';

/**
 * Creates a mapping from original image paths to local asset paths
 */
function createImageMap(): Map<string, string> {
  const assets = getAssets();
  const imageMap = new Map<string, string>();

  if (assets.images) {
    assets.images.forEach(img => {
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

  // Process images FIRST before other URL replacements
  // This ensures /_next/image?url=... patterns are handled correctly

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
          localPath = null as string | null; // Reset if no mapping applied
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

  // Replace Next.js image URLs in src attributes
  // Handle both single and double quotes, and HTML entities like &amp;
  // Pattern: src=".../_next/image?url=ENCODED_PATH&params..." or src='...'
  html = html.replace(
    /src=(["'])\/_next\/image\?url=([^"'\s&]+(?:&amp;[^"'\s&]+)*?)(?:&amp;[^"']*)?\1/g,
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

  // Also handle cases with trailing quote (different pattern)
  html = html.replace(
    /src=(["'])\/_next\/image\?url=([^"'\s&]+(?:&amp;[^"'\s&]+)*?)(["'])/g,
    (match, quote1, encodedPath, quote2) => {
      // Decode HTML entities
      const decodedPath = encodedPath.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      const localPath = replaceImageUrl(decodedPath);
      if (localPath) {
        return `src=${quote1}${localPath}${quote2}`;
      }
      return match;
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

  // Apply config-driven URL replacements AFTER image processing
  // This handles other Next.js paths that don't need special image processing
  for (const replacement of siteConfig.urlReplacements) {
    if (replacement.useRegex && replacement.pattern instanceof RegExp) {
      if (typeof replacement.replacement === 'string') {
        html = html.replace(replacement.pattern, replacement.replacement);
      } else if (typeof replacement.replacement === 'function') {
        html = html.replace(replacement.pattern, replacement.replacement);
      }
    } else if (typeof replacement.pattern === 'string') {
      if (typeof replacement.replacement === 'string') {
        // Replace all occurrences of the pattern
        const regex = new RegExp(replacement.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        html = html.replace(regex, replacement.replacement);
      }
    }
  }

  return html;
}

/**
 * Processes all HTML content in a page, fixing image URLs and other issues
 */
/**
 * Process CSS content to fix asset paths
 */
export function processCssAssetPaths(css: string): string {
  if (!css) return css;

  // Fix font paths: /css/fonts/ -> /assets/css/fonts/
  css = css.replace(/url\((\/css\/fonts\/[^)]+)\)/g, 'url(/assets$1)');

  // Fix image paths: /v2/img/ -> /assets/images/
  css = css.replace(/url\((\/v2\/img\/[^)]+)\)/g, (match, imgPath) => {
    const filename = imgPath.replace('/v2/img/', '');
    return `url(/assets/images/${filename})`;
  });

  // Fix any other /css/ references to /assets/css/
  css = css.replace(/url\((\/css\/[^)]+)\)/g, 'url(/assets$1)');

  // Fix any /images/ references to /assets/images/
  css = css.replace(/url\((\/images\/[^)]+)\)/g, 'url(/assets$1)');

  return css;
}

/**
 * Processes all HTML content in a page, fixing image URLs and other issues
 */
export function processPageHtml(page: PageData): string {
  if (!page.renderedHTML) return '';

  let html = page.renderedHTML;

  // Remove preload links for missing fonts (Next.js font preloads)
  html = html.replace(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*\.woff2["'][^>]*>/gi, '');

  // Remove preload links for missing images (Next.js image preloads)
  html = html.replace(/<link[^>]*rel=["']preload["'][^>]*as=["']image["'][^>]*>/gi, '');

  // Remove Matomo/Piwik tracking code (not needed for static site)
  html = html.replace(/var\s+_paq\s*=\s*_paq\s*\|\|\s*\[\];/g, '');
  html = html.replace(/_paq\.push\([^)]+\);/g, '');
  html = html.replace(/<script[^>]*matomo[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*piwik[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove references to missing Next.js JS bundles
  html = html.replace(
    /<script[^>]*src=["'][^"']*\/(?:assets|_next)\/js\/[^"']*\.js["'][^>]*><\/script>/gi,
    ''
  );

  // Remove references to missing legacy JS files
  const missingJsFiles = [
    'jquery-1.11.3.min.js',
    'modernizr-2.8.3.min.js',
    'clipboard.js',
    'plugins.js',
    'simplebar.js',
    'checkout.js',
    'stripe-form.js',
    'garry-version-selector.js',
  ];
  missingJsFiles.forEach(file => {
    html = html.replace(
      new RegExp(
        `<script[^>]*src=["'][^"']*${file.replace(/\./g, '\\.')}["'][^>]*></script>`,
        'gi'
      ),
      ''
    );
  });

  // Remove references to missing CSS files (hashed Next.js CSS)
  html = html.replace(
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\/(?:assets|_next)\/[^"']*\.css["'][^>]*>/gi,
    match => {
      // Only remove if it's a hashed filename (contains hex hash)
      if (match.match(/[a-f0-9]{8,}\.css/i)) {
        return '';
      }
      return match; // Keep other CSS references
    }
  );

  // Fix image URLs (Next.js image optimization URLs)
  html = processHtmlImages(html);

  // Remove invalid image optimization endpoints
  html = html.replace(/\/assets\/image\?[^"'\s]+/g, '');
  html = html.replace(/\/_next\/image\?[^"'\s]+/g, '');

  // Fix any remaining /_next/static/media/ font references (remove them - fonts don't exist)
  html = html.replace(/url\(["']?\/_next\/static\/media\/[^"')]+\.woff2["']?\)/gi, '');

  // Fix any remaining /_next/ references (Next.js artifacts)
  html = html.replace(/\/_next\//g, '/assets/');

  // Fix any /v2/img/ references in HTML (legacy paths)
  html = html.replace(/\/v2\/img\//g, '/assets/images/');

  // Fix any /css/fonts/ references in HTML
  html = html.replace(/\/css\/fonts\//g, '/assets/css/fonts/');

  // Fix any /css/ references to /assets/css/
  html = html.replace(/href=["'](\/css\/[^"']+)["']/g, 'href="/assets$1"');

  // Fix any /images/ references to /assets/images/
  html = html.replace(/src=["'](\/images\/[^"']+)["']/g, 'src="/assets$1"');

  // Fix internal links to match routing format
  // Routing expects: windscribe.com/path (no leading slash in slug)
  // So: href="https://windscribe.com/path" -> href="/windscribe.com/path"
  // And: href="/path" -> href="/windscribe.com/path" (if it's a main site path)

  // First, convert absolute windscribe.com URLs to relative with domain prefix
  html = html.replace(
    /href=["']https?:\/\/(?:www\.)?windscribe\.com(\/[^"']*)["']/g,
    (match, path) => {
      // Remove leading slash and query/hash for routing
      const cleanPath = path.replace(/^\/+/, '').split('?')[0].split('#')[0];
      // Handle root path
      if (!cleanPath || cleanPath === '') {
        return 'href="/windscribe.com"';
      }
      // Convert to routing format: /windscribe.com/path
      return `href="/windscribe.com/${cleanPath}"`;
    }
  );

  // Fix other windscribe subdomain links (keep as relative to main domain)
  html = html.replace(
    /href=["']https?:\/\/(?:[^.]+\.)?windscribe\.com(\/[^"']*)["']/g,
    (match, path) => {
      const cleanPath = path.replace(/^\/+/, '').split('?')[0].split('#')[0];
      if (!cleanPath || cleanPath === '') {
        return 'href="/windscribe.com"';
      }
      return `href="/windscribe.com/${cleanPath}"`;
    }
  );

  // Fix relative links that start with / (but not /assets, /_next, etc.)
  // Convert /download -> /windscribe.com/download
  html = html.replace(/href=["']\/([^"']*)["']/g, (match, path) => {
    // Handle root link
    if (!path || path === '') {
      return 'href="/windscribe.com"';
    }

    // Don't modify if it's an asset path or special path
    if (
      path.startsWith('assets/') ||
      path.startsWith('_next/') ||
      path.startsWith('_/') ||
      path.startsWith('.well-known/') ||
      path.startsWith('favicon') ||
      path.startsWith('windscribe.com/') || // Already in correct format
      path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|json|xml)$/i)
    ) {
      return match; // Keep as-is
    }
    // Convert to routing format
    return `href="/windscribe.com/${path}"`;
  });

  // Keep onclick handlers - interactive.js will convert them to event listeners
  // This allows the HTML to work even if JS hasn't loaded yet

  return html;
}
