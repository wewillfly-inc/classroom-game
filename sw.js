// ============================================================
// sw.js - Service Worker for offline PWA support
// ============================================================

const CACHE_NAME = 'pass-the-note-v1';

// Files to pre-cache for offline play
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/js/i18n.js',
    '/js/sprites.js',
    '/js/audio.js',
    '/js/renderer.js',
    '/js/grid.js',
    '/js/teacher.js',
    '/js/input.js',
    '/js/game.js',
    '/js/main.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/manifest.json',
];

// Install: pre-cache all game assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch: cache-first strategy (serve from cache, fall back to network)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                // Cache successful responses for future offline use
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            });
        }).catch(() => {
            // If both cache and network fail, return a basic offline response
            return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
});
