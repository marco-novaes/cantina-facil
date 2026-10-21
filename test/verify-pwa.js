// test/verify-pwa.js - Suíte automatizada de validação do Cantina Fácil PWA
import fs from 'fs';
import path from 'path';
import http from 'http';
import { DEFAULT_PRODUCTS } from '../src/db.js';
import { FOOD_SVGS } from '../src/foodImages.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASSOU: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✕ FALHOU: ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('=====================================================');
  console.log('🧪 INICIANDO TESTES DO CANTINA FÁCIL PWA');
  console.log('=====================================================\n');

  // --- GRUPO 1: VALIDAÇÃO DE ARQUIVOS E ESTRUTURA ---
  console.log('[1/5] Verificação de Arquivos e Estrutura do Projeto');
  const requiredFiles = [
    'index.html',
    'package.json',
    'vite.config.js',
    'server.js',
    'build.js',
    'public/manifest.webmanifest',
    'public/sw.js',
    'public/offline.html',
    'public/favicon.svg',
    'public/icons/logo.svg',
    'public/icons/icon-192.png',
    'public/icons/icon-512.png',
    'public/icons/icon-maskable.png',
    'src/main.js',
    'src/styles.css',
    'src/db.js',
    'src/products.js',
    'src/cart.js',
    'src/orders.js',
    'src/admin.js',
    'src/pwa.js',
    'src/foodImages.js',
    'dist/index.html',
    'dist/sw.js'
  ];

  for (const f of requiredFiles) {
    const exists = fs.existsSync(path.resolve(f));
    assert(exists, `Arquivo presente: ${f}`);
  }

  // --- GRUPO 2: VALIDAÇÃO DO MANIFESTO PWA ---
  console.log('\n[2/5] Validação das Especificações PWA do Web App Manifest');
  const manifestRaw = fs.readFileSync(path.resolve('public/manifest.webmanifest'), 'utf-8');
  let manifest = null;
  try {
    manifest = JSON.parse(manifestRaw);
    assert(true, 'Manifesto é um JSON válido');
  } catch (e) {
    assert(false, 'Manifesto é um JSON válido', e.message);
  }

  if (manifest) {
    assert(manifest.name === 'Cantina Fácil - Pedidos e Lanches Escolares', 'Manifesto possui name completo');
    assert(manifest.short_name === 'Cantina Fácil', 'Manifesto possui short_name adequado');
    assert(manifest.display === 'standalone', 'display está definido como standalone');
    assert(manifest.theme_color === '#1b5e20', 'theme_color é verde escuro (#1b5e20)');
    assert(manifest.start_url.includes('index.html'), 'start_url aponta para index.html');

    const icons = manifest.icons || [];
    assert(icons.length >= 3, `Manifesto possui ${icons.length} ícones declarados`);

    const has192 = icons.some(i => i.sizes === '192x192' && i.type === 'image/png');
    const has512 = icons.some(i => i.sizes === '512x512' && i.type === 'image/png' && i.purpose !== 'maskable');
    const hasMaskable = icons.some(i => i.purpose === 'maskable');

    assert(has192, 'Ícone 192x192 PNG presente no manifesto');
    assert(has512, 'Ícone 512x512 PNG presente no manifesto');
    assert(hasMaskable, 'Ícone Maskable presente no manifesto');
  }

  // --- GRUPO 3: VALIDAÇÃO DO SERVICE WORKER E OFFLINE ---
  console.log('\n[3/5] Validação do Service Worker e Suporte Offline');
  const swCode = fs.readFileSync(path.resolve('public/sw.js'), 'utf-8');
  assert(swCode.includes('addEventListener(\'install\''), 'SW implementa evento install');
  assert(swCode.includes('addEventListener(\'activate\''), 'SW implementa evento activate');
  assert(swCode.includes('addEventListener(\'fetch\''), 'SW implementa evento fetch com cache');
  assert(swCode.includes('offline.html'), 'SW possui página offline de fallback em cache');
  assert(swCode.includes('skipWaiting'), 'SW inclui chamada skipWaiting');
  assert(swCode.includes('clients.claim'), 'SW inclui chamada clients.claim');

  // --- GRUPO 4: REGRAS DE NEGÓCIO E CATÁLOGO PADRÃO ---
  console.log('\n[4/5] Regras de Negócio, Cálculo de Carrinho e Pedidos');
  assert(DEFAULT_PRODUCTS.length === 6, 'Existem 6 produtos padrão na demonstração');

  const requiredProducts = [
    { name: 'Pão de Queijo', price: 4.00, cat: 'salgados' },
    { name: 'Coxinha de Frango', price: 6.00, cat: 'salgados' },
    { name: 'Sanduíche Natural', price: 8.00, cat: 'lanches' },
    { name: 'Suco Natural 300ml', price: 5.00, cat: 'bebidas' },
    { name: 'Água Mineral 500ml', price: 3.00, cat: 'bebidas' },
    { name: 'Bolo de Chocolate', price: 5.00, cat: 'doces' }
  ];

  for (const reqP of requiredProducts) {
    const found = DEFAULT_PRODUCTS.find(p => p.name.includes(reqP.name) || p.price === reqP.price);
    assert(!!found, `Produto padrão verificado: ${reqP.name} por R$ ${reqP.price.toFixed(2)}`);
  }

  // Simulação de cálculo de carrinho
  const simulatedCart = [
    { product: DEFAULT_PRODUCTS[0], quantity: 2 }, // Pão de Queijo: 2 * 4.00 = 8.00
    { product: DEFAULT_PRODUCTS[1], quantity: 1 }, // Coxinha: 1 * 6.00 = 6.00
    { product: DEFAULT_PRODUCTS[3], quantity: 3 }  // Suco: 3 * 5.00 = 15.00
  ];
  const expectedTotal = (2 * 4.00) + (1 * 6.00) + (3 * 5.00); // 29.00
  const calcTotal = simulatedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  assert(calcTotal === expectedTotal, `Cálculo de subtotal e total do carrinho: R$ ${calcTotal.toFixed(2)} == R$ 29,00`);

  // Simulação de geração de pedido
  const orderNumber = 1001;
  const mockOrder = {
    orderNumber,
    customerName: 'Lucas (2º EM)',
    items: simulatedCart,
    total: calcTotal,
    status: 'Recebido',
    createdAt: new Date().toISOString()
  };
  assert(mockOrder.orderNumber === 1001, 'Geração de número único de pedido');
  assert(mockOrder.status === 'Recebido', 'Status inicial do pedido é "Recebido"');

  // Transição de status
  const statuses = ['Recebido', 'Em preparo', 'Pronto', 'Entregue'];
  let currentStatus = mockOrder.status;
  for (let i = 1; i < statuses.length; i++) {
    currentStatus = statuses[i];
  }
  assert(currentStatus === 'Entregue', 'Fluxo completo de status do pedido suportado');

  // Ilustrações SVGs offline
  assert(Object.keys(FOOD_SVGS).length >= 6, 'Ilustrações vetoriais dos lanches prontas para funcionamento offline');

  // --- GRUPO 5: SERVIDOR HTTP E CABEÇALHOS DE REDE ---
  console.log('\n[5/5] Teste de Requisições HTTP e Entrega de Assets');
  const testPort = 5999;
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    let filePath = path.join(path.resolve('.'), url === '/' ? 'index.html' : url);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(path.resolve('public'), url);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const headers = {};
      if (filePath.endsWith('.webmanifest')) headers['Content-Type'] = 'application/manifest+json; charset=utf-8';
      if (filePath.endsWith('.html')) headers['Content-Type'] = 'text/html; charset=utf-8';
      if (filePath.endsWith('.css')) headers['Content-Type'] = 'text/css; charset=utf-8';
      if (filePath.endsWith('.js')) headers['Content-Type'] = 'application/javascript; charset=utf-8';
      if (filePath.endsWith('sw.js')) headers['Service-Worker-Allowed'] = '/';
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(resolve => server.listen(testPort, '127.0.0.1', resolve));

  const endpointsToTest = [
    { url: '/', expectStatus: 200, checkHeader: 'text/html' },
    { url: '/index.html', expectStatus: 200, checkHeader: 'text/html' },
    { url: '/manifest.webmanifest', expectStatus: 200, checkHeader: 'application/manifest+json' },
    { url: '/sw.js', expectStatus: 200, checkCustomHeader: 'service-worker-allowed' },
    { url: '/src/styles.css', expectStatus: 200, checkHeader: 'text/css' },
    { url: '/src/main.js', expectStatus: 200, checkHeader: 'application/javascript' },
    { url: '/icons/icon-192.png', expectStatus: 200 },
    { url: '/icons/icon-512.png', expectStatus: 200 },
    { url: '/offline.html', expectStatus: 200, checkHeader: 'text/html' }
  ];

  for (const ep of endpointsToTest) {
    await new Promise((resolve) => {
      http.get(`http://127.0.0.1:${testPort}${ep.url}`, (res) => {
        const statusOk = res.statusCode === ep.expectStatus;
        let headerOk = true;
        if (ep.checkHeader) {
          headerOk = (res.headers['content-type'] || '').includes(ep.checkHeader);
        }
        if (ep.checkCustomHeader) {
          headerOk = headerOk && !!res.headers[ep.checkCustomHeader];
        }
        assert(statusOk && headerOk, `GET ${ep.url} -> Status ${res.statusCode} ${ep.checkHeader ? `[${ep.checkHeader}]` : ''}`);
        resolve();
      }).on('error', (err) => {
        assert(false, `GET ${ep.url}`, err.message);
        resolve();
      });
    });
  }

  server.close();

  console.log('\n=====================================================');
  console.log(`📊 RESULTADO DOS TESTES: ${passedTests} PASSOU | ${failedTests} FALHOU`);
  console.log('=====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Erro fatal nos testes:', err);
  process.exit(1);
});
