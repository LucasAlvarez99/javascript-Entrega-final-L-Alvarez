// ============================================
// ALBUMS-CORE.JS - Funciones principales
// ============================================

console.log('📦 [albums-core.js] Iniciando módulo core...');

// ============================================
// INICIALIZACIÓN Y ESTADO
// ============================================

function initAlbumsModule() {
    console.log('🔧 [albums-core] Inicializando módulo de álbumes');
    
    // Asegurar que STATE existe
    if (!window.STATE) {
        console.warn('⚠️ [albums-core] STATE no existe, creándolo...');
        window.STATE = {
            bands: [],
            albums: [],
            genres: new Set(),
            playlist: [],
            currentBandId: null,
            currentAlbumId: null,
            currentTrack: null,
            isPlaying: false,
            isPaused: false,
            youtubePlayer: null
        };
        console.log('✅ [albums-core] STATE creado:', window.STATE);
    }

    // Cargar álbumes desde localStorage
    loadAlbumsFromStorage();
    
    console.log('✅ [albums-core] Módulo inicializado correctamente');
}

// Cargar álbumes guardados
function loadAlbumsFromStorage() {
    console.log('💾 [albums-core] Cargando álbumes desde localStorage...');
    
    try {
        const savedAlbums = localStorage.getItem('albums');
        
        if (savedAlbums) {
            const albums = JSON.parse(savedAlbums);
            console.log(`📀 [albums-core] ${albums.length} álbumes encontrados en storage`);
            
            if (Array.isArray(albums)) {
                window.STATE.albums = albums;
                console.log('✅ [albums-core] Álbumes cargados:', albums);
            } else {
                console.warn('⚠️ [albums-core] Datos de álbumes no son array');
                window.STATE.albums = [];
            }
        } else {
            console.log('ℹ️ [albums-core] No hay álbumes guardados');
            window.STATE.albums = window.STATE.albums || [];
        }
    } catch (error) {
        console.error('❌ [albums-core] Error al cargar álbumes:', error);
        window.STATE.albums = [];
    }
}

// Guardar álbumes en localStorage
function saveAlbumsToStorage() {
    console.log('💾 [albums-core] Guardando álbumes en localStorage...');
    
    try {
        if (!Array.isArray(window.STATE.albums)) {
            console.error('❌ [albums-core] STATE.albums no es un array');
            return false;
        }
        
        const albumsJSON = JSON.stringify(window.STATE.albums);
        localStorage.setItem('albums', albumsJSON);
        
        console.log(`✅ [albums-core] ${window.STATE.albums.length} álbumes guardados`);
        return true;
    } catch (error) {
        console.error('❌ [albums-core] Error al guardar álbumes:', error);
        return false;
    }
}

// ============================================
// UTILIDADES
// ============================================

function getCurrentBandId() {
    console.log('🔍 [albums-core] Buscando bandId actual...');
    
    const fromForm = document.querySelector('.album-form')?.dataset.bandId;
    const fromState = window.STATE?.currentBandId;
    const fromURL = new URLSearchParams(window.location.search).get('bandId');
    
    console.log('📊 [albums-core] Fuentes de bandId:', {
        fromForm,
        fromState,
        fromURL
    });
    
    const bandId = fromForm || fromState || fromURL;
    console.log(`${bandId ? '✅' : '❌'} [albums-core] BandId encontrado:`, bandId);
    
    return bandId;
}

function validateAlbumData(title, year, tracks) {
    console.log('🔍 [albums-core] Validando datos del álbum...');
    console.log('📊 [albums-core] Datos recibidos:', { title, year, tracksCount: tracks?.length });
    
    const errors = [];
    
    if (!title || title.trim() === '') {
        console.warn('⚠️ [albums-core] Título vacío');
        errors.push('El título es obligatorio');
    }
    
    if (!year || year < 1900 || year > 2025) {
        console.warn('⚠️ [albums-core] Año inválido:', year);
        errors.push('El año debe estar entre 1900 y 2025');
    }
    
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        console.warn('⚠️ [albums-core] Sin canciones');
        errors.push('Debes agregar al menos una canción');
    }
    
    if (errors.length > 0) {
        console.error('❌ [albums-core] Validación fallida:', errors);
        return { valid: false, errors };
    }
    
    console.log('✅ [albums-core] Validación exitosa');
    return { valid: true, errors: [] };
}

function generateAlbumId() {
    const id = 'a' + Date.now();
    console.log('🆔 [albums-core] ID generado:', id);
    return id;
}

function generateTrackId(index) {
    const id = `t${Date.now()}_${index}`;
    console.log('🆔 [albums-core] Track ID generado:', id);
    return id;
}

// ============================================
// BUSCAR Y FILTRAR
// ============================================

function findAlbumById(albumId) {
    console.log('🔍 [albums-core] Buscando álbum:', albumId);
    
    if (!window.STATE?.albums) {
        console.error('❌ [albums-core] No hay álbumes en STATE');
        return null;
    }
    
    const album = window.STATE.albums.find(a => a.id === albumId);
    
    if (album) {
        console.log('✅ [albums-core] Álbum encontrado:', album.title);
    } else {
        console.warn('⚠️ [albums-core] Álbum no encontrado');
    }
    
    return album;
}

function findBandById(bandId) {
    console.log('🔍 [albums-core] Buscando banda:', bandId);
    
    if (!window.STATE?.bands) {
        console.error('❌ [albums-core] No hay bandas en STATE');
        return null;
    }
    
    const band = window.STATE.bands.find(b => b.id === bandId);
    
    if (band) {
        console.log('✅ [albums-core] Banda encontrada:', band.name);
    } else {
        console.warn('⚠️ [albums-core] Banda no encontrada');
    }
    
    return band;
}

function getAlbumsByBandId(bandId) {
    console.log('🔍 [albums-core] Obteniendo álbumes de banda:', bandId);
    
    if (!window.STATE?.albums) {
        console.error('❌ [albums-core] No hay álbumes en STATE');
        return [];
    }
    
    const albums = window.STATE.albums.filter(a => a.bandId === bandId);
    console.log(`✅ [albums-core] ${albums.length} álbumes encontrados`);
    
    return albums;
}

// ============================================
// CREAR TOAST CONTAINER
// ============================================

function createToastContainer() {
    console.log('🍞 [albums-core] Verificando toast container...');
    
    let container = document.getElementById('toast-container');
    
    if (!container) {
        console.log('📦 [albums-core] Creando toast container...');
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        console.log('✅ [albums-core] Toast container creado');
    }
    
    return container;
}

// ============================================
// MOSTRAR NOTIFICACIONES
// ============================================

function showToast(message, type = 'success') {
    console.log(`🍞 [albums-core] Mostrando toast [${type}]:`, message);
    
    const container = createToastContainer();
    const toast = document.createElement('div');
    
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Estilos según tipo
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    toast.style.background = colors[type] || colors.success;
    
    container.appendChild(toast);
    console.log('✅ [albums-core] Toast agregado al DOM');
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.remove();
        console.log('🗑️ [albums-core] Toast removido');
    }, 3000);
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.albumsCore = {
    init: initAlbumsModule,
    loadAlbumsFromStorage,
    saveAlbumsToStorage,
    getCurrentBandId,
    validateAlbumData,
    generateAlbumId,
    generateTrackId,
    findAlbumById,
    findBandById,
    getAlbumsByBandId,
    showToast
};

console.log('✅ [albums-core.js] Módulo core cargado y exportado');
console.log('📦 [albums-core.js] Funciones disponibles:', Object.keys(window.albumsCore));