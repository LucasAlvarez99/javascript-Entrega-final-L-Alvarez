import { initTheme } from './uiExtras.js';

// ===============================
// 🧾 REGISTRO DE NUEVOS USUARIOS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const form = document.getElementById('registerForm');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const usuario = document.getElementById('usuario').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!nombre || !usuario || !email || !password) {
      mostrarToast('⚠️ Completá todos los campos');
      return;
    }

    if (password.length < 4) {
      mostrarToast('🔐 La contraseña debe tener al menos 4 caracteres');
      return;
    }

    // Cargar usuarios existentes
    const registrados = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Evitar duplicados
    if (registrados.find(u => u.usuario === usuario || u.email === email)) {
      mostrarToast('🚫 Usuario o email ya registrado');
      return;
    }

    // Crear nuevo usuario
    const nuevo = {
      id: Date.now(),
      nombre,
      usuario,
      email,
      password
    };

    registrados.push(nuevo);
    localStorage.setItem('usuarios', JSON.stringify(registrados));

    mostrarToast('✅ Registro exitoso. Redirigiendo...');
    setTimeout(() => (window.location.href = '../index.html'), 1800);
  });
});

// ===============================
// 📦 Funciones auxiliares
// ===============================
function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}
