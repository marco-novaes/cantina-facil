// src/products.js - Gerenciamento e renderização do catálogo de produtos
import { db } from './db.js';
import { cart } from './cart.js';
import { getProductSvg } from './foodImages.js';

export class ProductCatalog {
  constructor() {
    this.products = [];
    this.currentCategory = 'todos';
    this.searchQuery = '';
    this.container = null;
    this.searchElement = null;
    this.categoryElements = null;
  }

  init(containerId, searchInputId, categoriesContainerId) {
    this.container = document.getElementById(containerId);
    this.searchElement = document.getElementById(searchInputId);
    this.categoryElements = document.getElementById(categoriesContainerId);

    if (this.searchElement) {
      this.searchElement.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    if (this.categoryElements) {
      this.categoryElements.addEventListener('click', (e) => {
        const chip = e.target.closest('.category-chip');
        if (!chip) return;
        const category = chip.getAttribute('data-category');
        this.setCategory(category);
      });
    }

    this.loadProducts();
  }

  async loadProducts() {
    try {
      this.products = await db.getAllProducts();
      this.render();
    } catch (err) {
      console.error('Erro ao carregar produtos do banco:', err);
      if (this.container) {
        this.container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Não foi possível carregar o cardápio</h3>
            <p>Ocorreu um erro ao consultar o banco local.</p>
          </div>
        `;
      }
    }
  }

  setCategory(category) {
    this.currentCategory = category;
    if (this.categoryElements) {
      const chips = this.categoryElements.querySelectorAll('.category-chip');
      chips.forEach(c => {
        if (c.getAttribute('data-category') === category) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }
    this.render();
  }

  getFilteredProducts() {
    return this.products.filter(prod => {
      // Filtro de categoria
      const matchCategory = this.currentCategory === 'todos' || prod.category === this.currentCategory;
      // Filtro de texto de busca
      const matchSearch = !this.searchQuery ||
        prod.name.toLowerCase().includes(this.searchQuery) ||
        (prod.description && prod.description.toLowerCase().includes(this.searchQuery));

      return matchCategory && matchSearch;
    });
  }

  formatPrice(price) {
    return Number(price || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  render() {
    if (!this.container) return;

    const filtered = this.getFilteredProducts();

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Nenhum lanche encontrado</h3>
          <p>${this.searchQuery ? `Não encontramos itens com "${this.searchQuery}".` : 'Nenhum produto cadastrado nesta categoria.'}</p>
          ${this.searchQuery ? `<button class="btn btn-secondary btn-sm" id="clear-search-btn">Limpar busca</button>` : ''}
        </div>
      `;

      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn && this.searchElement) {
        clearBtn.addEventListener('click', () => {
          this.searchElement.value = '';
          this.searchQuery = '';
          this.render();
        });
      }
      return;
    }

    this.container.innerHTML = filtered.map(prod => {
      const isAvailable = prod.available !== false;
      const formattedPrice = this.formatPrice(prod.price);
      const svgGraphic = getProductSvg(prod.imageKey);

      return `
        <article class="product-card ${!isAvailable ? 'unavailable' : ''}" data-id="${prod.id}">
          <div class="product-image-wrap">
            <div class="product-svg-container">
              ${svgGraphic}
            </div>
            <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
              ${isAvailable ? 'Disponível' : 'Esgotado'}
            </span>
          </div>

          <div class="product-info">
            <div class="product-header-info">
              <span class="product-category-tag">${this.formatCategoryName(prod.category)}</span>
              <h3 class="product-title">${this.escapeHtml(prod.name)}</h3>
            </div>
            <p class="product-desc">${this.escapeHtml(prod.description || '')}</p>
            
            <div class="product-footer">
              <div class="product-price">${formattedPrice}</div>
              <button 
                class="btn btn-primary btn-add-cart" 
                data-add-id="${prod.id}"
                ${!isAvailable ? 'disabled title="Produto esgotado no momento"' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>${isAvailable ? 'Adicionar' : 'Indisponível'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Adicionar eventos aos botões "Adicionar ao carrinho"
    const addButtons = this.container.querySelectorAll('[data-add-id]');
    addButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = btn.getAttribute('data-add-id');
        const prod = this.products.find(p => p.id === prodId);
        if (prod && prod.available !== false) {
          cart.addItem(prod);
          // Feedback tátil/visual no botão
          btn.classList.add('added-feedback');
          const originalText = btn.innerHTML;
          btn.innerHTML = `✓ Adicionado!`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('added-feedback');
          }, 800);
        }
      });
    });
  }

  formatCategoryName(cat) {
    const map = {
      'salgados': 'Salgados',
      'lanches': 'Lanches',
      'bebidas': 'Bebidas',
      'doces': 'Doces'
    };
    return map[cat] || 'Geral';
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

export const catalog = new ProductCatalog();
