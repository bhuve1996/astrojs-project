#!/usr/bin/env node

/**
 * Fix CSS font paths - remove references to missing Next.js fonts
 * Replaces /_next/static/media/*.woff2 references (fonts don't exist)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCssFontPaths(css) {
  // Remove font-face declarations that reference missing Next.js fonts
  css = css.replace(
    /@font-face\s*\{[^}]*url\(["']?\/_next\/static\/media\/[^"')]+\.woff2["']?\)[^}]*\}/gi,
    ''
  );

  // Remove individual font src references to missing fonts
  css = css.replace(/src:\s*url\(["']?\/_next\/static\/media\/[^"')]+\.woff2["']?\)[^;]*;/gi, '');

  // Clean up empty font-face blocks
  css = css.replace(/@font-face\s*\{\s*\}/g, '');

  return css;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCssFontPaths(content);
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Fixing font paths in ${files.length} CSS files...`);
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

export { fixCssFontPaths, processFile };
