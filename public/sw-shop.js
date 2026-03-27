const CACHE_NAME = 'afra-shop-v1';
const ASSETS = [
  '/',
  '/api/manifest/shop'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handler to satisfy PWA requirements
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
