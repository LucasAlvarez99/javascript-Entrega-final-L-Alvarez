// apiService.js
// Maneja la obtención de cotización (compra/venta) y conversión USD -> ARS
let cotizacionDolar = { compra: null, venta: null };

export async function obtenerCotizacion() {
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
    const data = await res.json();

    const oficial = data.oficial || data.oficial_euro || null;
    const compra = oficial?.value_buy ?? oficial?.compra ?? null;
    const venta = oficial?.value_sell ?? oficial?.venta ?? null;

    if (compra && venta) {
      cotizacionDolar = { compra, venta };
      return cotizacionDolar;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error cotización', err);
    return null;
  }
}

// Convertir usando valor de venta (requisito)
export function convertirPrecio(precioUSD) {
  if (!cotizacionDolar.venta) return `${precioUSD.toFixed(2)} USD`;
  const precioARS = precioUSD * cotizacionDolar.venta;
  return `$${precioARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`;
}

export function convertirPrecioNumber(precioUSD) {
  if (!cotizacionDolar.venta) return null;
  return precioUSD * cotizacionDolar.venta;
}

export function getCotizacionActual() {
  return cotizacionDolar;
}
