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
    
    // Patrones de URLs de YouTube
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
    
    // Patrón 1: youtube.com/watch?v=ID
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        videoId = watchMatch[1];
        console.log('✅ [youtube-utils] VideoId de watch URL:', videoId);
        return videoId;
    }
    
    // Patrón 2: youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
        videoId = shortMatch[1];
        console.log('✅ [youtube-utils] VideoId de short URL:', videoId);
        return videoId;
    }
    
    // Patrón 3: youtube.com/embed/ID
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
        // Verificar si ya está cargada
        if (window.YT && window.YT.Player) {
            console.log('✅ [youtube-utils] API ya estaba cargada');
            resolve();
            return;
        }
        
        console.log('⏳ [youtube-utils] Cargando API de YouTube...');
        
        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
            console.log('⏳ [youtube-utils] Script ya existe, esperando carga...');
            
            // Esperar a que la API esté lista
            const checkInterval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkInterval);
                    console.log('✅ [youtube-utils] API cargada exitosamente');
                    resolve();
                }
            }, 100);
            
            // Timeout después de 10 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!window.YT || !window.YT.Player) {
                    console.error('❌ [youtube-utils] Timeout al cargar API');
                    reject(new Error('Timeout al cargar API de YouTube'));
                }
            }, 10000);
            
            return;
        }
        
        // Definir callback global
        window.onYouTubeIframeAPIReady = function() {
            console.log('✅ [youtube-utils] onYouTubeIframeAPIReady ejecutado');
            resolve();
        };
        
        // Crear y cargar script
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
// OBTENER INFORMACIÓN DEL VIDEO (OPCIONAL)
// ============================================

async function getVideoInfo(videoId) {
    console.log('ℹ️ [youtube-utils] getVideoInfo llamado');
    console.log('📊 [youtube-utils] VideoId:', videoId);
    
    try {
        // Usar servicio noembed para obtener información
        const url = `https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`;
        console.log('📡 [youtube-utils] Consultando:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('❌ [youtube-utils] Error en respuesta:', response.status);
            return null;
        }
        
        const data = await response.json();
        console.log('✅ [youtube-utils] Información obtenida:', data.title);
        
        return {
            title: data.title || 'Video sin título',
            author: data.author_name || 'Autor desconocido',
            thumbnail: data.thumbnail_url || null
        };
        
    } catch (error) {
        console.error('❌ [youtube-utils] Error al obtener info:', error);
        return null;
    }
}

// ============================================
// CREAR URL DE EMBED
// ============================================

function createEmbedUrl(videoId, autoplay = false) {
    console.log('🔗 [youtube-utils] Creando URL de embed');
    console.log('📊 [youtube-utils] VideoId:', videoId, '| Autoplay:', autoplay);
    
    if (!videoId) {
        console.error('❌ [youtube-utils] VideoId no proporcionado');
        return null;
    }
    
    const params = new URLSearchParams({
        controls: '0',
        modestbranding: '1',
        rel: '0',
        enablejsapi: '1',
        origin: window.location.origin,
        playsinline: '1'
    });
    
    if (autoplay) {
        params.append('autoplay', '1');
    }
    
    const url = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    console.log('✅ [youtube-utils] URL creada:', url);
    
    return url;
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
    
    // Los IDs de YouTube tienen exactamente 11 caracteres
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
    getVideoInfo,
    createEmbedUrl,
    isValidVideoId,
    formatDuration,
    cleanYoutubeUrl
};

console.log('✅ [youtube-utils.js] Módulo de YouTube cargado');
console.log('📦 [youtube-utils.js] Funciones disponibles:', Object.keys(window.youtubeUtils));