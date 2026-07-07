/* Deen o Dunya Planner — Prayer Notification Scheduler (ddp-notify.js)
   Depends on: Capacitor @capacitor/local-notifications (must be installed)
   Exposes: window.DDP_NOTIFY

   What this does:
   - Schedules one local notification per prayer, 7 days ahead, at the computed
     prayer time for the user's saved location. Rescheduled daily.
   - Each notification plays the bundled adhan sound (assets/audio/adhan-makkah.mp3)
     on Android via the notification channel, which works even when the app is closed.
   - Per-prayer on/off preference honoured from settings.
   - Call DDP_NOTIFY.scheduleAll() on:
       (a) app launch (if last schedule was > 12h ago)
       (b) when the user changes location or calculation method
       (c) on the daily midnight rollover

   NOTE: This module uses window.CapacitorLocalNotifications which Capacitor injects.
   In the PWA (non-native) fallback it does nothing gracefully.
*/
(function () {
  var LS_LAST = "ddp_notify_last";
  var LS_PREFS = "ddp_notify_prefs_v1";
  var CHANNEL_ID = "ddp_prayers";

  var PRAYER_LABELS = {
    fajr: { en: "Fajr", ur: "فجر", ar: "الفجر" },
    dhuhr: { en: "Dhuhr", ur: "ظہر", ar: "الظهر" },
    asr: { en: "Asr", ur: "عصر", ar: "العصر" },
    maghrib: { en: "Maghrib", ur: "مغرب", ar: "المغرب" },
    isha: { en: "Isha", ur: "عشاء", ar: "العشاء" }
  };

  var PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  /* ---- Capacitor bridge (null-safe) ---- */
  function getLN() {
    return (window.Capacitor &&
            window.Capacitor.Plugins &&
            window.Capacitor.Plugins.LocalNotifications) || null;
  }

  /* ---- Preferences ---- */
  function defaultPrefs() {
    var p = {};
    PRAYER_KEYS.forEach(function (k) { p[k] = true; });
    p.sound = "makkah"; // "makkah" | "madinah" | "silent"
    return p;
  }

  function getPrefs() {
    var prefs;
    try {
      var raw = localStorage.getItem(LS_PREFS);
      prefs = raw ? Object.assign(defaultPrefs(), JSON.parse(raw)) : defaultPrefs();
    } catch (e) { prefs = defaultPrefs(); }
    // The per-prayer adhan on/off switches the user actually sees and taps live in
    // Settings (index.html), persisted under "ddp_adhan_enabled_v1" — reconcile with
    // that here so the *background* notification schedule always matches what the
    // UI shows, instead of silently drifting from a separate, unreachable pref set.
    try {
      var enabled = JSON.parse(localStorage.getItem("ddp_adhan_enabled_v1") || "null");
      if (enabled) {
        PRAYER_KEYS.forEach(function (k) {
          if (typeof enabled[k] === "boolean") prefs[k] = enabled[k];
        });
      }
    } catch (e) {}
    return prefs;
  }

  function savePrefs(prefs) {
    try { localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); } catch (e) {}
  }

  /* ---- Permission ---- */
  function requestPermission() {
    var ln = getLN();
    if (!ln) return Promise.resolve(false);
    return ln.requestPermissions().then(function (r) {
      return r && (r.display === "granted" || r.receive === "granted");
    }).catch(function () { return false; });
  }

  /* ---- Channel setup (Android 8+) ---- */
  function ensureChannel() {
    var ln = getLN();
    if (!ln || !ln.createChannel) return Promise.resolve();
    return ln.createChannel({
      id: CHANNEL_ID,
      name: "Prayer Times",
      description: "Adhan notifications for the five daily prayers",
      importance: 4, // HIGH
      visibility: 1,
      sound: "adhan_makkah", // must match assets filename without extension
      vibration: true
    }).catch(function () {});
  }

  /* ---- Core scheduling ---- */
  function scheduleAll(prayerTimesMap) {
    // prayerTimesMap: { "2026-07-03": { fajr: Date, dhuhr: Date, ... }, ... }
    // Supply 7 days worth (today + 6). You compute these using the existing
    // prayer calc already in the app (window.PrayerTimes or inline equivalent).
    var ln = getLN();
    if (!ln) return Promise.resolve();
    var prefs = getPrefs();
    var now = Date.now();

    return ensureChannel().then(function () {
      return ln.cancel({ notifications: Array.from({ length: 500 }, function (_, i) { return { id: i + 1 }; }) })
        .catch(function () {});
    }).then(function () {
      var notifications = [];
      var id = 1;
      var lang = (localStorage.getItem("ddp_lang") || "en").toLowerCase();
      var soundFile = prefs.sound === "madinah" ? "adhan_madinah" : "adhan_makkah";

      Object.keys(prayerTimesMap).forEach(function (dateKey) {
        var times = prayerTimesMap[dateKey];
        PRAYER_KEYS.forEach(function (prayer) {
          if (!prefs[prayer]) return; // user disabled this prayer
          var t = times[prayer];
          if (!t || !(t instanceof Date) || t.getTime() < now) return;

          var label = PRAYER_LABELS[prayer];
          var title = label[lang] || label.en;
          var body = lang === "ur"
            ? "نماز کا وقت ہو گیا"
            : (lang === "ar" ? "حان وقت الصلاة" : "Time for prayer");

          notifications.push({
            id: id++,
            title: title,
            body: body,
            schedule: { at: t, allowWhileIdle: true },
            channelId: CHANNEL_ID,
            sound: prefs.sound === "silent" ? null : soundFile,
            smallIcon: "ic_notification",
            extra: { prayer: prayer, date: dateKey }
          });
        });
      });

      if (notifications.length === 0) return;
      return ln.schedule({ notifications: notifications });
    }).then(function () {
      try { localStorage.setItem(LS_LAST, String(now)); localStorage.setItem(LS_SCHEMA, String(SCHEDULE_LOGIC_VERSION)); } catch (e) {}
    }).catch(function (err) {
      console.warn("[ddp-notify] scheduling failed:", err);
    });
  }

  /* ---- Jum'ah weekly summary notification ---- */
  function scheduleJumahSummary(streakCount, weeklyRingPercent) {
    var ln = getLN();
    if (!ln) return Promise.resolve();
    // Schedule for this Friday Dhuhr +15min
    var now = new Date();
    var dayOfWeek = now.getDay(); // 0=Sun, 5=Fri
    var daysToFri = (5 - dayOfWeek + 7) % 7 || 7;
    var fri = new Date(now);
    fri.setDate(fri.getDate() + daysToFri);
    fri.setHours(13, 15, 0, 0);

    var body = "This week: " + weeklyRingPercent + "% complete" +
      (streakCount > 1 ? " · " + streakCount + " day streak 🤍" : "") +
      " — \"The most beloved deeds are the most consistent.\"";

    return ln.schedule({ notifications: [{
      id: 9001,
      title: "Jum'ah Mubarak",
      body: body,
      schedule: { at: fri, allowWhileIdle: true },
      channelId: CHANNEL_ID,
      smallIcon: "ic_notification"
    }]}).catch(function () {});
  }

  /* ---- Evening gentle nudge ---- */
  function scheduleEveningNudge(ishaTime, ringDone, ringTotal) {
    var ln = getLN();
    if (!ln || ringDone < Math.floor(ringTotal / 2)) return Promise.resolve();
    // Only nudge if ring >= 50% done — so we don't guilt people on hard days
    var nudgeTime = new Date(ishaTime.getTime() - 30 * 60000); // 30min before Isha
    if (nudgeTime < new Date()) return Promise.resolve();
    var remaining = ringTotal - ringDone;
    var body = remaining === 1
      ? "Just 1 more to complete your day — you're almost there."
      : remaining + " more to complete your day. Keep going.";
    return ln.schedule({ notifications: [{
      id: 9002,
      title: "Almost there",
      body: body,
      schedule: { at: nudgeTime, allowWhileIdle: true },
      channelId: CHANNEL_ID,
      smallIcon: "ic_notification",
      sound: null // silent nudge — not an adhan
    }]}).catch(function () {});
  }

  // Bump this whenever scheduling LOGIC changes in a way that requires every
  // device to resync immediately, rather than waiting up to 12h for the normal
  // refresh window (e.g. the fix that made prefs honour the Settings adhan toggle).
  var SCHEDULE_LOGIC_VERSION = 3;
  var LS_SCHEMA = "ddp_notify_schema_v1";

  function needsRefresh() {
    try {
      var storedVersion = parseInt(localStorage.getItem(LS_SCHEMA) || "0", 10);
      if (storedVersion !== SCHEDULE_LOGIC_VERSION) return true;
      var last = parseInt(localStorage.getItem(LS_LAST) || "0", 10);
      return (Date.now() - last) > 12 * 60 * 60 * 1000;
    } catch (e) { return true; }
  }

  window.DDP_NOTIFY = {
    requestPermission: requestPermission,
    scheduleAll: scheduleAll,
    scheduleJumahSummary: scheduleJumahSummary,
    scheduleEveningNudge: scheduleEveningNudge,
    getPrefs: getPrefs,
    savePrefs: savePrefs,
    needsRefresh: needsRefresh,
    PRAYER_KEYS: PRAYER_KEYS,
    PRAYER_LABELS: PRAYER_LABELS
  };
})();
