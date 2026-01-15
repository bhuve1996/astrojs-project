import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const NODE_MODULES_DIR = path.join(PROJECT_ROOT, "node_modules");
const SCRAPED_DATA_DIR = path.join(PROJECT_ROOT, "scraped-data");
const PUBLIC_ASSETS_DIR = path.join(PROJECT_ROOT, "public", "assets");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const ASTRO_DIR = path.join(PROJECT_ROOT, ".astro");
const PACKAGE_LOCK = path.join(PROJECT_ROOT, "package-lock.json");

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

async function cleanAll() {
  console.log("🧹 Clean All - Remove Everything\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const itemsToDelete = [];

  // Check what exists
  const checks = [
    { path: NODE_MODULES_DIR, name: "node_modules/", type: "dir" },
    { path: SCRAPED_DATA_DIR, name: "scraped-data/", type: "dir" },
    { path: PUBLIC_ASSETS_DIR, name: "public/assets/", type: "dir" },
    { path: DIST_DIR, name: "dist/", type: "dir" },
    { path: ASTRO_DIR, name: ".astro/", type: "dir" },
    { path: PACKAGE_LOCK, name: "package-lock.json", type: "file" }
  ];

  for (const check of checks) {
    if (await fs.pathExists(check.path)) {
      if (check.type === "dir") {
        const files = await fs.readdir(check.path);
        if (files.length > 0) {
          itemsToDelete.push(check);
        }
      } else {
        itemsToDelete.push(check);
      }
    }
  }

  if (itemsToDelete.length === 0) {
    console.log("✅ Nothing to clean. All directories are empty.\n");
    return;
  }

  // Show what will be deleted
  console.log("⚠️  The following will be deleted:\n");
  itemsToDelete.forEach(item => {
    console.log(`   📁 ${item.name}`);
  });
  console.log("");

  // Ask for confirmation
  const answer = await askQuestion("❓ Are you sure you want to clean everything? (yes/no): ");
  
  if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
    console.log("\n❌ Cancelled. No files were deleted.\n");
    return;
  }

  console.log("\n🗑️  Cleaning...\n");

  // Remove all items
  for (const item of itemsToDelete) {
    try {
      if (item.type === "dir") {
        await fs.remove(item.path);
        console.log(`  ✔ Removed: ${item.name}`);
      } else {
        await fs.remove(item.path);
        console.log(`  ✔ Removed: ${item.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Error removing ${item.name}: ${error.message}`);
    }
  }

  // Create .gitkeep files to maintain directory structure
  await fs.ensureDir(SCRAPED_DATA_DIR);
  await fs.ensureDir(PUBLIC_ASSETS_DIR);
  await fs.writeFile(path.join(SCRAPED_DATA_DIR, ".gitkeep"), "");
  await fs.writeFile(path.join(PUBLIC_ASSETS_DIR, ".gitkeep"), "");

  console.log("\n✅ Clean complete!\n");
  console.log("📋 Next steps:");
  console.log("  1. Run: npm install");
  console.log("  2. Run: npm run scrape <url>");
  console.log("  3. Run: npm run build");
  console.log("  4. Run: npm run preview\n");
}

cleanAll().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
