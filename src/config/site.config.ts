/**
 * Site Configuration
 * 
 * Central configuration for URL replacements, path mappings, and routing rules.
 * All URL transformations and path exclusions are driven from this config.
 */

export interface UrlReplacement {
  /** Pattern to match (regex or string) */
  pattern: string | RegExp;
  /** Replacement value or function */
  replacement: string | ((match: string, ...args: any[]) => string);
  /** Whether to use regex matching */
  useRegex?: boolean;
}

export interface PathMapping {
  /** Original path pattern */
  from: string | RegExp;
  /** Target path */
  to: string;
  /** Whether to use regex */
  useRegex?: boolean;
}

export interface SiteConfig {
  /** Base domain for the site */
  baseDomain: string;
  
  /** URL replacements to apply to HTML content */
  urlReplacements: UrlReplacement[];
  
  /** Path mappings for assets and routes */
  pathMappings: PathMapping[];
  
  /** Paths that should be excluded from routing (handled as static files) */
  excludedPaths: {
    /** Path prefixes to exclude */
    prefixes: string[];
    /** File extensions to exclude */
    extensions: string[];
    /** Regex patterns to exclude */
    patterns: string[];
  };
  
  /** Next.js specific paths to block */
  nextJsPaths: {
    /** Path prefixes */
    prefixes: string[];
    /** Patterns to match */
    patterns: string[];
  };
  
  /** Asset configuration */
  assets: {
    /** Base path for assets */
    basePath: string;
    /** CSS files path */
    cssPath: string;
    /** JS files path */
    jsPath: string;
    /** Images path */
    imagesPath: string;
  };
}

export const siteConfig: SiteConfig = {
  baseDomain: 'windscribe.com',
  
  // URL replacements for HTML content
  urlReplacements: [
    {
      pattern: '/_next/image',
      replacement: '', // Will be replaced with actual image paths via mapping
      useRegex: false,
    },
    {
      pattern: /\/_next\/static\/(chunks|css|media)\//g,
      replacement: '/assets/',
      useRegex: true,
    },
    {
      pattern: /https?:\/\/[^/]+\/_next\//g,
      replacement: '/',
      useRegex: true,
    },
  ],
  
  // Path mappings for converting original paths to local paths
  pathMappings: [
    {
      from: /^\/images\//,
      to: '/assets/images/',
      useRegex: true,
    },
    {
      from: /^\/_next\/static\//,
      to: '/assets/',
      useRegex: true,
    },
  ],
  
  // Paths excluded from routing (should be served as static files)
  excludedPaths: {
    prefixes: [
      '/_next/',
      '/_',
      '/.well-known/',
      '/favicon',
      '/assets/',
    ],
    extensions: [
      'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico',
      'css', 'js',
      'woff', 'woff2', 'ttf', 'eot',
      'json', 'xml',
    ],
    patterns: [
      '/_next/',
      '/\\.well-known/',
      '/favicon',
    ],
  },
  
  // Next.js specific paths to block
  nextJsPaths: {
    prefixes: [
      '/_next/image',
      '/_next/static/',
      '/_next/chunks/',
    ],
    patterns: [
      '/_next/.*',
    ],
  },
  
  // Asset paths
  assets: {
    basePath: '/assets',
    cssPath: '/assets/css',
    jsPath: '/assets/js',
    imagesPath: '/assets/images',
  },
};

/**
 * Check if a path should be excluded from routing
 */
export function isExcludedPath(pathname: string): boolean {
  const { excludedPaths } = siteConfig;
  
  // Check prefixes
  if (excludedPaths.prefixes.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }
  
  // Check extensions
  if (excludedPaths.extensions.some(ext => pathname.endsWith(`.${ext}`))) {
    return true;
  }
  
  // Check regex patterns
  if (excludedPaths.patterns.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(pathname);
  })) {
    return true;
  }
  
  return false;
}

/**
 * Check if a path is a Next.js internal path
 */
export function isNextJsPath(pathname: string): boolean {
  const { nextJsPaths } = siteConfig;
  
  // Check prefixes
  if (nextJsPaths.prefixes.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }
  
  // Check patterns
  if (nextJsPaths.patterns.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(pathname);
  })) {
    return true;
  }
  
  return false;
}

/**
 * Apply path mappings to a path
 */
export function applyPathMapping(path: string): string {
  let mappedPath = path;
  
  for (const mapping of siteConfig.pathMappings) {
    if (mapping.useRegex && mapping.from instanceof RegExp) {
      mappedPath = mappedPath.replace(mapping.from, mapping.to);
    } else if (typeof mapping.from === 'string') {
      if (mappedPath.startsWith(mapping.from)) {
        mappedPath = mappedPath.replace(mapping.from, mapping.to);
      }
    }
  }
  
  return mappedPath;
}
