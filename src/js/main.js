// Sistema principal do Capacita Arapiraca
class CapacitaMain {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar componentes principais
        this.setupGlobalErrorHandling();
        this.initializeComponents();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Erro global capturado:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejeitada não tratada:', e.reason);
        });
    }

    initializeComponents() {
        // Verificar se estamos na página correta antes de inicializar componentes
        const currentPage = window.location.pathname;
        
        // Inicializar navegação se disponível
        if (typeof initNavigation === 'function') {
            try {
                initNavigation();
            } catch (error) {
                console.warn('Erro ao inicializar navegação:', error);
            }
        }

        // Inicializar outros componentes conforme necessário
        this.initializePageSpecificComponents(currentPage);
    }

    initializePageSpecificComponents(currentPage) {
        // Componentes específicos por página
        if (currentPage.includes('admin')) {
            // Componentes do admin
            console.log('Página administrativa detectada');
        } else if (currentPage.includes('dashboard')) {
            // Componentes do dashboard
            console.log('Dashboard detectado');
        } else {
            // Componentes das páginas públicas
            console.log('Página pública detectada');
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.capacitaMain = new CapacitaMain();
});