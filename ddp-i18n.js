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
    today_tab:          { en: "Today", ar: "اليوم", ur: "آج" },
    quran:              { en: "Qur'an", ar: "القرآن", ur: "قرآن" },
    prayer_times:       { en: "Prayer Times", ar: "مواقيت الصلاة", ur: "نماز کے اوقات" },
    azkar:              { en: "Adhkār", ar: "الأذكار", ur: "اذکار" },
    tasks:              { en: "Tasks", ar: "المهام", ur: "کام" },
    more:               { en: "More", ar: "المزيد", ur: "مزید" },
    settings:           { en: "Settings", ar: "الإعدادات", ur: "سیٹنگز" },
    hadith:             { en: "Hadith", ar: "الحديث", ur: "حدیث" },
    search_tab:         { en: "Search", ar: "بحث", ur: "تلاش" },
    qibla:              { en: "Qibla", ar: "القبلة", ur: "قبلہ" },
    tasbih:             { en: "tasbih", ar: "تسبيح", ur: "تسبیح" },
    deen:               { en: "Deen", ar: "الدين", ur: "دین" },
    dunya:              { en: "Dunya", ar: "الدنيا", ur: "دنیا" },
    tracked_deeds:      { en: "tracked deeds", ar: "الأعمال المتابَعة", ur: "ٹریک شدہ اعمال" },
    deeds_done_today:   { en: "deeds done today", ar: "أعمال أُنجزت اليوم", ur: "آج مکمل شدہ اعمال" },
    tap_to_log_deed:    { en: "Tap to log", ar: "اضغط للتسجيل", ur: "لاگ کرنے کے لیے ٹچ کریں" },

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
    tap_resume:         { en: "Tap to resume recitation", ar: "اضغط لاستئناف التلاوة", ur: "تلاوت جاری کرنے کے لیے ٹچ کریں" },

    /* ---- Added keys (Phase 2-4) ---- */
    salah_log:          { en: "Salah Log · Today", ur: "نماز کا لاگ · آج", ar: "سجل الصلاة · اليوم" },
    quran_log:          { en: "Qur'an Log · Today", ur: "قرآن لاگ · آج", ar: "سجل القرآن · اليوم" },
    zikr_today:         { en: "Zikr · Today", ur: "ذکر · آج", ar: "ذكر · اليوم" },
    good_deeds:         { en: "Good Deeds · Today", ur: "نیک اعمال · آج", ar: "الأعمال الصالحة · اليوم" },
    calc_method:        { en: "Calculation method", ur: "حساب کا طریقہ", ar: "طريقة الحساب" },
    verses:             { en: "verses", ur: "آیات", ar: "آيات" },
    min_read:           { en: "min read", ur: "منٹ مطالعہ", ar: "دقيقة قراءة" },
    goal:               { en: "goal", ur: "ہدف", ar: "الهدف" },
    tap_to_log:         { en: "verses · tap to log", ur: "آیات · لاگ کریں", ar: "آيات · اضغط للتسجيل" },
    preferences:        { en: "Preferences", ur: "ترجیحات", ar: "التفضيلات" },
    calculation_method: { en: "Calculation method", ur: "حساب کا طریقہ", ar: "طريقة الحساب" },
    auto_location:      { en: "Auto-detect location", ur: "خودکار مقام", ar: "تحديد الموقع تلقائياً" },
    own_times:          { en: "Use my own salat times", ur: "اپنے اوقات استعمال کریں", ar: "استخدم أوقاتي الخاصة" },
    custom_timetable:   { en: "Enter or import a custom timetable", ur: "اپنا ٹائم ٹیبل درج کریں", ar: "أدخل جدولاً مخصصاً" },
    adhan_iqama:        { en: "Adhan & Iqama Times", ur: "اذان و اقامت کے اوقات", ar: "أوقات الأذان والإقامة" },
    manual_times:       { en: "Set times manually", ur: "دستی اوقات", ar: "ضبط الأوقات يدوياً" },
    auto_times:         { en: "Using auto-calculated times", ur: "خودکار اوقات", ar: "استخدام الأوقات المحسوبة" },
    masjid_timetable:   { en: "Editing your masjid timetable", ur: "مسجد کا ٹائم ٹیبل", ar: "تعديل جدول المسجد" },
    adhan_audio:        { en: "Adhan & Audio", ur: "اذان اور آڈیو", ar: "الأذان والصوت" },
    makkah_adhan:       { en: "Makkah Adhan", ur: "مکہ اذان", ar: "أذان مكة" },
    auto_adhan:         { en: "Auto-play adhan at prayer time", ur: "نماز کے وقت خودکار اذان", ar: "تشغيل الأذان تلقائياً" },
    adhan_voice:        { en: "Adhan voice", ur: "اذان کی آواز", ar: "صوت الأذان" },
    default_qari:       { en: "Default Qāriʾ", ur: "پہلے سے طے شدہ قاری", ar: "القارئ الافتراضي" },
    verse_goal:         { en: "Daily verse goal", ur: "یومیہ آیات کا ہدف", ar: "الهدف اليومي من الآيات" },
    recite_reminder:    { en: "Recite reminder", ur: "تلاوت کی یاد دہانی", ar: "تذكير بالتلاوة" },
    nudge_recite:       { en: "Nudge me to recite 2 verses", ur: "2 آیات پڑھنے کی یاد دہانی", ar: "ذكرني بتلاوة آيتين" },
    reminder_time:      { en: "Reminder time", ur: "یاد دہانی کا وقت", ar: "وقت التذكير" },
    notifications:      { en: "Notifications", ur: "اطلاعات", ar: "الإشعارات" },
    appearance:         { en: "Appearance", ur: "ظاہریت", ar: "المظهر" },
    light:              { en: "Light", ur: "روشن", ar: "فاتح" },
    about:              { en: "About Deen o Dunya", ur: "دین و دنیا کے بارے میں", ar: "عن دين و دنيا" },
    support:            { en: "Support the App", ur: "ایپ کی مدد کریں", ar: "ادعم التطبيق" },
    remove_ads:         { en: "Remove Ads", ur: "اشتہارات ہٹائیں", ar: "إزالة الإعلانات" },
    one_time:           { en: "One-time purchase", ur: "یک وقتی خریداری", ar: "شراء لمرة واحدة" },
    tools_settings:     { en: "Tools & Settings", ur: "آلات اور ترتیبات", ar: "الأدوات والإعدادات" },
    more_label:         { en: "More", ur: "مزید", ar: "المزيد" },
    prayer_settings:    { en: "Prayer Settings", ur: "نماز کی ترتیبات", ar: "إعدادات الصلاة" },
    location_method:    { en: "Location & calculation method", ur: "مقام اور حساب", ar: "الموقع وطريقة الحساب" },
    daily_nourishment:  { en: "Daily Nourishment", ur: "یومیہ غذائیت", ar: "الغذاء اليومي" },
    quran_log_title:    { en: "Qur'an Log", ur: "قرآن لاگ", ar: "سجل القرآن" },
    reading_sessions:   { en: "Reading sessions & goals", ur: "مطالعہ سیشن اور اہداف", ar: "جلسات القراءة والأهداف" },
    morning_evening:    { en: "Morning, evening & tasbih", ur: "صبح، شام اور تسبیح", ar: "الصباح والمساء والتسبيح" },
    good_deeds_title:   { en: "Good Deeds", ur: "نیک اعمال", ar: "الأعمال الصالحة" },
    qibla_finder:       { en: "Qibla finder", ur: "قبلہ فائنڈر", ar: "محدد القبلة" },
    intentions:         { en: "Today's Intentions", ur: "آج کی نیتیں", ar: "نوايا اليوم" },
    tasks_title:        { en: "Tasks", ur: "کام", ar: "المهام" },
    al_quran:           { en: "Al-Qur'ān", ur: "القرآن", ar: "القرآن" },
    noble_quran:        { en: "The Noble Qur'ān · 114 Sūrahs", ur: "قرآن مجید · 114 سورتیں", ar: "القرآن الكريم · 114 سورة" },
    search_surah:       { en: "Search sūrah…", ur: "سورت تلاش کریں…", ar: "ابحث عن سورة…" },
    no_surah:           { en: "No sūrah found.", ur: "کوئی سورت نہیں ملی", ar: "لم يتم العثور على سورة" },
    morning_azkar:      { en: "Morning Adhkār", ur: "صبح کے اذکار", ar: "أذكار الصباح" },
    evening_azkar:      { en: "Evening Adhkār", ur: "شام کے اذکار", ar: "أذكار المساء" },
    about_desc:         { en: "A prayer-first daily planner for worship, reflection, and daily routine.", ur: "عبادت، غور و فکر اور روزمرہ معمولات کے لیے نماز پر مبنی روزانہ منصوبہ ساز۔", ar: "مخطط يومي قائم على الصلاة للعبادة والتأمل والروتين اليومي." },
    track_prayers:      { en: "Track your prayers", ur: "اپنی نمازوں کا ریکارڈ رکھیں", ar: "تتبع صلواتك" },
    salah_log_title:    { en: "Salah Log", ur: "نماز لاگ", ar: "سجل الصلاة" },
    track_reading:      { en: "Track your reading", ur: "اپنی تلاوت کا ریکارڈ رکھیں", ar: "تتبع قراءتك" },
    daily_amal:         { en: "Daily 'amal", ur: "یومیہ عمل", ar: "العمل اليومي" },
    todays_balance:     { en: "Today's Balance", ur: "آج کا توازن", ar: "توازن اليوم" },
    salah_times:        { en: "Salah Times", ur: "نماز کے اوقات", ar: "أوقات الصلاة" },
    hadith_day:         { en: "Hadith of the Day", ur: "آج کی حدیث", ar: "حديث اليوم" },
    tasbih_counter:     { en: "Tasbih Counter", ur: "تسبیح کاؤنٹر", ar: "عداد التسبيح" },
    reset:              { en: "Reset", ur: "ری سیٹ", ar: "إعادة" },
    tap_count:          { en: "Tap to Count", ur: "گننے کے لیے ٹیپ کریں", ar: "اضغط للعد" },
    sunrise_label:      { en: "Sunrise", ur: "طلوع آفتاب", ar: "الشروق" },
    sunset_label:       { en: "Sunset", ur: "غروب آفتاب", ar: "الغروب" },
    qibla_compass:      { en: "Qibla Compass", ur: "قبلہ کمپاس", ar: "بوصلة القبلة" },
    onboard_lang:       { en: "Choose language", ur: "زبان منتخب کریں", ar: "اختر اللغة" },
    onboard_city:       { en: "Select your city", ur: "اپنا شہر منتخب کریں", ar: "اختر مدينتك" },
    onboard_ready:      { en: "You're all set!", ur: "سب تیار ہے!", ar: "أنت جاهز!" },
    onboard_subtitle:   { en: "Your prayer times are ready.", ur: "آپ کے نماز کے اوقات تیار ہیں", ar: "أوقات صلاتك جاهزة" },
    start_app:          { en: "Start using the app", ur: "ایپ استعمال شروع کریں", ar: "ابدأ استخدام التطبيق" },
    search_city:        { en: "Search city…", ur: "شہر تلاش کریں…", ar: "ابحث عن مدينة…" },
    off:                { en: "Off", ur: "بند", ar: "مغلق" },
    on:                 { en: "On", ur: "آن", ar: "مفتوح" },

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

    Today:        { en: "Today",       ur: "آج",         ar: "اليوم" },
    Quran:        { en: "Qur'an",      ur: "قرآن",       ar: "القرآن" },
    Tafsir:       { en: "Tafsir",      ur: "تفسیر",      ar: "التفسير" },
    Hadith:       { en: "Hadith",      ur: "حدیث",       ar: "الحديث" },
    Qibla:        { en: "Qibla",       ur: "قبلہ",       ar: "القبلة" },
    Azkar:        { en: "Azkar",       ur: "اذکار",      ar: "الأذكار" },
    More:         { en: "More",        ur: "مزید",       ar: "المزيد" },
    "Salah Log":  { en: "Salah Log · Today", ur: "نماز لاگ · آج", ar: "سجل الصلاة · اليوم" },
    "Quran Log":  { en: "Qur'an Log · Today", ur: "قرآن لاگ · آج", ar: "سجل القرآن · اليوم" },
    Zikr:         { en: "Zikr · Today", ur: "ذکر · آج", ar: "ذكر · اليوم" },
    "Good Deeds": { en: "Good Deeds · Today", ur: "نیک اعمال · آج", ar: "الأعمال الصالحة · اليوم" },
    English:      { en: "English",     ur: "English",    ar: "English" },
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
