// ============================================
// MODAL-SYSTEM.JS - Sistema de modales bonitos
// Reemplaza los alerts/confirms feos del navegador
// ============================================

console.log('🎨 [modal-system.js] Iniciando sistema de modales...');

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================

function showConfirmModal(message, onConfirm, onCancel) {
    console.log('❓ [modal-system] Mostrando confirmación:', message);
    
    // Remover modal existente
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content confirm-modal">
            <div class="modal-icon">⚠️</div>
            <h3 class="modal-title">Confirmar acción</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button class="btn btn-cancel" id="modal-cancel">Cancelar</button>
                <button class="btn btn-confirm" id="modal-confirm">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Eventos
    document.getElementById('modal-cancel').onclick = () => {
        console.log('❌ [modal-system] Confirmación cancelada');
        modal.remove();
        if (onCancel) onCancel();
    };
    
    document.getElementById('modal-confirm').onclick = () => {
        console.log('✅ [modal-system] Confirmación aceptada');
        modal.remove();
        if (onConfirm) onConfirm();
    };
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            if (onCancel) onCancel();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    console.log('✅ [modal-system] Modal de confirmación mostrado');
}

// ============================================
// MODAL DE ALERTA
// ============================================

function showAlertModal(message, type = 'info', onClose) {
    console.log(`ℹ️ [modal-system] Mostrando alerta [${type}]:`, message);
    
    const existing = document.getElementById('alert-modal');
    if (existing) existing.remove();
    
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    
    const colors = {
        info: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336'
    };
    
    const modal = document.createElement('div');
    modal.id = 'alert-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content alert-modal ${type}">
            <div class="modal-icon" style="color: ${colors[type]}">
                ${icons[type]}
            </div>
            <h3 class="modal-title">${type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información'}</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button class="btn btn-primary" id="modal-ok">Entendido</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('modal-ok').onclick = () => {
        modal.remove();
        if (onClose) onClose();
        console.log('✅ [modal-system] Modal cerrado');
    };
    
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            if (onClose) onClose();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// ============================================
// MODAL DE INPUT (PARA REEMPLAZAR PROMPT)
// ============================================

function showInputModal(title, placeholder, onSubmit, onCancel) {
    console.log('📝 [modal-system] Mostrando input modal:', title);
    
    const existing = document.getElementById('input-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'input-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content input-modal">
            <div class="modal-icon">📝</div>
            <h3 class="modal-title">${title}</h3>
            <input type="text" 
                   id="modal-input" 
                   class="modal-input" 
                   placeholder="${placeholder}"
                   autocomplete="off">
            <div class="modal-actions">
                <button class="btn btn-cancel" id="modal-cancel">Cancelar</button>
                <button class="btn btn-primary" id="modal-submit">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = document.getElementById('modal-input');
    input.focus();
    
    const submit = () => {
        const value = input.value.trim();
        if (value) {
            console.log('✅ [modal-system] Input enviado:', value);
            modal.remove();
            if (onSubmit) onSubmit(value);
        } else {
            input.style.borderColor = '#f44336';
            setTimeout(() => input.style.borderColor = '', 300);
        }
    };
    
    document.getElementById('modal-cancel').onclick = () => {
        console.log('❌ [modal-system] Input cancelado');
        modal.remove();
        if (onCancel) onCancel();
    };
    
    document.getElementById('modal-submit').onclick = submit;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') submit();
    };
}

// ============================================
// MODAL DE ELIMINACIÓN DE BANDA
// ============================================

function showDeleteBandModal(bandName, onConfirm) {
    console.log('🗑️ [modal-system] Modal de eliminación para:', bandName);
    
    showConfirmModal(
        `¿Estás seguro de eliminar la banda "${bandName}"?<br><br>
        <small style="color: #ff5252;">Esta acción no se puede deshacer.</small>`,
        onConfirm
    );
}

// ============================================
// MODAL DE AGREGAR CANCIONES DESDE YOUTUBE
// ============================================

function showAddSongsModal(albumId, albumTitle) {
    console.log('🎵 [modal-system] Modal de agregar canciones:', albumTitle);
    
    const existing = document.getElementById('add-songs-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'add-songs-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content add-songs-modal">
            <div class="modal-header">
                <h3>🎵 Agregar canciones a "${albumTitle}"</h3>
                <button class="close-btn" onclick="closeAddSongsModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="info-box">
                    <p>📹 Pega el enlace de YouTube de cada canción</p>
                    <small>Solo se usará el audio del video</small>
                </div>
                
                <div class="url-input-group">
                    <input type="text" 
                           id="song-url-input" 
                           placeholder="https://youtube.com/watch?v=..."
                           autocomplete="off">
                    <button class="btn btn-add" onclick="addSongFromModal()">
                        Agregar
                    </button>
                </div>
                
                <div id="songs-preview-list" class="songs-preview-list">
                    <div class="empty-state">
                        No hay canciones agregadas
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-cancel" onclick="closeAddSongsModal()">
                    Cancelar
                </button>
                <button class="btn btn-primary" onclick="saveSongsFromModal('${albumId}')">
                    Guardar canciones
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('song-url-input').focus();
}

function closeAddSongsModal() {
    const modal = document.getElementById('add-songs-modal');
    if (modal) modal.remove();
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.modalSystem = {
    confirm: showConfirmModal,
    alert: showAlertModal,
    input: showInputModal,
    deleteBand: showDeleteBandModal,
    addSongs: showAddSongsModal
};

// Sobrescribir funciones globales
window.customConfirm = showConfirmModal;
window.customAlert = showAlertModal;

console.log('✅ [modal-system.js] Sistema de modales cargado');
console.log('📦 [modal-system.js] Funciones disponibles:', Object.keys(window.modalSystem));