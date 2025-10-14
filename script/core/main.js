// =============================
// CORE: main.js
// =============================
// Carga productos, obtiene cotización del dólar,
// controla el tema, la moneda y el modal de productos.

import { obtenerCotizacion } from "../modules/apiService.js";
import { renderProductos, renderCarrito, vaciarCarrito, toggleMoneda } from "../modules/uiRenderer.js";
import { initTheme } from "../modules/themeManager.js";

// Variables globales
let productos = [];

// Elementos del DOM
const productosContainer = document.getElementById("productos");
const carritoContainer = document.getElementById("carrito-lista");
const totalElemento = document.getElementById("total");
const cotizacionTexto = document.getElementById("cotizacion-texto");
const spinner = document.getElementById("spinner");
const modal = document.getElementById("modal");
const abrirForm = document.getElementById("abrirForm");
const cerrarModal = document.getElementById("cerrarModal");
const formAgregar = document.getElementById("form-agregar");

// =============================
// INICIALIZACIÓN
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  initTheme(); // activar modo celestial/diabólico

  await cargarCotizacion();
  await cargarProductos();

  // Eventos principales
  document.getElementById("vaciarCarrito").addEventListener("click", vaciarCarrito);
  document.getElementById("currencyToggle").addEventListener("click", toggleMoneda);

  // Eventos del modal
  abrirForm.addEventListener("click", () => modal.classList.remove("hidden"));
  cerrarModal.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // Evento para agregar producto
  formAgregar.addEventListener("submit", agregarProducto);
});

// =============================
// COTIZACIÓN DEL DÓLAR (HEADER)
// =============================
async function cargarCotizacion() {
  spinner.classList.remove("hidden");
  const cotizacion = await obtenerCotizacion();
  spinner.classList.add("hidden");

  if (cotizacion) {
    cotizacionTexto.textContent = `💵 Compra: $${cotizacion.compra} | Venta: $${cotizacion.venta}`;
  } else {
    cotizacionTexto.textContent = "⚠️ No se pudo obtener la cotización";
  }
}

// =============================
// CARGA DE PRODUCTOS
// =============================
async function cargarProductos() {
  try {
    const response = await fetch("script/data/games.json");
    const data = await response.json();
    productos = data;
    renderProductos(productos, productosContainer);
    renderCarrito(carritoContainer, totalElemento);
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
}

// =============================
// AGREGAR NUEVO PRODUCTO (MODAL)
// =============================
function agregarProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precioUSD = parseFloat(document.getElementById("precio").value);
  const categoria = document.getElementById("categoria").value.trim();
  const imagenInput = document.getElementById("imagen");
  const descripcion = document.getElementById("descripcion").value.trim();
  const desarrollador = document.getElementById("desarrollador").value.trim();
  const lanzamiento = document.getElementById("lanzamiento").value;

  if (!imagenInput.files[0]) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  // Convertir imagen a Base64
  const reader = new FileReader();
  reader.onload = function (event) {
    const nuevaImagen = event.target.result;

    const nuevoProducto = {
      id: productos.length + 1,
      nombre,
      precio_usd: precioUSD,
      categoria,
      imagen: nuevaImagen,
      descripcion,
      desarrollador,
      lanzamiento
    };

    productos.push(nuevoProducto);
    renderProductos(productos, productosContainer);

    // Crear JSON actualizado para descarga
    const jsonString = JSON.stringify(productos, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.getElementById("descargar-json");
    link.href = url;
    link.classList.remove("hidden");

    // Cerrar modal tras guardar
    modal.classList.add("hidden");
  };

  reader.readAsDataURL(imagenInput.files[0]);

  // Resetear formulario
  e.target.reset();
}

// =============================
// REFRESCAR COTIZACIÓN AUTOMÁTICAMENTE
// =============================
setInterval(async () => {
  const cotizacion = await obtenerCotizacion();
  if (cotizacion) {
    cotizacionTexto.textContent = `💵 Compra: $${cotizacion.compra} | Venta: $${cotizacion.venta}`;
  }
}, 5 * 60 * 1000); // cada 5 minutos
