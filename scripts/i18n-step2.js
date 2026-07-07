const fs = require("fs");
let h = fs.readFileSync("../index.html", "utf8");
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);
let count = 0;

// Prayer names in Good Deeds card
var deeds = [
  ["Fasting", "Fasting"],
  ["Sadaqah", "Sadaqah"],
  ["Tahajjud", "Tahajjud"],
  ["Learning", "Learning"],
  ["Helped someone", "Helped someone"],
  ["Recitation", "Recitation"]
];

// Zikr set names
var sets = [
  ["Morning", "Morning"],
  ["After Prayer", "After Prayer"],
  ["Evening", "Evening"]
];

// Day ribbon period labels
var periods = [
  ["Night · Before Fajr", "Night"],
  ["Last third of night", "Last third"],
  ["Fajr · Dawn", "Fajr Dawn"],
  ["The blessed morning hour", "Blessed morning"],
  ["Duha · Mid-morning", "Duha"],
  ["Between sunrise and noon", "Sunrise to noon"],
  ["Zawal · Midday", "Zawal"],
  ["Dhuhr window opens", "Dhuhr opens"],
  ["Afternoon", "Afternoon"],
  ["Between Dhuhr and Asr", "Dhuhr to Asr"],
  ["Asr · Late afternoon", "Asr Late"],
  ["Window open", "Window open"],
  ["Maghrib · Evening", "Maghrib"],
  ["Sunset to Isha", "Sunset to Isha"],
  ["After Isha", "After Isha"],
];

// Function to safely wrap strings seen in the minified code
function wrap(oldStr, key) {
  // The string appears as: ,"Old String",
  // We need to find and replace it
  var patterns = [
    ',"' + oldStr + '",',
    ',"' + oldStr + '")',
    ',null,"' + oldStr + '")',
    'null,"' + oldStr + '",',
  ];
  patterns.forEach(function(p) {
    if (h.includes(p)) {
      var r = p.replace('"' + oldStr + '"', '__t("' + key + '","' + oldStr + '")');
      h = h.replace(p, r);
      count++;
    }
  });
}

// === Translate deed names ===
var deedKeys = ["Fasting","Sadaqah","Tahajjud","Learning","Helping","Recitation"];
deedKeys.forEach(function(k) {
  wrap(k, k);
});

// === Zikr set names ===
wrap("Morning", "Morning");
wrap("After Prayer", "AfterPrayer");
wrap("Evening", "Evening");

// === Day ribbon periods ===
periods.forEach(function(p) {
  wrap(p[0], p[1].replace(/\s+/g, ''));
});

// === Card footer text ===
// " verses · tap to log"
// " min read · goal "
// These need special handling as they're concatenated strings

// === Tasbih ===
wrap("Tasbih Counter", "TasbihCounter");
wrap("Reset", "Reset");
wrap("Tap to Count", "TapToCount");

// === Hadith ===
wrap("Hadith of the Day", "HadithDay");

// === Dua banner ===
wrap("Dua of the Day · Al-Baqarah 2:201", "DuaDay");

// === Salah Times heading ===
wrap("Salah Times", "SalahTimes");
wrap("Adhan", "Adhan");

// === Today's Balance heading ===
wrap("Today's Balance", "TodaysBalance");
wrap("Deen", "DeenLabel");
wrap("Dunya", "DunyaLabel");

// === Daily Score ===
wrap("Prayers · Qur'an · Adhkar", "RingSubtitle");

fs.writeFileSync("../index.html", h, "utf8");
console.log("✅", count, "strings wrapped");
console.log("Size:", h.length);
