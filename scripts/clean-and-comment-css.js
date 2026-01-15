#!/usr/bin/env node

/**
 * Clean CSS and add proper comments
 * Removes duplicate comments and adds descriptive comments for each section
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanAndCommentCSS(css) {
  // Remove all existing comments to start fresh
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove extra blank lines
  css = css.replace(/\n{3,}/g, '\n\n');

  let commented = '';
  const lines = css.split('\n');
  let lastComment = '';
  let blockDepth = 0;
  let inMediaQuery = false;
  let seenSelectors = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      commented += line + '\n';
      continue;
    }

    // Track block depth
    const openBraces = (trimmed.match(/\{/g) || []).length;
    const closeBraces = (trimmed.match(/\}/g) || []).length;
    const prevDepth = blockDepth;
    blockDepth += openBraces - closeBraces;

    // Check if we're entering/exiting media query
    if (trimmed.startsWith('@media')) {
      inMediaQuery = true;
    }
    if (inMediaQuery && blockDepth === 0 && prevDepth > 0) {
      inMediaQuery = false;
    }

    // Only add comments before selectors at root level
    const isRootSelector =
      blockDepth === 0 && trimmed.match(/^[@.#\w-]/) && !trimmed.startsWith('}');
    const selectorKey = trimmed.split('{')[0].trim();

    if (isRootSelector && !seenSelectors.has(selectorKey)) {
      seenSelectors.add(selectorKey);
      let comment = '';

      // @font-face
      if (trimmed.startsWith('@font-face')) {
        comment = '/* Font face definition - StripeIcons icon font */';
      }
      // @keyframes
      else if (trimmed.startsWith('@keyframes')) {
        const animName = trimmed.match(/@keyframes\s+(\w+)/)?.[1] || 'animation';
        comment = `/* Animation keyframes: ${animName} */`;
      }
      // @media
      else if (trimmed.startsWith('@media')) {
        const mediaQuery = trimmed.replace('@media', '').trim();
        comment = `/* Responsive styles - ${mediaQuery} */`;
      }
      // Container
      else if (trimmed.match(/^\.container[^a-z]/)) {
        if (lastComment !== 'Container') {
          comment = '/* Container and layout styles - page containers */';
        }
      }
      // Common components
      else if (trimmed.match(/^\.common-(\w+)/)) {
        const match = trimmed.match(/^\.common-(\w+)/);
        const componentName = match?.[1] || 'component';
        const componentDesc =
          {
            SuperTitle: 'Large title/heading text',
            IntroText: 'Introduction/subtitle text',
            BodyText: 'Body paragraph text',
            Link: 'Link/anchor component',
            Button: 'Button component',
            ButtonGroup: 'Button group container',
            ButtonIcon: 'Button icon wrapper',
          }[componentName] || 'component';

        if (lastComment !== `Common:${componentName}`) {
          comment = `/* Common component: ${componentName} - ${componentDesc} */`;
        }
      }
      // Stripe form
      else if (trimmed.match(/^\.ws-stripe-form/)) {
        if (lastComment !== 'Stripe') {
          comment = '/* Stripe payment form styles - checkout form */';
        }
      }
      // Footer
      else if (trimmed.match(/^footer\s*\{/)) {
        if (lastComment !== 'Footer') {
          comment = '/* Footer component styles */';
        }
      }
      // Page-specific
      else if (trimmed.match(/^\.(planname|cell|optionList)/)) {
        if (lastComment !== 'Page-specific') {
          comment = '/* Page-specific styles - upgrade/checkout page */';
        }
      }
      // Error
      else if (trimmed.match(/^\.(error|ws-stripe-form \.error)/)) {
        if (lastComment !== 'Error') {
          comment = '/* Error message styles */';
        }
      }
      // Success
      else if (trimmed.match(/^\.(success|ws-stripe-form \.success)/)) {
        if (lastComment !== 'Success') {
          comment = '/* Success message styles */';
        }
      }

      if (comment && comment !== lastComment) {
        // Add blank line before comment if needed
        if (commented && !commented.endsWith('\n\n') && !commented.endsWith('\n/*')) {
          commented += '\n';
        }
        commented += comment + '\n';
        lastComment = comment;
      }
    }

    commented += line + '\n';
  }

  return commented.trim() + '\n';
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanAndCommentCSS(content);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`Processed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Processing ${files.length} CSS files...`);
  let processed = 0;

  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (processFile(filePath)) {
      processed++;
    }
  });

  console.log(`\nProcessed ${processed} out of ${files.length} CSS files.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processAllCSS();
}

export { cleanAndCommentCSS, processFile };
