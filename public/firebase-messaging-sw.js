console.log('[SW] Firebase Messaging Service Worker Loading v5.1...');

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const CACHE_NAME = 'afra-tech-point-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.png',
  '/icons/shop-icon-192.png',
  '/icons/admin-icon-192.png',
  '/offline.html'
];

firebase.initializeApp({
  apiKey: "AIzaSyDtgYq8LipfH9utcvi-V93TTe-QAeKQn5c",
  authDomain: "afra-tech-backup.firebaseapp.com",
  projectId: "afra-tech-backup",
  storageBucket: "afra-tech-backup.firebasestorage.app",
  messagingSenderId: "964585460815",
  appId: "1:964585460815:web:371460059841e85aab063a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo.png',
    data: payload.data, // Contains the 'url'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- Low-Level Push Listener (Fallback) ---
self.addEventListener('push', (event) => {
  console.log('[SW] Push Event Received:', event);
  
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log('[SW] Push Data:', data);
    
    const payload = data.notification || data.data || data;

    let title = payload.title || 'New Notification';
    let body = payload.body || '';
    const icon = payload.icon || '/logo.png';
    const url = payload.url || '/';

    // Type-specific display overrides if title/body are generic
    if (payload.type === 'order_status_update') {
      title = title || 'Order Updated';
    } else if (payload.type === 'new_order') {
      title = title || 'New Order #';
    }

    const options = {
      body,
      icon,
      data: { url },
      tag: 'atp-notification-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
  }
});

// --- Debug Message Listener ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/logo.png',
      tag: 'atp-debug'
    });
  }
});

// --- PWA Caching Logic ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(e => console.warn(`Failed to cache ${url}:`, e)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Skip ALL of these — let the browser handle them directly:
  // 1. API calls
  // 2. Next.js internals (JS chunks, images proxy)
  // 3. Firebase / Google CDN scripts
  // 4. External image services (ImageKit, imgbb, CDN, etc.)
  // 5. Any cross-origin request that isn't same-origin
  const isExternal = url.origin !== self.location.origin;
  const isApiOrNext = (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/_next/')
  );
  const isExternalScript = (
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebasejs')
  );
  const isExternalImage = (
    url.hostname.includes('ik.imagekit.io') ||
    url.hostname.includes('imagekit.io') ||
    url.hostname.includes('imgbb.com') ||
    url.hostname.includes('i.ibb.co') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('storage.googleapis.com')
  );

  // Never intercept external images, external scripts, API or Next.js internals
  if (isApiOrNext || isExternalScript || isExternalImage) {
    return; // Let the browser handle these directly — no service worker interference
  }

  // NAVIGATION (HTML pages) → Network-First strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // SAME-ORIGIN STATIC ASSETS ONLY → Cache-First strategy
  // Never cache cross-origin (isExternal) requests to avoid stale external content
  if (!isExternal) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        }).catch((err) => {
          console.warn('[SW] Fetch failed for:', url.pathname, err);
          // Return a proper 503 response instead of null to avoid silent failures
          return new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
  }
  // For other external requests: just let them through without SW interference
});

// --- Notification Handling ---

// Handle notification click to open the link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
