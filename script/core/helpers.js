/**
 * ===============================================
 * HELPERS.JS - Funciones auxiliares
 * Proyecto Final - Lucas Alvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== TOAST NOTIFICATIONS ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast show toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ========== LOADING SCREEN ==========
  function showLoading() {
    const existing = document.getElementById('globalLoading');
    if (existing) return;

    const loader = document.createElement('div');
    loader.id = 'globalLoading';
    loader.className = 'loading-screen';
    loader.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando...</p>
      </div>
    `;
    document.body.appendChild(loader);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      hideLoading();
    }, 5000);
  }

  function hideLoading() {
    const loader = document.getElementById('globalLoading');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }

  // ========== VALIDACIONES ==========
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    return password && password.length >= 6;
  }

  function validateUsername(username) {
    return username && username.length >= 3;
  }

  // ========== FORMATEO ==========
  function formatPrice(price, currency = 'USD', rate = null) {
    if (currency === 'ARS' && rate) {
      const priceARS = price * rate;
      return `💰 $${priceARS.toLocaleString('es-AR', { 
        maximumFractionDigits: 2 
      })} ARS`;
    }
    return `💵 $${price.toFixed(2)} USD`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ========== UTILIDADES DOM ==========
  function qs(selector, base = document) {
    return base.querySelector(selector);
  }

  function qsa(selector, base = document) {
    return Array.from(base.querySelectorAll(selector));
  }

  function createElement(tag, className, content = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
  }

  // ========== CONFIRMACIONES ==========
  function confirm(message) {
    return window.confirm(message);
  }

  // ========== REDIRECCIONES ==========
  function redirect(url, delay = 0) {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  }

  // ========== GENERADOR DE IDs ==========
  function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  // ========== SANITIZACIÓN ==========
  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========== DEBOUNCE ==========
  function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ========== EXPORTAR API ==========
  window.AppHelpers = {
    showToast,
    showLoading,
    hideLoading,
    validateEmail,
    validatePassword,
    validateUsername,
    formatPrice,
    formatDate,
    qs,
    qsa,
    createElement,
    confirm,
    redirect,
    generateId,
    sanitize,
    debounce
  };

  console.log('✅ AppHelpers inicializado');
})();