/* app.js - La Disquera - VERSIÓN FINAL ARREGLADA
   Arregla el problema de bandId no encontrado
*/

console.log('🎸 [app.js] Iniciando...');

const STATE = {
  bands: [],
  albums: [],
  genres: new Set(),
  playlist: [],
  currentBandId: null,
  currentAlbumId: null,
  currentTrack: null,
  isPlaying: false,
  progressTimer: null,
  youtubePlayer: null,
  tempYoutubeLinks: []
};

const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

/* ------------------ FETCH / CARGA DE DATOS ------------------ */
async function loadData() {
  console.log('📦 [app.js] Cargando datos...');
  
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('No se pudo cargar data.json');
    const data = await res.json();
    
    console.log('✅ [app.js] data.json cargado');
    console.log('📊 [app.js] Bandas del JSON:', data.bands.length);
    console.log('📊 [app.js] Álbumes del JSON:', data.albums.length);

    const storedBands = JSON.parse(localStorage.getItem('disquera_bands') || '[]');
    console.log(`📊 [app.js] ${storedBands.length} bandas guardadas encontradas`);
    
    STATE.bands = [...data.bands, ...storedBands];
    STATE.albums = data.albums; // ✅ IMPORTANTE: Cargar álbumes del JSON
    STATE.bands.forEach(b => STATE.genres.add(b.genre));
    
    console.log(`✅ [app.js] ${STATE.bands.length} bandas cargadas en total`);
    console.log(`✅ [app.js] ${STATE.albums.length} álbumes cargados en total`);
    
    return data;
  } catch (error) {
    console.error('❌ [app.js] Error al cargar datos:', error);
    STATE.bands = [];
    STATE.albums = [];
    return { bands: [], albums: [] };
  }
}

/* ------------------ GUARDAR / BORRAR BANDAS ------------------ */
function saveBandsToLocalStorage() {
  console.log('💾 [app.js] Guardando bandas personalizadas...');
  
  try {
    const baseIDs = new Set(['b1','b2','b3']);
    const customBands = STATE.bands.filter(b => !baseIDs.has(b.id));
    localStorage.setItem('disquera_bands', JSON.stringify(customBands));
    
    console.log(`✅ [app.js] ${customBands.length} bandas guardadas`);
  } catch (error) {
    console.error('❌ [app.js] Error al guardar bandas:', error);
  }
}

/* ------------------ YOUTUBE UTILS ------------------ */
function isValidYoutubeUrl(url) {
  const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return pattern.test(url);
}

function getYoutubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function addYoutubeLink() {
  console.log('📹 [app.js] addYoutubeLink llamado');
  
  const input = $('#youtube-url');
  if (!input) {
    console.error('❌ [app.js] Input de YouTube no encontrado');
    return;
  }
  
  const url = input.value.trim();
  console.log('📊 [app.js] URL:', url);
  
  if (!url) {
    window.albumsCore.showToast('⚠️ Ingresa una URL de YouTube', 'warning');
    return;
  }
  
  if (!isValidYoutubeUrl(url)) {
    window.albumsCore.showToast('⚠️ URL de YouTube inválida', 'error');
    return;
  }
  
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    window.albumsCore.showToast('⚠️ No se pudo extraer el ID del video', 'error');
    return;
  }
  
  console.log('✅ [app.js] Video ID extraído:', videoId);
  
  if (!Array.isArray(STATE.tempYoutubeLinks)) {
    STATE.tempYoutubeLinks = [];
  }
  
  if (STATE.tempYoutubeLinks.some(link => link.videoId === videoId)) {
    window.albumsCore.showToast('⚠️ Este video ya fue agregado', 'warning');
    return;
  }
  
  STATE.tempYoutubeLinks.push({
    url: url,
    videoId: videoId
  });
  
  console.log(`✅ [app.js] Video agregado. Total: ${STATE.tempYoutubeLinks.length}`);
  
  renderYoutubeLinks();
  input.value = '';
  window.albumsCore.showToast('✅ Video agregado', 'success');
}

function renderYoutubeLinks() {
  console.log('🎨 [app.js] renderYoutubeLinks llamado');
  
  const container = $('#youtube-list');
  if (!container) {
    console.error('❌ [app.js] Contenedor youtube-list no encontrado');
    return;
  }
  
  if (!STATE.tempYoutubeLinks || !Array.isArray(STATE.tempYoutubeLinks)) {
    STATE.tempYoutubeLinks = [];
  }
  
  console.log(`📊 [app.js] Renderizando ${STATE.tempYoutubeLinks.length} videos`);
  
  if (STATE.tempYoutubeLinks.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">No hay videos agregados</p>';
    return;
  }
  
  container.innerHTML = STATE.tempYoutubeLinks.map((link, index) => `
    <div class="song-preview-item" style="
      background: rgba(255,167,38,0.1);
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid var(--accent);
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.2rem;">🎵</span>
        <div>
          <div style="color: #fff; font-weight: 500;">Canción ${index + 1}</div>
          <small style="color: #9aa4b2;">Solo audio del video</small>
        </div>
      </div>
      <button class="btn" 
              onclick="removeYoutubeLink(${index})"
              style="
                background: rgba(244,67,54,0.2);
                color: #f44336;
                padding: 6px 12px;
                font-size: 0.9rem;
              ">
        Eliminar
      </button>
    </div>
  `).join('');
  
  console.log('✅ [app.js] Videos renderizados (solo audio)');
}

function removeYoutubeLink(index) {
  console.log('🗑️ [app.js] Removiendo video:', index);
  
  if (!STATE.tempYoutubeLinks || !Array.isArray(STATE.tempYoutubeLinks)) {
    return;
  }
  
  if (index < 0 || index >= STATE.tempYoutubeLinks.length) {
    return;
  }
  
  STATE.tempYoutubeLinks.splice(index, 1);
  console.log(`✅ [app.js] Video removido. Quedan: ${STATE.tempYoutubeLinks.length}`);
  
  renderYoutubeLinks();
  window.albumsCore.showToast('🗑️ Video eliminado', 'info');
}

// Vista previa de imagen
const bandImgInput = $('#band-img');
if (bandImgInput) {
  bandImgInput.addEventListener('change', e => {
    console.log('🖼️ [app.js] Imagen seleccionada');
    const file = e.target.files[0];
    const preview = $('#preview-img');
    
    if (file && preview) {
      const reader = new FileReader();
      reader.onload = ev => {
        preview.src = ev.target.result;
        preview.classList.remove('hidden');
        console.log('✅ [app.js] Vista previa actualizada');
      };
      reader.readAsDataURL(file);
    } else if (preview) {
      preview.classList.add('hidden');
    }
  });
}

function deleteBand(id) {
  console.log('🗑️ [app.js] Eliminando banda:', id);
  
  const band = STATE.bands.find(b => b.id === id);
  if (!band) return;
  
  if (window.modalSystem && window.modalSystem.deleteBand) {
    window.modalSystem.deleteBand(band.name, () => {
      STATE.bands = STATE.bands.filter(b => b.id !== id);
      saveBandsToLocalStorage();
      renderBands();
      
      console.log('✅ [app.js] Banda eliminada');
      window.albumsCore.showToast(`🗑️ Banda "${band.name}" eliminada`, 'info');
    });
  } else {
    if (confirm(`¿Seguro que querés eliminar la banda "${band.name}"?`)) {
      STATE.bands = STATE.bands.filter(b => b.id !== id);
      saveBandsToLocalStorage();
      renderBands();
      window.albumsCore.showToast(`🗑️ Banda "${band.name}" eliminada`, 'info');
    }
  }
}

/* ------------------ RENDERS ------------------ */
function renderGenres() {
  console.log('🎨 [app.js] Renderizando géneros...');
  
  const sel = $('#genre-filter');
  if (!sel) return;
  
  sel.innerHTML = `<option value="">Todos los géneros</option>`;
  Array.from(new Set(STATE.bands.map(b => b.genre))).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    sel.appendChild(opt);
  });
  
  console.log('✅ [app.js] Géneros renderizados');
}

function renderBands(filterText = '', genre = '') {
  console.log('🎨 [app.js] Renderizando bandas...');
  console.log('📊 [app.js] Filtros:', { filterText, genre });
  console.log('📊 [app.js] Total bandas en STATE:', STATE.bands.length);
  
  const container = $('#bands-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  const list = STATE.bands.filter(b => {
    const matchesText = (b.name + ' ' + (b.bio || '')).toLowerCase().includes(filterText.toLowerCase());
    const matchesGenre = !genre || b.genre === genre;
    return matchesText && matchesGenre;
  });
  
  console.log(`📊 [app.js] ${list.length} bandas filtradas`);
  
  if (list.length === 0) {
    container.innerHTML = `<div class="card">No hay bandas</div>`;
    return;
  }

  list.forEach(b => {
    console.log(`  🎸 Renderizando banda: ${b.name} (ID: ${b.id})`); // ✅ LOG IMPORTANTE
    
    const node = document.createElement('div');
    node.className = 'card band';
    node.innerHTML = `
      <div class="thumb">
        <img src="${b.img || 'https://picsum.photos/seed/default/400/250'}" 
             alt="${b.name}" 
             style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>
      </div>
      <h3>${b.name}</h3>
      <div class="meta">${b.genre}</div>
      <small style="color:#aaa">${b.bio || ''}</small>
      ${b.youtube && b.youtube.length > 0 ? `
        <div style="margin-top:8px; padding:8px; background:rgba(255,167,38,0.1); border-radius:6px;">
          <small style="color:var(--accent);">🎵 ${b.youtube.length} canciones (solo audio)</small>
        </div>
      ` : ''}
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn view-albums" data-band="${b.id}">Ver álbumes</button>
        <button class="btn delete-band" data-band="${b.id}">Eliminar</button>
      </div>
    `;
    container.appendChild(node);
  });

  // ✅ EVENTOS - CRÍTICO
  $all('.view-albums').forEach(btn => {
    btn.onclick = e => {
      const bandId = e.currentTarget.dataset.band;
      console.log('👁️ [app.js] ========================================');
      console.log('👁️ [app.js] CLICK EN VER ÁLBUMES');
      console.log('👁️ [app.js] Band ID del botón:', bandId);
      console.log('👁️ [app.js] ========================================');
      
      // ✅ GUARDAR EN STATE
      STATE.currentBandId = bandId;
      console.log('💾 [app.js] currentBandId guardado en STATE:', STATE.currentBandId);
      
      // ✅ VERIFICAR QUE LA BANDA EXISTE
      const band = STATE.bands.find(b => b.id === bandId);
      if (band) {
        console.log('✅ [app.js] Banda encontrada:', band.name);
      } else {
        console.error('❌ [app.js] Banda NO encontrada con ID:', bandId);
        console.log('📊 [app.js] Bandas disponibles:', STATE.bands.map(b => ({ id: b.id, name: b.name })));
      }
      
      // ✅ LLAMAR A RENDER ALBUMS
      if (window.albumsRender && typeof window.albumsRender.renderAlbums === 'function') {
        console.log('📞 [app.js] Llamando a albumsRender.renderAlbums...');
        window.albumsRender.renderAlbums(bandId);
      } else {
        console.error('❌ [app.js] albumsRender.renderAlbums NO disponible');
      }
      
      // ✅ SCROLL
      const albumsSection = document.getElementById('albums-section');
      if (albumsSection) {
        albumsSection.scrollIntoView({behavior:'smooth'});
        console.log('📜 [app.js] Scroll a sección de álbumes');
      }
    };
  });

  $all('.delete-band').forEach(btn => {
    btn.onclick = e => {
      deleteBand(e.currentTarget.dataset.band);
    };
  });
  
  console.log('✅ [app.js] Bandas renderizadas');
}

/* ------------------ EVENTOS / UI ------------------ */
function bindUI() {
  console.log('⚙️ [app.js] Configurando eventos UI...');
  
  const bandForm = $('#band-form');
  if (bandForm) {
    bandForm.addEventListener('submit', e => {
      e.preventDefault();
      console.log('📝 [app.js] Formulario de banda enviado');
      
      if (!Array.isArray(STATE.tempYoutubeLinks)) {
        STATE.tempYoutubeLinks = [];
      }
      
      const newBand = {
        id: 'b' + Date.now(),
        name: $('#band-name').value.trim(),
        genre: $('#band-genre').value.trim(),
        bio: $('#band-bio').value.trim(),
        youtube: STATE.tempYoutubeLinks.map(link => ({
          url: link.url,
          videoId: link.videoId
        }))
      };
      
      console.log('📊 [app.js] Nueva banda:', newBand);
      
      if (!newBand.name || !newBand.genre) {
        window.albumsCore.showToast('⚠️ Nombre y género son obligatorios', 'error');
        return;
      }
      
      const imgInput = $('#band-img');
      if (imgInput && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          newBand.img = e.target.result;
          finalizeBandCreation(newBand);
        };
        reader.readAsDataURL(imgInput.files[0]);
      } else {
        finalizeBandCreation(newBand);
      }
    });
  }
  
  const addYoutubeBtn = $('#add-youtube');
  if (addYoutubeBtn) {
    addYoutubeBtn.addEventListener('click', addYoutubeLink);
    console.log('✅ [app.js] Botón de YouTube configurado');
  }
  
  const searchInput = $('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => applySearchAndFilter(), 250));
  }
  
  const genreFilter = $('#genre-filter');
  if (genreFilter) {
    genreFilter.addEventListener('change', applySearchAndFilter);
  }
  
  const clearSearch = $('#clear-search');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (genreFilter) genreFilter.value = '';
      renderBands();
    });
  }
  
  console.log('✅ [app.js] Eventos UI configurados');
}

function finalizeBandCreation(newBand) {
  console.log('✅ [app.js] Finalizando creación de banda...');
  
  STATE.bands.push(newBand);
  STATE.genres.add(newBand.genre);
  
  saveBandsToLocalStorage();
  
  const form = $('#band-form');
  if (form) form.reset();
  
  const preview = $('#preview-img');
  if (preview) preview.classList.add('hidden');
  
  STATE.tempYoutubeLinks = [];
  renderYoutubeLinks();
  
  renderGenres();
  renderBands();
  
  window.albumsCore.showToast(`✅ Banda "${newBand.name}" agregada exitosamente`, 'success');
  console.log('✅ [app.js] Banda creada exitosamente');
}

function applySearchAndFilter() {
  const searchInput = $('#search-input');
  const genreFilter = $('#genre-filter');
  
  renderBands(
    searchInput ? searchInput.value : '',
    genreFilter ? genreFilter.value : ''
  );
}

function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ------------------ INICIO ------------------ */
async function bootstrap() {
  console.log('🚀 [app.js] Bootstrap iniciando...');
  
  try {
    await loadData();
    renderGenres();
    renderBands();
    bindUI();
    
    console.log('✅ [app.js] Bootstrap completado');
    console.log('📊 [app.js] STATE.bands:', STATE.bands.length);
    console.log('📊 [app.js] STATE.albums:', STATE.albums.length);
  } catch (error) {
    console.error('❌ [app.js] Error en bootstrap:', error);
  }
}

// Exponer funciones globales
window.removeYoutubeLink = removeYoutubeLink;
window.deleteBand = deleteBand;

bootstrap();

console.log('✅ [app.js] Inicialización completa');