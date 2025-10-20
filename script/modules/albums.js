// Gestión de álbumes y canciones de YouTube
console.log('Inicializando módulo albums.js');

// Gestión de álbumes y canciones de YouTube

// Sistema de tracking global
const AlbumsModule = {
    currentTracks: [],
    debug: function(label, data) {
        const styles = {
            label: 'background: #ffa726; color: black; padding: 2px 6px; border-radius: 4px;',
            data: 'color: #4caf50;'
        };
        console.log(`%c${label}%c`, styles.label, '', data);
        return data;
    },
    error: function(label, error) {
        console.error(`❌ ERROR [${label}]:`, error);
    },
    info: function(label) {
        console.log(`ℹ️ INFO: ${label}`);
    },
    success: function(label) {
        console.log(`✅ SUCCESS: ${label}`);
    }
};
function debug(label, data) {
    console.log(`🔍 DEBUG [${label}]:`, data);
    return data;
}

// Estado inicial
window.addEventListener('load', () => {
    console.log('🚀 Iniciando albums.js...');
    
    // Inicializar STATE si no existe
    if (!window.STATE) {
        window.STATE = {
            bands: [],
            albums: [],
            currentBandId: null,
            currentSection: 'bandas'
        };
    }

    // Mostrar todas las secciones por defecto
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'block';
    });

    // Asegurarnos de que albums-section esté visible
    const albumsSection = document.getElementById('albums-section');
    if (albumsSection) {
        albumsSection.style.display = 'block';
    }

    // Cargar álbumes guardados
    const savedAlbums = localStorage.getItem('albums');
    if (savedAlbums) {
        try {
            window.STATE.albums = JSON.parse(savedAlbums);
            AlbumsModule.debug('Loaded albums from storage', window.STATE.albums);
        } catch (e) {
            console.error('Error loading albums:', e);
        }
    }
});

// Función para comprobar si el STATE existe y crearlo si no
function ensureState() {
    if (!window.STATE) {
        window.STATE = {
            bands: [],
            albums: [],
            genres: new Set(),
            playlist: [],
            currentBandId: null
        };
    }
    
    // Cargar álbumes guardados
    const savedAlbums = localStorage.getItem('albums');
    if (savedAlbums) {
        window.STATE.albums = JSON.parse(savedAlbums);
    }
}
// Función para obtener el ID de la banda actual
function getCurrentBandId() {
    // Intentar obtener el ID de la banda de diferentes fuentes
    const fromForm = document.querySelector('.album-form')?.dataset.bandId;
    const fromState = window.STATE?.currentBandId;
    const fromURL = new URLSearchParams(window.location.search).get('bandId');
    
    console.log('Band ID sources:', {
        fromForm,
        fromState,
        fromURL
    });
    
    return fromForm || fromState || fromURL;
}

// Crear contenedor de toast si no existe
function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
    }
    return container;
}

// Función de toast mejorada
function showToast(message, type = 'success') {
    console.log('Showing toast:', message);
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Asegurarnos de que STATE está disponible
if (typeof window.STATE === 'undefined') {
    console.log('Inicializando STATE en albums.js');
    window.STATE = {
        bands: [],
        albums: [],
        genres: new Set(),
        playlist: [],
        currentBandId: null,
        currentAlbumId: null,
        currentTrack: null,
        isPlaying: false,
        progressTimer: null,
        youtubePlayer: null
    };
} else {
    console.log('STATE ya está definido:', STATE);
}

function showAlbumForm(bandId) {
    console.log('📝 Mostrando formulario de álbum para banda:', bandId);
    
    // Asegurarnos de que el contenedor tenga el ancho adecuado
    const albumsContainer = document.getElementById('albums-list');
    if (albumsContainer) {
        albumsContainer.style.maxWidth = '800px';
        albumsContainer.style.width = '100%';
        albumsContainer.style.margin = '0 auto';
    }
    
    if (!bandId) {
        bandId = window.STATE?.currentBandId;
        if (!bandId) {
            console.error('No se encontró un bandId válido');
            showToast('Error: No se pudo identificar la banda', 'error');
            return;
        }
    }

    // Asegurarse de que STATE existe
    if (!window.STATE) {
        window.STATE = {
            bands: [],
            albums: [],
            currentBandId: bandId
        };
    }
    
    window.STATE.currentBandId = bandId;
    
    const albumesPanel = document.querySelector('.panel.albumes');
    if (albumesPanel) {
        albumesPanel.classList.add('active');
        AlbumsModule.success('Panel de álbumes activado');
    } else {
        AlbumsModule.error('showAlbumForm', 'No se encontró el panel de álbumes');
    }

    const existingForm = document.querySelector('.album-form');
    if (existingForm) {
        AlbumsModule.debug('Removing existing form');
        existingForm.remove();
    }

    // Asegurarnos de que STATE existe y guardar el bandId
    if (typeof window.STATE === 'undefined') {
        window.STATE = {
            bands: [],
            albums: [],
            genres: new Set(),
            playlist: [],
            currentBandId: bandId
        };
    }
    
    window.STATE.currentBandId = bandId;
    AlbumsModule.debug('Updated STATE', { currentBandId: bandId });

    const form = document.createElement('div');
    form.className = 'album-form panel';
    form.setAttribute('data-band-id', bandId); // Guardamos el bandId en el dataset
    console.log('Creating form with bandId:', bandId);
    form.innerHTML = `
        <div class="album-form-header">
            <h3>Nuevo álbum</h3>
            <p class="band-info">Banda seleccionada: ${window.STATE.bands.find(b => b.id === bandId)?.name || 'Banda'}</p>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="album-title">Título del álbum</label>
                <input type="text" id="album-title" required placeholder="Ej: Greatest Hits">
            </div>
            <div class="form-group">
                <label for="album-year">Año</label>
                <input type="number" id="album-year" required min="1900" max="2025" value="${new Date().getFullYear()}">
            </div>
        </div>

        <div class="songs-section">
            <h4>🎵 Agregar canciones</h4>
            
            <div class="url-input-group">
                <div class="input-with-icon">
                    <i class="yt-icon">▶️</i>
                    <input type="text" id="song-url" 
                           placeholder="Pega aquí el enlace de YouTube...">
                </div>
                <button type="button" class="btn btn-add-song" id="add-song">
                    Agregar canción
                </button>
            </div>

            <div id="song-list" class="song-list">
                <div class="status-message">
                    <i class="music-icon">🎵</i>
                    <p>No hay canciones agregadas<br>
                    <small>Las canciones aparecerán aquí</small></p>
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button type="button" class="btn btn-cancel" 
                    onclick="this.closest('.album-form').remove()">Cancelar</button>
            <button type="button" class="btn btn-save" 
                    onclick="saveAlbum('${bandId}')">Guardar álbum</button>
        </div>
    `;

    // Limpiar lista anterior si existe
    const existing = document.querySelector('.album-form');
    if (existing) existing.remove();

    // Insertar al inicio de la lista de álbumes
    const albumsList = document.getElementById('albums-list');
    albumsList.insertBefore(form, albumsList.firstChild);

    // Configurar eventos
    setupFormEvents();
}

function setupFormEvents() {
    console.log('setupFormEvents called');
    const urlInput = document.getElementById('song-url');
    const addButton = document.getElementById('add-song');

    console.log('Form elements found:', { 
        urlInput: !!urlInput, 
        addButton: !!addButton 
    });

    // Evento para agregar canciones
    if (addButton) {
        console.log('Adding click event to addButton');
        addButton.onclick = () => {
            console.log('Add button clicked');
            if (urlInput) {
                addSong(urlInput.value);
            } else {
                console.error('urlInput not found when trying to add song');
            }
        };
    }
    
    if (urlInput) {
        urlInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSong(urlInput.value);
            }
        };
    }

    // Inicializar botón de "Agregar álbum"
    document.querySelectorAll('.album-form .btn-save').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const bandId = btn.closest('.album-form').dataset.bandId;
            saveAlbum(bandId);
        };
    });
}

function addSong(url) {
    console.log('📝 Agregando canción desde URL:', url);
    url = url.trim();
    
    if (!url) {
        showToast('⚠️ Ingresa una URL de YouTube', 'error');
        return;
    }

    if (!isValidYoutubeUrl(url)) {
        showToast('⚠️ URL de YouTube inválida', 'error');
        return;
    }

    const videoId = getYoutubeVideoId(url);
    console.log('ID de video extraído:', videoId);
    
    if (!videoId) {
        showToast('⚠️ No se pudo obtener el ID del video', 'error');
        return;
    }
    
    // Validar que no esté duplicado
    if (AlbumsModule.currentTracks.some(t => t.videoId === videoId)) {
        showToast('⚠️ Esta canción ya fue agregada', 'error');
        return;
    }
    
    // Intentar obtener información del video
    try {
        fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
                const videoInfo = data.items[0];
                if (videoInfo) {
                    const newTrack = {
                        id: `t${Date.now()}_${videoId}`,
                        videoId: videoId,
                        title: videoInfo.snippet.title,
                        duration: 180, // Por ahora usamos duración fija
                        url: url
                    };
                    AlbumsModule.currentTracks.push(newTrack);
                    renderCurrentSongs();
                    showToast('✅ Canción agregada exitosamente');
                }
            })
            .catch(error => {
                console.error('Error al obtener info del video:', error);
                // Si falla la API, agregamos con información básica
                const newTrack = {
                    id: `t${Date.now()}_${videoId}`,
                    videoId: videoId,
                    title: `Canción ${AlbumsModule.currentTracks.length + 1}`,
                    duration: 180,
                    url: url
                };
                AlbumsModule.currentTracks.push(newTrack);
                renderCurrentSongs();
                showToast('✅ Canción agregada');
            });
    } catch (error) {
        console.error('Error al agregar canción:', error);
        showToast('❌ Error al agregar la canción', 'error');
    }

    // Evitar duplicados
    if (AlbumsModule.currentTracks.some(t => t.videoId === videoId)) {
        showToast('⚠️ Esta canción ya fue agregada', 'error');
        return;
    }

    // Agregar canción directamente
    const newTrack = {
        url,
        videoId,
        title: `Canción ${AlbumsModule.currentTracks.length + 1}`,
        duration: 180 // duración por defecto 3 minutos
    };
    
    AlbumsModule.currentTracks.push(newTrack);
    document.getElementById('song-url').value = '';
    renderCurrentSongs();
    showToast('✅ Canción agregada');
}

function renderAlbums(bandId) {
    AlbumsModule.debug('renderAlbums', { bandId });
    
    const albumsList = document.getElementById('albums-list');
    if (!albumsList) {
        console.error('albums-list element not found');
        return;
    }
    
    // Usar la nueva función para obtener el ID de la banda
    if (!bandId) {
        bandId = getCurrentBandId();
        AlbumsModule.debug('Retrieved bandId', { bandId });
    }

    // Asegurar que STATE existe y tiene la estructura correcta
    if (!window.STATE) {
        window.STATE = {
            bands: [],
            albums: [],
            genres: new Set(),
            playlist: [],
            currentBandId: bandId
        };
    }

    // Asegurar que STATE.albums existe
    if (!Array.isArray(window.STATE.albums)) {
        window.STATE.albums = [];
        AlbumsModule.debug('STATE.albums initialized', []);
    }

    // Obtener los álbumes de la banda actual
    const bandAlbums = window.STATE.albums.filter(album => album.bandId === bandId);
    AlbumsModule.debug('Filtered albums for band', { bandId, albums: bandAlbums });

    // Crear el HTML para el botón de agregar
    const addButton = `
        <div class="card album add-album">
            <div class="thumb" style="cursor: pointer" onclick="showAlbumForm('${bandId}')">
                <span style="font-size: 24px">+</span><br>
                Agregar álbum
            </div>
        </div>
    `;

    // Renderizar álbumes
    let html = addButton;
    if (bandAlbums.length > 0) {
        html += bandAlbums.map(album => `
            <div class="card album" data-album-id="${album.id}">
                <img src="${album.cover}" alt="${album.title}" class="thumb">
                <div class="info">
                    <h4>${album.title}</h4>
                    <div class="meta">${album.year}</div>
                </div>
                <div class="actions">
                    <button type="button" class="btn btn-primary" 
                            onclick="window.verCanciones('${album.id}')">
                        Ver canciones
                    </button>
                    <button type="button" class="btn btn-secondary" 
                            onclick="window.agregarAPlaylist('${album.id}')">
                        Agregar todo a playlist
                    </button>
                </div>
            </div>
        `).join('');
    }

    albumsList.innerHTML = html;
    AlbumsModule.debug('Albums rendered', { bandId, albumCount: bandAlbums.length });
}

function renderSongs(albumId) {
    console.log('🎵 Renderizando canciones:', { albumId });
    
    // Obtener la sección de canciones
    const songsSection = document.getElementById('songs-section');
    if (!songsSection) {
        console.error('No se encontró la sección de canciones');
        return;
    }

    // Buscar el álbum y la banda
    const currentAlbum = window.STATE.albums.find(a => a.id === albumId);
    console.log('Álbum encontrado:', currentAlbum);
    
    if (!currentAlbum) {
        console.error('Album no encontrado:', albumId);
        console.log('Albums disponibles:', window.STATE.albums.map(a => ({ id: a.id, title: a.title })));
        return;
    }

    // Obtener la banda
    const currentBand = window.STATE.bands.find(b => b.id === currentAlbum.bandId);
    console.log('Banda encontrada:', currentBand);
    
    songsSection.innerHTML = `
        <div class="album-header">
            <img src="${currentAlbum.cover}" alt="${currentAlbum.title}" class="album-cover">
            <div class="album-info">
                <h3>${currentAlbum.title}</h3>
                <p>${currentBand ? currentBand.name : 'Banda'} · ${currentAlbum.year}</p>
            </div>
        </div>
        <div id="player-container" class="player-container">
            <div class="player">
                <h3>Reproductor</h3>
                <div id="youtube-player"></div>
                <div id="now-playing">Selecciona una canción para reproducir</div>
                <div class="player-controls">
                    <button id="play-btn" onclick="togglePlay()" disabled>▶️</button>
                    <button id="pause-btn" onclick="pauseTrack()" disabled>⏸️</button>
                    <button id="stop-btn" onclick="stopTrack()" disabled>⏹️</button>
                </div>
                <div class="progress">
                    <div id="progress-bar"></div>
                </div>
            </div>
        </div>
        <div class="songs-list">
            ${currentAlbum.tracks.map((track, index) => {
                    console.log('Renderizando track:', { track, albumId });
                    return `
                        <div class="song" data-track-id="${track.id}">
                            <div class="info">
                                <div class="title">${track.title || `Canción ${index + 1}`}</div>
                                <div class="duration">
                                    ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}
                                </div>
                            </div>
                            <div class="actions">
                                <button class="btn play" 
                                        onclick="playTrack('${currentAlbum.id}', '${track.id}')" 
                                        title="Reproducir">▶️</button>
                                <button class="btn add" 
                                        onclick="addToPlaylist('${currentAlbum.id}', '${track.id}')"
                                        title="Agregar a playlist">+</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div id="player-container" class="player-container">
                <div class="player">
                    <h3>Reproductor</h3>
                    <div id="youtube-player"></div>
                    <div id="now-playing">Selecciona una canción para reproducir</div>
                    <div class="player-controls">
                        <button id="play-btn" onclick="togglePlay()" disabled>▶️</button>
                        <button id="pause-btn" onclick="pauseTrack()" disabled>⏸️</button>
                        <button id="stop-btn" onclick="stopTrack()" disabled>⏹️</button>
                    </div>
                    <div class="progress">
                        <div id="progress-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Buscar el álbum
    const album = window.STATE.albums.find(a => a.id === albumId);
    if (!album) {
        console.error('No se encontró el álbum:', albumId);
        return;
    }

    // Buscar la banda
    const band = window.STATE.bands.find(b => b.id === album.bandId);
    AlbumsModule.debug('Album and band found', { album, band });
    
    // Renderizar la sección de canciones
    songsSection.innerHTML = `
        <div class="album-header">
            <img src="${album.cover}" alt="${album.title}" class="album-cover">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>${band ? band.name : 'Banda'} · ${album.year}</p>
            </div>
        </div>
        <div class="songs-list">
            ${album.tracks.map((track, index) => `
                <div class="song">
                    <div class="info">
                        <span class="title">${track.title}</span>
                        <span class="duration">${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}</span>
                    </div>
                    <div class="actions">
                        <button class="btn play" onclick="playTrack('${albumId}', '${track.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn add" onclick="addToPlaylist('${albumId}', '${track.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Activar la sección de canciones
    document.querySelector('.section.canciones')?.classList.add('active');
    AlbumsModule.debug('Songs rendered', { trackCount: album.tracks.length });
}

function renderCurrentSongs() {
    console.log('renderCurrentSongs called');
    const list = document.getElementById('song-list');
    console.log('song-list element found:', !!list);
    if (!list) {
        console.error('song-list element not found');
        return;
    }
    console.log('Current tracks:', AlbumsModule.currentTracks);

    if (AlbumsModule.currentTracks.length === 0) {
        list.innerHTML = '<div class="status-message">No hay canciones agregadas</div>';
        return;
    }

    list.innerHTML = AlbumsModule.currentTracks.map((track, index) => `
        <div class="song-item">
            <span class="title">🎵 ${track.title || 'Cargando...'}</span>
            <small class="duration">${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}</small>
            <button class="remove" onclick="removeSong(${index})">❌</button>
        </div>
    `).join('');
}

function removeSong(index) {
    AlbumsModule.currentTracks.splice(index, 1);
    renderCurrentSongs();
    showToast('🗑️ Canción eliminada');
}

function saveAlbum(bandId) {
    AlbumsModule.debug('saveAlbum called', { bandId });
    
    // Obtener el ID de la banda actual
    const actualBandId = bandId || getCurrentBandId();
    AlbumsModule.debug('Resolved bandId', { actualBandId });
    
    if (!actualBandId) {
        console.error('No hay bandId válido para guardar el álbum');
        showToast('Error: No se pudo identificar la banda', 'error');
        return;
    }
    
    // Asegurarnos de que STATE existe con la estructura correcta
    if (typeof window.STATE === 'undefined') {
        window.STATE = {
            bands: [],
            albums: [],
            genres: new Set(),
            playlist: [],
            currentBandId: actualBandId
        };
    }
    
    // Guardar el bandId en el STATE
    window.STATE.currentBandId = actualBandId;
    
    console.log('Current STATE:', window.STATE);
    
    const title = document.getElementById('album-title');
    const year = document.getElementById('album-year');
    
    console.log('Form elements:', { title, year });
    
    if (!title || !year) {
        console.error('Error: No se encontraron los elementos del formulario');
        showToast('Error: Formulario incompleto', 'error');
        return;
    }
    
    const titleValue = title.value.trim();
    const yearValue = year.value;

    if (!title) {
        showToast('⚠️ Ingresa el título del álbum', 'error');
        return;
    }

    if (!year) {
        showToast('⚠️ Ingresa el año del álbum', 'error');
        return;
    }

    if (AlbumsModule.currentTracks.length === 0) {
        showToast('⚠️ Agrega al menos una canción', 'error');
        return;
    }

    const album = {
        id: 'a' + Date.now(),
        bandId: actualBandId,
        title: titleValue,
        year: parseInt(yearValue),
        cover: `https://picsum.photos/seed/album${Date.now()}/600/400`,
        tracks: AlbumsModule.currentTracks.map((t, i) => ({
            id: `t${Date.now()}_${i}`,
            title: t.title || `Canción ${i + 1}`,
            duration: t.duration || 180, // duración por defecto 3 minutos
            youtubeId: t.videoId,
            url: t.url
        }))
    };

    // Asegurarnos de que STATE.albums es un array
    if (!Array.isArray(window.STATE.albums)) {
        window.STATE.albums = [];
    }
    
    // Guardar el álbum
    window.STATE.albums.push(album);
    AlbumsModule.debug('Album saved', { album });
    AlbumsModule.debug('Current STATE.albums', window.STATE.albums);
    
    // Guardar en localStorage para persistencia
    try {
        localStorage.setItem('albums', JSON.stringify(window.STATE.albums));
        AlbumsModule.debug('Albums saved to localStorage');
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        showToast('⚠️ Error al guardar el álbum', 'error');
    }
    
    // Limpiar y actualizar UI
    AlbumsModule.currentTracks = [];
    document.querySelector('.album-form')?.remove();
    
    // Forzar la actualización de la vista con el bandId correcto
    const bandIdToRender = actualBandId || getCurrentBandId();
    AlbumsModule.debug('Rendering albums for band', { bandIdToRender });
    renderAlbums(bandIdToRender);
    
    // Mostrar toast de éxito
    showToast('✅ Álbum guardado exitosamente');
    
    showToast('✅ Álbum guardado exitosamente');
}

// Helpers
function isValidYoutubeUrl(url) {
    // Acepta URLs con parámetros adicionales
    return /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=[a-zA-Z0-9_-]+|youtu\.be\/[a-zA-Z0-9_-]+)/.test(url);
}

function getYoutubeVideoId(url) {
    let videoId = null;
    
    // Para URLs del tipo youtube.com/watch?v=ID
    const watchUrlMatch = url.match(/[?&]v=([^&]+)/);
    if (watchUrlMatch) {
        videoId = watchUrlMatch[1];
    }
    
    // Para URLs del tipo youtu.be/ID
    const shortUrlMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortUrlMatch) {
        videoId = shortUrlMatch[1];
    }
    
    console.log('Video ID extraído:', videoId);
    return videoId;
}

function getVideoId(url) {
    return url.includes('youtu.be/') ? 
        url.split('youtu.be/')[1] : 
        url.split('v=')[1].split('&')[0];
}

// Funciones de control del reproductor
function enablePlayerControls() {
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('stop-btn').disabled = false;
}

function updatePlayerState(event) {
    // Estado del video de YouTube:
    // -1 (no iniciado)
    // 0 (terminado)
    // 1 (reproduciendo)
    // 2 (pausado)
    // 3 (almacenando en búfer)
    // 5 (video en cola)
    if (!event || !event.data) {
        console.warn('Evento de player inválido');
        return;
    }

    // Actualizar estado global
    window.STATE.isPlaying = event.data === YT.PlayerState.PLAYING;
    window.STATE.isPaused = event.data === YT.PlayerState.PAUSED;
    window.STATE.isBuffering = event.data === YT.PlayerState.BUFFERING;
    
    // Manejar cada estado
    switch (event.data) {
        case YT.PlayerState.UNSTARTED: // -1
            console.log('📼 Player: Sin iniciar');
            break;
            
        case YT.PlayerState.ENDED: // 0
            console.log('⏹️ Player: Video terminado');
            window.STATE.isPlaying = false;
            stopTrack();
            playNextTrack(); // Reproducir siguiente si existe
            break;
            
        case YT.PlayerState.PLAYING: // 1
            console.log('▶️ Player: Reproduciendo');
            updateProgress();
            updatePlayerControls(true);
            break;
            
        case YT.PlayerState.PAUSED: // 2
            console.log('⏸️ Player: Pausado');
            updatePlayerControls(false);
            break;
            
        case YT.PlayerState.BUFFERING: // 3
            console.log('🔄 Player: Cargando...');
            showBufferingIndicator();
            break;
            
        case YT.PlayerState.CUED: // 5
            console.log('📋 Player: Video en cola');
            break;
            
        default:
            console.warn('Estado desconocido:', event.data);
    }
}

function updatePlayerControls(isPlaying) {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (playBtn && pauseBtn) {
        playBtn.disabled = isPlaying;
        pauseBtn.disabled = !isPlaying;
    }
}

function showBufferingIndicator() {
    const nowPlaying = document.getElementById('now-playing');
    if (nowPlaying) {
        const currentText = nowPlaying.innerHTML;
        nowPlaying.innerHTML = currentText + ' <span class="buffering">🔄</span>';
        
        // Remover indicador después de 3 segundos
        setTimeout(() => {
            const indicator = nowPlaying.querySelector('.buffering');
            if (indicator) indicator.remove();
        }, 3000);
    }
}

function playNextTrack() {
    if (!window.STATE?.currentTrack || !window.STATE?.currentAlbum) return;
    
    const currentIndex = window.STATE.currentAlbum.tracks.findIndex(
        t => t.id === window.STATE.currentTrack.id
    );
    
    if (currentIndex > -1 && currentIndex < window.STATE.currentAlbum.tracks.length - 1) {
        const nextTrack = window.STATE.currentAlbum.tracks[currentIndex + 1];
        playTrack(window.STATE.currentAlbum.id, nextTrack.id);
    }
}

function togglePlay() {
    if (!STATE.youtubePlayer) return;
    if (STATE.isPlaying) {
        STATE.youtubePlayer.pauseVideo();
    } else {
        STATE.youtubePlayer.playVideo();
    }
}

function pauseTrack() {
    if (!STATE.youtubePlayer) return;
    STATE.youtubePlayer.pauseVideo();
}

function stopTrack() {
    if (!STATE.youtubePlayer) return;
    STATE.youtubePlayer.stopVideo();
    document.getElementById('progress-bar').style.width = '0%';
}

function renderPlaylist() {
    console.log('🎵 Renderizando playlist');
    
    const playlistElement = document.getElementById('playlist');
    if (!playlistElement) {
        console.warn('Elemento playlist no encontrado');
        return;
    }
    
    // Validar que existe la playlist
    if (!window.STATE.playlist) {
        window.STATE.playlist = [];
    }
    
    // Renderizar contenido
    if (window.STATE.playlist.length === 0) {
        playlistElement.innerHTML = `
            <div class="empty-playlist">
                <p>🎵 Tu playlist está vacía</p>
                <small>Agrega canciones usando el botón + en cada canción</small>
            </div>
        `;
        return;
    }
    
    playlistElement.innerHTML = `
        <div class="playlist-header">
            <h3>Mi Playlist</h3>
            <span class="count">${window.STATE.playlist.length} canciones</span>
        </div>
        <div class="playlist-tracks">
            ${window.STATE.playlist.map((track, index) => `
                <div class="playlist-item" data-track-id="${track.id}">
                    <span class="number">${index + 1}</span>
                    <div class="info">
                        <div class="title">${track.title}</div>
                        <div class="meta">${track.album} · ${track.artist || 'Artista'}</div>
                    </div>
                    <div class="actions">
                        <button class="btn play" onclick="playTrack('${track.albumId}', '${track.id}')">
                            ▶️
                        </button>
                        <button class="btn remove" onclick="removeFromPlaylist('${track.id}')">
                            ❌
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function removeFromPlaylist(trackId) {
    console.log('🗑️ Removiendo de playlist:', trackId);
    
    if (!window.STATE.playlist) return;
    
    const index = window.STATE.playlist.findIndex(t => t.id === trackId);
    if (index > -1) {
        window.STATE.playlist.splice(index, 1);
        
        // Guardar cambios
        try {
            localStorage.setItem('playlist', JSON.stringify(window.STATE.playlist));
            showToast('✅ Canción eliminada de la playlist');
            renderPlaylist();
        } catch (error) {
            console.error('Error al guardar playlist:', error);
            showToast('❌ Error al actualizar la playlist', 'error');
        }
    }
}

function addToPlaylist(albumId, trackId) {
    console.log('📝 Agregando a playlist:', { albumId, trackId });
    
    // Validar estado
    if (!window.STATE.playlist) {
        window.STATE.playlist = [];
    }
    
    // Buscar el álbum y la canción
    const album = window.STATE.albums.find(a => a.id === albumId);
    if (!album) {
        showToast('❌ Álbum no encontrado', 'error');
        return;
    }
    
    const track = album.tracks.find(t => t.id === trackId);
    if (!track) {
        showToast('❌ Canción no encontrada', 'error');
        return;
    }
    
    // Verificar si ya existe en la playlist
    if (window.STATE.playlist.some(t => t.id === track.id)) {
        showToast('⚠️ Esta canción ya está en la playlist', 'warning');
        return;
    }
    
    // Agregar a la playlist
    window.STATE.playlist.push({
        id: track.id,
        albumId: albumId,
        title: track.title,
        artist: album.artist,
        album: album.title,
        youtubeId: track.youtubeId
    });
    
    // Guardar en localStorage
    try {
        localStorage.setItem('playlist', JSON.stringify(window.STATE.playlist));
        showToast('✅ Canción agregada a la playlist');
        
        // Actualizar UI de la playlist si existe
        const playlistElement = document.getElementById('playlist');
        if (playlistElement) {
            renderPlaylist();
        }
        
    } catch (error) {
        console.error('Error al guardar playlist:', error);
        showToast('❌ Error al guardar la playlist', 'error');
    }
}

function updateProgress() {
    if (!STATE.youtubePlayer || !STATE.isPlaying) return;
    
    const duration = STATE.youtubePlayer.getDuration();
    const current = STATE.youtubePlayer.getCurrentTime();
    const progress = (current / duration) * 100;
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    
    if (STATE.isPlaying) {
        requestAnimationFrame(updateProgress);
    }
}

// Funciones de reproducción y playlist
function verCanciones(albumId) {
    console.log('🎸 Mostrando canciones del álbum:', albumId);
    
    // Asegurarse de que el STATE existe
    if (!window.STATE) {
        window.STATE = { currentAlbumId: null };
    }
    
    // Guardar el álbum actual
    window.STATE.currentAlbumId = albumId;
    
    // Obtener el contenedor de álbumes
    const albumsContainer = document.getElementById('albums-section');
    if (!albumsContainer) {
        console.error('No se encontró el contenedor de álbumes');
        return;
    }
    
    // Crear la estructura base directamente en el contenedor
    albumsContainer.innerHTML = `
        <div class="album-content">
            <div class="player-section">
                <div id="player-container">
                    <div id="youtube-player"></div>
                    <div id="now-playing">Selecciona una canción para reproducir</div>
                    <div class="controls">
                        <button id="play-btn" onclick="togglePlay()" disabled>▶️</button>
                        <button id="pause-btn" onclick="pauseTrack()" disabled>⏸️</button>
                        <button id="stop-btn" onclick="stopTrack()" disabled>⏹️</button>
                    </div>
                </div>
            </div>
            <div class="songs-list"></div>
        </div>
    `;
    
    // Renderizar las canciones y cargar la API de YouTube
    renderSongs(albumId);
    loadYouTubeAPI().catch(error => {
        console.error('Error al cargar la API de YouTube:', error);
        showToast('Error al cargar el reproductor', 'error');
    });
}

function agregarAPlaylist(albumId) {
    const album = STATE.albums.find(a => a.id === albumId);
    if (!album) return;
    
    album.tracks.forEach(track => {
        STATE.playlist.push({
            id: track.id,
            albumId: albumId,
            title: track.title,
            duration: track.duration,
            youtubeId: track.youtubeId
        });
    });
    
    renderPlaylist();
    showToast('✅ Álbum agregado a la playlist');
}

async function playTrack(albumId, trackId) {
    console.log('🎵 Intentando reproducir:', { albumId, trackId });

    try {
        // Validar estado inicial
        if (!window.STATE?.albums) {
            throw new Error('Estado de la aplicación no válido');
        }

        // Buscar álbum y track
        const currentAlbum = window.STATE.albums.find(a => a.id === albumId);
        if (!currentAlbum) {
            throw new Error('No se encontró el álbum');
        }

        const currentTrack = currentAlbum.tracks.find(t => t.id === trackId);
        if (!currentTrack) {
            throw new Error('No se encontró la canción');
        }

        // Asegurar que tenemos un ID de YouTube válido
        const videoId = currentTrack.youtubeId || 
            (currentTrack.url && getYoutubeVideoId(currentTrack.url));
        
        if (!videoId) {
            throw new Error('No se pudo obtener el ID del video');
        }

        // Actualizar interfaz
        updateNowPlaying(currentTrack, currentAlbum);
        console.log('Reproduciendo:', {
            album: currentAlbum.title,
            track: currentTrack.title,
            videoId
        });

        // Asegurar que la API está cargada
        if (typeof YT === 'undefined' || !YT.Player) {
            showToast('Cargando reproductor...', 'info');
            await loadYouTubeAPI();
        }

        // Obtener o crear el contenedor del player
        const playerContainer = document.getElementById('player-container');
        if (!playerContainer) {
            throw new Error('No se encontró el contenedor del reproductor');
        }

        // Obtener o crear el div del player
        let playerDiv = document.getElementById('youtube-player');
        if (!playerDiv) {
            playerDiv = document.createElement('div');
            playerDiv.id = 'youtube-player';
            playerContainer.insertBefore(playerDiv, playerContainer.firstChild);
        }

        // Inicializar o actualizar el player
        if (!window.STATE.youtubePlayer) {
            window.STATE.youtubePlayer = new YT.Player('youtube-player', {
                height: '1',
                width: '1',
                videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    playsinline: 1
                },
                events: {
                    'onReady': event => {
                        console.log('Player listo');
                        event.target.playVideo();
                        enablePlayerControls();
                    },
                    'onStateChange': updatePlayerState,
                    'onError': event => {
                        console.error('Error del reproductor:', event.data);
                        showToast('Error al reproducir el video', 'error');
                    }
                }
            });
        } else {
            // Actualizar video en player existente
            window.STATE.youtubePlayer.loadVideoById(videoId);
        }

        // Actualizar estado
        window.STATE.currentTrack = currentTrack;
        window.STATE.currentAlbum = currentAlbum;
        window.STATE.isPlaying = true;

        // Actualizar UI
        enablePlayerControls();
        highlightCurrentTrack(trackId);

    } catch (error) {
        console.error('Error al reproducir:', error.message);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Funciones auxiliares
function updateNowPlaying(track, album) {
    const nowPlaying = document.getElementById('now-playing');
    if (nowPlaying) {
        nowPlaying.innerHTML = `
            <div class="now-playing-info">
                <strong>${track.title}</strong>
                <span>${album.title}</span>
            </div>
        `;
    }
}

function loadYouTubeAPI() {
    return new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
            resolve();
            return;
        }

        // Función que YouTube llamará cuando la API esté lista
        window.onYouTubeIframeAPIReady = function() {
            console.log('API de YouTube cargada');
            resolve();
        };

        // Cargar la API de YouTube
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = () => {
            console.error('Error al cargar la API de YouTube');
            reject(new Error('No se pudo cargar la API de YouTube'));
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
}

function initOrUpdatePlayer(track) {
    // Verificar que tenemos un ID de video válido
    if (!track.youtubeId) {
        console.error('No hay ID de video para reproducir');
        return;
    }

    // Asegurarnos de que el div del player existe
    let playerDiv = document.getElementById('youtube-player');
    const playerContainer = document.querySelector('.player');

    if (!playerDiv) {
        // Crear nuevo player
        playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        playerContainer.insertBefore(playerDiv, 
            document.getElementById('now-playing') || playerContainer.firstChild);

        // Inicializar el player de YouTube
        window.STATE.youtubePlayer = new YT.Player('youtube-player', {
            height: '200',
            width: '100%',
            videoId: track.youtubeId,
            playerVars: {
                autoplay: 1,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1,
                origin: window.location.origin,
                fs: 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': updatePlayerState,
                'onError': onPlayerError
            }
        });
    } else if (window.STATE.youtubePlayer) {
        // Actualizar video existente
        window.STATE.youtubePlayer.loadVideoById({
            videoId: track.youtubeId,
            startSeconds: 0,
            suggestedQuality: 'default'
        });
    }
}

function onPlayerReady(event) {
    console.log('🎵 Player listo');
    event.target.playVideo();
    enablePlayerControls();
}

function onPlayerError(event) {
    const errors = {
        2: 'ID de video inválido',
        5: 'Error de HTML5',
        100: 'Video no encontrado',
        101: 'Video no reproducible',
        150: 'Video no reproducible'
    };
    const message = errors[event.data] || 'Error desconocido';
    console.error(`Error del player: ${message} (${event.data})`);
    showToast(`❌ ${message}`, 'error');
}

function highlightCurrentTrack(trackId) {
    // Remover highlight anterior
    document.querySelectorAll('.song').forEach(song => {
        song.classList.remove('playing');
    });
    
    // Agregar highlight al actual
    const currentSong = document.querySelector(`[data-track-id="${trackId}"]`);
    if (currentSong) {
        currentSong.classList.add('playing');
    }
}



// Exponer todas las funciones necesarias al scope global
Object.assign(window, {
    showAlbumForm,
    removeSong,
    saveAlbum,
    verCanciones,
    agregarAPlaylist,
    playTrack,
    togglePlay,
    pauseTrack,
    stopTrack,
    addToPlaylist,
    removeFromPlaylist,
    renderPlaylist
});