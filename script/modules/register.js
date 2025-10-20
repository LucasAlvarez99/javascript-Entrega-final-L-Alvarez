/**
 * ===============================================
 * REGISTER.JS - Lógica del registro
 * Proyecto Final - Lucas Alvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== ELEMENTOS DOM ==========
  const form = document.getElementById('registerForm');
  const nameInput = document.getElementById('regName');
  const usernameInput = document.getElementById('regUsername');
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirm');
  const errorMsg = document.getElementById('registerError');

  // ========== INICIALIZACIÓN ==========
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Inicializando registro...');
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Registro inicializado');
  });

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    form.addEventListener('submit', handleRegister);
    
    // Validación en tiempo real
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !AppHelpers.validateEmail(emailInput.value)) {
        showError('Email inválido');
      } else {
        errorMsg.textContent = '';
      }
    });
    
    confirmInput.addEventListener('input', () => {
      if (confirmInput.value && confirmInput.value !== passwordInput.value) {
        showError('Las contraseñas no coinciden');
      } else {
        errorMsg.textContent = '';
      }
    });
  }

  // ========== MANEJAR REGISTRO ==========
  function handleRegister(e) {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    console.log('📝 Intentando registrar:', email);
    
    // Validaciones
    if (!name || !username || !email || !password || !confirm) {
      showError('Por favor completá todos los campos');
      return;
    }
    
    if (!AppHelpers.validateEmail(email)) {
      showError('Email inválido');
      return;
    }
    
    if (!AppHelpers.validateUsername(username)) {
      showError('El usuario debe tener al menos 3 caracteres');
      return;
    }
    
    if (!AppHelpers.validatePassword(password)) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirm) {
      showError('Las contraseñas no coinciden');
      return;
    }
    
    // Crear usuario
    const newUser = {
      name,
      username,
      email,
      password,
      role: 'user'
    };
    
    const success = AppStorage.addUser(newUser);
    
    if (!success) {
      showError('El email o usuario ya están registrados');
      return;
    }
    
    // Registro exitoso
    console.log('✅ Usuario registrado:', email);
    showSuccess('✓ Cuenta creada exitosamente');
    
    // Limpiar formulario
    form.reset();
    
    // Redirigir al login
    AppHelpers.showToast('Usuario registrado correctamente. Redirigiendo al login...', 'success');
    AppHelpers.redirect('../index.html', 2000);
  }

  // ========== MENSAJES ==========
  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.color = 'var(--error)';
  }

  function showSuccess(message) {
    errorMsg.textContent = message;
    errorMsg.style.color = 'var(--success)';
  }

  console.log('✅ Módulo register cargado');
})();