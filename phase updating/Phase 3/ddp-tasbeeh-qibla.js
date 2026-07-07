/* Deen o Dunya Planner — Tasbeeh Counter + Qibla Compass (ddp-tasbeeh-qibla.js)
   Exposes: window.DDP_TASBEEH and window.DDP_QIBLA

   TASBEEH:
   - Big tap target, haptic feedback per count (Capacitor Haptics or navigator.vibrate),
     target presets (33 / 99 / 100 / custom), gentle buzz at target, persists count
     so an interrupted session isn't lost, and keeps per-dhikr lifetime totals.
   - Common dhikrs preset: SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah,
     Astaghfirullah, and a "custom" slot.

   QIBLA:
   - Computes bearing to Makkah (great-circle) from the user's lat/lon, then uses
     DeviceOrientation to rotate a compass needle toward the Qibla.
   - Handles iOS permission (DeviceOrientationEvent.requestPermission) and the
     webkitCompassHeading quirk. Falls back to a static bearing readout if the
     device has no magnetometer (common on cheap phones) — shows "point N, Qibla is
     at 258°" so it's still usable.
*/
(function () {
  /* ===================== TASBEEH ===================== */
  var LS_TASBEEH = "ddp_tasbeeh_v1";

  var DHIKRS = [
    { id: "subhanallah",   ar: "سُبْحَانَ اللّٰه",        en: "SubhanAllah",       target: 33 },
    { id: "alhamdulillah", ar: "الْحَمْدُ لِلّٰه",        en: "Alhamdulillah",     target: 33 },
    { id: "allahuakbar",   ar: "اللّٰهُ أَكْبَر",         en: "Allahu Akbar",      target: 34 },
    { id: "tahlil",        ar: "لَا إِلٰهَ إِلَّا اللّٰه", en: "La ilaha illAllah", target: 100 },
    { id: "istighfar",     ar: "أَسْتَغْفِرُ اللّٰه",     en: "Astaghfirullah",    target: 100 },
    { id: "salawat",       ar: "اللّٰهُمَّ صَلِّ عَلٰى مُحَمَّد", en: "Salawat",     target: 100 }
  ];

  function loadTasbeeh() {
    try { return JSON.parse(localStorage.getItem(LS_TASBEEH) || "null") || { current: {}, lifetime: {} }; }
    catch (e) { return { current: {}, lifetime: {} }; }
  }
  function saveTasbeeh(state) {
    try { localStorage.setItem(LS_TASBEEH, JSON.stringify(state)); } catch (e) {}
  }

  function haptic(kind) {
    var H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    if (H) {
      if (kind === "target") H.notification({ type: "SUCCESS" }).catch(function(){});
      else H.impact({ style: "LIGHT" }).catch(function(){});
    } else if (navigator.vibrate) {
      navigator.vibrate(kind === "target" ? [60, 40, 60] : 15);
    }
  }

  function increment(dhikrId) {
    var st = loadTasbeeh();
    st.current[dhikrId] = (st.current[dhikrId] || 0) + 1;
    st.lifetime[dhikrId] = (st.lifetime[dhikrId] || 0) + 1;
    var dhikr = DHIKRS.filter(function (d) { return d.id === dhikrId; })[0];
    var target = dhikr ? dhikr.target : 33;
    var hitTarget = st.current[dhikrId] % target === 0;
    haptic(hitTarget ? "target" : "tick");
    saveTasbeeh(st);
    return { count: st.current[dhikrId], lifetime: st.lifetime[dhikrId], target: target, hitTarget: hitTarget };
  }

  function resetCurrent(dhikrId) {
    var st = loadTasbeeh();
    st.current[dhikrId] = 0;
    saveTasbeeh(st);
  }

  function getCounts(dhikrId) {
    var st = loadTasbeeh();
    return { count: st.current[dhikrId] || 0, lifetime: st.lifetime[dhikrId] || 0 };
  }

  window.DDP_TASBEEH = {
    DHIKRS: DHIKRS,
    increment: increment,
    resetCurrent: resetCurrent,
    getCounts: getCounts
  };

  /* ===================== QIBLA ===================== */
  var KAABA_LAT = 21.4225, KAABA_LON = 39.8262;

  function toRad(d) { return d * Math.PI / 180; }
  function toDeg(r) { return r * 180 / Math.PI; }

  /* Great-circle initial bearing from (lat,lon) to Kaaba */
  function qiblaBearing(lat, lon) {
    var phi1 = toRad(lat), phi2 = toRad(KAABA_LAT);
    var dLon = toRad(KAABA_LON - lon);
    var y = Math.sin(dLon) * Math.cos(phi2);
    var x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
    var brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  /* Distance to Makkah (km) — nice to show */
  function distanceToMakkah(lat, lon) {
    var R = 6371;
    var dLat = toRad(KAABA_LAT - lat), dLon = toRad(KAABA_LON - lon);
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
            Math.cos(toRad(lat))*Math.cos(toRad(KAABA_LAT))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }

  var orientationHandler = null;

  /* Request permission (iOS 13+) and start listening. onHeading(compassHeading,
     qiblaAngleRelativeToDevice, hasCompass). */
  function start(lat, lon, onHeading) {
    var bearing = qiblaBearing(lat, lon);

    function handle(e) {
      var heading = null;
      if (typeof e.webkitCompassHeading === "number") {
        heading = e.webkitCompassHeading;            // iOS: already compass heading
      } else if (typeof e.alpha === "number") {
        heading = 360 - e.alpha;                      // Android: convert alpha
      }
      if (heading == null) { onHeading(null, bearing, false); return; }
      var relative = (bearing - heading + 360) % 360; // where to rotate the needle
      onHeading(heading, relative, true);
    }

    function attach() {
      orientationHandler = handle;
      // absolute orientation preferred where available
      if ("ondeviceorientationabsolute" in window) {
        window.addEventListener("deviceorientationabsolute", handle, true);
      } else {
        window.addEventListener("deviceorientation", handle, true);
      }
    }

    // iOS permission gate
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      return DeviceOrientationEvent.requestPermission().then(function (resp) {
        if (resp === "granted") { attach(); return true; }
        onHeading(null, bearing, false); // no compass — show static bearing
        return false;
      }).catch(function () { onHeading(null, bearing, false); return false; });
    } else {
      attach();
      return Promise.resolve(true);
    }
  }

  function stop() {
    if (orientationHandler) {
      window.removeEventListener("deviceorientationabsolute", orientationHandler, true);
      window.removeEventListener("deviceorientation", orientationHandler, true);
      orientationHandler = null;
    }
  }

  window.DDP_QIBLA = {
    bearing: qiblaBearing,
    distanceToMakkah: distanceToMakkah,
    start: start,
    stop: stop
  };
})();
