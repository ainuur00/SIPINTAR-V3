/* ============================================================
   SIPINTAR V3 — SERVICE WORKER (PWA, khusus modul ujian)
   Strategi: NETWORK-FIRST (aplikasi ujian harus selalu terbaru),
   cache hanya sebagai cadangan ketika jaringan putus sesaat.
   Panggilan API ke script.google.com TIDAK pernah di-cache.
   ============================================================ */
const CACHE_NAME = 'sipintar-v3-ujian-9';
const CORE_ASSETS = [
  './',
  'index.html',
  'config.js',
  'manifest.webmanifest',
  'logo.png',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (c) { return c.addAll(CORE_ASSETS).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;            // POST API: langsung ke jaringan
  const url = event.request.url;
  if (url.indexOf('script.google.com') >= 0 ||
      url.indexOf('googleusercontent.com') >= 0) return; // API & Drive: jangan di-cache

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(function (res) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); }).catch(function () {});
        return res;
      })
      .catch(function () { return caches.match(event.request); })
  );
});
