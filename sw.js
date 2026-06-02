// Deen o Dunya — service worker
const CACHE = 'ddp-v1780376729124';
const PRECACHE = ["index.html","manifest.webmanifest","react.production.min.js","react-dom.production.min.js","theme.js","ios-frame.js","dashboard.js","quran-data.js","quran.js","azkar-data.js","azkar.js","qibla.js","tasks.js","settings.js","more.js","app.js","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match('index.html'))); return; }
  if (/alquran\.cloud|islamic\.network|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(fetch(req).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); return res; }).catch(() => caches.match(req))); return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
