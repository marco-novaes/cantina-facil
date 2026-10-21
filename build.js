// build.js - Script de compilação e empacotamento da versão de produção (dist)
// 100% nativo do Node.js: gera a distribuição estática autossuficiente e otimizada.

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');

function emptyDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comentários
    .replace(/\s+/g, ' ')             // remove espaços duplicados
    .replace(/\s*([\{\}:;,])\s*/g, '$1') // remove espaços ao redor de delimitadores
    .trim();
}

console.log('🚀 Iniciando build de produção do Cantina Fácil...');

// 1. Limpar dist/
emptyDir(DIST_DIR);
console.log('✓ Pasta dist/ limpa e recriada.');

// 2. Copiar pasta public para dist
const publicDir = path.resolve('public');
if (fs.existsSync(publicDir)) {
  for (const item of fs.readdirSync(publicDir)) {
    copyRecursive(path.join(publicDir, item), path.join(DIST_DIR, item));
  }
  console.log('✓ Arquivos de public/ copiados para dist/ (manifest, ícones, offline.html, sw.js).');
}

// 3. Copiar e minificar CSS
const srcDir = path.resolve('src');
const distSrcDir = path.join(DIST_DIR, 'src');
fs.mkdirSync(distSrcDir, { recursive: true });

const cssPath = path.join(srcDir, 'styles.css');
if (fs.existsSync(cssPath)) {
  const rawCss = fs.readFileSync(cssPath, 'utf-8');
  const minifiedCss = minifyCss(rawCss);
  fs.writeFileSync(path.join(distSrcDir, 'styles.css'), minifiedCss);
  console.log(`✓ CSS otimizado: ${(minifiedCss.length / 1024).toFixed(2)} KB (redução de ${(100 - (minifiedCss.length / rawCss.length * 100)).toFixed(1)}%)`);
}

// 4. Copiar módulos JavaScript de src/
const jsFiles = ['main.js', 'db.js', 'products.js', 'cart.js', 'orders.js', 'admin.js', 'pwa.js', 'foodImages.js'];
jsFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, path.join(distSrcDir, file));
  }
});
console.log(`✓ ${jsFiles.length} módulos JavaScript copiados para dist/src/.`);

// 5. Copiar index.html
const indexHtmlPath = path.resolve('index.html');
if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('✓ index.html processado e copiado para dist/.');
}

// 6. Atualizar Service Worker de produção
const prodSwPath = path.join(DIST_DIR, 'sw.js');
const prodSwContent = `// sw.js - Service Worker de Produção do Cantina Fácil
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
`;

fs.writeFileSync(prodSwPath, prodSwContent);
console.log('✓ sw.js de produção configurado para cache offline.');

console.log('=====================================================');
console.log('🎉 BUILD DE PRODUÇÃO CONCLUÍDO COM SUCESSO NA PASTA dist/!');
console.log('Para testar a versão compilada de produção execute:');
console.log('  node server.js --dist');
console.log('=====================================================');
