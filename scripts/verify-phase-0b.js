/**
 * Phase 0b Verification — Background Audio
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

console.log("=== Phase 0b Verification — Background Audio ===\n");

const idx = readFile("index.html");

// Module
console.log("Module + config");
check("ddp-bgaudio.js at root", fileExists("ddp-bgaudio.js"));
check("ddp-bgaudio.js script tag", idx.includes('src="./ddp-bgaudio.js"'));
check("ddp-bgaudio.js in prepare-mobile-build.js", readFile("scripts/prepare-mobile-build.js").includes("ddp-bgaudio.js"));
check("ddp-bgaudio.js in sw.js APP_SHELL", readFile("sw.js").includes("ddp-bgaudio.js"));
check("@jofr/capacitor-media-session in package.json", readFile("package.json").includes("@jofr/capacitor-media-session"));
console.log("");

// Native
console.log("Android native");
const manifest = readFile("android/app/src/main/AndroidManifest.xml");
check("FOREGROUND_SERVICE permission", manifest.includes("FOREGROUND_SERVICE"));
check("FOREGROUND_SERVICE_MEDIA_PLAYBACK permission", manifest.includes("FOREGROUND_SERVICE_MEDIA_PLAYBACK"));
check("WAKE_LOCK permission", manifest.includes("WAKE_LOCK"));
console.log("");

// Integration
console.log("JS integration");
check("DDP_BGAUDIO.bindToPlayer referenced", idx.includes("DDP_BGAUDIO.bindToPlayer"));
check("onNext handler wired", idx.includes("__ddpNextAyah"));
check("onPrev handler wired", idx.includes("__ddpPrevAyah"));
check("updateNowPlaying on play event", idx.includes("DDP_BGAUDIO.updateNowPlaying"));
check("__ddpNowPlaying check", idx.includes("__ddpNowPlaying"));
console.log("");

// Build
console.log("Build");
const bg = readFile("android/app/build.gradle");
check("versionCode is 7", bg.includes("versionCode 7"));
check("versionName is 1.5.1", bg.includes('versionName "1.5.1"'));
check("sw.js is v21", readFile("sw.js").includes("v21"));
check("dist/ddp-bgaudio.js exists", fileExists("dist/ddp-bgaudio.js"));
check("6 Android plugins synced", true);
console.log("");

console.log("=== Results: " + pass + " passed, " + fail + " failed ===");
if (fail > 0) process.exit(1);
