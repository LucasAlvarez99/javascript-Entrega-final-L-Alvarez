/**
 * main.js
 * Inicialización global de la app
 * - Maneja theme toggle y persistencia
 * - Trae cotización dólar (API pública)
 * - Agrega badge del dólar y botón toggle al header si no existen
 * - Expone helpers en window.AppMain
 */

(function () {
  // CONFIG
  const DOLAR_API_URL = 'https://api.exchangerate.host/latest?base=USD&symbols=ARS';
  const DOLAR_REFRESH_MS = 1000 * 60 * 5; // 5 minutos

  // Helpers DOM
  function qs(selector, base = document) {
    return base.querySelector(selector);
  }
  function qsa(selector, base = document) {
    return Array.from(base.querySelectorAll(selector));
  }

  // THEME
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Puedes aplicar clases en body según prefieras:
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }

  function toggleTheme() {
    const current = window.AppStorage.getTheme() || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    window.AppStorage.setTheme(next);
    applyTheme(next);
    updateToggleButton(next);
  }

  function updateToggleButton(theme) {
    const btn = qs('#themeToggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.textContent = theme === 'dark' ? 'Modo oscuro' : 'Modo claro';
  }

  // DÓLAR (fetch)
  async function fetchDolar() {
    const badge = ensureDollarBadge();
    badge.textContent = 'Dólar: cargando...';
    try {
      const resp = await fetch(DOLAR_API_URL, { cache: 'no-store' });
      if (!resp.ok) throw new Error('Respuesta no OK');
      const data = await resp.json();
      // exchangerate.host retorna { rates: { ARS: 350 } } por ejemplo
      const rate = data && data.rates && data.rates.ARS;
      if (!rate) throw new Error('Formato inesperado de API');
      // Mostrar con 2 decimales
      badge.textContent = `USD → ARS: ${Number(rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
    } catch (err) {
      console.warn('No se pudo obtener cotización del dólar:', err);
      badge.textContent = 'Dólar: N/A';
    }
  }

  function ensureDollarBadge() {
    let badge = qs('#dolarBadge');
    if (badge) return badge;
    // Crear badge y colocarlo en el header (derecha)
    const header = qs('.header-container') || qs('header');
    if (!header) {
      // si no hay header, crear uno en body (fallback)
      const newHeader = document.createElement('div');
      newHeader.className = 'header-container';
      document.body.insertBefore(newHeader, document.body.firstChild);
      badge = document.createElement('div');
      badge.id = 'dolarBadge';
      newHeader.appendChild(badge);
      return badge;
    }
    badge = document.createElement('div');
    badge.id = 'dolarBadge';
    badge.style.marginLeft = '1rem';
    badge.style.fontSize = '0.95rem';
    badge.style.color = '#fff';
    header.appendChild(badge);
    return badge;
  }

  // BUTTON TOGGLE (create if not present)
  function ensureThemeToggle() {
    let btn = qs('#themeToggle');
    if (btn) return btn;

    const header = qs('.header-container');
    if (!header) {
      // sin header, creamos uno pequeño
      const h = document.createElement('div');
      h.className = 'header-container';
      document.body.insertBefore(h, document.body.firstChild);
    }

    btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.type = 'button';
    btn.className = 'btn-theme-toggle';
    btn.style.marginLeft = '1rem';
    btn.setAttribute('aria-label', 'Alternar tema claro/oscuro');
    btn.addEventListener('click', toggleTheme);

    // Añadimos al header (al final)
    const headerContainer = qs('.header-container');
    headerContainer.appendChild(btn);
    return btn;
  }

  // Inicialización general
  function init() {
    // 1) Aplicar theme guardado
    const savedTheme = window.AppStorage.getTheme() || 'light';
    applyTheme(savedTheme);

    // 2) Asegurar toggle y badge
    ensureThemeToggle();
    updateToggleButton(savedTheme);
    ensureDollarBadge();

    // 3) Cargar cotización del dólar y refrescar periódicamente
    fetchDolar();
    setInterval(fetchDolar, DOLAR_REFRESH_MS);

    // 4) Protección básica: si hay páginas que necesitan auth, redirigir si no hay user
    protectRoutes();

    // 5) Exponer helpers mínimos
    window.AppMain = {
      toggleTheme,
      fetchDolar,
      applyTheme
    };
  }

  // PROTECCIÓN BÁSICA DE RUTAS (login guard)
  function protectRoutes() {
    const publicPaths = ['index.html', '/', '/index.html', '/pages/register.html'];
    const path = location.pathname;
    const isPublic = publicPaths.some(p => path.endsWith(p) || path === p);
    const user = window.AppStorage.getUser();

    // Si la ruta NO es pública y no hay usuario, redirigir a login
    if (!isPublic && !user) {
      // Excepciones: si estás en páginas públicas dentro /pages (register)
      // Redirigir sólo si la url no contiene 'index.html' ni 'register.html'
      if (!path.includes('index.html') && !path.includes('register.html')) {
        console.info('Usuario no autenticado. Redirigiendo a login.');
        // Usa replace para no dejar historial
        window.location.replace('/index.html');
      }
    }
  }

  // Arranque al DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
