#!/usr/bin/env node

/**
 * Format minified CSS files
 * Reads minified CSS and formats it with proper indentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatCSS(css) {
  let formatted = '';
  let indent = 0;
  let buffer = '';
  let inString = false;
  let stringChar = '';

  // Add spaces around operators and fix formatting
  css = css
    .replace(/\s*{\s*/g, ' { ')
    .replace(/\s*}\s*/g, ' } ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/:\s*root/g, ':root') // Fix :root pseudo-class
    .trim();

  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    const prevChar = i > 0 ? css[i - 1] : '';
    const nextChar = i < css.length - 1 ? css[i + 1] : '';

    // Handle strings (for URLs, etc.)
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      buffer += char;
      continue;
    }

    if (inString) {
      buffer += char;
      continue;
    }

    if (char === '{') {
      formatted += buffer.trim() + ' {\n';
      buffer = '';
      indent++;
    } else if (char === '}') {
      if (buffer.trim()) {
        // Add semicolon if missing
        const trimmed = buffer.trim();
        if (!trimmed.endsWith(';') && trimmed.length > 0) {
          formatted += '  '.repeat(indent) + trimmed + ';\n';
        } else {
          formatted += '  '.repeat(indent) + trimmed + '\n';
        }
        buffer = '';
      }
      indent--;
      formatted += '  '.repeat(indent) + '}\n';
    } else if (char === ';') {
      formatted += '  '.repeat(indent) + buffer.trim() + ';\n';
      buffer = '';
    } else if (char === '\n' || char === '\r') {
      // Skip newlines
      continue;
    } else {
      buffer += char;
    }
  }

  // Add any remaining buffer
  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (!trimmed.endsWith(';') && !trimmed.endsWith('}') && trimmed.length > 0) {
      formatted += trimmed + ';';
    } else {
      formatted += trimmed;
    }
  }

  return formatted;
}

function formatCSSFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const formatted = formatCSS(content);
    fs.writeFileSync(filePath, formatted, 'utf8');
    console.log(`Formatted: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error formatting ${filePath}:`, error.message);
    return false;
  }
}

function formatAllCSS() {
  const cssDir = path.join(__dirname, '../assets/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

  console.log(`Found ${files.length} CSS files to format...`);
  let formatted = 0;

  files.forEach(file => {
    const filePath = path.join(cssDir, file);
    if (formatCSSFile(filePath)) {
      formatted++;
    }
  });

  console.log(`\nFormatted ${formatted} out of ${files.length} CSS files.`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  formatAllCSS();
}

export { formatCSS, formatCSSFile };
