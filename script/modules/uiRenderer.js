/**
 * =======================================
 *  UI RENDERER - Renderizado visual
 *  Proyecto Final - Lucas Álvarez
 * =======================================
 */

export function renderProducts(products, container) {
  container.innerHTML = ''; // Limpia grilla
  if (!products.length) {
    container.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
    return;
  }

  products.forEach(prod => {
    const card = document.createElement('article');
    card.classList.add('product-card');

    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" class="product-img">
      <div class="card-body">
        <h3 class="product-title">${prod.name}</h3>
        <p class="product-price">$${prod.price}</p>
        <button class="btn-add" data-id="${prod.id}">Agregar al carrito</button>
      </div>
    `;

    container.appendChild(card);
  });
}
