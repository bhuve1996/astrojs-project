# Changes Summary - Config-Driven System

## What Was Done

### ✅ 1. Created Central Configuration (`src/config/site.config.ts`)
- All URL replacements, path mappings, and routing rules in one place
- Easy to modify without code changes
- Type-safe configuration

### ✅ 2. Updated Middleware (`src/middleware.ts`)
- Now uses `isExcludedPath()` and `isNextJsPath()` from config
- All path exclusions driven from config

### ✅ 3. Updated HTML Processing (`src/utils/processHtml.ts`)
- Uses `urlReplacements` from config
- Uses `pathMappings` for image path conversion
- Config-driven URL transformations

### ✅ 4. Updated Routes (`src/pages/[...slug].astro` & `index.astro`)
- Uses `isExcludedPath()` from config
- Uses `siteConfig.baseDomain` for homepage detection
- All path filtering driven from config

### ✅ 5. Updated Layout (`src/layouts/BaseLayout.astro`)
- Uses `siteConfig.assets.*` for asset paths
- Config-driven CSS/JS loading

### ✅ 6. Documentation
- `ERRORS_EXPLANATION.md` - Explains the warnings
- `CONFIG_GUIDE.md` - How to use the config system
- `WARNINGS.md` - About router warnings

## Error Explanation

### The Warnings You're Seeing

```
[WARN] [router] A `getStaticPaths()` route pattern was matched, but no matching static path was found for requested path `/_next/image`.
```

**Why**: The catch-all route `[...slug]` matches all paths. Astro checks route patterns before middleware runs, so it sees the match but no static path (because we exclude them). This is **expected and harmless**.

**Solution**: Middleware intercepts these paths and returns 404. The warnings are informational only and don't affect functionality.

## Runtime Replacement

### Current: Build-Time Replacement ✅
- URLs replaced when pages are **generated** (build time)
- Faster page loads
- Better for static sites
- All replacements configured in `site.config.ts`

### Runtime Replacement (If Needed)
If you want runtime replacement instead:
1. Move HTML processing to client-side JavaScript
2. Replace URLs after page loads
3. Less efficient but more flexible

**Recommendation**: Keep build-time replacement (current) for better performance.

## How to Modify Config

### Example: Add New URL Replacement

Edit `src/config/site.config.ts`:

```typescript
urlReplacements: [
  // ... existing
  {
    pattern: /https?:\/\/old-domain\.com\//g,
    replacement: '/',
    useRegex: true,
  },
]
```

### Example: Exclude New Path

```typescript
excludedPaths: {
  prefixes: [
    // ... existing
    '/api/',
  ],
}
```

No code changes needed! Just update the config file.

## Partial Commits Strategy

The changes were organized into logical commits:

1. **Config System** - Created `site.config.ts` and helper functions
2. **Middleware Update** - Updated middleware to use config
3. **HTML Processing** - Updated HTML processing to use config
4. **Routes Update** - Updated routes to use config
5. **Layout Update** - Updated layout to use config
6. **Documentation** - Added explanation docs

Each commit is self-contained and can be reviewed/tested independently.

## Benefits

✅ **Centralized**: All rules in one config file  
✅ **Maintainable**: Easy to update without code changes  
✅ **Consistent**: Same rules everywhere  
✅ **Documented**: Clear explanation of warnings  
✅ **Flexible**: Easy to add new replacements/mappings  

## Next Steps

1. Review `src/config/site.config.ts` and adjust as needed
2. Test the site - everything should work the same
3. Add more replacements/mappings to config as needed
4. The warnings are expected - see `ERRORS_EXPLANATION.md`
