// =============================
// MÓDULO: uiRenderer.js
// =============================
// Renderiza productos, carrito y gestiona la visualización de precios
// usando la cotización del dólar oficial.

// Importamos la función de conversión
import { convertirPrecio } from "./apiService.js";

let carrito = [];
let productos = [];
let mostrarEnPesos = true;

// --- Renderizado de productos ---
export function renderProductos(lista, contenedor) {
  productos = lista;
  contenedor.innerHTML = "";

  lista.forEach((producto) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p><strong>Desarrollador:</strong> ${producto.desarrollador}</p>
      <p><strong>Lanzamiento:</strong> ${producto.lanzamiento}</p>
      <p><strong>Precio:</strong> ${mostrarEnPesos ? convertirPrecio(producto.precio_usd) : `${producto.precio_usd.toFixed(2)} USD`}</p>
      <button class="btn agregar-carrito" data-id="${producto.id}">Agregar al carrito</button>
    `;

    contenedor.appendChild(card);
  });

  // Asignar evento a los botones "Agregar al carrito"
  const botones = document.querySelectorAll(".agregar-carrito");
  botones.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      const producto = productos.find((p) => p.id === id);
      agregarAlCarrito(producto);
    });
  });
}

// --- Renderizado del carrito ---
export function renderCarrito(contenedor, totalElemento) {
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    totalElemento.textContent = "";
    return;
  }

  carrito.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");
    div.innerHTML = `
      <p>${item.nombre} - ${mostrarEnPesos ? convertirPrecio(item.precio_usd) : `${item.precio_usd.toFixed(2)} USD`}
      <button class="btn btn-eliminar" data-id="${item.id}">❌</button></p>
    `;
    contenedor.appendChild(div);
  });

  const total = carrito.reduce((acc, item) => acc + item.precio_usd, 0);
  const totalConvertido = mostrarEnPesos ? convertirPrecio(total) : `${total.toFixed(2)} USD`;
  totalElemento.textContent = `Total: ${totalConvertido}`;

  // Eventos eliminar del carrito
  const botonesEliminar = document.querySelectorAll(".btn-eliminar");
  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      carrito = carrito.filter((p) => p.id !== id);
      renderCarrito(contenedor, totalElemento);
    });
  });
}

// --- Controladores ---
function agregarAlCarrito(producto) {
  carrito.push(producto);
  const contenedor = document.getElementById("carrito-lista");
  const total = document.getElementById("total");
  renderCarrito(contenedor, total);
}

export function vaciarCarrito() {
  carrito = [];
  const contenedor = document.getElementById("carrito-lista");
  const total = document.getElementById("total");
  renderCarrito(contenedor, total);
}

// --- Cambiar visualización de moneda ---
export function toggleMoneda() {
  mostrarEnPesos = !mostrarEnPesos;
  const currencyBtn = document.getElementById("currencyToggle");
  currencyBtn.textContent = mostrarEnPesos ? "💰 ARS" : "💵 USD";

  // Re-renderizar productos y carrito
  const contenedor = document.getElementById("productos");
  const carritoCont = document.getElementById("carrito-lista");
  const total = document.getElementById("total");

  renderProductos(productos, contenedor);
  renderCarrito(carritoCont, total);
}
