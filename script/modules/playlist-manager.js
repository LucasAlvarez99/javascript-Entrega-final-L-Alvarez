// ============================================
// PLAYLIST-MANAGER.JS - Gestión de playlist
// ============================================

console.log('📋 [playlist-manager.js] Iniciando módulo de playlist...');

// ============================================
// INICIALIZAR PLAYLIST
// ============================================

function initPlaylist() {
    console.log('🔧 [playlist-manager] Inicializando playlist...');
    
    if (!window.STATE.playlist) {
        console.log('📦 [playlist-manager] Creando array de playlist');
        window.STATE.playlist = [];
    }
    
    // Cargar playlist desde localStorage
    loadPlaylistFromStorage();
    
    console.log('✅ [playlist-manager] Playlist inicializada');
}

// ============================================
// CARGAR/GUARDAR PLAYLIST
// ============================================

function loadPlaylistFromStorage() {
    console.log('💾 [playlist-manager] Cargando playlist desde localStorage...');
    
    try {
        const savedPlaylist = localStorage.getItem('playlist');
        
        if (savedPlaylist) {
            const playlist = JSON.parse(savedPlaylist);
            console.log(`📀 [playlist-manager] ${playlist.length} canciones encontradas`);
            
            if (Array.isArray(playlist)) {
                window.STATE.playlist = playlist;
                console.log('✅ [playlist-manager] Playlist cargada');
            } else {
                console.warn('⚠️ [playlist-manager] Datos no son array');
                window.STATE.playlist = [];
            }
        } else {
            console.log('ℹ️ [playlist-manager] No hay playlist guardada');
            window.STATE.playlist = [];
        }
    } catch (error) {
        console.error('❌ [playlist-manager] Error al cargar:', error);
        window.STATE.playlist = [];
    }
}

function savePlaylistToStorage() {
    console.log('💾 [playlist-manager] Guardando playlist...');
    
    try {
        if (!Array.isArray(window.STATE.playlist)) {
            console.error('❌ [playlist-manager] Playlist no es array');
            return false;
        }
        
        const playlistJSON = JSON.stringify(window.STATE.playlist);
        localStorage.setItem('playlist', playlistJSON);
        
        console.log(`✅ [playlist-manager] ${window.STATE.playlist.length} canciones guardadas`);
        return true;
    } catch (error) {
        console.error('❌ [playlist-manager] Error al guardar:', error);
        return false;
    }
}

// ============================================
// AGREGAR CANCIÓN A PLAYLIST
// ============================================

function addToPlaylist(albumId, trackId) {
    console.log('➕ [playlist-manager] addToPlaylist llamado');
    console.log('📊 [playlist-manager] Album ID:', albumId);
    console.log('📊 [playlist-manager] Track ID:', trackId);
    
    // Validar estado
    if (!window.STATE.playlist) {
        console.warn('⚠️ [playlist-manager] Playlist no existe, inicializando...');
        window.STATE.playlist = [];
    }
    
    // Buscar álbum
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [playlist-manager] Álbum no encontrado');
        window.albumsCore.showToast('❌ Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [playlist-manager] Álbum encontrado:', album.title);
    
    // Buscar track
    const track = album.tracks.find(t => t.id === trackId);
    if (!track) {
        console.error('❌ [playlist-manager] Canción no encontrada');
        window.albumsCore.showToast('❌ Canción no encontrada', 'error');
        return;
    }
    
    console.log('✅ [playlist-manager] Canción encontrada:', track.title);
    
    // Verificar duplicados
    if (window.STATE.playlist.some(t => t.id === track.id)) {
        console.warn('⚠️ [playlist-manager] Canción ya está en playlist');
        window.albumsCore.showToast('⚠️ Esta canción ya está en la playlist', 'warning');
        return;
    }
    
    // Buscar banda para información adicional
    const band = window.albumsCore.findBandById(album.bandId);
    
    // Agregar a playlist
    const playlistItem = {
        id: track.id,
        albumId: albumId,
        title: track.title,
        artist: band ? band.name : 'Artista',
        album: album.title,
        youtubeId: track.youtubeId,
        url: track.url,
        duration: track.duration
    };
    
    window.STATE.playlist.push(playlistItem);
    console.log(`✅ [playlist-manager] Canción agregada. Total: ${window.STATE.playlist.length}`);
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Playlist guardada');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    window.albumsCore.showToast('✅ Canción agregada a la playlist', 'success');
}

// ============================================
// AGREGAR ÁLBUM COMPLETO A PLAYLIST
// ============================================

function agregarAlbumAPlaylist(albumId) {
    console.log('➕ [playlist-manager] agregarAlbumAPlaylist llamado');
    console.log('📊 [playlist-manager] Album ID:', albumId);
    
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [playlist-manager] Álbum no encontrado');
        window.albumsCore.showToast('❌ Álbum no encontrado', 'error');
        return;
    }
    
    console.log('✅ [playlist-manager] Álbum encontrado:', album.title);
    console.log('📊 [playlist-manager] Canciones:', album.tracks.length);
    
    let addedCount = 0;
    let duplicateCount = 0;
    
    // Agregar cada canción
    album.tracks.forEach((track, index) => {
        console.log(`  🎵 Procesando track ${index + 1}:`, track.title);
        
        // Verificar duplicados
        if (window.STATE.playlist.some(t => t.id === track.id)) {
            console.log('    ⚠️ Ya está en playlist');
            duplicateCount++;
            return;
        }
        
        // Buscar banda
        const band = window.albumsCore.findBandById(album.bandId);
        
        // Agregar a playlist
        const playlistItem = {
            id: track.id,
            albumId: albumId,
            title: track.title,
            artist: band ? band.name : 'Artista',
            album: album.title,
            youtubeId: track.youtubeId,
            url: track.url,
            duration: track.duration
        };
        
        window.STATE.playlist.push(playlistItem);
        addedCount++;
        console.log('    ✅ Agregada');
    });
    
    console.log(`📊 [playlist-manager] Agregadas: ${addedCount}, Duplicadas: ${duplicateCount}`);
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Playlist guardada');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    if (addedCount > 0) {
        window.albumsCore.showToast(
            `✅ ${addedCount} canciones agregadas${duplicateCount > 0 ? ` (${duplicateCount} ya estaban)` : ''}`, 
            'success'
        );
    } else {
        window.albumsCore.showToast('ℹ️ Todas las canciones ya estaban en la playlist', 'info');
    }
}

// ============================================
// ELIMINAR CANCIÓN DE PLAYLIST
// ============================================

function removeFromPlaylist(trackId) {
    console.log('🗑️ [playlist-manager] removeFromPlaylist llamado');
    console.log('📊 [playlist-manager] Track ID:', trackId);
    
    if (!window.STATE.playlist) {
        console.error('❌ [playlist-manager] Playlist no existe');
        return;
    }
    
    const initialLength = window.STATE.playlist.length;
    const index = window.STATE.playlist.findIndex(t => t.id === trackId);
    
    if (index === -1) {
        console.warn('⚠️ [playlist-manager] Canción no encontrada en playlist');
        window.albumsCore.showToast('⚠️ Canción no encontrada', 'warning');
        return;
    }
    
    const removedTrack = window.STATE.playlist[index];
    console.log('📊 [playlist-manager] Canción a remover:', removedTrack.title);
    
    window.STATE.playlist.splice(index, 1);
    console.log(`✅ [playlist-manager] Canción removida. Quedan: ${window.STATE.playlist.length}`);
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Playlist actualizada');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    window.albumsCore.showToast('🗑️ Canción eliminada de la playlist', 'info');
}

// ============================================
// VACIAR PLAYLIST
// ============================================

function clearPlaylist() {
    console.log('🧹 [playlist-manager] clearPlaylist llamado');
    
    if (!window.STATE.playlist || window.STATE.playlist.length === 0) {
        console.log('ℹ️ [playlist-manager] Playlist ya está vacía');
        window.albumsCore.showToast('ℹ️ La playlist ya está vacía', 'info');
        return;
    }
    
    const count = window.STATE.playlist.length;
    console.log(`📊 [playlist-manager] ${count} canciones a eliminar`);
    
    // Confirmar
    const confirmed = confirm(`¿Estás seguro de vaciar la playlist? (${count} canciones)`);
    if (!confirmed) {
        console.log('❌ [playlist-manager] Operación cancelada');
        return;
    }
    
    window.STATE.playlist = [];
    console.log('✅ [playlist-manager] Playlist vaciada');
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Cambios guardados');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    window.albumsCore.showToast(`🗑️ ${count} canciones eliminadas`, 'info');
}

// ============================================
// REPRODUCIR PLAYLIST
// ============================================

function playPlaylist() {
    console.log('▶️ [playlist-manager] playPlaylist llamado');
    
    if (!window.STATE.playlist || window.STATE.playlist.length === 0) {
        console.warn('⚠️ [playlist-manager] Playlist vacía');
        window.albumsCore.showToast('⚠️ La playlist está vacía', 'warning');
        return;
    }
    
    console.log('📊 [playlist-manager] Canciones en playlist:', window.STATE.playlist.length);
    
    // Reproducir primera canción
    const firstTrack = window.STATE.playlist[0];
    console.log('▶️ [playlist-manager] Reproduciendo primera canción:', firstTrack.title);
    
    window.playerAudio.play(firstTrack.albumId, firstTrack.id);
}

// ============================================
// ORDENAR PLAYLIST
// ============================================

function sortPlaylist(criteria = 'title') {
    console.log('📊 [playlist-manager] sortPlaylist llamado');
    console.log('📊 [playlist-manager] Criterio:', criteria);
    
    if (!window.STATE.playlist || window.STATE.playlist.length === 0) {
        console.log('ℹ️ [playlist-manager] Playlist vacía, nada que ordenar');
        return;
    }
    
    const beforeSort = [...window.STATE.playlist];
    
    switch (criteria) {
        case 'title':
            window.STATE.playlist.sort((a, b) => a.title.localeCompare(b.title));
            console.log('✅ [playlist-manager] Ordenado por título');
            break;
            
        case 'artist':
            window.STATE.playlist.sort((a, b) => a.artist.localeCompare(b.artist));
            console.log('✅ [playlist-manager] Ordenado por artista');
            break;
            
        case 'album':
            window.STATE.playlist.sort((a, b) => a.album.localeCompare(b.album));
            console.log('✅ [playlist-manager] Ordenado por álbum');
            break;
            
        case 'duration':
            window.STATE.playlist.sort((a, b) => a.duration - b.duration);
            console.log('✅ [playlist-manager] Ordenado por duración');
            break;
            
        default:
            console.warn('⚠️ [playlist-manager] Criterio desconocido:', criteria);
            return;
    }
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Playlist guardada');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    window.albumsCore.showToast(`✅ Playlist ordenada por ${criteria}`, 'success');
}

// ============================================
// MEZCLAR PLAYLIST
// ============================================

function shufflePlaylist() {
    console.log('🔀 [playlist-manager] shufflePlaylist llamado');
    
    if (!window.STATE.playlist || window.STATE.playlist.length <= 1) {
        console.log('ℹ️ [playlist-manager] Playlist muy pequeña para mezclar');
        window.albumsCore.showToast('ℹ️ Agrega más canciones para mezclar', 'info');
        return;
    }
    
    console.log('📊 [playlist-manager] Canciones antes:', window.STATE.playlist.length);
    
    // Algoritmo Fisher-Yates para mezclar
    for (let i = window.STATE.playlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [window.STATE.playlist[i], window.STATE.playlist[j]] = 
        [window.STATE.playlist[j], window.STATE.playlist[i]];
    }
    
    console.log('✅ [playlist-manager] Playlist mezclada');
    
    // Guardar cambios
    const saved = savePlaylistToStorage();
    if (saved) {
        console.log('✅ [playlist-manager] Cambios guardados');
    }
    
    // Actualizar UI
    window.albumsRender.renderPlaylist();
    
    window.albumsCore.showToast('🔀 Playlist mezclada', 'success');
}

// ============================================
// EXPORTAR PLAYLIST (FUTURO)
// ============================================

function exportPlaylist() {
    console.log('💾 [playlist-manager] exportPlaylist llamado');
    
    if (!window.STATE.playlist || window.STATE.playlist.length === 0) {
        console.warn('⚠️ [playlist-manager] Playlist vacía');
        window.albumsCore.showToast('⚠️ La playlist está vacía', 'warning');
        return;
    }
    
    try {
        const playlistData = {
            name: 'Mi Playlist - La Disquera',
            created: new Date().toISOString(),
            tracks: window.STATE.playlist
        };
        
        const dataStr = JSON.stringify(playlistData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = `playlist-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        console.log('✅ [playlist-manager] Playlist exportada:', exportName);
        window.albumsCore.showToast('✅ Playlist exportada', 'success');
        
    } catch (error) {
        console.error('❌ [playlist-manager] Error al exportar:', error);
        window.albumsCore.showToast('❌ Error al exportar', 'error');
    }
}

// ============================================
// IMPORTAR PLAYLIST (FUTURO)
// ============================================

function importPlaylist(file) {
    console.log('📥 [playlist-manager] importPlaylist llamado');
    console.log('📊 [playlist-manager] Archivo:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            console.log('📊 [playlist-manager] Datos importados:', data);
            
            if (!data.tracks || !Array.isArray(data.tracks)) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Confirmar si hay canciones actuales
            if (window.STATE.playlist && window.STATE.playlist.length > 0) {
                const confirmed = confirm(
                    `¿Reemplazar la playlist actual (${window.STATE.playlist.length} canciones)?`
                );
                if (!confirmed) {
                    console.log('❌ [playlist-manager] Importación cancelada');
                    return;
                }
            }
            
            window.STATE.playlist = data.tracks;
            console.log(`✅ [playlist-manager] ${data.tracks.length} canciones importadas`);
            
            // Guardar cambios
            const saved = savePlaylistToStorage();
            if (saved) {
                console.log('✅ [playlist-manager] Playlist guardada');
            }
            
            // Actualizar UI
            window.albumsRender.renderPlaylist();
            
            window.albumsCore.showToast(
                `✅ ${data.tracks.length} canciones importadas`, 
                'success'
            );
            
        } catch (error) {
            console.error('❌ [playlist-manager] Error al importar:', error);
            window.albumsCore.showToast('❌ Error al importar: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        console.error('❌ [playlist-manager] Error al leer archivo');
        window.albumsCore.showToast('❌ Error al leer el archivo', 'error');
    };
    
    reader.readAsText(file);
}

// ============================================
// OBTENER ESTADÍSTICAS
// ============================================

function getPlaylistStats() {
    console.log('📊 [playlist-manager] getPlaylistStats llamado');
    
    if (!window.STATE.playlist || window.STATE.playlist.length === 0) {
        console.log('ℹ️ [playlist-manager] Playlist vacía');
        return {
            totalTracks: 0,
            totalDuration: 0,
            artists: [],
            albums: []
        };
    }
    
    const stats = {
        totalTracks: window.STATE.playlist.length,
        totalDuration: window.STATE.playlist.reduce((sum, t) => sum + (t.duration || 0), 0),
        artists: [...new Set(window.STATE.playlist.map(t => t.artist))],
        albums: [...new Set(window.STATE.playlist.map(t => t.album))]
    };
    
    console.log('📊 [playlist-manager] Estadísticas:', stats);
    
    return stats;
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.playlistManager = {
    init: initPlaylist,
    add: addToPlaylist,
    addAlbum: agregarAlbumAPlaylist,
    remove: removeFromPlaylist,
    clear: clearPlaylist,
    play: playPlaylist,
    sort: sortPlaylist,
    shuffle: shufflePlaylist,
    export: exportPlaylist,
    import: importPlaylist,
    stats: getPlaylistStats,
    save: savePlaylistToStorage,
    load: loadPlaylistFromStorage
};

// Alias globales para onclick
window.addToPlaylist = addToPlaylist;
window.agregarAlbumAPlaylist = agregarAlbumAPlaylist;
window.removeFromPlaylist = removeFromPlaylist;
window.clearPlaylist = clearPlaylist;
window.playPlaylist = playPlaylist;
window.shufflePlaylist = shufflePlaylist;

console.log('✅ [playlist-manager.js] Módulo de playlist cargado');
console.log('📦 [playlist-manager.js] Funciones disponibles:', Object.keys(window.playlistManager));