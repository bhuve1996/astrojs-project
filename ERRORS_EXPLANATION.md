# Error/Warning Explanation

## Current Warnings: `getStaticPaths()` Route Pattern Matched

### What's Happening

You're seeing warnings like:
```
[WARN] [router] A `getStaticPaths()` route pattern was matched, but no matching static path was found for requested path `/_next/image`.
```

### Why This Happens

1. **Catch-All Route Pattern**: The route `[...slug].astro` matches **all** paths, including:
   - `/_next/image` (Next.js image optimization)
   - `/_next/static/css/*.css` (Next.js CSS files)
   - `/assets/js/*.js` (JavaScript files)
   - Other static assets

2. **Route Matching Order**: Astro's router checks route patterns **before** middleware runs:
   - Router sees `[...slug]` matches `/_next/image` ✅
   - Router checks `getStaticPaths()` for `/_next/image` ❌ (not found - it's excluded)
   - Router logs warning ⚠️
   - Middleware then intercepts and returns 404 ✅

3. **Intended Behavior**: These paths are **intentionally excluded** from `getStaticPaths()` because:
   - They should be served as static files from `public/` directory
   - They don't need to be generated as pages
   - Middleware handles them separately

### Are These Errors?

**No!** These are **informational warnings**, not errors:
- ✅ Site functionality is **not affected**
- ✅ Paths are correctly handled (404 or static file serving)
- ✅ Only appear in **development mode**
- ✅ Don't appear in **production builds**

### Solutions Implemented

1. **Middleware Interception**: Blocks these paths before route processing
2. **Config-Driven Exclusions**: All excluded paths are now in `site.config.ts`
3. **Early Returns**: Route handler returns 404 immediately for excluded paths

### How to Reduce Warnings

The warnings are expected with catch-all routes. Options:

1. **Ignore them** (recommended) - They're harmless
2. **Use production build** - Warnings don't appear: `npm run build`
3. **More specific routes** - Would require restructuring (not recommended)

---

## Runtime URL Replacement

### Current Approach

URLs are replaced at **build time** when pages are generated:
- HTML content is processed before rendering
- Next.js URLs (`/_next/image?url=...`) → Local paths (`/assets/images/...`)
- All replacements are config-driven via `site.config.ts`

### Why Runtime Replacement?

The user asked about runtime replacement. Current implementation:
- ✅ **Build-time replacement** (faster, better for static sites)
- Can be changed to **runtime replacement** if needed

### Config-Driven System

Everything is now driven from `src/config/site.config.ts`:
- URL replacement patterns
- Path mappings
- Excluded paths
- Asset paths
- All routing rules

This makes it easy to:
- Change replacements without code changes
- Add new patterns via config
- Test different configurations
- Maintain consistency
