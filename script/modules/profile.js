/**
 * ===============================================
 * PROFILE.JS - Lógica del perfil
 * Proyecto Final - Lucas Álvarez
 * ===============================================
 */

(function() {
  'use strict';

  // ========== PROTECCIÓN DE RUTA ==========
  if (!AppStorage.isLoggedIn()) {
    console.warn('⚠️ No autenticado');
    AppHelpers.redirect('../index.html');
    return;
  }

  // ========== ELEMENTOS DOM ==========
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const usernameInput = document.getElementById('profileUsername');
  const passwordInput = document.getElementById('profilePassword');
  const confirmInput = document.getElementById('profileConfirm');
  const errorMsg = document.getElementById('profileError');
  const userRole = document.getElementById('userRole');
  const userCreated = document.getElementById('userCreated');
  const exportBtn = document.getElementById('exportUsers');

  let currentUser = null;

  // ========== INICIALIZACIÓN ==========
  document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Inicializando perfil...');
    
    currentUser = AppStorage.getCurrentUser();
    
    if (!currentUser) {
      AppHelpers.redirect('../index.html');
      return;
    }

    // Cargar datos del usuario
    loadUserData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Mostrar botón de exportar solo para admin
    if (AppStorage.isAdmin() && exportBtn) {
      exportBtn.style.display = 'block';
    }
    
    console.log('✅ Perfil inicializado');
  });

  // ========== CARGAR DATOS DEL USUARIO ==========
  function loadUserData() {
    if (nameInput) nameInput.value = currentUser.name || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (usernameInput) usernameInput.value = currentUser.username || '';
    if (userRole) {
      const roleText = currentUser.role === 'admin' ? '👑 Administrador' : '👤 Usuario';
      const roleBadge = currentUser.role === 'admin' ? 'badge-admin' : 'badge-user';
      userRole.innerHTML = `<span class="${roleBadge}">${roleText}</span>`;
    }
    if (userCreated && currentUser.createdAt) {
      userCreated.textContent = AppHelpers.formatDate(currentUser.createdAt);
    }
    
    console.log('✅ Datos cargados:', currentUser);
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    // Guardar cambios
    if (form) {
      form.addEventListener('submit', handleSaveChanges);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Volver al inicio
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        AppHelpers.redirect('home.html');
      });
    }

    // Exportar usuarios (solo admin)
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExportUsers);
    }

    // Validación en tiempo real
    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        if (passwordInput.value && confirmInput.value !== passwordInput.value) {
          showError('Las contraseñas no coinciden');
        } else {
          errorMsg.textContent = '';
        }
      });
    }
  }

  // ========== GUARDAR CAMBIOS ==========
  function handleSaveChanges(e) {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    console.log('💾 Guardando cambios...');
    
    // Validaciones
    if (!name || !email || !username) {
      showError('Por favor completá todos los campos obligatorios');
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
    
    // Si cambió la contraseña, validar
    if (password) {
      if (!AppHelpers.validatePassword(password)) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (password !== confirm) {
        showError('Las contraseñas no coinciden');
        return;
      }
    }

    // Verificar si el email/username ya existen en otro usuario
    const users = AppStorage.getUsers();
    const duplicate = users.find(u => 
      u.id !== currentUser.id && (u.email === email || u.username === username)
    );
    
    if (duplicate) {
      showError('El email o usuario ya están en uso por otro usuario');
      return;
    }

    // Preparar actualización
    const updates = {
      name,
      email,
      username
    };
    
    if (password) {
      updates.password = password;
    }

    // Actualizar usuario
    const success = AppStorage.updateUser(currentUser.id, updates);
    
    if (!success) {
      showError('Error al actualizar el perfil');
      return;
    }

    // Actualizar usuario actual
    currentUser = AppStorage.getCurrentUser();
    
    showSuccess('✅ Perfil actualizado correctamente');
    AppHelpers.showToast('✅ Cambios guardados exitosamente', 'success');
    
    // Limpiar campos de contraseña
    if (passwordInput) passwordInput.value = '';
    if (confirmInput) confirmInput.value = '';
    
    console.log('✅ Perfil actualizado');
  }

  // ========== LOGOUT ==========
  function handleLogout() {
    if (AppHelpers.confirm('¿Seguro que querés cerrar sesión?')) {
      console.log('🚪 Cerrando sesión...');
      AppStorage.clearCurrentUser();
      AppHelpers.showToast('👋 Sesión cerrada', 'info');
      AppHelpers.redirect('../index.html', 1000);
    }
  }

  // ========== EXPORTAR USUARIOS (SOLO ADMIN) ==========
  function handleExportUsers() {
    if (!AppStorage.isAdmin()) {
      AppHelpers.showToast('⚠️ Solo los administradores pueden exportar usuarios', 'error');
      return;
    }

    console.log('📥 Exportando usuarios...');

    const users = AppStorage.getUsers();
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios_gamestore_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    AppHelpers.showToast('✅ Lista de usuarios descargada', 'success');
    console.log('✅ Usuarios exportados');
  }

  // ========== MENSAJES ==========
  function showError(message) {
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.style.color = 'var(--error)';
    }
  }

  function showSuccess(message) {
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.style.color = 'var(--success)';
    }
  }

  console.log('✅ Módulo profile cargado');
})();