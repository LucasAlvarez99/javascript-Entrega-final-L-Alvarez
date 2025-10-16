// themeManager.js
export function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);

  const btn = document.getElementById('themeToggle');
  btn && btn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(current);
    localStorage.setItem('theme', current);
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    const t = document.getElementById('themeToggle');
    if (t) t.textContent = '😈 Modo Diabólico';
  } else {
    document.body.setAttribute('data-theme', 'light');
    const t = document.getElementById('themeToggle');
    if (t) t.textContent = '😇 Modo Celestial';
  }
}
