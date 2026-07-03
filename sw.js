/* Deen o Dunya Planner — Service Worker v16
   Fixes vs v15:
   - No longer returns index.html for failed NON-navigation requests (fonts/audio/images
     were previously handed HTML bytes when offline).
   - Google Fonts CSS + font files are now cached (opaque responses accepted for fonts.gstatic).
   - Recitation audio (cdn.islamic.network / everyayah.com) cached in a size-limited cache
     so replayed ayahs are instant and work offline.
   - Local helper scripts added to the app shell.
*/
const VERSION = "v16";
const SHELL_CACHE = "ddp-shell-" + VERSION;
const FONT_CACHE = "ddp-fonts-" + VERSION;
const AUDIO_CACHE = "ddp-audio-" + VERSION;
const AUDIO_CACHE_MAX_ENTRIES = 400; // ~roughly a few surahs of ayah mp3s

const APP_SHELL = [
  "./",
  "./index.html",
  "./privacy.html",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./ddp-cities.js",
  "./ddp-state.js",
  "./ddp-audio.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
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
  // delete oldest first (insertion order)
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) Navigations: network-first, fall back to cached shell.
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

  // 2) Fonts: cache-first, accept opaque responses (fonts.gstatic serves opaque to SW).
  if (isFontRequest(url)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(response => {
          // opaque (status 0) is fine for fonts — cache it anyway
          const copy = response.clone();
          caches.open(FONT_CACHE).then(c => c.put(req, copy)).catch(() => {});
          return response;
        }).catch(() => new Response("", { status: 504 }));
      })
    );
    return;
  }

  // 3) Recitation / adhan audio: cache-first with size-limited cache.
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

  // 4) Everything else: cache-first, network fallback.
  //    On failure return a proper error — NEVER index.html for a non-navigation request.
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
