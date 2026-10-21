// src/orders.js - Gerenciamento de pedidos, histórico e confirmação
import { db } from './db.js';
import { cart } from './cart.js';
import { getProductSvg } from './foodImages.js';

export class OrderManager {
  constructor() {
    this.container = null;
    this.historyContainer = null;
  }

  init(historyContainerId) {
    this.historyContainer = document.getElementById(historyContainerId);
    this.loadOrderHistory();

    // Ouvir novos pedidos para atualizar histórico
    window.addEventListener('order:created', () => {
      this.loadOrderHistory();
    });
  }

  async createOrder({ customerName, pickupOption, notes }) {
    const name = (customerName || '').trim();
    if (!name) {
      throw new Error('Por favor, informe seu nome ou apelido para o pedido.');
    }

    const items = cart.getItems();
    if (items.length === 0) {
      throw new Error('O carrinho está vazio. Adicione itens antes de finalizar.');
    }

    const total = cart.getTotal();
    const orderItems = items.map(it => ({
      id: it.product.id,
      name: it.product.name,
      price: it.product.price,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
      imageKey: it.product.imageKey
    }));

    const orderPayload = {
      customerName: name,
      pickupOption: pickupOption || 'Retirada no Balcão (Imediata)',
      notes: (notes || '').trim(),
      items: orderItems,
      total: total,
      status: 'Recebido', // Recebido | Em preparo | Pronto | Entregue
      createdAt: new Date().toISOString()
    };

    const savedOrder = await db.saveOrder(orderPayload);

    // Limpar o carrinho
    cart.clear();

    // Disparar evento para atualizar interfaces
    window.dispatchEvent(new CustomEvent('order:created', { detail: { order: savedOrder } }));

    return savedOrder;
  }

  async loadOrderHistory() {
    if (!this.historyContainer) return;

    try {
      const orders = await db.getAllOrders();
      this.renderOrderHistory(orders);
    } catch (err) {
      console.error('Erro ao carregar histórico de pedidos:', err);
      this.historyContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Erro ao carregar pedidos</h3>
          <p>Não foi possível consultar os pedidos salvos no dispositivo.</p>
        </div>
      `;
    }
  }

  renderOrderHistory(orders) {
    if (!this.historyContainer) return;

    if (!orders || orders.length === 0) {
      this.historyContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Nenhum pedido realizado</h3>
          <p>Faça seu primeiro pedido e acompanhe o status aqui em tempo real!</p>
          <a href="#menu" class="btn btn-primary">Fazer um Pedido</a>
        </div>
      `;
      return;
    }

    this.historyContainer.innerHTML = orders.map(order => {
      const formattedDate = this.formatDate(order.createdAt);
      const formattedTotal = this.formatPrice(order.total);
      const statusClass = this.getStatusBadgeClass(order.status);
      const totalItems = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

      const itemsListHtml = (order.items || []).map(it => `
        <li class="order-item-row">
          <div class="order-item-name">
            <span class="order-item-qty">${it.quantity}x</span>
            <span>${this.escapeHtml(it.name)}</span>
          </div>
          <span class="order-item-price">${this.formatPrice(it.subtotal || (it.price * it.quantity))}</span>
        </li>
      `).join('');

      return `
        <article class="order-card" data-order-id="${order.id}">
          <header class="order-card-header">
            <div>
              <div class="order-number-title">Pedido #${order.orderNumber}</div>
              <div class="order-date-text">${formattedDate}</div>
            </div>
            <span class="badge ${statusClass}">${this.escapeHtml(order.status)}</span>
          </header>

          <div class="order-customer-meta">
            <div><strong>Cliente:</strong> ${this.escapeHtml(order.customerName)}</div>
            <div><strong>Retirada:</strong> ${this.escapeHtml(order.pickupOption)}</div>
            ${order.notes ? `<div><strong>Obs:</strong> <em>${this.escapeHtml(order.notes)}</em></div>` : ''}
          </div>

          <div class="order-items-collapse">
            <div class="order-items-header">
              <span>Itens (${totalItems})</span>
            </div>
            <ul class="order-items-list">
              ${itemsListHtml}
            </ul>
          </div>

          <footer class="order-card-footer">
            <span class="order-total-label">Total do Pedido:</span>
            <span class="order-total-val">${formattedTotal}</span>
          </footer>
        </article>
      `;
    }).join('');
  }

  showConfirmationModal(order) {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('#confirmation-modal-content');
    if (!modalBody) return;

    const formattedDate = this.formatDate(order.createdAt);
    const formattedTotal = this.formatPrice(order.total);
    const statusClass = this.getStatusBadgeClass(order.status);

    const itemsSummaryHtml = (order.items || []).map(it => `
      <div class="receipt-item-line">
        <span>${it.quantity}x ${this.escapeHtml(it.name)}</span>
        <span>${this.formatPrice(it.subtotal || (it.price * it.quantity))}</span>
      </div>
    `).join('');

    modalBody.innerHTML = `
      <div class="confirmation-success-icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h2 class="confirmation-title">Pedido Confirmado!</h2>
      <p class="confirmation-subtitle">Seu lanche foi registrado com sucesso.</p>

      <div class="order-highlight-box">
        <div class="order-highlight-label">NÚMERO DO PEDIDO</div>
        <div class="order-highlight-num">#${order.orderNumber}</div>
        <span class="badge ${statusClass}">${order.status}</span>
      </div>

      <div class="receipt-card">
        <div class="receipt-meta-line">
          <span><strong>Cliente:</strong></span>
          <span>${this.escapeHtml(order.customerName)}</span>
        </div>
        <div class="receipt-meta-line">
          <span><strong>Data e Hora:</strong></span>
          <span>${formattedDate}</span>
        </div>
        <div class="receipt-meta-line">
          <span><strong>Retirada:</strong></span>
          <span>${this.escapeHtml(order.pickupOption)}</span>
        </div>
        ${order.notes ? `
          <div class="receipt-meta-line">
            <span><strong>Observação:</strong></span>
            <span>${this.escapeHtml(order.notes)}</span>
          </div>
        ` : ''}

        <hr class="receipt-divider" />

        <div class="receipt-items-container">
          ${itemsSummaryHtml}
        </div>

        <hr class="receipt-divider" />

        <div class="receipt-total-line">
          <span>Total Pago na Retirada:</span>
          <strong>${formattedTotal}</strong>
        </div>
      </div>

      <div class="alert-offline-notice">
        ℹ️ <strong>Importante:</strong> Este pedido está salvo no seu aparelho. Apresente o número <strong>#${order.orderNumber}</strong> na cantina.
      </div>
    `;

    modal.classList.add('active');
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Recebido':
        return 'badge-warning';
      case 'Em preparo':
        return 'badge-info';
      case 'Pronto':
        return 'badge-success';
      case 'Entregue':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }

  formatDate(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  }

  formatPrice(val) {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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

export const orders = new OrderManager();
