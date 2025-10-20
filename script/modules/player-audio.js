// ============================================
// PLAYER-AUDIO.JS - Reproductor solo audio
// VERSIÓN MEJORADA CON MANEJO DE ERRORES
// ============================================

console.log('🎵 [player-audio.js] Iniciando módulo de reproductor...');

// ============================================
// REPRODUCIR CANCIÓN
// ============================================

async function playTrack(albumId, trackId) {
    console.log('▶️ [player-audio] playTrack llamado');
    console.log('📊 [player-audio] Album ID:', albumId);
    console.log('📊 [player-audio] Track ID:', trackId);
    
    try {
        // Validar estado
        if (!window.STATE?.albums) {
            throw new Error('Estado de la aplicación no válido');
        }
        
        console.log('✅ [player-audio] Estado válido');
        
        // Buscar álbum
        const currentAlbum = window.albumsCore.findAlbumById(albumId);
        if (!currentAlbum) {
            throw new Error('Álbum no encontrado');
        }
        
        console.log('✅ [player-audio] Álbum encontrado:', currentAlbum.title);
        
        // Buscar track
        const currentTrack = currentAlbum.tracks.find(t => t.id === trackId);
        if (!currentTrack) {
            throw new Error('Canción no encontrada');
        }
        
        console.log('✅ [player-audio] Canción encontrada:', currentTrack.title);
        
        // Obtener videoId
        const videoId = currentTrack.youtubeId || 
            (currentTrack.url && window.youtubeUtils.getYoutubeVideoId(currentTrack.url));
        
        if (!videoId) {
            throw new Error('ID de video no disponible');
        }
        
        console.log('✅ [player-audio] Video ID:', videoId);
        
        // Verificar disponibilidad del video (opcional)
        const availability = await checkVideoAvailability(videoId);
        if (!availability.available) {
            console.warn('⚠️ [player-audio] Video puede tener restricciones');
        }
        
        // Actualizar información de reproducción
        window.albumsRender.updateNowPlaying(currentTrack, currentAlbum);
        console.log('✅ [player-audio] Now playing actualizado');
        
        // Cargar API si no está lista
        if (typeof YT === 'undefined' || !YT.Player) {
            console.log('⏳ [player-audio] Cargando API de YouTube...');
            window.albumsCore.showToast('Cargando reproductor...', 'info');
            await window.youtubeUtils.loadYouTubeAPI();
            console.log('✅ [player-audio] API cargada');
        }
        
        // Configurar contenedor del player
        const playerContainer = document.getElementById('player-container');
        if (!playerContainer) {
            throw new Error('Contenedor de reproductor no encontrado');
        }
        
        console.log('✅ [player-audio] Contenedor encontrado');
        
        // Crear o actualizar player
        await initOrUpdatePlayer(videoId);
        console.log('✅ [player-audio] Player inicializado');
        
        // Actualizar estado global
        window.STATE.currentTrack = currentTrack;
        window.STATE.currentAlbum = currentAlbum;
        window.STATE.isPlaying = true;
        
        console.log('💾 [player-audio] Estado actualizado');
        
        // Actualizar UI
        enablePlayerControls();
        window.albumsRender.highlightCurrentTrack(trackId);
        
        console.log('✅ [player-audio] Reproducción iniciada exitosamente');
        
    } catch (error) {
        console.error('❌ [player-audio] Error al reproducir:', error.message);
        window.albumsCore.showToast(`Error: ${error.message}`, 'error');
    }
}

// ============================================
// INICIALIZAR O ACTUALIZAR PLAYER
// ============================================

async function initOrUpdatePlayer(videoId) {
    console.log('🎬 [player-audio] initOrUpdatePlayer llamado');
    console.log('📊 [player-audio] Video ID:', videoId);
    
    // Verificar que tenemos un ID válido
    if (!window.youtubeUtils.isValidVideoId(videoId)) {
        console.error('❌ [player-audio] Video ID inválido');
        throw new Error('ID de video inválido');
    }
    
    // Obtener o crear div del player
    let playerDiv = document.getElementById('youtube-player');
    const playerContainer = document.getElementById('player-container');
    
    if (!playerDiv) {
        console.log('🏗️ [player-audio] Creando div del player...');
        playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        
        // 🔥 CLAVE: Ocultar el player visualmente
        playerDiv.style.cssText = `
            width: 1px !important;
            height: 1px !important;
            position: absolute !important;
            left: -9999px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
        `;
        
        playerContainer.appendChild(playerDiv);
        console.log('✅ [player-audio] Div del player creado y oculto');
    }
    
    // Crear o actualizar player
    if (!window.STATE.youtubePlayer) {
        console.log('🎬 [player-audio] Creando nuevo player...');
        
        window.STATE.youtubePlayer = new YT.Player('youtube-player', {
            height: '1',
            width: '1',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1,
                origin: window.location.origin,
                playsinline: 1,
                fs: 0,
                iv_load_policy: 3,
                disablekb: 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        
        console.log('✅ [player-audio] Player creado');
        
    } else {
        console.log('🔄 [player-audio] Actualizando video existente...');
        
        window.STATE.youtubePlayer.loadVideoById({
            videoId: videoId,
            startSeconds: 0
        });
        
        console.log('✅ [player-audio] Video actualizado');
    }
}

// ============================================
// EVENTOS DEL PLAYER
// ============================================

function onPlayerReady(event) {
    console.log('✅ [player-audio] onPlayerReady - Player listo');
    
    try {
        event.target.playVideo();
        console.log('▶️ [player-audio] Reproducción iniciada');
        
        enablePlayerControls();
        window.albumsCore.showToast('▶️ Reproduciendo', 'success');
        
    } catch (error) {
        console.error('❌ [player-audio] Error en onPlayerReady:', error);
    }
}

function onPlayerStateChange(event) {
    console.log('🔄 [player-audio] onPlayerStateChange');
    
    if (!event || typeof event.data === 'undefined') {
        console.warn('⚠️ [player-audio] Evento inválido');
        return;
    }
    
    const states = {
        '-1': 'No iniciado',
        '0': 'Terminado',
        '1': 'Reproduciendo',
        '2': 'Pausado',
        '3': 'Buffering',
        '5': 'En cola'
    };
    
    console.log(`🎵 [player-audio] Estado: ${states[event.data]} (${event.data})`);
    
    // Actualizar estado global
    window.STATE.isPlaying = event.data === YT.PlayerState.PLAYING;
    window.STATE.isPaused = event.data === YT.PlayerState.PAUSED;
    
    switch (event.data) {
        case YT.PlayerState.ENDED: // 0
            console.log('⏹️ [player-audio] Canción terminada');
            window.STATE.isPlaying = false;
            playNextTrack();
            break;
            
        case YT.PlayerState.PLAYING: // 1
            console.log('▶️ [player-audio] Reproduciendo');
            updateProgress();
            updatePlayerControls(true);
            break;
            
        case YT.PlayerState.PAUSED: // 2
            console.log('⏸️ [player-audio] Pausado');
            updatePlayerControls(false);
            break;
            
        case YT.PlayerState.BUFFERING: // 3
            console.log('🔄 [player-audio] Cargando buffer...');
            showBufferingIndicator();
            break;
    }
}

function onPlayerError(event) {
    console.error('❌ [player-audio] onPlayerError');
    console.error('📊 [player-audio] Código de error:', event.data);
    
    const errorMessages = {
        2: {
            title: 'Parámetro inválido',
            message: 'El video tiene un problema con sus parámetros',
            solution: 'Intenta con otro video'
        },
        5: {
            title: 'Error del reproductor',
            message: 'El reproductor HTML5 encontró un error',
            solution: 'Recarga la página'
        },
        100: {
            title: 'Video no encontrado',
            message: 'Este video fue eliminado o no existe',
            solution: 'Busca otro video'
        },
        101: {
            title: '🚫 Video bloqueado para embed',
            message: 'El propietario del video no permite reproducción embebida',
            solution: 'Usa otro video - este no funcionará aquí'
        },
        150: {
            title: '🚫 Video bloqueado para embed',
            message: 'El propietario del video no permite reproducción embebida',
            solution: 'Usa otro video - este no funcionará aquí'
        }
    };
    
    const error = errorMessages[event.data] || {
        title: 'Error desconocido',
        message: `Error ${event.data}`,
        solution: 'Intenta con otro video'
    };
    
    console.error(`❌ [player-audio] ${error.title}: ${error.message}`);
    console.log(`💡 [player-audio] Solución: ${error.solution}`);
    
    // Mostrar toast con más información
    window.albumsCore.showToast(`${error.title}: ${error.solution}`, 'error');
    
    // Si es error 101 o 150 (bloqueado), marcar el video como no reproducible
    if (event.data === 101 || event.data === 150) {
        console.warn('⚠️ [player-audio] Este video está bloqueado por el propietario');
        console.warn('💡 [player-audio] Recomendación: Elimina este video y agrega otro');
        
        // Mostrar modal con información
        showBlockedVideoModal();
    }
    
    // Resetear estado
    window.STATE.isPlaying = false;
    updatePlayerControls(false);
    
    // Intentar siguiente canción automáticamente
    setTimeout(() => {
        if (window.STATE.currentAlbum && window.STATE.currentTrack) {
            console.log('⏭️ [player-audio] Intentando siguiente canción...');
            playNextTrack();
        }
    }, 2000);
}

// ============================================
// MODAL PARA VIDEOS BLOQUEADOS
// ============================================

function showBlockedVideoModal() {
    console.log('📋 [player-audio] Mostrando modal de video bloqueado');
    
    // Verificar si ya existe un modal
    const existingModal = document.getElementById('blocked-video-modal');
    if (existingModal) {
        console.log('⚠️ [player-audio] Modal ya existe, removiendo...');
        existingModal.remove();
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'blocked-video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1d24 0%, #2d3139 100%);
            padding: 32px;
            border-radius: 16px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border: 2px solid #ff5252;
        ">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🚫</div>
                <h2 style="color: #ff5252; margin: 0 0 8px 0; font-size: 1.5rem;">
                    Video Bloqueado
                </h2>
                <p style="color: #9aa4b2; margin: 0; font-size: 0.95rem;">
                    El propietario no permite reproducción embebida
                </p>
            </div>
            
            <div style="
                background: rgba(255,82,82,0.1);
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #ff5252;
                margin-bottom: 24px;
            ">
                <p style="color: #e6eef6; margin: 0 0 12px 0; font-weight: 500;">
                    ¿Por qué pasa esto?
                </p>
                <p style="color: #9aa4b2; margin: 0; font-size: 0.9rem; line-height: 1.6;">
                    Algunos artistas y discográficas bloquean sus videos para que 
                    solo se puedan ver en YouTube.com directamente.
                </p>
            </div>
            
            <div style="
                background: rgba(76,175,80,0.1);
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #4caf50;
                margin-bottom: 24px;
            ">
                <p style="color: #e6eef6; margin: 0 0 12px 0; font-weight: 500;">
                    ✅ Solución:
                </p>
                <ul style="color: #9aa4b2; margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.8;">
                    <li>Busca videos de artistas independientes</li>
                    <li>Usa videos con licencia Creative Commons</li>
                    <li>Prueba con música libre de derechos</li>
                    <li>Evita videos de grandes discográficas</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeBlockedVideoModal()" style="
                    background: #ffa726;
                    color: #000;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#f57c00'" 
                   onmouseout="this.style.background='#ffa726'">
                    Entendido
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ [player-audio] Modal de video bloqueado mostrado');
}

function closeBlockedVideoModal() {
    console.log('🗑️ [player-audio] Cerrando modal...');
    const modal = document.getElementById('blocked-video-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            console.log('✅ [player-audio] Modal cerrado');
        }, 300);
    }
}

// ============================================
// VALIDAR VIDEO ANTES DE REPRODUCIR
// ============================================

async function checkVideoAvailability(videoId) {
    console.log('🔍 [player-audio] Verificando disponibilidad del video...');
    console.log('📊 [player-audio] Video ID:', videoId);
    
    try {
        // Intentar obtener información del video
        const response = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        
        if (data.error) {
            console.warn('⚠️ [player-audio] Video puede tener restricciones');
            return { available: false, reason: 'restricted' };
        }
        
        console.log('✅ [player-audio] Video parece estar disponible');
        return { available: true, title: data.title };
        
    } catch (error) {
        console.warn('⚠️ [player-audio] No se pudo verificar disponibilidad:', error);
        return { available: true }; // Intentar reproducir de todas formas
    }
}

// ============================================
// CONTROLES DEL PLAYER
// ============================================

function togglePlay() {
    console.log('🎛️ [player-audio] togglePlay llamado');
    
    if (!window.STATE.youtubePlayer) {
        console.warn('⚠️ [player-audio] No hay player activo');
        window.albumsCore.showToast('⚠️ No hay reproductor activo', 'warning');
        return;
    }
    
    if (window.STATE.isPlaying) {
        console.log('⏸️ [player-audio] Pausando...');
        window.STATE.youtubePlayer.pauseVideo();
        window.albumsCore.showToast('⏸️ Pausado', 'info');
    } else {
        console.log('▶️ [player-audio] Reanudando...');
        window.STATE.youtubePlayer.playVideo();
        window.albumsCore.showToast('▶️ Reproduciendo', 'success');
    }
}

function pauseTrack() {
    console.log('⏸️ [player-audio] pauseTrack llamado');
    
    if (!window.STATE.youtubePlayer) {
        console.warn('⚠️ [player-audio] No hay player activo');
        return;
    }
    
    window.STATE.youtubePlayer.pauseVideo();
    window.STATE.isPlaying = false;
    updatePlayerControls(false);
    
    console.log('✅ [player-audio] Reproducción pausada');
    window.albumsCore.showToast('⏸️ Pausado', 'info');
}

function stopTrack() {
    console.log('⏹️ [player-audio] stopTrack llamado');
    
    if (!window.STATE.youtubePlayer) {
        console.warn('⚠️ [player-audio] No hay player activo');
        return;
    }
    
    window.STATE.youtubePlayer.stopVideo();
    window.STATE.isPlaying = false;
    updatePlayerControls(false);
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    console.log('✅ [player-audio] Reproducción detenida');
    window.albumsCore.showToast('⏹️ Detenido', 'info');
}

function enablePlayerControls() {
    console.log('🎛️ [player-audio] Habilitando controles...');
    
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    if (playBtn) {
        playBtn.disabled = false;
        console.log('✅ [player-audio] Play button habilitado');
    }
    if (pauseBtn) {
        pauseBtn.disabled = false;
        console.log('✅ [player-audio] Pause button habilitado');
    }
    if (stopBtn) {
        stopBtn.disabled = false;
        console.log('✅ [player-audio] Stop button habilitado');
    }
}

function updatePlayerControls(isPlaying) {
    console.log('🎛️ [player-audio] updatePlayerControls');
    console.log('📊 [player-audio] Is playing:', isPlaying);
    
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (playBtn && pauseBtn) {
        playBtn.disabled = isPlaying;
        pauseBtn.disabled = !isPlaying;
        console.log('✅ [player-audio] Controles actualizados');
    }
}

// ============================================
// BARRA DE PROGRESO
// ============================================

function updateProgress() {
    if (!window.STATE.youtubePlayer || !window.STATE.isPlaying) {
        return;
    }
    
    try {
        const duration = window.STATE.youtubePlayer.getDuration();
        const current = window.STATE.youtubePlayer.getCurrentTime();
        
        if (duration > 0) {
            const progress = (current / duration) * 100;
            const progressBar = document.getElementById('progress-bar');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
        
        // Continuar actualizando si está reproduciendo
        if (window.STATE.isPlaying) {
            requestAnimationFrame(updateProgress);
        }
        
    } catch (error) {
        console.error('❌ [player-audio] Error en updateProgress:', error);
    }
}

// ============================================
// REPRODUCCIÓN AUTOMÁTICA
// ============================================

function playNextTrack() {
    console.log('⏭️ [player-audio] playNextTrack llamado');
    
    if (!window.STATE?.currentTrack || !window.STATE?.currentAlbum) {
        console.log('ℹ️ [player-audio] No hay contexto de reproducción');
        return;
    }
    
    const currentIndex = window.STATE.currentAlbum.tracks.findIndex(
        t => t.id === window.STATE.currentTrack.id
    );
    
    console.log('📊 [player-audio] Índice actual:', currentIndex);
    console.log('📊 [player-audio] Total tracks:', window.STATE.currentAlbum.tracks.length);
    
    if (currentIndex > -1 && currentIndex < window.STATE.currentAlbum.tracks.length - 1) {
        const nextTrack = window.STATE.currentAlbum.tracks[currentIndex + 1];
        console.log('▶️ [player-audio] Siguiente canción:', nextTrack.title);
        
        playTrack(window.STATE.currentAlbum.id, nextTrack.id);
    } else {
        console.log('🏁 [player-audio] Fin del álbum');
        window.albumsCore.showToast('🏁 Álbum terminado', 'info');
    }
}

// ============================================
// INDICADORES VISUALES
// ============================================

function showBufferingIndicator() {
    console.log('🔄 [player-audio] Mostrando indicador de buffering');
    
    const nowPlaying = document.getElementById('now-playing');
    if (!nowPlaying) return;
    
    const existing = nowPlaying.querySelector('.buffering-indicator');
    if (!existing) {
        const indicator = document.createElement('span');
        indicator.className = 'buffering-indicator';
        indicator.innerHTML = ' 🔄 Cargando...';
        nowPlaying.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
            console.log('🧹 [player-audio] Indicador de buffering removido');
        }, 3000);
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.playerAudio = {
    play: playTrack,
    toggle: togglePlay,
    pause: pauseTrack,
    stop: stopTrack,
    next: playNextTrack
};

// Alias globales para onclick
window.playTrack = playTrack;
window.togglePlay = togglePlay;
window.pauseTrack = pauseTrack;
window.stopTrack = stopTrack;
window.closeBlockedVideoModal = closeBlockedVideoModal;

console.log('✅ [player-audio.js] Módulo de reproductor cargado');
console.log('📦 [player-audio.js] Funciones disponibles:', Object.keys(window.playerAudio));