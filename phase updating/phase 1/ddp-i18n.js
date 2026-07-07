/* Deen o Dunya Planner — i18n string table (ddp-i18n.js)
   Exposes: window.DDP_I18N

   Usage in inline script:
     const t = DDP_I18N.t;          // translate: t("next_prayer") => "اگلی نماز" in UR
     const dir = DDP_I18N.dir();    // "rtl" or "ltr"
     const lang = DDP_I18N.lang();  // "en" | "ar" | "ur"
     DDP_I18N.setLang("ur");        // save + apply RTL to document
*/
(function () {
  var LS_KEY = "ddp_lang";

  var STRINGS = {
    /* ---- App shell ---- */
    app_name:           { en: "Deen o Dunya", ar: "دين و دنيا", ur: "دین و دنیا" },
    dashboard:          { en: "Dashboard", ar: "الرئيسية", ur: "ڈیش بورڈ" },
    quran:              { en: "Qur'an", ar: "القرآن", ur: "قرآن" },
    prayer_times:       { en: "Prayer Times", ar: "مواقيت الصلاة", ur: "نماز کے اوقات" },
    azkar:              { en: "Adhkār", ar: "الأذكار", ur: "اذکار" },
    tasks:              { en: "Tasks", ar: "المهام", ur: "کام" },
    more:               { en: "More", ar: "المزيد", ur: "مزید" },
    settings:           { en: "Settings", ar: "الإعدادات", ur: "سیٹنگز" },

    /* ---- Onboarding ---- */
    onboard_lang:       { en: "Choose language", ar: "اختر اللغة", ur: "زبان منتخب کریں" },
    onboard_city:       { en: "Select your city", ar: "اختر مدينتك", ur: "اپنا شہر منتخب کریں" },
    onboard_ready:      { en: "You're all set!", ar: "أنت جاهز!", ur: "سب تیار ہے!" },
    onboard_subtitle:   { en: "Your prayer times are ready.", ar: "مواقيت الصلاة جاهزة.", ur: "آپ کے نماز کے اوقات تیار ہیں۔" },
    search_city:        { en: "Search city…", ar: "ابحث عن مدينة…", ur: "شہر تلاش کریں…" },

    /* ---- Dashboard ---- */
    next_prayer:        { en: "Next Prayer", ar: "الصلاة القادمة", ur: "اگلی نماز" },
    todays_salah:       { en: "Today's Ṣalāh", ar: "صلاة اليوم", ur: "آج کی نماز" },
    todays_quran:       { en: "Today's Qur'an", ar: "قرآن اليوم", ur: "آج کا قرآن" },
    todays_azkar:       { en: "Today's Adhkār", ar: "أذكار اليوم", ur: "آج کے اذکار" },
    daily_score:        { en: "Daily Score", ar: "نقاط اليوم", ur: "آج کا اسکور" },
    streak:             { en: "Day Streak", ar: "سلسلة الأيام", ur: "مسلسل دن" },
    complete:           { en: "Complete!", ar: "أكملت اليوم!", ur: "مکمل!" },
    alhamdulillah:      { en: "Alḥamdulillāh", ar: "الحمد لله", ur: "الحمدللہ" },
    day_of:             { en: "Day {n} of {total}", ar: "اليوم {n} من {total}", ur: "دن {n} از {total}" },

    /* ---- Prayers ---- */
    fajr:               { en: "Fajr", ar: "الفجر", ur: "فجر" },
    dhuhr:              { en: "Dhuhr", ar: "الظهر", ur: "ظہر" },
    asr:                { en: "Asr", ar: "العصر", ur: "عصر" },
    maghrib:            { en: "Maghrib", ar: "المغرب", ur: "مغرب" },
    isha:               { en: "Isha", ar: "العشاء", ur: "عشاء" },
    sunrise:            { en: "Sunrise", ar: "الشروق", ur: "طلوع آفتاب" },
    prayed:             { en: "Prayed ✓", ar: "صُلِّيت ✓", ur: "پڑھی ✓" },
    mark_prayed:        { en: "Tap to mark as prayed", ar: "اضغط للتأكيد", ur: "نماز پڑھنے کے بعد ٹچ کریں" },

    /* ---- Qur'an ---- */
    surah:              { en: "Sūrah", ar: "سورة", ur: "سورۃ" },
    ayah:               { en: "Āyah", ar: "آية", ur: "آیت" },
    translation:        { en: "Translation", ar: "الترجمة", ur: "ترجمہ" },
    tafsir:             { en: "Tafsīr", ar: "التفسير", ur: "تفسیر" },
    download:           { en: "Download Sūrah", ar: "تحميل السورة", ur: "سورۃ ڈاؤنلوڈ کریں" },
    downloading:        { en: "Downloading…", ar: "جارٍ التحميل…", ur: "ڈاؤنلوڈ ہو رہا ہے…" },
    downloaded:         { en: "Available offline ✓", ar: "متاح دون إنترنت ✓", ur: "آف لائن دستیاب ✓" },
    storage_full:       { en: "Storage full. Remove a downloaded sūrah first.", ar: "التخزين ممتلئ. احذف سورة أولاً.", ur: "اسٹوریج بھر گئی ہے۔ پہلے کوئی سورۃ ہٹائیں۔" },
    khatm_prompt:       { en: "How would you like to finish the Qur'an?", ar: "كيف تريد إتمام القرآن؟", ur: "آپ قرآن کب تک ختم کرنا چاہتے ہیں؟" },
    khatm_30d:          { en: "30 days", ar: "٣٠ يوماً", ur: "۳۰ دن" },
    khatm_90d:          { en: "3 months", ar: "٣ أشهر", ur: "۳ مہینے" },
    khatm_1y:           { en: "1 year", ar: "سنة", ur: "۱ سال" },
    khatm_own:          { en: "My own pace", ar: "حسب وتيرتي", ur: "اپنی رفتار سے" },
    continue_reading:   { en: "Continue reading", ar: "متابعة القراءة", ur: "پڑھنا جاری رکھیں" },
    today_portion:      { en: "Today's portion", ar: "حصة اليوم", ur: "آج کا حصہ" },

    /* ---- Adhkār ---- */
    morning_azkar:      { en: "Morning Adhkār", ar: "أذكار الصباح", ur: "صبح کے اذکار" },
    evening_azkar:      { en: "Evening Adhkār", ar: "أذكار المساء", ur: "شام کے اذکار" },
    done:               { en: "Done", ar: "تم", ur: "مکمل" },
    count_left:         { en: "{n} left", ar: "تبقى {n}", ur: "{n} باقی" },

    /* ---- Settings ---- */
    language:           { en: "Language", ar: "اللغة", ur: "زبان" },
    city:               { en: "City & Location", ar: "المدينة والموقع", ur: "شہر اور مقام" },
    calc_method:        { en: "Calculation Method", ar: "طريقة الحساب", ur: "حساب کا طریقہ" },
    asr_method:         { en: "Asr Juristic Method", ar: "الفقه في العصر", ur: "عصر کا فقہی طریقہ" },
    text_size:          { en: "Text Size", ar: "حجم النص", ur: "حروف کا سائز" },
    text_normal:        { en: "Normal", ar: "عادي", ur: "معمول" },
    text_large:         { en: "Large", ar: "كبير", ur: "بڑا" },
    text_xlarge:        { en: "Extra Large", ar: "كبير جداً", ur: "بہت بڑا" },
    notifications:      { en: "Prayer Notifications", ar: "إشعارات الصلاة", ur: "نماز کی اطلاعات" },
    adhan_sound:        { en: "Adhan Sound", ar: "صوت الأذان", ur: "اذان کی آواز" },
    hijri_offset:       { en: "Hijri Date Adjustment", ar: "تعديل التاريخ الهجري", ur: "ہجری تاریخ ایڈجسٹمنٹ" },
    about:              { en: "About", ar: "عن التطبيق", ur: "ایپ کے بارے میں" },
    version:            { en: "Version", ar: "الإصدار", ur: "ورژن" },

    /* ---- Occasions ---- */
    today:              { en: "Today", ar: "اليوم", ur: "آج" },
    tomorrow:           { en: "Tomorrow", ar: "غداً", ur: "کل" },
    in_n_days:          { en: "In {n} days", ar: "بعد {n} أيام", ur: "{n} دن بعد" },

    /* ---- Errors / states ---- */
    offline:            { en: "You're offline", ar: "أنت غير متصل", ur: "آف لائن ہیں" },
    offline_sub:        { en: "Downloaded content still works.", ar: "المحتوى المحفوظ متاح.", ur: "ڈاؤنلوڈ شدہ مواد دستیاب ہے۔" },
    loading:            { en: "Loading…", ar: "جارٍ التحميل…", ur: "لوڈ ہو رہا ہے…" },
    error_load:         { en: "Couldn't load. Tap to retry.", ar: "تعذّر التحميل. اضغط للمحاولة.", ur: "لوڈ نہ ہو سکا۔ دوبارہ کوشش کریں۔" },
    tap_resume:         { en: "Tap to resume recitation", ar: "اضغط لاستئناف التلاوة", ur: "تلاوت جاری کرنے کے لیے ٹچ کریں" }
  };

  function lang() {
    try { return localStorage.getItem(LS_KEY) || "en"; } catch (e) { return "en"; }
  }

  function dir() { var l = lang(); return (l === "ar" || l === "ur") ? "rtl" : "ltr"; }

  function t(key, vars) {
    var l = lang();
    var entry = STRINGS[key];
    if (!entry) return key;
    var str = entry[l] || entry.en || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
      });
    }
    return str;
  }

  function setLang(l) {
    if (l !== "en" && l !== "ar" && l !== "ur") return;
    try { localStorage.setItem(LS_KEY, l); } catch (e) {}
    apply();
  }

  /* Apply direction and lang attributes to document root */
  function apply() {
    var l = lang();
    var d = dir();
    document.documentElement.lang = l;
    document.documentElement.dir = d;
    /* Update manifest lang hint for PWA */
    var ml = document.querySelector("link[rel=manifest]");
    if (ml) { /* manifest lang is static; nothing to update at runtime */ }
    /* Fire a custom event so React/the app knows to re-render */
    try { window.dispatchEvent(new CustomEvent("ddp:langchange", { detail: { lang: l, dir: d } })); } catch(e) {}
  }

  /* Call on boot — ensures doc dir matches saved lang even before React mounts */
  apply();

  window.DDP_I18N = { t: t, lang: lang, dir: dir, setLang: setLang, apply: apply, STRINGS: STRINGS };
})();
