const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dist = path.join(root, "dist");
const files = [
  "index.html",
  "sw.js",
  "privacy.html",
  "manifest.webmanifest"
];
const dirs = [
  "assets"
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const dir of dirs) {
  fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true });
}

console.log("Prepared mobile web bundle in dist/");
