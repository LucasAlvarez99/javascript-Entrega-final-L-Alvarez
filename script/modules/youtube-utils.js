// ============================================
// YOUTUBE-UTILS.JS - Utilidades de YouTube
// ============================================

console.log('▶️ [youtube-utils.js] Iniciando módulo de YouTube...');

// ============================================
// VALIDACIÓN DE URLs
// ============================================

function isValidYoutubeUrl(url) {
    console.log('🔍 [youtube-utils] Validando URL:', url);
    
    if (!url || typeof url !== 'string') {
        console.warn('⚠️ [youtube-utils] URL inválida o vacía');
        return false;
    }
    
    const patterns = [
        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];
    
    const isValid = patterns.some(pattern => pattern.test(url));
    console.log(`${isValid ? '✅' : '❌'} [youtube-utils] URL ${isValid ? 'válida' : 'inválida'}`);
    
    return isValid;
}

// ============================================
// EXTRAER VIDEO ID
// ============================================

function getYoutubeVideoId(url) {
    console.log('🔍 [youtube-utils] Extrayendo videoId de:', url);
    
    if (!url) {
        console.error('❌ [youtube-utils] URL vacía');
        return null;
    }
    
    let videoId = null;
    
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        videoId = watchMatch[1];
        console.log('✅ [youtube-utils] VideoId de watch URL:', videoId);
        return videoId;
    }
    
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
        videoId = shortMatch[1];
        console.log('✅ [youtube-utils] VideoId de short URL:', videoId);
        return videoId;
    }
    
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
        videoId = embedMatch[1];
        console.log('✅ [youtube-utils] VideoId de embed URL:', videoId);
        return videoId;
    }
    
    console.error('❌ [youtube-utils] No se pudo extraer videoId');
    return null;
}

// ============================================
// CARGAR API DE YOUTUBE
// ============================================

function loadYouTubeAPI() {
    console.log('📡 [youtube-utils] loadYouTubeAPI llamado');
    
    return new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
            console.log('✅ [youtube-utils] API ya estaba cargada');
            resolve();
            return;
        }
        
        console.log('⏳ [youtube-utils] Cargando API de YouTube...');
        
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
            console.log('⏳ [youtube-utils] Script ya existe, esperando carga...');
            
            const checkInterval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkInterval);
                    console.log('✅ [youtube-utils] API cargada exitosamente');
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!window.YT || !window.YT.Player) {
                    console.error('❌ [youtube-utils] Timeout al cargar API');
                    reject(new Error('Timeout al cargar API de YouTube'));
                }
            }, 10000);
            
            return;
        }
        
        window.onYouTubeIframeAPIReady = function() {
            console.log('✅ [youtube-utils] onYouTubeIframeAPIReady ejecutado');
            resolve();
        };
        
        console.log('📥 [youtube-utils] Creando script tag...');
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        
        tag.onerror = () => {
            console.error('❌ [youtube-utils] Error al cargar script de YouTube');
            reject(new Error('No se pudo cargar la API de YouTube'));
        };
        
        tag.onload = () => {
            console.log('📥 [youtube-utils] Script cargado, esperando inicialización...');
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        console.log('✅ [youtube-utils] Script insertado en DOM');
    });
}

// ============================================
// VALIDAR VIDEO ID
// ============================================

function isValidVideoId(videoId) {
    console.log('🔍 [youtube-utils] Validando videoId:', videoId);
    
    if (!videoId || typeof videoId !== 'string') {
        console.warn('⚠️ [youtube-utils] VideoId inválido');
        return false;
    }
    
    const isValid = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    console.log(`${isValid ? '✅' : '❌'} [youtube-utils] VideoId ${isValid ? 'válido' : 'inválido'}`);
    
    return isValid;
}

// ============================================
// CONVERTIR SEGUNDOS A FORMATO MM:SS
// ============================================

function formatDuration(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        console.warn('⚠️ [youtube-utils] Duración inválida:', seconds);
        return '0:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${minutes}:${String(secs).padStart(2, '0')}`;
    
    return formatted;
}

// ============================================
// LIMPIAR URL DE YOUTUBE
// ============================================

function cleanYoutubeUrl(url) {
    console.log('🧹 [youtube-utils] Limpiando URL:', url);
    
    const videoId = getYoutubeVideoId(url);
    
    if (!videoId) {
        console.error('❌ [youtube-utils] No se pudo limpiar URL');
        return url;
    }
    
    const cleanUrl = `https://youtube.com/watch?v=${videoId}`;
    console.log('✅ [youtube-utils] URL limpia:', cleanUrl);
    
    return cleanUrl;
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.youtubeUtils = {
    isValidYoutubeUrl,
    getYoutubeVideoId,
    loadYouTubeAPI,
    isValidVideoId,
    formatDuration,
    cleanYoutubeUrl
};

console.log('✅ [youtube-utils.js] Módulo de YouTube cargado');
console.log('📦 [youtube-utils.js] Funciones disponibles:', Object.keys(window.youtubeUtils));