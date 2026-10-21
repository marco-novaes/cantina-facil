// src/foodImages.js - Ilustrações vetoriais (SVG) e ícones para a Cantina Fácil
// Funciona 100% offline, ultra-leve e sem quebrar por falta de internet.

export const FOOD_SVGS = {
  'pao-de-queijo': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pq-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe082" />
          <stop offset="60%" stop-color="#ffb300" />
          <stop offset="100%" stop-color="#d48800" />
        </radialGradient>
        <radialGradient id="pq-spot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#8d4004" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#8d4004" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="98" rx="42" ry="12" fill="rgba(0,0,0,0.12)" />
      <!-- Pão de queijo forma irregular -->
      <path d="M 60,25 C 85,24 102,40 102,62 C 102,84 86,96 60,96 C 34,96 18,84 18,62 C 18,40 35,26 60,25 Z" fill="url(#pq-grad)" />
      <!-- Queijinho tostado / furinhos -->
      <circle cx="48" cy="45" r="4.5" fill="url(#pq-spot)" />
      <circle cx="75" cy="52" r="5.5" fill="url(#pq-spot)" />
      <circle cx="58" cy="68" r="6" fill="url(#pq-spot)" />
      <circle cx="36" cy="62" r="3.5" fill="url(#pq-spot)" />
      <circle cx="82" cy="72" r="4" fill="url(#pq-spot)" />
      <path d="M 50,34 Q 58,38 66,33" stroke="#fff9c4" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
    </svg>
  `,

  'coxinha': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cox-grad" cx="40%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ffc107" />
          <stop offset="65%" stop-color="#f57c00" />
          <stop offset="100%" stop-color="#bf360c" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="98" rx="38" ry="11" fill="rgba(0,0,0,0.14)" />
      <!-- Formato de gota da coxinha brasileira -->
      <path d="M 60,20 C 64,28 88,60 88,78 C 88,94 76,98 60,98 C 44,98 32,94 32,78 C 32,60 56,28 60,20 Z" fill="url(#cox-grad)" />
      <!-- Brilho e textura crocante -->
      <path d="M 58,26 C 59,33 52,48 44,60 C 40,66 40,76 43,82" stroke="#fff3e0" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.5" />
      <circle cx="68" cy="70" r="2" fill="#e65100" opacity="0.6"/>
      <circle cx="55" cy="80" r="2.5" fill="#e65100" opacity="0.6"/>
      <circle cx="72" cy="82" r="1.8" fill="#e65100" opacity="0.6"/>
    </svg>
  `,

  'sanduiche': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="100" rx="46" ry="10" fill="rgba(0,0,0,0.12)" />
      <!-- Pão base -->
      <path d="M 22,80 L 98,80 C 98,80 94,92 60,92 C 26,92 22,80 22,80 Z" fill="#bcaaa4" />
      <path d="M 24,78 L 96,78 C 96,78 93,88 60,88 C 27,88 24,78 24,78 Z" fill="#d7ccc8" />
      <!-- Alface ondulada -->
      <path d="M 18,74 Q 28,68 38,75 Q 48,68 58,74 Q 68,67 78,75 Q 88,68 98,74 Q 104,78 98,80 L 22,80 Z" fill="#4caf50" />
      <!-- Tomate -->
      <rect x="26" y="66" width="30" height="7" rx="3.5" fill="#e53935" />
      <rect x="64" y="66" width="30" height="7" rx="3.5" fill="#e53935" />
      <!-- Queijo derretendo -->
      <path d="M 20,62 L 100,62 L 96,68 L 82,72 L 74,66 L 56,71 L 46,65 L 34,70 L 22,66 Z" fill="#fbc02d" />
      <!-- Peito de peru -->
      <rect x="22" y="55" width="76" height="7" rx="3.5" fill="#d87a7a" />
      <!-- Pão topo triangular/arredondado -->
      <path d="M 22,55 C 22,55 20,34 60,32 C 100,34 98,55 98,55 Z" fill="#a1887f" />
      <path d="M 24,53 C 24,53 23,36 60,35 C 97,36 96,53 96,53 Z" fill="#bcaaa4" />
      <!-- Gergelim -->
      <ellipse cx="48" cy="42" rx="2" ry="1.2" fill="#fff9c4" transform="rotate(-15,48,42)" />
      <ellipse cx="60" cy="40" rx="2" ry="1.2" fill="#fff9c4" />
      <ellipse cx="72" cy="43" rx="2" ry="1.2" fill="#fff9c4" transform="rotate(20,72,43)" />
      <ellipse cx="54" cy="48" rx="2" ry="1.2" fill="#fff9c4" transform="rotate(10,54,48)" />
    </svg>
  `,

  'suco': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="juice-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff9800" />
          <stop offset="50%" stop-color="#ffa726" />
          <stop offset="100%" stop-color="#f57c00" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="102" rx="30" ry="8" fill="rgba(0,0,0,0.12)" />
      <!-- Canudo listrado -->
      <path d="M 68,16 L 82,10 L 86,16 L 73,22 L 66,75" stroke="#4caf50" stroke-width="5" stroke-linecap="round" fill="none" />
      <path d="M 68,16 L 82,10 L 86,16 L 73,22 L 66,75" stroke="#ffffff" stroke-width="5" stroke-dasharray="6,6" stroke-linecap="round" fill="none" />
      <!-- Copo de vidro transparente -->
      <path d="M 36,36 L 44,96 C 44,99 50,101 60,101 C 70,101 76,99 76,96 L 84,36 Z" fill="rgba(224,242,254,0.3)" stroke="#90caf9" stroke-width="2.5" />
      <!-- Líquido de suco -->
      <path d="M 38,48 L 44,95 C 44,97 50,99 60,99 C 70,99 76,97 76,95 L 82,48 C 76,51 68,52 60,52 C 52,52 44,51 38,48 Z" fill="url(#juice-grad)" />
      <!-- Gelo boiando -->
      <rect x="46" y="54" width="12" height="12" rx="3" fill="#ffffff" opacity="0.6" transform="rotate(12,46,54)" />
      <rect x="62" y="58" width="11" height="11" rx="3" fill="#ffffff" opacity="0.5" transform="rotate(-15,62,58)" />
      <!-- Rodela de laranja na borda -->
      <circle cx="37" cy="38" r="14" fill="#ff9800" stroke="#fff3e0" stroke-width="2" />
      <circle cx="37" cy="38" r="10" fill="#ffa726" />
      <!-- Brilho no copo -->
      <path d="M 42,42 L 48,90" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    </svg>
  `,

  'agua': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="water-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#b3e5fc" />
          <stop offset="50%" stop-color="#e1f5fe" />
          <stop offset="100%" stop-color="#81d4fa" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="104" rx="26" ry="7" fill="rgba(0,0,0,0.12)" />
      <!-- Garrafinha pet com relevos -->
      <rect x="52" y="16" width="16" height="8" rx="2" fill="#0288d1" /> <!-- Tampa azul -->
      <rect x="54" y="24" width="12" height="6" fill="#e0e0e0" /> <!-- Gargalo -->
      <!-- Corpo garrafa -->
      <path d="M 54,30 C 44,34 42,42 42,50 L 44,65 C 46,68 44,72 43,76 L 43,96 C 43,101 48,103 60,103 C 72,103 77,101 77,96 L 77,76 C 76,72 74,68 76,65 L 78,50 C 78,42 76,34 66,30 Z" fill="url(#water-grad)" stroke="#29b6f6" stroke-width="1.8" />
      <!-- Rótulo Cantina -->
      <path d="M 43,62 L 77,62 L 77,78 L 43,78 Z" fill="#0288d1" />
      <text x="60" y="73" fill="#ffffff" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">ÁGUA</text>
      <!-- Gotas d'água refrescantes -->
      <circle cx="50" cy="48" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="70" cy="53" r="1.8" fill="#ffffff" opacity="0.8" />
      <circle cx="52" cy="86" r="2" fill="#ffffff" opacity="0.8" />
      <!-- Reflexo de luz -->
      <path d="M 47,38 L 47,56" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </svg>
  `,

  'bolo': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="choc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4e342e" />
          <stop offset="100%" stop-color="#3e2723" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="100" rx="45" ry="11" fill="rgba(0,0,0,0.14)" />
      <!-- Pratinho -->
      <ellipse cx="60" cy="95" rx="46" ry="10" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="1.5" />
      <!-- Fatia de bolo triangular -->
      <!-- Camada inferior de massa -->
      <path d="M 22,80 L 85,88 L 102,68 L 40,62 Z" fill="#5d4037" />
      <!-- Recheio de brigadeiro -->
      <path d="M 23,73 L 86,81 L 101,63 L 41,57 Z" fill="#3e2723" />
      <!-- Camada superior de massa -->
      <path d="M 24,66 L 87,74 L 100,56 L 42,50 Z" fill="#5d4037" />
      <!-- Cobertura superior de chocolate brilhante -->
      <path d="M 24,62 L 94,40 L 100,56 L 24,66 Z" fill="url(#choc-grad)" />
      <!-- Cobertura escorrendo na lateral -->
      <path d="M 24,62 C 24,62 30,69 36,63 C 42,67 48,62 54,65 C 60,61 68,66 74,62 C 80,65 85,61 88,64 L 88,58 L 24,58 Z" fill="#3e2723" />
      <!-- Granulados coloridos por cima -->
      <rect x="42" y="55" width="5" height="2" rx="1" fill="#ffeb3b" transform="rotate(25,42,55)" />
      <rect x="58" y="52" width="5" height="2" rx="1" fill="#e91e63" transform="rotate(-30,58,52)" />
      <rect x="74" y="48" width="5" height="2" rx="1" fill="#4caf50" transform="rotate(15,74,48)" />
      <rect x="50" y="58" width="5" height="2" rx="1" fill="#03a9f4" transform="rotate(45,50,58)" />
      <rect x="66" y="55" width="5" height="2" rx="1" fill="#ff9800" transform="rotate(-10,66,55)" />
      <!-- Cereja no topo -->
      <circle cx="82" cy="42" r="7" fill="#d32f2f" />
      <circle cx="80" cy="40" r="2" fill="#ffffff" opacity="0.6" />
      <path d="M 82,36 Q 90,26 95,24" stroke="#388e3c" stroke-width="2" stroke-linecap="round" fill="none" />
    </svg>
  `,

  'default': `
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="98" rx="38" ry="10" fill="rgba(0,0,0,0.1)" />
      <!-- Prato cloche cantina -->
      <path d="M 25,82 L 95,82 C 95,82 92,90 60,90 C 28,90 25,82 25,82 Z" fill="#cfd8dc" />
      <path d="M 28,80 C 28,45 92,45 92,80 Z" fill="#eceff1" stroke="#b0bec5" stroke-width="2" />
      <circle cx="60" cy="40" r="6" fill="#90a4ae" />
      <path d="M 40,65 Q 60,55 80,65" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"/>
    </svg>
  `
};

export function getProductSvg(imageKey) {
  if (imageKey && FOOD_SVGS[imageKey]) {
    return FOOD_SVGS[imageKey];
  }
  return FOOD_SVGS['default'];
}
