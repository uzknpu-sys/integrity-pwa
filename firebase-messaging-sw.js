/* Firebase Cloud Messaging service worker
   ВАЖЛИВО: файл має лежати в КОРЕНІ і називатися саме firebase-messaging-sw.js
   Замініть значення у firebaseConfig на свої з Firebase Console. */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "ЗАМІНІТЬ_apiKey",
  authDomain: "ЗАМІНІТЬ_authDomain",
  projectId: "ЗАМІНІТЬ_projectId",
  storageBucket: "ЗАМІНІТЬ_storageBucket",
  messagingSenderId: "ЗАМІНІТЬ_messagingSenderId",
  appId: "ЗАМІНІТЬ_appId"
});

const messaging = firebase.messaging();

// Фонові повідомлення (застосунок закрито / у фоні)
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
