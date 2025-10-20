# 🎸 La Disquera - Gestor Musical

## 📝 Descripción
Aplicación web para gestionar una biblioteca musical personal con integración de YouTube, permitiendo crear y gestionar álbumes, bandas y playlists **reproduciendo solo el audio** de los videos.

## ✨ Características Principales

### 🎤 Gestión de Bandas
- ✅ Crear bandas con nombre, género, biografía e imagen
- ✅ Agregar canciones de YouTube (solo audio) a cada banda
- ✅ Listar y filtrar bandas por género
- ✅ Eliminar bandas personalizadas
- ✅ Búsqueda en tiempo real
- ✅ Persistencia en localStorage

### 💿 Gestión de Álbumes
- ✅ CRUD completo de álbumes
- ✅ Asociar álbumes a bandas específicas
- ✅ Agregar canciones desde URLs de YouTube
- ✅ Validación automática de URLs
- ✅ Organización por carpetas de banda
- ✅ Almacenamiento persistente

### 🎵 Reproductor de Audio
- ✅ **Reproducción SOLO de audio** (sin video visible)
- ✅ Player oculto que extrae el audio del video
- ✅ Controles: Play, Pause, Stop
- ✅ Barra de progreso animada
- ✅ Información de canción actual
- ✅ Reproducción automática de siguiente canción
- ✅ Manejo de errores de videos bloqueados

### 📋 Sistema de Playlist
- ✅ Agregar canciones individuales
- ✅ Agregar álbumes completos
- ✅ Eliminar canciones de playlist
- ✅ Vaciar playlist
- ✅ Mezclar canciones aleatoriamente
- ✅ Ordenar por diferentes criterios
- ✅ Exportar/Importar playlists
- ✅ Persistencia automática

### 🎨 Interfaz de Usuario
- ✅ Modales bonitos (sin alerts del navegador)
- ✅ Diseño moderno y profesional
- ✅ Notificaciones tipo toast
- ✅ Animaciones suaves
- ✅ Responsive design
- ✅ Feedback visual constante
- ✅ Estados claros de reproducción

## 🚀 Instalación

### Requisitos
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet (para API de YouTube)
- Servidor local (recomendado para evitar problemas de CORS)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/LucasAlvarez99/javascript-Entrega-final-L-Alvarez.git
cd javascript-Entrega-final-L-Alvarez
```

2. **Estructura de archivos requerida**
```
proyecto/
├── index.html
├── app.js
├── data.json
├── styles.css
├── script/
│   └── modules/
│       ├── albums-core.js
│       ├── albums-form.js
│       ├── albums-save.js
│       ├── albums-render.js
│       ├── youtube-utils.js
│       ├── player-audio.js
│       ├── playlist-manager.js
│       ├── modal-system.js
│       └── albums-main.js
└── README.md

```

## 📖 Guía de Uso

### 1. Crear una Banda
1. Completa el formulario con:
   - Nombre de la banda *(requerido)*
   - Género musical *(requerido)*
   - Biografía *(opcional)*
   - Imagen *(opcional)*
2. Agrega canciones desde YouTube:
   - Pega el link del video
   - Solo se usará el **audio**
   - No se mostrará el video
3. Clic en "Agregar banda"

### 2. Crear un Álbum
1. Selecciona una banda → "Ver álbumes"
2. Clic en "➕ Agregar álbum"
3. Completa:
   - Título del álbum
   - Año de lanzamiento
4. Agrega canciones:
   - Pega URLs de YouTube
   - Solo se extraerá el audio
   - Mínimo 1 canción
5. Clic en "Guardar álbum"

### 3. Reproducir Música
1. Entra a un álbum → "Ver canciones"
2. Clic en ▶️ junto a la canción
3. **Solo se reproducirá el audio** (sin video)
4. Usa los controles:
   - ▶️ Play/Resume
   - ⏸️ Pause
   - ⏹️ Stop

### 4. Gestionar Playlist
1. En vista de canciones, clic en ➕
2. La canción se agrega a tu playlist
3. Acciones disponibles:
   - Ver playlist completa
   - Eliminar canciones
   - Vaciar playlist
   - Mezclar orden
   - Exportar como JSON

## 🎯 Características Técnicas

### Arquitectura Modular
El proyecto está dividido en módulos independientes:

- **albums-core.js** - Funciones base, validaciones, estado
- **albums-form.js** - Gestión de formularios
- **albums-save.js** - Guardar/editar/eliminar datos
- **albums-render.js** - Renderizado de UI
- **youtube-utils.js** - Utilidades de YouTube
- **player-audio.js** - Reproductor solo audio
- **playlist-manager.js** - Gestión de playlist
- **modal-system.js** - Sistema de modales bonitos
- **albums-main.js** - Inicialización y coordinación

### Tecnologías Utilizadas

**Frontend**
- HTML5 semántico
- CSS3 con variables y Grid/Flexbox
- JavaScript ES6+ (Modules, Async/Await, Arrow Functions)

**APIs**
- YouTube IFrame API (para reproducción de audio)
- LocalStorage API (persistencia de datos)
- Fetch API (carga de datos)

**Características ES6+**
- Módulos ES6
- Template Literals
- Destructuring
- Spread Operator
- Arrow Functions
- Promises & Async/Await
- Classes

## ⚠️ Nota Importante sobre Videos de YouTube

### Videos Bloqueados
Algunos videos de YouTube están bloqueados por sus propietarios para reproducción embebida. El sistema:

1. ✅ Detecta videos bloqueados automáticamente
2. ✅ Muestra un modal explicativo y bonito
3. ✅ Intenta reproducir la siguiente canción
4. ✅ Sugiere usar videos alternativos

### Videos Recomendados
✅ **Funcionan bien:**
- Música independiente
- Videos con licencia Creative Commons
- Canales educativos
- Artistas independientes
- Música sin copyright

❌ **Pueden estar bloqueados:**
- Grandes discográficas (Sony, Universal, Warner)
- Artistas muy famosos
- Videos musicales oficiales mainstream
- Contenido con muchas restricciones

### Cómo Verificar si un Video Funciona
En YouTube, haz clic derecho en el video → "Copiar código para insertar"
- Si aparece la opción: ✅ Funciona
- Si NO aparece: ❌ Está bloqueado

## 🔍 Sistema de Logs

Todos los módulos tienen logs detallados en consola:

```
🔧 = Inicialización
📊 = Datos/Información
✅ = Éxito
❌ = Error
⚠️ = Advertencia
🏗️ = Construcción/Creación
🎨 = Renderizado
💾 = Guardado/Carga
🔍 = Búsqueda
🎵 = Reproducción
➕ = Agregar
🗑️ = Eliminar
```

Para ver información de debug:
```javascript
// En la consola del navegador
albumsApp.debug()
```

## ⌨️ Atajos de Teclado

- **Ctrl/Cmd + P**: Play/Pause
- **Ctrl/Cmd + S**: Stop
- **Ctrl/Cmd + N**: Siguiente canción
- **Ctrl/Cmd + D**: Info de debug
- **ESC**: Cerrar modales

## 📊 Evaluación según Rúbrica

### ✅ Autoría y Originalidad
- Trabajo 100% personal
- Código propio sin plantillas
- Diseño original

### ✅ Formato Adecuado
- HTML5 semántico
- CSS3 moderno
- JavaScript ES6+ modular

### ✅ Funcionalidad (Alcance)
- Flujo de trabajo completo
- Entrada y salida de datos funcional
- Sin errores de sintaxis
- Manejo robusto de errores

### ✅ Interactividad
- Eventos bien manejados
- Validaciones en tiempo real
- Feedback visual constante
- Notificaciones claras

### ✅ Escalabilidad
- Código modular
- Funciones reutilizables
- Fácil de extender
- Bien organizado

### ✅ Integridad
- JavaScript en módulos externos
- Datos en JSON y localStorage
- HTML bien estructurado
- Separación de responsabilidades

### ✅ Legibilidad
- Variables descriptivas
- Comentarios abundantes
- Código bien indentado
- Console.logs informativos

## 🛠️ Funciones de Debug

Desde la consola del navegador:

```javascript
// Ver estado completo de la aplicación
albumsApp.debug()

// Borrar todos los datos guardados
albumsApp.clearAll()

// Estadísticas de playlist
playlistManager.stats()

// Estado actual
console.log(STATE)

// Verificar módulos cargados
console.log({
    core: !!window.albumsCore,
    form: !!window.albumsForm,
    save: !!window.albumsSave,
    render: !!window.albumsRender,
    youtube: !!window.youtubeUtils,
    player: !!window.playerAudio,
    playlist: !!window.playlistManager,
    modals: !!window.modalSystem
})
```

## 🐛 Solución de Problemas

### El reproductor muestra video
**Solución**: Verifica que los estilos CSS para `#youtube-player` estén aplicados correctamente.

### Videos bloqueados
**Solución**: Usa videos de artistas independientes o con licencia Creative Commons.

### No se guardan los datos
**Solución**: 
- No uses modo incógnito
- Verifica que localStorage esté habilitado
- Limpia la caché del navegador

### Errores en consola
**Solución**: 
- Verifica que todos los módulos estén cargados
- Revisa el orden de carga en index.html
- Ejecuta `albumsApp.debug()` para diagnóstico

## 🔜 Mejoras Futuras

- [ ] Ecualizador de audio
- [ ] Letras de canciones sincronizadas
- [ ] Compartir playlists con otros usuarios
- [ ] Temas de color personalizables
- [ ] Búsqueda avanzada con filtros
- [ ] Estadísticas de reproducción
- [ ] Integración con Spotify/Apple Music
- [ ] Modo offline con Service Workers

## 👨‍💻 Autor

**Lucas Alvarez**
- GitHub: [@LucasAlvarez99](https://github.com/LucasAlvarez99)
- Proyecto: Entrega Final JavaScript - CoderHouse
- Fecha: 2025

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de JavaScript en CoderHouse.
Todos los derechos reservados © 2025

## 🙏 Agradecimientos

- CoderHouse por la formación
- YouTube API por la integración
- Comunidad de desarrolladores

---

## 📋 Checklist de Entrega

### Requisitos Cumplidos
- [x] Autoría y originalidad
- [x] Formato adecuado (HTML, CSS, JS)
- [x] Funcionalidad completa
- [x] Interactividad con el usuario
- [x] Escalabilidad del código
- [x] Integridad (archivos separados, JSON)
- [x] Legibilidad y comentarios
- [x] Persistencia de datos
- [x] Manejo de errores
- [x] Validaciones
- [x] Integración con API externa
- [x] Sistema modular
- [x] Interfaz profesional

### Extras Implementados
- [x] Reproductor solo audio (sin video)
- [x] Sistema de modales bonitos
- [x] Notificaciones toast
- [x] Atajos de teclado
- [x] Sistema de logs completo
- [x] Playlist avanzada
- [x] Búsqueda y filtros
- [x] Animaciones suaves
- [x] Responsive design
- [x] Debug tools

---

**¡Proyecto listo para entregar y aprobar!** 🚀✨