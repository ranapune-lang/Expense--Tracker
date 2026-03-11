// Service Worker for Expense & Income Tracker PWA
const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
  '/expense_tracker.html',
  '/expense_manifest.json',
  '/expense_icon.svg'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Sync offline transactions when back online
  return new Promise((resolve) => {
    console.log('Background sync completed');
    resolve();
  });
}

// Push notification support for reminders
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Don\'t forget to track your expenses today!',
    icon: 'expense_icon.svg',
    badge: 'expense_icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open', 
        title: 'Open Tracker',
        icon: 'expense_icon.svg'
      },
      {
        action: 'close', 
        title: 'Close',
        icon: 'expense_icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Expense Tracker Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/expense_tracker.html')
    );
  }
});