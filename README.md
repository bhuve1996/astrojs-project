# Windscribe VPN - Astro.js Static Site

A static website built with Astro.js, recreated from the Windscribe VPN website.

## 📊 Project Status

### ✅ Completed

- ✅ **Astro.js Project Setup** - Full static site generation setup
- ✅ **Pages Scraped & Integrated** - 10 pages from windscribe.com
- ✅ **Assets Organized** - 213 images, 15 CSS files, all properly structured
- ✅ **Dynamic Routing** - Catch-all route `[...slug].astro` for all pages
- ✅ **Image Processing** - Next.js image URLs converted to local paths
- ✅ **SEO & Metadata** - Full Open Graph, Twitter cards, canonical URLs
- ✅ **Config-Driven System** - Centralized configuration in `src/config/site.config.ts`
- ✅ **Code Quality** - Prettier, ESLint, Husky pre-commit hooks configured
- ✅ **CSS Comments** - All CSS files have descriptive comments

### 📋 What's Included

1. **Static Site Generation** - All pages pre-rendered at build time
2. **Dynamic Routing** - Automatic route generation from scraped data
3. **Asset Management** - Images, CSS, and JS files properly linked
4. **SEO Optimization** - Meta tags, Open Graph, Twitter cards
5. **TypeScript** - Full type safety throughout the project
6. **Code Formatting** - Prettier + ESLint with pre-commit hooks

### ⚠️ What's Missing / Pending

- ⚠️ **Browser Testing** - Interactive features need manual browser testing
- ⚠️ **Form Handling** - Payment forms need backend integration
- ⚠️ **Authentication** - Login/signup functionality (if needed)
- ⚠️ **Advanced Interactions** - Some complex JavaScript features may need reimplementation

### ✅ Testing Status

- ✅ **Build**: PASSING - All pages build successfully
- ✅ **Static Generation**: 12 pages generated correctly
- ⚠️ **Browser Testing**: Needs manual testing (see Testing section below)
- ⚠️ **Interactive Features**: JavaScript loaded, needs browser verification

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run format       # Format code with Prettier
npm run format:check # Check if files are formatted
npm run lint         # Lint code with ESLint
npm run lint:fix     # Fix linting errors
npm run fix:css      # Fix CSS syntax errors (if needed)
```

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Husky (Git hooks)** - Automatically set up via `prepare` script
   - Pre-commit hooks run ESLint and Prettier automatically
   - Manual setup: `npx husky install`

3. **Troubleshooting:**
   - npm permission errors: `sudo chown -R $(whoami) ~/.npm`
   - Husky not working: `npx husky install && chmod +x .husky/pre-commit`

## 📁 Project Structure

```
astrojs-project/
├── src/
│   ├── config/
│   │   └── site.config.ts      # Central configuration
│   ├── layouts/
│   │   └── BaseLayout.astro     # Base layout with SEO
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── [...slug].astro      # Dynamic catch-all route
│   │   └── 404.astro            # 404 page
│   ├── components/              # Astro components (to be created)
│   ├── utils/
│   │   ├── loadWebsiteData.ts   # Load scraped data
│   │   └── processHtml.ts       # Process HTML content
│   └── middleware.ts            # Astro middleware
├── assets/
│   ├── images/                  # All images (SVG, PNG, WebP)
│   ├── css/                     # All stylesheets
│   └── js/                      # JavaScript files
├── pages/                       # Original scraped HTML files
├── website-data.json            # Complete scraped data
├── scripts/                     # Utility scripts
│   └── fix-css-syntax.js        # Fix CSS syntax errors
└── public/                      # Public static assets (symlinked to assets/)
```

## 🔧 Configuration

All site configuration is centralized in `src/config/site.config.ts`:

- URL replacements
- Path mappings
- Asset paths
- Domain settings
- Exclusion rules

All configuration is documented in the `site.config.ts` file with inline comments.

## 📝 Next Steps

### ✅ Recently Completed

1. ✅ **Interactive JavaScript** - Created `public/js/interactive.js` with:
   - Modal/popup functionality
   - Dropdown menus
   - Form validation
   - Email validation (supports Windscribe `bro:xxxx` format)

2. ✅ **Astro Components** - Created reusable components:
   - `Modal.astro` - Modal/popup component
   - `Dropdown.astro` - Dropdown menu component

3. ✅ **Build Fix** - Fixed script loading issue with `is:inline` directive

### Immediate Tasks

1. **Browser Testing** (Priority)
   - ✅ Build is working
   - ⏳ Test modals on upgrade page (`/windscribe.com/upgrade`)
   - ⏳ Test dropdowns in navigation
   - ⏳ Test form validation
   - ⏳ Check browser console for errors
   - ⏳ Verify all images load correctly

2. **Form Handling**
   - Integrate payment form submission
   - Add form submission handlers
   - Implement error handling

3. **Enhance User Experience**
   - Add smooth transitions
   - Implement loading states
   - Improve accessibility
   - Add keyboard navigation

4. **Testing & Optimization**
   - Complete browser testing (see Testing section)
   - Optimize images and assets
   - Performance testing
   - Cross-browser testing

## 🧪 Testing

### Build Testing

**Status:** ✅ PASSING

- Build time: ~1.6s
- Pages generated: 12 pages
- Output: `/dist/` directory

**Quick Test:**

```bash
npm run build    # ✅ Should pass
npm run preview  # Open in browser to test
```

### Browser Testing Checklist

**Working Features:**

- ✅ Static site generation (all 10 pages)
- ✅ Dynamic routing (`[...slug].astro`)
- ✅ CSS files loading
- ✅ HTML processing and image URL conversion
- ✅ SEO metadata (titles, descriptions, Open Graph)
- ✅ Code quality tools (Prettier, ESLint, Husky)

**Needs Browser Testing:**

- ⚠️ Interactive JavaScript (modals, dropdowns, forms)
- ⚠️ Image loading verification
- ⚠️ Page navigation and links
- ⚠️ Responsive design (mobile/tablet/desktop)
- ⚠️ Form validation functionality

**How to Test:**

1. Run `npm run build` (should pass)
2. Run `npm run preview` or `npm run dev`
3. Open in browser and test:
   - Modals (`.cd-popup` elements)
   - Dropdowns (`.dropdown` elements)
   - Forms with `data-validate` attribute
   - All images load correctly
   - Navigation between pages
   - Check browser console for errors

### Future Enhancements

- [ ] Add TypeScript types for all components
- [ ] Implement form submission handling
- [ ] Add analytics integration
- [ ] Create component library
- [ ] Add unit tests
- [ ] Performance optimization
- [ ] Accessibility improvements

## 🛠️ Technologies Used

- **Astro.js** - Static site generator
- **TypeScript** - Type safety
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Husky** - Git hooks

## 📚 Documentation

- `README.md` - Complete project documentation (this file)

## 🤝 Contributing

1. Make changes
2. Run `npm run format` and `npm run lint:fix`
3. Commit (pre-commit hooks will run automatically)
4. Push changes

## 📄 License

This project is for educational purposes, recreating the Windscribe VPN website.

---

## ⚠️ Common Warnings

### Router Warnings (Development Only)

You may see warnings like:

```
[WARN] [router] A `getStaticPaths()` route pattern was matched, but no matching static path was found for requested path `/_next/image`.
```

**These are harmless and expected:**

- The catch-all route `[...slug]` matches all paths
- Static assets are intentionally excluded from route generation
- Middleware handles these paths correctly
- Warnings only appear in development mode
- Production builds don't show these warnings

**Solution:** Ignore these warnings - they don't affect functionality.

---

**Last Updated:** 2026-01-15  
**Astro Version:** 4.0.0
