/**
 * =======================================
 *  PROFILE MODULE - Perfil del usuario
 *  Proyecto Final - Lucas Álvarez
 * =======================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const nameField = document.getElementById('profileName');
  const emailField = document.getElementById('profileEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  // Simula usuario logueado (mock localStorage)
  const userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'Usuario Demo',
    email: 'demo@correo.com'
  };

  nameField.textContent = userData.name;
  emailField.textContent = userData.email;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userData');
    window.location.href = '../index.html';
  });
});
