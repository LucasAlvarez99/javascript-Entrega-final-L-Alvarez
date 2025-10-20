// ============================================
// ALBUMS-SAVE.JS - Guardar álbumes
// ============================================

console.log('💾 [albums-save.js] Iniciando módulo de guardado...');

// ============================================
// GUARDAR ÁLBUM
// ============================================

function saveAlbum(bandId) {
    console.log('💾 [albums-save] saveAlbum llamado');
    console.log('📊 [albums-save] BandId recibido:', bandId);
    
    // Obtener bandId actual si no se proporciona
    if (!bandId) {
        console.warn('⚠️ [albums-save] No se proporcionó bandId, buscando...');
        bandId = window.albumsCore.getCurrentBandId();
    }
    
    if (!bandId) {
        console.error('❌ [albums-save] No se pudo obtener bandId');
        window.albumsCore.showToast('Error: No se pudo identificar la banda', 'error');
        return;
    }
    
    console.log('✅ [albums-save] BandId confirmado:', bandId);
    
    // Obtener datos del formulario
    console.log('📝 [albums-save] Obteniendo datos del formulario...');
    const titleInput = document.getElementById('album-title');
    const yearInput = document.getElementById('album-year');
    
    if (!titleInput || !yearInput) {
        console.error('❌ [albums-save] Elementos del formulario no encontrados');
        window.albumsCore.showToast('Error: Formulario no válido', 'error');
        return;
    }
    
    const title = titleInput.value.trim();
    const year = parseInt(yearInput.value);
    
    console.log('📊 [albums-save] Datos del formulario:', { title, year });
    console.log('📊 [albums-save] Canciones agregadas:', window.currentTracks.length);
    
    // Validar datos
    const validation = window.albumsCore.validateAlbumData(title, year, window.currentTracks);
    
    if (!validation.valid) {
        console.error('❌ [albums-save] Validación fallida:', validation.errors);
        validation.errors.forEach(error => {
            window.albumsCore.showToast(`⚠️ ${error}`, 'error');
        });
        return;
    }
    
    console.log('✅ [albums-save] Validación exitosa');
    
    // Crear objeto álbum
    console.log('🏗️ [albums-save] Creando objeto álbum...');
    const album = createAlbumObject(bandId, title, year, window.currentTracks);
    console.log('📊 [albums-save] Álbum creado:', album);
    
    // Guardar en STATE
    if (!Array.isArray(window.STATE.albums)) {
        console.warn('⚠️ [albums-save] STATE.albums no es array, inicializando...');
        window.STATE.albums = [];
    }
    
    window.STATE.albums.push(album);
    console.log(`✅ [albums-save] Álbum agregado a STATE. Total: ${window.STATE.albums.length}`);
    
    // Guardar en localStorage
    const saved = window.albumsCore.saveAlbumsToStorage();
    if (saved) {
        console.log('✅ [albums-save] Álbum guardado en localStorage');
    } else {
        console.error('❌ [albums-save] Error al guardar en localStorage');
    }
    
    // Limpiar y actualizar UI
    console.log('🧹 [albums-save] Limpiando formulario...');
    window.currentTracks = [];
    
    const form = document.querySelector('.album-form');
    if (form) {
        form.remove();
        console.log('✅ [albums-save] Formulario removido');
    }
    
    // Renderizar álbumes actualizados
    console.log('🎨 [albums-save] Renderizando álbumes...');
    window.albumsRender.renderAlbums(bandId);
    
    // Mostrar notificación de éxito
    window.albumsCore.showToast(`✅ Álbum "${title}" guardado exitosamente`, 'success');
    console.log('✅ [albums-save] Proceso completado exitosamente');
}

// ============================================
// CREAR OBJETO ÁLBUM
// ============================================

function createAlbumObject(bandId, title, year, tracks) {
    console.log('🏗️ [albums-save] Creando objeto álbum...');
    console.log('📊 [albums-save] Parámetros:', { bandId, title, year, tracksCount: tracks.length });
    
    const albumId = window.albumsCore.generateAlbumId();
    console.log('🆔 [albums-save] Album ID:', albumId);
    
    const album = {
        id: albumId,
        bandId: bandId,
        title: title,
        year: year,
        cover: `https://picsum.photos/seed/album${albumId}/600/400`,
        tracks: tracks.map((track, index) => {
            const trackId = window.albumsCore.generateTrackId(index);
            console.log(`  🎵 Track ${index + 1}:`, { id: trackId, videoId: track.videoId });
            
            return {
                id: trackId,
                title: track.title || `Canción ${index + 1}`,
                duration: track.duration || 180,
                youtubeId: track.videoId,
                url: track.url
            };
        })
    };
    
    console.log('✅ [albums-save] Objeto álbum creado con éxito');
    console.log('📊 [albums-save] Detalles:', {
        id: album.id,
        title: album.title,
        year: album.year,
        tracksCount: album.tracks.length
    });
    
    return album;
}

// ============================================
// EDITAR ÁLBUM (FUTURO)
// ============================================

function editAlbum(albumId) {
    console.log('✏️ [albums-save] editAlbum llamado');
    console.log('📊 [albums-save] Album ID:', albumId);
    
    const album = window.albumsCore.findAlbumById(albumId);
    
    if (!album) {
        console.error('❌ [albums-save] Álbum no encontrado');
        window.albumsCore.showToast('Error: Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [albums-save] Álbum encontrado:', album.title);
    console.log('ℹ️ [albums-save] Función de edición en desarrollo...');
    
    // TODO: Implementar edición de álbum
    window.albumsCore.showToast('Función de edición en desarrollo', 'info');
}

// ============================================
// ELIMINAR ÁLBUM
// ============================================

function deleteAlbum(albumId) {
    console.log('🗑️ [albums-save] deleteAlbum llamado');
    console.log('📊 [albums-save] Album ID:', albumId);
    
    const album = window.albumsCore.findAlbumById(albumId);
    
    if (!album) {
        console.error('❌ [albums-save] Álbum no encontrado');
        window.albumsCore.showToast('Error: Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [albums-save] Álbum encontrado:', album.title);
    
    // Confirmar eliminación
    const confirmDelete = confirm(`¿Estás seguro de eliminar el álbum "${album.title}"?`);
    
    if (!confirmDelete) {
        console.log('❌ [albums-save] Eliminación cancelada por el usuario');
        return;
    }
    
    console.log('🗑️ [albums-save] Confirmado, eliminando...');
    
    // Filtrar álbumes
    const initialCount = window.STATE.albums.length;
    window.STATE.albums = window.STATE.albums.filter(a => a.id !== albumId);
    const finalCount = window.STATE.albums.length;
    
    console.log(`📊 [albums-save] Álbumes antes: ${initialCount}, después: ${finalCount}`);
    
    if (initialCount === finalCount) {
        console.error('❌ [albums-save] El álbum no fue eliminado');
        window.albumsCore.showToast('Error al eliminar el álbum', 'error');
        return;
    }
    
    // Guardar cambios
    const saved = window.albumsCore.saveAlbumsToStorage();
    if (saved) {
        console.log('✅ [albums-save] Cambios guardados en localStorage');
    }
    
    // Actualizar UI
    console.log('🎨 [albums-save] Actualizando interfaz...');
    window.albumsRender.renderAlbums(album.bandId);
    
    window.albumsCore.showToast(`🗑️ Álbum "${album.title}" eliminado`, 'info');
    console.log('✅ [albums-save] Álbum eliminado exitosamente');
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.albumsSave = {
    save: saveAlbum,
    edit: editAlbum,
    delete: deleteAlbum,
    createObject: createAlbumObject
};

// Alias globales para onclick
window.saveAlbum = saveAlbum;
window.editAlbum = editAlbum;
window.deleteAlbum = deleteAlbum;

console.log('✅ [albums-save.js] Módulo de guardado cargado');
console.log('📦 [albums-save.js] Funciones disponibles:', Object.keys(window.albumsSave));