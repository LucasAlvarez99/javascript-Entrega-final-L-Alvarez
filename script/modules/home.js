/**
 * ===============================================
 * HOME.JS - Lógica de la tienda
 * Proyecto Final - Lucas Álvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== VARIABLES GLOBALES ==========
  let currentCurrency = 'USD';
  let selectedCategory = '';
  let dolarVenta = null;

  // ========== PROTECCIÓN DE RUTA ==========
  if (!AppStorage.isLoggedIn()) {
    console.warn('⚠️ No autenticado');
    AppHelpers.redirect('../index.html');
    return;
  }

  // ========== INICIALIZACIÓN ==========
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Iniciando tienda...');
    
    const user = AppStorage.getCurrentUser();
    console.log('Usuario:', user);
    
    // Mostrar nombre de usuario
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
      userNameEl.textContent = user.name || user.username;
    }

    // Mostrar panel admin si es admin
    if (AppStorage.isAdmin()) {
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        adminPanel.style.display = 'block';
        console.log('✅ Panel admin visible');
      }
    }

    // Obtener cotización del dólar
    const cotizacion = AppGlobal.getDolarCotizacion();
    dolarVenta = cotizacion.venta;
    console.log('💵 Dólar venta:', dolarVenta);

    // Cargar productos y categorías
    renderProducts();
    populateCategories();
    updateCartBadge();

    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Tienda inicializada');
  });

  // ========== RENDERIZAR PRODUCTOS ==========
  function renderProducts(filter = '') {
    const products = AppStorage.getProducts();
    const grid = document.getElementById('productsGrid');
    
    if (!grid) return;

    let filtered = products.filter(p => {
      const matchName = p.nombre.toLowerCase().includes(filter.toLowerCase());
      const matchCategory = !selectedCategory || 
        p.categoria.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchName && matchCategory;
    });

    console.log(`📦 Productos filtrados: ${filtered.length}/${products.length}`);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="no-results">No se encontraron productos</p>';
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <article class="product-card">
        <img src="../${p.imagen}" alt="${p.nombre}" onerror="this.src='../assets/placeholder.png'">
        <div class="card-body">
          <h3>${p.nombre}</h3>
          <p class="category">📁 ${p.categoria}</p>
          <p class="description">${p.descripcion.substring(0, 100)}...</p>
          <p class="developer">🎮 ${p.desarrollador}</p>
          <p class="release">📅 ${p.lanzamiento}</p>
          <p class="price" data-price="${p.precio_usd}" title="Clic para cambiar moneda">
            ${formatPrice(p.precio_usd)}
          </p>
          <button class="btn-add-cart" data-id="${p.id}">
            🛒 Agregar al carrito
          </button>
        </div>
      </article>
    `).join('');

    // Eventos: agregar al carrito
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const product = products.find(p => p.id === id);
        if (product) {
          AppStorage.addToCart(product);
          updateCartBadge();
          AppHelpers.showToast(`✅ ${product.nombre} agregado al carrito`, 'success');
          console.log('🛒 Producto agregado:', product.nombre);
        }
      });
    });

    // Eventos: click en precio para alternar moneda
    document.querySelectorAll('.price').forEach(priceEl => {
      priceEl.addEventListener('click', () => {
        const priceUSD = parseFloat(priceEl.dataset.price);
        togglePrice(priceEl, priceUSD);
      });
    });
  }

  // ========== FORMATEO DE PRECIO ==========
  function formatPrice(priceUSD) {
    if (currentCurrency === 'USD') {
      return `💵 $${priceUSD.toFixed(2)} USD`;
    } else {
      if (dolarVenta) {
        const priceARS = priceUSD * dolarVenta;
        return `💰 $${priceARS.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ARS`;
      }
      return `💵 $${priceUSD.toFixed(2)} USD`;
    }
  }

  // ========== ALTERNAR PRECIO AL HACER CLIC ==========
  function togglePrice(element, priceUSD) {
    const currentText = element.textContent;
    
    if (currentText.includes('USD')) {
      if (dolarVenta) {
        const priceARS = priceUSD * dolarVenta;
        element.textContent = `💰 $${priceARS.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ARS`;
        element.style.color = 'var(--success)';
      }
    } else {
      element.textContent = `💵 $${priceUSD.toFixed(2)} USD`;
      element.style.color = 'var(--accent)';
    }
  }

  // ========== CATEGORÍAS ==========
  function populateCategories() {
    const products = AppStorage.getProducts();
    const categories = [...new Set(products.map(p => p.categoria))];
    const container = document.getElementById('categoriesContainer');
    
    if (!container) return;
    
    let html = '<button class="category-badge active" data-category="">📚 Todas</button>';
    categories.forEach(cat => {
      html += `<button class="category-badge" data-category="${cat}">📁 ${cat}</button>`;
    });
    
    container.innerHTML = html;

    // Eventos
    document.querySelectorAll('.category-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        document.querySelectorAll('.category-badge').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedCategory = e.target.dataset.category;
        
        const searchValue = document.getElementById('searchInput')?.value || '';
        renderProducts(searchValue);
        
        console.log('📁 Categoría seleccionada:', selectedCategory || 'Todas');
      });
    });

    console.log('✅ Categorías cargadas:', categories);
  }

  // ========== CARRITO ==========
  function updateCartBadge() {
    const count = AppStorage.getCartCount();
    const badge = document.getElementById('cartCount');
    if (badge) {
      badge.textContent = count;
    }
  }

  function openCart() {
    const modal = document.getElementById('cartModal');
    const cart = AppStorage.getCart();
    const itemsContainer = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!modal || !itemsContainer || !totalEl) return;

    console.log('🛒 Abriendo carrito con', cart.length, 'productos');

    if (cart.length === 0) {
      itemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío 🛒</p>';
      totalEl.textContent = '$0';
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="../${item.imagen}" alt="${item.nombre}" onerror="this.src='../assets/placeholder.png'">
          <div class="cart-item-info">
            <h4>${item.nombre}</h4>
            <p class="cart-price">${formatPrice(item.precio_usd)}</p>
            <p class="cart-subtotal">Subtotal: ${formatPrice(item.precio_usd * item.quantity)}</p>
          </div>
          <div class="cart-item-controls">
            <button class="btn-qty" data-id="${item.id}" data-action="decrease">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="btn-qty" data-id="${item.id}" data-action="increase">+</button>
            <button class="btn-remove" data-id="${item.id}">🗑️</button>
          </div>
        </div>
      `).join('');

      const total = AppStorage.getCartTotal();
      totalEl.textContent = formatPrice(total);

      // Eventos: cantidad
      document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const action = btn.dataset.action;
          const item = cart.find(i => i.id === id);
          
          if (item) {
            const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
            AppStorage.updateCartQuantity(id, newQty);
            openCart();
            updateCartBadge();
          }
        });
      });

      // Eventos: eliminar
      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          AppStorage.removeFromCart(id);
          openCart();
          updateCartBadge();
          AppHelpers.showToast('🗑️ Producto eliminado', 'info');
        });
      });
    }

    modal.classList.add('show');
  }

  function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // ========== PANEL ADMIN ==========
  function setupAdminPanel() {
    const toggleBtn = document.getElementById('toggleAddProduct');
    const formContainer = document.getElementById('addProductForm');
    const form = document.getElementById('productForm');

    if (!toggleBtn || !form || !formContainer) return;

    toggleBtn.addEventListener('click', () => {
      const isHidden = formContainer.style.display === 'none';
      formContainer.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '➖ Cerrar formulario' : '➕ Agregar nuevo juego';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newProduct = {
        nombre: document.getElementById('prodName').value.trim(),
        precio_usd: parseFloat(document.getElementById('prodPrice').value),
        categoria: document.getElementById('prodCategory').value.trim(),
        imagen: document.getElementById('prodImage').value.trim(),
        descripcion: document.getElementById('prodDesc').value.trim(),
        desarrollador: document.getElementById('prodDev').value.trim(),
        lanzamiento: document.getElementById('prodRelease').value.trim()
      };

      AppStorage.addProduct(newProduct);
      AppHelpers.showToast('✅ Producto agregado exitosamente', 'success');
      
      form.reset();
      formContainer.style.display = 'none';
      toggleBtn.textContent = '➕ Agregar nuevo juego';
      
      renderProducts();
      populateCategories();
      
      console.log('✅ Producto agregado:', newProduct.nombre);
    });
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    console.log('⚙️ Configurando eventos...');

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (AppHelpers.confirm('¿Seguro que querés cerrar sesión?')) {
          AppStorage.clearCurrentUser();
          AppHelpers.showToast('👋 Sesión cerrada', 'info');
          AppHelpers.redirect('../index.html', 1000);
        }
      });
    }

    // Carrito
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', openCart);
    }

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCart);
    }

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') closeCart();
      });
    }

    // Vaciar carrito
    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (AppHelpers.confirm('¿Vaciar el carrito?')) {
          AppStorage.clearCart();
          updateCartBadge();
          openCart();
          AppHelpers.showToast('🗑️ Carrito vaciado', 'info');
        }
      });
    }

    // Finalizar compra
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = AppStorage.getCart();
        if (cart.length === 0) {
          AppHelpers.showToast('⚠️ El carrito está vacío', 'error');
          return;
        }
        
        const total = AppStorage.getCartTotal();
        alert(`🎮 Compra finalizada!\n\nTotal: ${formatPrice(total)}\n\n✅ Gracias por tu compra!`);
        
        AppStorage.clearCart();
        updateCartBadge();
        closeCart();
        AppHelpers.showToast('✅ Compra realizada exitosamente', 'success');
      });
    }

    // Cambiar moneda global
    const currencyBtn = document.getElementById('currencyToggle');
    if (currencyBtn) {
      currencyBtn.addEventListener('click', () => {
        currentCurrency = currentCurrency === 'USD' ? 'ARS' : 'USD';
        currencyBtn.textContent = currentCurrency === 'USD' ? '💵 USD' : '💰 ARS';
        
        renderProducts(document.getElementById('searchInput')?.value || '');
        
        const modal = document.getElementById('cartModal');
        if (modal && modal.classList.contains('show')) {
          openCart();
        }
        
        AppHelpers.showToast(`💱 Moneda cambiada a ${currentCurrency}`, 'info');
      });
    }

    // Buscador
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
      });
    }

    // Panel admin
    if (AppStorage.isAdmin()) {
      setupAdminPanel();
    }

    // Ir al perfil
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        AppHelpers.redirect('profile.html');
      });
    }

    console.log('✅ Eventos configurados');
  }

  console.log('✅ Módulo home cargado');
})();