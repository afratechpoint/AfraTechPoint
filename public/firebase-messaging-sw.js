console.log('[SW] Firebase Messaging Service Worker Loading v4.4...');

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const CACHE_NAME = 'afra-tech-point-v4.1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.png',
  '/icons/shop-icon-192.png',
  '/icons/admin-icon-192.png',
  '/offline.html'
];

firebase.initializeApp({
  apiKey: "AIzaSyBmYiVrrzBByjY_XZQPffFKp928ba3fNYQ",
  authDomain: "afra-tech-point.firebaseapp.com",
  projectId: "afra-tech-point",
  storageBucket: "afra-tech-point.firebasestorage.app",
  messagingSenderId: "715017478991",
  appId: "1:715017478991:web:6ddfe0f45f5e93121bdb3a"
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
  // Do not cache API, Next.js internal, or Firebase scripts
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/_next/') || 
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebasejs')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
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
