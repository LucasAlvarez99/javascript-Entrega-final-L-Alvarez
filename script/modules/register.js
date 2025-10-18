/**
 * =======================================
 *  REGISTER MODULE - Registro de usuarios
 *  Proyecto Final - Lucas Álvarez
 * =======================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = ''; // Limpia mensaje previo

    const fullname = form.fullname.value.trim();
    const email = form.email.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    if (!fullname || !email || !username || !password) {
      msg.textContent = 'Por favor completá todos los campos.';
      return;
    }

    if (password.length < 6) {
      msg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Simula registro exitoso (mock)
    msg.style.color = 'green';
    msg.textContent = 'Cuenta creada con éxito. Redirigiendo...';

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1500);
  });
});
