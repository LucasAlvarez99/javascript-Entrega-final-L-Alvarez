/**
 * ===============================================
 * LOGIN.JS - Lógica del login
 * Proyecto Final - Lucas Alvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== ELEMENTOS DOM ==========
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorMsg = document.getElementById('loginError');
  const userSelect = document.getElementById('userSelect');
  const quickLoginBtn = document.getElementById('quickLoginBtn');
  const userStats = document.getElementById('userStats');
  const searchInput = document.getElementById('searchUsers');

  // ========== INICIALIZACIÓN ==========
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Inicializando login...');
    
    // Si ya está logueado, redirigir
    if (AppStorage.isLoggedIn()) {
      console.log('✅ Usuario ya logueado');
      AppHelpers.redirect('pages/home.html');
      return;
    }

    // Cargar dropdown de usuarios
    loadUserDropdown();
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Login inicializado');
  });

  // ========== CARGAR DROPDOWN DE USUARIOS ==========
  function loadUserDropdown() {
    const users = AppStorage.getUsers();
    
    if (!userSelect) return;
    
    // Limpiar dropdown
    userSelect.innerHTML = '<option value="">-- Seleccionar usuario --</option>';
    
    // Agregar usuarios
    users.forEach(user => {
      const badge = user.role === 'admin' ? '🔴' : '🟢';
      const option = document.createElement('option');
      option.value = user.email;
      option.textContent = `${badge} ${user.email} - ${user.name}`;
      option.dataset.password = user.password;
      option.dataset.role = user.role;
      userSelect.appendChild(option);
    });
    
    // Actualizar estadísticas
    updateStats(users);
    
    console.log('✅ Dropdown cargado con', users.length, 'usuarios');
  }

  function updateStats(users) {
    if (!userStats) return;
    
    const admins = users.filter(u => u.role === 'admin').length;
    const total = users.length;
    
    userStats.textContent = `👥 Usuarios: ${total} | 👑 Admins: ${admins}`;
  }

  // ========== BÚSQUEDA EN DROPDOWN ==========
  function filterUsers() {
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const options = userSelect.querySelectorAll('option');
    
    options.forEach(option => {
      if (option.value === '') return;
      
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(query) ? 'block' : 'none';
    });
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    // Formulario de login
    form.addEventListener('submit', handleLogin);
    
    // Cambio en dropdown
    if (userSelect) {
      userSelect.addEventListener('change', handleUserSelect);
    }
    
    // Login rápido
    if (quickLoginBtn) {
      quickLoginBtn.addEventListener('click', handleQuickLogin);
    }
    
    // Búsqueda
    if (searchInput) {
      searchInput.addEventListener('input', filterUsers);
    }
  }

  // ========== MANEJAR LOGIN ==========
  function handleLogin(e) {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('🔐 Intentando login:', email);
    
    // Validaciones
    if (!email || !password) {
      showError('Por favor completá todos los campos');
      return;
    }
    
    if (!AppHelpers.validateEmail(email)) {
      showError('Email inválido');
      return;
    }
    
    // Validar usuario
    const user = AppStorage.validateUser(email, password);
    
    if (!user) {
      showError('Email o contraseña incorrectos');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
      return;
    }
    
    // Login exitoso
    console.log('✅ Login exitoso:', user);
    AppStorage.setCurrentUser(user);
    
    showSuccess('✓ Ingresando...');
    AppHelpers.redirect('pages/home.html', 1000);
  }

  // ========== MANEJAR SELECCIÓN DE USUARIO ==========
  function handleUserSelect() {
    const selectedOption = userSelect.options[userSelect.selectedIndex];
    
    if (!selectedOption.value) {
      emailInput.value = '';
      passwordInput.value = '';
      quickLoginBtn.style.display = 'none';
      return;
    }
    
    // Autocompletar email
    emailInput.value = selectedOption.value;
    
    // Mostrar botón de login rápido
    quickLoginBtn.style.display = 'block';
    quickLoginBtn.dataset.password = selectedOption.dataset.password;
    
    console.log('📧 Usuario seleccionado:', selectedOption.value);
  }

  // ========== LOGIN RÁPIDO ==========
  function handleQuickLogin() {
    const email = emailInput.value;
    const password = quickLoginBtn.dataset.password;
    
    if (!email || !password) return;
    
    console.log('⚡ Login rápido:', email);
    
    const user = AppStorage.validateUser(email, password);
    
    if (user) {
      AppStorage.setCurrentUser(user);
      showSuccess('⚡ Acceso rápido exitoso');
      AppHelpers.redirect('pages/home.html', 800);
    } else {
      showError('Error en acceso rápido');
    }
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

  console.log('✅ Módulo login cargado');
})();