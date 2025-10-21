// ============================================
// ALBUMS-SONGS-MANAGER.JS
// Gestión de canciones en álbumes existentes
// ============================================

console.log('🎵 [albums-songs-manager.js] Iniciando módulo...');

// Variable temporal para nuevas canciones
window.tempNewSongs = [];

// ============================================
// MOSTRAR MODAL PARA AGREGAR CANCIONES
// ============================================

function showAddSongsModal(albumId) {
    console.log('🎵 [songs-manager] showAddSongsModal llamado');
    console.log('📊 [songs-manager] Album ID:', albumId);
    
    // Buscar álbum
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [songs-manager] Álbum no encontrado');
        window.albumsCore.showToast('Error: Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [songs-manager] Álbum encontrado:', album.title);
    
    // Limpiar canciones temporales
    window.tempNewSongs = [];
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'add-songs-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid var(--accent);
            ">
                <div>
                    <h3 style="color: var(--accent); margin: 0 0 8px 0;">
                        🎵 Agregar canciones
                    </h3>
                    <p style="margin: 0; color: #9aa4b2; font-size: 0.9rem;">
                        Álbum: <strong style="color: #fff;">${album.title}</strong>
                    </p>
                </div>
                <button class="close-btn" onclick="closeAddSongsModal()" style="
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s;
                ">×</button>
            </div>
            
            <div class="modal-body">
                <div style="
                    background: rgba(33,150,243,0.1);
                    border-left: 4px solid #2196f3;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    <p style="margin: 0 0 8px 0; color: #fff; font-weight: 500;">
                        📹 Solo se usará el audio
                    </p>
                    <small style="color: #9aa4b2;">
                        Pega el enlace de YouTube de cada canción. El video no se mostrará.
                    </small>
                </div>
                
                <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <input type="text" 
                           id="new-song-url" 
                           placeholder="https://youtube.com/watch?v=..."
                           autocomplete="off"
                           style="
                               flex: 1;
                               padding: 12px;
                               border-radius: 8px;
                               background: var(--card);
                               border: 1px solid var(--border);
                               color: #fff;
                           ">
                    <button onclick="addNewSongToList()" style="
                        padding: 12px 24px;
                        background: var(--accent);
                        color: #000;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Agregar
                    </button>
                </div>
                
                <div id="new-songs-list" style="
                    max-height: 300px;
                    overflow-y: auto;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    padding: 16px;
                    min-height: 100px;
                ">
                    <div class="empty-state" style="
                        text-align: center;
                        color: #666;
                        padding: 20px;
                    ">
                        🎵 No hay canciones agregadas
                    </div>
                </div>
            </div>
            
            <div class="modal-actions" style="
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            ">
                <button onclick="closeAddSongsModal()" style="
                    padding: 12px 24px;
                    background: transparent;
                    color: var(--muted);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                ">
                    Cancelar
                </button>
                <button onclick="saveNewSongs('${albumId}')" style="
                    padding: 12px 24px;
                    background: var(--accent);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Guardar canciones
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ [songs-manager] Modal creado');
    
    // Focus en input
    setTimeout(() => {
        document.getElementById('new-song-url')?.focus();
    }, 100);
}

// ============================================
// AGREGAR CANCIÓN A LA LISTA TEMPORAL
// ============================================

function addNewSongToList() {
    console.log('➕ [songs-manager] addNewSongToList llamado');
    
    const input = document.getElementById('new-song-url');
    if (!input) {
        console.error('❌ [songs-manager] Input no encontrado');
        return;
    }
    
    const url = input.value.trim();
    console.log('📊 [songs-manager] URL:', url);
    
    if (!url) {
        window.albumsCore.showToast('⚠️ Ingresa una URL de YouTube', 'warning');
        return;
    }
    
    // Validar URL
    if (!window.youtubeUtils.isValidYoutubeUrl(url)) {
        console.error('❌ [songs-manager] URL inválida');
        window.albumsCore.showToast('⚠️ URL de YouTube inválida', 'error');
        input.style.borderColor = '#f44336';
        setTimeout(() => input.style.borderColor = '', 300);
        return;
    }
    
    console.log('✅ [songs-manager] URL válida');
    
    // Extraer videoId
    const videoId = window.youtubeUtils.getYoutubeVideoId(url);
    if (!videoId) {
        console.error('❌ [songs-manager] No se pudo extraer videoId');
        window.albumsCore.showToast('⚠️ No se pudo obtener el ID del video', 'error');
        return;
    }
    
    console.log('✅ [songs-manager] VideoId:', videoId);
    
    // Verificar duplicados
    if (window.tempNewSongs.some(s => s.videoId === videoId)) {
        console.warn('⚠️ [songs-manager] Video duplicado');
        window.albumsCore.showToast('⚠️ Esta canción ya fue agregada', 'warning');
        return;
    }
    
    // Agregar a lista temporal
    const song = {
        url: url,
        videoId: videoId,
        title: `Canción ${window.tempNewSongs.length + 1}`,
        duration: 180
    };
    
    window.tempNewSongs.push(song);
    console.log(`✅ [songs-manager] Canción agregada. Total: ${window.tempNewSongs.length}`);
    
    // Limpiar input
    input.value = '';
    input.style.borderColor = '';
    
    // Renderizar lista
    renderNewSongsList();
    
    window.albumsCore.showToast('✅ Canción agregada', 'success');
}

// ============================================
// RENDERIZAR LISTA DE NUEVAS CANCIONES
// ============================================

function renderNewSongsList() {
    console.log('🎨 [songs-manager] Renderizando lista de canciones...');
    console.log('📊 [songs-manager] Total:', window.tempNewSongs.length);
    
    const list = document.getElementById('new-songs-list');
    if (!list) {
        console.error('❌ [songs-manager] Lista no encontrada');
        return;
    }
    
    if (window.tempNewSongs.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="
                text-align: center;
                color: #666;
                padding: 20px;
            ">
                🎵 No hay canciones agregadas
            </div>
        `;
        return;
    }
    
    list.innerHTML = window.tempNewSongs.map((song, index) => `
        <div style="
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
                    <div style="color: #fff; font-weight: 500;">
                        ${song.title}
                    </div>
                    <small style="color: #9aa4b2;">
                        Solo audio · ${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}
                    </small>
                </div>
            </div>
            <button onclick="removeNewSong(${index})" style="
                background: rgba(244,67,54,0.2);
                color: #f44336;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">
                ❌
            </button>
        </div>
    `).join('');
    
    console.log('✅ [songs-manager] Lista renderizada');
}

// ============================================
// REMOVER CANCIÓN DE LA LISTA
// ============================================

function removeNewSong(index) {
    console.log('🗑️ [songs-manager] Removiendo canción:', index);
    
    if (index < 0 || index >= window.tempNewSongs.length) {
        console.error('❌ [songs-manager] Índice inválido');
        return;
    }
    
    window.tempNewSongs.splice(index, 1);
    console.log(`✅ [songs-manager] Removida. Quedan: ${window.tempNewSongs.length}`);
    
    renderNewSongsList();
    window.albumsCore.showToast('🗑️ Canción eliminada', 'info');
}

// ============================================
// GUARDAR NUEVAS CANCIONES EN EL ÁLBUM
// ============================================

function saveNewSongs(albumId) {
    console.log('💾 [songs-manager] saveNewSongs llamado');
    console.log('📊 [songs-manager] Album ID:', albumId);
    console.log('📊 [songs-manager] Canciones a agregar:', window.tempNewSongs.length);
    
    if (window.tempNewSongs.length === 0) {
        window.albumsCore.showToast('⚠️ Agrega al menos una canción', 'warning');
        return;
    }
    
    // Buscar álbum
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [songs-manager] Álbum no encontrado');
        window.albumsCore.showToast('Error: Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [songs-manager] Álbum encontrado:', album.title);
    console.log('📊 [songs-manager] Canciones actuales:', album.tracks.length);
    
    // Agregar nuevas canciones
    const newTracks = window.tempNewSongs.map((song, index) => {
        const trackId = window.albumsCore.generateTrackId(album.tracks.length + index);
        console.log(`  🎵 Nueva track ${index + 1}:`, trackId);
        
        return {
            id: trackId,
            title: song.title,
            duration: song.duration,
            youtubeId: song.videoId,
            url: song.url
        };
    });
    
    // Agregar al álbum
    album.tracks = [...album.tracks, ...newTracks];
    console.log('✅ [songs-manager] Canciones agregadas al álbum');
    console.log('📊 [songs-manager] Total canciones ahora:', album.tracks.length);
    
    // Guardar en localStorage
    const saved = window.albumsCore.saveAlbumsToStorage();
    if (saved) {
        console.log('✅ [songs-manager] Cambios guardados en localStorage');
    }
    
    // Cerrar modal
    closeAddSongsModal();
    
    // Actualizar UI
    console.log('🎨 [songs-manager] Actualizando interfaz...');
    
    // Si estamos viendo las canciones, actualizar
    const currentAlbumId = window.STATE?.currentAlbumId;
    if (currentAlbumId === albumId) {
        window.albumsRender.renderSongs(albumId);
    }
    
    // Actualizar lista de álbumes
    window.albumsRender.renderAlbums(album.bandId);
    
    window.albumsCore.showToast(`✅ ${newTracks.length} canciones agregadas a "${album.title}"`, 'success');
    console.log('✅ [songs-manager] Proceso completado');
}

// ============================================
// CERRAR MODAL
// ============================================

function closeAddSongsModal() {
    console.log('❌ [songs-manager] Cerrando modal...');
    
    const modal = document.getElementById('add-songs-modal');
    if (modal) {
        modal.remove();
        console.log('✅ [songs-manager] Modal removido');
    }
    
    window.tempNewSongs = [];
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.albumsSongsManager = {
    showModal: showAddSongsModal,
    addSong: addNewSongToList,
    removeSong: removeNewSong,
    save: saveNewSongs,
    close: closeAddSongsModal
};

// Alias globales
window.showAddSongsModal = showAddSongsModal;
window.addNewSongToList = addNewSongToList;
window.removeNewSong = removeNewSong;
window.saveNewSongs = saveNewSongs;
window.closeAddSongsModal = closeAddSongsModal;

console.log('✅ [albums-songs-manager.js] Módulo cargado');
console.log('📦 [albums-songs-manager.js] Funciones:', Object.keys(window.albumsSongsManager));