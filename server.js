// server.js - Servidor HTTP de desenvolvimento e visualização para Cantina Fácil PWA
// 100% nativo do Node.js: sem dependências externas, sem necessidade de direitos de administrador.

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const args = process.argv.slice(2);
const isDist = args.includes('--dist') || args.includes('-d');
const portArgIndex = args.indexOf('--port');
const PORT = portArgIndex !== -1 ? parseInt(args[portArgIndex + 1], 10) : (isDist ? 4173 : 5173);

const ROOT_DIR = isDist ? path.resolve('dist') : path.resolve('.');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  // Remover query string e hash
  const urlPath = req.url.split('?')[0].split('#')[0];
  let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
  
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  // Verificar se o arquivo está na pasta public quando executado em modo raiz (sem Vite)
  let filePath = path.join(ROOT_DIR, safePath);

  if (!fs.existsSync(filePath)) {
    // Tenta dentro de public se for modo raiz
    const publicPath = path.join(ROOT_DIR, 'public', safePath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    }
  }

  // Se ainda for diretório, procura index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não encontrar e for navegação HTML, entrega index.html (SPA Fallback)
      const fallbackHtml = path.join(ROOT_DIR, 'index.html');
      if (req.headers.accept && req.headers.accept.includes('text/html') && fs.existsSync(fallbackHtml)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(fallbackHtml).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Não Encontrado: ${urlPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    // Header especial para Service Worker
    if (path.basename(filePath) === 'sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const lanIps = getNetworkAddresses();
  console.log('=====================================================');
  console.log(`🥪 CANTINA FÁCIL - SERVIDOR ${isDist ? 'PRODUÇÃO (DIST)' : 'DESENVOLVIMENTO'}`);
  console.log('=====================================================');
  console.log(`> Local:     http://localhost:${PORT}`);
  lanIps.forEach(ip => {
    console.log(`> Na sua rede Wi-Fi (Celular Android): http://${ip}:${PORT}`);
  });
  console.log('-----------------------------------------------------');
  console.log(`> Diretório raiz servido: ${ROOT_DIR}`);
  console.log('> Pressione Ctrl+C para encerrar o servidor.');
  console.log('=====================================================');
});
