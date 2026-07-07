/**
 * Phase 2 Verification Script
 * Run: node scripts/verify-phase-2.js
 */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
let pass = 0, fail = 0;

function check(label, condition, detail) {
  if (condition) { pass++; console.log("  ✅ " + label); }
  else { fail++; console.log("  ❌ " + label + " — " + (detail || "FAILED")); }
}

function fileExists(relPath) { return fs.existsSync(path.join(root, relPath)); }
function readFile(relPath) { try { return fs.readFileSync(path.join(root, relPath), "utf8"); } catch(e) { return ""; } }

console.log("=== Phase 2 Verification ===\n");

// Part 1 — Performance
console.log("Part 1 — Performance");
const p2files = ["ddp-perf.js","ddp-vlist.js"];
const idx = readFile("index.html");
p2files.forEach(f => check(f + " at root", fileExists(f)));
p2files.forEach(f => check("  " + f + " script tag", idx.includes('<script src="./' + f + '"></script>')));
p2files.forEach(f => check("  " + f + " in prepare-mobile-build.js", readFile("scripts/prepare-mobile-build.js").includes(f)));
p2files.forEach(f => check("  " + f + " in sw.js APP_SHELL", readFile("sw.js").includes(f)));
check("DDP_PERF.profile() referenced", idx.includes("DDP_PERF.profile()"));
check("DDP_VLIST referenced in index", idx.includes("DDP_VLIST"));
check("Device-tier shadow/animations disable", idx.includes("__ddpPerf"));
console.log("");

// Part 2 — AdMob
console.log("Part 2 — AdMob + Purchase");
const adsFiles = ["ddp-ads.js","ddp-purchase.js"];
adsFiles.forEach(f => check(f + " at root", fileExists(f)));
adsFiles.forEach(f => check("  " + f + " script tag", idx.includes('<script src="./' + f + '"></script>')));
adsFiles.forEach(f => check("  " + f + " in sw.js APP_SHELL", readFile("sw.js").includes(f)));
check("DDP_ADS.init() referenced", idx.includes("DDP_ADS.init()"));
check("DDP_ADS.onScreenChange referenced", idx.includes("DDP_ADS.onScreenChange"));
check("DDP_ADS.bindAudioGuard referenced", idx.includes("DDP_ADS.bindAudioGuard"));
check("Remove Ads row in Settings", idx.includes("Remove Ads"));
check("Support/Sadaqah row in Settings", idx.includes("Support the App"));
check("AdMob safety doc exists", fileExists("docs/admob-safety-config.md"));
check("onScreenChange in go() routing", idx.includes("DDP_ADS.onScreenChange(e)"));
console.log("");

// Part 3 — Widget
console.log("Part 3 — Widget");
check("NextPrayerWidget.java exists", fileExists("android/app/src/main/java/com/deenodunya/planner/NextPrayerWidget.java"));
check("widget_next_prayer.xml exists", fileExists("android/app/src/main/res/layout/widget_next_prayer.xml"));
check("next_prayer_widget_info.xml exists", fileExists("android/app/src/main/res/xml/next_prayer_widget_info.xml"));
check("widget_bg.xml drawable", fileExists("android/app/src/main/res/drawable/widget_bg.xml"));
check("widget_ring_bg.xml drawable", fileExists("android/app/src/main/res/drawable/widget_ring_bg.xml"));
check("Widget receiver in manifest", readFile("android/app/src/main/AndroidManifest.xml").includes("NextPrayerWidget"));
check("Widget string in strings.xml", readFile("android/app/src/main/res/values/strings.xml").includes("widget_description"));
console.log("");

// Part 4 — Tafsir
console.log("Part 4 — Tafsir cleanup");
check("No ghamidi/maududi/islahi seed blocks", !idx.includes("\n        ghamidi: {"));
check("Runtime tafsir strip present", idx.includes("delete a.tafsir.ghamidi"));
check("jalalayn (public domain) preserved", idx.includes("jalalayn:"));
console.log("");

// Build
console.log("Build");
const buildGradle = readFile("android/app/build.gradle");
check("versionCode is 4", buildGradle.includes("versionCode 4"));
check("versionName is 1.3.0", buildGradle.includes('versionName "1.3.0"'));
check("sw.js is v18", readFile("sw.js").includes("v18"));
check("Version strings updated to v1.3.0", idx.includes("v1.3.0"));
check("dist/ exists with Phase 2 files", fileExists("dist/ddp-perf.js") && fileExists("dist/ddp-vlist.js"));
console.log("");

console.log("=== Results: " + pass + " passed, " + fail + " failed ===");
if (fail > 0) process.exit(1);
