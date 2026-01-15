#!/usr/bin/env node

/**
 * Fix CSS asset paths to use correct Astro /assets/ paths
 * Replaces /css/fonts/, /v2/img/, and other incorrect paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCssAssetPaths(css) {
  // Fix font paths: /css/fonts/ -> /assets/css/fonts/
  css = css.replace(/url\((\/css\/fonts\/[^)]+)\)/g, (match, fontPath) => {
    return `url(/assets${fontPath})`;
  });

  // Fix image paths: /v2/img/ -> /assets/images/
  css = css.replace(/url\((\/v2\/img\/[^)]+)\)/g, (match, imgPath) => {
    const filename = imgPath.replace('/v2/img/', '');
    return `url(/assets/images/${filename})`;
  });

  // Fix any other /css/ references to /assets/css/
  css = css.replace(/url\((\/css\/[^)]+)\)/g, (match, cssPath) => {
    return `url(/assets${cssPath})`;
  });

  // Fix any /images/ references to /assets/images/
  css = css.replace(/url\((\/images\/[^)]+)\)/g, (match, imgPath) => {
    return `url(/assets${imgPath})`;
  });

  return css;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCssAssetPaths(content);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Fixing asset paths in ${files.length} CSS files...`);
  let processed = 0;

  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (processFile(filePath)) {
      processed++;
    }
  });

  console.log(`\nFixed ${processed} out of ${files.length} CSS files.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processAllCSS();
}

export { fixCssAssetPaths, processFile };
