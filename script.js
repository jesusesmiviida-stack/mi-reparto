const clientes = [
    { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
    { nombre: "Planta Industrial Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
];

let entregados = JSON.parse(localStorage.getItem('entregas_realizadas')) || [];
let miUbicacion = { lat: 0, lon: 0 };

// Función de alta precisión
const gpsOpciones = {
    enableHighAccuracy: true, // USA EL GPS REAL
    maximumAge: 0,
    timeout: 10000
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
    const listaOrdenada = [...clientes].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const dist = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon).toFixed(2);
        const esEntregado = entregados.includes(c.nombre);
        
        lista.innerHTML += `
            <div class="${esEntregado ? 'bg-gray-200 opacity-60' : 'bg-white'} p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-slate-800">${c.nombre}</h3>
                    <p class="text-blue-600 text-sm font-medium">${dist} km</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-2 ${esEntregado ? 'text-green-600' : 'text-slate-300'} font-bold">✓</button>
                    <a href="https://www.google.com/maps?q=${c.lat},${c.lon}" target="_blank" class="bg-blue-600 p-2 rounded-full text-white">📍</a>
                    <a href="https://wa.me/${c.tel}" class="bg-green-500 p-2 rounded-full text-white">WA</a>
                </div>
            </div>
        `;
    });
    document.getElementById('status').innerText = `Progreso: ${entregados.length} / ${clientes.length}`;
}

// ESTO RASTREA TU MOVIMIENTO EN TIEMPO REAL
navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    actualizarPantalla();
}, error => {
    console.warn("Error de GPS: ", error);
}, gpsOpciones);



