const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignoreDirs = new Set(["node_modules", ".git", "coverage"]);

function collectJsFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectJsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = collectJsFiles(root);
let hasError = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    hasError = true;
    console.error(`Syntax check failed: ${path.relative(root, file)}`);
    if (result.stderr) {
      console.error(result.stderr);
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
