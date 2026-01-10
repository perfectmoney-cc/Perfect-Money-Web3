// Service Worker for PerfectMoney PWA with Push Notifications
const CACHE_NAME = 'perfectmoney-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/pm-app-logo.png',
  '/pm-icon-512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Perfect Money',
    body: 'You have a new notification',
    icon: '/pm-app-logo.png',
    badge: '/pm-app-logo.png',
    tag: 'pm-notification',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        icon: data.icon || '/pm-app-logo.png',
        badge: data.badge || '/pm-app-logo.png'
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/dashboard';

  // Route based on notification type
  switch (data.type) {
    case 'price_alert':
      targetUrl = '/dashboard/buy';
      break;
    case 'recurring_purchase':
      targetUrl = '/dashboard/buy';
      break;
    case 'transaction':
      targetUrl = '/dashboard';
      break;
    case 'virtual_card':
      targetUrl = '/dashboard/virtual-card';
      break;
    default:
      targetUrl = data.url || '/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Background sync for recurring purchases
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-recurring-purchases') {
    event.waitUntil(checkRecurringPurchases());
  }
  if (event.tag === 'check-price-alerts') {
    event.waitUntil(checkPriceAlerts());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-recurring-purchases') {
    event.waitUntil(checkRecurringPurchases());
  }
  if (event.tag === 'check-price-alerts') {
    event.waitUntil(checkPriceAlerts());
  }
});

// Check recurring purchases that are due
async function checkRecurringPurchases() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // Send message to clients to check recurring purchases
    clients.forEach(client => {
      client.postMessage({
        type: 'CHECK_RECURRING_PURCHASES',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Error checking recurring purchases:', error);
  }
}

// Check price alerts
async function checkPriceAlerts() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // Send message to clients to check price alerts
    clients.forEach(client => {
      client.postMessage({
        type: 'CHECK_PRICE_ALERTS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle notification requests from the app
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/pm-app-logo.png',
      badge: '/pm-app-logo.png',
      ...options
    });
  }
});
