const fs = require("fs");
const path = require("path");

const root = process.cwd();
const required = [
  "index.html",
  "sw.js",
  "privacy.html",
  "manifest.webmanifest",
  "assets/app-icon.svg",
  "capacitor.config.json",
  "package.json"
];

let failed = false;

for (const file of required) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? "OK" : "MISSING"} ${file}`);
  if (!exists) failed = true;
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const checks = [
  ["external manifest", /<link\s+rel=["']manifest["']\s+href=["']\.\/manifest\.webmanifest["']/i],
  ["theme color", /<meta\s+name=["']theme-color["']/i],
  ["apple mobile title", /<meta\s+name=["']apple-mobile-web-app-title["']/i],
  ["privacy link", /privacy\.html/i],
  ["service worker registration", /navigator\.serviceWorker\.register/i]
];

for (const [label, pattern] of checks) {
  const ok = pattern.test(html);
  console.log(`${ok ? "OK" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
for (const field of ["name", "short_name", "start_url", "display", "icons"]) {
  const ok = Boolean(manifest[field]);
  console.log(`${ok ? "OK" : "MISSING"} manifest.${field}`);
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
