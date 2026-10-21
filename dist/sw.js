// sw.js - Service Worker de Produção do Cantina Fácil
const CACHE_NAME = 'cantina-facil-prod-v1.0.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/logo.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './src/styles.css',
  './src/main.js',
  './src/db.js',
  './src/products.js',
  './src/cart.js',
  './src/orders.js',
  './src/admin.js',
  './src/pwa.js',
  './src/foodImages.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[SW Prod] Não foi possível pré-armazenar:', url, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('./offline.html');
          if (fallback) return fallback;
          return caches.match('./index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((c) => c.put(req, res));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((networkRes) => {
        if (!networkRes || networkRes.status !== 200) return networkRes;
        const toCache = networkRes.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, toCache));
        return networkRes;
      }).catch(() => {
        if (req.destination === 'image') {
          return caches.match('./icons/logo.svg');
        }
      });
    })
  );
});
