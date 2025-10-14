let cotizacionDolar = { compra: null, venta: null };

// --- Obtener cotización del dólar ---
export async function obtenerCotizacion() {
  try {
    const response = await fetch("https://api.bluelytics.com.ar/v2/latest");
    const data = await response.json();

    const oficial = data.oficial;
    const compra = oficial.value_buy;
    const venta = oficial.value_sell;

    if (compra && venta) {
      cotizacionDolar = { compra, venta };
      console.log(`💵 Dólar oficial → Compra: $${compra} | Venta: $${venta}`);
      return cotizacionDolar;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

// --- Conversión: usar valor de venta ---
export function convertirPrecio(precioUSD) {
  if (!cotizacionDolar.venta)
    return `${precioUSD.toFixed(2)} USD`;
  const precioARS = precioUSD * cotizacionDolar.venta;
  return `$${precioARS.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ARS`;
}

export function getCotizacionActual() {
  return cotizacionDolar;
}
