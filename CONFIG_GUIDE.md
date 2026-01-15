# Configuration Guide

## Overview

All URL replacements, path mappings, and routing rules are now **config-driven** from `src/config/site.config.ts`. This makes it easy to modify behavior without changing code.

## Configuration File

**Location**: `src/config/site.config.ts`

### Main Sections

1. **`baseDomain`**: Base domain for the site (e.g., `'windscribe.com'`)

2. **`urlReplacements`**: Patterns to replace in HTML content
   - Replace Next.js URLs with local paths
   - Can use regex or string matching
   - Applied during HTML processing

3. **`pathMappings`**: Mappings from original paths to local paths
   - `/images/` → `/assets/images/`
   - `/_next/static/` → `/assets/`

4. **`excludedPaths`**: Paths excluded from routing
   - **prefixes**: Path prefixes to exclude (e.g., `/_next/`, `/assets/`)
   - **extensions**: File extensions to exclude (e.g., `.css`, `.js`, `.png`)
   - **patterns**: Regex patterns to exclude

5. **`nextJsPaths`**: Next.js-specific paths to block
   - Used by middleware to return 404 immediately

6. **`assets`**: Asset path configuration
   - `basePath`: Base path for all assets
   - `cssPath`: Path for CSS files
   - `jsPath`: Path for JavaScript files
   - `imagesPath`: Path for images

## How It Works

### 1. Middleware (`src/middleware.ts`)
- Uses `isExcludedPath()` and `isNextJsPath()` from config
- Blocks paths before they reach routes
- Prevents route matching warnings

### 2. HTML Processing (`src/utils/processHtml.ts`)
- Applies `urlReplacements` from config
- Uses `pathMappings` for image path conversion
- Replaces Next.js URLs with local asset paths

### 3. Routes (`src/pages/[...slug].astro`)
- Uses `isExcludedPath()` to filter static paths
- Excludes paths from `getStaticPaths()`
- Early returns for excluded paths

### 4. Layout (`src/layouts/BaseLayout.astro`)
- Uses `siteConfig.assets.*` for asset paths
- Loads CSS/JS from configured paths

## Adding New Replacements

### Example: Add a new URL replacement

```typescript
// In site.config.ts
urlReplacements: [
  // ... existing replacements
  {
    pattern: /https?:\/\/example\.com\//g,
    replacement: '/',
    useRegex: true,
  },
]
```

### Example: Add a new excluded path

```typescript
// In site.config.ts
excludedPaths: {
  prefixes: [
    // ... existing prefixes
    '/api/',
  ],
  // ...
}
```

### Example: Add a new path mapping

```typescript
// In site.config.ts
pathMappings: [
  // ... existing mappings
  {
    from: /^\/old-path\//,
    to: '/new-path/',
    useRegex: true,
  },
]
```

## Runtime vs Build-Time Replacement

### Current: Build-Time (Recommended)
- URLs replaced when pages are generated
- Faster page loads
- Better for static sites
- Configured in `site.config.ts`

### Runtime Replacement (If Needed)
To switch to runtime replacement:
1. Move HTML processing to client-side
2. Use JavaScript to replace URLs after page load
3. Less efficient but more flexible

**Current implementation uses build-time replacement** (recommended for performance).

## Environment Variables

You can extend the config to use environment variables:

```typescript
// In site.config.ts
export const siteConfig: SiteConfig = {
  baseDomain: import.meta.env.PUBLIC_BASE_DOMAIN || 'windscribe.com',
  // ... rest of config
};
```

Then set in `.env`:
```
PUBLIC_BASE_DOMAIN=windscribe.com
```

## Benefits

✅ **Centralized Configuration**: All rules in one place  
✅ **Easy Updates**: Change config without touching code  
✅ **Consistent Behavior**: Same rules everywhere  
✅ **Maintainable**: Clear separation of concerns  
✅ **Testable**: Easy to test different configurations  
