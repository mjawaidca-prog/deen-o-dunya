/* Deen o Dunya Planner — Hijri Date Calculator (ddp-hijri.js)
   Fully offline — no API call, no CDN.
   Algorithm: Kuwaiti algorithm (used by most Islamic apps and the Gulf standard),
   with a user-configurable offset of -1/0/+1/+2 days for regional moon-sighting
   conventions (Pakistan Ruet-e-Hilal typically = Gulf -0 to +1 day).
   Exposes: window.DDP_HIJRI
*/
(function () {
  var LS_OFFSET = "ddp_hijri_offset";

  var HIJRI_MONTHS_EN = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"
  ];
  var HIJRI_MONTHS_AR = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];
  var HIJRI_MONTHS_UR = [
    "محرم", "صفر", "ربیع الاول", "ربیع الآخر",
    "جمادی الاول", "جمادی الآخر", "رجب", "شعبان",
    "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"
  ];
  var DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var DAYS_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  var DAYS_UR = ["اتوار","سوموار","منگل","بدھ","جمعرات","جمعہ","ہفتہ"];

  /* Kuwaiti algorithm */
  function gregorianToHijri(gDate) {
    var offset = getOffset();
    var d = new Date(gDate.getTime() + offset * 86400000);

    var Y = d.getFullYear();
    var M = d.getMonth() + 1;
    var D = d.getDate();

    if (M < 3) { Y -= 1; M += 12; }
    var A = Math.floor(Y / 100);
    var B = 2 - A + Math.floor(A / 4);
    var JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;

    var Z = Math.floor(JD - 1948438.5 + 0.5);
    var A2 = Math.floor((Z - 122.1) / 365.25);
    var B2 = Z - Math.floor(365.25 * A2);
    var C  = Math.floor(B2 / 30.6001);

    var hD = B2 - Math.floor(30.6001 * C);
    var hM = C === 14 || C === 15 ? C - 13 : C - 1;
    var hY = A2 - (hM <= 2 ? 4716 : 4715);

    return { year: hY, month: hM, day: hD, dow: d.getDay() };
  }

  function getOffset() {
    try { return parseInt(localStorage.getItem(LS_OFFSET) || "0", 10); } catch (e) { return 0; }
  }

  function setOffset(n) {
    try { localStorage.setItem(LS_OFFSET, String(Math.max(-2, Math.min(2, n)))); } catch (e) {}
  }

  function format(gDate, lang, opts) {
    var h = gregorianToHijri(gDate || new Date());
    opts = opts || {};
    var months = lang === "ar" ? HIJRI_MONTHS_AR : (lang === "ur" ? HIJRI_MONTHS_UR : HIJRI_MONTHS_EN);
    var days   = lang === "ar" ? DAYS_AR : (lang === "ur" ? DAYS_UR : DAYS_EN);
    var monthName = months[h.month - 1];
    var dayName   = days[h.dow];

    if (opts.short) return h.day + " " + monthName + " " + h.year + " AH";
    if (lang === "ur" || lang === "ar") {
      return dayName + "، " + h.day + " " + monthName + " " + h.year;
    }
    return dayName + ", " + h.day + " " + monthName + " " + h.year + " AH";
  }

  /* Detect upcoming Islamic occasions (within next 30 days) */
  function upcomingOccasions(fromDate) {
    var occasions = [
      { month: 1,  day: 1,  en: "Islamic New Year", ur: "اسلامی نیا سال", ar: "رأس السنة الهجرية" },
      { month: 1,  day: 10, en: "Day of Ashura", ur: "یوم عاشورہ", ar: "يوم عاشوراء" },
      { month: 3,  day: 12, en: "Mawlid al-Nabi ﷺ", ur: "عید میلاد النبی ﷺ", ar: "المولد النبوي الشريف" },
      { month: 7,  day: 27, en: "Laylat al-Mi'raj", ur: "شب معراج", ar: "ليلة المعراج" },
      { month: 8,  day: 15, en: "Laylat al-Bara'ah", ur: "شب برات", ar: "ليلة النصف من شعبان" },
      { month: 9,  day: 1,  en: "Ramadan begins", ur: "رمضان المبارک", ar: "بداية رمضان" },
      { month: 9,  day: 27, en: "Laylat al-Qadr (approx.)", ur: "شب قدر", ar: "ليلة القدر" },
      { month: 10, day: 1,  en: "Eid al-Fitr", ur: "عید الفطر", ar: "عيد الفطر" },
      { month: 12, day: 9,  en: "Day of Arafah", ur: "یوم عرفہ", ar: "يوم عرفة" },
      { month: 12, day: 10, en: "Eid al-Adha", ur: "عید الاضحیٰ", ar: "عيد الأضحى" }
    ];

    var results = [];
    for (var ahead = 0; ahead <= 30; ahead++) {
      var d = new Date(fromDate || new Date());
      d.setDate(d.getDate() + ahead);
      var h = gregorianToHijri(d);
      occasions.forEach(function (occ) {
        if (occ.month === h.month && occ.day === h.day) {
          results.push({ daysAway: ahead, occasion: occ, hijri: h, gregorian: d });
        }
      });
    }
    return results;
  }

  window.DDP_HIJRI = {
    convert: gregorianToHijri,
    format: format,
    getOffset: getOffset,
    setOffset: setOffset,
    upcomingOccasions: upcomingOccasions,
    months: { en: HIJRI_MONTHS_EN, ar: HIJRI_MONTHS_AR, ur: HIJRI_MONTHS_UR }
  };
})();
