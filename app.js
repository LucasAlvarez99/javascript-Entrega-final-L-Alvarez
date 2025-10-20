/* app.js - La Disquera (versión corregida)
   Arregla el error de línea 71 y mejora el manejo de tempYoutubeLinks
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
  tempYoutubeLinks: [] // ✅ IMPORTANTE: Inicializar aquí
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

    // Cargar bandas guardadas por el usuario desde localStorage
    const storedBands = JSON.parse(localStorage.getItem('disquera_bands') || '[]');
    console.log(`📊 [app.js] ${storedBands.length} bandas guardadas encontradas`);
    
    STATE.bands = [...data.bands, ...storedBands];
    STATE.albums = data.albums;

    // Recalcular géneros
    STATE.bands.forEach(b => STATE.genres.add(b.genre));
    
    console.log(`✅ [app.js] ${STATE.bands.length} bandas cargadas en total`);

    return data;
  } catch (error) {
    console.error('❌ [app.js] Error al cargar datos:', error);
    // Inicializar con arrays vacíos si falla
    STATE.bands = [];
    STATE.albums = [];
    return { bands: [], albums: [] };
  }
}

/* ------------------ GUARDAR / BORRAR BANDAS ------------------ */
function saveBandsToLocalStorage() {
  console.log('💾 [app.js] Guardando bandas personalizadas...');
  
  try {
    // Guardamos solo las bandas nuevas (no las originales del JSON)
    const baseIDs = new Set(['b1','b2','b3']);
    const customBands = STATE.bands.filter(b => !baseIDs.has(b.id));
    localStorage.setItem('disquera_bands', JSON.stringify(customBands));
    
    console.log(`✅ [app.js] ${customBands.length} bandas guardadas`);
  } catch (error) {
    console.error('❌ [app.js] Error al guardar bandas:', error);
  }
}

/* ------------------ YOUTUBE LINKS ------------------ */
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
    showToast('⚠️ Ingresa una URL de YouTube', 'error');
    return;
  }
  
  if (!isValidYoutubeUrl(url)) {
    showToast('⚠️ URL de YouTube inválida', 'error');
    return;
  }
  
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    showToast('⚠️ No se pudo extraer el ID del video', 'error');
    return;
  }
  
  console.log('✅ [app.js] Video ID extraído:', videoId);
  
  // ✅ IMPORTANTE: Asegurar que tempYoutubeLinks existe
  if (!Array.isArray(STATE.tempYoutubeLinks)) {
    console.warn('⚠️ [app.js] tempYoutubeLinks no era array, inicializando...');
    STATE.tempYoutubeLinks = [];
  }
  
  // Verificar duplicados
  if (STATE.tempYoutubeLinks.some(link => link.videoId === videoId)) {
    showToast('⚠️ Este video ya fue agregado', 'warning');
    return;
  }
  
  // Agregar a la lista temporal
  STATE.tempYoutubeLinks.push({
    url: url,
    videoId: videoId
  });
  
  console.log(`✅ [app.js] Video agregado. Total: ${STATE.tempYoutubeLinks.length}`);
  
  // Actualizar vista previa
  renderYoutubeLinks();
  
  // Limpiar input
  input.value = '';
  showToast('✅ Video agregado', 'success');
}

function renderYoutubeLinks() {
  console.log('🎨 [app.js] renderYoutubeLinks llamado');
  
  const container = $('#youtube-list');
  if (!container) {
    console.error('❌ [app.js] Contenedor youtube-list no encontrado');
    return;
  }
  
  // ✅ LÍNEA 71 ARREGLADA: Verificar que tempYoutubeLinks existe y es array
  if (!STATE.tempYoutubeLinks || !Array.isArray(STATE.tempYoutubeLinks)) {
    console.warn('⚠️ [app.js] tempYoutubeLinks no existe, inicializando...');
    STATE.tempYoutubeLinks = [];
  }
  
  console.log(`📊 [app.js] Renderizando ${STATE.tempYoutubeLinks.length} videos`);
  
  if (STATE.tempYoutubeLinks.length === 0) {
    container.innerHTML = '<p style="color:#888">No hay videos agregados</p>';
    return;
  }
  
  container.innerHTML = STATE.tempYoutubeLinks.map((link, index) => `
    <div class="youtube-preview" style="position:relative; margin-bottom:10px;">
      <iframe 
        width="100%" 
        height="120px" 
        src="https://www.youtube.com/embed/${link.videoId}"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="border-radius:8px;">
      </iframe>
      <button class="btn" 
              onclick="removeYoutubeLink(${index})"
              style="margin-top:8px;">
        Eliminar
      </button>
    </div>
  `).join('');
  
  console.log('✅ [app.js] Videos renderizados');
}

function removeYoutubeLink(index) {
  console.log('🗑️ [app.js] Removiendo video:', index);
  
  if (!STATE.tempYoutubeLinks || !Array.isArray(STATE.tempYoutubeLinks)) {
    console.error('❌ [app.js] tempYoutubeLinks no existe');
    return;
  }
  
  if (index < 0 || index >= STATE.tempYoutubeLinks.length) {
    console.error('❌ [app.js] Índice inválido');
    return;
  }
  
  STATE.tempYoutubeLinks.splice(index, 1);
  console.log(`✅ [app.js] Video removido. Quedan: ${STATE.tempYoutubeLinks.length}`);
  
  renderYoutubeLinks();
  showToast('🗑️ Video eliminado', 'success');
}

function showToast(message, type = 'success') {
  console.log(`🍞 [app.js] Toast: ${message}`);
  
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  const colors = {
    success: '#4caf50',
    error: '#d9534f',
    warning: '#ff9800',
    info: '#2196f3'
  };
  
  toast.style.background = colors[type] || colors.success;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 4000);
}

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
  
  if (!confirm('¿Seguro que querés eliminar esta banda?')) {
    console.log('❌ [app.js] Eliminación cancelada');
    return;
  }
  
  STATE.bands = STATE.bands.filter(b => b.id !== id);
  saveBandsToLocalStorage();
  renderBands();
  
  console.log('✅ [app.js] Banda eliminada');
  showToast('🗑️ Banda eliminada', 'info');
}

/* ------------------ RENDERS ------------------ */
function renderGenres() {
  console.log('🎨 [app.js] Renderizando géneros...');
  
  const sel = $('#genre-filter');
  if (!sel) {
    console.error('❌ [app.js] Selector de género no encontrado');
    return;
  }
  
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
  
  const container = $('#bands-list');
  if (!container) {
    console.error('❌ [app.js] Contenedor bands-list no encontrado');
    return;
  }
  
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
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn view-albums" data-band="${b.id}">Ver álbumes</button>
        <button class="btn delete-band" data-band="${b.id}">Eliminar</button>
      </div>
    `;
    container.appendChild(node);
  });

  // Eventos
  $all('.view-albums').forEach(btn => {
    btn.onclick = e => {
      const bandId = e.currentTarget.dataset.band;
      console.log('👁️ [app.js] Ver álbumes de banda:', bandId);
      STATE.currentBandId = bandId;
      
      // Usar la función del módulo albums-render si existe
      if (window.albumsRender && typeof window.albumsRender.renderAlbums === 'function') {
        window.albumsRender.renderAlbums(bandId);
      }
      
      document.getElementById('albums-section')?.scrollIntoView({behavior:'smooth'});
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
      
      const form = e.target;
      
      // ✅ Asegurar que tempYoutubeLinks existe
      if (!Array.isArray(STATE.tempYoutubeLinks)) {
        STATE.tempYoutubeLinks = [];
      }
      
      // Crear nueva banda
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
      
      // Validar
      if (!newBand.name || !newBand.genre) {
        showToast('⚠️ Nombre y género son obligatorios', 'error');
        return;
      }
      
      // Procesar imagen si existe
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
  
  // Botón para agregar video de YouTube
  const addYoutubeBtn = $('#add-youtube');
  if (addYoutubeBtn) {
    addYoutubeBtn.addEventListener('click', addYoutubeLink);
    console.log('✅ [app.js] Botón de YouTube configurado');
  }
  
  // Búsqueda y filtros
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
  
  // Agregar banda
  STATE.bands.push(newBand);
  STATE.genres.add(newBand.genre);
  
  // Guardar
  saveBandsToLocalStorage();
  
  // Limpiar formulario
  const form = $('#band-form');
  if (form) form.reset();
  
  const preview = $('#preview-img');
  if (preview) preview.classList.add('hidden');
  
  // Limpiar links de YouTube
  STATE.tempYoutubeLinks = [];
  renderYoutubeLinks();
  
  // Actualizar UI
  renderGenres();
  renderBands();
  
  showToast(`✅ Banda "${newBand.name}" agregada exitosamente`);
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
  } catch (error) {
    console.error('❌ [app.js] Error en bootstrap:', error);
  }
}

// Exponer funciones globales necesarias
window.removeYoutubeLink = removeYoutubeLink;
window.deleteBand = deleteBand;

bootstrap();

console.log('✅ [app.js] Inicialización completa');