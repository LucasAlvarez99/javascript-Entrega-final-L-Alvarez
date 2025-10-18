/**
 * storage.js
 * Gestión simple y consolidada de localStorage/sessionStorage
 * Expuesto como window.AppStorage
 *
 * Funciones:
 *  - setUser(userObj), getUser(), clearUser()
 *  - setTheme('light'|'dark'), getTheme()
 *  - setCart(cartArray), getCart(), clearCart()
 *  - safeParse(json)
 */

(function () {
  const KEY_USER = 'app_user_v1';
  const KEY_THEME = 'app_theme_v1';
  const KEY_CART = 'app_cart_v1';

  function safeParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function setUser(user) {
    if (!user) return;
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  }

  function getUser() {
    const raw = localStorage.getItem(KEY_USER);
    return safeParse(raw, null);
  }

  function clearUser() {
    localStorage.removeItem(KEY_USER);
  }

  function setTheme(theme) {
    if (!theme) return;
    localStorage.setItem(KEY_THEME, theme);
  }

  function getTheme() {
    return localStorage.getItem(KEY_THEME) || 'light';
  }

  function setCart(items = []) {
    localStorage.setItem(KEY_CART, JSON.stringify(items));
  }

  function getCart() {
    const raw = localStorage.getItem(KEY_CART);
    return safeParse(raw, []);
  }

  function clearCart() {
    localStorage.removeItem(KEY_CART);
  }

  // Exponer API globalmente
  window.AppStorage = {
    setUser,
    getUser,
    clearUser,
    setTheme,
    getTheme,
    setCart,
    getCart,
    clearCart,
    safeParse
  };
})();
