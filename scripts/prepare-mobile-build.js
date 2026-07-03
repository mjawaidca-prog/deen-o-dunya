const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dist = path.join(root, "dist");
const files = [
  "index.html",
  "sw.js",
  "privacy.html",
  "manifest.webmanifest",
  "mobile-admob.js",
  "ddp-cities.js",
  "ddp-state.js",
  "ddp-audio.js"
];
const dirs = [
  "assets"
];
const admobScriptTag = '<script src="./mobile-admob.js"></script>';

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const dir of dirs) {
  fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true });
}

const indexPath = path.join(dist, "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf8");
if (!indexHtml.includes(admobScriptTag)) {
  indexHtml = indexHtml.replace("</body>", admobScriptTag + "\n</body>");
  fs.writeFileSync(indexPath, indexHtml);
}

console.log("Prepared mobile web bundle in dist/");
