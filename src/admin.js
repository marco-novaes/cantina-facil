// src/admin.js - Painel administrativo demonstrativo da Cantina Fácil
import { db, DEFAULT_PRODUCTS } from './db.js';
import { catalog } from './products.js';
import { orders } from './orders.js';

export class AdminPanel {
  constructor() {
    this.container = null;
    this.activeTab = 'products'; // 'products', 'orders', 'stats'
    this.statusFilter = 'all';
    this.editingProduct = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.setupModal();
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="admin-wrapper">
        <header class="admin-header">
          <div class="admin-title-row">
            <h2>Gestão da Cantina</h2>
            <span class="badge badge-warning">Modo Demonstração Local</span>
          </div>
          <p class="admin-notice">
            ⚠️ <strong>Atenção:</strong> Os dados abaixo estão salvos localmente neste navegador (IndexedDB). Não há sincronização na nuvem nem login seguro nesta versão demonstrativa.
          </p>

          <nav class="admin-nav-tabs">
            <button class="admin-tab-btn ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
              🍔 Produtos
            </button>
            <button class="admin-tab-btn ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
              📦 Pedidos
            </button>
            <button class="admin-tab-btn ${this.activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
              📊 Relatórios
            </button>
          </nav>
        </header>

        <main class="admin-content-area" id="admin-main-body">
          <div class="admin-loading">Carregando dados...</div>
        </main>
      </div>
    `;

    // Eventos das abas do admin
    this.container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.getAttribute('data-tab'));
      });
    });

    const body = this.container.querySelector('#admin-main-body');

    if (this.activeTab === 'products') {
      await this.renderProductsTab(body);
    } else if (this.activeTab === 'orders') {
      await this.renderOrdersTab(body);
    } else if (this.activeTab === 'stats') {
      await this.renderStatsTab(body);
    }
  }

  // --- ABA DE PRODUTOS ---
  async renderProductsTab(body) {
    const products = await db.getAllProducts();

    const rowsHtml = products.map(prod => {
      const isAvailable = prod.available !== false;
      return `
        <tr class="admin-product-row">
          <td>
            <strong>${this.escapeHtml(prod.name)}</strong>
            <div class="admin-prod-cat">${this.formatCategoryName(prod.category)}</div>
          </td>
          <td class="text-right">
            <strong>${Number(prod.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          </td>
          <td class="text-center">
            <button class="btn btn-sm ${isAvailable ? 'btn-success' : 'btn-outline-danger'} toggle-avail-btn" data-id="${prod.id}" data-current="${isAvailable}">
              ${isAvailable ? '✓ Disponível' : '✕ Esgotado'}
            </button>
          </td>
          <td class="text-right">
            <button class="btn btn-sm btn-secondary btn-edit-prod" data-id="${prod.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger btn-del-prod" data-id="${prod.id}">Excluir</button>
          </td>
        </tr>
      `;
    }).join('');

    body.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>Cardápio de Lanches (${products.length})</h3>
          <p class="admin-subtext">Edite preços, pause itens esgotados ou cadastre novidades.</p>
        </div>
        <div class="admin-action-buttons">
          <button class="btn btn-primary btn-sm" id="btn-admin-new-prod">＋ Novo Produto</button>
          <button class="btn btn-outline-secondary btn-sm" id="btn-admin-reset-prods">🔄 Restaurar Padrões</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th class="text-right">Preço</th>
              <th class="text-center">Status</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="4" class="text-center">Nenhum produto cadastrado.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    // Eventos
    body.querySelector('#btn-admin-new-prod')?.addEventListener('click', () => {
      this.openProductModal();
    });

    body.querySelector('#btn-admin-reset-prods')?.addEventListener('click', async () => {
      if (confirm('Deseja realmente restaurar os 6 produtos padrão da demonstração? Suas alterações de produtos serão sobrescritas.')) {
        await db.resetDefaultProducts();
        catalog.loadProducts();
        this.render();
      }
    });

    body.querySelectorAll('.toggle-avail-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const current = btn.getAttribute('data-current') === 'true';
        const prod = await db.getProduct(id);
        if (prod) {
          prod.available = !current;
          await db.saveProduct(prod);
          catalog.loadProducts();
          this.render();
        }
      });
    });

    body.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const prod = await db.getProduct(id);
        if (prod) {
          this.openProductModal(prod);
        }
      });
    });

    body.querySelectorAll('.btn-del-prod').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const prod = await db.getProduct(id);
        if (prod && confirm(`Tem certeza que deseja excluir o produto "${prod.name}"?`)) {
          await db.deleteProduct(id);
          catalog.loadProducts();
          this.render();
        }
      });
    });
  }

  // --- ABA DE PEDIDOS ---
  async renderOrdersTab(body) {
    const allOrders = await db.getAllOrders();

    const filtered = allOrders.filter(ord => {
      if (this.statusFilter === 'all') return true;
      return ord.status === this.statusFilter;
    });

    const statusOptions = ['Recebido', 'Em preparo', 'Pronto', 'Entregue'];

    const ordersCardsHtml = filtered.map(order => {
      const itemsList = (order.items || []).map(it => `${it.quantity}x ${it.name}`).join(', ');
      const totalFormatted = Number(order.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const dateFormatted = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

      return `
        <div class="admin-order-card" data-order-id="${order.id}">
          <div class="admin-order-card-top">
            <div>
              <span class="admin-order-num">#${order.orderNumber}</span>
              <span class="admin-order-client">${this.escapeHtml(order.customerName)}</span>
              <span class="admin-order-time">${dateFormatted}</span>
            </div>
            <div class="admin-order-status-select-wrap">
              <label for="status-sel-${order.id}" class="sr-only">Status</label>
              <select id="status-sel-${order.id}" class="admin-status-select" data-order-id="${order.id}">
                ${statusOptions.map(st => `
                  <option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="admin-order-card-meta">
            <div><strong>Retirada:</strong> ${this.escapeHtml(order.pickupOption)}</div>
            ${order.notes ? `<div><strong>Obs:</strong> <em>${this.escapeHtml(order.notes)}</em></div>` : ''}
            <div><strong>Itens:</strong> ${this.escapeHtml(itemsList)}</div>
          </div>

          <div class="admin-order-card-bottom">
            <span>Total: <strong>${totalFormatted}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    body.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>Pedidos da Cantina (${allOrders.length})</h3>
          <p class="admin-subtext">Acompanhe e altere o status de produção dos pedidos.</p>
        </div>
      </div>

      <div class="admin-filters-bar">
        <span class="filter-label">Filtrar por:</span>
        <div class="filter-chips">
          <button class="filter-chip ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">Todos (${allOrders.length})</button>
          <button class="filter-chip ${this.statusFilter === 'Recebido' ? 'active' : ''}" data-status="Recebido">Recebido</button>
          <button class="filter-chip ${this.statusFilter === 'Em preparo' ? 'active' : ''}" data-status="Em preparo">Em preparo</button>
          <button class="filter-chip ${this.statusFilter === 'Pronto' ? 'active' : ''}" data-status="Pronto">Pronto</button>
          <button class="filter-chip ${this.statusFilter === 'Entregue' ? 'active' : ''}" data-status="Entregue">Entregue</button>
        </div>
      </div>

      <div class="admin-orders-list">
        ${ordersCardsHtml.length > 0 ? ordersCardsHtml : `
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h4>Nenhum pedido encontrado</h4>
            <p>Nenhum pedido com o status selecionado.</p>
          </div>
        `}
      </div>
    `;

    // Filtros de status
    body.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.statusFilter = chip.getAttribute('data-status');
        this.renderOrdersTab(body);
      });
    });

    // Alteração de status
    body.querySelectorAll('.admin-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = select.getAttribute('data-order-id');
        const newStatus = e.target.value;
        await db.updateOrderStatus(orderId, newStatus);
        orders.loadOrderHistory();
      });
    });
  }

  // --- ABA DE RELATÓRIOS / ESTATÍSTICAS ---
  async renderStatsTab(body) {
    const stats = await db.getStats();

    body.innerHTML = `
      <div class="admin-section-header">
        <div>
          <h3>Métricas e Vendas Registradas</h3>
          <p class="admin-subtext">Resumo dos pedidos armazenados localmente no dispositivo.</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${stats.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div class="stat-label">Total em Vendas</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${stats.totalOrders}</div>
          <div class="stat-label">Total de Pedidos</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏷️</div>
          <div class="stat-value">${stats.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div class="stat-label">Ticket Médio</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value font-sm">${this.escapeHtml(stats.topItem)}</div>
          <div class="stat-label">Lanche Mais Pedido</div>
        </div>
      </div>

      <div class="status-summary-card">
        <h4>Distribuição por Status</h4>
        <div class="status-bars-list">
          <div class="status-bar-item">
            <div class="status-bar-header">
              <span>🟡 Recebido</span>
              <span>${stats.statusCount['Recebido']} pedidos</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill fill-warning" style="width: ${this.calcPercent(stats.statusCount['Recebido'], stats.totalOrders)}%"></div>
            </div>
          </div>

          <div class="status-bar-item">
            <div class="status-bar-header">
              <span>🔵 Em preparo</span>
              <span>${stats.statusCount['Em preparo']} pedidos</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill fill-info" style="width: ${this.calcPercent(stats.statusCount['Em preparo'], stats.totalOrders)}%"></div>
            </div>
          </div>

          <div class="status-bar-item">
            <div class="status-bar-header">
              <span>🟢 Pronto</span>
              <span>${stats.statusCount['Pronto']} pedidos</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill fill-success" style="width: ${this.calcPercent(stats.statusCount['Pronto'], stats.totalOrders)}%"></div>
            </div>
          </div>

          <div class="status-bar-item">
            <div class="status-bar-header">
              <span>⚪ Entregue</span>
              <span>${stats.statusCount['Entregue']} pedidos</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill fill-neutral" style="width: ${this.calcPercent(stats.statusCount['Entregue'], stats.totalOrders)}%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  calcPercent(part, total) {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  // --- MODAL DE PRODUTO (NOVO / EDITAR) ---
  setupModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    const form = modal.querySelector('#product-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.querySelector('#prod-name-input').value.trim();
      const price = parseFloat(form.querySelector('#prod-price-input').value);
      const category = form.querySelector('#prod-cat-input').value;
      const description = form.querySelector('#prod-desc-input').value.trim();
      const imageKey = form.querySelector('#prod-icon-input').value;
      const available = form.querySelector('#prod-avail-input').checked;

      if (!name) {
        alert('O nome do produto é obrigatório.');
        return;
      }
      if (isNaN(price) || price < 0) {
        alert('Informe um preço válido (não pode ser negativo).');
        return;
      }

      const id = this.editingProduct ? this.editingProduct.id : ('prod-' + Date.now());

      const productData = {
        id,
        name,
        price,
        category,
        description,
        imageKey: imageKey || 'default',
        available
      };

      await db.saveProduct(productData);
      modal.classList.remove('active');
      this.editingProduct = null;

      catalog.loadProducts();
      this.render();
    });
  }

  openProductModal(product = null) {
    this.editingProduct = product;
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const modalTitle = modal.querySelector('#product-modal-title');
    const form = modal.querySelector('#product-form');

    if (product) {
      modalTitle.textContent = 'Editar Produto';
      form.querySelector('#prod-name-input').value = product.name || '';
      form.querySelector('#prod-price-input').value = product.price || '';
      form.querySelector('#prod-cat-input').value = product.category || 'salgados';
      form.querySelector('#prod-desc-input').value = product.description || '';
      form.querySelector('#prod-icon-input').value = product.imageKey || 'default';
      form.querySelector('#prod-avail-input').checked = product.available !== false;
    } else {
      modalTitle.textContent = 'Novo Produto';
      form.reset();
      form.querySelector('#prod-avail-input').checked = true;
      form.querySelector('#prod-icon-input').value = 'default';
    }

    modal.classList.add('active');
  }

  formatCategoryName(cat) {
    const map = {
      'salgados': 'Salgados',
      'lanches': 'Lanches',
      'bebidas': 'Bebidas',
      'doces': 'Doces'
    };
    return map[cat] || cat;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

export const admin = new AdminPanel();
