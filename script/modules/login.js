/**
 * =======================================
 *  LOGIN MODULE - Proyecto Final L. Álvarez
 * =======================================
 * 
 * Funcionalidad:
 *  - Validar usuario/contraseña contra data/login.json
 *  - Mostrar errores amigables
 *  - Guardar sesión en AppStorage (localStorage)
 *  - Redirigir al home al loguear correctamente
 *  - Evitar re-login si ya hay sesión activa
 * 
 * Dependencias: AppStorage (script/core/storage.js)
 *                AppMain (script/core/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');

  // Si el usuario ya está logueado, redirigir directamente
  const existingUser = AppStorage.getUser();
  if (existingUser) {
    window.location.href = 'pages/home.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.style.color = '#ff4d4d';

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    // Validación básica de campos
    if (!username || !password) {
      msg.textContent = 'Por favor completá todos los campos.';
      return;
    }

    try {
      // Obtener los usuarios desde JSON local
      const response = await fetch('data/login.json');
      if (!response.ok) throw new Error('No se pudo cargar login.json');

      const users = await response.json();

      // Buscar usuario que coincida
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        msg.textContent = 'Usuario o contraseña incorrectos.';
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        return;
      }

      // Guardar en localStorage
      AppStorage.setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username
      });

      msg.style.color = 'green';
      msg.textContent = 'Inicio de sesión exitoso. Redirigiendo...';

      // Animación y redirección
      setTimeout(() => {
        window.location.href = 'pages/home.html';
      }, 1200);

    } catch (error) {
      console.error('Error al intentar iniciar sesión:', error);
      msg.textContent = 'Error interno. Intentalo nuevamente más tarde.';
    }
  });
});
