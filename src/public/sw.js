// Minimal service worker for the AutoAuction admin PWA.
// Its purpose is to make the app installable ("Add to Home Screen").
// It intentionally does NOT cache admin pages — the admin panel needs
// live data, so every request goes straight to the network.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    // Network pass-through; if offline, let the browser show its default error.
    event.respondWith(fetch(event.request).catch(() => Response.error()));
});
