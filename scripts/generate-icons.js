// scripts/generate-icons.js - Gera os ícones PNG e SVG para o PWA Cantina Fácil
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Tabela de CRC32 para chunk de PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  // Cabeçalho PNG padrão
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits por canal
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compressão padrão
  ihdrData[11] = 0; // Filtro padrão
  ihdrData[12] = 0; // Sem entrelaçamento
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Geração do buffer de pixels com desenho da Cantina Fácil
  // Cores:
  // Verde escuro principal: #1b5e20 (27, 94, 32)
  // Verde médio: #2e7d32 (46, 125, 50)
  // Amarelo dourado: #fbc02d (251, 192, 45)
  // Amarelo claro: #fff9c4 (255, 249, 196)
  // Branco: #ffffff (255, 255, 255)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.48 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filtro 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 27, g = 94, b = 32, a = 255; // Fundo verde escuro cantina

      if (!isMaskable && dist > radius) {
        // Canto arredondado ou transparente para ícone normal
        if (dist > radius + 1) {
          a = 0;
        } else {
          a = Math.floor(255 * (1 - (dist - radius)));
        }
      } else {
        // Fundo com suave gradiente radial interno
        const factor = Math.min(1, dist / radius);
        r = Math.floor(27 + factor * 19);  // 27 -> 46
        g = Math.floor(94 + factor * 31);  // 94 -> 125
        b = Math.floor(32 + factor * 18);  // 32 -> 50

        // Borda dourada
        if (dist >= radius - 8 && dist <= radius) {
          r = 251; g = 192; b = 45; // Dourado #fbc02d
        }

        // Desenhar Prato / Cloche da Cantina e Maçã / Lanche estilizado no centro
        // 1. Base do prato / cloche: arco inferior
        const clocheY = cy + height * 0.08;
        const clocheR = width * 0.22;
        if (y >= clocheY && y <= clocheY + height * 0.04 && Math.abs(dx) <= clocheR + 10) {
          r = 251; g = 192; b = 45; // Bandeja dourada
        }

        // 2. Tampa da cloche (cúpula)
        const domeDy = y - clocheY;
        if (domeDy <= 0 && (dx * dx + domeDy * domeDy <= clocheR * clocheR)) {
          // Cúpula do prato
          const dCloche = Math.sqrt(dx * dx + domeDy * domeDy);
          if (dCloche >= clocheR - 6) {
            r = 255; g = 249; b = 196; // Borda amarela clara
          } else {
            r = 255; g = 255; b = 255; // Interior branco
          }
        }

        // 3. Puxador da cloche no topo
        const handleCy = clocheY - clocheR;
        const dHandle = Math.sqrt(dx * dx + (y - handleCy) * (y - handleCy));
        if (dHandle <= width * 0.04) {
          r = 251; g = 192; b = 45;
        }

        // 4. Garfo e Colher / Letra "C" e "F" ou lanche
        // No interior da cloche desenhamos um detalhe verde
        if (y < clocheY - 10 && y > clocheY - clocheR + 15 && Math.abs(dx) < clocheR - 15) {
          // Letra C ou folha
          const leafDist = Math.sqrt((dx + 12) * (dx + 12) + (y - (clocheY - 35)) * (y - (clocheY - 35)));
          if (leafDist < width * 0.07) {
            r = 46; g = 125; b = 50; // Verde
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Criar pasta de saída
const iconsDir = path.resolve('public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Gerar PNGs
const png192 = generatePNG(192, 192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
console.log('✓ icon-192.png gerado com sucesso (' + png192.length + ' bytes)');

const png512 = generatePNG(512, 512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
console.log('✓ icon-512.png gerado com sucesso (' + png512.length + ' bytes)');

const pngMaskable = generatePNG(512, 512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.png'), pngMaskable);
console.log('✓ icon-maskable.png gerado com sucesso (' + pngMaskable.length + ' bytes)');

// Gerar SVG do Logotipo e Favicon
const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 240 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b5e20" />
      <stop offset="100%" stop-color="#2e7d32" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>

  <!-- Fundo Circular Verde Cantina -->
  <circle cx="120" cy="120" r="112" fill="url(#bgGrad)" filter="url(#shadow)" />
  <circle cx="120" cy="120" r="106" fill="none" stroke="#fbc02d" stroke-width="4" stroke-dasharray="8,6" />

  <!-- Prato Cloche de Cantina -->
  <!-- Base / Prato dourado -->
  <ellipse cx="120" cy="158" rx="68" ry="14" fill="#fbc02d" />
  <ellipse cx="120" cy="155" rx="64" ry="11" fill="#fff9c4" />

  <!-- Cúpula / Cloche branca brilhante -->
  <path d="M 64,152 C 64,96 176,96 176,152 Z" fill="#ffffff" />
  <path d="M 68,150 C 70,102 172,102 172,150 Z" fill="#f4f6f8" />
  
  <!-- Puxador dourado -->
  <circle cx="120" cy="94" r="11" fill="#fbc02d" stroke="#fff9c4" stroke-width="2.5" />

  <!-- Vapor / Aroma saboroso -->
  <path d="M 104,78 Q 98,66 106,56 Q 112,46 104,36" stroke="#fff9c4" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85" />
  <path d="M 120,74 Q 126,62 118,52 Q 112,42 120,32" stroke="#fff9c4" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.95" />
  <path d="M 136,78 Q 142,66 134,56 Q 128,46 136,36" stroke="#fff9c4" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85" />

  <!-- Talheres entrecruzados ou folhinha fresca -->
  <path d="M 120,128 C 114,120 112,112 120,108 C 128,112 126,120 120,128 Z" fill="#2e7d32" />
  <path d="M 120,128 L 120,138" stroke="#1b5e20" stroke-width="2.5" stroke-linecap="round" />

  <!-- Faixa de texto no rodapé -->
  <path d="M 44,185 L 196,185 C 196,185 180,205 120,205 C 60,205 44,185 44,185 Z" fill="#fbc02d" />
  <text x="120" y="199" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#1b5e20" text-anchor="middle" letter-spacing="1.5">CANTINA FÁCIL</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'logo.svg'), logoSvg);
fs.writeFileSync(path.resolve('public', 'favicon.svg'), logoSvg);
console.log('✓ logo.svg e favicon.svg gerados com sucesso');
