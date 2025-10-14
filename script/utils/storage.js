// Utilidades para localStorage
class StorageManager {
    constructor() {
        this.keys = {
            THEME: 'gameStore_theme',
            CART: 'gameStore_cart',
            CUSTOM_GAMES: 'gameStore_customGames'
        };
    }

    // Guardar datos
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando en storage:', error);
            return false;
        }
    }

    // Obtener datos
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error obteniendo de storage:', error);
            return defaultValue;
        }
    }

    // Eliminar datos
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error eliminando de storage:', error);
            return false;
        }
    }

    // Limpiar todo
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error limpiando storage:', error);
            return false;
        }
    }
}

// Instancia global
const storage = new StorageManager();