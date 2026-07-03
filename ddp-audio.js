/* Deen o Dunya Planner — shared audio manager
   Load BEFORE the main app script. Exposes window.DDP_AUDIO.

   Fixes (Phase 0):
   #1 Slow recitation  -> connection-aware bitrate (64kbps on 2G/3G/slow-4G),
                          next-ayah preloading, and (with sw.js v16) on-device caching.
   #3 Interruption     -> when a phone call / another app pauses playback, we remember
                          exactly where we were and resume from that position when the
                          user returns, instead of losing everything.
   Memory              -> ONE shared <audio> element for the whole app instead of an
                          <audio> per card (big win on 1–2 GB RAM phones).
*/
(function () {
  var audio = new Audio();
  audio.preload = "auto";

  var preloader = new Audio(); // silently warms the next ayah
  preloader.preload = "auto";

  var state = {
    src: null,
    resumeAt: 0,
    wasPlayingBeforeInterrupt: false,
    interrupted: false,
    onEnded: null,
    onState: null // callback(status: "playing"|"paused"|"loading"|"error")
  };

  function emit(s) { if (state.onState) try { state.onState(s); } catch (e) {} }

  /* ---- connection-aware bitrate ---- */
  function slowNetwork() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    var t = c.effectiveType || "";
    return t === "slow-2g" || t === "2g" || t === "3g";
  }

  /* Given a global ayah id, return the best-ordered source list. */
  function ayahSources(gid) {
    var hi = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/" + gid + ".mp3";
    var lo = "https://cdn.islamic.network/quran/audio/64/ar.alafasy/" + gid + ".mp3";
    return slowNetwork() ? [lo, hi] : [hi, lo];
  }

  /* ---- core playback ---- */
  function play(srcList, opts) {
    opts = opts || {};
    var list = Array.isArray(srcList) ? srcList.slice() : [srcList];
    state.onEnded = opts.onEnded || null;
    state.interrupted = false;
    tryPlay(list, 0, opts.startAt || 0);
  }

  function tryPlay(list, i, startAt) {
    if (i >= list.length) { emit("error"); return; }
    emit("loading");
    audio.src = list[i];
    state.src = list[i];
    audio.currentTime = 0;
    var onErr = function () {
      audio.removeEventListener("error", onErr);
      tryPlay(list, i + 1, startAt);
    };
    audio.addEventListener("error", onErr, { once: true });
    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        if (startAt > 0) { try { audio.currentTime = startAt; } catch (e) {} }
        emit("playing");
      }).catch(function () { /* autoplay blocked or aborted */ emit("paused"); });
    }
  }

  function pause() { audio.pause(); emit("paused"); }
  function toggle() { if (audio.paused) { audio.play().catch(function(){}); emit("playing"); } else { pause(); } }
  function stop() { audio.pause(); audio.currentTime = 0; state.src = null; emit("paused"); }

  /* ---- FIX #3: interruption handling ----
     A phone call fires "pause" on the element without user intent. We record the
     position; when the page becomes visible again we resume from that exact spot. */
  audio.addEventListener("pause", function () {
    if (!audio.ended && audio.currentTime > 0 && !audio.seeking) {
      state.resumeAt = audio.currentTime;
      if (document.visibilityState === "hidden") {
        state.interrupted = true;
        state.wasPlayingBeforeInterrupt = true;
      }
    }
  });

  audio.addEventListener("ended", function () {
    state.resumeAt = 0;
    if (state.onEnded) try { state.onEnded(); } catch (e) {}
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && state.interrupted && state.src) {
      state.interrupted = false;
      try { audio.currentTime = state.resumeAt || 0; } catch (e) {}
      audio.play().then(function(){ emit("playing"); }).catch(function () {
        // Autoplay may be blocked after backgrounding; surface a "tap to resume" state.
        emit("paused");
      });
    }
  });

  /* ---- next-ayah preloading (FIX #1) ---- */
  function preload(src) {
    if (!src) return;
    try { preloader.src = Array.isArray(src) ? src[0] : src; preloader.load(); } catch (e) {}
  }

  window.DDP_AUDIO = {
    play: play,
    pause: pause,
    toggle: toggle,
    stop: stop,
    preload: preload,
    ayahSources: ayahSources,
    slowNetwork: slowNetwork,
    onState: function (cb) { state.onState = cb; },
    element: audio
  };
})();
