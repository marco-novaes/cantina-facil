// public/sw.js - Service Worker do Cantina Fácil PWA
const CACHE_NAME = 'cantina-facil-v1.0.1';

// Recursos essenciais para funcionamento 100% offline
const CORE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/logo.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './src/main.js',
  './src/styles.css',
  './src/db.js',
  './src/products.js',
  './src/cart.js',
  './src/orders.js',
  './src/admin.js',
  './src/pwa.js',
  './src/foodImages.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos map com individual catch para evitar que um único asset opcional quebre a instalação
      return Promise.all(
        CORE_ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[SW] Não foi possível pré-armazenar: ${url}`, err);
          });
        })
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Ativação e limpeza de versões antigas do cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[SW] Removendo cache antigo: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Estratégia de Fetch com tolerância total a offline
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorar requisições não-GET ou extensões do navegador
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Para navegação de páginas (HTML): Network First com fallback para Cache e página offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const defaultPage = await caches.match('./index.html');
          if (defaultPage) return defaultPage;

          const fallbackPage = await caches.match('./offline.html');
          if (fallbackPage) return fallbackPage;

          return new Response('<h1>Você está offline</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Para arquivos estáticos (CSS, JS, SVGs, imagens): Cache-First com atualização em background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Busca versão atualizada em background se houver internet
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {
          // Silenciosamente continua com a cópia em cache
        });
        return cachedResponse;
      }

      // Se não estava no cache, busca na rede e guarda
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch((err) => {
        // Fallback para imagens caso não encontre
        if (request.destination === 'image') {
          return caches.match('./icons/logo.svg');
        }
        throw err;
      });
    })
  );
});

// Mensagens vindas da aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
