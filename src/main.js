// src/main.js - Ponto de entrada da aplicação Cantina Fácil
import { catalog } from './products.js';
import { cart } from './cart.js';
import { orders } from './orders.js';
import { admin } from './admin.js';
import { pwa } from './pwa.js';

class CantinaApp {
  constructor() {
    this.currentScreen = 'menu'; // 'menu', 'cart', 'orders', 'admin'
  }

  init() {
    // Inicializar submódulos
    catalog.init('products-container', 'search-input', 'categories-slider');
    orders.init('orders-history-container');
    admin.init('admin-container');
    pwa.init();

    this.setupNavigation();
    this.setupCartIntegration();
    this.setupCheckoutForm();
    this.setupToastSystem();
    this.setupModals();

    // Rota inicial pela URL hash
    this.handleHashChange();
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'menu';
    const validScreens = ['menu', 'cart', 'orders', 'admin'];
    const screen = validScreens.includes(hash) ? hash : 'menu';
    this.navigateTo(screen);
  }

  navigateTo(screenName) {
    this.currentScreen = screenName;

    // Atualiza telas ativas
    document.querySelectorAll('.screen-view').forEach(screen => {
      screen.classList.remove('active');
    });

    const activeScreenEl = document.getElementById(`screen-${screenName}`);
    if (activeScreenEl) {
      activeScreenEl.classList.add('active');
    }

    // Atualiza menu inferior
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-screen') === screenName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Se navegou para o carrinho, renderiza a visualização atualizada
    if (screenName === 'cart') {
      const cartContainer = document.getElementById('cart-items-container');
      const cartSummary = document.getElementById('cart-summary-section');
      cart.renderCartView(cartContainer, cartSummary);
    }

    // Se navegou para pedidos, atualiza lista
    if (screenName === 'orders') {
      orders.loadOrderHistory();
    }

    // Se navegou para o admin, atualiza dados
    if (screenName === 'admin') {
      admin.render();
    }

    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupNavigation() {
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', (e) => {
        const screen = el.getAttribute('data-screen');
        if (screen) {
          window.location.hash = `#${screen}`;
        }
      });
    });

    // Botão da marca no cabeçalho leva ao início
    const brand = document.querySelector('.brand-wrapper');
    if (brand) {
      brand.addEventListener('click', () => {
        window.location.hash = '#menu';
      });
    }
  }

  setupCartIntegration() {
    // Atualizar badge do carrinho em tempo real
    cart.subscribe((cartInstance) => {
      const count = cartInstance.getCount();
      const badge = document.getElementById('nav-cart-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }

      // Se a tela atual for carrinho, re-renderizar
      if (this.currentScreen === 'cart') {
        const cartContainer = document.getElementById('cart-items-container');
        const cartSummary = document.getElementById('cart-summary-section');
        cartInstance.renderCartView(cartContainer, cartSummary);
      }
    });

    // Feedback ao adicionar item
    window.addEventListener('cart:item-added', (e) => {
      const prodName = e.detail?.product?.name || 'Item';
      this.showToast(`✓ ${prodName} adicionado ao carrinho!`, 'success');
    });
  }

  setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const customerName = form.querySelector('#checkout-name').value;
      const pickupOption = form.querySelector('#checkout-pickup').value;
      const notes = form.querySelector('#checkout-notes').value;

      try {
        const order = await orders.createOrder({
          customerName,
          pickupOption,
          notes
        });

        // Limpar campos
        form.querySelector('#checkout-name').value = '';
        form.querySelector('#checkout-notes').value = '';

        // Exibir modal com comprovante de pedido
        orders.showConfirmationModal(order);
        this.showToast(`Pedido #${order.orderNumber} realizado com sucesso!`, 'success');
      } catch (err) {
        this.showToast(err.message || 'Erro ao criar pedido.', 'error');
      }
    });
  }

  setupModals() {
    // Fechar modal de confirmação
    const confModal = document.getElementById('confirmation-modal');
    if (confModal) {
      confModal.querySelectorAll('.modal-close, #btn-close-confirmation').forEach(btn => {
        btn.addEventListener('click', () => {
          confModal.classList.remove('active');
          window.location.hash = '#orders';
        });
      });
    }

    // Fechar modais ao clicar no backdrop escuro
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  setupToastSystem() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    window.addEventListener('app:toast', (e) => {
      const { message, type } = e.detail || {};
      this.showToast(message, type);
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Inicializar aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new CantinaApp();
  app.init();
});
