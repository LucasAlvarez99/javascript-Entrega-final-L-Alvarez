# 🎮 Tienda de Juegos - Proyecto Final

## 📋 Información general
**Autor:** Lucas Alvarez  
**Versión:** Entrega Final  
**Lenguaje:** JavaScript (ES6 Modules)  
**Fecha:** Octubre 2025  

Este proyecto representa la **entrega final del curso de JavaScript**.  
Consiste en una **tienda digital de videojuegos** que incluye:

- Conexión en tiempo real con la **API del dólar oficial**.  
- Sistema de **modo claro (celestial)** y **modo oscuro (diabólico)**.  
- Conversión dinámica de precios entre **USD ↔ ARS**.  
- Carrito de compras funcional.  
- Formulario emergente (modal) para agregar nuevos productos.  
- Descarga automática del JSON actualizado con los productos nuevos.

---

## 🚀 Funcionalidades principales

### 💵 Cotización del dólar
- Se obtiene desde la API pública:  
  **[https://api.bluelytics.com.ar/v2/latest](https://api.bluelytics.com.ar/v2/latest)**
- Muestra en el **header** los valores:
  - **Compra**
  - **Venta**
- Se actualiza cada 5 minutos.
- Usa el **valor de venta** para la conversión de precios a pesos.

### 🎨 Modo Celestial / Modo Diabólico
- Modo claro con colores celestes y tonos suaves.  
- Modo oscuro con rojos intensos y fondo oscuro.  
- Se guarda la preferencia en `localStorage`.

### 🛒 Carrito de compras
- Permite agregar y eliminar productos.
- Calcula el total en ARS o USD según el modo activo.
- Botón para vaciar el carrito.

### 💰 Cambio de moneda
- Alterna entre:
  - 💰 **Pesos Argentinos (ARS)**
  - 💵 **Dólares (USD)**
- Conversión en tiempo real usando la cotización oficial.

### ➕ Agregar juego (modal)
- Formulario modal flotante con los siguientes campos:
  - Nombre  
  - Precio (USD)  
  - Categoría  
  - Imagen (desde dispositivo)  
  - Descripción  
  - Desarrollador  
  - Fecha de lanzamiento  
- El juego se agrega dinámicamente a la lista de productos.

### Estructura

javascript-Entrega-final-L-Alvarez/
│
├── index.html
├── README.md
├── styles/
│   └── style.css
└── script/
    ├── core/
    │   └── main.js
    ├── data/
    │   └── games.json
    ├── modules/
    │   ├── apiService.js
    │   ├── themeManager.js
    │   └── uiRenderer.js

#### 📦 Datos de productos
Los productos se cargan desde un JSON externo:

`script/data/games.json`

Estructura del JSON:
```json
{
  "id": 1,
  "nombre": "Nebula Racer",
  "precio_usd": 39.99,
  "categoria": "Carreras",
  "imagen": "assets/nebula_racer.jpg",
  "descripcion": "Carreras intergalácticas con físicas avanzadas y pistas dinámicas.",
  "desarrollador": "LunarForge Studios",
  "lanzamiento": "2025-03-15"
}