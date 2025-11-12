const CACHE_VERSION = '0.1.2-1752487000000'
const CACHE_NAME = `fir-cache-${CACHE_VERSION}`
const urlsToCache = [
    '/',
    '/manifest.json',
    '/icons/android-chrome-192x192.png',
    '/icons/icon-512x512.png',
    '/fallback/boy.png',
    '/fallback/girl.png',
    '/fallback/other.png',
    '/fallback/cover.png',
    '/shortcut/products.png',
    '/shortcut/pos.png',
    '/shortcut/settings.png',
    '/shortcut/brand.png',
    '/shortcut/category.png',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache)
        })
    )
})

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version or fetch from network with error handling
            return (
                response ||
                fetch(event.request).catch(() => {
                    // Optionally, return a fallback image for failed image requests
                    if (event.request.destination === 'image') {
                        return caches.match('/icon.png')
                    }

                    // Or return a generic response
                    return new Response('Network error occurred', { status: 408 })
                })
            )
        })
    )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})
