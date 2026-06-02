// Deen o Dunya — service worker
const CACHE = 'ddp-v1780372669788';
const PRECACHE = ["index.html","manifest.webmanifest","vendor/react.production.min.js","vendor/react-dom.production.min.js","js/theme.js","js/ios-frame.js","js/dashboard.js","js/quran-data.js","js/quran.js","js/azkar-data.js","js/azkar.js","js/qibla.js","js/tasks.js","js/settings.js","js/more.js","js/app.js","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // App navigations → serve cached shell when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  // Qur'an text/audio + fonts → network-first, fall back to cache, then store
  const runtime = /alquran\.cloud|islamic\.network|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (runtime) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // App shell assets → cache-first
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
