/* Deen o Dunya Planner — Service Worker v32
   Phase 0-4 + 0b: Full offline caching for app shell, fonts, audio, and all modules.
*/
const VERSION = "v48";
const SHELL_CACHE = "ddp-shell-" + VERSION;
const FONT_CACHE = "ddp-fonts-" + VERSION;
const AUDIO_CACHE = "ddp-audio-" + VERSION;
const AUDIO_CACHE_MAX_ENTRIES = 400;

const APP_SHELL = [
  "./",
  "./index.html",
  "./privacy.html",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./ddp-cities.js",
  "./ddp-state.js",
  "./ddp-audio.js",
  "./ddp-bgaudio.js",
  "./ddp-db.js",
  "./ddp-habits.js",
  "./ddp-notify.js",
  "./ddp-hijri.js",
  "./ddp-i18n.js",
  "./ddp-perf.js",
  "./ddp-vlist.js",
  "./ddp-ads.js",
  "./ddp-purchase.js",
  "./ddp-audio-dl.js",
  "./ddp-hadith.js",
  "./ddp-kids.js",
  "./ddp-tasbeeh-qibla.js",
  "./ddp-ramadan.js",
  "./ddp-search.js",
  "./quran-bundle.json.gz",
  "./quran-bundle.json",
  "./assets/audio/adhan-makkah.mp3",
  "./assets/audio/adhan-madinah.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => Promise.all(APP_SHELL.map(url =>
        cache.add(url).catch(err => {
          console.warn("[sw] precache failed for", url, err);
        })
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  const keep = [SHELL_CACHE, FONT_CACHE, AUDIO_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isFontRequest(url) {
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

function isAudioRequest(url) {
  return url.hostname === "cdn.islamic.network" ||
         url.hostname === "everyayah.com" ||
         /\.mp3($|\?)/.test(url.pathname);
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(response => {
          const copy = response.clone();
          caches.open(FONT_CACHE).then(c => c.put(req, copy)).catch(() => {});
          return response;
        }).catch(() => new Response("", { status: 504 }));
      })
    );
    return;
  }

  if (isAudioRequest(url)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(response => {
          if (response && (response.status === 200 || response.type === "opaque")) {
            const copy = response.clone();
            caches.open(AUDIO_CACHE).then(c => {
              c.put(req, copy).then(() => trimCache(AUDIO_CACHE, AUDIO_CACHE_MAX_ENTRIES));
            }).catch(() => {});
          }
          return response;
        }).catch(() => new Response("", { status: 504 }));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return response;
      }).catch(() => new Response("", { status: 504 }));
    })
  );
});
