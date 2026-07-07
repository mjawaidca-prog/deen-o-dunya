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
  "ddp-audio.js",
  "ddp-bgaudio.js",
  "ddp-db.js",
  "ddp-habits.js",
  "ddp-notify.js",
  "ddp-hijri.js",
  "ddp-i18n.js",
  "ddp-perf.js",
  "ddp-vlist.js",
  "ddp-ads.js",
  "ddp-purchase.js",
  "ddp-audio-dl.js",
  "ddp-hadith.js",
  "ddp-kids.js",
  "ddp-tasbeeh-qibla.js",
  "ddp-ramadan.js",
  "ddp-search.js",
  "quran-bundle.json.gz"
];
const dirs = [
  "assets"
];
const admobScriptTag = '<script src="./mobile-admob.js"></script>';

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  const srcPath = path.join(root, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(dist, file));
  }
}

for (const dir of dirs) {
  const srcDir = path.join(root, dir);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, path.join(dist, dir), { recursive: true });
  }
}

const indexPath = path.join(dist, "index.html");
let indexHtml = fs.readFileSync(indexPath, "utf8");
if (!indexHtml.includes(admobScriptTag)) {
  indexHtml = indexHtml.replace("</body>", admobScriptTag + "\n</body>");
  fs.writeFileSync(indexPath, indexHtml);
}

console.log("Prepared mobile web bundle in dist/");
