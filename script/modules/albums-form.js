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
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
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
    form.className = 'album-form card';
    form.setAttribute('data-band-id', bandId);
    form.style.cssText = `
        background: linear-gradient(135deg, rgba(255,167,38,0.1) 0%, rgba(255,167,38,0.05) 100%);
        border: 2px solid var(--accent);
        padding: 24px;
        margin-bottom: 20px;
    `;
    
    form.innerHTML = `
        <div class="album-form-header" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid var(--accent);">
            <h3 style="color: var(--accent); margin: 0 0 8px 0;">➕ Nuevo álbum</h3>
            <p class="band-info" style="margin: 0; color: #9aa4b2;">Banda: <strong style="color: #fff;">${bandName}</strong></p>
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div class="form-group">
                <label for="album-title" style="display: block; margin-bottom: 8px; color: var(--accent); font-weight: 500;">
                    Título del álbum *
                </label>
                <input type="text" 
                       id="album-title" 
                       required 
                       placeholder="Ej: Greatest Hits"
                       autocomplete="off"
                       style="width: 100%; padding: 12px; border-radius: 8px; background: var(--card); border: 1px solid var(--border); color: #fff;">
            </div>
            <div class="form-group">
                <label for="album-year" style="display: block; margin-bottom: 8px; color: var(--accent); font-weight: 500;">
                    Año *
                </label>
                <input type="number" 
                       id="album-year" 
                       required 
                       min="1900" 
                       max="2025" 
                       value="${new Date().getFullYear()}"
                       style="width: 100%; padding: 12px; border-radius: 8px; background: var(--card); border: 1px solid var(--border); color: #fff;">
            </div>
        </div>

        <div class="songs-section" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">
            <h4 style="color: #fff; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
                🎵 Canciones desde YouTube
            </h4>
            <p style="color: #9aa4b2; font-size: 0.9rem; margin: 0 0 16px 0;">
                Solo se extraerá el audio del video
            </p>
            
            <div class="url-input-group" style="display: flex; gap: 12px; margin-bottom: 20px;">
                <input type="text" 
                       id="song-url" 
                       placeholder="https://youtube.com/watch?v=..."
                       autocomplete="off"
                       style="flex: 1; padding: 12px; border-radius: 8px; background: var(--card); border: 1px solid var(--border); color: #fff;">
                <button type="button" 
                        class="btn btn-add-song" 
                        id="add-song"
                        style="padding: 12px 24px; background: var(--accent); color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Agregar
                </button>
            </div>

            <div id="song-list" class="song-list" style="min-height: 100px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 16px;">
                <div class="status-message" style="text-align: center; color: #666; padding: 20px;">
                    🎵 No hay canciones agregadas
                </div>
            </div>
        </div>

        <div class="form-actions" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" 
                    class="btn btn-cancel" 
                    onclick="cancelAlbumForm()"
                    style="padding: 12px 24px; background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                Cancelar
            </button>
            <button type="button" 
                    class="btn btn-save" 
                    onclick="saveAlbum('${bandId}')"
                    style="padding: 12px 24px; background: var(--accent); color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
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
            <div class="status-message" style="text-align: center; color: #666; padding: 20px;">
                🎵 No hay canciones agregadas
            </div>
        `;
        return;
    }
    
    console.log('🏗️ [albums-form] Generando HTML de canciones...');
    list.innerHTML = window.currentTracks.map((track, index) => {
        console.log(`  - Canción ${index + 1}:`, track.title);
        return `
            <div class="song-item" data-index="${index}" style="
                background: rgba(255,167,38,0.1);
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 4px solid var(--accent);
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.2rem;">🎵</span>
                    <div>
                        <div style="color: #fff; font-weight: 500;">${track.title}</div>
                        <small style="color: #9aa4b2;">Solo audio · ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}</small>
                    </div>
                </div>
                <button onclick="removeSongFromForm(${index})"
                        title="Eliminar"
                        style="
                            background: rgba(244,67,54,0.2);
                            color: #f44336;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                    ❌ Eliminar
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