// Gestión de álbumes y canciones de YouTube
console.log('📝 Iniciando albums.js');

// Variables globales
window.currentTracks = [];

// Función de debug
function debug(label, data) {
    console.log(`🔍 DEBUG [${label}]:`, data);
    return data;
}

// Asegurar que STATE existe
function ensureState() {
    console.log('🔄 Verificando STATE...');
    if (!window.STATE) {
        console.log('❌ STATE no existe, creando...');
        window.STATE = {
            bands: [],
            albums: [],
            currentBandId: null
        };
    }
    debug('STATE actual', window.STATE);
    return window.STATE;
}

// Mostrar formulario de álbum
function showAlbumForm(bandId) {
    debug('showAlbumForm llamado con', { bandId });
    ensureState();
    
    // Guardar bandId en STATE
    window.STATE.currentBandId = bandId;
    debug('bandId guardado en STATE', window.STATE.currentBandId);

    const form = document.createElement('div');
    form.className = 'album-form panel';
    form.dataset.bandId = bandId;
    
    debug('Creando formulario para banda', bandId);
    
    form.innerHTML = `
        <h3>Agregar álbum</h3>
        <div class="form-row">
            <div class="form-group">
                <label for="album-title">Título del álbum</label>
                <input type="text" id="album-title" required>
            </div>
            <div class="form-group">
                <label for="album-year">Año</label>
                <input type="number" id="album-year" required min="1900" max="2025" value="${new Date().getFullYear()}">
            </div>
        </div>

        <div class="songs-section">
            <h4>Canciones desde YouTube</h4>
            <div class="url-input-group">
                <input type="text" id="song-url" placeholder="URL de YouTube">
                <button type="button" class="btn" id="add-song">Agregar canción</button>
            </div>
            <div id="song-list" class="song-list"></div>
        </div>

        <div class="form-actions">
            <button type="button" class="btn btn-save" onclick="saveAlbum('${bandId}')">Guardar álbum</button>
            <button type="button" class="btn btn-cancel" onclick="this.closest('.album-form').remove()">Cancelar</button>
        </div>
    `;

    debug('Buscando contenedor de álbumes');
    const albumsList = document.getElementById('albums-list');
    if (!albumsList) {
        console.error('❌ No se encontró el contenedor de álbumes');
        return;
    }

    // Insertar formulario
    if (albumsList.firstChild) {
        albumsList.insertBefore(form, albumsList.firstChild);
    } else {
        albumsList.appendChild(form);
    }
    
    debug('Formulario insertado');
    setupFormEvents();
}

// Agregar canción
function addSong(url) {
    debug('addSong llamado con', { url });
    
    url = url.trim();
    if (!url) {
        console.warn('⚠️ URL vacía');
        alert('Por favor ingresa una URL de YouTube');
        return;
    }

    const videoId = extractVideoId(url);
    debug('ID de video extraído', { videoId });
    
    if (!videoId) {
        console.warn('⚠️ URL inválida');
        alert('URL de YouTube inválida');
        return;
    }

    // Agregar canción
    window.currentTracks.push({
        url: url,
        videoId: videoId,
        title: `Video ${window.currentTracks.length + 1}`,
        duration: 180
    });

    debug('Tracks actuales', window.currentTracks);
    
    // Limpiar y actualizar
    document.getElementById('song-url').value = '';
    renderCurrentSongs();
    debug('Canción agregada y lista renderizada');
}

// Extraer ID de video
function extractVideoId(url) {
    debug('Extrayendo ID de', { url });
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Renderizar canciones actuales
function renderCurrentSongs() {
    debug('Renderizando canciones actuales', window.currentTracks);
    
    const list = document.getElementById('song-list');
    if (!list) {
        console.error('❌ No se encontró la lista de canciones');
        return;
    }

    list.innerHTML = window.currentTracks.length === 0 ? 
        '<div class="status-message">No hay canciones agregadas</div>' :
        window.currentTracks.map((track, index) => `
            <div class="song-item">
                <span class="title">🎵 ${track.title}</span>
                <button class="remove" onclick="removeSong(${index})">❌</button>
            </div>
        `).join('');
}

// Guardar álbum
function saveAlbum(bandId) {
    debug('saveAlbum llamado con', { bandId });
    ensureState();

    const title = document.getElementById('album-title')?.value?.trim();
    const year = document.getElementById('album-year')?.value;
    
    debug('Datos del formulario', { title, year, tracksCount: window.currentTracks.length });

    // Validaciones
    if (!title || !year) {
        console.warn('⚠️ Faltan campos requeridos');
        alert('Por favor completa todos los campos');
        return;
    }

    if (window.currentTracks.length === 0) {
        console.warn('⚠️ No hay canciones');
        alert('Agrega al menos una canción');
        return;
    }

    // Crear álbum
    const album = {
        id: 'a' + Date.now(),
        bandId: bandId,
        title: title,
        year: parseInt(year),
        cover: `https://picsum.photos/seed/album${Date.now()}/600/400`,
        tracks: window.currentTracks.map((t, i) => ({
            id: `t${Date.now()}_${i}`,
            title: t.title,
            duration: t.duration,
            youtubeId: t.videoId,
            url: t.url
        }))
    };

    debug('Álbum creado', album);

    // Guardar en STATE
    if (!window.STATE.albums) {
        window.STATE.albums = [];
    }
    window.STATE.albums.push(album);
    debug('Albums en STATE', window.STATE.albums);

    // Guardar en localStorage
    try {
        localStorage.setItem('albums', JSON.stringify(window.STATE.albums));
        debug('Álbumes guardados en localStorage');
    } catch (e) {
        console.error('❌ Error al guardar en localStorage', e);
    }

    // Limpiar y actualizar
    window.currentTracks = [];
    document.querySelector('.album-form')?.remove();
    alert('✅ Álbum guardado exitosamente');
    
    // Renderizar álbumes
    renderAlbums(bandId);
}

// Configurar eventos
function setupFormEvents() {
    debug('Configurando eventos del formulario');
    
    const addButton = document.getElementById('add-song');
    const urlInput = document.getElementById('song-url');
    
    debug('Elementos encontrados', { 
        addButton: !!addButton, 
        urlInput: !!urlInput 
    });

    if (addButton && urlInput) {
        addButton.onclick = () => addSong(urlInput.value);
        urlInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSong(urlInput.value);
            }
        };
        debug('Eventos configurados correctamente');
    } else {
        console.error('❌ No se encontraron elementos del formulario');
    }
}

// Eliminar canción
function removeSong(index) {
    debug('Eliminando canción', { index });
    window.currentTracks.splice(index, 1);
    renderCurrentSongs();
}

// Renderizar álbumes
function renderAlbums(bandId) {
    debug('renderAlbums llamado con', { bandId });
    ensureState();

    const container = document.getElementById('albums-list');
    if (!container) {
        console.error('❌ No se encontró el contenedor de álbumes');
        return;
    }

    // Filtrar álbumes
    const albums = window.STATE.albums || [];
    const bandAlbums = albums.filter(a => a.bandId === bandId);
    debug('Álbumes filtrados', { total: albums.length, forBand: bandAlbums.length });

    // Generar HTML
    let html = bandId ? `
        <div class="card album">
            <div class="thumb" style="cursor: pointer" onclick="showAlbumForm('${bandId}')">
                <span style="font-size: 24px">+</span><br>
                Agregar álbum
            </div>
        </div>
    ` : '';

    // Agregar álbumes
    bandAlbums.forEach(album => {
        html += `
            <div class="card album">
                <img src="${album.cover}" alt="${album.title}" class="thumb">
                <h4>${album.title}</h4>
                <div class="meta">${album.year}</div>
                <div class="actions">
                    <button class="btn" onclick="showAlbumTracks('${album.id}')">Ver canciones</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    debug('Álbumes renderizados');
}

// Exponer funciones necesarias
window.showAlbumForm = showAlbumForm;
window.addSong = addSong;
window.removeSong = removeSong;
window.saveAlbum = saveAlbum;
window.renderAlbums = renderAlbums;

console.log('✅ albums.js cargado completamente');