# Cantina Fácil — Progressive Web App (PWA) 🥪📱

**Cantina Fácil** é uma aplicação web progressiva (PWA) moderna, rápida e 100% funcional, desenvolvida especificamente para cantinas escolares. O sistema opera com arquitetura *offline-first*, persistência local em **IndexedDB**, design mobile-first e instalação nativa em celulares Android, tablets e computadores.

---

## 🌟 Principais Recursos

- **📱 PWA 100% Instalável:** Manifesto Web App (`manifest.webmanifest`), ícones de 192x192, 512x512 e maskable, tema verde cantina (`#1b5e20`) e exibição `standalone` em tela cheia (sem barra de URL).
- **📡 Funcionamento Offline Completo:** Service Worker (`sw.js`) com cache de todos os recursos essenciais e página de fallback (`offline.html`). O cardápio, carrinho e pedidos continuam operando mesmo sem internet.
- **🥪 Cardápio Completo com Ilustrações Vetoriais:** Cards com gráficos SVG integrados (Pão de queijo, Coxinha, Sanduíche, Suco, Água, Bolo). Não quebra offline por falta de conexão.
- **🛒 Carrinho de Compras Interativo:** Controle de quantidades (`+` e `-`), cálculo automático de subtotal e total, remoção de itens e limpeza com confirmação.
- **📝 Finalização de Pedido com Comprovante:** Identificação do cliente (nome/apelido), seleção do horário de retirada (recreio da manhã, almoço, recreio da tarde, balcão), observações e geração de número único sequencial (`#1001`, `#1002`...).
- **📋 Acompanhamento em "Meus Pedidos":** Histórico de pedidos salvos no dispositivo com badges coloridos de status: *Recebido*, *Em preparo*, *Pronto* e *Entregue*.
- **⚙️ Painel de Gestão da Cantina (Demonstrativo):**
  - Cadastro de novos lanches e edição de preços/ingredientes;
  - Pausa de itens esgotados (botão rápido Disponível/Esgotado);
  - Alteração de status dos pedidos em tempo real;
  - Relatório de métricas: Total de Vendas (R$), Quantidade de Pedidos, Ticket Médio e Lanche Mais Pedido;
  - Botão de restauração dos dados padrão da demonstração.

---

## 🏗️ Estrutura do Projeto

```text
cantina-facil/
├── index.html               # Estrutura principal da aplicação (SPA)
├── package.json             # Metadados e scripts de execução/build/testes
├── vite.config.js           # Configuração de build moderna com Vite
├── server.js                # Servidor HTTP nativo Node.js (zero dependências)
├── build.js                 # Script de compilação da versão de produção (dist)
├── README.md                # Documentação completa em português
│
├── public/                  # Arquivos estáticos servidos diretamente
│   ├── manifest.webmanifest # Manifesto oficial do PWA
│   ├── sw.js                # Service Worker para cache e tolerância offline
│   ├── offline.html         # Página de contingência para conexões perdidas
│   ├── favicon.svg          # Favicon vetorial da aplicação
│   └── icons/
│       ├── icon-192.png     # Ícone PWA padrão (192x192)
│       ├── icon-512.png     # Ícone PWA alta resolução (512x512)
│       ├── icon-maskable.png# Ícone adaptativo para Android (512x512)
│       └── logo.svg         # Logotipo vetorial oficial Cantina Fácil
│
├── src/                     # Código-fonte modular (JavaScript Moderno & CSS)
│   ├── main.js              # Inicialização do app, navegação por abas e toasts
│   ├── styles.css           # Design mobile-first (Verde Cantina, Amarelo e Branco)
│   ├── db.js                # Camada IndexedDB com Promises para produtos e pedidos
│   ├── products.js          # Catálogo de lanches, filtros de busca e categorias
│   ├── cart.js              # Estado do carrinho e sincronização local
│   ├── orders.js            # Registro de pedidos, comprovante e histórico
│   ├── admin.js             # Painel de gestão da cantina (produtos, pedidos, métricas)
│   ├── pwa.js               # Captura de evento de instalação e detector de rede
│   └── foodImages.js        # Ilustrações vetoriais (SVG) offline para os alimentos
│
├── test/
│   └── verify-pwa.js        # Suíte de testes automatizados (61 validações)
│
└── dist/                    # Versão de produção compilada e minificada
```

---

## 🚀 Como Executar o Projeto

O projeto foi construído para ser **100% resiliente**: funciona imediatamente com o **Node.js** já instalado na máquina, sem necessidade de direitos de administrador ou downloads adicionais!

### Opção 1: Servidor Nativo (Recomendado — Início Imediato)

Abra o terminal no diretório do projeto e execute:

```bash
# Iniciar o servidor de desenvolvimento
node server.js
```

Ou usando o comando npm:

```bash
npm run dev
```

O terminal exibirá os endereços de acesso:
- **No próprio computador:** `http://localhost:5173`
- **No celular (mesma rede Wi-Fi):** `http://[IP-DO-COMPUTADOR]:5173` *(ex: `http://192.168.0.98:5173`)*

---

### Opção 2: Compilar e Testar a Versão de Produção (`dist/`)

Para gerar e validar a versão final otimizada para publicação:

```bash
# 1. Compilar os arquivos para a pasta dist/
node build.js
# ou: npm run build

# 2. Executar o servidor apontando para a pasta de produção
node server.js --dist
# ou: npm run preview
```

---

### Opção 3: Alternativa com Python (Sem Node.js)

Se estiver em um computador sem Node.js:

```bash
python -m http.server 5173
```
E acesse `http://localhost:5173` no navegador.

---

## 📲 Como Instalar no Celular Android

1. Conecte o celular na **mesma rede Wi-Fi** do computador de desenvolvimento.
2. No celular, abra o **Google Chrome** (ou Samsung Internet).
3. Digite o endereço de rede exibido no terminal, por exemplo: `http://192.168.0.98:5173`.
4. Uma barra inferior ou o botão **"📲 Instalar"** no topo da página aparecerá automaticamente. Toque nele.
5. Caso o botão não apareça de imediato:
   - Toque no menu de **três pontinhos (⋮)** no canto superior direito do Chrome;
   - Selecione a opção **"Instalar aplicativo"** (ou **"Adicionar à tela inicial"**);
   - Confirme a instalação.
6. O ícone da **Cantina Fácil** aparecerá na tela de aplicativos do seu celular.
7. Ao abrir, o app iniciará em **tela cheia (standalone)**, sem a barra de endereços do navegador, comportando-se exatamente como um aplicativo nativo!

---

## 💻 Como Instalar no Computador (Windows / Mac / Linux)

1. No navegador **Google Chrome** ou **Microsoft Edge**, acesse `http://localhost:5173`.
2. Observe o ícone de instalação no lado direito da barra de endereços (ícone de um monitor com uma seta).
3. Clique em **"Instalar Cantina Fácil"** ou clique no botão **"Instalar"** na barra superior da página.
4. O app passará a abrir em uma janela própria dedicada, podendo ser fixado na Barra de Tarefas do Windows.

---

## 🧪 Suíte de Testes Automatizados Executada

Para verificar a integridade completa do sistema, execute:

```bash
node test/verify-pwa.js
```

### Resultados dos Testes Obrigatórios:

| Grupo de Teste | Itens Verificados | Resultado |
| :--- | :--- | :---: |
| **1. Arquivos Essenciais** | `index.html`, `manifest.webmanifest`, `sw.js`, `db.js`, `cart.js`, `orders.js`, `admin.js`, ícones PNG/SVG e pasta `dist/` | **24/24 APROVADOS** |
| **2. Manifesto PWA** | JSON válido, `name`, `short_name`, `display: standalone`, `theme_color: #1b5e20`, ícones 192x192, 512x512 e maskable | **10/10 APROVADOS** |
| **3. Service Worker & Offline** | Eventos `install`, `activate`, `fetch`, fallback para `offline.html`, `skipWaiting` e `clients.claim` | **6/6 APROVADOS** |
| **4. Regras de Negócio e Banco** | 6 produtos padrão da cantina com preços exatos, cálculo de carrinho (R$ 29,00), geração do pedido `#1001`, transição de status | **12/12 APROVADOS** |
| **5. Servidor HTTP e Rede** | Resposta HTTP 200 para todas as rotas, cabeçalhos MIME corretos (`text/html`, `application/manifest+json`, `text/css`, etc.) e cabeçalho `Service-Worker-Allowed: /` | **9/9 APROVADOS** |
| **TOTAL GERAL** | **61 testes automatizados executados** | **61 PASSOU / 0 FALHOU** |

---

## 🛡️ Esclarecimento sobre o Armazenamento Local (IndexedDB)

Conforme os requisitos do projeto:
> *Os dados de produtos e pedidos são gravados no IndexedDB do navegador do aparelho onde o app está sendo executado.*
> 
> *Essa versão demonstra a experiência completa de uso de um PWA offline. Para um ambiente escolar real em produção com múltiplos aparelhos simultâneos, os pedidos seriam sincronizados com uma API central (ex: WebSocket ou Firebase/PostgreSQL) quando houvesse sinal de internet.*

---

## 👨‍🏫 Didática e Ensino Técnico

Este projeto foi estruturado com foco em alunos do **Ensino Médio Técnico em Desenvolvimento de Sistemas**:
- **JavaScript Moderno Modular (`import`/`export`)**: Sem frameworks complexos ou caixas-pretas;
- **IndexedDB Nativo com Promises**: Mostra como bancos de dados NoSQL funcionam no browser;
- **Arquitetura PWA Desmistificada**: Separação clara entre Web App Manifest, Service Worker Caching e Ciclo de Vida da Aplicação;
- **CSS Responsivo Moderno**: Uso de Flexbox, CSS Grid e Variáveis CSS (`--primary`, `--accent`) de fácil customização.
