// src/db.js - Camada de persistência local com IndexedDB
// 100% nativa, sem dependências externas, perfeita para PWA offline

const DB_NAME = 'CantinaFacilDB';
const DB_VERSION = 1;

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Pão de Queijo',
    price: 4.00,
    category: 'salgados',
    description: 'Tradicional pão de queijo quentinho, crocante por fora e macio por dentro.',
    available: true,
    imageKey: 'pao-de-queijo'
  },
  {
    id: 'prod-2',
    name: 'Coxinha de Frango',
    price: 6.00,
    category: 'salgados',
    description: 'Massa artesanal dourada recheada com frango desfiado suculento e bem temperado.',
    available: true,
    imageKey: 'coxinha'
  },
  {
    id: 'prod-3',
    name: 'Sanduíche Natural',
    price: 8.00,
    category: 'lanches',
    description: 'Pão integral, peito de peru defumado, queijo branco, alface crespa e tomate.',
    available: true,
    imageKey: 'sanduiche'
  },
  {
    id: 'prod-4',
    name: 'Suco Natural 300ml',
    price: 5.00,
    category: 'bebidas',
    description: 'Suco de laranja natural e gelado, feito com fruta fresca na hora.',
    available: true,
    imageKey: 'suco'
  },
  {
    id: 'prod-5',
    name: 'Água Mineral 500ml',
    price: 3.00,
    category: 'bebidas',
    description: 'Garrafa de água mineral pura sem gás, extremamente gelada.',
    available: true,
    imageKey: 'agua'
  },
  {
    id: 'prod-6',
    name: 'Bolo de Chocolate',
    price: 5.00,
    category: 'doces',
    description: 'Fatia fofinha de bolo de chocolate com cobertura cremosa de brigadeiro.',
    available: true,
    imageKey: 'bolo'
  }
];

class CantinaDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store de produtos
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('available', 'available', { unique: false });
        }

        // Store de pedidos
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('orderNumber', 'orderNumber', { unique: true });
          orderStore.createIndex('status', 'status', { unique: false });
          orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store de configurações gerais
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        // Inicializar com produtos de demonstração se a loja estiver vazia
        try {
          const count = await this.countProducts();
          if (count === 0) {
            await this.seedDefaultProducts();
          }
          resolve(this.db);
        } catch (err) {
          console.error('Erro na inicialização de semente:', err);
          resolve(this.db);
        }
      };

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  async countProducts() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async seedDefaultProducts() {
    const tx = this.db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    for (const prod of DEFAULT_PRODUCTS) {
      store.put({ ...prod });
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- MÉTODOS DE PRODUTOS ---

  async getAllProducts() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getProduct(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async saveProduct(product) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const req = store.put(product);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteProduct(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async resetDefaultProducts() {
    await this.init();
    const tx = this.db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    store.clear();
    for (const prod of DEFAULT_PRODUCTS) {
      store.put({ ...prod });
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(DEFAULT_PRODUCTS);
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- MÉTODOS DE PEDIDOS ---

  async getAllOrders() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const req = store.getAll();
      req.onsuccess = () => {
        const orders = req.result || [];
        // Ordena por data decrescente (mais recente primeiro)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(orders);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getNextOrderNumber() {
    const orders = await this.getAllOrders();
    if (orders.length === 0) return 1001;
    const maxNumber = orders.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000);
    return maxNumber + 1;
  }

  async saveOrder(order) {
    await this.init();
    if (!order.id) {
      order.id = 'ord-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }
    if (!order.orderNumber) {
      order.orderNumber = await this.getNextOrderNumber();
    }
    if (!order.createdAt) {
      order.createdAt = new Date().toISOString();
    }
    if (!order.status) {
      order.status = 'Recebido'; // Recebido, Em preparo, Pronto, Entregue
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const req = store.put(order);
      req.onsuccess = () => resolve(order);
      req.onerror = () => reject(req.error);
    });
  }

  async updateOrderStatus(orderId, newStatus) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const getReq = store.get(orderId);

      getReq.onsuccess = () => {
        const order = getReq.result;
        if (!order) {
          reject(new Error('Pedido não encontrado'));
          return;
        }
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        const putReq = store.put(order);
        putReq.onsuccess = () => resolve(order);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  async getStats() {
    const orders = await this.getAllOrders();
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const avgTicket = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    // Contagem por status
    const statusCount = {
      'Recebido': 0,
      'Em preparo': 0,
      'Pronto': 0,
      'Entregue': 0
    };

    // Frequência de itens
    const itemsCount = {};

    orders.forEach(o => {
      if (statusCount[o.status] !== undefined) {
        statusCount[o.status]++;
      }
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          itemsCount[it.name] = (itemsCount[it.name] || 0) + (it.quantity || 1);
        });
      }
    });

    let topItem = '-';
    let topCount = 0;
    for (const [name, qty] of Object.entries(itemsCount)) {
      if (qty > topCount) {
        topCount = qty;
        topItem = `${name} (${qty}x)`;
      }
    }

    return {
      totalOrders,
      totalSales,
      avgTicket,
      statusCount,
      topItem
    };
  }
}

export const db = new CantinaDB();
