// LISTA DE CLIENTES (Puedes agregar más aquí siguiendo el mismo formato)
const clientes = [
    { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
    { nombre: "Planta Industrial Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
];

// Cargar entregas guardadas
let entregados = JSON.parse(localStorage.getItem('entregas_realizadas')) || [];
let miUbicacion = { lat: 0, lon: 0 };

// CONFIGURACIÓN DE GPS DE ALTA PRECISIÓN
const gpsOpciones = {
    enableHighAccuracy: true, // Obliga al celular a usar el GPS real, no solo Wi-Fi
    maximumAge: 0,            // No usa ubicaciones viejas guardadas
    timeout: 10000            // Tiempo máximo de espera para encontrar señal
};

// Función para calcular distancia exacta en KM
function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (lat1 === 0) return "..."; // Si aún no hay GPS, muestra puntos
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}

function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        entregados.push(nombre);
        localStorage.setItem('entregas_realizadas', JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Quieres limpiar las entregas y empezar de cero?")) {
        entregados = [];
        localStorage.setItem('entregas_realizadas', JSON.stringify(entregados));
        actualizarPantalla();
        window.scrollTo(0, 0);
    }
}

function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    
    // Ordenar para que los pendientes queden arriba
    const listaOrdenada = [...clientes].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const dist = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        
        lista.innerHTML += `
            <div class="${esEntregado ? 'bg-gray-200 opacity-60' : 'bg-white'} p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center transition-all">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800">${c.nombre}</h3>
                    <p class="${esEntregado ? 'text-gray-500' : 'text-blue-600'} text-sm font-bold">
                        ${esEntregado ? 'Entregado' : dist + ' km de distancia'}
                    </p>
                </div>
                <div class="flex gap-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-3 ${esEntregado ? 'text-green-600' : 'text-slate-300'} font-bold text-xl">✓</button>
                    <a href="https://www.google.com/maps?q=${c.lat},${c.lon}" target="_blank" class="bg-blue-600 p-3 rounded-full text-white shadow-md">📍</a>
                    <a href="https://wa.me/${c.tel}" class="bg-green-500 p-3 rounded-full text-white shadow-md">WA</a>
                </div>
            </div>
        `;
    });
    document.getElementById('status').innerText = `Entregas: ${entregados.length} / ${clientes.length}`;
}

// RASTREO EN TIEMPO REAL: Se activa cada vez que te mueves
navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    actualizarPantalla(); // Refresca las distancias automáticamente
}, error => {
    console.warn("Buscando señal de GPS...");
}, gpsOpciones);

