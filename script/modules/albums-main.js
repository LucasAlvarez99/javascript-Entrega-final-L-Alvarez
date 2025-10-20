// ============================================
// ALBUMS-MAIN.JS - Inicialización principal
// ============================================

console.log('🚀 [albums-main.js] Iniciando aplicación...');
console.log('📅 [albums-main] Timestamp:', new Date().toISOString());

// ============================================
// VERIFICAR DEPENDENCIAS
// ============================================

function checkDependencies() {
    console.log('🔍 [albums-main] Verificando dependencias...');
    
    const required = [
        'albumsCore',
        'albumsForm',
        'albumsSave',
        'albumsRender',
        'youtubeUtils',
        'playerAudio',
        'playlistManager'
    ];
    
    const missing = required.filter(dep => !window[dep]);
    
    if (missing.length > 0) {
        console.error('❌ [albums-main] Dependencias faltantes:', missing);
        alert('Error: Faltan módulos. Recarga la página.');
        return false;
    }
    
    console.log('✅ [albums-main] Todas las dependencias cargadas');
    return true;
}

// ============================================
// INICIALIZAR APLICACIÓN
// ============================================

function initApp() {
    console.log('🔧 [albums-main] Inicializando aplicación...');
    
    try {
        // 1. Verificar dependencias
        if (!checkDependencies()) {
            console.error('❌ [albums-main] Falló verificación de dependencias');
            return;
        }
        
        // 2. Inicializar módulo core
        console.log('📦 [albums-main] Inicializando módulo core...');
        window.albumsCore.init();
        
        // 3. Inicializar playlist
        console.log('📋 [albums-main] Inicializando playlist...');
        window.playlistManager.init();
        
        // 4. Configurar eventos globales
        console.log('⚙️ [albums-main] Configurando eventos...');
        setupGlobalEvents();
        
        // 5. Renderizar contenido inicial
        console.log('🎨 [albums-main] Renderizando contenido...');
        renderInitialContent();
        
        console.log('✅ [albums-main] Aplicación inicializada correctamente');
        window.albumsCore.showToast('✅ Aplicación lista', 'success');
        
    } catch (error) {
        console.error('❌ [albums-main] Error al inicializar:', error);
        alert('Error al inicializar la aplicación. Revisa la consola.');
    }
}

// ============================================
// CONFIGURAR EVENTOS GLOBALES
// ============================================

function setupGlobalEvents() {
    console.log('⚙️ [albums-main] Configurando eventos globales...');
    
    // Evento: Antes de cerrar/recargar página
    window.addEventListener('beforeunload', (e) => {
        console.log('👋 [albums-main] Usuario saliendo de la página');
        
        // Guardar estado actual
        if (window.STATE?.albums) {
            window.albumsCore.saveAlbumsToStorage();
        }
        if (window.STATE?.playlist) {
            window.playlistManager.save();
        }
        
        console.log('💾 [albums-main] Estado guardado');
    });
    
    // Evento: Error global
    window.addEventListener('error', (e) => {
        console.error('❌ [albums-main] Error global capturado:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    });
    
    // Evento: Promesa rechazada
    window.addEventListener('unhandledrejection', (e) => {
        console.error('❌ [albums-main] Promesa rechazada:', e.reason);
    });
    
    // Evento: Visibilidad de la página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('👁️ [albums-main] Página oculta');
        } else {
            console.log('👁️ [albums-main] Página visible');
        }
    });
    
    console.log('✅ [albums-main] Eventos globales configurados');
}

// ============================================
// RENDERIZAR CONTENIDO INICIAL
// ============================================

function renderInitialContent() {
    console.log('🎨 [albums-main] Renderizando contenido inicial...');
    
    try {
        // Renderizar playlist si hay datos
        if (window.STATE.playlist && window.STATE.playlist.length > 0) {
            console.log('📋 [albums-main] Renderizando playlist existente...');
            window.albumsRender.renderPlaylist();
        }
        
        // Renderizar álbumes si hay banda seleccionada
        if (window.STATE.currentBandId) {
            console.log('💿 [albums-main] Renderizando álbumes de banda actual...');
            window.albumsRender.renderAlbums(window.STATE.currentBandId);
        }
        
        console.log('✅ [albums-main] Contenido inicial renderizado');
        
    } catch (error) {
        console.error('❌ [albums-main] Error al renderizar contenido:', error);
    }
}

// ============================================
// FUNCIONES DE DEBUG
// ============================================

function debugInfo() {
    console.log('🐛 [albums-main] === DEBUG INFO ===');
    console.log('📊 STATE:', window.STATE);
    console.log('📦 Módulos cargados:', {
        albumsCore: !!window.albumsCore,
        albumsForm: !!window.albumsForm,
        albumsSave: !!window.albumsSave,
        albumsRender: !!window.albumsRender,
        youtubeUtils: !!window.youtubeUtils,
        playerAudio: !!window.playerAudio,
        playlistManager: !!window.playlistManager
    });
    console.log('💿 Álbumes:', window.STATE?.albums?.length || 0);
    console.log('🎵 Playlist:', window.STATE?.playlist?.length || 0);
    console.log('🎸 Bandas:', window.STATE?.bands?.length || 0);
    console.log('🎵 Reproduciendo:', window.STATE?.currentTrack?.title || 'Nada');
    console.log('🐛 === FIN DEBUG ===');
}

function clearAllData() {
    console.log('🧹 [albums-main] clearAllData llamado');
    
    const confirmed = confirm(
        '⚠️ ADVERTENCIA: Esto eliminará TODOS los datos guardados. ¿Continuar?'
    );
    
    if (!confirmed) {
        console.log('❌ [albums-main] Operación cancelada');
        return;
    }
    
    console.log('🗑️ [albums-main] Eliminando todos los datos...');
    
    // Limpiar localStorage
    localStorage.removeItem('albums');
    localStorage.removeItem('playlist');
    localStorage.removeItem('disquera_bands');
    
    // Reiniciar STATE
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
    
    console.log('✅ [albums-main] Datos eliminados');
    
    // Recargar página
    window.location.reload();
}

// ============================================
// ATAJOS DE TECLADO
// ============================================

function setupKeyboardShortcuts() {
    console.log('⌨️ [albums-main] Configurando atajos de teclado...');
    
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + P: Play/Pause
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            console.log('⌨️ [albums-main] Atajo: Play/Pause');
            window.playerAudio.toggle();
        }
        
        // Ctrl/Cmd + S: Stop
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            console.log('⌨️ [albums-main] Atajo: Stop');
            window.playerAudio.stop();
        }
        
        // Ctrl/Cmd + N: Siguiente
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            console.log('⌨️ [albums-main] Atajo: Siguiente');
            window.playerAudio.next();
        }
        
        // Ctrl/Cmd + D: Debug info
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            debugInfo();
        }
    });
    
    console.log('✅ [albums-main] Atajos de teclado configurados');
    console.log('ℹ️ [albums-main] Atajos disponibles:');
    console.log('  - Ctrl/Cmd + P: Play/Pause');
    console.log('  - Ctrl/Cmd + S: Stop');
    console.log('  - Ctrl/Cmd + N: Siguiente canción');
    console.log('  - Ctrl/Cmd + D: Información de debug');
}

// ============================================
// INICIAR CUANDO EL DOM ESTÉ LISTO
// ============================================

if (document.readyState === 'loading') {
    console.log('⏳ [albums-main] Esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ [albums-main] DOM cargado');
        initApp();
        setupKeyboardShortcuts();
    });
} else {
    console.log('✅ [albums-main] DOM ya estaba cargado');
    initApp();
    setupKeyboardShortcuts();
}

// ============================================
// EXPORTAR FUNCIONES DE UTILIDAD
// ============================================

window.albumsApp = {
    init: initApp,
    debug: debugInfo,
    clearAll: clearAllData
};

console.log('✅ [albums-main.js] Módulo principal cargado');
console.log('💡 [albums-main] Tips:');
console.log('  - Usa albumsApp.debug() para ver información del estado');
console.log('  - Usa albumsApp.clearAll() para borrar todos los datos');
console.log('📦 [albums-main] Aplicación lista para usar');