// USSD Pay v3.0 - Service Worker
const CACHE_NAME = 'ussd-pay-v3.0';
const STATIC_ASSETS = [
    './',
    './index.html',
    './settings.html',
    './offline.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// Install Event
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('✓ Service Worker: Caching assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('✓ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First Strategy for HTML, Cache First for Assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(request).catch(() => new Response('No network')));
        return;
    }
    
    // HTML pages: Network First
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then(cachedResponse => {
                        return cachedResponse || caches.match('./offline.html');
                    });
                })
        );
        return;
    }
    
    // Assets: Cache First
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            
            return fetch(request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, clone);
                });
                return response;
            }).catch(() => {
                // Fallback for different asset types
                if (request.destination === 'image') {
                    return new Response(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                }
                return new Response('Resource not available offline');
            });
        })
    );
});

// Handle Messages from Clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('✓ Service Worker: Cache cleared');
        });
    }
});

// Periodic Background Sync (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

async function syncTransactions() {
    // This would sync pending transactions when back online
    console.log('✓ Service Worker: Syncing transactions');
}
