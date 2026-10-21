// src/pwa.js - Registro de Service Worker, PWA install prompt e detector offline
export class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.installBtn = null;
    this.installBanner = null;
    this.offlineBanner = null;
  }

  init() {
    this.installBtn = document.getElementById('btn-pwa-install');
    this.installBanner = document.getElementById('pwa-install-banner');
    this.offlineBanner = document.getElementById('offline-status-banner');

    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupOnlineStatus();
    this.setupHelpModal();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Registra o sw.js relativo à raiz do app
        const registration = await navigator.serviceWorker.register('./sw.js', {
          scope: './'
        });

        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

        // Notifica se houver atualização aguardando
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão da Cantina Fácil disponível em cache.');
              }
            });
          }
        });
      } catch (err) {
        console.warn('[PWA] Falha ao registrar Service Worker:', err);
      }
    } else {
      console.warn('[PWA] Service Worker não suportado neste navegador.');
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Impede o mini-infobar padrão em navegadores móveis
      e.preventDefault();
      this.deferredPrompt = e;

      // Exibe botões personalizados de instalação
      if (this.installBtn) {
        this.installBtn.style.display = 'inline-flex';
      }
      if (this.installBanner) {
        this.installBanner.style.display = 'flex';
      }

      console.log('[PWA] Evento beforeinstallprompt capturado. Aplicativo pronto para instalação.');
    });

    const handleInstallClick = async () => {
      if (!this.deferredPrompt) {
        // Se o evento automático não disparou (ex: já instalado ou navegador sem prompt automático), abre instruções manuais
        this.openInstallInstructions();
        return;
      }

      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação do aplicativo');
      } else {
        console.log('[PWA] Usuário recusou a instalação');
      }

      this.deferredPrompt = null;
      if (this.installBtn) this.installBtn.style.display = 'none';
      if (this.installBanner) this.installBanner.style.display = 'none';
    };

    if (this.installBtn) {
      this.installBtn.addEventListener('click', handleInstallClick);
    }

    const bannerInstallBtn = document.getElementById('btn-banner-install');
    if (bannerInstallBtn) {
      bannerInstallBtn.addEventListener('click', handleInstallClick);
    }

    const bannerCloseBtn = document.getElementById('btn-banner-close');
    if (bannerCloseBtn) {
      bannerCloseBtn.addEventListener('click', () => {
        if (this.installBanner) this.installBanner.style.display = 'none';
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Cantina Fácil instalado com sucesso na tela inicial!');
      this.deferredPrompt = null;
      if (this.installBtn) this.installBtn.style.display = 'none';
      if (this.installBanner) this.installBanner.style.display = 'none';
    });
  }

  setupOnlineStatus() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;

      if (this.offlineBanner) {
        if (isOnline) {
          this.offlineBanner.classList.remove('active');
        } else {
          this.offlineBanner.classList.add('active');
        }
      }

      // Atualiza badge de rede
      const networkBadge = document.getElementById('network-badge');
      if (networkBadge) {
        if (isOnline) {
          networkBadge.className = 'network-badge online';
          networkBadge.innerHTML = `<span class="network-dot"></span> Online`;
        } else {
          networkBadge.className = 'network-badge offline';
          networkBadge.innerHTML = `<span class="network-dot"></span> Offline`;
        }
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Conexão restabelecida! Você está online.', type: 'success' }
      }));
    });

    window.addEventListener('offline', () => {
      updateStatus();
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Você está offline. O aplicativo continua funcionando localmente!', type: 'warning' }
      }));
    });

    // Estado inicial
    updateStatus();
  }

  setupHelpModal() {
    const helpBtn = document.getElementById('btn-pwa-help');
    const modal = document.getElementById('install-help-modal');

    if (helpBtn && modal) {
      helpBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });

      modal.querySelector('.modal-close')?.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  }

  openInstallInstructions() {
    const modal = document.getElementById('install-help-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }
}

export const pwa = new PWAManager();
