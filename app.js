/* app.js - La Disquera (versión final con agregar/eliminar bandas)
   Cumple toda la rúbrica + persistencia de bandas personalizadas.
*/

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
  youtubePlayer: null
};

const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

/* ------------------ FETCH / CARGA DE DATOS ------------------ */
async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('No se pudo cargar data.json');
  const data = await res.json();

  // Cargar bandas guardadas por el usuario desde localStorage
  const storedBands = JSON.parse(localStorage.getItem('disquera_bands') || '[]');
  STATE.bands = [...data.bands, ...storedBands];
  STATE.albums = data.albums;

  // Recalcular géneros
  STATE.bands.forEach(b => STATE.genres.add(b.genre));

  return data;
}

/* ------------------ GUARDAR / BORRAR BANDAS ------------------ */
function saveBandsToLocalStorage() {
  // Guardamos solo las bandas nuevas (no las originales del JSON)
  const baseIDs = new Set(['b1','b2','b3']);
  const customBands = STATE.bands.filter(b => !baseIDs.has(b.id));
  localStorage.setItem('disquera_bands', JSON.stringify(customBands));
}

/* ------------------ YOUTUBE LINKS ------------------ */
function isValidYoutubeUrl(url) {
  const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  return pattern.test(url);
}

function getYoutubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function addYoutubeLink() {
  const input = $('#youtube-url');
  const url = input.value.trim();
  
  if (!isValidYoutubeUrl(url)) {
    showToast('⚠️ URL de YouTube inválida', 'error');
    return;
  }
  
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    showToast('⚠️ No se pudo extraer el ID del video', 'error');
    return;
  }
  
  // Agregar a la lista temporal
  STATE.tempYoutubeLinks.push({
    url: url,
    videoId: videoId
  });
  
  // Actualizar vista previa
  renderYoutubeLinks();
  
  // Limpiar input
  input.value = '';
  showToast('✅ Video agregado', 'success');
}

function renderYoutubeLinks() {
  const container = $('#youtube-list');
  container.innerHTML = STATE.tempYoutubeLinks.map((link, index) => `
    <div class="youtube-preview">
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${link.videoId}"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
      <button class="btn" onclick="removeYoutubeLink(${index})">Eliminar</button>
    </div>
  `).join('');
}

function removeYoutubeLink(index) {
  STATE.tempYoutubeLinks.splice(index, 1);
  renderYoutubeLinks();
  showToast('🗑️ Video eliminado', 'success');
}

function showToast(message, type = 'success') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (type === 'error') toast.style.background = '#d9534f';
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

$('#band-img').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = $('#preview-img');
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      preview.src = ev.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    preview.classList.add('hidden');
  }
});
function deleteBand(id) {
  if (!confirm('¿Seguro que querés eliminar esta banda?')) return;
  STATE.bands = STATE.bands.filter(b => b.id !== id);
  saveBandsToLocalStorage();
  renderBands();
}

/* ------------------ RENDERS ------------------ */
function renderGenres() {
  const sel = $('#genre-filter');
  sel.innerHTML = `<option value="">Todos los géneros</option>`;
  Array.from(new Set(STATE.bands.map(b => b.genre))).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    sel.appendChild(opt);
  });
}

function renderBands(filterText = '', genre = '') {
  const container = $('#bands-list');
  container.innerHTML = '';
  const list = STATE.bands.filter(b => {
    const matchesText = (b.name + ' ' + (b.bio || '')).toLowerCase().includes(filterText.toLowerCase());
    const matchesGenre = !genre || b.genre === genre;
    return matchesText && matchesGenre;
  });
  if (list.length === 0) container.innerHTML = `<div class="card">No hay bandas</div>`;

  list.forEach(b => {
    const node = document.createElement('div');
    node.className = 'card band';
    node.innerHTML = `
      <div class="thumb">
        <img src="${b.img || 'https://picsum.photos/seed/default/400/250'}" alt="${b.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>
      </div>
      <h3>${b.name}</h3>
      <div class="meta">${b.genre}</div>
      <small style="color:#aaa">${b.bio || ''}</small>
      ${b.youtube && b.youtube.length > 0 ? `
        <div class="youtube-section">
          <h4>Videos de YouTube</h4>
          ${b.youtube.map(video => `
            <div class="youtube-preview">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${video.videoId}"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          `).join('')}
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
      console.log('View albums clicked for band:', bandId);
      STATE.currentBandId = bandId; // Guardar el bandId actual
      renderAlbums(bandId);
      document.getElementById('albums-section').scrollIntoView({behavior:'smooth'});
    };
  });

  $all('.delete-band').forEach(btn => {
    btn.onclick = e => {
      deleteBand(e.currentTarget.dataset.band);
    };
  });
}

/* ------------------ YOUTUBE INTEGRATION ------------------ */
function isValidYoutubeUrl(url) {
  return /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/.test(url);
}

function getYoutubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function addNewAlbum(bandId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="album-form">
      <div class="album-header">
        <h3>Agregar nuevo álbum</h3>
        <button class="close-modal" title="Cerrar">&times;</button>
      </div>
      <div class="form-content">
    <h3>Agregar nuevo álbum</h3>
    <form id="album-form">
      <div class="album-header">
        <input type="text" id="album-title" placeholder="Título del álbum" required autocomplete="off" />
        <input type="number" id="album-year" placeholder="Año" required min="1900" max="2025" value="${new Date().getFullYear()}" />
      </div>
      
      <div class="songs-section">
        <h4>Canciones desde YouTube</h4>
        <div class="song-list" id="youtube-track-list"></div>
        
        <div class="song-input">
          <input type="text" 
                 id="new-track-url" 
                 placeholder="Pegar URL de YouTube (https://youtube.com/watch?v=... o https://youtu.be/...)"
                 autocomplete="off" />
          <button type="button" id="add-track" class="btn-save">Agregar</button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="this.closest('.album-form').remove()">Cancelar</button>
        <button type="submit" class="btn-save">Guardar álbum</button>
      </div>
    </form>
  `;
  
  const albumsList = $('#albums-list');
  albumsList.insertBefore(form, albumsList.firstChild);
  
  // Event listeners
  const trackList = $('#youtube-track-list');
  const tracks = [];
  
  const urlInput = $('#new-track-url');
  const addButton = $('#add-track');
  
  // Validación en tiempo real
  urlInput.addEventListener('input', () => {
    const url = urlInput.value.trim();
    if (url && !isValidYoutubeUrl(url)) {
      urlInput.style.borderColor = '#ff4444';
      addButton.disabled = true;
    } else {
      urlInput.style.borderColor = url ? '#4CAF50' : '';
      addButton.disabled = false;
    }
  });
  
  $('#add-track').addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!isValidYoutubeUrl(url)) {
      showToast('⚠️ La URL debe ser de YouTube (ejemplo: https://youtube.com/watch?v=...)', 'error');
      urlInput.focus();
      return;
    }
    
    const videoId = getYoutubeVideoId(url);
    if (!videoId) {
      showToast('⚠️ No se pudo extraer el ID del video', 'error');
      return;
    }
    
    // Verificar duplicados
    if (tracks.some(t => t.videoId === videoId)) {
      showToast('⚠️ Este video ya fue agregado', 'error');
      return;
    }
    
    tracks.push({ url, videoId });
    renderTracks();
    urlInput.value = '';
    urlInput.style.borderColor = '';
    
    // Animar la nueva entrada
    setTimeout(() => {
      const lastTrack = $('.song-item:last-child');
      if (lastTrack) {
        lastTrack.style.animation = 'slideIn 0.3s ease';
      }
    }, 0);
  });
  
  async function renderTracks() {
    // Obtener información de los videos usando la API de YouTube
    const trackPromises = tracks.map(async (track, i) => {
      try {
        const response = await fetch(`https://noembed.com/embed?url=${track.url}`);
        const data = await response.json();
        return `
          <div class="track-item" data-index="${i}">
            <div class="track-info">
              <span class="track-title">${data.title || 'Video de YouTube'}</span>
              <span class="track-url">${track.url}</span>
            </div>
            <button type="button" class="remove-track" title="Eliminar canción">
              ❌
            </button>
          </div>
        `;
      } catch (err) {
        return `
          <div class="track-item" data-index="${i}">
            <div class="track-info">
              <span class="track-title">Video ${i + 1}</span>
              <span class="track-url">${track.url}</span>
            </div>
            <button type="button" class="remove-track" title="Eliminar canción">
              ❌
            </button>
          </div>
        `;
      }
    });

    const trackElements = await Promise.all(trackPromises);
    trackList.innerHTML = trackElements.join('');
  }
  
  $('#album-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (tracks.length === 0) {
      showToast('⚠️ Agrega al menos una canción', 'error');
      return;
    }
    
    const newAlbum = {
      id: 'a' + Date.now(),
      bandId: bandId,
      title: $('#album-title').value.trim(),
      year: parseInt($('#album-year').value),
      tracks: tracks.map((t, i) => ({
        id: `t${Date.now()}_${i}`,
        title: `Video ${i + 1}`,
        duration: 0,
        youtubeId: t.videoId
      }))
    };
    
    STATE.albums.push(newAlbum);
    form.remove();
    renderAlbums(bandId);
    showToast('✅ Álbum agregado exitosamente');
  });
}

function renderAlbums(bandId = null) {
  console.log('app.js renderAlbums called with:', bandId);
  STATE.currentBandId = bandId;
  const container = $('#albums-list');
  container.innerHTML = '';
  
  // Si no hay bandId, intentar usar el currentBandId
  const actualBandId = bandId || STATE.currentBandId;
  const list = STATE.albums.filter(a => !actualBandId || a.bandId === actualBandId);
  
  // Add album button if band selected
  if (bandId) {
    container.innerHTML = `
      <button class="btn" onclick="addNewAlbum('${bandId}')">
        ➕ Agregar álbum
      </button>
    `;
  }
  
  if (list.length === 0) {
    container.innerHTML += `<div class="card">No hay álbumes</div>`;
  }
  list.forEach(a => {
    const band = STATE.bands.find(b => b.id === a.bandId) || {name:'?', genre:'?'};
    const node = document.createElement('div');
    node.className = 'card album';
    node.innerHTML = `
      <div style="display:flex;gap:10px">
        <div style="width:120px;height:80px;overflow:hidden;border-radius:6px">
          <img src="${a.cover}" alt="${a.title}" style="width:100%;height:100%;object-fit:cover"/>
        </div>
        <div>
          <h4>${a.title}</h4>
          <div class="meta">${band.name} · ${a.year}</div>
          <div style="margin-top:8px">
            <button class="btn view-tracks" data-album="${a.id}">Ver canciones</button>
            <button class="btn add-all" data-album="${a.id}">Agregar todo a playlist</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(node);
  });

  $all('.view-tracks').forEach(btn => {
    btn.onclick = e => {
      const albumId = e.currentTarget.dataset.album;
      renderTracks(albumId);
      document.getElementById('songs-section').scrollIntoView({behavior:'smooth'});
    };
  });

  $all('.add-all').forEach(btn => {
    btn.onclick = e => {
      const albumId = e.currentTarget.dataset.album;
      addAlbumToPlaylist(albumId);
    };
  });
}

function renderTracks(albumId) {
  STATE.currentAlbumId = albumId;
  const songsDiv = $('#songs-list');
  songsDiv.innerHTML = '';
  const album = STATE.albums.find(a => a.id === albumId);
  if (!album) { songsDiv.innerHTML = `<div class="card">Álbum no encontrado</div>`; return; }
  
  // Limpiar reproductor anterior si existe
  const oldPlayer = $('#youtube-player');
  if (oldPlayer) oldPlayer.remove();

  const band = STATE.bands.find(b => b.id === album.bandId);
  const header = document.createElement('div');
  header.className = 'card';
  header.innerHTML = `
    <div style="display:flex;gap:12px">
      <div style="width:150px;height:100px;overflow:hidden;border-radius:6px"><img src="${album.cover}" style="width:100%;height:100%;object-fit:cover"/></div>
      <div>
        <h3>${album.title}</h3>
        <div class="meta">${band.name} · ${album.year}</div>
      </div>
    </div>
  `;
  songsDiv.appendChild(header);

  const listNode = document.createElement('div');
  listNode.className = 'songs-list';
  album.tracks.forEach(track => {
    const trackNode = document.createElement('div');
    trackNode.className = 'song card';
    trackNode.innerHTML = `
      <div class="info">
        <div class="title">${track.title}</div>
        <small>${formatDuration(track.duration)}</small>
      </div>
      <div class="actions">
        <button class="btn play-track" data-track="${track.id}" data-album="${album.id}">▶</button>
        <button class="btn add-track" data-track="${track.id}" data-album="${album.id}">+ playlist</button>
      </div>
    `;
    listNode.appendChild(trackNode);
  });
  songsDiv.appendChild(listNode);

  // Eventos
  $all('.play-track').forEach(btn => btn.onclick = e => {
    const trackId = e.currentTarget.dataset.track;
    const albumId = e.currentTarget.dataset.album;
    playTrack(albumId, trackId);
  });
  $all('.add-track').forEach(btn => btn.onclick = e => {
    const trackId = e.currentTarget.dataset.track;
    const albumId = e.currentTarget.dataset.album;
    addTrackToPlaylist(albumId, trackId);
  });
}

/* ------------------ PLAYLIST / PLAYER ------------------ */
function formatDuration(sec) {
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function playTrack(albumId, trackId) {
  const album = STATE.albums.find(a => a.id === albumId);
  const track = album.tracks.find(t => t.id === trackId);
  const band = STATE.bands.find(b => b.id === album.bandId);
  
  if (track.youtubeId) {
    // Actualizar UI
    $('#now-playing').textContent = `${track.title} — ${album.title} — ${band.name}`;
    
    // Crear o actualizar iframe de YouTube
    const player = $('#youtube-player');
    if (!player) {
      const playerDiv = document.createElement('div');
      playerDiv.innerHTML = `
        <iframe
          id="youtube-player"
          src="https://www.youtube.com/embed/${track.youtubeId}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;
      $('.player').insertBefore(playerDiv, $('#now-playing').nextSibling);
    } else {
      player.src = `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1`;
    }
    
    STATE.isPlaying = true;
  } else {
    // Fallback para canciones sin YouTube
    $('#now-playing').textContent = `${track.title} — ${album.title} — ${band.name} (No disponible en YouTube)`;
  }
  
  updatePlayerButtons();
}

function hashCode(str) {
  let h=0; for (let i=0;i<str.length;i++){ h = ((h<<5)-h) + str.charCodeAt(i); h |= 0; }
  return h;
}

function ensureAudio() {
  if (!STATE.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    STATE.audioContext = new AudioCtx();
  }
}

function playTone(freq = 440, duration = 2, onended = null) {
  ensureAudio();
  stopTone();
  const ctx = STATE.audioContext;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  STATE.oscillator = osc;
  STATE.gainNode = gain;
  STATE.isPlaying = true;
  setTimeout(() => { stopTone(); if(onended) onended(); }, duration*1000);
}

function stopTone() {
  if (STATE.oscillator) {
    try { STATE.oscillator.stop(); } catch(e){}
    STATE.oscillator.disconnect?.();
    STATE.gainNode?.disconnect?.();
  }
  STATE.isPlaying = false;
  updateProgressUI(0);
  updatePlayerButtons();
}

function updateProgressUI(pct=0){
  $('#progress-bar').style.width = pct+'%';
}

function updatePlayerButtons(){
  $('#play-btn').disabled = STATE.isPlaying;
  $('#pause-btn').disabled = !STATE.isPlaying;
  $('#stop-btn').disabled = !STATE.isPlaying;
}

/* ------------------ EVENTOS / UI ------------------ */
function bindUI() {
  $('#band-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    
    // Crear nueva banda con datos básicos
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
    
    // Validar campos obligatorios
    if (!newBand.name || !newBand.genre) {
      showToast('⚠️ Nombre y género son obligatorios', 'error');
      return;
    }
    
    // Procesar imagen si existe
    const imgInput = $('#band-img');
    if (imgInput.files[0]) {
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
  
  // Botón para agregar video de YouTube
  $('#add-youtube').addEventListener('click', addYoutubeLink);
  
  $('#search-input').addEventListener('input', debounce(()=>applySearchAndFilter(),250));
  $('#genre-filter').addEventListener('change', applySearchAndFilter);
  $('#clear-search').addEventListener('click', ()=>{ 
    $('#search-input').value=''; 
    $('#genre-filter').value=''; 
    renderBands(); 
    renderAlbums(); 
  });
}

function finalizeBandCreation(newBand) {
  // Agregar banda al estado
  STATE.bands.push(newBand);
  STATE.genres.add(newBand.genre);
  
  // Guardar en localStorage
  saveBandsToLocalStorage();
  
  // Limpiar formulario y links temporales
  $('#band-form').reset();
  $('#preview-img').classList.add('hidden');
  STATE.tempYoutubeLinks = [];
  renderYoutubeLinks();
  
  // Actualizar UI
  renderGenres();
  renderBands();
  
  showToast(`✅ Banda "${newBand.name}" agregada exitosamente`);
}

function applySearchAndFilter(){
  renderBands($('#search-input').value, $('#genre-filter').value);
}

function debounce(fn, ms=200){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms);} }

/* ------------------ INICIO ------------------ */
async function bootstrap(){
  await loadData();
  renderGenres();
  renderBands();
  renderAlbums();
  bindUI();
}

bootstrap();
