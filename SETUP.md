# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Scrape a Website

```bash
npm run scrape https://example.com
```

This will:
- Scrape all pages
- Download images, CSS, JS files
- Extract metadata and SEO tags
- Download favicon
- Save everything to `scraped-data/`

## 3. Build the Site

```bash
npm run build
```

## 4. Preview

```bash
npm run preview
```

Visit `http://localhost:4321` to see the cloned website.

## 5. Development

```bash
npm run dev
```

## Cleanup Scripts

### Clear Scraped Data
```bash
npm run clear
```

### Remove Dependencies
```bash
npm run remove-deps
```

### Clean All
```bash
npm run clean-all
```

## Next Steps

See README.md for:
- Implementation checklist
- Features that need to be added
- JavaScript modules needed
- Troubleshooting guide
- All available scripts