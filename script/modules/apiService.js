// Servicios de API
class ApiService {
    constructor() {
        this.baseURL = 'https://api.bluelytics.com.ar/v2/latest';
    }

    async getDollarRates() {
        try {
            console.log('💰 Obteniendo cotización del dólar...');
            
            const response = await fetch(this.baseURL);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            
            const data = await response.json();
            console.log('✅ Datos del dólar obtenidos:', data);
            
            return {
                compra: data.oficial.value_buy,
                venta: data.oficial.value_sell,
                fecha: new Date().toLocaleTimeString()
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo cotización:', error);
            
            // Datos de respaldo
            return {
                compra: '865.50',
                venta: '905.50', 
                fecha: new Date().toLocaleTimeString(),
                error: true
            };
        }
    }

    updateDollarDisplay(rates) {
        document.getElementById('dolarCompra').textContent = `$${rates.compra}`;
        document.getElementById('dolarVenta').textContent = `$${rates.venta}`;
        document.getElementById('dolarFecha').textContent = rates.fecha;
        
        if (rates.error) {
            document.getElementById('dolarInfo').classList.add('text-warning');
        }
    }
}

// Instancia global
const apiService = new ApiService();