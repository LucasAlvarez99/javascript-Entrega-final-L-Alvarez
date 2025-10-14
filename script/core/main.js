// Aplicación principal
class GameStoreApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            console.log('🎮 Inicializando GameStore...');
            
            // Inicializar módulos
            await this.initializeModules();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            console.log('✅ GameStore inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            uiRenderer.showError('Error al inicializar la aplicación');
        }
    }

    async initializeModules() {
        // Los módulos ya se inicializan automáticamente
        console.log('📦 Módulos inicializados');
    }

    setupEventListeners() {
        // Evento para agregar juegos al carrito
        document.getElementById('gamesContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const gameId = parseInt(e.target.dataset.id);
                this.addToCart(gameId);
            }
        });

        // Evento para agregar nuevo juego
        document.getElementById('addGameBtn').addEventListener('click', () => {
            this.showAddGameForm();
        });

        // Eventos de filtros
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterGames(e.target.value, document.getElementById('categoryFilter').value);
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterGames(document.getElementById('searchInput').value, e.target.value);
        });

        // Eventos del carrito
        document.getElementById('clearCart').addEventListener('click', () => {
            this.clearCart();
        });

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });
    }

    async loadInitialData() {
        // Cargar juegos
        const games = await gameManager.loadGames();
        uiRenderer.renderGames(games);
        
        // Cargar cotización del dólar
        const rates = await apiService.getDollarRates();
        apiService.updateDollarDisplay(rates);
        
        // Actualizar carrito
        this.updateCartView();
    }

    addToCart(gameId) {
        const game = gameManager.getGames().find(g => g.id === gameId);
        if (game) {
            cartManager.addItem(game);
            this.updateCartView();
            uiRenderer.showMessage(`${game.nombre} agregado al carrito!`);
        }
    }

    removeFromCart(gameId) {
        cartManager.removeItem(gameId);
        this.updateCartView();
        uiRenderer.showMessage('Juego removido del carrito', 'info');
    }

    updateCartQuantity(gameId, quantity) {
        cartManager.updateQuantity(gameId, quantity);
        this.updateCartView();
    }

    clearCart() {
        cartManager.clearCart();
        this.updateCartView();
        uiRenderer.showMessage('Carrito vaciado', 'info');
    }

    updateCartView() {
        const items = cartManager.getItems();
        const total = cartManager.calculateTotal();
        
        uiRenderer.renderCart(items);
        uiRenderer.updateCartTotal(total);
    }

    filterGames(searchTerm, category) {
        const filteredGames = gameManager.filterGames(searchTerm, category);
        uiRenderer.renderGames(filteredGames);
    }

    async showAddGameForm() {
        const { value: formData } = await Swal.fire({
            title: '➕ Agregar Nuevo Juego',
            html: `
                <input id="game-name" class="swal2-input" placeholder="Nombre" required>
                <input id="game-price" class="swal2-input" placeholder="Precio" type="number" step="0.01" required>
                <select id="game-category" class="swal2-input" required>
                    <option value="">Categoría</option>
                    <option value="acción">Acción</option>
                    <option value="aventura">Aventura</option>
                    <option value="deportes">Deportes</option>
                    <option value="estrategia">Estrategia</option>
                </select>
                <input id="game-image" class="swal2-input" placeholder="URL de imagen">
                <textarea id="game-description" class="swal2-textarea" placeholder="Descripción" required></textarea>
                <input id="game-developer" class="swal2-input" placeholder="Desarrollador" required>
                <input id="game-year" class="swal2-input" placeholder="Año" type="number" required>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            preConfirm: () => {
                return {
                    nombre: document.getElementById('game-name').value,
                    precio: document.getElementById('game-price').value,
                    categoria: document.getElementById('game-category').value,
                    imagen: document.getElementById('game-image').value,
                    descripcion: document.getElementById('game-description').value,
                    desarrollador: document.getElementById('game-developer').value,
                    lanzamiento: document.getElementById('game-year').value
                };
            }
        });

        if (formData) {
            try {
                const newGame = gameManager.addGame(formData);
                this.filterGames('', 'all'); // Recargar vista
                uiRenderer.showMessage(`"${newGame.nombre}" agregado!`);
            } catch (error) {
                uiRenderer.showError('Error al agregar el juego');
            }
        }
    }

    async checkout() {
        const items = cartManager.getItems();
        if (items.length === 0) {
            uiRenderer.showError('El carrito está vacío');
            return;
        }

        const total = cartManager.calculateTotal();
        
        const { value: customerData } = await Swal.fire({
            title: 'Finalizar Compra',
            html: `
                <input class="swal2-input" placeholder="Nombre" value="Cliente Ejemplo">
                <input class="swal2-input" placeholder="Email" value="cliente@ejemplo.com">
                <div class="mt-3 p-3 bg-light rounded">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Confirmar Compra'
        });

        if (customerData) {
            cartManager.clearCart();
            this.updateCartView();
            
            Swal.fire({
                title: '🎉 ¡Compra Exitosa!',
                text: `Gracias por tu compra de $${total.toFixed(2)}`,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });
        }
    }
}

// Inicializar aplicación
const app = new GameStoreApp();