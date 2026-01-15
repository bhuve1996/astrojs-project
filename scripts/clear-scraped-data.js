import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const SCRAPED_DATA_DIR = path.join(PROJECT_ROOT, "scraped-data");
const PUBLIC_ASSETS_DIR = path.join(PROJECT_ROOT, "public", "assets");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function clearScrapedData() {
  console.log("🧹 Clear Scraped Data\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check what will be deleted
  const itemsToDelete = [];
  
  if (await fs.pathExists(SCRAPED_DATA_DIR)) {
    const scrapedFiles = await fs.readdir(SCRAPED_DATA_DIR);
    if (scrapedFiles.length > 0) {
      itemsToDelete.push({
        path: SCRAPED_DATA_DIR,
        name: "scraped-data/",
        files: scrapedFiles.length
      });
    }
  }

  if (await fs.pathExists(PUBLIC_ASSETS_DIR)) {
    const assetFiles = await fs.readdir(PUBLIC_ASSETS_DIR, { withFileTypes: true });
    const fileCount = assetFiles.filter(f => f.isFile()).length;
    const dirCount = assetFiles.filter(f => f.isDirectory()).length;
    if (fileCount > 0 || dirCount > 0) {
      itemsToDelete.push({
        path: PUBLIC_ASSETS_DIR,
        name: "public/assets/",
        files: fileCount,
        dirs: dirCount
      });
    }
  }

  if (await fs.pathExists(DIST_DIR)) {
    const distFiles = await fs.readdir(DIST_DIR);
    if (distFiles.length > 0) {
      itemsToDelete.push({
        path: DIST_DIR,
        name: "dist/",
        files: distFiles.length
      });
    }
  }

  if (itemsToDelete.length === 0) {
    console.log("✅ No scraped data found. Nothing to clear.\n");
    return;
  }

  // Show what will be deleted
  console.log("⚠️  The following will be deleted:\n");
  itemsToDelete.forEach(item => {
    console.log(`   📁 ${item.name}`);
    if (item.files) {
      console.log(`      Files: ${item.files}`);
    }
    if (item.dirs) {
      console.log(`      Directories: ${item.dirs}`);
    }
    console.log("");
  });

  // Ask for confirmation
  const answer = await askQuestion("❓ Are you sure you want to delete all scraped data? (yes/no): ");
  
  if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
    console.log("\n❌ Cancelled. No files were deleted.\n");
    return;
  }

  console.log("\n🗑️  Deleting files...\n");

  // Delete scraped-data directory (but keep the directory structure)
  if (await fs.pathExists(SCRAPED_DATA_DIR)) {
    try {
      const files = await fs.readdir(SCRAPED_DATA_DIR);
      for (const file of files) {
        const filePath = path.join(SCRAPED_DATA_DIR, file);
        await fs.remove(filePath);
      }
      console.log("  ✔ Cleared: scraped-data/");
    } catch (error) {
      console.log(`  ❌ Error clearing scraped-data/: ${error.message}`);
    }
  }

  // Delete public/assets directory (but keep the directory structure)
  if (await fs.pathExists(PUBLIC_ASSETS_DIR)) {
    try {
      const files = await fs.readdir(PUBLIC_ASSETS_DIR);
      for (const file of files) {
        const filePath = path.join(PUBLIC_ASSETS_DIR, file);
        await fs.remove(filePath);
      }
      console.log("  ✔ Cleared: public/assets/");
    } catch (error) {
      console.log(`  ❌ Error clearing public/assets/: ${error.message}`);
    }
  }

  // Delete dist directory
  if (await fs.pathExists(DIST_DIR)) {
    try {
      await fs.remove(DIST_DIR);
      console.log("  ✔ Cleared: dist/");
    } catch (error) {
      console.log(`  ❌ Error clearing dist/: ${error.message}`);
    }
  }

  // Create .gitkeep files to maintain directory structure
  await fs.ensureDir(SCRAPED_DATA_DIR);
  await fs.ensureDir(PUBLIC_ASSETS_DIR);
  await fs.writeFile(path.join(SCRAPED_DATA_DIR, ".gitkeep"), "");
  await fs.writeFile(path.join(PUBLIC_ASSETS_DIR, ".gitkeep"), "");

  console.log("\n✅ All scraped data cleared!\n");
  console.log("📋 Next steps:");
  console.log("  1. Run: npm run scrape <url>");
  console.log("  2. Run: npm run build");
  console.log("  3. Run: npm run preview\n");
}

clearScrapedData().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
