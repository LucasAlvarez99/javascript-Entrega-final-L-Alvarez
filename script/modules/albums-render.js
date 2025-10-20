// ============================================
// ALBUMS-RENDER.JS - Renderizar UI
// ============================================

console.log('🎨 [albums-render.js] Iniciando módulo de renderizado...');

// ============================================
// RENDERIZAR ÁLBUMES
// ============================================

function renderAlbums(bandId) {
    console.log('🎨 [albums-render] renderAlbums llamado');
    console.log('📊 [albums-render] BandId:', bandId);
    
    const albumsList = document.getElementById('albums-list');
    if (!albumsList) {
        console.error('❌ [albums-render] albums-list no encontrado');
        return;
    }
    
    console.log('✅ [albums-render] Contenedor encontrado');
    
    // Obtener bandId actual si no se proporciona
    if (!bandId) {
        bandId = window.albumsCore.getCurrentBandId();
        console.log('📊 [albums-render] BandId obtenido:', bandId);
    }
    
    // Guardar en STATE
    if (bandId) {
        window.STATE.currentBandId = bandId;
        console.log('💾 [albums-render] BandId guardado en STATE');
    }
    
    // Obtener álbumes de la banda
    const bandAlbums = bandId ? 
        window.albumsCore.getAlbumsByBandId(bandId) : 
        window.STATE.albums || [];
    
    console.log(`📊 [albums-render] ${bandAlbums.length} álbumes a renderizar`);
    
    // Crear HTML
    let html = '';
    
    // Botón para agregar álbum (solo si hay banda seleccionada)
    if (bandId) {
        console.log('🏗️ [albums-render] Agregando botón de crear álbum');
        html += `
            <div class="card album add-album">
                <div class="thumb" 
                     style="cursor: pointer" 
                     onclick="showAlbumForm('${bandId}')">
                    <span style="font-size: 24px">+</span><br>
                    Agregar álbum
                </div>
            </div>
        `;
    }
    
    // Renderizar álbumes existentes
    if (bandAlbums.length === 0) {
        console.log('ℹ️ [albums-render] No hay álbumes para mostrar');
        html += `
            <div class="card empty-state">
                <p>No hay álbumes</p>
                ${bandId ? '<small>Haz clic en + para agregar uno</small>' : ''}
            </div>
        `;
    } else {
        console.log('🏗️ [albums-render] Generando HTML de álbumes...');
        bandAlbums.forEach((album, index) => {
            console.log(`  📀 Álbum ${index + 1}:`, album.title);
            const band = window.albumsCore.findBandById(album.bandId);
            
            html += createAlbumCardHTML(album, band);
        });
    }
    
    // Insertar HTML
    albumsList.innerHTML = html;
    console.log('✅ [albums-render] Álbumes renderizados correctamente');
}

// ============================================
// CREAR HTML DE TARJETA DE ÁLBUM
// ============================================

function createAlbumCardHTML(album, band) {
    console.log('🏗️ [albums-render] Creando card para:', album.title);
    
    const bandName = band ? band.name : 'Banda desconocida';
    
    return `
        <div class="card album" data-album-id="${album.id}">
            <img src="${album.cover}" 
                 alt="${album.title}" 
                 class="thumb">
            <div class="info">
                <h4>${album.title}</h4>
                <div class="meta">${bandName} · ${album.year}</div>
                <small>${album.tracks.length} canciones</small>
            </div>
            <div class="actions">
                <button type="button" 
                        class="btn btn-primary" 
                        onclick="verCanciones('${album.id}')"
                        title="Ver canciones">
                    🎵 Ver canciones
                </button>
                <button type="button" 
                        class="btn btn-secondary" 
                        onclick="agregarAlbumAPlaylist('${album.id}')"
                        title="Agregar a playlist">
                    ➕ Playlist
                </button>
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZAR CANCIONES DE ÁLBUM
// ============================================

function renderSongs(albumId) {
    console.log('🎵 [albums-render] renderSongs llamado');
    console.log('📊 [albums-render] Album ID:', albumId);
    
    const songsSection = document.getElementById('songs-section');
    if (!songsSection) {
        console.error('❌ [albums-render] songs-section no encontrado');
        return;
    }
    
    console.log('✅ [albums-render] Sección de canciones encontrada');
    
    // Buscar álbum
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [albums-render] Álbum no encontrado');
        songsSection.innerHTML = `
            <div class="card empty-state">
                <p>❌ Álbum no encontrado</p>
            </div>
        `;
        return;
    }
    
    console.log('✅ [albums-render] Álbum encontrado:', album.title);
    console.log('📊 [albums-render] Canciones:', album.tracks.length);
    
    // Buscar banda
    const band = window.albumsCore.findBandById(album.bandId);
    const bandName = band ? band.name : 'Banda desconocida';
    
    console.log('🏗️ [albums-render] Generando HTML de canciones...');
    
    // Generar HTML
    songsSection.innerHTML = `
        <div class="album-header">
            <img src="${album.cover}" 
                 alt="${album.title}" 
                 class="album-cover">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>💿 ${bandName} · ${album.year}</p>
                <small>${album.tracks.length} canciones</small>
            </div>
        </div>
        
        <div id="player-container" class="player-container">
            <div class="player">
                <h3>🎵 Reproductor</h3>
                <div id="youtube-player"></div>
                <div id="now-playing">Selecciona una canción para reproducir</div>
                <div class="player-controls">
                    <button id="play-btn" 
                            onclick="togglePlay()" 
                            disabled
                            title="Play">
                        ▶️
                    </button>
                    <button id="pause-btn" 
                            onclick="pauseTrack()" 
                            disabled
                            title="Pause">
                        ⏸️
                    </button>
                    <button id="stop-btn" 
                            onclick="stopTrack()" 
                            disabled
                            title="Stop">
                        ⏹️
                    </button>
                </div>
                <div class="progress">
                    <div id="progress-bar"></div>
                </div>
            </div>
        </div>
        
        <div class="songs-list">
            ${album.tracks.map((track, index) => {
                console.log(`  🎵 Track ${index + 1}:`, track.title);
                return createSongItemHTML(track, album.id, index);
            }).join('')}
        </div>
    `;
    
    console.log('✅ [albums-render] Canciones renderizadas correctamente');
    
    // Scroll a la sección
    songsSection.scrollIntoView({ behavior: 'smooth' });
    console.log('📜 [albums-render] Scroll a sección de canciones');
}

// ============================================
// CREAR HTML DE ÍTEM DE CANCIÓN
// ============================================

function createSongItemHTML(track, albumId, index) {
    const minutes = Math.floor(track.duration / 60);
    const seconds = String(track.duration % 60).padStart(2, '0');
    
    return `
        <div class="song" data-track-id="${track.id}">
            <div class="info">
                <div class="title">${track.title}</div>
                <div class="duration">⏱️ ${minutes}:${seconds}</div>
            </div>
            <div class="actions">
                <button class="btn play" 
                        onclick="playTrack('${albumId}', '${track.id}')"
                        title="Reproducir">
                    ▶️
                </button>
                <button class="btn add" 
                        onclick="addToPlaylist('${albumId}', '${track.id}')"
                        title="Agregar a playlist">
                    ➕
                </button>
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZAR PLAYLIST
// ============================================

function renderPlaylist() {
    console.log('🎵 [albums-render] renderPlaylist llamado');
    
    const playlistElement = document.getElementById('playlist');
    if (!playlistElement) {
        console.warn('⚠️ [albums-render] Elemento playlist no encontrado');
        return;
    }
    
    console.log('✅ [albums-render] Elemento playlist encontrado');
    
    // Validar que existe la playlist
    if (!window.STATE.playlist) {
        console.warn('⚠️ [albums-render] STATE.playlist no existe, inicializando...');
        window.STATE.playlist = [];
    }
    
    console.log('📊 [albums-render] Canciones en playlist:', window.STATE.playlist.length);
    
    // Renderizar contenido
    if (window.STATE.playlist.length === 0) {
        console.log('ℹ️ [albums-render] Playlist vacía');
        playlistElement.innerHTML = `
            <div class="empty-playlist">
                <p>🎵 Tu playlist está vacía</p>
                <small>Agrega canciones usando el botón + en cada canción</small>
            </div>
        `;
        return;
    }
    
    console.log('🏗️ [albums-render] Generando HTML de playlist...');
    playlistElement.innerHTML = `
        <div class="playlist-header">
            <h3>Mi Playlist</h3>
            <span class="count">${window.STATE.playlist.length} canciones</span>
        </div>
        <div class="playlist-tracks">
            ${window.STATE.playlist.map((track, index) => {
                console.log(`  🎵 Playlist ${index + 1}:`, track.title);
                return createPlaylistItemHTML(track, index);
            }).join('')}
        </div>
    `;
    
    console.log('✅ [albums-render] Playlist renderizada correctamente');
}

// ============================================
// CREAR HTML DE ÍTEM DE PLAYLIST
// ============================================

function createPlaylistItemHTML(track, index) {
    return `
        <div class="playlist-item" data-track-id="${track.id}">
            <span class="number">${index + 1}</span>
            <div class="info">
                <div class="title">${track.title}</div>
                <div class="meta">${track.album || 'Álbum'} · ${track.artist || 'Artista'}</div>
            </div>
            <div class="actions">
                <button class="btn play" 
                        onclick="playTrack('${track.albumId}', '${track.id}')"
                        title="Reproducir">
                    ▶️
                </button>
                <button class="btn remove" 
                        onclick="removeFromPlaylist('${track.id}')"
                        title="Eliminar">
                    ❌
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ACTUALIZAR "NOW PLAYING"
// ============================================

function updateNowPlaying(track, album) {
    console.log('🎵 [albums-render] updateNowPlaying llamado');
    console.log('📊 [albums-render] Track:', track.title);
    console.log('📊 [albums-render] Album:', album.title);
    
    const nowPlaying = document.getElementById('now-playing');
    if (!nowPlaying) {
        console.error('❌ [albums-render] now-playing no encontrado');
        return;
    }
    
    const band = window.albumsCore.findBandById(album.bandId);
    const bandName = band ? band.name : 'Artista';
    
    console.log('🏗️ [albums-render] Actualizando información de reproducción...');
    
    nowPlaying.innerHTML = `
        <div class="now-playing-card">
            <div class="now-playing-icon">🎵</div>
            <div class="now-playing-info">
                <div class="track-title">${track.title}</div>
                <div class="track-meta">
                    ${album.title} · ${bandName}
                </div>
            </div>
            <div class="playing-animation">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    console.log('✅ [albums-render] Now playing actualizado');
}

// ============================================
// RESALTAR CANCIÓN ACTUAL
// ============================================

function highlightCurrentTrack(trackId) {
    console.log('🎨 [albums-render] highlightCurrentTrack llamado');
    console.log('📊 [albums-render] Track ID:', trackId);
    
    // Remover highlight anterior
    const previousHighlight = document.querySelectorAll('.song.playing');
    console.log(`🧹 [albums-render] Removiendo ${previousHighlight.length} highlights previos`);
    previousHighlight.forEach(song => song.classList.remove('playing'));
    
    // Agregar highlight al actual
    const currentSong = document.querySelector(`[data-track-id="${trackId}"]`);
    if (currentSong) {
        currentSong.classList.add('playing');
        console.log('✅ [albums-render] Track resaltado correctamente');
    } else {
        console.warn('⚠️ [albums-render] Track no encontrado en DOM');
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.albumsRender = {
    renderAlbums,
    renderSongs,
    renderPlaylist,
    updateNowPlaying,
    highlightCurrentTrack
};

// Alias globales
window.verCanciones = renderSongs;

console.log('✅ [albums-render.js] Módulo de renderizado cargado');
console.log('📦 [albums-render.js] Funciones disponibles:', Object.keys(window.albumsRender));