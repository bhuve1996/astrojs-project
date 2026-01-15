import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Base path is root - all assets served from /public
  base: '/',
  build: {
    assets: 'assets',
    // Ensure static assets are properly handled
    inlineStylesheets: 'auto',
  },
  vite: {
    publicDir: 'public',
    // Ensure proper asset handling
    assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
  },
});
