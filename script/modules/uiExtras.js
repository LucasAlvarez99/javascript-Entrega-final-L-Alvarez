// ==========================================
// 🎨 uiExtras.js
// Controla el tema, toasts y efectos visuales
// ==========================================

// 🌗 Inicializa el tema actual
export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const temaActual = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', temaActual === 'dark');

  toggle.textContent = temaActual === 'dark' ? '😈' : '😇';

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? '😈' : '😇';
    mostrarToast(isDark ? '🌑 Modo Diabólico activado' : '☀️ Modo Celestial activado');
  });
}

// 💬 Toast visual
export function mostrarToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

// 💫 Animación sutil de entrada para tarjetas o contenedores
export function animarEntrada(selector) {
  const elementos = document.querySelectorAll(selector);
  elementos.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 * i);
  });
}
