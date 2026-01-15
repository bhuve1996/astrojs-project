#!/usr/bin/env node

/**
 * Add descriptive comments to CSS files
 * Explains what each section/rule does
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: commentMap removed - using inline logic instead

function addCommentsToCSS(css) {
  let commented = '';
  const lines = css.split('\n');
  let lastComment = '';
  let blockDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const prevPrevLine = i > 1 ? lines[i - 2].trim() : '';

    // Track block depth
    const openBraces = (trimmed.match(/\{/g) || []).length;
    const closeBraces = (trimmed.match(/\}/g) || []).length;
    blockDepth += openBraces - closeBraces;

    // Skip empty lines (but preserve them)
    if (!trimmed) {
      commented += line + '\n';
      continue;
    }

    // Only add comments before selectors (at block depth 0 or 1 for media queries)
    const isSelector =
      blockDepth <= 1 && (trimmed.match(/^[@.#\w-]|^[a-z]/) || trimmed.includes('{'));

    if (isSelector && blockDepth <= 1) {
      // Add comment for @font-face
      if (trimmed.startsWith('@font-face')) {
        if (!prevLine.includes('Font face') && !prevPrevLine.includes('Font face')) {
          commented += '\n/* Font face definition - StripeIcons icon font */\n';
          lastComment = 'Font face';
        }
      }
      // Add comment for @keyframes
      else if (trimmed.startsWith('@keyframes')) {
        const animName = trimmed.match(/@keyframes\s+(\w+)/)?.[1] || 'animation';
        if (!prevLine.includes(animName)) {
          commented += `\n/* Animation keyframes: ${animName} */\n`;
          lastComment = `Animation: ${animName}`;
        }
      }
      // Add comment for @media queries
      else if (trimmed.startsWith('@media')) {
        const mediaQuery = trimmed.replace('@media', '').trim();
        if (!prevLine.includes('Responsive')) {
          commented += `\n/* Responsive styles - ${mediaQuery} */\n`;
          lastComment = `Media`;
        }
      }
      // Add comment for container classes
      else if (trimmed.match(/^\.container[^a-z]/)) {
        if (lastComment !== 'Container') {
          commented += '\n/* Container and layout styles - page containers */\n';
          lastComment = 'Container';
        }
      }
      // Add comment for common component classes
      else if (trimmed.match(/^\.common-(\w+)/)) {
        const match = trimmed.match(/^\.common-(\w+)/);
        const componentName = match?.[1] || 'component';
        if (lastComment !== `Common:${componentName}`) {
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
          commented += `\n/* Common component: ${componentName} - ${componentDesc} */\n`;
          lastComment = `Common:${componentName}`;
        }
      }
      // Add comment for Stripe form
      else if (trimmed.match(/^\.ws-stripe-form/)) {
        if (lastComment !== 'Stripe') {
          commented += '\n/* Stripe payment form styles - checkout form */\n';
          lastComment = 'Stripe';
        }
      }
      // Add comment for footer
      else if (trimmed.match(/^footer\s*\{/)) {
        if (lastComment !== 'Footer') {
          commented += '\n/* Footer component styles */\n';
          lastComment = 'Footer';
        }
      }
      // Add comment for page-specific styles
      else if (trimmed.match(/^\.(planname|cell|optionList)/)) {
        if (lastComment !== 'Page-specific') {
          commented += '\n/* Page-specific styles - upgrade/checkout page */\n';
          lastComment = 'Page-specific';
        }
      }
      // Add comment for error styles
      else if (trimmed.match(/^\.(error|ws-stripe-form \.error)/)) {
        if (lastComment !== 'Error') {
          commented += '\n/* Error message styles */\n';
          lastComment = 'Error';
        }
      }
      // Add comment for success styles
      else if (trimmed.match(/^\.(success|ws-stripe-form \.success)/)) {
        if (lastComment !== 'Success') {
          commented += '\n/* Success message styles */\n';
          lastComment = 'Success';
        }
      }
    }

    commented += line + '\n';
  }

  return commented;
}

function addCommentsToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const commented = addCommentsToCSS(content);
    fs.writeFileSync(filePath, commented, 'utf8');
    console.log(`Added comments: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function addCommentsToAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Adding comments to ${files.length} CSS files...`);
  let processed = 0;

  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (addCommentsToFile(filePath)) {
      processed++;
    }
  });

  console.log(`\nAdded comments to ${processed} out of ${files.length} CSS files.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addCommentsToAllCSS();
}

export { addCommentsToCSS, addCommentsToFile };
