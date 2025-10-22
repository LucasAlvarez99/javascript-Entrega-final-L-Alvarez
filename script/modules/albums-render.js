// ============================================
// ALBUMS-RENDER.JS - Renderizar UI
// VERSIÓN LIMPIA Y FUNCIONAL
// ============================================

console.log('🎨 [albums-render.js] Iniciando módulo de renderizado...');

// ============================================
// RENDERIZAR ÁLBUMES
// ============================================

function renderAlbums(bandId) {
    console.log('');
    console.log('🎨 ==========================================');
    console.log('🎨 [albums-render] RENDERIZAR ÁLBUMES');
    console.log('🎨 ==========================================');
    console.log('📊 [albums-render] BandId recibido:', bandId);
    
    const albumsList = document.getElementById('albums-list');
    if (!albumsList) {
        console.error('❌ [albums-render] albums-list no encontrado');
        return;
    }
    
    console.log('✅ [albums-render] Contenedor encontrado');
    
    // Si no hay bandId, intentar obtenerlo
    if (!bandId) {
        bandId = window.albumsCore.getCurrentBandId();
        console.log('📊 [albums-render] BandId obtenido:', bandId);
    }
    
    // Guardar en STATE
    if (bandId && window.STATE) {
        window.STATE.currentBandId = bandId;
        console.log('💾 [albums-render] BandId guardado en STATE');
    }
    
    // Verificar banda
    const band = window.albumsCore.findBandById(bandId);
    if (!band) {
        console.error('❌ [albums-render] BANDA NO ENCONTRADA');
        console.log('📊 [albums-render] Bandas disponibles:', window.STATE.bands.map(b => ({ id: b.id, name: b.name })));
        albumsList.innerHTML = `
            <div class="card" style="background: rgba(244,67,54,0.1); border: 2px solid #f44336; padding: 20px;">
                <h3 style="color: #f44336;">❌ Error: Banda no encontrada</h3>
                <p style="color: #fff;">ID buscado: ${bandId}</p>
                <p style="color: #9aa4b2;">Verifica la consola para más detalles</p>
            </div>
        `;
        return;
    }
    
    console.log('✅ [albums-render] Banda encontrada:', band.name);
    
    // Obtener TODOS los álbumes
    const allAlbums = window.STATE.albums || [];
    console.log('📊 [albums-render] Total álbumes en STATE:', allAlbums.length);
    
    // Filtrar álbumes de esta banda
    const bandAlbums = allAlbums.filter(a => a.bandId === bandId);
    console.log('📊 [albums-render] Álbumes de esta banda:', bandAlbums.length);
    
    if (bandAlbums.length > 0) {
        console.log('📀 [albums-render] Álbumes encontrados:');
        bandAlbums.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.title} (${a.tracks?.length || 0} canciones)`);
        });
    }
    
    // Crear HTML
    let html = '';
    
    // Botón para agregar álbum
    if (bandId) {
        console.log('➕ [albums-render] Agregando botón de crear álbum');
        html += `
            <div class="card album add-album" onclick="window.showAlbumForm('${bandId}')" style="
                cursor: pointer;
                background: rgba(255,167,38,0.1);
                border: 2px dashed var(--accent);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 200px;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">➕</div>
                    <div style="color: var(--accent); font-weight: 600;">Agregar álbum</div>
                </div>
            </div>
        `;
    }
    
    // Renderizar álbumes
    if (bandAlbums.length === 0) {
        console.log('ℹ️ [albums-render] No hay álbumes');
        html += `
            <div class="card" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💿</div>
                    <p style="margin: 0 0 8px 0;">No hay álbumes</p>
                    <small>Haz clic en ➕ para agregar uno</small>
                </div>
            </div>
        `;
    } else {
        console.log('🏗️ [albums-render] Generando HTML...');
        bandAlbums.forEach((album, index) => {
            console.log(`  🏗️ Card ${index + 1}: ${album.title}`);
            html += createAlbumCardHTML(album, band);
        });
    }
    
    // Insertar HTML
    albumsList.innerHTML = html;
    console.log('✅ [albums-render] HTML insertado');
    console.log('🎨 ==========================================');
    console.log('');
    
    // Scroll
    const albumsSection = document.getElementById('albums-section');
    if (albumsSection) {
        albumsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// CREAR HTML DE TARJETA DE ÁLBUM
// ============================================

function createAlbumCardHTML(album, band) {
    const bandName = band ? band.name : 'Banda';
    const trackCount = album.tracks ? album.tracks.length : 0;
    
    return `
        <div class="card album" data-album-id="${album.id}" style="
            background: var(--card);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid var(--border);
        ">
            <div class="thumb" style="
                width: 100%;
                height: 150px;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 12px;
            ">
                <img src="${album.cover}" 
                     alt="${album.title}" 
                     style="width:100%;height:100%;object-fit:cover;">
            </div>
            
            <h4 style="margin: 0 0 4px 0; color: #fff;">${album.title}</h4>
            <div class="meta" style="color: #9aa4b2; font-size: 0.9rem; margin-bottom: 4px;">
                ${bandName} · ${album.year}
            </div>
            <small style="color: #9aa4b2;">🎵 ${trackCount} canciones</small>
            
            <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.verCanciones('${album.id}')" 
                            class="btn" 
                            style="
                                flex: 1;
                                padding: 10px;
                                background: rgba(33,150,243,0.2);
                                color: #2196f3;
                                border: 1px solid #2196f3;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            ">
                        🎵 Ver
                    </button>
                    <button onclick="window.showAddSongsModal('${album.id}')" 
                            class="btn"
                            style="
                                flex: 1;
                                padding: 10px;
                                background: var(--accent);
                                color: #000;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            ">
                        ➕ Canciones
                    </button>
                </div>
                <button onclick="window.agregarAlbumAPlaylist('${album.id}')"
                        class="btn"
                        style="
                            width: 100%;
                            padding: 10px;
                            background: rgba(76,175,80,0.2);
                            color: #4caf50;
                            border: 1px solid #4caf50;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                    📋 Agregar a Playlist
                </button>
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZAR CANCIONES
// ============================================

function renderSongs(albumId) {
    console.log('🎵 [albums-render] renderSongs llamado');
    console.log('📊 [albums-render] Album ID:', albumId);
    
    const songsSection = document.getElementById('songs-section');
    if (!songsSection) {
        console.error('❌ [albums-render] songs-section no encontrado');
        return;
    }
    
    const album = window.albumsCore.findAlbumById(albumId);
    if (!album) {
        console.error('❌ [albums-render] Álbum no encontrado');
        songsSection.innerHTML = `<div class="card">❌ Álbum no encontrado</div>`;
        return;
    }
    
    console.log('✅ [albums-render] Álbum encontrado:', album.title);
    
    const band = window.albumsCore.findBandById(album.bandId);
    const bandName = band ? band.name : 'Banda';
    
    songsSection.innerHTML = `
        <div class="album-header" style="
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
            padding: 24px;
            background: rgba(255,167,38,0.1);
            border-radius: 12px;
        ">
            <img src="${album.cover}" 
                 alt="${album.title}" 
                 style="width: 150px; height: 150px; border-radius: 12px; object-fit: cover;">
            <div>
                <h3 style="margin: 0 0 8px 0; color: var(--accent);">${album.title}</h3>
                <p style="margin: 0 0 4px 0; color: #9aa4b2;">💿 ${bandName} · ${album.year}</p>
                <small style="color: #9aa4b2;">🎵 ${album.tracks.length} canciones</small>
            </div>
        </div>
        
        <div class="songs-list" style="display: flex; flex-direction: column; gap: 8px;">
            ${album.tracks.map((track, index) => `
                <div class="song" data-track-id="${track.id}" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                ">
                    <div>
                        <div style="color: #fff; font-weight: 500;">${track.title}</div>
                        <small style="color: #9aa4b2;">⏱️ ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}</small>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="playTrack('${album.id}', '${track.id}')" 
                                class="btn" 
                                style="padding: 8px 16px; background: var(--accent); color: #000; border: none; border-radius: 6px; cursor: pointer;">
                            ▶️
                        </button>
                        <button onclick="addToPlaylist('${album.id}', '${track.id}')"
                                class="btn"
                                style="padding: 8px 16px; background: rgba(76,175,80,0.2); color: #4caf50; border: 1px solid #4caf50; border-radius: 6px; cursor: pointer;">
                            ➕
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    songsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// OTRAS FUNCIONES
// ============================================

function renderPlaylist() {
    console.log('📋 [albums-render] renderPlaylist - pendiente');
}

function updateNowPlaying(track, album) {
    console.log('🎵 [albums-render] updateNowPlaying');
}

function highlightCurrentTrack(trackId) {
    console.log('🎨 [albums-render] highlightCurrentTrack');
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

window.verCanciones = renderSongs;
window.agregarAlbumAPlaylist = function(albumId) {
    console.log('➕ Agregar álbum completo a playlist:', albumId);
    window.albumsCore.showToast('Función en desarrollo', 'info');
};

console.log('✅ [albums-render.js] Módulo cargado');
console.log('📦 [albums-render.js] Funciones:', Object.keys(window.albumsRender));