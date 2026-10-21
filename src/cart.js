// src/cart.js - Gerenciamento do carrinho de compras com persistência local
import { getProductSvg } from './foodImages.js';

const STORAGE_KEY = 'cantina_facil_cart_v1';

export class CartManager {
  constructor() {
    this.items = this.loadFromStorage();
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Erro ao carregar carrinho do localStorage:', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no localStorage:', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this);
      } catch (err) {
        console.error('Erro no listener do carrinho:', err);
      }
    });
  }

  addItem(product, quantity = 1) {
    if (!product || product.available === false) return false;

    const existingIndex = this.items.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        product: {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          category: product.category,
          imageKey: product.imageKey
        },
        quantity: Math.max(1, quantity)
      });
    }

    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { product } }));
    return true;
  }

  updateQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10);
    const index = this.items.findIndex(item => item.product.id === productId);

    if (index === -1) return;

    if (qty <= 0) {
      this.removeItem(productId);
    } else {
      this.items[index].quantity = qty;
      this.saveToStorage();
    }
  }

  increment(productId) {
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      item.quantity += 1;
      this.saveToStorage();
    }
  }

  decrement(productId) {
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.saveToStorage();
      } else {
        this.removeItem(productId);
      }
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.saveToStorage();
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }

  getCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getItems() {
    return [...this.items];
  }

  formatPrice(val) {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  renderCartView(containerElement, summaryElement) {
    if (!containerElement) return;

    if (this.items.length === 0) {
      containerElement.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Seu carrinho está vazio</h3>
          <p>Explore o cardápio e adicione seus lanches favoritos!</p>
          <button class="btn btn-primary" id="btn-go-to-menu">Ver Cardápio</button>
        </div>
      `;
      if (summaryElement) summaryElement.style.display = 'none';

      const goMenu = containerElement.querySelector('#btn-go-to-menu');
      if (goMenu) {
        goMenu.addEventListener('click', () => {
          window.location.hash = '#menu';
        });
      }
      return;
    }

    if (summaryElement) summaryElement.style.display = 'block';

    const itemsHtml = this.items.map(item => {
      const p = item.product;
      const subtotal = p.price * item.quantity;
      const svgGraphic = getProductSvg(p.imageKey);

      return `
        <div class="cart-item" data-cart-id="${p.id}">
          <div class="cart-item-img">
            ${svgGraphic}
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-title">${p.name}</h4>
            <div class="cart-item-unit-price">${this.formatPrice(p.price)} un.</div>
            
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn" data-action="dec" data-id="${p.id}" aria-label="Diminuir quantidade">−</button>
                <span class="qty-number">${item.quantity}</span>
                <button class="qty-btn" data-action="inc" data-id="${p.id}" aria-label="Aumentar quantidade">+</button>
              </div>
              <div class="cart-item-subtotal">${this.formatPrice(subtotal)}</div>
            </div>
          </div>
          <button class="cart-item-remove" data-action="del" data-id="${p.id}" title="Remover item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    containerElement.innerHTML = `
      <div class="cart-header-actions">
        <span class="cart-count-badge">${this.getCount()} ${this.getCount() === 1 ? 'item' : 'itens'}</span>
        <button class="btn btn-outline-danger btn-sm" id="btn-clear-cart">Limpar Carrinho</button>
      </div>
      <div class="cart-items-list">${itemsHtml}</div>
    `;

    // Eventos de clique dentro da lista do carrinho
    containerElement.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'inc') {
          this.increment(id);
        } else if (action === 'dec') {
          this.decrement(id);
        } else if (action === 'del') {
          this.removeItem(id);
        }
      });
    });

    const clearBtn = containerElement.querySelector('#btn-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente limpar todos os itens do carrinho?')) {
          this.clear();
        }
      });
    }

    // Atualiza resumo
    if (summaryElement) {
      const total = this.getTotal();
      const subtotalEl = summaryElement.querySelector('#cart-subtotal-val');
      const totalEl = summaryElement.querySelector('#cart-total-val');
      if (subtotalEl) subtotalEl.textContent = this.formatPrice(total);
      if (totalEl) totalEl.textContent = this.formatPrice(total);
    }
  }
}

export const cart = new CartManager();
