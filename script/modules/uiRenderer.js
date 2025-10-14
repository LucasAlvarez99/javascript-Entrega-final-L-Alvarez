// Renderizado de la interfaz
class UIRenderer {
    constructor() {
        this.gamesContainer = document.getElementById('gamesContainer');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
    }

    renderGames(games) {
        if (!games || games.length === 0) {
            this.gamesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted mb-3">No se encontraron juegos.</p>
                    <button id="addFirstGame" class="btn btn-success">➕ Agregar Primer Juego</button>
                </div>
            `;
            return;
        }

        this.gamesContainer.innerHTML = games.map(game => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card game-card h-100">
                    <img src="${game.imagen}" class="card-img-top game-image" alt="${game.nombre}" 
                         onerror="this.src='https://via.placeholder.com/300x200/6c757d/white?text=Imagen+No+Disponible'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${game.nombre}</h5>
                        <p class="card-text flex-grow-1">${game.descripcion}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="price-tag">$${game.precio.toFixed(2)}</span>
                                <span class="badge bg-secondary">${game.categoria}</span>
                            </div>
                            <small class="text-muted d-block">${game.desarrollador} • ${game.lanzamiento}</small>
                            <button class="btn btn-add-cart w-100 mt-2" data-id="${game.id}">
                                🛒 Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCart(items) {
        if (!items || items.length === 0) {
            this.cartItems.innerHTML = '<p class="text-muted">El carrito está vacío</p>';
            return;
        }

        this.cartItems.innerHTML = items.map(item => `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <strong>${item.nombre}</strong>
                        <br>
                        <small class="text-muted">$${item.precio.toFixed(2)} x ${item.cantidad}</small>
                        <br>
                        <small class="text-success">Subtotal: $${(item.precio * item.cantidad).toFixed(2)}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-secondary btn-sm me-1" 
                                onclick="app.updateCartQuantity(${item.id}, ${item.cantidad - 1})">-</button>
                        <span class="mx-2">${item.cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sm me-2" 
                                onclick="app.updateCartQuantity(${item.id}, ${item.cantidad + 1})">+</button>
                        <button class="btn btn-outline-danger btn-sm" 
                                onclick="app.removeFromCart(${item.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCartTotal(total) {
        this.cartTotal.textContent = total.toFixed(2);
    }

    showMessage(message, type = 'success') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// Instancia global
const uiRenderer = new UIRenderer();