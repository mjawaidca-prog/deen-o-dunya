const fs = require("fs");

// === Update ddp-i18n.js with ALL dashboard translations ===
let d = fs.readFileSync("../ddp-i18n.js", "utf8");
var strEnd = d.indexOf("};");
var allKeys = `
    /* === Dashboard full translations === */
    // Period labels (Day Ribbon)
    night_fajr:       { en: "Night · Before Fajr",      ur: "رات · فجر سے پہلے",        ar: "الليل · قبل الفجر" },
    last_third:       { en: "Last third of night",       ur: "رات کا آخری تہائی",         ar: "الثلث الأخير من الليل" },
    fajr_dawn:        { en: "Fajr · Dawn",               ur: "فجر · صبح",                 ar: "الفجر · الصباح" },
    blessed_morning:  { en: "The blessed morning hour",  ur: "بابرکت صبح کا وقت",         ar: "ساعة الصباح المباركة" },
    duha_morning:     { en: "Duha · Mid-morning",        ur: "ضحیٰ · صبح کا درمیان",      ar: "الضحى · منتصف الصباح" },
    sunrise_noon:     { en: "Between sunrise and noon",  ur: "طلوع آفتاب اور دوپہر",      ar: "بين الشروق والظهر" },
    zawal_midday:     { en: "Zawal · Midday",            ur: "زوال · دوپہر",              ar: "الزوال · منتصف النهار" },
    dhuhr_opens:      { en: "Dhuhr window opens",        ur: "ظہر کا وقت شروع",           ar: "فتح نافذة الظهر" },
    afternoon:        { en: "Afternoon",                 ur: "دوپہر بعد",                  ar: "بعد الظهر" },
    dhuhr_asr:        { en: "Between Dhuhr and Asr",     ur: "ظہر اور عصر کے درمیان",     ar: "بين الظهر والعصر" },
    asr_late:         { en: "Asr · Late afternoon",      ur: "عصر · سہ پہر",              ar: "العصر · آخر النهار" },
    maghrib_evening:  { en: "Maghrib · Evening",         ur: "مغرب · شام",                ar: "المغرب · المساء" },
    sunset_isha:      { en: "Sunset to Isha",            ur: "غروب سے عشاء تک",           ar: "من الغروب إلى العشاء" },
    after_isha:       { en: "After Isha",                ur: "عشاء کے بعد",               ar: "بعد العشاء" },
    night:            { en: "Night",                     ur: "رات",                       ar: "الليل" },
    night_before_fajr:{ en: "Night · Before Fajr",       ur: "رات · فجر سے پہلے",         ar: "الليل · قبل الفجر" },
    window_open:      { en: "Window open",               ur: "وقت موجود",                 ar: "النافذة مفتوحة" },
    daylight_label:   { en: "daylight",                  ur: "دن کی روشنی",               ar: "ضوء النهار" },
    sunrise_label:    { en: "Sunrise",                   ur: "طلوع آفتاب",                ar: "الشروق" },
    sunset_label:     { en: "Sunset",                    ur: "غروب آفتاب",                ar: "الغروب" },
    of_light:         { en: "of light",                  ur: "روشنی",                     ar: "من الضوء" },

    // Salah Times Table
    salah_times:      { en: "Salah Times",               ur: "نماز کے اوقات",             ar: "أوقات الصلاة" },
    calc_method_label:{ en: "Calculation method · ",     ur: "حساب کا طریقہ · ",         ar: "طريقة الحساب · " },
    adhan_btn:        { en: "Adhan",                     ur: "اذان",                      ar: "أذان" },
    next_in:          { en: "Next · in ",               ur: "اگلی · ",                   ar: "التالي · " },
    up_next:          { en: "UP NEXT · ",                ur: "اگلی · ",                   ar: "التالي · " },
    starts_in:        { en: "starts in ",               ur: "شروع ہونے میں ",            ar: "يبدأ في " },
    todays_daylight:  { en: "TODAY'S DAYLIGHT",          ur: "آج کے دن کی روشنی",         ar: "ضوء النهار اليوم" },

    // Salah Log Card
    salah_log:        { en: "Salah Log · Today",         ur: "نماز لاگ · آج",             ar: "سجل الصلاة · اليوم" },

    // Quran Log Card
    quran_log:        { en: "Qur'an Log · Today",        ur: "قرآن لاگ · آج",             ar: "سجل القرآن · اليوم" },
    verses_label:     { en: "verses",                    ur: "آیات",                      ar: "آيات" },
    juz_label:        { en: "Juz",                       ur: "پارہ",                      ar: "جزء" },
    day_streak:       { en: "-day streak",               ur: "دن کا سلسلہ",               ar: "يوم متتالية" },
    min_read:         { en: "min read",                  ur: "منٹ پڑھائی",                ar: "دقيقة قراءة" },
    goal_label:       { en: "goal",                      ur: "ہدف",                       ar: "الهدف" },
    tap_to_log:       { en: "verses · tap to log",       ur: "آیات · لاگ کریں",           ar: "آيات · اضغط للتسجيل" },

    // Zikr Card
    zikr_today:       { en: "Zikr · Today",              ur: "ذکر · آج",                  ar: "ذكر · اليوم" },
    tasbih_label:     { en: "tasbih",                    ur: "تسبیح",                     ar: "تسبيح" },
    morning_set:      { en: "Morning",                   ur: "صبح",                       ar: "الصباح" },
    after_prayer_set: { en: "After Prayer",              ur: "نماز کے بعد",               ar: "بعد الصلاة" },
    evening_set:      { en: "Evening",                   ur: "شام",                       ar: "المساء" },

    // Good Deeds Card
    good_deeds_label: { en: "Good Deeds · Today",        ur: "نیک اعمال · آج",            ar: "الأعمال الصالحة · اليوم" },
    fasting_deed:     { en: "Fasting",                   ur: "روزہ",                      ar: "الصيام" },
    sadaqah_deed:     { en: "Sadaqah",                   ur: "صدقہ",                      ar: "صدقة" },
    tahajjud_deed:    { en: "Tahajjud",                  ur: "تہجد",                      ar: "تهجد" },
    learning_deed:    { en: "Learning",                  ur: "تعلیم",                     ar: "تعلم" },
    helping_deed:     { en: "Helped someone",            ur: "کسی کی مدد",                ar: "مساعدة الغير" },
    recitation_deed:  { en: "Recitation",                ur: "تلاوت",                     ar: "تلاوة" },

    // Dua of the Day
    dua_day:          { en: "Dua of the Day · Al-Baqarah 2:201", ur: "آج کی دعا · البقرہ", ar: "دعاء اليوم · البقرة" },

    // Daily Ring
    daily_score:      { en: "Daily Score",               ur: "یومیہ اسکور",               ar: "النتيجة اليومية" },
    ring_subtitle:    { en: "Prayers · Qur'an · Adhkar", ur: "نماز · قرآن · اذکار",       ar: "صلوات · قرآن · أذكار" },

    // Balance card
    todays_balance:   { en: "Today's Balance",           ur: "آج کا توازن",               ar: "توازن اليوم" },
    deen_label:       { en: "Deen",                      ur: "دین",                       ar: "الدين" },
    dunya_label:      { en: "Dunya",                     ur: "دنیا",                      ar: "الدنيا" },
    balance_label:    { en: "Balance",                   ur: "توازن",                     ar: "التوازن" },

    // Look switch
    look_a:           { en: "Look A · Ribbon",           ur: "منظر الف · ربن",            ar: "منظر أ · شريط" },
    look_b:           { en: "Look B · Horizon",          ur: "منظر ب · افق",             ar: "منظر ب · أفق" },

    // Hadith
    hadith_day:       { en: "Hadith of the Day",         ur: "آج کی حدیث",                ar: "حديث اليوم" },
    hadith_text:      { en: "The most beloved deeds to Allah are the most consistent, even if small.", ur: "اللہ کے نزدیک سب سے پسندیدہ عمل وہ ہے جو مستقل ہو، چاہے تھوڑا ہی کیوں نہ ہو۔", ar: "أحب الأعمال إلى الله أدومها وإن قل" },
    hadith_source:    { en: "Narrated by Aisha (RA) · Sahih al-Bukhari", ur: "حضرت عائشہ ؓ · صحیح بخاری", ar: "روت عائشة رضي الله عنها · صحيح البخاري" },

    // Tasbih
    tasbih_counter:   { en: "Tasbih Counter",            ur: "تسبیح کاؤنٹر",              ar: "عداد التسبيح" },
    reset_btn:        { en: "Reset",                     ur: "ری سیٹ",                    ar: "إعادة" },
    tap_count:        { en: "Tap to Count",              ur: "گننے کے لیے ٹیپ کریں",      ar: "اضغط للعد" },

    // Onboarding
    onboard_lang:     { en: "Choose language",           ur: "زبان منتخب کریں",           ar: "اختر اللغة" },
    onboard_city:     { en: "Select your city",          ur: "اپنا شہر منتخب کریں",       ar: "اختر مدينتك" },
    onboard_ready:    { en: "You're all set!",           ur: "سب تیار ہے!",              ar: "أنت جاهز!" },
    onboard_subtitle: { en: "Your prayer times are ready.", ur: "آپ کے نماز کے اوقات تیار ہیں", ar: "أوقات صلاتك جاهزة" },
    start_app:        { en: "Start using the app",       ur: "ایپ استعمال کریں",          ar: "ابدأ استخدام التطبيق" },
    search_city:      { en: "Search city…",             ur: "شہر تلاش کریں…",            ar: "ابحث عن مدينة…" },
    no_thanks:        { en: "No thanks, maybe later",    ur: "نہیں، بعد میں",             ar: "لا شكراً، لاحقاً" },

    // Settings
    preferences:      { en: "Preferences",               ur: "ترجیحات",                   ar: "التفضيلات" },
    prayer_times_setting:{ en: "Prayer Times",           ur: "نماز کے اوقات",             ar: "أوقات الصلاة" },
    general:          { en: "General",                   ur: "عام",                       ar: "عام" },
    about_label:      { en: "About Deen o Dunya",        ur: "دین و دنیا کے بارے میں",    ar: "عن دين و دنيا" },
    support_label:    { en: "Support the App",           ur: "ایپ کی مدد",                ar: "ادعم التطبيق" },
    remove_ads_label: { en: "Remove Ads",                ur: "اشتہارات ہٹائیں",           ar: "إزالة الإعلانات" },
    kids_mode_label:  { en: "Kids Mode",                 ur: "بچوں کا موڈ",               ar: "وضع الأطفال" },
    language_label:   { en: "Language",                  ur: "زبان",                      ar: "اللغة" },
    notifications_label:{ en: "Notifications",           ur: "اطلاعات",                   ar: "الإشعارات" },
    off_label:        { en: "Off",                       ur: "بند",                       ar: "مغلق" },
    on_label:         { en: "On",                        ur: "آن",                        ar: "مفتوح" },
`;

d = d.substring(0, strEnd) + allKeys + d.substring(strEnd);
fs.writeFileSync("../ddp-i18n.js", d, "utf8");
console.log("✅ All translation keys added to ddp-i18n.js");

// === Update index.html with __t() wrappers ===
let h = fs.readFileSync("../index.html", "utf8");
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);

let count = 0;

// Helper: replace exact string in h() calls
function replaceStr(old, key) {
  // Replace in h() children and string props
  var escaped = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // As a direct child: ,"old",
  var re1 = new RegExp(',"' + escaped + '",', 'g');
  var re2 = new RegExp(',"' + escaped + '"\\)', 'g');
  // As a direct child with null: ,null,"old"
  var re3 = new RegExp(',null,"' + escaped + '"', 'g');
  // In a style object: :"old"
  // These are more risky so we skip

  if (h.match(re1)) { h = h.replace(re1, ',__t("' + key + '","' + old + '"),'); count++; }
  if (h.match(re2)) { h = h.replace(re2, ',__t("' + key + '","' + old + '"))'); count++; }
  if (h.match(re3)) { h = h.replace(re3, ',null,__t("' + key + '","' + old + '")'); count++; }
}

// Dashboard card contents
replaceStr("Salah Log · Today", "salah_log");
replaceStr("Qur'an Log · Today", "quran_log");
replaceStr("Zikr · Today", "zikr_today");
replaceStr("Good Deeds · Today", "good_deeds_label");
replaceStr("Today's Balance", "todays_balance");
replaceStr("Deen", "deen_label");
replaceStr("Dunya", "dunya_label");
replaceStr("Balance", "balance_label");
replaceStr("Daily Score", "daily_score");
replaceStr("Prayers · Qur'an · Adhkār", "ring_subtitle");

// Day Ribbon labels
["Morning", "After Prayer", "Evening"].forEach(function(s, i) {
  var keys = ["morning_set", "after_prayer_set", "evening_set"];
  replaceStr(s, keys[i]);
});

// Deed names
[
  ["Fasting", "fasting_deed"],
  ["Sadaqah", "sadaqah_deed"],
  ["Tahajjud", "tahajjud_deed"],
  ["Learning", "learning_deed"],
  ["Helped someone", "helping_deed"],
  ["Recitation", "recitation_deed"]
].forEach(function(pair) {
  replaceStr(pair[0], pair[1]);
});

// Jasbih counter, reset
replaceStr("Tasbih Counter", "tasbih_counter");
replaceStr("Tap to Count", "tap_count");
replaceStr("Reset", "reset_btn");

// Hadith
replaceStr("Hadith of the Day", "hadith_day");

// Dua banner
replaceStr("Dua of the Day · Al-Baqarah 2:201", "dua_day");

// === Fix: ensure __t function exists globally ===
if (!h.includes("function __t(k,d)")) {
  h = h.replace(
    '<script>\n/**',
    '<script>function __t(k,d){var i=window.DDP_I18N;if(!i)return d||k;var r=i.t(k);return r!==k&&r?r:(d||k);}</script>\n<script>\n/**'
  );
}

fs.writeFileSync("../index.html", h, "utf8");
console.log("✅", count, "strings wrapped with __t()");
console.log("Size:", h.length);
