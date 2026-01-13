// Service Worker for Rucoy Ledger PWA
const CACHE_NAME = 'rucoy-ledger-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/add-transaction.html',
  '/inventory.html',
  '/credits.html',
  '/advance.html',
  '/css/styles.css',
  '/js/data-manager.js',
  '/js/portfolio.js',
  '/js/add-transaction.js',
  '/js/inventory.js',
  '/js/advance.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
