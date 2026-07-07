const fs = require("fs");
let d = fs.readFileSync("../ddp-i18n.js", "utf8");
var strEnd = d.indexOf("};");
var keys = `
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
`;
d = d.substring(0, strEnd) + keys + d.substring(strEnd);
fs.writeFileSync("../ddp-i18n.js", d, "utf8");
console.log("Done. Size:", d.length);
