/* Deen o Dunya Planner — Habit Engine (ddp-habits.js)
   Depends on: ddp-db.js
   Exposes: window.DDP_HABITS

   The "Daily Ring" model:
   - 8 segments per day:
       prayers[5]  — Fajr, Dhuhr, Asr, Maghrib, Isha (one each)
       quran       — any Quran reading done today (boolean)
       morning     — morning adhkar completed (boolean)
       evening     — evening adhkar completed (boolean)
   - A day is "complete" when all 8 segments are filled.
   - Streaks use a "mercy day": once per week, one missed day does not break the streak.
   - Khatm plan: user picks a pace; the engine computes today's surah/ayah range.

   Day record shape (stored as JSON in DDP_DB habits store keyed by "YYYY-MM-DD"):
   {
     date: "2026-07-03",
     prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
     quran: false,
     morning: false,
     evening: false,
     completedAt: null  // ISO timestamp if all 8 done
   }
*/
(function () {
  var PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  var LS_STREAK = "ddp_streak_v1";
  var LS_KHATM  = "ddp_khatm_v1";

  /* ---- Date helpers ---- */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function keyForDate(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function dateFromKey(k) {
    var p = k.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function daysBetween(a, b) {
    return Math.round(Math.abs(b - a) / 86400000);
  }

  /* ---- Day record ---- */
  function emptyDay(date) {
    return {
      date: date || todayKey(),
      prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
      quran: false,
      morning: false,
      evening: false,
      completedAt: null
    };
  }

  function getDay(dateKey) {
    return DDP_DB.get("habits", dateKey || todayKey()).then(function (r) {
      return r || emptyDay(dateKey || todayKey());
    });
  }

  function saveDay(record) {
    // check completion
    var allPrayers = PRAYERS.every(function (p) { return record.prayers[p]; });
    if (allPrayers && record.quran && record.morning && record.evening && !record.completedAt) {
      record.completedAt = new Date().toISOString();
    }
    return DDP_DB.set("habits", record.date, record).then(function () {
      recalcStreak();
      return record;
    });
  }

  /* ---- Segment toggles ---- */
  function markPrayer(prayer, done) {
    return getDay().then(function (day) {
      day.prayers[prayer] = (done === undefined ? !day.prayers[prayer] : !!done);
      return saveDay(day);
    });
  }

  function markQuran(done) {
    return getDay().then(function (day) {
      day.quran = (done === undefined ? !day.quran : !!done);
      return saveDay(day);
    });
  }

  function markAdhkar(type, done) {
    // type: "morning" | "evening"
    return getDay().then(function (day) {
      day[type] = (done === undefined ? !day[type] : !!done);
      return saveDay(day);
    });
  }

  /* ---- Score for a day record ---- */
  function score(record) {
    if (!record) return { done: 0, total: 8, ring: 0 };
    var done = PRAYERS.filter(function (p) { return record.prayers[p]; }).length;
    if (record.quran)   done++;
    if (record.morning) done++;
    if (record.evening) done++;
    return { done: done, total: 8, ring: Math.round((done / 8) * 100) };
  }

  /* ---- Streak calculation with mercy day ----
     Algorithm:
     - Walk back from yesterday until a gap > 1 day (mercy: skip one missed day per 7).
     - Store result in localStorage for instant dashboard reads.
  */
  function recalcStreak() {
    DDP_DB.keys("habits").then(function (allKeys) {
      var sorted = allKeys.slice().sort().reverse(); // newest first
      var today = todayKey();
      var streak = 0;
      var mercyUsed = false;
      var lastKey = null;

      // Only count completed days (all 8 segments). Today's partial day doesn't count yet.
      var completedKeys = sorted.filter(function (k) {
        return k < today; // exclude today from streak calc (it's in progress)
      });

      // We need to async-fetch each day; batch them.
      var fetches = completedKeys.map(function (k) { return DDP_DB.get("habits", k); });
      Promise.all(fetches).then(function (days) {
        for (var i = 0; i < days.length; i++) {
          var d = days[i];
          var k = completedKeys[i];
          if (!d || !d.completedAt) {
            // missed day — use mercy once per week
            if (!mercyUsed) {
              mercyUsed = true;
              // reset mercy allowance every 7 streak days
              continue;
            } else {
              break;
            }
          }
          if (lastKey !== null) {
            var gap = daysBetween(dateFromKey(lastKey), dateFromKey(k));
            if (gap > (mercyUsed ? 1 : 2)) break;
            if (gap === 2 && !mercyUsed) { mercyUsed = true; }
          }
          streak++;
          lastKey = k;
          if (streak % 7 === 0) mercyUsed = false; // reset mercy each 7-day cycle
        }
        try {
          localStorage.setItem(LS_STREAK, JSON.stringify({ streak: streak, at: today }));
        } catch (e) {}
      });
    });
  }

  function getStreak() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_STREAK) || "null");
      if (s && s.at === todayKey()) return s.streak;
    } catch (e) {}
    return 0; // will be updated asynchronously
  }

  /* ---- Khatm plan ----
     Paces: "30d" | "90d" | "1y" | "own" (user provides ayahs_per_day)
     Total Quran = 6236 ayahs.
     Stores start date + pace; getKhatmToday returns {surahStart, ayahStart, surahEnd, ayahEnd, done%}
  */
  var TOTAL_AYAHS = 6236;

  /* Cumulative ayah count by surah (1-indexed, 0 unused) */
  var SURAH_STARTS = (function () {
    // lengths from standard Uthmani mushaf
    var lengths = [0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,
      135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,54,54,37,
      54,30,44,26,71,52,74,26,47,64,40,68,45,31,54,49,18,57,39,49,27,
      44,25,73,36,45,29,43,25,18,25,31,17,11,22,64,10,54,92,20,100,78,
      17,19,25,70,44,25,65,17,26,22,24,34,30,20,15,22,18,12,9,12,11,
      10,14,11,8,13,57,19,96,26,32,25,25,18,10,15,17,11,16,17,19,14,
      12,4,164];
    var starts = [0, 0]; // index 1 = surah 1 starts at ayah 0
    var cum = 0;
    for (var i = 1; i <= 114; i++) {
      starts[i] = cum;
      cum += lengths[i];
    }
    return starts;
  })();

  function globalAyahToRef(g) {
    // g is 0-indexed global ayah number
    for (var s = 114; s >= 1; s--) {
      if (g >= SURAH_STARTS[s]) {
        return { surah: s, ayah: g - SURAH_STARTS[s] + 1 };
      }
    }
    return { surah: 1, ayah: 1 };
  }

  function setKhatm(pace, ayahsPerDay) {
    var apd = ayahsPerDay;
    if (pace === "30d")  apd = Math.ceil(TOTAL_AYAHS / 30);
    if (pace === "90d")  apd = Math.ceil(TOTAL_AYAHS / 90);
    if (pace === "1y")   apd = Math.ceil(TOTAL_AYAHS / 365);
    var plan = { pace: pace, apd: apd, start: todayKey(), done: 0 };
    try { localStorage.setItem(LS_KHATM, JSON.stringify(plan)); } catch (e) {}
    return plan;
  }

  function getKhatm() {
    try { return JSON.parse(localStorage.getItem(LS_KHATM) || "null"); } catch (e) { return null; }
  }

  function khatmProgress() {
    var plan = getKhatm();
    if (!plan) return null;
    var start = dateFromKey(plan.start);
    var elapsed = daysBetween(start, new Date());
    var doneAyahs = Math.min(plan.done || (elapsed * plan.apd), TOTAL_AYAHS);
    var todayStart = globalAyahToRef(doneAyahs);
    var todayEnd = globalAyahToRef(Math.min(doneAyahs + plan.apd - 1, TOTAL_AYAHS - 1));
    return {
      plan: plan,
      doneAyahs: doneAyahs,
      todayStart: todayStart,
      todayEnd: todayEnd,
      percent: Math.round((doneAyahs / TOTAL_AYAHS) * 100),
      daysLeft: Math.ceil((TOTAL_AYAHS - doneAyahs) / plan.apd)
    };
  }

  function advanceKhatm(ayahsRead) {
    var plan = getKhatm();
    if (!plan) return;
    plan.done = (plan.done || 0) + (ayahsRead || plan.apd);
    if (plan.done >= TOTAL_AYAHS) plan.done = TOTAL_AYAHS;
    try { localStorage.setItem(LS_KHATM, JSON.stringify(plan)); } catch (e) {}
  }

  window.DDP_HABITS = {
    todayKey: todayKey,
    getDay: getDay,
    saveDay: saveDay,
    markPrayer: markPrayer,
    markQuran: markQuran,
    markAdhkar: markAdhkar,
    score: score,
    getStreak: getStreak,
    recalcStreak: recalcStreak,
    setKhatm: setKhatm,
    getKhatm: getKhatm,
    khatmProgress: khatmProgress,
    advanceKhatm: advanceKhatm,
    emptyDay: emptyDay,
    PRAYERS: PRAYERS
  };
})();
