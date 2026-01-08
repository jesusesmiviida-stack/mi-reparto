let entregas = [
    { id: 1, nombre: "Super La Paz", lat: -34.7619729, lng: -56.2283198, finalizado: false },
    { id: 2, nombre: "Cliente de Prueba", lat: -34.6037, lng: -58.3816, finalizado: false }
];

function iniciarApp() {
    // 1. Dibujar la lista de inmediato
    dibujarInterfaz();
    
    // 2. Intentar obtener el GPS
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const miLat = pos.coords.latitude;
            const miLng = pos.coords.longitude;
            document.getElementById('status').innerText = `📡 GPS Activo`;
            actualizarDistancias(miLat, miLng);
        }, error => {
            document.getElementById('status').innerText = "❌ Error GPS: Activa tu ubicación";
        }, { enableHighAccuracy: true });
    }
}

function actualizarDistancias(miLat, miLng) {
    entregas.forEach(e => {
        if (!e.finalizado) {
            e.distancia = calcularKM(miLat, miLng, e.lat, e.lng);
            if (e.distancia < 0.05) e.finalizado = true;
        }
    });
    entregas.sort((a, b) => a.finalizado - b.finalizado || a.distancia - b.distancia);
    dibujarInterfaz();
}

function calcularKM(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function dibujarInterfaz() {
    const lista = document.getElementById('lista-entregas');
    lista.innerHTML = '';
    entregas.forEach(e => {
        const distText = e.distancia ? `${e.distancia.toFixed(2)} km` : '-- km';
        lista.innerHTML += `
            <div class="p-4 border-2 rounded-2xl mb-2 ${e.finalizado ? 'bg-green-50 border-green-500' : 'bg-white border-blue-100'}">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">${e.nombre}</span>
                    <span class="font-black text-blue-600">${e.finalizado ? '✓ OK' : distText}</span>
                </div>
            </div>`;
    });
}

// Arrancar la app
iniciarApp();


