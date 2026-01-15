import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const NODE_MODULES_DIR = path.join(PROJECT_ROOT, "node_modules");
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

async function removeDependencies() {
  console.log("🗑️  Remove Dependencies\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const itemsToDelete = [];

  if (await fs.pathExists(NODE_MODULES_DIR)) {
    const stats = await fs.stat(NODE_MODULES_DIR);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    itemsToDelete.push({
      path: NODE_MODULES_DIR,
      name: "node_modules/",
      size: sizeInMB
    });
  }

  if (await fs.pathExists(PACKAGE_LOCK)) {
    itemsToDelete.push({
      path: PACKAGE_LOCK,
      name: "package-lock.json"
    });
  }

  if (itemsToDelete.length === 0) {
    console.log("✅ No dependencies found. Nothing to remove.\n");
    return;
  }

  // Show what will be deleted
  console.log("⚠️  The following will be deleted:\n");
  itemsToDelete.forEach(item => {
    console.log(`   📁 ${item.name}`);
    if (item.size) {
      console.log(`      Size: ~${item.size} MB`);
    }
    console.log("");
  });

  // Ask for confirmation
  const answer = await askQuestion("❓ Are you sure you want to remove all dependencies? (yes/no): ");
  
  if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
    console.log("\n❌ Cancelled. No files were deleted.\n");
    return;
  }

  console.log("\n🗑️  Removing dependencies...\n");

  // Remove node_modules
  if (await fs.pathExists(NODE_MODULES_DIR)) {
    try {
      await fs.remove(NODE_MODULES_DIR);
      console.log("  ✔ Removed: node_modules/");
    } catch (error) {
      console.log(`  ❌ Error removing node_modules/: ${error.message}`);
    }
  }

  // Remove package-lock.json (optional)
  if (await fs.pathExists(PACKAGE_LOCK)) {
    try {
      await fs.remove(PACKAGE_LOCK);
      console.log("  ✔ Removed: package-lock.json");
    } catch (error) {
      console.log(`  ❌ Error removing package-lock.json: ${error.message}`);
    }
  }

  console.log("\n✅ Dependencies removed!\n");
  console.log("📋 To reinstall dependencies:");
  console.log("   npm install\n");
}

removeDependencies().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
