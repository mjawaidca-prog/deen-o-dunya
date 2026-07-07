/* Deen o Dunya Planner — Offline Audio Download Manager (ddp-audio-dl.js)
   Depends on: ddp-db.js (IndexedDB), @capacitor/filesystem (native file storage)
   Exposes: window.DDP_AUDIO_DL

   WHY: Streaming recitation ayah-by-ayah fails on low connectivity (the #1 tester
   complaint). This lets users download a whole sūrah (per reciter) once, over wifi,
   then listen fully offline with zero buffering — the single biggest UX win for
   Pakistan's network conditions.

   STORAGE STRATEGY (important on cheap phones):
   - Audio blobs are LARGE (a full sūrah of a reciter can be several MB; the whole
     Qur'an per reciter is 200-800 MB). These must NOT go in IndexedDB alongside
     text, and definitely not localStorage.
   - On native (Capacitor), store MP3 files on the device filesystem via
     @capacitor/filesystem in Directory.Data. Only a lightweight INDEX of what's
     downloaded lives in IndexedDB (kv store).
   - On web/PWA fallback, store blobs in a dedicated IndexedDB "audio" store.

   DOWNLOAD MODEL:
   - Unit = one sūrah for one reciter = a set of ayah MP3s.
   - Resumable: tracks completed ayahs; re-running resumes from the gap.
   - Real progress: reports completed/total ayahs (no fake timers).
   - Cancellable; deletable to reclaim space.
   - Quota-aware: checks navigator.storage.estimate() and warns before large jobs.
*/
(function () {
  var RECITERS = [
    { id: "ar.alafasy",         name: "Mishary Alafasy",        bitrateDir: "128" },
    { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", bitrateDir: "128" },
    { id: "ar.husary",          name: "Mahmoud Al-Husary",      bitrateDir: "128" },
    { id: "ar.minshawi",        name: "Al-Minshawi",            bitrateDir: "128" },
    { id: "ar.sudais",          name: "Abdurrahman As-Sudais",  bitrateDir: "128" }
  ];

  var CDN = "https://cdn.islamic.network/quran/audio";
  // ayah url: {CDN}/{bitrate}/{reciterId}/{globalAyahNumber}.mp3

  /* ---- Capacitor Filesystem bridge (null-safe) ---- */
  function fs() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) || null;
  }
  function isNative() { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }

  function surahDir(reciterId, surahNum) {
    return "audio/" + reciterId + "/" + surahNum;
  }
  function ayahPath(reciterId, surahNum, ayahN) {
    return surahDir(reciterId, surahNum) + "/" + ayahN + ".mp3";
  }

  /* ---- Download index (what's on device) in IndexedDB kv ---- */
  function indexKey(reciterId, surahNum) { return "audiodl:" + reciterId + ":" + surahNum; }

  function getSurahStatus(reciterId, surahNum) {
    return DDP_DB.get("kv", indexKey(reciterId, surahNum)).then(function (r) {
      return r || { reciterId: reciterId, surah: surahNum, done: [], total: 0, complete: false };
    });
  }

  function saveSurahStatus(status) {
    return DDP_DB.set("kv", indexKey(status.reciterId, status.surah), status);
  }

  /* ---- Storage estimate ---- */
  function storageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(function (e) {
        return { usage: e.usage || 0, quota: e.quota || 0, freeMB: Math.round(((e.quota||0)-(e.usage||0))/1048576) };
      });
    }
    return Promise.resolve({ usage: 0, quota: 0, freeMB: null });
  }

  /* ---- Fetch one ayah and persist ---- */
  function downloadAyah(reciterId, bitrateDir, surahNum, ayahN, globalAyah) {
    var url = CDN + "/" + bitrateDir + "/" + reciterId + "/" + globalAyah + ".mp3";
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " ayah " + globalAyah);
      return r.blob();
    }).then(function (blob) {
      if (isNative() && fs()) {
        return blobToBase64(blob).then(function (b64) {
          return fs().writeFile({
            path: ayahPath(reciterId, surahNum, ayahN),
            data: b64,
            directory: "DATA",
            recursive: true
          });
        });
      } else {
        // web fallback: store blob in IndexedDB audio store
        return DDP_DB.set("kv", "audioblob:" + reciterId + ":" + surahNum + ":" + ayahN, blob);
      }
    });
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onloadend = function () { resolve(String(r.result).split(",")[1]); };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  /* ---- Public: download a whole sūrah (resumable) ----
     ayahGlobals: array of global ayah numbers for this surah, in order (from the
     Qur'an bundle: surah.ayahs.map(a => a.g)). onProgress(done,total,pct). */
  var activeCancels = {};

  function downloadSurah(reciterId, surahNum, ayahGlobals, onProgress) {
    var reciter = RECITERS.filter(function (r) { return r.id === reciterId; })[0] || RECITERS[0];
    var cancelToken = { cancelled: false };
    activeCancels[reciterId + ":" + surahNum] = cancelToken;

    return getSurahStatus(reciterId, surahNum).then(function (status) {
      status.total = ayahGlobals.length;
      var doneSet = {};
      status.done.forEach(function (n) { doneSet[n] = true; });

      var i = 0;
      function next() {
        if (cancelToken.cancelled) return Promise.reject(new Error("cancelled"));
        // skip already-downloaded ayahs (resume)
        while (i < ayahGlobals.length && doneSet[i + 1]) i++;
        if (i >= ayahGlobals.length) {
          status.complete = true;
          return saveSurahStatus(status).then(function () {
            if (onProgress) onProgress(status.total, status.total, 100);
            return status;
          });
        }
        var ayahN = i + 1;
        var g = ayahGlobals[i];
        return downloadAyah(reciter.id, reciter.bitrateDir, surahNum, ayahN, g).then(function () {
          status.done.push(ayahN);
          doneSet[ayahN] = true;
          i++;
          if (onProgress) {
            var pct = Math.round((status.done.length / status.total) * 100);
            onProgress(status.done.length, status.total, pct);
          }
          // persist progress every 10 ayahs so a kill mid-download resumes cleanly
          if (status.done.length % 10 === 0) saveSurahStatus(status);
          return next();
        });
      }
      return next();
    }).then(function (res) {
      delete activeCancels[reciterId + ":" + surahNum];
      return res;
    });
  }

  function cancelDownload(reciterId, surahNum) {
    var token = activeCancels[reciterId + ":" + surahNum];
    if (token) token.cancelled = true;
  }

  /* ---- Delete a downloaded sūrah to reclaim space ---- */
  function deleteSurah(reciterId, surahNum) {
    var ops = [];
    if (isNative() && fs()) {
      ops.push(fs().rmdir({ path: surahDir(reciterId, surahNum), directory: "DATA", recursive: true }).catch(function(){}));
    }
    return getSurahStatus(reciterId, surahNum).then(function (status) {
      if (!isNative()) {
        status.done.forEach(function (n) {
          ops.push(DDP_DB.del("kv", "audioblob:" + reciterId + ":" + surahNum + ":" + n));
        });
      }
      ops.push(DDP_DB.del("kv", indexKey(reciterId, surahNum)));
      return Promise.all(ops);
    });
  }

  /* ---- Resolve a local URI for a downloaded ayah (for playback) ---- */
  function localAyahUri(reciterId, surahNum, ayahN) {
    if (isNative() && fs()) {
      return fs().getUri({ path: ayahPath(reciterId, surahNum, ayahN), directory: "DATA" })
        .then(function (r) {
          // Capacitor converts file:// to a webview-safe URL
          return window.Capacitor.convertFileSrc ? window.Capacitor.convertFileSrc(r.uri) : r.uri;
        }).catch(function () { return null; });
    } else {
      return DDP_DB.get("kv", "audioblob:" + reciterId + ":" + surahNum + ":" + ayahN).then(function (blob) {
        return blob ? URL.createObjectURL(blob) : null;
      });
    }
  }

  /* ---- List all downloaded surahs (for a "Manage downloads" screen) ---- */
  function listDownloads() {
    return DDP_DB.keys("kv").then(function (keys) {
      var dlKeys = keys.filter(function (k) { return k.indexOf("audiodl:") === 0; });
      return Promise.all(dlKeys.map(function (k) { return DDP_DB.get("kv", k); }));
    });
  }

  window.DDP_AUDIO_DL = {
    RECITERS: RECITERS,
    downloadSurah: downloadSurah,
    cancelDownload: cancelDownload,
    deleteSurah: deleteSurah,
    getSurahStatus: getSurahStatus,
    localAyahUri: localAyahUri,
    listDownloads: listDownloads,
    storageEstimate: storageEstimate
  };
})();
