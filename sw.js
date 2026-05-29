/* Service Worker — Доброчесна Поліція PWA
   Об'єднує офлайн-кешування та Firebase Cloud Messaging. */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// === ЗАМІНІТЬ на свої значення з Firebase Console ===
firebase.initializeApp({
	  apiKey: "AIzaSyDpXzfNgLhX79gF-db3JKZmedxh98C0ih4",
	  authDomain: "integrity-police-app.firebaseapp.com",
	  projectId: "integrity-police-app",
	  storageBucket: "integrity-police-app.firebasestorage.app",
	  messagingSenderId: "710211684160",
	  appId: "1:710211684160:web:d18e7d8ee3930be3539ca5"
});
const messaging = firebase.messaging();
// ====================================================

const CACHE = 'integrity-v1';
const ASSETS = [
  './',
  './index.html',
  './resources.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/favicon-64.png'
];

// Install: pre-cache core shell
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for own assets, network-first fallback to cache otherwise
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // same-origin → cache first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('./index.html')))
    );
    return;
  }

  // cross-origin (fonts etc.) → network, fallback to cache
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});

/* ---- Push notifications via FCM ---- */
messaging.onBackgroundMessage(payload => {
  const title = (payload.notification && payload.notification.title) || 'Доброчесна Поліція';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: './icons/icon-192.png',
    badge: './icons/favicon-64.png',
    data: { url: (payload.data && payload.data.url) || './' }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.openWindow(url));
});
