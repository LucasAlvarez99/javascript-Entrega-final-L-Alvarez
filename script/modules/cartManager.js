// Gestor del carrito
class CartManager {
    constructor() {
        this.items = [];
        this.loadCart();
    }

    loadCart() {
        this.items = storage.get(storage.keys.CART, []);
        console.log('🛒 Carrito cargado:', this.items.length, 'items');
    }

    saveCart() {
        storage.set(storage.keys.CART, this.items);
    }

    addItem(game) {
        const existingItem = this.items.find(item => item.id === game.id);
        
        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            this.items.push({
                ...game,
                cantidad: 1
            });
        }
        
        this.saveCart();
        return this.items;
    }

    removeItem(gameId) {
        this.items = this.items.filter(item => item.id !== gameId);
        this.saveCart();
        return this.items;
    }

    updateQuantity(gameId, quantity) {
        const item = this.items.find(item => item.id === gameId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(gameId);
            } else {
                item.cantidad = quantity;
                this.saveCart();
            }
        }
        
        return this.items;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        return this.items;
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
    }

    getItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }
}

// Instancia global
const cartManager = new CartManager();