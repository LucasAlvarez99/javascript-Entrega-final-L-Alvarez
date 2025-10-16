// uiRenderer.js
import { convertirPrecio, convertirPrecioNumber } from './apiService.js';

let productos = [];
let carrito = []; // array de items {id, nombre, precio_usd, cantidad, imagen}
let mostrarEnPesos = true;

export function setProductos(list) {
  productos = list;
}

export function renderProductos(container) {
  container.innerHTML = '';
  productos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" />
      <h3>${p.nombre}</h3>
      <p class="meta">${p.categoria} • ${p.desarrollador}</p>
      <p>${p.descripcion}</p>
      <p><strong>${mostrarEnPesos ? convertirPrecio(p.precio_usd) : p.precio_usd.toFixed(2) + ' USD'}</strong></p>
      <div style="display:flex;gap:.5rem;width:100%;justify-content:center">
        <button class="btn add-btn" data-id="${p.id}">Agregar</button>
      </div>
    `;
    container.appendChild(card);
  });

  // listeners
  container.querySelectorAll('.add-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const prod = productos.find(x => x.id === id);
      if (prod) agregarAlCarrito(prod);
    });
  });

  updateCartCountUI();
}

function findInCart(id) {
  return carrito.find(i => i.id === id);
}

export function agregarAlCarrito(producto) {
  const existente = findInCart(producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio_usd: producto.precio_usd,
      cantidad: 1,
      imagen: producto.imagen
    });
  }
  updateCartCountUI();
  renderCartItems();
}

export function removeFromCart(id) {
  carrito = carrito.filter(i => i.id !== id);
  updateCartCountUI();
  renderCartItems();
}

export function vaciarCarrito() {
  carrito = [];
  updateCartCountUI();
  renderCartItems();
}

export function getCart() {
  return carrito;
}

export function getCartTotalNumber() {
  const totalUSD = carrito.reduce((sum, it) => sum + it.precio_usd * it.cantidad, 0);
  const totalARS = convertirPrecioNumber(totalUSD);
  return { totalUSD, totalARS };
}

export function toggleCurrency() {
  mostrarEnPesos = !mostrarEnPesos;
  const btn = document.getElementById('currencyToggle');
  if (btn) btn.textContent = mostrarEnPesos ? '💰 ARS' : '💵 USD';
  renderProductos(document.getElementById('productos'));
  renderCartItems();
}

export function initCartUI() {
  document.getElementById('cartButton').addEventListener('click', () => {
    const panel = document.getElementById('cartPanel');
    panel.classList.toggle('hidden');
  });
  document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartPanel').classList.add('hidden');
  });

  document.getElementById('emptyCart').addEventListener('click', vaciarCarrito);
  document.getElementById('confirmPurchase').addEventListener('click', () => {
    // abrir modal de compra
    document.getElementById('purchaseModal').classList.remove('hidden');
  });
}

function updateCartCountUI() {
  const countEl = document.getElementById('cartCount');
  const totalItems = carrito.reduce((s, it) => s + it.cantidad, 0);
  countEl && (countEl.textContent = totalItems);
  // update side panel list
  renderCartItems();
}

export function renderCartItems() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container || !totalEl) return;

  container.innerHTML = '';
  if (carrito.length === 0) {
    container.innerHTML = '<p>El carrito está vacío.</p>';
    totalEl.textContent = 'Total: $0';
    return;
  }

  carrito.forEach(it => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    const precioDisplay = mostrarEnPesos ? convertirPrecio(it.precio_usd) : `${it.precio_usd.toFixed(2)} USD`;
    div.innerHTML = `
      <div style="flex:1">
        <strong>${it.nombre}</strong>
        <div class="meta">${precioDisplay} × ${it.cantidad}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:.3rem;align-items:flex-end">
        <button class="btn small inc" data-id="${it.id}">+</button>
        <button class="btn small remove" data-id="${it.id}">-</button>
      </div>
    `;
    container.appendChild(div);
  });

  // attach inc/dec
  container.querySelectorAll('.inc').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const item = carrito.find(x => x.id === id);
      if (item) { item.cantidad += 1; updateCartCountUI(); }
    });
  });
  container.querySelectorAll('.remove').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      const item = carrito.find(x => x.id === id);
      if (!item) return;
      item.cantidad -= 1;
      if (item.cantidad <= 0) {
        removeFromCart(id);
      } else {
        updateCartCountUI();
      }
    });
  });

  const totals = getCartTotalNumber();
  if (totals.totalARS !== null) totalEl.textContent = `Total: $${totals.totalARS.toLocaleString('es-AR', {minimumFractionDigits:2,maximumFractionDigits:2})} ARS`;
  else totalEl.textContent = `Total: ${totals.totalUSD.toFixed(2)} USD`;
}
