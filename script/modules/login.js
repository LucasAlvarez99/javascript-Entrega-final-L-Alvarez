import { initTheme } from './uiExtras.js';

// ===============================
// 🔑 LOGIN PRINCIPAL
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();

  const userList = document.getElementById('userList');
  const form = document.getElementById('loginForm');

  // Mostrar usuarios disponibles
  const users = await cargarUsuarios();
  renderUsuarios(users);

  // Agregar los de localStorage (registrados)
  const registrados = JSON.parse(localStorage.getItem('usuarios') || '[]');
  if (registrados.length) {
    const title = document.createElement('h4');
    title.textContent = 'Usuarios registrados';
    userList.appendChild(title);

    registrados.forEach(u => {
      const li = document.createElement('li');
      li.textContent = `${u.usuario} - ${u.email}`;
      userList.appendChild(li);
    });
  }

  // Evento de login
  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const todos = [...users, ...registrados];
    const user = todos.find(u => u.usuario === username && u.password === password);

    if (user) {
      localStorage.setItem('session', JSON.stringify(user));
      mostrarToast('✅ Bienvenido ' + user.nombre);
      setTimeout(() => (window.location.href = 'pages/home.html'), 1200);
    } else {
      mostrarToast('❌ Usuario o contraseña incorrectos');
    }
  });
});

// ===============================
// 📦 FUNCIONES AUXILIARES
// ===============================
async function cargarUsuarios() {
  try {
    const res = await fetch('script/data/login.json');
    return await res.json();
  } catch (err) {
    console.error('Error cargando login.json', err);
    return [];
  }
}

function renderUsuarios(users) {
  const ul = document.getElementById('userList');
  ul.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.usuario} - ${u.password}`;
    ul.appendChild(li);
  });
}

function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}
