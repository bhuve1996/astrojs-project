# Environment Configuration

## Overview

All URLs and domain references are now **fully config-driven**. No hardcoded `windscribe.com` dependencies remain.

## Environment Variables

### `SITE_URL` (Optional)

Base URL for the site (used in links, canonical URLs, etc.)

- **Production**: Set to your deployed URL (e.g., `https://yourdomain.com`)
- **Development**: Defaults to `http://localhost:4321` if not set
- **Empty**: Uses relative URLs if not set in production

### `PUBLIC_BASE_DOMAIN` (Optional)

Base domain for routing (used in URL paths)

- **Default**: `windscribe.com` (from scraped data)
- **Custom**: Set to your domain (e.g., `yourdomain.com`)
- Used for routing paths like `/{baseDomain}/path`

## Configuration

All configuration is in `src/config/site.config.ts`:

```typescript
export const siteConfig: SiteConfig = {
  baseDomain: getBaseDomain(), // From env or default
  baseUrl: getBaseUrl(), // From env or localhost
  // ... other config
};
```

## Usage

### Development (Default)

```bash
# Uses defaults:
# - baseUrl: http://localhost:4321
# - baseDomain: windscribe.com
npm run dev
```

### Production (Custom Domain)

```bash
# Set environment variables:
export SITE_URL=https://yourdomain.com
export PUBLIC_BASE_DOMAIN=yourdomain.com

npm run build
```

### Production (Relative URLs)

```bash
# Don't set SITE_URL - uses relative URLs
export PUBLIC_BASE_DOMAIN=yourdomain.com

npm run build
```

## How It Works

1. **Link Conversion**: All internal links are converted to routing format `/{baseDomain}/path`
2. **Routing**: Pages are matched using `baseDomain` from config
3. **Canonical URLs**: Use `baseUrl` if set, otherwise relative
4. **No Hardcoded URLs**: All references use config values

## Files Modified

- `src/config/site.config.ts` - Added `baseUrl` and helper functions
- `src/utils/processHtml.ts` - Uses config for all link conversions
- `src/pages/[...slug].astro` - Uses config for routing
- `src/utils/loadWebsiteData.ts` - Uses config for canonical URLs

## Result

✅ **No hardcoded `windscribe.com` references**
✅ **Fully configurable via environment variables**
✅ **Works with localhost (dev) or deployed URL (prod)**
✅ **Relative URLs if no SITE_URL set**
