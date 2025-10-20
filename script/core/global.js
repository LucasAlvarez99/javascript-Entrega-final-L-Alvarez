/**
 * ===============================================
 * GLOBAL.JS - Configuración global
 * Proyecto Final - Lucas Alvarez
 * ===============================================
 * - Carga JSON inicial
 * - API del dólar
 * - Tema claro/oscuro
 * - Protección de rutas
 */

(function() {
  'use strict';

  // ========== CONFIGURACIÓN ==========
  const CONFIG = {
    API_DOLAR: 'https://api.bluelytics.com.ar/v2/latest',
    REFRESH_INTERVAL: 300000, // 5 minutos
    JSON_USERS: './script/data/login.json',
    JSON_PRODUCTS: './script/data/games.json'
  };

  let dolarCotizacion = { compra: null, venta: null };

  // ========== INICIALIZACIÓN ==========
  async function initialize() {
    console.log('🚀 Inicializando aplicación global...');
    
    // Mostrar loading
    AppHelpers.showLoading();
    
    // Cargar JSONs iniciales
    await loadInitialData();
    
    // Configurar tema
    applyTheme(AppStorage.getTheme());
    setupThemeToggle();
    
    // Cargar cotización del dólar
    await fetchDolar();
    setInterval(fetchDolar, CONFIG.REFRESH_INTERVAL);
    
    // Proteger rutas
    protectRoutes();
    
    // Ocultar loading después de 5 segundos
    setTimeout(() => {
      AppHelpers.hideLoading();
    }, 5000);
    
    console.log('✅ Aplicación global inicializada');
  }

  // ========== CARGAR DATOS INICIALES ==========
  async function loadInitialData() {
    try {
      // Cargar usuarios
      const usersRes = await fetch(CONFIG.JSON_USERS);
      const users = await usersRes.json();
      
      // Cargar productos
      const productsRes = await fetch(CONFIG.JSON_PRODUCTS);
      const products = await productsRes.json();
      
      // Inicializar localStorage con datos del JSON
      AppStorage.initializeFromJSON(users, products);
      
      console.log('✅ Datos iniciales cargados');
    } catch (error) {
      console.warn('⚠️ Error cargando datos iniciales:', error);
    }
  }

  // ========== API DEL DÓLAR ==========
  async function fetchDolar() {
    try {
      const res = await fetch(CONFIG.API_DOLAR);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const oficial = data.oficial || null;
      
      if (oficial) {
        dolarCotizacion = {
          compra: oficial.value_buy || oficial.compra || null,
          venta: oficial.value_sell || oficial.venta || null
        };
        
        updateDolarBadge();
        console.log('💵 Cotización actualizada:', dolarCotizacion);
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener cotización del dólar:', error);
      dolarCotizacion = { compra: null, venta: null };
    }
  }

  function updateDolarBadge() {
    const badge = document.getElementById('dolarInfo');
    if (!badge) return;
    
    if (dolarCotizacion.compra && dolarCotizacion.venta) {
      badge.innerHTML = `
        💵 Compra: $${dolarCotizacion.compra.toFixed(2)} | 
        💰 Venta: $${dolarCotizacion.venta.toFixed(2)}
      `;
    } else {
      badge.textContent = '💵 Dólar: No disponible';
    }
  }

  function getDolarVenta() {
    return dolarCotizacion.venta;
  }

  function getDolarCotizacion() {
    return dolarCotizacion;
  }

  // ========== TEMA CLARO/OSCURO ==========
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
      const newTheme = AppStorage.toggleTheme();
      applyTheme(newTheme);
      
      const message = newTheme === 'dark' 
        ? '🌙 Modo Diabólico activado' 
        : '☀️ Modo Celestial activado';
      
      AppHelpers.showToast(message);
    });
  }

  // ========== PROTECCIÓN DE RUTAS ==========
  function protectRoutes() {
    const path = window.location.pathname;
    const isPublic = path.endsWith('index.html') || 
                     path.endsWith('register.html') ||
                     path === '/';
    
    if (!isPublic && !AppStorage.isLoggedIn()) {
      console.warn('⚠️ Acceso denegado. Redirigiendo al login...');
      AppHelpers.redirect('../index.html');
    }
  }

  // ========== EXPORTAR API ==========
  window.AppGlobal = {
    getDolarVenta,
    getDolarCotizacion,
    applyTheme,
    fetchDolar
  };

  // ========== AUTO-INICIALIZACIÓN ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  console.log('✅ AppGlobal cargado');
})();