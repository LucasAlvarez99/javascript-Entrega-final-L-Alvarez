/**
 * =======================================
 *  HOME MODULE - Control de productos
 *  Proyecto Final - Lucas Álvarez
 * =======================================
 */

import { renderProducts } from './uiRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  let allProducts = [];

  // Carga inicial de productos
  try {
    const response = await fetch('../data/games.json');
    if (!response.ok) throw new Error('Error al cargar productos');
    allProducts = await response.json();
    renderProducts(allProducts, productGrid);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    productGrid.innerHTML = '<p class="error-msg">No se pudieron cargar los productos.</p>';
  }

  // Filtrar productos por nombre
  const handleSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered, productGrid);
  };

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
});
