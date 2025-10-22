/* app.js - La Disquera - VERSIÓN CORREGIDA */

console.log('🎸 [app.js] Iniciando...');

// 🔥 CRÍTICO: Declarar STATE global ANTES que cualquier otra cosa
if (!window.STATE) {
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
    youtubePlayer: null,
    tempYoutubeLinks: []
  };
  console.log('✅ [app.js] STATE creado globalmente');
} else {
  console.log('ℹ️ [app.js] STATE ya existía');
}

// Alias local para facilitar el código
const STATE = window.STATE;

const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

/* ------------------ FETCH / CARGA DE DATOS ------------------ */
async function loadData() {
  console.log('📦 [app.js] Cargando datos...');
  
  try {
    const res = await fetch('data.json');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    
    console.log('✅ [app.js] data.json cargado exitosamente');
    console.log('📊 [app.js] Bandas del JSON:', data.bands);
    console.log('📊 [app.js] Álbumes del JSON:', data.albums);

    // Cargar bandas guardadas
    const storedBands = JSON.parse(localStorage.getItem('disquera_bands') || '[]');
    console.log(`📊 [app.js] Bandas guardadas:`, storedBands.length);
    
    // Combinar bandas del JSON con guardadas
    STATE.bands = [...data.bands, ...storedBands];
    STATE.albums = data.albums || [];
    
    // Extraer géneros
    STATE.bands.forEach(b => STATE.genres.add(b.genre));
    
    console.log(`✅ [app.js] ${STATE.bands.length} bandas cargadas`);
    console.log(`✅ [app.js] ${STATE.albums.length} álbumes cargados`);
    
    // 🔥 VERIFICACIÓN CRÍTICA
    if (STATE.bands.length === 0) {
      console.error('❌ [app.js] NO HAY BANDAS CARGADAS');
      console.error('📊 [app.js] Data recibida:', data);
    } else {
      console.log('✅ [app.js] Bandas disponibles:');
      STATE.bands.forEach(b => {
        console.log(`  - ${b.name} (ID: ${b.id})`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ [app.js] Error al cargar datos:', error);
    console.error('📊 [app.js] Detalles del error:', {
      message: error.message,
      stack: error.stack
    });
    
    // 🔥 FALLBACK: Cargar bandas por defecto si falla
    console.warn('⚠️ [app.js] Cargando bandas por defecto...');
    STATE.bands = [
      {
        id: "b1",
        name: "Máquina de Fuego",
        genre: "Heavy Metal",
        bio: "Trío de heavy metal clásico con riffs potentes.",
        img: "https://picsum.photos/seed/metal1/400/250"
      },
      {
        id: "b2",
        name: "Eco Urbano",
        genre: "Rock Alternativo",
        bio: "Fusión de rock y electrónica, atmósferas densas.",
        img: "https://picsum.photos/seed/rock2/400/250"
      },
      {
        id: "b3",
        name: "Los Vinilos",
        genre: "Indie",
        bio: "Melodías íntimas y letras directas.",
        img: "https://picsum.photos/seed/indie3/400/250"
      }
    ];
    STATE.albums = [];
    STATE.bands.forEach(b => STATE.genres.add(b.genre));
    
    console.log('✅ [app.js] Bandas por defecto cargadas:', STATE.bands.length);
    
    return { bands: STATE.bands, albums: [] };
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
  if (!sel) {
    console.warn('⚠️ [app.js] Selector de géneros no encontrado');
    return;
  }
  
  sel.innerHTML = `<option value="">Todos los géneros</option>`;
  Array.from(STATE.genres).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    sel.appendChild(opt);
  });
  
  console.log('✅ [app.js] Géneros renderizados:', STATE.genres.size);
}

function renderBands(filterText = '', genre = '') {
  console.log('');
  console.log('🎨 ==========================================');
  console.log('🎨 [app.js] RENDERIZANDO BANDAS');
  console.log('🎨 ==========================================');
  console.log('📊 [app.js] Total bandas en STATE:', STATE.bands.length);
  console.log('📊 [app.js] Filtros:', { filterText, genre });
  
  const container = $('#bands-list');
  if (!container) {
    console.error('❌ [app.js] Contenedor bands-list no encontrado');
    return;
  }
  
  console.log('✅ [app.js] Contenedor encontrado');
  
  // 🔥 VERIFICACIÓN CRÍTICA
  if (!STATE.bands || STATE.bands.length === 0) {
    console.error('❌❌❌ [app.js] NO HAY BANDAS EN STATE');
    container.innerHTML = `
      <div class="card" style="background: rgba(244,67,54,0.1); border: 2px solid #f44336; padding: 20px;">
        <h3 style="color: #f44336;">❌ Error: No hay bandas cargadas</h3>
        <p style="color: #fff; margin: 12px 0;">El archivo data.json no se cargó correctamente.</p>
        <button class="btn" onclick="location.reload()" style="margin-top: 12px;">
          🔄 Recargar página
        </button>
      </div>
    `;
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
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎸</div>
        <p style="color: #9aa4b2;">No se encontraron bandas</p>
      </div>
    `;
    return;
  }

  list.forEach(b => {
    console.log(`  🎸 Renderizando: ${b.name} (ID: ${b.id})`);
    
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

  // Eventos
  $all('.view-albums').forEach(btn => {
    btn.onclick = e => {
      const bandId = e.currentTarget.dataset.band;
      
      console.log('');
      console.log('👁️ ==========================================');
      console.log('👁️ [app.js] CLICK EN VER ÁLBUMES');
      console.log('👁️ ==========================================');
      console.log('📊 [app.js] Band ID del botón:', bandId);
      
      // Verificar que la banda existe ANTES de intentar renderizar
      const banda = STATE.bands.find(b => b.id === bandId);
      
      if (!banda) {
        console.error('❌ [app.js] BANDA NO ENCONTRADA EN STATE');
        console.error('📊 [app.js] Bandas disponibles:');
        STATE.bands.forEach(b => {
          console.error(`  - ${b.name} (ID: ${b.id})`);
        });
        window.albumsCore.showToast('❌ Error: Banda no encontrada', 'error');
        return;
      }
      
      console.log('✅ [app.js] Banda encontrada:', banda.name);
      
      // Guardar en STATE
      STATE.currentBandId = bandId;
      console.log('💾 [app.js] currentBandId guardado:', STATE.currentBandId);
      
      // Llamar a renderAlbums
      if (window.albumsRender && typeof window.albumsRender.renderAlbums === 'function') {
        console.log('📞 [app.js] Llamando a albumsRender.renderAlbums...');
        window.albumsRender.renderAlbums(bandId);
      } else {
        console.error('❌ [app.js] albumsRender.renderAlbums NO disponible');
        window.albumsCore.showToast('❌ Error: Módulo de renderizado no disponible', 'error');
      }
      
      // Scroll
      const albumsSection = document.getElementById('albums-section');
      if (albumsSection) {
        albumsSection.scrollIntoView({behavior:'smooth'});
        console.log('📜 [app.js] Scroll a sección de álbumes');
      }
      
      console.log('👁️ ==========================================');
      console.log('');
    };
  });

  $all('.delete-band').forEach(btn => {
    btn.onclick = e => {
      deleteBand(e.currentTarget.dataset.band);
    };
  });
  
  console.log('✅ [app.js] Bandas renderizadas exitosamente');
  console.log('🎨 ==========================================');
  console.log('');
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
  console.log('');
  console.log('✅ ==========================================');
  console.log('✅ [app.js] CREANDO NUEVA BANDA');
  console.log('✅ ==========================================');
  console.log('📊 [app.js] Datos de la banda:', newBand);
  
  // 1. Agregar al STATE
  STATE.bands.push(newBand);
  console.log(`📊 [app.js] Total bandas ahora: ${STATE.bands.length}`);
  
  // 2. Agregar género
  STATE.genres.add(newBand.genre);
  console.log(`📊 [app.js] Géneros ahora: ${STATE.genres.size}`);
  
  // 3. Guardar en localStorage
  console.log('💾 [app.js] Guardando en localStorage...');
  saveBandsToLocalStorage();
  
  // 4. Verificar que se guardó
  const verificacion = JSON.parse(localStorage.getItem('disquera_bands') || '[]');
  console.log('✅ [app.js] Bandas guardadas verificadas:', verificacion.length);
  
  // 5. LOG: Mostrar la banda recién creada
  console.log('🎸 [app.js] Banda recién creada:');
  console.log(`  - Nombre: ${newBand.name}`);
  console.log(`  - ID: ${newBand.id}`);
  console.log(`  - Género: ${newBand.genre}`);
  console.log(`  - Canciones: ${newBand.youtube ? newBand.youtube.length : 0}`);
  
  // 6. Limpiar formulario
  const form = $('#band-form');
  if (form) {
    form.reset();
    console.log('✅ [app.js] Formulario limpiado');
  }
  
  // 7. Limpiar imagen preview
  const preview = $('#preview-img');
  if (preview) {
    preview.classList.add('hidden');
    console.log('✅ [app.js] Preview de imagen ocultado');
  }
  
  // 8. Limpiar links de YouTube temporales
  STATE.tempYoutubeLinks = [];
  renderYoutubeLinks();
  console.log('✅ [app.js] Links de YouTube limpiados');
  
  // 9. Re-renderizar géneros
  renderGenres();
  console.log('✅ [app.js] Géneros actualizados');
  
  // 10. Re-renderizar bandas
  console.log('🎨 [app.js] Re-renderizando bandas...');
  renderBands();
  
  // 11. Verificar que la banda está en la lista renderizada
  console.log('🔍 [app.js] Verificando banda en STATE.bands:');
  const bandaEncontrada = STATE.bands.find(b => b.id === newBand.id);
  if (bandaEncontrada) {
    console.log('✅ [app.js] Banda encontrada en STATE:', bandaEncontrada.name);
  } else {
    console.error('❌ [app.js] Banda NO encontrada en STATE');
  }
  
  // 12. Notificación
  window.albumsCore.showToast(`✅ Banda "${newBand.name}" agregada exitosamente`, 'success');
  
  console.log('✅ ==========================================');
  console.log('✅ [app.js] BANDA CREADA EXITOSAMENTE');
  console.log('✅ ==========================================');
  console.log('');
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
  console.log('');
  console.log('🚀 ==========================================');
  console.log('🚀 [app.js] BOOTSTRAP INICIANDO');
  console.log('🚀 ==========================================');
  
  try {
    // 1. Cargar datos
    console.log('📦 [app.js] Paso 1: Cargar datos...');
    await loadData();
    console.log('✅ [app.js] Datos cargados');
    
    // 2. Renderizar géneros
    console.log('🎨 [app.js] Paso 2: Renderizar géneros...');
    renderGenres();
    console.log('✅ [app.js] Géneros renderizados');
    
    // 3. Renderizar bandas
    console.log('🎨 [app.js] Paso 3: Renderizar bandas...');
    renderBands();
    console.log('✅ [app.js] Bandas renderizadas');
    
    // 4. Configurar eventos
    console.log('⚙️ [app.js] Paso 4: Configurar eventos...');
    bindUI();
    console.log('✅ [app.js] Eventos configurados');
    
    console.log('');
    console.log('🎉 ==========================================');
    console.log('🎉 [app.js] BOOTSTRAP COMPLETADO');
    console.log('🎉 ==========================================');
    console.log('📊 [app.js] Resumen:');
    console.log(`  - Bandas: ${STATE.bands.length}`);
    console.log(`  - Álbumes: ${STATE.albums.length}`);
    console.log(`  - Géneros: ${STATE.genres.size}`);
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ ==========================================');
    console.error('❌ [app.js] ERROR EN BOOTSTRAP');
    console.error('❌ ==========================================');
    console.error('❌ [app.js] Error:', error);
    console.error('❌ [app.js] Stack:', error.stack);
    console.error('❌ ==========================================');
    console.error('');
    
    // Mostrar error en UI
    const container = $('#bands-list');
    if (container) {
      container.innerHTML = `
        <div class="card" style="background: rgba(244,67,54,0.1); border: 2px solid #f44336; padding: 20px;">
          <h3 style="color: #f44336;">❌ Error al cargar la aplicación</h3>
          <p style="color: #fff; margin: 12px 0;">${error.message}</p>
          <button class="btn" onclick="location.reload()" style="margin-top: 12px;">
            🔄 Recargar página
          </button>
        </div>
      `;
    }
  }
}

// Exponer funciones globales (STATE ya está expuesto arriba)
window.removeYoutubeLink = removeYoutubeLink;
window.deleteBand = deleteBand;

bootstrap();

console.log('✅ [app.js] Inicialización completa');
console.log('📊 [app.js] Verificando STATE global:');
console.log('  - window.STATE existe:', !!window.STATE);
console.log('  - Bandas en STATE:', window.STATE.bands.length);
console.log('  - Álbumes en STATE:', window.STATE.albums.length);