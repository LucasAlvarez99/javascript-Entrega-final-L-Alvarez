/**
 * =======================================
 *  HOME MODULE - Proyecto Final L. Álvarez
 * =======================================
 * 
 * Funcionalidad:
 *  - Carga productos desde data/products.json
 *  - Muestra cotización del dólar (oficial y blue)
 *  - Permite agregar productos al carrito (AppStorage)
 *  - Verifica sesión activa (AppStorage)
 *  - Respeta tema oscuro/claro (AppMain)
 */

document.addEventListener("DOMContentLoaded", async () => {
  const user = AppStorage.getUser();
  const productContainer = document.getElementById("productContainer");
  const dollarInfo = document.getElementById("dollarInfo");
  const cartCount = document.getElementById("cartCount");

  // Bloquear acceso si no hay usuario
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  // Mostrar nombre en header
  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.textContent = user.name || user.username;

  // Aplicar tema guardado
  AppMain.applyTheme();

  // === 1️⃣ Cargar productos ===
  try {
    const res = await fetch("../data/products.json");
    if (!res.ok) throw new Error("No se pudo cargar el archivo products.json");
    const products = await res.json();

    productContainer.innerHTML = "";
    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "col-md-3 mb-4";
      card.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <img src="../assets/${p.image}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column justify-content-between">
            <h5 class="card-title text-center">${p.name}</h5>
            <p class="card-text text-center text-muted mb-2">${p.description}</p>
            <p class="text-center fw-bold mb-3">$${p.price.toLocaleString()}</p>
            <button class="btn btn-primary w-100 add-to-cart" data-id="${p.id}">
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
      productContainer.appendChild(card);
    });

    // Evento para agregar al carrito
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        const product = products.find((p) => p.id === id);
        if (product) {
          AppStorage.addToCart(product);
          updateCartCount();
          showToast(`"${product.name}" agregado al carrito.`);
        }
      });
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    productContainer.innerHTML = `<p class="text-danger text-center">Error al cargar productos.</p>`;
  }

  // === 2️⃣ API del dólar ===
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares");
    const data = await res.json();
    const oficial = data.find((d) => d.casa === "oficial");
    const blue = data.find((d) => d.casa === "blue");

    if (oficial && blue) {
      dollarInfo.innerHTML = `
        <div class="d-flex justify-content-center gap-3">
          <span class="badge bg-success">💵 Oficial: $${oficial.venta}</span>
          <span class="badge bg-primary">💸 Blue: $${blue.venta}</span>
        </div>
      `;
    }
  } catch (error) {
    console.warn("Error al obtener dólar:", error);
    dollarInfo.innerHTML = `<span class="text-muted">No se pudo cargar el dólar</span>`;
  }

  // === 3️⃣ Funciones auxiliares ===
  function updateCartCount() {
    const cart = AppStorage.getCart();
    cartCount.textContent = cart.length;
  }

  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  updateCartCount();
});
