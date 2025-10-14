# 🎮 GameStore - Simulador de Tienda de Videojuegos

## Descripción
Simulador interactivo de una tienda online de videojuegos desarrollado en JavaScript vanilla como proyecto final del curso.

## Características
- ✅ Catálogo dinámico de juegos desde JSON
- ✅ Carrito de compras con persistencia en localStorage
- ✅ Filtros por categoría y búsqueda
- ✅ Formulario de compra precargado
- ✅ Confirmación de compra simulada
- ✅ Interfaz responsive con Bootstrap
- ✅ Uso de SweetAlert2 para modales

## Estructura de Archivos

proyecto/
├── index.html
├── styles/
│ └── style.css
├── scripts/
│ ├── main.js
│ ├── cart.js
│ ├── ui.js
│ └── data.json
└── README.md



## Instalación y Uso
1. Descargar todos los archivos en una carpeta
2. Abrir `index.html` en un navegador web
3. No se requiere servidor - funciona directamente desde el sistema de archivos

## Funcionalidades Principales
- Agregar/eliminar juegos del carrito
- Modificar cantidades
- Vaciar carrito completo
- Finalizar compra con formulario precargado
- Persistencia de datos en localStorage

## Tecnologías Utilizadas
- HTML5, CSS3, JavaScript ES6+
- Bootstrap 5.3.0
- SweetAlert2
- LocalStorage API
- Fetch API

## Notas para el Corrector
- Los datos de formulario vienen precargados para facilitar las pruebas
- El carrito se guarda automáticamente en localStorage
- No se requiere registro/login
- Todas las funcionalidades están simuladas (no hay backend real)