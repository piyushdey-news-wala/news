const CACHE_NAME = 'news-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  // Add other assets you want to cache
];

// Install event: cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request)
        .then((netResponse) => {
          // Optionally cache new requests here
          return netResponse;
        }))
      .catch(() => caches.match('/offline.html')) // Optional: custom offline page
  );
});

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'News Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png', // Update with your icon path
    badge: '/icons/badge-72x72.png', // Update with your badge path
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
