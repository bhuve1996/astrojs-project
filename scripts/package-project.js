import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "..", "website-cloner-ready");
const ZIP_FILE = path.join(PROJECT_ROOT, "..", "website-cloner-ready.zip");

// Files and directories to include
const INCLUDE_PATTERNS = [
  "src/**",
  "scripts/**",
  "public/**",
  "package.json",
  "package-lock.json",
  "astro.config.mjs",
  "tsconfig.json",
  ".gitignore",
  "README.md",
  "DOCUMENTATION.md",
  "MOVE_PROJECT.md",
  "CHANGES_SUMMARY.md"
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  "node_modules",
  "dist",
  ".astro",
  "scraped-data",
  ".git",
  ".vscode",
  "*.log",
  ".DS_Store"
];

async function packageProject() {
  console.log("📦 Packaging Website Cloner Project\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Create output directory
    await fs.ensureDir(OUTPUT_DIR);
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);

    // Copy essential files
    console.log("📋 Copying project files...\n");

    // Copy source files
    if (await fs.pathExists(path.join(PROJECT_ROOT, "src"))) {
      await fs.copy(
        path.join(PROJECT_ROOT, "src"),
        path.join(OUTPUT_DIR, "src")
      );
      console.log("  ✔ Copied: src/");
    }

    // Don't copy scripts - they're only for scraping
    // The packaged version doesn't need scraping scripts

    // Copy public directory (if exists and has content)
    const publicDir = path.join(PROJECT_ROOT, "public");
    if (await fs.pathExists(publicDir)) {
      const publicFiles = await fs.readdir(publicDir);
      if (publicFiles.length > 0) {
        await fs.copy(publicDir, path.join(OUTPUT_DIR, "public"));
        console.log("  ✔ Copied: public/");
      }
    }

    // Copy configuration files (except package.json - we'll create a clean one)
    const configFiles = [
      "astro.config.mjs",
      "tsconfig.json",
      ".gitignore"
    ];

    for (const file of configFiles) {
      const srcPath = path.join(PROJECT_ROOT, file);
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, path.join(OUTPUT_DIR, file));
        console.log(`  ✔ Copied: ${file}`);
      }
    }

    // Create a clean package.json without scraping dependencies
    const cleanPackageJson = {
      "name": "website-cloner",
      "type": "module",
      "version": "0.0.1",
      "scripts": {
        "dev": "astro dev",
        "build": "astro build",
        "preview": "astro preview",
        "astro": "astro"
      },
      "dependencies": {
        "astro": "^5.16.9"
      }
    };

    await fs.writeJSON(
      path.join(OUTPUT_DIR, "package.json"),
      cleanPackageJson,
      { spaces: 2 }
    );
    console.log("  ✔ Created: package.json (clean, no scraping deps)");

    // Copy documentation files
    const docFiles = [
      "README.md",
      "DOCUMENTATION.md",
      "MOVE_PROJECT.md",
      "CHANGES_SUMMARY.md"
    ];

    for (const file of docFiles) {
      const srcPath = path.join(PROJECT_ROOT, file);
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, path.join(OUTPUT_DIR, file));
        console.log(`  ✔ Copied: ${file}`);
      }
    }

    // Copy scraped-data if it exists and has content
    const scrapedDataDir = path.join(PROJECT_ROOT, "scraped-data");
    if (await fs.pathExists(scrapedDataDir)) {
      const scrapedFiles = await fs.readdir(scrapedDataDir);
      if (scrapedFiles.length > 0 && scrapedFiles.some(f => f !== ".gitkeep")) {
        await fs.copy(scrapedDataDir, path.join(OUTPUT_DIR, "scraped-data"));
        console.log("  ✔ Copied: scraped-data/ (with all scraped content)");
      } else {
        await fs.ensureDir(path.join(OUTPUT_DIR, "scraped-data"));
        console.log("  ⚠️  scraped-data/ is empty - you need to scrape first!");
      }
    } else {
      await fs.ensureDir(path.join(OUTPUT_DIR, "scraped-data"));
      console.log("  ⚠️  scraped-data/ not found - you need to scrape first!");
    }

    // Ensure public/assets exists
    await fs.ensureDir(path.join(OUTPUT_DIR, "public", "assets"));
    console.log("  ✔ Created: public/assets/\n");

    // Create a SETUP.md file with instructions
    const setupContent = `# Setup Instructions

## 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

## 2. Build the Site

**Note:** This package already includes scraped data. If you need to scrape a different website, use the original project with scraping dependencies.

\`\`\`bash
npm run build
\`\`\`

## 3. Preview

\`\`\`bash
npm run preview
\`\`\`

Visit \`http://localhost:4321\` to see the cloned website.

## 4. Development

\`\`\`bash
npm run dev
\`\`\`

## Next Steps

See README.md for:
- Implementation checklist
- Features that need to be added
- JavaScript modules needed
- Troubleshooting guide
`;

    await fs.writeFile(
      path.join(OUTPUT_DIR, "SETUP.md"),
      setupContent
    );
    console.log("  ✔ Created: SETUP.md\n");

    // Create ZIP file
    console.log("📦 Creating ZIP archive...\n");
    await createZip(OUTPUT_DIR, ZIP_FILE);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("✅ Project packaged successfully!\n");
    console.log(`📁 Folder: ${OUTPUT_DIR}`);
    console.log(`📦 ZIP file: ${ZIP_FILE}\n`);
    console.log("📋 Next Steps:");
    console.log("  1. Extract the ZIP or use the folder");
    console.log("  2. Run: npm install");
    console.log("  3. Run: npm run build");
    console.log("  4. Run: npm run preview\n");
    console.log("ℹ️  Note: This package includes scraped data and has NO scraping dependencies.");
    console.log("   To scrape a new website, use the original project.\n");

  } catch (error) {
    console.error("❌ Error packaging project:", error);
    process.exit(1);
  }
}

function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 } // Maximum compression
    });

    output.on("close", () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`  ✔ ZIP created: ${path.basename(outputPath)} (${sizeMB} MB)`);
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all files from source directory
    archive.directory(sourceDir, false);

    archive.finalize();
  });
}

// Check if archiver is installed
try {
  await packageProject();
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND" && error.message.includes("archiver")) {
    console.log("📦 Installing archiver package...\n");
    try {
      execSync("npm install archiver --save-dev", {
        stdio: "inherit",
        cwd: PROJECT_ROOT
      });
      console.log("\n✅ Archiver installed. Running again...\n");
      await packageProject();
    } catch (installError) {
      console.error("❌ Failed to install archiver:", installError);
      process.exit(1);
    }
  } else {
    throw error;
  }
}
