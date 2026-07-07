/* Deen o Dunya Planner — Ramadan Mode (ddp-ramadan.js)
   Depends on: ddp-hijri.js, ddp-habits.js, ddp-db.js
   Exposes: window.DDP_RAMADAN

   DESIGN PRINCIPLE (learned from the date research):
   NEVER hardcode Ramadan Gregorian dates. Sources disagree by up to 10 days because
   the start depends on moon-sighting convention and region. Instead we DERIVE the
   Ramadan window from the app's own Hijri engine (Kuwaiti algorithm + the user's
   regional offset in ddp-hijri). This means Ramadan mode auto-activates correctly
   every year with no code update, and it respects the user's local convention via
   the same Hijri offset they already set.

   FEATURES:
   - Auto-detect: is today in Ramadan (Hijri month 9)? Which fast day (1..30)?
   - Suhoor & Iftar times derived from the app's existing prayer calc:
       Suhoor ends  = Fajr time (imsak = Fajr - N minutes, configurable).
       Iftar begins = Maghrib time.
     Live countdowns to whichever is next.
   - Fasting log: mark each day fasted / missed / exempt (travel, illness, menses,
     pregnancy/nursing). Stored per Hijri-day so it survives across Gregorian years.
   - Taraweeh tracker: mark taraweeh prayed each night (habit segment).
   - Last ten nights highlight + Laylat al-Qadr reminder on odd nights (21,23,25,27,29).
   - Countdown to Ramadan when it's within ~40 days (pre-Ramadan anticipation).

   All computation is offline. The app supplies prayer times via a callback so we
   reuse whatever calc the app already has (no duplicate prayer math here).
*/
(function () {
  var LS_IMSAK = "ddp_imsak_min";     // minutes before Fajr that suhoor ends (default 10)
  var FAST_STORE_PREFIX = "ramadan:";  // IndexedDB kv key: "ramadan:{hijriYear}:{day}"

  function imsakMinutes() {
    try { return parseInt(localStorage.getItem(LS_IMSAK) || "10", 10); } catch (e) { return 10; }
  }
  function setImsakMinutes(n) { try { localStorage.setItem(LS_IMSAK, String(n)); } catch (e) {} }

  /* Is a given Gregorian date within Ramadan? Returns {inRamadan, day, hijri}. */
  function ramadanStatus(gDate) {
    var d = gDate || new Date();
    var h = window.DDP_HIJRI.convert(d);   // {year, month, day, dow} with user offset applied
    return {
      inRamadan: h.month === 9,
      day: h.month === 9 ? h.day : null,
      hijriYear: h.year,
      hijri: h
    };
  }

  /* Days until Ramadan starts (approx, from Hijri). Returns null if already in
     Ramadan, else integer days (for the pre-Ramadan countdown banner). */
  function daysUntilRamadan(gDate) {
    var d = gDate || new Date();
    var status = ramadanStatus(d);
    if (status.inRamadan) return 0;
    // Walk forward up to 60 days looking for 1 Ramadan.
    for (var i = 1; i <= 60; i++) {
      var probe = new Date(d);
      probe.setDate(probe.getDate() + i);
      var h = window.DDP_HIJRI.convert(probe);
      if (h.month === 9 && h.day === 1) return i;
    }
    return null; // more than ~60 days away
  }

  /* Is this one of the last ten nights? (Hijri day >= 21 in Ramadan) */
  function isLastTenNights(gDate) {
    var s = ramadanStatus(gDate);
    return s.inRamadan && s.day >= 21;
  }

  /* Is tonight a likely Laylat al-Qadr night? (odd nights of last ten) */
  function isOddLastTenNight(gDate) {
    var s = ramadanStatus(gDate);
    if (!s.inRamadan || s.day < 21) return false;
    return [21, 23, 25, 27, 29].indexOf(s.day) !== -1;
  }

  /* Suhoor/Iftar model. Caller passes today's prayer times {fajr:Date, maghrib:Date}.
     Returns times + which is next + seconds remaining. */
  function suhoorIftar(prayerTimes, now) {
    now = now || new Date();
    var imsak = new Date(prayerTimes.fajr.getTime() - imsakMinutes() * 60000);
    var iftar = new Date(prayerTimes.maghrib.getTime());

    var next, label, target;
    if (now < imsak) {
      next = "suhoor_end"; label = "Suhoor ends"; target = imsak;
    } else if (now < iftar) {
      next = "iftar"; label = "Iftar"; target = iftar;
    } else {
      // after iftar — next event is tomorrow's suhoor end (caller can pass tomorrow's fajr)
      next = "suhoor_end_tomorrow"; label = "Suhoor ends"; target = null;
    }
    return {
      imsak: imsak,
      iftar: iftar,
      fajr: prayerTimes.fajr,
      maghrib: prayerTimes.maghrib,
      next: next,
      nextLabel: label,
      target: target,
      secondsToTarget: target ? Math.max(0, Math.round((target - now) / 1000)) : null
    };
  }

  /* ---- Fasting log (keyed by Hijri year+day so it's stable across Gregorian years) ---- */
  function fastKey(hijriYear, day) { return FAST_STORE_PREFIX + hijriYear + ":" + day; }

  function getFastDay(hijriYear, day) {
    return DDP_DB.get("kv", fastKey(hijriYear, day)).then(function (r) {
      return r || { hijriYear: hijriYear, day: day, fasted: null, taraweeh: false, exempt: null };
    });
  }

  function setFastDay(record) {
    return DDP_DB.set("kv", fastKey(record.hijriYear, record.day), record);
  }

  // status: "fasted" | "missed" | "exempt"; exemptReason: "travel"|"illness"|"menses"|"pregnancy"|"other"
  function markFast(hijriYear, day, status, exemptReason) {
    return getFastDay(hijriYear, day).then(function (rec) {
      rec.fasted = (status === "fasted");
      rec.exempt = (status === "exempt") ? (exemptReason || "other") : null;
      return setFastDay(rec).then(function () { return rec; });
    });
  }

  function markTaraweeh(hijriYear, day, done) {
    return getFastDay(hijriYear, day).then(function (rec) {
      rec.taraweeh = (done === undefined ? !rec.taraweeh : !!done);
      return setFastDay(rec).then(function () { return rec; });
    });
  }

  /* Ramadan summary for the current year (for a progress screen). */
  function ramadanSummary(hijriYear) {
    var ops = [];
    for (var d = 1; d <= 30; d++) ops.push(getFastDay(hijriYear, d));
    return Promise.all(ops).then(function (days) {
      var fasted = days.filter(function (x) { return x.fasted === true; }).length;
      var exempt = days.filter(function (x) { return x.exempt; }).length;
      var taraweeh = days.filter(function (x) { return x.taraweeh; }).length;
      var missed = days.filter(function (x) { return x.fasted === false && !x.exempt; }).length;
      return { fasted: fasted, missed: missed, exempt: exempt, taraweeh: taraweeh, makeUpOwed: missed + exempt };
    });
  }

  window.DDP_RAMADAN = {
    ramadanStatus: ramadanStatus,
    daysUntilRamadan: daysUntilRamadan,
    isLastTenNights: isLastTenNights,
    isOddLastTenNight: isOddLastTenNight,
    suhoorIftar: suhoorIftar,
    imsakMinutes: imsakMinutes,
    setImsakMinutes: setImsakMinutes,
    getFastDay: getFastDay,
    markFast: markFast,
    markTaraweeh: markTaraweeh,
    ramadanSummary: ramadanSummary
  };
})();
