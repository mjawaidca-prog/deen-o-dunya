/* Deen o Dunya Planner — Hadith Module (ddp-hadith.js)
   Depends on: ddp-db.js
   Exposes: window.DDP_HADITH

   ⚠️ PROVENANCE & LICENSING FIRST (same lesson as tafsir):
   Do NOT bundle scraped hadith text of unknown origin. Hadith carries an authenticity
   burden — a mis-graded or mistranslated hadith in a worship app is a serious trust
   failure. Use a source with (a) clear licensing and (b) authenticity grading.

   RECOMMENDED SOURCE: Sunnah.com data.
   - Sunnah.com hosts the major collections with grades and is the de-facto standard.
   - Their data is available for legitimate app use; confirm current terms and
     attribution requirements at sunnah.com/developers (API) before shipping.
   - Alternative openly-licensed dataset: the "hadith-json" / fawazahmed0 hadith
     datasets (verify each collection's license individually).

   ARCHITECTURE:
   - A REGISTRY of collections, each flagged cleared:true only when its license and
     translation source are verified. The UI shows only cleared collections — adding
     a new collection is a data change, not a code change.
   - Collections download as OFFLINE PACKS into IndexedDB (like tafsir packs), so
     hadith works with no connectivity after a one-time download.
   - Every hadith record carries its grade + grader, shown in the UI. Never display
     a hadith without its grade and collection reference.

   RECORD SHAPE (per hadith):
   {
     collection: "bukhari",
     book: 2, hadithNo: "8",
     arabic: "…",
     translation: "…",         // language-specific
     narrator: "Abu Hurayrah (RA)",
     grade: "Sahih",           // Sahih | Hasan | Da'if | Mawdu' (if applicable)
     gradedBy: "Al-Bukhari",   // the authority for the grade
     reference: "Sahih al-Bukhari 8"
   }
*/
(function () {
  /* Collection registry. cleared:false means "do NOT show until licensing verified".
     Flip to true only after confirming source license + attribution. */
  var COLLECTIONS = [
    { id: "bukhari",    nameEn: "Sahih al-Bukhari",   nameAr: "صحيح البخاري",   nameUr: "صحیح بخاری",   authenticity: "sahih",   count: 7563, cleared: false },
    { id: "muslim",     nameEn: "Sahih Muslim",        nameAr: "صحيح مسلم",      nameUr: "صحیح مسلم",    authenticity: "sahih",   count: 7500, cleared: false },
    { id: "nawawi40",   nameEn: "40 Hadith Nawawi",    nameAr: "الأربعون النووية", nameUr: "اربعین نووی", authenticity: "mixed",   count: 42,   cleared: false },
    { id: "qudsi40",    nameEn: "40 Hadith Qudsi",     nameAr: "الأربعون القدسية", nameUr: "احادیث قدسی", authenticity: "mixed",   count: 40,   cleared: false },
    { id: "abudawud",   nameEn: "Sunan Abu Dawud",     nameAr: "سنن أبي داود",   nameUr: "سنن ابو داؤد", authenticity: "mixed",   count: 5274, cleared: false },
    { id: "tirmidhi",   nameEn: "Jami' at-Tirmidhi",   nameAr: "جامع الترمذي",   nameUr: "جامع ترمذی",   authenticity: "mixed",   count: 3956, cleared: false },
    { id: "nasai",      nameEn: "Sunan an-Nasa'i",     nameAr: "سنن النسائي",    nameUr: "سنن نسائی",    authenticity: "mixed",   count: 5761, cleared: false },
    { id: "ibnmajah",   nameEn: "Sunan Ibn Majah",     nameAr: "سنن ابن ماجه",   nameUr: "سنن ابن ماجہ", authenticity: "mixed",   count: 4341, cleared: false }
  ];

  var GRADE_LABELS = {
    sahih:  { en: "Sahih (Authentic)",   ar: "صحيح",  ur: "صحیح",  color: "#059669" },
    hasan:  { en: "Hasan (Good)",         ar: "حسن",   ur: "حسن",   color: "#0891b2" },
    daif:   { en: "Da'if (Weak)",         ar: "ضعيف",  ur: "ضعیف",  color: "#d97706" },
    mawdu:  { en: "Mawdu' (Fabricated)",  ar: "موضوع", ur: "موضوع", color: "#dc2626" }
  };

  function clearedCollections() {
    return COLLECTIONS.filter(function (c) { return c.cleared; });
  }

  function allCollections() { return COLLECTIONS; }

  /* Pack download: fetch a collection's data from your chosen licensed source and
     store per-book chunks in IndexedDB. You provide fetchCollectionData() bound to
     whichever source you licensed (Sunnah.com API or an approved dataset). */
  function downloadCollection(collectionId, fetchCollectionData, onProgress) {
    var col = COLLECTIONS.filter(function (c) { return c.id === collectionId; })[0];
    if (!col) return Promise.reject(new Error("unknown_collection"));
    if (!col.cleared) return Promise.reject(new Error("collection_not_licensed"));

    return fetchCollectionData(collectionId, onProgress).then(function (books) {
      // books: array of { book, hadiths:[record,...] }
      var ops = books.map(function (b) {
        return DDP_DB.set("kv", "hadith:" + collectionId + ":" + b.book, b.hadiths);
      });
      return Promise.all(ops).then(function () {
        return DDP_DB.set("kv", "hadith_meta:" + collectionId, {
          id: collectionId, books: books.length, downloadedAt: Date.now()
        });
      });
    });
  }

  function getBook(collectionId, bookNo) {
    return DDP_DB.get("kv", "hadith:" + collectionId + ":" + bookNo);
  }

  function isDownloaded(collectionId) {
    return DDP_DB.get("kv", "hadith_meta:" + collectionId).then(function (m) { return !!m; });
  }

  function deleteCollection(collectionId) {
    return DDP_DB.keys("kv").then(function (keys) {
      var toDel = keys.filter(function (k) {
        return k.indexOf("hadith:" + collectionId + ":") === 0 || k === "hadith_meta:" + collectionId;
      });
      return Promise.all(toDel.map(function (k) { return DDP_DB.del("kv", k); }));
    });
  }

  /* "Hadith of the day" — deterministic pick from a cleared, downloaded collection,
     seeded by the date so it's stable across the day and rotates daily. */
  function hadithOfTheDay(lang) {
    var cleared = clearedCollections();
    if (cleared.length === 0) return Promise.resolve(null);
    // prefer Nawawi 40 (short, foundational, fully sahih/hasan) if downloaded
    var preferred = cleared.filter(function (c) { return c.id === "nawawi40"; })[0] || cleared[0];
    return isDownloaded(preferred.id).then(function (dl) {
      if (!dl) return null;
      var day = Math.floor(Date.now() / 86400000);
      return getBook(preferred.id, 1).then(function (hadiths) {
        if (!hadiths || !hadiths.length) return null;
        var idx = day % hadiths.length;
        return hadiths[idx];
      });
    });
  }

  function gradeLabel(grade, lang) {
    var g = GRADE_LABELS[grade];
    if (!g) return { text: grade, color: "#6b7280" };
    return { text: g[lang] || g.en, color: g.color };
  }

  window.DDP_HADITH = {
    COLLECTIONS: COLLECTIONS,
    GRADE_LABELS: GRADE_LABELS,
    clearedCollections: clearedCollections,
    allCollections: allCollections,
    downloadCollection: downloadCollection,
    getBook: getBook,
    isDownloaded: isDownloaded,
    deleteCollection: deleteCollection,
    hadithOfTheDay: hadithOfTheDay,
    gradeLabel: gradeLabel
  };
})();
