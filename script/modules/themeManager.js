// Gestor de temas claro/oscuro
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.applyTheme();
    }

    loadTheme() {
        this.currentTheme = storage.get(storage.keys.THEME, 'light');
        console.log('🎨 Tema cargado:', this.currentTheme);
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        this.updateToggleButton();
        
        console.log('🎨 Tema cambiado a:', this.currentTheme);
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Actualizar header y footer
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        if (this.currentTheme === 'dark') {
            header?.classList.add('header-dark');
            header?.classList.remove('header-light');
            footer?.classList.add('footer-dark');
            footer?.classList.remove('footer-light');
        } else {
            header?.classList.add('header-light');
            header?.classList.remove('header-dark');
            footer?.classList.add('footer-light');
            footer?.classList.remove('footer-dark');
        }
    }

    saveTheme() {
        storage.set(storage.keys.THEME, this.currentTheme);
    }

    updateToggleButton() {
        const button = document.getElementById('themeToggle');
        if (this.currentTheme === 'dark') {
            button.textContent = '☀️ Modo Claro';
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-warning');
        } else {
            button.textContent = '🌙 Modo Oscuro';
            button.classList.remove('btn-warning');
            button.classList.add('btn-outline-secondary');
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Instancia global
const themeManager = new ThemeManager();