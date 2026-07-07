/* Deen o Dunya Planner — session position persistence
   Load BEFORE the main app script. Exposes window.DDP_STATE.

   FIX #3 ("when phone rings … never goes back to its original position"):
   Android kills the WebView freely under memory pressure (a phone call is enough
   on a 1–2 GB device). On relaunch the app cold-started at the dashboard and the
   user lost their surah, ayah and scroll position. This module keeps a tiny
   snapshot in localStorage, updated on every change and on pagehide, and the app
   reads it on boot to restore exactly where the reader was.

   Integration (see PHASE-0 work order):
   - Whenever the app changes tab/surah/ayah, call:
       DDP_STATE.set({ tab: "quran", surah: 2, ayah: 45 });
   - On boot, read DDP_STATE.get() inside the initial React state.
   - Scroll is captured automatically for the element registered with trackScroll().
*/
(function () {
  var KEY = "ddp_session_v1";
  var MAX_AGE_MS = 1000 * 60 * 60 * 12; // restore within 12h; older = fresh start
  var snapshot = read() || {};
  var scrollEl = null;
  var scrollTimer = null;

  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!s) return null;
      if (Date.now() - (s.at || 0) > MAX_AGE_MS) return null;
      return s;
    } catch (e) { return null; }
  }

  function write() {
    snapshot.at = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch (e) {}
  }

  function set(patch) {
    for (var k in patch) snapshot[k] = patch[k];
    write();
  }

  function get() { return read() || {}; }

  function clear() {
    snapshot = {};
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  /* Register the app's main scrolling element (call after each screen mounts). */
  function trackScroll(el) {
    scrollEl = el;
    if (!el) return;
    el.addEventListener("scroll", function () {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        snapshot.scrollY = el.scrollTop;
        write();
      }, 250);
    }, { passive: true });
    // restore
    if (typeof snapshot.scrollY === "number") {
      requestAnimationFrame(function () { el.scrollTop = snapshot.scrollY; });
    }
  }

  /* Belt-and-braces: flush on every lifecycle edge Android uses. */
  ["pagehide", "visibilitychange", "freeze"].forEach(function (ev) {
    document.addEventListener(ev, function () {
      if (ev !== "visibilitychange" || document.visibilityState === "hidden") write();
    });
  });

  window.DDP_STATE = { get: get, set: set, clear: clear, trackScroll: trackScroll };
})();
