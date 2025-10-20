// ============================================
// ALBUMS-FORM.JS - Gestión de formularios
// ============================================

console.log('📝 [albums-form.js] Iniciando módulo de formularios...');

// Variable temporal para canciones
window.currentTracks = [];

// ============================================
// MOSTRAR FORMULARIO DE ÁLBUM
// ============================================

function showAlbumForm(bandId) {
    console.log('📝 [albums-form] showAlbumForm llamado');
    console.log('📊 [albums-form] BandId recibido:', bandId);
    
    if (!bandId) {
        console.warn('⚠️ [albums-form] No se proporcionó bandId, buscando...');
        bandId = window.albumsCore.getCurrentBandId();
    }
    
    if (!bandId) {
        console.error('❌ [albums-form] No se pudo obtener bandId');
        window.albumsCore.showToast('Error: No se pudo identificar la banda', 'error');
        return;
    }
    
    console.log('✅ [albums-form] BandId confirmado:', bandId);
    
    // Guardar en STATE
    window.STATE.currentBandId = bandId;
    console.log('💾 [albums-form] BandId guardado en STATE');
    
    // Buscar banda
    const band = window.albumsCore.findBandById(bandId);
    if (!band) {
        console.error('❌ [albums-form] Banda no encontrada');
        window.albumsCore.showToast('Error: Banda no encontrada', 'error');
        return;
    }
    
    console.log('✅ [albums-form] Banda encontrada:', band.name);
    
    // Limpiar tracks temporales
    window.currentTracks = [];
    console.log('🧹 [albums-form] Tracks temporales limpiados');
    
    // Remover formulario existente
    const existingForm = document.querySelector('.album-form');
    if (existingForm) {
        console.log('🗑️ [albums-form] Removiendo formulario existente');
        existingForm.remove();
    }
    
    // Crear formulario
    console.log('🏗️ [albums-form] Creando formulario...');
    const form = createAlbumFormHTML(bandId, band.name);
    
    // Insertar formulario
    const albumsList = document.getElementById('albums-list');
    if (!albumsList) {
        console.error('❌ [albums-form] No se encontró albums-list');
        return;
    }
    
    albumsList.insertBefore(form, albumsList.firstChild);
    console.log('✅ [albums-form] Formulario insertado en el DOM');
    
    // Configurar eventos
    setupFormEvents();
    console.log('✅ [albums-form] Eventos configurados');
}

// ============================================
// CREAR HTML DEL FORMULARIO
// ============================================

function createAlbumFormHTML(bandId, bandName) {
    console.log('🏗️ [albums-form] Creando HTML del formulario');
    console.log('📊 [albums-form] Parámetros:', { bandId, bandName });
    
    const form = document.createElement('div');
    form.className = 'album-form panel';
    form.setAttribute('data-band-id', bandId);
    
    form.innerHTML = `
        <div class="album-form-header">
            <h3>Nuevo álbum</h3>
            <p class="band-info">Banda: ${bandName}</p>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="album-title">Título del álbum</label>
                <input type="text" 
                       id="album-title" 
                       required 
                       placeholder="Ej: Greatest Hits"
                       autocomplete="off">
            </div>
            <div class="form-group">
                <label for="album-year">Año</label>
                <input type="number" 
                       id="album-year" 
                       required 
                       min="1900" 
                       max="2025" 
                       value="${new Date().getFullYear()}">
            </div>
        </div>

        <div class="songs-section">
            <h4>🎵 Agregar canciones desde YouTube</h4>
            
            <div class="url-input-group">
                <div class="input-with-icon">
                    <i class="yt-icon">▶️</i>
                    <input type="text" 
                           id="song-url" 
                           placeholder="https://youtube.com/watch?v=..."
                           autocomplete="off">
                </div>
                <button type="button" 
                        class="btn btn-add-song" 
                        id="add-song">
                    Agregar
                </button>
            </div>

            <div id="song-list" class="song-list">
                <div class="status-message">
                    <i class="music-icon">🎵</i>
                    <p>No hay canciones agregadas</p>
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button type="button" 
                    class="btn btn-cancel" 
                    onclick="cancelAlbumForm()">
                Cancelar
            </button>
            <button type="button" 
                    class="btn btn-save" 
                    onclick="saveAlbum('${bandId}')">
                Guardar álbum
            </button>
        </div>
    `;
    
    console.log('✅ [albums-form] HTML del formulario creado');
    return form;
}

// ============================================
// CONFIGURAR EVENTOS DEL FORMULARIO
// ============================================

function setupFormEvents() {
    console.log('⚙️ [albums-form] Configurando eventos del formulario...');
    
    const urlInput = document.getElementById('song-url');
    const addButton = document.getElementById('add-song');
    
    if (!urlInput || !addButton) {
        console.error('❌ [albums-form] Elementos del formulario no encontrados');
        return;
    }
    
    console.log('✅ [albums-form] Elementos encontrados');
    
    // Evento click del botón
    addButton.onclick = () => {
        console.log('🖱️ [albums-form] Click en botón Agregar');
        const url = urlInput.value.trim();
        console.log('📊 [albums-form] URL ingresada:', url);
        addSongToForm(url);
    };
    
    // Evento Enter en el input
    urlInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            console.log('⌨️ [albums-form] Enter presionado en input');
            e.preventDefault();
            const url = urlInput.value.trim();
            console.log('📊 [albums-form] URL ingresada:', url);
            addSongToForm(url);
        }
    };
    
    // Validación en tiempo real
    urlInput.oninput = () => {
        const url = urlInput.value.trim();
        if (url && !window.youtubeUtils.isValidYoutubeUrl(url)) {
            urlInput.style.borderColor = '#ff4444';
            console.log('⚠️ [albums-form] URL inválida en tiempo real');
        } else {
            urlInput.style.borderColor = url ? '#4CAF50' : '';
        }
    };
    
    console.log('✅ [albums-form] Eventos configurados correctamente');
}

// ============================================
// AGREGAR CANCIÓN AL FORMULARIO
// ============================================

function addSongToForm(url) {
    console.log('🎵 [albums-form] addSongToForm llamado');
    console.log('📊 [albums-form] URL:', url);
    
    if (!url) {
        console.warn('⚠️ [albums-form] URL vacía');
        window.albumsCore.showToast('⚠️ Ingresa una URL de YouTube', 'warning');
        return;
    }
    
    // Validar URL
    if (!window.youtubeUtils.isValidYoutubeUrl(url)) {
        console.error('❌ [albums-form] URL inválida');
        window.albumsCore.showToast('⚠️ URL de YouTube inválida', 'error');
        return;
    }
    
    console.log('✅ [albums-form] URL válida');
    
    // Extraer videoId
    const videoId = window.youtubeUtils.getYoutubeVideoId(url);
    if (!videoId) {
        console.error('❌ [albums-form] No se pudo extraer videoId');
        window.albumsCore.showToast('⚠️ No se pudo obtener el ID del video', 'error');
        return;
    }
    
    console.log('✅ [albums-form] VideoId extraído:', videoId);
    
    // Verificar duplicados
    if (window.currentTracks.some(t => t.videoId === videoId)) {
        console.warn('⚠️ [albums-form] Video duplicado');
        window.albumsCore.showToast('⚠️ Esta canción ya fue agregada', 'warning');
        return;
    }
    
    // Crear track
    const track = {
        url: url,
        videoId: videoId,
        title: `Canción ${window.currentTracks.length + 1}`,
        duration: 180
    };
    
    console.log('📊 [albums-form] Track creado:', track);
    
    // Agregar a lista temporal
    window.currentTracks.push(track);
    console.log(`✅ [albums-form] Track agregado. Total: ${window.currentTracks.length}`);
    
    // Actualizar UI
    renderCurrentSongs();
    
    // Limpiar input
    const input = document.getElementById('song-url');
    if (input) {
        input.value = '';
        input.style.borderColor = '';
    }
    
    window.albumsCore.showToast('✅ Canción agregada', 'success');
}

// ============================================
// RENDERIZAR CANCIONES ACTUALES
// ============================================

function renderCurrentSongs() {
    console.log('🎨 [albums-form] Renderizando canciones actuales...');
    console.log('📊 [albums-form] Total canciones:', window.currentTracks.length);
    
    const list = document.getElementById('song-list');
    if (!list) {
        console.error('❌ [albums-form] song-list no encontrado');
        return;
    }
    
    if (window.currentTracks.length === 0) {
        console.log('ℹ️ [albums-form] No hay canciones, mostrando mensaje');
        list.innerHTML = `
            <div class="status-message">
                <i class="music-icon">🎵</i>
                <p>No hay canciones agregadas</p>
            </div>
        `;
        return;
    }
    
    console.log('🏗️ [albums-form] Generando HTML de canciones...');
    list.innerHTML = window.currentTracks.map((track, index) => {
        console.log(`  - Canción ${index + 1}:`, track.title);
        return `
            <div class="song-item" data-index="${index}">
                <span class="title">🎵 ${track.title}</span>
                <small class="duration">
                    ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}
                </small>
                <button class="remove" 
                        onclick="removeSongFromForm(${index})"
                        title="Eliminar">
                    ❌
                </button>
            </div>
        `;
    }).join('');
    
    console.log('✅ [albums-form] Canciones renderizadas correctamente');
}

// ============================================
// REMOVER CANCIÓN DEL FORMULARIO
// ============================================

function removeSongFromForm(index) {
    console.log('🗑️ [albums-form] removeSongFromForm llamado');
    console.log('📊 [albums-form] Índice:', index);
    
    if (index < 0 || index >= window.currentTracks.length) {
        console.error('❌ [albums-form] Índice inválido');
        return;
    }
    
    const removedTrack = window.currentTracks[index];
    console.log('📊 [albums-form] Canción a remover:', removedTrack.title);
    
    window.currentTracks.splice(index, 1);
    console.log(`✅ [albums-form] Canción removida. Quedan: ${window.currentTracks.length}`);
    
    renderCurrentSongs();
    window.albumsCore.showToast('🗑️ Canción eliminada', 'info');
}

// ============================================
// CANCELAR FORMULARIO
// ============================================

function cancelAlbumForm() {
    console.log('❌ [albums-form] Cancelando formulario...');
    
    window.currentTracks = [];
    console.log('🧹 [albums-form] Tracks temporales limpiados');
    
    const form = document.querySelector('.album-form');
    if (form) {
        form.remove();
        console.log('✅ [albums-form] Formulario removido');
    }
    
    window.albumsCore.showToast('Formulario cancelado', 'info');
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.albumsForm = {
    show: showAlbumForm,
    addSong: addSongToForm,
    removeSong: removeSongFromForm,
    cancel: cancelAlbumForm,
    renderSongs: renderCurrentSongs
};

// Alias globales para onclick
window.showAlbumForm = showAlbumForm;
window.removeSongFromForm = removeSongFromForm;
window.cancelAlbumForm = cancelAlbumForm;

console.log('✅ [albums-form.js] Módulo de formularios cargado');
console.log('📦 [albums-form.js] Funciones disponibles:', Object.keys(window.albumsForm));