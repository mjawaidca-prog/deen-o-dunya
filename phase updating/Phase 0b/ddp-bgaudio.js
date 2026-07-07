/* Deen o Dunya Planner — Background Audio (ddp-bgaudio.js)
   Depends on: @jofr/capacitor-media-session (Capacitor plugin), ddp-audio.js
   Exposes: window.DDP_BGAUDIO

   THE BUG THIS FIXES:
   "Recitation stops when the phone goes to sleep / screen locks."
   Root cause: Android (and iOS) suspend a Capacitor WebView when the app is
   backgrounded — even if an <audio> element is actively playing. A plain web
   <audio> tag has no way to declare "I am a media player, keep me alive."

   THE FIX (two parts):
   1. MediaSession + a foreground service. Declaring an active MediaSession with a
      foreground service tells the OS this is a media playback app, so it keeps the
      process (and the audio) alive while the screen is off. The @jofr/capacitor-
      media-session plugin starts that foreground service for us.
   2. As a bonus, this also gives LOCK-SCREEN + NOTIFICATION media controls
      (play/pause/next/previous), which every serious Qur'an audio app has and ours
      currently lacks. Users can control recitation without unlocking.

   IMPORTANT: On Android the plugin cannot auto-detect WebView <audio> playback, so
   we must MANUALLY tell it the playback state and wire the action handlers. This
   module does that, bridging our existing DDP_AUDIO player to the media session.

   NATIVE SETUP REQUIRED (see PHASE-4b work order):
   - npm install @jofr/capacitor-media-session && npx cap sync
   - AndroidManifest: FOREGROUND_SERVICE + FOREGROUND_SERVICE_MEDIA_PLAYBACK perms
     (Android 14+ requires the typed permission).
   - iOS: enable Background Modes → Audio, and set AVAudioSession category to playback.
*/
(function () {
  function MS() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.MediaSession) || null;
  }
  function haveWebMediaSession() {
    return ("mediaSession" in navigator);
  }

  var current = {
    title: "",
    surahName: "",
    ayah: null,
    reciter: "",
    onNext: null,
    onPrev: null,
    onPlay: null,
    onPause: null,
    onSeek: null
  };

  /* Set the "now playing" metadata shown on the lock screen / notification. */
  function setMetadata(meta) {
    current.title = meta.title || current.title;
    current.surahName = meta.surahName || current.surahName;
    current.ayah = meta.ayah != null ? meta.ayah : current.ayah;
    current.reciter = meta.reciter || current.reciter;

    var payload = {
      title: current.surahName + (current.ayah ? " · Ayah " + current.ayah : ""),
      artist: current.reciter || "Deen o Dunya",
      album: "Qur'an",
      artwork: [
        { src: "assets/app-icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    };

    var plugin = MS();
    if (plugin && plugin.setMetadata) {
      plugin.setMetadata(payload).catch(function () {});
    } else if (haveWebMediaSession()) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata(payload);
      } catch (e) {}
    }
  }

  /* Tell the OS we are actively playing (this is what starts the foreground service
     and keeps audio alive while the screen is off). Call on play/pause. */
  function setPlaybackState(state) {
    // state: "playing" | "paused" | "none"
    var plugin = MS();
    if (plugin && plugin.setPlaybackState) {
      plugin.setPlaybackState({ playbackState: state }).catch(function () {});
    } else if (haveWebMediaSession()) {
      try { navigator.mediaSession.playbackState = state; } catch (e) {}
    }
  }

  /* Wire lock-screen / notification buttons to our player callbacks. */
  function setHandlers(handlers) {
    current.onPlay = handlers.onPlay || current.onPlay;
    current.onPause = handlers.onPause || current.onPause;
    current.onNext = handlers.onNext || current.onNext;
    current.onPrev = handlers.onPrev || current.onPrev;
    current.onSeek = handlers.onSeek || current.onSeek;

    var plugin = MS();
    var actions = [
      ["play", function () { if (current.onPlay) current.onPlay(); }],
      ["pause", function () { if (current.onPause) current.onPause(); }],
      ["nexttrack", function () { if (current.onNext) current.onNext(); }],
      ["previoustrack", function () { if (current.onPrev) current.onPrev(); }]
    ];

    if (plugin && plugin.setActionHandler) {
      actions.forEach(function (a) {
        plugin.setActionHandler({ action: a[0] }, a[1]).catch(function () {});
      });
    } else if (haveWebMediaSession()) {
      actions.forEach(function (a) {
        try { navigator.mediaSession.setActionHandler(a[0], a[1]); } catch (e) {}
      });
    }
  }

  /* Convenience: bind the whole thing to the existing DDP_AUDIO player once.
     Call this after DDP_AUDIO exists. It:
       - flips playback state on play/pause/ended (keeps foreground service correct),
       - lets the app supply next/prev/metadata via updateNowPlaying(). */
  function bindToPlayer(callbacks) {
    callbacks = callbacks || {};
    if (!window.DDP_AUDIO || !window.DDP_AUDIO.element) return;
    var el = window.DDP_AUDIO.element;

    el.addEventListener("play", function () { setPlaybackState("playing"); });
    el.addEventListener("pause", function () { setPlaybackState("paused"); });
    el.addEventListener("ended", function () { setPlaybackState("paused"); });

    setHandlers({
      onPlay: function () { window.DDP_AUDIO.element.play().catch(function(){}); },
      onPause: function () { window.DDP_AUDIO.pause(); },
      onNext: callbacks.onNext || null,
      onPrev: callbacks.onPrev || null
    });
  }

  /* Called by the app each time a new ayah starts, so the lock screen updates. */
  function updateNowPlaying(surahName, ayah, reciter) {
    setMetadata({ surahName: surahName, ayah: ayah, reciter: reciter });
    setPlaybackState("playing");
  }

  /* Explicitly release the session (e.g. user stopped playback) so the foreground
     service ends and the notification clears — important for battery. */
  function release() {
    setPlaybackState("none");
    var plugin = MS();
    if (plugin && plugin.setPlaybackState) {
      // "none" ends the foreground service in the plugin
    }
  }

  window.DDP_BGAUDIO = {
    setMetadata: setMetadata,
    setPlaybackState: setPlaybackState,
    setHandlers: setHandlers,
    bindToPlayer: bindToPlayer,
    updateNowPlaying: updateNowPlaying,
    release: release,
    available: function () { return !!MS() || haveWebMediaSession(); }
  };
})();
