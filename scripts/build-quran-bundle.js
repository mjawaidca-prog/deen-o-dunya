#!/usr/bin/env node
/*  Deen o Dunya Planner — Qur'an Bundle Generator
    scripts/build-quran-bundle.js

    WHAT IT DOES
    -----------
    Downloads the complete Qur'an text (Arabic Uthmani, Sahih International English,
    Jalandhry Urdu) from the alquran.cloud API (data originally from tanzil.net —
    public domain / CC BY ND), then writes a compact, pre-gzipped bundle that ships
    inside the app. The full bundle is ~2.8 MB gzipped, growing the APK by ~3 MB.

    This replaces the per-surah runtime fetches that currently fail on low connectivity.

    HOW TO RUN
    ----------
    Run once at build time (not at app runtime):
      node scripts/build-quran-bundle.js

    Outputs:
      dist/quran-bundle.json.gz   -- shipped in app assets
      dist/quran-index.json       -- surah metadata (small, ~8 KB)
      src/quran-bundle-check.txt  -- checksum for integrity verification

    INTEGRATION
    -----------
    In the app boot sequence (ddp-db.js migrateLegacy), after migration, check:
      if (!(await DDP_DB.get("kv","bundle_loaded"))) { await loadBundle(); }

    loadBundle() (add to inline script or new ddp-loader.js):
      async function loadBundle() {
        const r = await fetch("./quran-bundle.json.gz");
        // The browser decompresses gzip automatically when served with correct headers.
        // In Capacitor WebView + local files, fetch of .gz works natively.
        const data = await r.json();
        for (const [surahNum, surah] of Object.entries(data.surahs)) {
          await DDP_DB.set("quran", parseInt(surahNum), surah);
        }
        await DDP_DB.set("kv", "bundle_loaded", { at: Date.now(), version: data.version });
      }

    LICENSES
    --------
    - Arabic text: tanzil.net Uthmani (CC BY ND 3.0) - attribution required
    - Sahih International: © Saheeh International — free for non-commercial use.
      For commercial use, contact the publisher.
    - Jalandhry Urdu: public domain.
    Attribution string (place in About screen):
      "Arabic text: tanzil.net (CC BY ND 3.0). English: Saheeh International.
       Urdu: Fateh Muhammad Jalandhry."
*/

const https = require("https");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DIST = path.join(__dirname, "../dist");
const OUT_BUNDLE = path.join(DIST, "quran-bundle.json.gz");
const OUT_INDEX  = path.join(DIST, "quran-index.json");
const OUT_CHECK  = path.join(__dirname, "../src/quran-bundle-check.txt");
const BUNDLE_VERSION = "1.0.0";

// Source edition identifiers from alquran.cloud
const EDITIONS = {
  ar: "quran-uthmani",       // Arabic Uthmani
  en: "en.sahih",            // Sahih International
  ur: "ur.jalandhry"         // Jalandhry Urdu
};

const SURAH_META = [
  // [number, name_ar, name_en, name_transliteration, ayah_count, revelation, juz_start]
  [1,"الفاتحة","The Opening","Al-Fatihah",7,"Meccan",1],
  [2,"البقرة","The Cow","Al-Baqarah",286,"Medinan",1],
  [3,"آل عمران","Family of Imran","Aali Imran",200,"Medinan",3],
  [4,"النساء","The Women","An-Nisa",176,"Medinan",4],
  [5,"المائدة","The Table Spread","Al-Ma'idah",120,"Medinan",6],
  [6,"الأنعام","The Cattle","Al-An'am",165,"Meccan",7],
  [7,"الأعراف","The Heights","Al-A'raf",206,"Meccan",8],
  [8,"الأنفال","The Spoils of War","Al-Anfal",75,"Medinan",9],
  [9,"التوبة","The Repentance","At-Tawbah",129,"Medinan",10],
  [10,"يونس","Jonah","Yunus",109,"Meccan",11],
  [11,"هود","Hud","Hud",123,"Meccan",11],
  [12,"يوسف","Joseph","Yusuf",111,"Meccan",12],
  [13,"الرعد","The Thunder","Ar-Ra'd",43,"Medinan",13],
  [14,"إبراهيم","Abraham","Ibrahim",52,"Meccan",13],
  [15,"الحجر","The Rocky Tract","Al-Hijr",99,"Meccan",14],
  [16,"النحل","The Bee","An-Nahl",128,"Meccan",14],
  [17,"الإسراء","The Night Journey","Al-Isra",111,"Meccan",15],
  [18,"الكهف","The Cave","Al-Kahf",110,"Meccan",15],
  [19,"مريم","Mary","Maryam",98,"Meccan",16],
  [20,"طه","Ta-Ha","Ta-Ha",135,"Meccan",16],
  [21,"الأنبياء","The Prophets","Al-Anbiya",112,"Meccan",17],
  [22,"الحج","The Pilgrimage","Al-Hajj",78,"Medinan",17],
  [23,"المؤمنون","The Believers","Al-Mu'minun",118,"Meccan",18],
  [24,"النور","The Light","An-Nur",64,"Medinan",18],
  [25,"الفرقان","The Criterion","Al-Furqan",77,"Meccan",18],
  [26,"الشعراء","The Poets","Ash-Shu'ara",227,"Meccan",19],
  [27,"النمل","The Ant","An-Naml",93,"Meccan",19],
  [28,"القصص","The Stories","Al-Qasas",88,"Meccan",20],
  [29,"العنكبوت","The Spider","Al-Ankabut",69,"Meccan",20],
  [30,"الروم","The Romans","Ar-Rum",60,"Meccan",21],
  [31,"لقمان","Luqman","Luqman",34,"Meccan",21],
  [32,"السجدة","The Prostration","As-Sajdah",30,"Meccan",21],
  [33,"الأحزاب","The Clans","Al-Ahzab",73,"Medinan",21],
  [34,"سبإ","Sheba","Saba",54,"Meccan",22],
  [35,"فاطر","Originator","Fatir",45,"Meccan",22],
  [36,"يس","Ya Sin","Ya-Sin",83,"Meccan",22],
  [37,"الصافات","Those who set the Ranks","As-Saffat",182,"Meccan",23],
  [38,"ص","The Letter Sad","Sad",88,"Meccan",23],
  [39,"الزمر","The Troops","Az-Zumar",75,"Meccan",23],
  [40,"غافر","The Forgiver","Ghafir",85,"Meccan",24],
  [41,"فصلت","Explained in Detail","Fussilat",54,"Meccan",24],
  [42,"الشورى","The Consultation","Ash-Shura",53,"Meccan",25],
  [43,"الزخرف","The Ornaments of Gold","Az-Zukhruf",89,"Meccan",25],
  [44,"الدخان","The Smoke","Ad-Dukhan",59,"Meccan",25],
  [45,"الجاثية","The Crouching","Al-Jathiyah",37,"Meccan",25],
  [46,"الأحقاف","The Wind-Curved Sandhills","Al-Ahqaf",35,"Meccan",26],
  [47,"محمد","Muhammad","Muhammad",38,"Medinan",26],
  [48,"الفتح","The Victory","Al-Fath",29,"Medinan",26],
  [49,"الحجرات","The Rooms","Al-Hujurat",18,"Medinan",26],
  [50,"ق","The Letter Qaf","Qaf",45,"Meccan",26],
  [51,"الذاريات","The Winnowing Winds","Adh-Dhariyat",60,"Meccan",27],
  [52,"الطور","The Mount","At-Tur",49,"Meccan",27],
  [53,"النجم","The Star","An-Najm",62,"Meccan",27],
  [54,"القمر","The Moon","Al-Qamar",55,"Meccan",27],
  [55,"الرحمن","The Beneficent","Ar-Rahman",78,"Medinan",27],
  [56,"الواقعة","The Inevitable","Al-Waqi'ah",96,"Meccan",27],
  [57,"الحديد","The Iron","Al-Hadid",29,"Medinan",27],
  [58,"المجادلة","The Pleading Woman","Al-Mujadila",22,"Medinan",28],
  [59,"الحشر","The Exile","Al-Hashr",24,"Medinan",28],
  [60,"الممتحنة","She that is to be Examined","Al-Mumtahanah",13,"Medinan",28],
  [61,"الصف","The Ranks","As-Saf",14,"Medinan",28],
  [62,"الجمعة","Friday","Al-Jumu'ah",11,"Medinan",28],
  [63,"المنافقون","The Hypocrites","Al-Munafiqun",11,"Medinan",28],
  [64,"التغابن","Mutual Disillusion","At-Taghabun",18,"Medinan",28],
  [65,"الطلاق","Divorce","At-Talaq",12,"Medinan",28],
  [66,"التحريم","The Prohibition","At-Tahrim",12,"Medinan",28],
  [67,"الملك","The Sovereignty","Al-Mulk",30,"Meccan",29],
  [68,"القلم","The Pen","Al-Qalam",52,"Meccan",29],
  [69,"الحاقة","The Reality","Al-Haqqah",52,"Meccan",29],
  [70,"المعارج","The Ascending Stairways","Al-Ma'arij",44,"Meccan",29],
  [71,"نوح","Noah","Nuh",28,"Meccan",29],
  [72,"الجن","The Jinn","Al-Jinn",28,"Meccan",29],
  [73,"المزمل","The Enshrouded One","Al-Muzzammil",20,"Meccan",29],
  [74,"المدثر","The Cloaked One","Al-Muddaththir",56,"Meccan",29],
  [75,"القيامة","The Resurrection","Al-Qiyamah",40,"Meccan",29],
  [76,"الإنسان","Man","Al-Insan",31,"Medinan",29],
  [77,"المرسلات","The Emissaries","Al-Mursalat",50,"Meccan",29],
  [78,"النبإ","The Tidings","An-Naba",40,"Meccan",30],
  [79,"النازعات","Those who drag forth","An-Nazi'at",46,"Meccan",30],
  [80,"عبس","He Frowned","Abasa",42,"Meccan",30],
  [81,"التكوير","The Overthrowing","At-Takwir",29,"Meccan",30],
  [82,"الانفطار","The Cleaving","Al-Infitar",19,"Meccan",30],
  [83,"المطففين","The Defrauding","Al-Mutaffifin",36,"Meccan",30],
  [84,"الانشقاق","The Sundering","Al-Inshiqaq",25,"Meccan",30],
  [85,"البروج","The Mansions of the Stars","Al-Buruj",22,"Meccan",30],
  [86,"الطارق","The Nightcomer","At-Tariq",17,"Meccan",30],
  [87,"الأعلى","The Most High","Al-A'la",19,"Meccan",30],
  [88,"الغاشية","The Overwhelming","Al-Ghashiyah",26,"Meccan",30],
  [89,"الفجر","The Dawn","Al-Fajr",30,"Meccan",30],
  [90,"البلد","The City","Al-Balad",20,"Meccan",30],
  [91,"الشمس","The Sun","Ash-Shams",15,"Meccan",30],
  [92,"الليل","The Night","Al-Layl",21,"Meccan",30],
  [93,"الضحى","The Morning Hours","Ad-Duhaa",11,"Meccan",30],
  [94,"الشرح","The Relief","Ash-Sharh",8,"Meccan",30],
  [95,"التين","The Fig","At-Tin",8,"Meccan",30],
  [96,"العلق","The Clot","Al-Alaq",19,"Meccan",30],
  [97,"القدر","The Power","Al-Qadr",5,"Meccan",30],
  [98,"البينة","The Clear Proof","Al-Bayyinah",8,"Medinan",30],
  [99,"الزلزلة","The Earthquake","Az-Zalzalah",8,"Medinan",30],
  [100,"العاديات","The Courser","Al-Adiyat",11,"Meccan",30],
  [101,"القارعة","The Calamity","Al-Qari'ah",11,"Meccan",30],
  [102,"التكاثر","The Rivalry in World Increase","At-Takathur",8,"Meccan",30],
  [103,"العصر","The Declining Day","Al-Asr",3,"Meccan",30],
  [104,"الهمزة","The Traducer","Al-Humazah",9,"Meccan",30],
  [105,"الفيل","The Elephant","Al-Fil",5,"Meccan",30],
  [106,"قريش","Quraysh","Quraysh",4,"Meccan",30],
  [107,"الماعون","The Small Kindnesses","Al-Ma'un",7,"Meccan",30],
  [108,"الكوثر","The Abundance","Al-Kawthar",3,"Meccan",30],
  [109,"الكافرون","The Disbelievers","Al-Kafirun",6,"Meccan",30],
  [110,"النصر","The Divine Support","An-Nasr",3,"Medinan",30],
  [111,"المسد","The Palm Fiber","Al-Masad",5,"Meccan",30],
  [112,"الإخلاص","The Sincerity","Al-Ikhlas",4,"Meccan",30],
  [113,"الفلق","The Daybreak","Al-Falaq",5,"Meccan",30],
  [114,"الناس","Mankind","An-Nas",6,"Meccan",30]
];

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("JSON parse failed for " + url + ": " + e.message)); }
      });
    }).on("error", reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadEdition(editionId) {
  console.log("  Fetching edition:", editionId, "...");
  const url = `https://api.alquran.cloud/v1/quran/${editionId}`;
  const data = await fetchJSON(url);
  if (data.code !== 200) throw new Error("API error for " + editionId + ": " + JSON.stringify(data.status));
  return data.data.surahs; // array of 114 surahs
}

async function main() {
  console.log("=== Deen o Dunya — Qur'an Bundle Generator ===\n");

  console.log("Step 1: Downloading Arabic text (Uthmani)...");
  const ar = await downloadEdition(EDITIONS.ar); await sleep(1000);

  console.log("Step 2: Downloading English (Sahih International)...");
  const en = await downloadEdition(EDITIONS.en); await sleep(1000);

  console.log("Step 3: Downloading Urdu (Jalandhry)...");
  const ur = await downloadEdition(EDITIONS.ur); await sleep(500);

  console.log("\nStep 4: Assembling bundle...");
  const bundle = { version: BUNDLE_VERSION, surahs: {} };

  for (let i = 0; i < 114; i++) {
    const sNum = i + 1;
    const meta = SURAH_META[i];
    const arSurah = ar[i];
    const enSurah = en[i];
    const urSurah = ur[i];
    const ayahs = arSurah.ayahs.map((ayah, j) => ({
      n: ayah.numberInSurah,
      g: ayah.number,           // global ayah id (1..6236)
      ar: ayah.text,
      en: enSurah.ayahs[j] ? enSurah.ayahs[j].text : "",
      ur: urSurah.ayahs[j] ? urSurah.ayahs[j].text : ""
    }));
    bundle.surahs[sNum] = {
      number: sNum,
      nameAr: meta[1],
      nameEn: meta[2],
      nameTr: meta[3],
      ayahCount: meta[4],
      revelation: meta[5],
      juz: meta[6],
      bismillah: sNum !== 1 && sNum !== 9,
      ayahs: ayahs
    };
    if (sNum % 10 === 0) process.stdout.write("  " + sNum + "/114 surahs processed\n");
  }

  // Write index (lightweight, sent at boot for surah list)
  const index = SURAH_META.map(m => ({
    n: m[0], ar: m[1], en: m[2], tr: m[3], count: m[4], rev: m[5], juz: m[6]
  }));
  fs.writeFileSync(OUT_INDEX, JSON.stringify(index), "utf8");
  console.log("  Wrote:", OUT_INDEX, "(", fs.statSync(OUT_INDEX).size, "bytes )");

  // Write gzipped bundle
  const json = JSON.stringify(bundle);
  console.log("\nStep 5: Compressing bundle...");
  console.log("  Raw JSON:", Math.round(json.length / 1024), "KB");

  const gz = zlib.gzipSync(Buffer.from(json, "utf8"), { level: 9 });
  fs.writeFileSync(OUT_BUNDLE, gz);
  console.log("  Compressed:", Math.round(gz.length / 1024), "KB →", OUT_BUNDLE);

  // Checksum
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update(gz).digest("hex");
  const checkTxt = `version: ${BUNDLE_VERSION}\nsha256: ${hash}\nsurahs: 114\nbytes_gzip: ${gz.length}\ngenerated: ${new Date().toISOString()}\n`;
  fs.writeFileSync(OUT_CHECK, checkTxt, "utf8");
  console.log("  Checksum:", hash.slice(0, 16) + "...");

  console.log("\n✅  Bundle generation complete.");
  console.log("    Add dist/quran-bundle.json.gz to prepare-mobile-build.js (dist copies).");
  console.log("    Add to sw.js APP_SHELL so it caches on first install.");
  console.log("\n    ATTRIBUTION REQUIRED in About screen:");
  console.log("    Arabic: tanzil.net (CC BY ND 3.0)");
  console.log("    English: Saheeh International (non-commercial free use)");
  console.log("    Urdu: Fateh Muhammad Jalandhry (public domain)");
}

main().catch(err => {
  console.error("\n❌  Bundle generation FAILED:", err.message);
  process.exit(1);
});
