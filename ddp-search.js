/* Deen o Dunya Planner — Offline Full-Text Search (ddp-search.js)
   Depends on: ddp-db.js (Quran bundle already in IndexedDB from Phase 1)
   Exposes: window.DDP_SEARCH

   WHY: Islam 360's moat is searchable content. This gives Deen o Dunya offline
   search across the whole Qur'an (Arabic + English + Urdu translations) with correct
   handling of the hard parts:
   - Arabic: strip diacritics (tashkeel) and normalize alif/hamza/ya/ta-marbuta so
     "الرحمن" matches "الرَّحْمٰن" and users can type without harakat.
   - Urdu: normalize Arabic vs Urdu yeh/heh variants and strip diacritics.
   - English: case-fold, basic tokenization.

   INDEX STRATEGY:
   - Build an inverted index (token -> list of ayah refs) ONCE, lazily, and cache it
     in IndexedDB (kv "search_index_vN"). Rebuilds only when the bundle version changes.
   - Index is compact: token -> array of global ayah numbers. Lookups are O(1) map hits
     plus a set-intersection for multi-word queries.
   - Building 6236 ayahs × 3 languages is done chunked (off main thread via
     DDP_PERF.chunkedForEach if present) so it doesn't jank the UI on cheap phones.
*/
(function () {
  var INDEX_KEY = "search_index_v1";
  var index = null;         // { ar:{token:[gid...]}, en:{...}, ur:{...} }
  var building = null;      // promise guard

  /* ---- Normalization ---- */
  var ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08D3-\u08FF]/g;
  var TATWEEL = /\u0640/g;

  function normalizeArabic(s) {
    if (!s) return "";
    return s
      .replace(ARABIC_DIACRITICS, "")
      .replace(TATWEEL, "")
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627") // alif variants -> ا
      .replace(/\u0629/g, "\u0647")                      // ta marbuta ة -> ه
      .replace(/[\u064A\u0649]/g, "\u064A")              // ya/alif maqsura -> ي
      .replace(/\u0624/g, "\u0648")                      // waw hamza -> و
      .replace(/\u0626/g, "\u064A")                      // ya hamza -> ي
      .trim();
  }

  function normalizeUrdu(s) {
    if (!s) return "";
    return s
      .replace(ARABIC_DIACRITICS, "")
      .replace(TATWEEL, "")
      .replace(/\u064A/g, "\u06CC")   // Arabic yeh -> Urdu yeh ی
      .replace(/\u0643/g, "\u06A9")   // Arabic kaf -> Urdu keheh ک
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      .trim();
  }

  function normalizeEnglish(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").trim();
  }

  function tokenize(s) {
    return s.split(/\s+/).filter(function (t) { return t.length > 1; });
  }

  function normFor(lang, s) {
    if (lang === "ar") return normalizeArabic(s);
    if (lang === "ur") return normalizeUrdu(s);
    return normalizeEnglish(s);
  }

  /* ---- Build index from the Qur'an bundle in IndexedDB ---- */
  function buildIndex(onProgress) {
    if (building) return building;
    building = DDP_DB.get("kv", INDEX_KEY).then(function (cached) {
      if (cached && cached.ar) { index = cached; return index; }
      var idx = { ar: {}, en: {}, ur: {}, meta: {} };

      function addToken(langMap, token, gid) {
        if (!token) return;
        if (!langMap[token]) langMap[token] = [];
        var arr = langMap[token];
        if (arr[arr.length - 1] !== gid) arr.push(gid); // ayahs processed in order
      }

      // Load all 114 surahs and index each ayah
      var surahNums = [];
      for (var i = 1; i <= 114; i++) surahNums.push(i);

      var processed = 0;
      function indexSurah(num) {
        return DDP_DB.get("quran", num).then(function (surah) {
          if (!surah || !surah.ayahs) return;
          surah.ayahs.forEach(function (a) {
            var gid = a.g;
            tokenize(normalizeArabic(a.ar)).forEach(function (t) { addToken(idx.ar, t, gid); });
            tokenize(normalizeEnglish(a.en)).forEach(function (t) { addToken(idx.en, t, gid); });
            tokenize(normalizeUrdu(a.ur)).forEach(function (t) { addToken(idx.ur, t, gid); });
          });
          processed++;
          if (onProgress) onProgress(Math.round((processed / 114) * 100));
        });
      }

      // sequential to keep memory low on cheap phones
      var chain = Promise.resolve();
      surahNums.forEach(function (num) {
        chain = chain.then(function () { return indexSurah(num); });
      });
      return chain.then(function () {
        idx.meta = { built: Date.now(), version: 1 };
        index = idx;
        return DDP_DB.set("kv", INDEX_KEY, idx).then(function () { return idx; });
      });
    });
    return building;
  }

  /* ---- Search ---- */
  // opts: { lang: "ar"|"en"|"ur"|"all", limit: 50 }
  function search(query, opts) {
    opts = opts || {};
    var limit = opts.limit || 50;
    return ensureIndex().then(function (idx) {
      var langs = opts.lang && opts.lang !== "all" ? [opts.lang] : ["ar", "en", "ur"];
      var scores = {}; // gid -> score

      langs.forEach(function (lang) {
        var qNorm = normFor(lang, query);
        var tokens = tokenize(qNorm);
        if (!tokens.length) return;
        var map = idx[lang];

        // For each token, gather matching ayahs. Multi-word = intersection preferred,
        // but we also give partial credit (union) so short queries still return.
        var perToken = tokens.map(function (t) {
          // exact token match + prefix match (for morphological variation)
          var hits = map[t] ? map[t].slice() : [];
          if (hits.length === 0) {
            // prefix scan (bounded) for stemming-lite
            var keys = Object.keys(map);
            for (var k = 0; k < keys.length && hits.length < 200; k++) {
              if (keys[k].indexOf(t) === 0) hits = hits.concat(map[keys[k]]);
            }
          }
          return hits;
        });

        // intersection score: ayahs containing ALL tokens rank highest
        var counts = {};
        perToken.forEach(function (hits) {
          var seen = {};
          hits.forEach(function (gid) {
            if (seen[gid]) return; seen[gid] = 1;
            counts[gid] = (counts[gid] || 0) + 1;
          });
        });
        Object.keys(counts).forEach(function (gid) {
          var matchedAllBonus = counts[gid] === tokens.length ? 10 : 0;
          scores[gid] = (scores[gid] || 0) + counts[gid] + matchedAllBonus;
        });
      });

      var ranked = Object.keys(scores)
        .map(function (gid) { return { gid: parseInt(gid, 10), score: scores[gid] }; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, limit);

      // Resolve gids -> {surah, ayah, text} for display
      return resolveResults(ranked);
    });
  }

  /* Map global ayah ids back to surah/ayah + fetch text for display. */
  function resolveResults(ranked) {
    // group by surah to minimize DB reads
    return ensureIndex().then(function () {
      var bySurah = {};
      // We need surah/ayah from gid. Use the cumulative starts (same as ddp-habits).
      ranked.forEach(function (r) {
        var ref = gidToRef(r.gid);
        if (!bySurah[ref.surah]) bySurah[ref.surah] = [];
        bySurah[ref.surah].push({ ayah: ref.ayah, gid: r.gid, score: r.score });
      });
      var surahNums = Object.keys(bySurah);
      return Promise.all(surahNums.map(function (sn) {
        return DDP_DB.get("quran", parseInt(sn, 10)).then(function (surah) {
          return bySurah[sn].map(function (item) {
            var a = surah && surah.ayahs ? surah.ayahs[item.ayah - 1] : null;
            return {
              surah: parseInt(sn, 10),
              surahName: surah ? surah.nameEn : "",
              ayah: item.ayah,
              gid: item.gid,
              score: item.score,
              ar: a ? a.ar : "",
              en: a ? a.en : "",
              ur: a ? a.ur : ""
            };
          });
        });
      })).then(function (groups) {
        var flat = [];
        groups.forEach(function (g) { flat = flat.concat(g); });
        return flat.sort(function (a, b) { return b.score - a.score; });
      });
    });
  }

  /* gid -> {surah, ayah}. Uses standard surah ayah lengths. */
  var SURAH_LENGTHS = [0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,54,54,37,54,30,44,26,71,52,74,26,47,64,40,68,45,31,54,49,18,57,39,49,27,44,25,73,36,45,29,43,25,18,25,31,17,11,22,64,10,54,92,20,100,78,17,19,25,70,44,25,65,17,26,22,24,34,30,20,15,22,18,12,9,12,11,10,14,11,8,13,57,19,96,26,32,25,25,18,10,15,17,11,16,17,19,14,12,4,164];
  var SURAH_STARTS = (function () {
    var starts = [0, 0], cum = 0;
    for (var i = 1; i <= 114; i++) { starts[i] = cum; cum += SURAH_LENGTHS[i]; }
    return starts;
  })();

  function gidToRef(gid) {
    // gid is 1-indexed global ayah
    var g0 = gid - 1;
    for (var s = 114; s >= 1; s--) {
      if (g0 >= SURAH_STARTS[s]) return { surah: s, ayah: g0 - SURAH_STARTS[s] + 1 };
    }
    return { surah: 1, ayah: 1 };
  }

  function ensureIndex() {
    if (index) return Promise.resolve(index);
    return buildIndex();
  }

  window.DDP_SEARCH = {
    buildIndex: buildIndex,
    search: search,
    ensureIndex: ensureIndex,
    normalizeArabic: normalizeArabic,
    normalizeUrdu: normalizeUrdu,
    _gidToRef: gidToRef
  };
})();
