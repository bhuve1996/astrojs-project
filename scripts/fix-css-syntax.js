#!/usr/bin/env node

/**
 * Fix CSS syntax errors - remove spaces in pseudo-selectors
 * Fixes: : hover -> :hover, : active -> :active, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCSSSyntax(css) {
  // Fix pseudo-selectors with spaces: : hover -> :hover
  css = css.replace(
    /:\s+(hover|active|after|before|focus|visited|link|first-child|last-child|nth-child|first-of-type|last-of-type|nth-of-type|only-child|only-of-type|empty|not|target|enabled|disabled|checked|default|valid|invalid|required|optional|placeholder|selection|backdrop|root|scope)/g,
    ':$1'
  );

  // Fix :: pseudo-elements with spaces: :: after -> ::after
  css = css.replace(
    /::\s+(after|before|first-line|first-letter|selection|backdrop|placeholder)/g,
    '::$1'
  );

  // Fix attribute selectors with spaces: [ attr ] -> [attr]
  css = css.replace(/\[\s+([^\]]+)\s+\]/g, '[$1]');

  // Fix @ rules with spaces: @ media -> @media
  css = css.replace(
    /@\s+(media|keyframes|import|charset|namespace|page|font-face|supports|document|viewport)/g,
    '@$1'
  );

  // Fix function calls with spaces: calc( 50% ) -> calc(50%)
  css = css.replace(
    /(calc|url|var|attr|counter|counters|linear-gradient|radial-gradient)\(\s+/g,
    '$1('
  );
  css = css.replace(/\s+\)/g, ')');

  return css;
}

function fixCSSFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCSSSyntax(content);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function fixAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Found ${files.length} CSS files to fix...`);
  let fixed = 0;

  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (fixCSSFile(filePath)) {
      fixed++;
    }
  });

  console.log(`\nFixed ${fixed} out of ${files.length} CSS files.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllCSS();
}

export { fixCSSSyntax, fixCSSFile };
