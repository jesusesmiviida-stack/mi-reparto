let entregas = [
    { id: 1, nombre: "Super La Paz", lat: -34.7619729, lng: -56.2283198, telefono: "59899123456", finalizado: false },
    { id: 2, nombre: "Planta Industrial Sarubbi", lat: -34.8055454, lng: -56.187732, telefono: "59823219328", finalizado: false }
];

function iniciarApp() {
    dibujarInterfaz();
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const miLat = pos.coords.latitude;
            const miLng = pos.coords.longitude;
            actualizarDistancias(miLat, miLng);
        }, error => {
            document.getElementById('status').innerText = "❌ GPS Desactivado";
        }, { enableHighAccuracy: true });
    }
}

function actualizarDistancias(miLat, miLng) {
    entregas.forEach(e => {
        if (!e.finalizado) {
            e.distancia = calcularKM(miLat, miLng, e.lat, e.lng);
            // Auto-finalizar si estás a menos de 50 metros
            if (e.distancia < 0.05) e.finalizado = true;
        }
    });
    dibujarInterfaz();
}

function calcularKM(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// NUEVA FUNCIÓN: Para finalizar manualmente al tocar el botón
function finalizarEntrega(id) {
    const index = entregas.findIndex(e => e.id === id);
    if (index !== -1) {
        entregas[index].finalizado = true;
        dibujarInterfaz();
    }
}

function dibujarInterfaz() {
    const lista = document.getElementById('lista-entregas');
    const status = document.getElementById('status');
    if (!lista) return;

    // Actualizar Contador
    const total = entregas.length;
    const hechas = entregas.filter(e => e.finalizado).length;
    status.innerHTML = `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">Progreso: ${hechas} / ${total}</span>`;

    lista.innerHTML = '';
    
    // Ordenar: Pendientes arriba, terminados abajo
    const listaOrdenada = [...entregas].sort((a, b) => a.finalizado - b.finalizado);

    listaOrdenada.forEach(e => {
        const distText = e.distancia ? `${e.distancia.toFixed(2)} km` : '-- km';
        const wspLink = `https://wa.me/${e.telefono}?text=Hola%20${e.nombre},%20estoy%20en%20camino.`;
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`;
        
        lista.innerHTML += `
            <div class="p-4 border-2 rounded-2xl mb-2 flex justify-between items-center ${e.finalizado ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-blue-100 shadow-sm'}">
                <div class="flex-1">
                    <h3 class="font-bold ${e.finalizado ? 'text-gray-500 line-through' : 'text-slate-800'}">${e.nombre}</h3>
                    <p class="text-sm font-bold ${e.finalizado ? 'text-gray-400' : 'text-blue-600'}">${e.finalizado ? '✓ Entregado' : distText}</p>
                </div>
                <div class="flex gap-2">
                    ${!e.finalizado ? `
                        <button onclick="finalizarEntrega(${e.id})" class="bg-gray-200 text-gray-700 p-2 rounded-full shadow-sm">✓</button>
                        <a href="${mapsLink}" target="_blank" class="bg-blue-600 text-white p-2 rounded-full shadow-md">📍</a>
                        <a href="${wspLink}" target="_blank" class="bg-green-500 text-white p-2 rounded-full shadow-md">WA</a>
                    ` : ''}
                </div>
            </div>`;
    });
}

iniciarApp();



