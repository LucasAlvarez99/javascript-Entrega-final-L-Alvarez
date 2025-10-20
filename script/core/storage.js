/**
 * ===============================================
 * STORAGE.JS - Sistema de localStorage
 * Proyecto Final - Lucas Alvarez
 * ===============================================
 */

(function() {
  'use strict';

  const KEYS = {
    USERS: 'gamestore_users',
    USER: 'gamestore_current_user',
    PRODUCTS: 'gamestore_products',
    CART: 'gamestore_cart',
    THEME: 'gamestore_theme'
  };

  // ========== HELPERS ==========
  function safeParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }

  // ========== USUARIOS ==========
  function getUsers() {
    return safeParse(localStorage.getItem(KEYS.USERS), []);
  }

  function setUsers(users) {
    localStorage.setItem(KEYS.USERS, safeStringify(users));
  }

  function addUser(user) {
    const users = getUsers();
    
    // Verificar si ya existe
    const exists = users.some(u => 
      u.email === user.email || u.username === user.username
    );
    
    if (exists) return false;
    
    // Agregar ID y role por defecto
    user.id = Date.now();
    user.role = user.role || 'user';
    user.createdAt = new Date().toISOString();
    
    users.push(user);
    setUsers(users);
    return true;
  }

  function updateUser(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return false;
    
    // Actualizar usuario
    users[index] = { ...users[index], ...updates };
    setUsers(users);
    
    // Si es el usuario actual, actualizar también
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[index]);
    }
    
    return true;
  }

  function deleteUser(userId) {
    const users = getUsers().filter(u => u.id !== userId);
    setUsers(users);
  }

  function validateUser(email, password) {
    const users = getUsers();
    return users.find(u => u.email === email && u.password === password);
  }

  // ========== SESIÓN ACTUAL ==========
  function setCurrentUser(user) {
    localStorage.setItem(KEYS.USER, safeStringify(user));
  }

  function getCurrentUser() {
    return safeParse(localStorage.getItem(KEYS.USER), null);
  }

  function clearCurrentUser() {
    localStorage.removeItem(KEYS.USER);
  }

  function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  }

  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  // ========== PRODUCTOS ==========
  function getProducts() {
    return safeParse(localStorage.getItem(KEYS.PRODUCTS), []);
  }

  function setProducts(products) {
    localStorage.setItem(KEYS.PRODUCTS, safeStringify(products));
  }

  function addProduct(product) {
    const products = getProducts();
    product.id = Date.now();
    products.push(product);
    setProducts(products);
    return product;
  }

  function updateProduct(productId, updates) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) return false;
    
    products[index] = { ...products[index], ...updates };
    setProducts(products);
    return true;
  }

  function deleteProduct(productId) {
    const products = getProducts().filter(p => p.id !== productId);
    setProducts(products);
  }

  // ========== CARRITO ==========
  function getCart() {
    return safeParse(localStorage.getItem(KEYS.CART), []);
  }

  function setCart(cart) {
    localStorage.setItem(KEYS.CART, safeStringify(cart));
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    setCart(cart);
    return cart;
  }

  function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    setCart(cart);
    return cart;
  }

  function updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
      item.quantity = quantity;
      setCart(cart);
    }
    
    return cart;
  }

  function clearCart() {
    localStorage.removeItem(KEYS.CART);
  }

  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => {
      return sum + (item.precio_usd * (item.quantity || 1));
    }, 0);
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  // ========== TEMA ==========
  function getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'light';
  }

  function setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
  }

  // ========== INICIALIZACIÓN ==========
  function initializeFromJSON(users, products) {
    // Solo inicializar si no hay datos
    if (getUsers().length === 0 && users) {
      setUsers(users);
      console.log('✅ Usuarios cargados desde JSON');
    }
    
    if (getProducts().length === 0 && products) {
      setProducts(products);
      console.log('✅ Productos cargados desde JSON');
    }
  }

  function clearAll() {
    localStorage.clear();
    console.log('🗑️ localStorage limpiado');
  }

  // ========== EXPORTAR API ==========
  window.AppStorage = {
    // Usuarios
    getUsers,
    setUsers,
    addUser,
    updateUser,
    deleteUser,
    validateUser,
    
    // Sesión
    setCurrentUser,
    getCurrentUser,
    clearCurrentUser,
    isAdmin,
    isLoggedIn,
    
    // Productos
    getProducts,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Carrito
    getCart,
    setCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    
    // Tema
    getTheme,
    setTheme,
    toggleTheme,
    
    // Utilidades
    initializeFromJSON,
    clearAll
  };

  console.log('✅ AppStorage inicializado');
})();