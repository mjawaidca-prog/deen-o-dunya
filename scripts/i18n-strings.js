// Apply i18n to all hardcoded English strings in index.html
const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(indexPath, "utf8");
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);

// Helper: wraps a string in DDP_I18N.t() call
// We need to handle strings used in React.createElement and in string literals

// Strategy: Replace key UI strings with t() calls
// Since the code uses h("tag",props,"string") pattern, we can replace
// the literal string children

let changes = 0;

// First, add a t() helper that's available in the inline scope
// Insert at start of Phase 1 IIFE
var tHelper = `
  var t = window.DDP_I18N ? function(k,d){return DDP_I18N.t(k)||d||k;} : function(k,d){return d||k;};
`;
h = h.replace("/* Phase 1 log updates", tHelper + "/* Phase 1 log updates");

// === BOTTOM NAV ===
const navLabel = 'TABS=[{key:"dashboard",label:"Today",icon:Ic.dashboard},{key:"quran",label:"Qur\'an",icon:Ic.quran},{key:"tafsir",label:"Tafsir",icon:Ic.layers},{key:"hadith",label:"Hadith",icon:Ic.book},{key:"qibla",label:"Qibla",icon:Ic.compass},{key:"azkar",label:"Azkar",icon:Ic.beads},{key:"more",label:"More",icon:Ic.grid9}]';
const navNew = 'TABS=[{key:"dashboard",label:t("dashboard","Today"),icon:Ic.dashboard},{key:"quran",label:t("quran","Qur\'an"),icon:Ic.quran},{key:"tafsir",label:t("tafsir","Tafsir"),icon:Ic.layers},{key:"hadith",label:t("hadith","Hadith"),icon:Ic.book},{key:"qibla",label:t("qibla","Qibla"),icon:Ic.compass},{key:"azkar",label:t("azkar","Azkar"),icon:Ic.beads},{key:"more",label:t("more","More"),icon:Ic.grid9}]';
if (h.includes('label:"Today"')) {
  h = h.replace(navLabel, navNew);
  changes++;
}

// === DASHBOARD ===
// DayRibbon header
h = h.replace(/"Salah Log · Today"/g, 't("salah_log","Salah Log · Today")');
h = h.replace(/"Qur\'an Log · Today"/g, 't("quran_log","Qur\'an Log · Today")');
h = h.replace(/"Zikr · Today"/g, 't("zikr_today","Zikr · Today")');
h = h.replace(/"Good Deeds · Today"/g, 't("good_deeds","Good Deeds · Today")');

// Eyebrow: use t()
h = h.replace(/h\(Eyebrow,null,"Salah Log · Today"\)/g, 'h(Eyebrow,null,t("salah_log","Salah Log · Today"))');
h = h.replace(/h\(Eyebrow,null,"Qur\'an Log · Today"\)/g, 'h(Eyebrow,null,t("quran_log","Qur\'an Log · Today"))');
h = h.replace(/h\(Eyebrow,null,"Zikr · Today"\)/g, 'h(Eyebrow,null,t("zikr_today","Zikr · Today"))');
h = h.replace(/h\(Eyebrow,null,"Good Deeds · Today"\)/g, 'h(Eyebrow,null,t("good_deeds","Good Deeds · Today"))');

// Dashboard subtitles
h = h.replace(/"Calculation method · "/g, 't("calc_method","Calculation method")+" · "');
h = h.replace(/" verses"/g, 't("verses"," verses")');
h = h.replace(/" min read · goal "/g, 't("min_read"," min read")+" · "+t("goal","goal")+" "');
h = h.replace(/" verses · tap to log"/g, 't("tap_to_log"," verses · tap to log")');

// === SETTINGS SCREEN ===
const settingsReplacements = [
  ['"Preferences"', 't("preferences","Preferences")'],
  ['"Settings"', 't("settings","Settings")'],
  ['"Prayer Times"', 't("prayer_times","Prayer Times")'],
  ['"Calculation method"', 't("calculation_method","Calculation method")'],
  ['"Auto-detect location"', 't("auto_location","Auto-detect location")'],
  ['"Use my own salat times"', 't("own_times","Use my own salat times")'],
  ['"Enter or import a custom timetable"', 't("custom_timetable","Enter or import a custom timetable")'],
  ['"Adhan & Iqama Times"', 't("adhan_iqama","Adhan & Iqama Times")'],
  ['"Set times manually"', 't("manual_times","Set times manually")'],
  ['"Using auto-calculated times"', 't("auto_times","Using auto-calculated times")'],
  ['"Editing your masjid timetable"', 't("masjid_timetable","Editing your masjid timetable")'],
  ['"Adhan & Audio"', 't("adhan_audio","Adhan & Audio")'],
  ['"Makkah Adhan"', 't("makkah_adhan","Makkah Adhan")'],
  ['"Auto-play adhan at prayer time"', 't("auto_adhan","Auto-play adhan at prayer time")'],
  ['"Adhan voice"', 't("adhan_voice","Adhan voice")'],
  ['"Sheikh Ali Mull\\u0101"', 't("sheikh_ali","Sheikh Ali Mullā")'],
  ['"Qur\'an"', 't("quran_label","Qur\'an")'],
  ['"Default Q\\u0101r\\u012B"', 't("default_qari","Default Qāriʾ")'],
  ['"Daily verse goal"', 't("verse_goal","Daily verse goal")'],
  ['"Recite reminder"', 't("recite_reminder","Recite reminder")'],
  ['"Nudge me to recite 2 verses"', 't("nudge_recite","Nudge me to recite 2 verses")'],
  ['"Off"', 't("off","Off")'],
  ['"Reminder time"', 't("reminder_time","Reminder time")'],
  ['"Notifications"', 't("notifications","Notifications")'],
  ['"Appearance"', 't("appearance","Appearance")'],
  ['"Light"', 't("light","Light")'],
  ['"About Deen o Dunya"', 't("about","About Deen o Dunya")'],
  ['"Support the App"', 't("support","Support the App")'],
  ['"Remove Ads"', 't("remove_ads","Remove Ads")'],
  ['"One-time purchase"', 't("one_time","One-time purchase")'],
];
settingsReplacements.forEach(([old, nu]) => {
  if (h.includes(old) && !h.includes('t("')) {
    h = h.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), nu);
  }
});

// === MORE SCREEN ===
h = h.replace(/"Tools & Settings"/g, 't("tools_settings","Tools & Settings")');
h = h.replace(/"More"/g, 't("more_label","More")');
h = h.replace(/"Prayer Settings"/g, 't("prayer_settings","Prayer Settings")');
h = h.replace(/"Location & calculation method"/g, 't("location_method","Location & calculation method")');
h = h.replace(/"Daily Nourishment"/g, 't("daily_nourishment","Daily Nourishment")');
h = h.replace(/"Today\\u2019s Qur\\u2019an goal"/g, 't("todays_quran_goal","Today\\u2019s Qur\\u2019an goal")');
h = h.replace(/"Qur\'an Log"/g, 't("quran_log_title","Qur\'an Log")');
h = h.replace(/"Reading sessions & goals"/g, 't("reading_sessions","Reading sessions & goals")');
h = h.replace(/"Morning, evening & tasbih"/g, 't("morning_evening","Morning, evening & tasbih")');
h = h.replace(/"Good Deeds"/g, 't("good_deeds_title","Good Deeds")');
h = h.replace(/"Qibla finder"/g, 't("qibla_finder","Qibla finder")');
h = h.replace(/"Direction to the Ka\\u02BFbah"/g, 't("kaaba_direction","Direction to the Kaʿbah")');

// === TASKS SCREEN ===
h = h.replace(/"Today\'s Intentions"/g, 't("intentions","Today\'s Intentions")');
h = h.replace(/"Tasks"/g, 't("tasks_title","Tasks")');
h = h.replace(/"Spiritual goals"/g, 't("deen_goals","Spiritual goals")');
h = h.replace(/"Productivity"/g, 't("productivity","Productivity")');

// === QURAN SCREEN ===
h = h.replace(/"Al-Qur\\u02BE\\u0101n"/g, 't("al_quran","Al-Qurʾān")');
h = h.replace(/"The Noble Qur\\u02BE\\u0101n \\u00b7 114 S\\u016Brahs"/g, 't("noble_quran","The Noble Qurʾān · 114 Sūrahs")');
h = h.replace(/"Daily Nourishment \\u00b7 continue"/g, 't("daily_nourishment_continue","Daily Nourishment · continue")');
h = h.replace(/"Search s\\u016Brah\\u2026"/g, 't("search_surah","Search sūrah…")');
h = h.replace(/"No s\\u016Brah found."/g, 't("no_surah","No sūrah found.")');

// === AZKAR ===
h = h.replace(/"Morning Adhk\\u0101r"/g, 't("morning_azkar","Morning Adhkār")');
h = h.replace(/"Evening Adhk\\u0101r"/g, 't("evening_azkar","Evening Adhkār")');

// === DASHBOARD DUA ===
h = h.replace(/"Dua of the Day \\u00b7 Al-Baqarah 2:201"/g, 't("dua_day","Dua of the Day · Al-Baqarah 2:201")');

// === ONBOARDING ===
h = h.replace(/"Choose language"/g, 't("onboard_lang","Choose language")');
h = h.replace(/"Select your city"/g, 't("onboard_city","Select your city")');
h = h.replace(/"You\\'re all set!"/g, 't("onboard_ready","You\'re all set!")');
h = h.replace(/"Your prayer times are ready."/g, 't("onboard_subtitle","Your prayer times are ready.")');
h = h.replace(/"Start using the app"/g, 't("start_app","Start using the app")');
h = h.replace(/"No thanks, maybe later"/g, 't("no_thanks","No thanks, maybe later")');
h = h.replace(/"Search city\\u2026"/g, 't("search_city","Search city…")');

// === ABOUT ===
h = h.replace(/"A prayer-first daily planner for worship, reflection, and daily routine."/g,
  't("about_desc","A prayer-first daily planner for worship, reflection, and daily routine.")');
h = h.replace(/"Deen o Dunya helps you stay organized around salah, Qur\'an reading, qibla direction, azkar, adhan audio, and balanced Deen\/Dunya planning."/g,
  't("about_long","Deen o Dunya helps you stay organized around salah, Qur\'an reading, qibla direction, azkar, adhan audio, and balanced Deen/Dunya planning.")');

// === SCREEN HEADERS ===
h = h.replace(/eyebrow:"Track your prayers"/g, 'eyebrow:t("track_prayers","Track your prayers")');
h = h.replace(/title:"Salah Log"/g, 'title:t("salah_log_title","Salah Log")');
h = h.replace(/eyebrow:"Track your reading"/g, 'eyebrow:t("track_reading","Track your reading")');
h = h.replace(/title:"Qur\'an Log"/g, 'title:t("quran_log_title","Qur\'an Log")');
h = h.replace(/eyebrow:"Daily \\'amal"/g, 'eyebrow:t("daily_amal","Daily \'amal")');
h = h.replace(/title:"Good Deeds"/g, 'title:t("good_deeds_title","Good Deeds")');
h = h.replace(/eyebrow:"Prayer Settings"/g, 'eyebrow:t("prayer_settings","Prayer Settings")');
h = h.replace(/title:"Location & Method"/g, 'title:t("location_method","Location & Method")');

// === DASHBOARD BALANCE ===
h = h.replace(/"Today\'s Balance"/g, 't("todays_balance","Today\'s Balance")');

// === PRAYER LOOK SWITCH ===
h = h.replace(/"Look A \\u00b7 Ribbon"/g, 't("look_a","Look A · Ribbon")');
h = h.replace(/"Look B \\u00b7 Horizon"/g, 't("look_b","Look B · Horizon")');

// === PRAYER TIMES TABLE ===
h = h.replace(/"Salah Times"/g, 't("salah_times","Salah Times")');
h = h.replace(/"Adhan"/g, 't("adhan","Adhan")');

// === QIBLA ===
h = h.replace(/"Qibla Compass"/g, 't("qibla_compass","Qibla Compass")');

// === HADITH ===
h = h.replace(/"Hadith of the Day"/g, 't("hadith_day","Hadith of the Day")');

// === TASBIH ===
h = h.replace(/"Tasbih Counter"/g, 't("tasbih_counter","Tasbih Counter")');
h = h.replace(/"Reset"/g, 't("reset","Reset")');
h = h.replace(/"Tap to Count"/g, 't("tap_count","Tap to Count")');

// === RAMADAN ===
h = h.replace(/"Suhoor ends"/g, 't("suhoor_ends","Suhoor ends")');
h = h.replace(/"Iftar"/g, 't("iftar","Iftar")');

// === DAY RIBBON PERIOD LABELS ===
h = h.replace(/"Night \\u00b7 Before Fajr"/g, 't("night_fajr","Night · Before Fajr")');
h = h.replace(/"Last third of night"/g, 't("last_third","Last third of night")');
h = h.replace(/"Fajr \\u00b7 Dawn"/g, 't("fajr_dawn","Fajr · Dawn")');
h = h.replace(/"The blessed morning hour"/g, 't("blessed_morning","The blessed morning hour")');
h = h.replace(/"Duha \\u00b7 Mid-morning"/g, 't("duha_morning","Duha · Mid-morning")');
h = h.replace(/"Between sunrise and noon"/g, 't("sunrise_noon","Between sunrise and noon")');
h = h.replace(/"Zawal \\u00b7 Midday"/g, 't("zawal_midday","Zawal · Midday")');
h = h.replace(/"Dhuhr window opens"/g, 't("dhuhr_opens","Dhuhr window opens")');
h = h.replace(/"Afternoon"/g, 't("afternoon","Afternoon")');
h = h.replace(/"Between Dhuhr and Asr"/g, 't("dhuhr_asr","Between Dhuhr and Asr")');
h = h.replace(/"Asr \\u00b7 Late afternoon"/g, 't("asr_late","Asr · Late afternoon")');
h = h.replace(/"Window open"/g, 't("window_open","Window open")');
h = h.replace(/"Maghrib \\u00b7 Evening"/g, 't("maghrib_evening","Maghrib · Evening")');
h = h.replace(/"Sunset to Isha"/g, 't("sunset_isha","Sunset to Isha")');
h = h.replace(/"Night"/g, 't("night","Night")');
h = h.replace(/"After Isha"/g, 't("after_isha","After Isha")');

// === DAY RIBBON FOOTER ===
h = h.replace(/\"Sunrise \"/g, 't("sunrise_label","Sunrise")+" "');
h = h.replace(/\"Sunset \"/g, 't("sunset_label","Sunset")+" "');

// === PRAYER NAMES IN TABLE ===
h = h.replace(/"Next \\u00b7 in "/g, 't("next","Next")+" · "+t("in","in")+" "');

// === STATS ===
h = h.replace(/"day streak"/g, 't("day_streak","day streak")');

// === LANGUAGE NAME HANDLING - fix the Language row to show proper label ===
// Already done in earlier step

// Add the reload for language change after setLang
// DDP_I18N.apply() already fires a custom event

console.log("✅ Applied ~70 i18n string replacements");
console.log("File size:", h.length);

// Remove BOM if present
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);

fs.writeFileSync(indexPath, h, "utf8");

// Quick syntax check
const vm = require("vm");
const html = fs.readFileSync(indexPath, "utf8");
var start = html.indexOf('<script>\n/**');
if (start === -1) start = html.indexOf('<script>\r\n/**');
start += 8;
var end = html.indexOf("ReactDOM.createRoot");
end = html.indexOf("</script>", end);
var js = html.substring(start, end);
try {
  new vm.Script(js);
  console.log("✅ JS syntax OK!");
} catch(e) {
  console.log("❌ SYNTAX ERROR:", e.message.substring(0, 150));
  var m = e.stack.match(/<anonymous>:(\d+)/);
  if (m) console.log("JS line:", m[1]);
}
