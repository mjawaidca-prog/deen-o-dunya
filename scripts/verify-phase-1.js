/**
 * Phase 1 Verification Script
 * Run: node scripts/verify-phase-1.js
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

console.log("=== Phase 1 Verification ===\n");

// Task P1-1: Capacitor plugin + res/raw audio
console.log("Task P1-1 — Local notifications plugin");
check("@capacitor/local-notifications in package.json", readFile("package.json").includes("@capacitor/local-notifications"));
check("adhan_makkah.mp3 in res/raw", fileExists("android/app/src/main/res/raw/adhan_makkah.mp3"));
check("adhan_madinah.mp3 in res/raw", fileExists("android/app/src/main/res/raw/adhan_madinah.mp3"));
console.log("");

// Task P1-2: Phase 1 modules
console.log("Task P1-2 — Phase 1 modules");
const phase1Files = ["ddp-db.js","ddp-habits.js","ddp-notify.js","ddp-hijri.js","ddp-i18n.js"];
phase1Files.forEach(f => check(f + " at root", fileExists(f)));
phase1Files.forEach(f => check("  " + f + " script tag in index.html", readFile("index.html").includes('<script src="./' + f + '"></script>')));
phase1Files.forEach(f => check("  " + f + " in prepare-mobile-build.js", readFile("scripts/prepare-mobile-build.js").includes(f)));
console.log("");

// Task P1-4: Quran bundle
console.log("Task P1-4 — Quran bundle");
check("quran-bundle.json.gz exists at root", fileExists("quran-bundle.json.gz"));
check("quran-bundle.json.gz in prepare-mobile-build.js", readFile("scripts/prepare-mobile-build.js").includes("quran-bundle.json.gz"));
check("quran-bundle.json.gz in dist", fileExists("dist/quran-bundle.json.gz"));
check("build-quran-bundle.js in scripts", fileExists("scripts/build-quran-bundle.js"));
console.log("");

// Task P1-3/6: Boot + onboarding
console.log("Task P1-3/6 — Boot sequence + Onboarding");
const idx = readFile("index.html");
check("ddpBoot function present", idx.includes("ddpBoot"));
check("ddpPostOnboard function present", idx.includes("ddpPostOnboard"));
check("loadQuranBundle function present", idx.includes("loadQuranBundle"));
check("Onboarding component present", idx.includes("function Onboarding"));
check('onboarding screen in routing', idx.includes('case"onboarding"'));
console.log("");

// Task P1-7: Notifications
console.log("Task P1-7 — Prayer notification scheduling");
check("schedulePrayerNotifications present", idx.includes("schedulePrayerNotifications"));
check("DDP_NOTIFY referenced", idx.includes("DDP_NOTIFY"));
console.log("");

// Task P1-8: Daily Ring
console.log("Task P1-8 — Daily Ring");
check("DailyRing component present", idx.includes("function DailyRing"));
check("DailyRing used in dashboard", idx.includes("DailyRing"));
console.log("");

// Task P1-10: Hijri date
console.log("Task P1-10 — Hijri date");
check("DDP_HIJRI.format referenced", idx.includes("DDP_HIJRI") && idx.includes(".format"));
check("Hijri offset in Settings", idx.includes("Hijri Date Adjustment"));
console.log("");

// Task P1-11: i18n
console.log("Task P1-11 — i18n wiring");
check("DDP_I18N referenced", idx.includes("DDP_I18N"));
check("Language setting functional", idx.includes("DDP_I18N.setLang"));
check("ddp_lang localStorage key used", idx.includes("ddp_lang"));
console.log("");

// Task P1-12: Service worker v17
console.log("Task P1-12 — Service worker");
check("sw.js is v17", readFile("sw.js").includes("v17"));
phase1Files.forEach(f => check("  " + f + " in APP_SHELL", readFile("sw.js").includes(f)));
check("quran-bundle.json.gz in APP_SHELL", readFile("sw.js").includes("quran-bundle.json.gz"));
console.log("");

// Task P1-13: Settings additions
console.log("Task P1-13 — Settings additions");
check("Attribution updated", idx.includes("tanzil.net"));
check("Version updated to 1.2.0", idx.includes("v1.2.0"));
console.log("");

// Task P1-14: Version bump
console.log("Task P1-14 — Version bump + build");
const buildGradle = readFile("android/app/build.gradle");
check("versionCode is 3", buildGradle.includes("versionCode 3"));
check("versionName is 1.2.0", buildGradle.includes('versionName "1.2.0"'));
check("dist/ index.html exists", fileExists("dist/index.html"));
check("dist/ sw.js exists", fileExists("dist/sw.js"));
phase1Files.forEach(f => check("  " + f + " in dist", fileExists("dist/" + f)));
check("quran-bundle.json.gz in dist", fileExists("dist/quran-bundle.json.gz"));
console.log("");

// Task P1-5: IndexedDB surah fetching
console.log("Task P1-5 — IndexedDB surah fetching");
check("DDP_DB.get('quran' referenced", idx.includes('DDP_DB.get("quran"') || idx.includes("DDP_DB.get('quran'"));
check("DDP_DB.set('quran' referenced", idx.includes('DDP_DB.set("quran"') || idx.includes("DDP_DB.set('quran'"));
check("migrateLegacy referenced", idx.includes("migrateLegacy"));
console.log("");

console.log("=== Results: " + pass + " passed, " + fail + " failed ===");
if (fail > 0) process.exit(1);
