/* Deen o Dunya Planner — Kids Mode (ddp-kids.js)
   Exposes: window.DDP_KIDS

   A simplified, larger, gentler mode for children (roughly ages 4–10) and for
   elderly users who want maximum simplicity. When active:
   - Bigger everything (text scale forced high), fewer options, no ads (see note),
     no tasks/planner complexity — just the essentials with encouragement.
   - Curated, short, verified content only: short surahs, a small set of daily
     duas every child learns, the 5 prayers with simple visuals.
   - A gentle reward: filling the day's simple ring shows a star + du'a, never
     points/leaderboards (spiritually inappropriate; also our stated design rule).

   NOTE ON ADS: In kids mode, banners should be OFF regardless of purchase state.
   Showing ads in a child-directed context also triggers stricter Play/AdMob
   families policy. The ad guard checks DDP_KIDS.isActive() and suppresses ads.

   CONTENT SET (all short, universally taught, low controversy):
   - Surahs: Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kawthar, Al-Asr, Al-Fil,
     Quraysh, Al-Ma'un, Al-Kafirun, An-Nasr, Al-Masad, Al-Lahab (the short mufassal).
   - Daily duas: waking, sleeping, eating (before/after), bathroom (in/out),
     leaving home, entering home, before wudu, riding transport. (Widely agreed,
     from Hisnul Muslim-type collections — verify translations before shipping.)
*/
(function () {
  var LS_KEY = "ddp_kids_mode";
  var LS_PIN = "ddp_kids_pin"; // optional parent PIN to exit kids mode

  var KIDS_SURAHS = [1, 112, 113, 114, 108, 103, 105, 106, 107, 109, 110, 111, 102, 97, 94, 93];

  var KIDS_DUAS = [
    { id: "waking",     en: "Waking up",        ar: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور" },
    { id: "sleeping",   en: "Before sleeping",  ar: "باسمك اللهم أموت وأحيا" },
    { id: "eating_pre", en: "Before eating",    ar: "بسم الله" },
    { id: "eating_post",en: "After eating",     ar: "الحمد لله الذي أطعمني هذا ورزقنيه" },
    { id: "home_leave", en: "Leaving home",     ar: "بسم الله توكلت على الله ولا حول ولا قوة إلا بالله" },
    { id: "home_enter", en: "Entering home",    ar: "بسم الله ولجنا وبسم الله خرجنا وعلى ربنا توكلنا" },
    { id: "wc_enter",   en: "Entering bathroom",ar: "اللهم إني أعوذ بك من الخبث والخبائث" },
    { id: "wc_exit",    en: "Leaving bathroom", ar: "غفرانك" },
    { id: "travel",     en: "Riding/travelling",ar: "سبحان الذي سخر لنا هذا وما كنا له مقرنين" }
  ];

  function isActive() { return localStorage.getItem(LS_KEY) === "1"; }

  function enable() {
    localStorage.setItem(LS_KEY, "1");
    // Force large text + reduced complexity
    localStorage.setItem("ddp_text_scale", "1.3");
    try { window.dispatchEvent(new CustomEvent("ddp:kidschange", { detail: { active: true } })); } catch (e) {}
  }

  function disable(pin) {
    var set = localStorage.getItem(LS_PIN);
    if (set && set !== pin) return false; // wrong PIN
    localStorage.setItem(LS_KEY, "0");
    try { window.dispatchEvent(new CustomEvent("ddp:kidschange", { detail: { active: false } })); } catch (e) {}
    return true;
  }

  function setPin(pin) {
    if (pin && /^\d{4}$/.test(pin)) { localStorage.setItem(LS_PIN, pin); return true; }
    return false;
  }
  function hasPin() { return !!localStorage.getItem(LS_PIN); }

  /* Simplified daily ring for kids: 5 prayers + 1 surah read + 1 dua learned = 7,
     but shown as gentle stars, not a score. */
  function kidsRingModel(dayRecord) {
    var prayers = ["fajr","dhuhr","asr","maghrib","isha"].filter(function (p) {
      return dayRecord && dayRecord.prayers && dayRecord.prayers[p];
    }).length;
    var quran = dayRecord && dayRecord.quran ? 1 : 0;
    var dua = dayRecord && dayRecord.morning ? 1 : 0; // reuse morning slot as "dua learned"
    var done = prayers + quran + dua;
    return { done: done, total: 7, complete: done === 7 };
  }

  window.DDP_KIDS = {
    isActive: isActive,
    enable: enable,
    disable: disable,
    setPin: setPin,
    hasPin: hasPin,
    KIDS_SURAHS: KIDS_SURAHS,
    KIDS_DUAS: KIDS_DUAS,
    kidsRingModel: kidsRingModel
  };
})();
