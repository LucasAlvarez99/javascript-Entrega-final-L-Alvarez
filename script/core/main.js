import { initTheme, mostrarToast } from '../modules/uiExtras.js';
import { obtenerCotizacion } from '../modules/apiService.js';

// =========================================
// 🚀 INICIO
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  verificarSesion();
  await cargarCotizacion();
  await cargarProductos();
  configurarCarrito();
  configurarFlujoCompra();
});

// =========================================
// 🔐 Verificar sesión
// =========================================
function verificarSesion() {
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  if (!session) {
    mostrarToast('⚠️ Iniciá sesión para acceder');
    setTimeout(() => (window.location.href = '../index.html'), 1500);
  } else {
    const userArea = document.getElementById('user-area');
    userArea.innerHTML = `
      <span>Hola, ${session.nombre}</span>
      <button id="logoutHeader" class="btn small">Salir</button>
    `;
    document.getElementById('logoutHeader').addEventListener('click', () => {
      localStorage.removeItem('session');
      mostrarToast('👋 Sesión cerrada');
      setTimeout(() => (window.location.href = '../index.html'), 1000);
    });
  }
}

// =========================================
// 💵 Cotización dólar
// =========================================
async function cargarCotizacion() {
  const cotizacionTexto = document.getElementById('cotizacion-texto');
  const spinner = document.getElementById('spinner');

  spinner.classList.remove('hidden');
  const cot = await obtenerCotizacion();
  spinner.classList.add('hidden');

  if (cot) {
    cotizacionTexto.textContent = `💵 Compra: $${cot.compra} | Venta: $${cot.venta}`;
  } else {
    cotizacionTexto.textContent = '⚠️ Error al obtener cotización';
  }
}

// =========================================
// 🎮 Cargar productos
// =========================================
async function cargarProductos() {
  try {
    const res = await fetch('../script/data/games.json');
    const productos = await res.json();
    renderProductos(productos);
  } catch (err) {
    console.error('Error al cargar productos', err);
  }
}

function renderProductos(productos) {
  const container = document.getElementById('productos');
  container.innerHTML = '';

  productos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="info">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>$${p.precio}</strong></p>
        <button class="btn primary small" data-id="${p.id}">Agregar al carrito</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.btn.primary.small').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      agregarAlCarrito(id, productos);
    });
  });
}

// =========================================
// 🛒 Carrito
// =========================================
function getCart() {
  return JSON.parse(localStorage.getItem('carrito') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('carrito', JSON.stringify(cart));
  actualizarContador();
}

function agregarAlCarrito(id, productos) {
  const cart = getCart();
  const prod = productos.find(p => p.id == id);
  cart.push(prod);
  saveCart(cart);
  mostrarToast(`🛒 ${prod.nombre} agregado`);
}

function actualizarContador() {
  const cart = getCart();
  document.getElementById('cartCount').textContent = cart.length;
}

function vaciarCarrito() {
  localStorage.removeItem('carrito');
  actualizarContador();
  document.getElementById('cartItems').innerHTML = '';
  document.getElementById('cartTotal').textContent = 'Total: $0';
}

function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  const closeCart = document.getElementById('closeCart');
  const emptyCart = document.getElementById('emptyCart');
  const confirmPurchase = document.getElementById('confirmPurchase');

  cartButton.addEventListener('click', () => {
    cartPanel.classList.toggle('show');
    renderCarrito();
  });
  closeCart.addEventListener('click', () => cartPanel.classList.remove('show'));
  emptyCart.addEventListener('click', vaciarCarrito);
  confirmPurchase.addEventListener('click', () => {
    if (!getCart().length) {
      mostrarToast('🛒 El carrito está vacío');
      return;
    }
    abrirModalCompra();
  });
}

function renderCarrito() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  container.innerHTML = '';
  let total = 0;

  cart.forEach(p => {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `<p>${p.nombre}</p><span>$${p.precio}</span>`;
    container.appendChild(item);
    total += parseFloat(p.precio);
  });

  totalEl.textContent = `Total: $${total}`;
}

// =========================================
// 💳 Flujo de compra (3 pasos)
// =========================================
function abrirModalCompra() {
  document.getElementById('purchaseModal').classList.remove('hidden');
  document.getElementById('purchaseStep1').classList.add('active');
  document.getElementById('purchaseStep2').classList.add('hidden');
  document.getElementById('purchaseStep3').classList.add('hidden');
  document.getElementById('purchaseStepTitle').textContent = 'Paso 1: Datos de contacto';
}

function configurarFlujoCompra() {
  const modal = document.getElementById('purchaseModal');
  const closePurchase = document.getElementById('closePurchase');
  const toast = document.getElementById('toast');

  // Navegación de pasos
  const step1 = document.getElementById('purchaseStep1');
  const step2 = document.getElementById('purchaseStep2');
  const step3 = document.getElementById('purchaseStep3');

  document.getElementById('toStep2').addEventListener('click', () => {
    if (!step1.querySelector('#contactName').value.trim()) return mostrarToast('📝 Ingresá tu nombre');
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    document.getElementById('purchaseStepTitle').textContent = 'Paso 2: Método de pago';
  });

  document.getElementById('backToStep1').addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
    document.getElementById('purchaseStepTitle').textContent = 'Paso 1: Datos de contacto';
  });

  document.getElementById('toStep3').addEventListener('click', () => {
    const metodo = document.getElementById('paymentMethod').value;
    if (metodo === 'efectivo') {
      finalizarCompra();
    } else if (metodo === 'tarjeta') {
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      document.getElementById('purchaseStepTitle').textContent = 'Paso 3: Datos de tarjeta';
    } else {
      mostrarToast('⚠️ Elegí un método de pago');
    }
  });

  document.getElementById('backToStep2').addEventListener('click', () => {
    step3.classList.add('hidden');
    step2.classList.remove('hidden');
    document.getElementById('purchaseStepTitle').textContent = 'Paso 2: Método de pago';
  });

  document.getElementById('finalizePurchase').addEventListener('click', finalizarCompra);

  closePurchase.addEventListener('click', () => modal.classList.add('hidden'));

  function finalizarCompra() {
    vaciarCarrito();
    modal.classList.add('hidden');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
    mostrarConfeti();
  }
}

// =========================================
// 🎉 Confeti
// =========================================
function mostrarConfeti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const piezas = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * 20 + 10,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    tilt: Math.random() * 10 - 10
  }));

  function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    piezas.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    mover();
  }

  function mover() {
    piezas.forEach(p => {
      p.y += Math.cos(p.d) + 1 + p.r / 2;
      p.x += Math.sin(p.d);
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  let anim;
  function loop() {
    dibujar();
    anim = requestAnimationFrame(loop);
  }
  loop();

  setTimeout(() => {
    cancelAnimationFrame(anim);
    canvas.remove();
  }, 2500);
}
