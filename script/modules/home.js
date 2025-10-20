/**
 * ===============================================
 * HOME.JS - Lógica de la tienda (CORREGIDO)
 * Proyecto Final - Lucas Álvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== VARIABLES GLOBALES ==========
  let currentCurrency = 'USD';
  let selectedCategory = '';
  let dolarVenta = null;
  let products = [];

  // ========== PROTECCIÓN DE RUTA ==========
  if (!AppStorage.isLoggedIn()) {
    console.warn('⚠️ No autenticado');
    AppHelpers.redirect('../index.html');
    return;
  }

  // ========== INICIALIZACIÓN ==========
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Iniciando tienda...');
    
    const user = AppStorage.getCurrentUser();
    console.log('👤 Usuario:', user);
    
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

    // Esperar a que se cargue la cotización del dólar
    await waitForDolar();
    
    // Obtener cotización del dólar
    const cotizacion = AppGlobal.getDolarCotizacion();
    dolarVenta = cotizacion.venta;
    console.log('💵 Dólar venta:', dolarVenta);

    // Cargar productos
    products = AppStorage.getProducts();
    console.log('📦 Productos cargados:', products.length);

    // Renderizar
    renderProducts();
    populateCategories();
    updateCartBadge();

    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Tienda inicializada correctamente');
  });

  // ========== ESPERAR COTIZACIÓN DEL DÓLAR ==========
  async function waitForDolar() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const cotizacion = AppGlobal.getDolarCotizacion();
      if (cotizacion.venta) {
        console.log('✅ Cotización del dólar obtenida:', cotizacion.venta);
        return;
      }
      
      console.log('⏳ Esperando cotización del dólar... intento', attempts + 1);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    console.warn('⚠️ No se pudo obtener la cotización del dólar');
  }

  // ========== RENDERIZAR PRODUCTOS ==========
  function renderProducts(filter = '') {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
      console.error('❌ Grid de productos no encontrado');
      return;
    }

    let filtered = products.filter(p => {
      const matchName = p.nombre.toLowerCase().includes(filter.toLowerCase());
      const matchCategory = !selectedCategory || 
        p.categoria.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchName && matchCategory;
    });

    console.log(`📦 Mostrando ${filtered.length} de ${products.length} productos`);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="no-results">❌ No se encontraron productos</p>';
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <article class="product-card" data-id="${p.id}">
        <img src="../${p.imagen}" alt="${p.nombre}" onerror="this.src='../assets/placeholder.png'">
        <div class="card-body">
          <h3>${p.nombre}</h3>
          <p class="category">📁 ${p.categoria}</p>
          <p class="description">${p.descripcion.substring(0, 100)}...</p>
          <p class="developer">🎮 ${p.desarrollador}</p>
          <p class="release">📅 ${p.lanzamiento}</p>
          <p class="price" data-price="${p.precio_usd}">
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
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

    console.log('✅ Productos renderizados');
  }

  // ========== FORMATEO DE PRECIO ==========
  function formatPrice(priceUSD) {
    if (currentCurrency === 'ARS' && dolarVenta) {
      const priceARS = priceUSD * dolarVenta;
      return `💰 $${priceARS.toLocaleString('es-AR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })} ARS`;
    }
    return `💵 $${priceUSD.toFixed(2)} USD`;
  }

  // ========== CATEGORÍAS ==========
  function populateCategories() {
    const categories = [...new Set(products.map(p => p.categoria))];
    const container = document.getElementById('categoriesContainer');
    
    if (!container) {
      console.error('❌ Contenedor de categorías no encontrado');
      return;
    }
    
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
    console.log('🛒 Badge actualizado:', count);
  }

  function openCart() {
    const modal = document.getElementById('cartModal');
    const cart = AppStorage.getCart();
    const itemsContainer = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!modal || !itemsContainer || !totalEl) {
      console.error('❌ Elementos del modal no encontrados');
      return;
    }

    console.log('🛒 Abriendo carrito con', cart.length, 'productos');

    if (cart.length === 0) {
      itemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío 🛒</p>';
      totalEl.textContent = formatPrice(0);
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="../${item.imagen}" alt="${item.nombre}" onerror="this.src='../assets/placeholder.png'">
          <div class="cart-item-info">
            <h4>${item.nombre}</h4>
            <p class="cart-price">${formatPrice(item.precio_usd)}</p>
            <p class="cart-subtotal">Subtotal (x${item.quantity}): ${formatPrice(item.precio_usd * item.quantity)}</p>
          </div>
          <div class="cart-item-controls">
            <button class="btn-qty" data-id="${item.id}" data-action="decrease" title="Disminuir cantidad">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="btn-qty" data-id="${item.id}" data-action="increase" title="Aumentar cantidad">+</button>
            <button class="btn-remove" data-id="${item.id}" title="Eliminar producto">🗑️</button>
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
            
            if (newQty <= 0) {
              if (AppHelpers.confirm('¿Eliminar este producto del carrito?')) {
                AppStorage.removeFromCart(id);
                AppHelpers.showToast('🗑️ Producto eliminado', 'info');
              } else {
                return;
              }
            } else {
              AppStorage.updateCartQuantity(id, newQty);
            }
            
            updateCartBadge();
            openCart(); // Refrescar modal
          }
        });
      });

      // Eventos: eliminar
      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const item = cart.find(i => i.id === id);
          
          if (item && AppHelpers.confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
            AppStorage.removeFromCart(id);
            updateCartBadge();
            openCart(); // Refrescar modal
            AppHelpers.showToast('🗑️ Producto eliminado', 'info');
          }
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

    if (!toggleBtn || !form || !formContainer) {
      console.warn('⚠️ Elementos del panel admin no encontrados');
      return;
    }

    // Toggle formulario
    toggleBtn.addEventListener('click', () => {
      const isHidden = formContainer.style.display === 'none' || !formContainer.style.display;
      formContainer.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '➖ Cerrar formulario' : '➕ Agregar nuevo juego';
      console.log('🔧 Formulario:', isHidden ? 'abierto' : 'cerrado');
    });

    // Submit formulario
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

      // Validar campos
      if (!newProduct.nombre || !newProduct.precio_usd || !newProduct.categoria) {
        AppHelpers.showToast('⚠️ Por favor completá todos los campos obligatorios', 'error');
        return;
      }

      if (newProduct.precio_usd <= 0) {
        AppHelpers.showToast('⚠️ El precio debe ser mayor a 0', 'error');
        return;
      }

      // Agregar producto
      const addedProduct = AppStorage.addProduct(newProduct);
      AppHelpers.showToast(`✅ ${newProduct.nombre} agregado exitosamente`, 'success');
      
      // Actualizar lista de productos
      products = AppStorage.getProducts();
      
      // Resetear formulario
      form.reset();
      formContainer.style.display = 'none';
      toggleBtn.textContent = '➕ Agregar nuevo juego';
      
      // Re-renderizar
      renderProducts();
      populateCategories();
      
      console.log('✅ Producto agregado:', newProduct.nombre, 'ID:', addedProduct.id);
    });

    console.log('✅ Panel admin configurado');
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    console.log('⚙️ Configurando eventos...');

    // ===== LOGOUT =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (AppHelpers.confirm('¿Seguro que querés cerrar sesión?')) {
          console.log('🚪 Cerrando sesión...');
          AppStorage.clearCurrentUser();
          AppHelpers.showToast('👋 Sesión cerrada', 'info');
          AppHelpers.redirect('../index.html', 1000);
        }
      });
      console.log('✅ Evento logout configurado');
    }

    // ===== CARRITO =====
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', openCart);
      console.log('✅ Evento abrir carrito configurado');
    }

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCart);
      console.log('✅ Evento cerrar carrito configurado');
    }

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') {
          closeCart();
        }
      });
    }

    // ===== VACIAR CARRITO =====
    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const cart = AppStorage.getCart();
        if (cart.length === 0) {
          AppHelpers.showToast('⚠️ El carrito ya está vacío', 'error');
          return;
        }
        
        if (AppHelpers.confirm('¿Vaciar todo el carrito?')) {
          AppStorage.clearCart();
          updateCartBadge();
          openCart(); // Refrescar modal
          AppHelpers.showToast('🗑️ Carrito vaciado', 'info');
          console.log('🗑️ Carrito vaciado');
        }
      });
      console.log('✅ Evento vaciar carrito configurado');
    }

    // ===== FINALIZAR COMPRA =====
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = AppStorage.getCart();
        if (cart.length === 0) {
          AppHelpers.showToast('⚠️ El carrito está vacío', 'error');
          return;
        }
        
        const total = AppStorage.getCartTotal();
        const totalFormatted = formatPrice(total);
        
        alert(`🎮 ¡Compra finalizada!\n\n` +
              `📦 Productos: ${cart.length}\n` +
              `💰 Total: ${totalFormatted}\n\n` +
              `✅ Gracias por tu compra!`);
        
        AppStorage.clearCart();
        updateCartBadge();
        closeCart();
        AppHelpers.showToast('✅ Compra realizada exitosamente', 'success');
        
        console.log('✅ Compra finalizada - Total:', totalFormatted);
      });
      console.log('✅ Evento checkout configurado');
    }

    // ===== CAMBIAR MONEDA =====
    const currencyBtn = document.getElementById('currencyToggle');
    if (currencyBtn) {
      currencyBtn.addEventListener('click', () => {
        if (!dolarVenta) {
          AppHelpers.showToast('⚠️ Cotización del dólar no disponible', 'error');
          console.warn('⚠️ No hay cotización del dólar');
          return;
        }
        
        // Cambiar moneda
        currentCurrency = currentCurrency === 'USD' ? 'ARS' : 'USD';
        currencyBtn.textContent = currentCurrency === 'USD' ? '💵 USD' : '💰 ARS';
        
        // Re-renderizar productos
        const searchValue = document.getElementById('searchInput')?.value || '';
        renderProducts(searchValue);
        
        // Si el modal está abierto, actualizarlo
        const modal = document.getElementById('cartModal');
        if (modal && modal.classList.contains('show')) {
          openCart();
        }
        
        AppHelpers.showToast(`💱 Moneda cambiada a ${currentCurrency}`, 'info');
        console.log('💱 Moneda cambiada a:', currentCurrency);
      });
      console.log('✅ Evento cambiar moneda configurado');
    }

    // ===== BUSCADOR =====
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', AppHelpers.debounce((e) => {
        renderProducts(e.target.value);
        console.log('🔍 Buscando:', e.target.value);
      }, 300));
      console.log('✅ Evento buscador configurado');
    }

    // ===== PERFIL =====
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        console.log('👤 Navegando al perfil...');
        AppHelpers.redirect('profile.html');
      });
      console.log('✅ Evento perfil configurado');
    }

    // ===== PANEL ADMIN =====
    if (AppStorage.isAdmin()) {
      setupAdminPanel();
    }

    console.log('✅ Todos los eventos configurados correctamente');
  }

  console.log('✅ Módulo home cargado');
})();