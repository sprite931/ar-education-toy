// AR Education Toy - Service Worker
// Version 1.0.0

const CACHE_NAME = 'ar-education-toy-v1';
const RUNTIME_CACHE = 'ar-education-runtime';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/ar-education-toy/',
  '/ar-education-toy/index.html',
  '/ar-education-toy/marker.html',
  '/ar-education-toy/admin.html',
  '/ar-education-toy/manifest.json',
  // A-Frame & AR.js libraries
  'https://aframe.io/releases/1.4.2/aframe.min.js',
  'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js',
  // Firebase SDKs
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js',
  // Hiro marker image
  'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Network-first strategy for Firebase requests
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebasestorage.app')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.url.includes('aframe') ||
      request.url.includes('AR.js')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for HTML pages
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: try cache, then network
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[ServiceWorker] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    
    // Return offline page if available
    const offlinePage = await cache.match('/ar-education-toy/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncScores());
  }
});

async function syncScores() {
  // TODO: Sync offline scores to Firebase
  console.log('[ServiceWorker] Syncing scores...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Нова задачка те очаква!',
    icon: '/ar-education-toy/assets/icons/icon-192x192.png',
    badge: '/ar-education-toy/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'ar-education-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Отвори',
        icon: '/ar-education-toy/assets/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Затвори'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AR Образователна Играчка', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/ar-education-toy/')
    );
  }
});

// Message handler for communication with app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[ServiceWorker] Loaded');
