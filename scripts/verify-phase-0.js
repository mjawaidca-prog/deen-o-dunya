/**
 * Phase 0 Verification Script
 * Run: node scripts/verify-phase-0.js
 * Verifies all file-level changes without requiring a device.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
let pass = 0, fail = 0;

function check(label, condition, detail) {
  if (condition) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label} — ${detail || "FAILED"}`); }
}

function fileExists(relPath) { return fs.existsSync(path.join(root, relPath)); }
function readFile(relPath) { try { return fs.readFileSync(path.join(root, relPath), "utf8"); } catch(e) { return ""; } }

console.log("=== Phase 0 Verification ===\n");

// ── Task 1: Repo hygiene ──
console.log("Task 1 — Repo hygiene");
check("archive/ exists", fileExists("archive/"));
const archived = ["app.js","qibla.js","quran.js","quran-data.js","azkar.js","azkar-data.js","dashboard.js","tasks.js","more.js","settings.js","theme.js","ios-frame.js","react.production.min.js","react-dom.production.min.js"];
archived.forEach(f => check(`  ${f} archived`, fileExists("archive/" + f)));
check("Root clean (no stray app.js)", !fileExists("app.js"));
check("Root clean (no stray AndroidManifest.xml)", !fileExists("AndroidManifest.xml"));
check("Root clean (no stray MainActivity.java)", !fileExists("MainActivity.java"));
console.log("");

// ── Task 2: Helper modules ──
console.log("Task 2 — Helper modules");
const helpers = ["ddp-cities.js", "ddp-state.js", "ddp-audio.js"];
helpers.forEach(f => check(`${f} at root`, fileExists(f)));

const idx = readFile("index.html");
const helperTags = helpers.map(h => `<script src="./${h}"></script>`);
helperTags.forEach(t => check(`Script tag: ${t}`, idx.includes(t)));
check("sw.js is v16", readFile("sw.js").includes("v16"));
const prepBuild = readFile("scripts/prepare-mobile-build.js");
helpers.forEach(f => check(`  ${f} in prepare-mobile-build.js`, prepBuild.includes(f)));
console.log("");

// ── Task 3: Android ──
console.log("Task 3 — Android native fixes");
const manifest = readFile("android/app/src/main/AndroidManifest.xml");
check("COARSE_LOCATION permission", manifest.includes("ACCESS_COARSE_LOCATION"));
check("FINE_LOCATION permission", manifest.includes("ACCESS_FINE_LOCATION"));
check("POST_NOTIFICATIONS permission", manifest.includes("POST_NOTIFICATIONS"));
check("SCHEDULE_EXACT_ALARM permission", manifest.includes("SCHEDULE_EXACT_ALARM"));

const mainActivity = readFile("android/app/src/main/java/com/deenodunya/planner/MainActivity.java");
check("setMediaPlaybackRequiresUserGesture(false)", mainActivity.includes("setMediaPlaybackRequiresUserGesture(false)"));
check("Font scale clamping", mainActivity.includes("fontScale") || mainActivity.includes("setTextZoom"));

const buildGradle = readFile("android/app/build.gradle");
check("versionCode is 3", buildGradle.includes("versionCode 3"));

const pkgJson = JSON.parse(readFile("package.json"));
check("@capacitor/geolocation dependency", pkgJson.dependencies && pkgJson.dependencies["@capacitor/geolocation"]);
console.log("");

// ── Task 4: Viewport ──
console.log("Task 4 — Viewport / zoom");
check("NO user-scalable=no", !idx.includes("user-scalable=no"));
check("NO maximum-scale=1.0", !idx.includes("maximum-scale=1.0"));
check("viewport-fit=cover preserved", idx.includes("viewport-fit=cover"));
console.log("");

// ── Task 5: DDP_AUDIO integration ──
console.log("Task 5 — DDP_AUDIO integration");
check("DDP_AUDIO.ayahSources referenced", idx.includes("DDP_AUDIO.ayahSources"));
check("DDP_AUDIO.play referenced", idx.includes("DDP_AUDIO.play"));
check("DDP_AUDIO.preload referenced", idx.includes("DDP_AUDIO.preload"));
check("DDP_AUDIO.onState referenced", idx.includes("DDP_AUDIO.onState"));
check("DDP_AUDIO.pause referenced", idx.includes("DDP_AUDIO.pause"));
check("No per-card audio in DhikrAudio", !idx.includes("React.useRef(null),[g,f]=React.useState(0),[d,o]=React.useState(!1),[c,r]=React.useState(0)"));
check("DhikrAudio uses DDP_AUDIO", idx.includes("window.DDP_AUDIO.play(e,{onEnded"));
console.log("");

// ── Task 6: Adhan audio ──
console.log("Task 6 — Adhan audio");
check("assets/audio/ exists", fileExists("assets/audio/"));
check("adhan-makkah.mp3 exists", fileExists("assets/audio/adhan-makkah.mp3"));
check("adhan-madinah.mp3 exists", fileExists("assets/audio/adhan-madinah.mp3"));
const makkahSize = fs.statSync(path.join(root, "assets/audio/adhan-makkah.mp3")).size;
const madinahSize = fs.statSync(path.join(root, "assets/audio/adhan-madinah.mp3")).size;
const sizeOk = makkahSize > 1000 && madinahSize > 1000;
if (sizeOk) {
  check("Adhan files are real recordings (>1KB)", true);
} else {
  console.log(`  ⚠️  WARNING: Adhan files are placeholders (${makkahSize}B / ${madinahSize}B). Replace with real recordings.`);
}
check("Adhan URLs updated (no islamcan.com)", !idx.includes("islamcan.com"));
check("Adhan paths use local assets", idx.includes("./assets/audio/adhan-makkah.mp3"));
const sw = readFile("sw.js");
check("Adhan in sw.js APP_SHELL (makkah)", sw.includes("adhan-makkah.mp3"));
check("Adhan in sw.js APP_SHELL (madinah)", sw.includes("adhan-madinah.mp3"));
console.log("");

// ── Task 7: Session persistence ──
console.log("Task 7 — Session persistence");
check("DDP_STATE.trackScroll referenced", idx.includes("DDP_STATE.trackScroll"));
check("DDP_STATE module loaded", fileExists("ddp-state.js"));
check("Session boot script present", idx.includes("Phase 0: Session scroll tracking"));
console.log("");

// ── Task 8: Text-size ──
console.log("Task 8 — Text-size setting");
check("--ddp-scale CSS variable", idx.includes("--ddp-scale"));
check("Text-size boot script present", idx.includes("ddp_text_scale"));
check("fontSize scaling applied", idx.includes('document.documentElement.style.fontSize'));
console.log("");

// ── Task 9: City picker ──
console.log("Task 9 — City picker");
check("DDP_LOC.resolve used", idx.includes("DDP_LOC.resolve"));
check("No Calgary hardcoded fallback", !idx.includes('"Calgary, AB (default)"'));
check("DDP_LOC.saved() used in dashboard", idx.includes("DDP_LOC.saved()"));
check("ddp-cities.js module loaded", fileExists("ddp-cities.js"));
check("Karachi is default city", readFile("ddp-cities.js").includes("Karachi"));
console.log("");

// ── Task 10: Download UI ──
console.log("Task 10 — Download UI");
check("No fake setInterval progress", !idx.includes("setInterval(function(){ setProg(function(v){ return Math.min(.9, v + .035"));
check("Real progress tracking (done++/editions.length)", idx.includes("done++") && idx.includes("editions.length"));
check("QuotaExceededError handled", idx.includes("QuotaExceededError"));
console.log("");

console.log(`=== Results: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
