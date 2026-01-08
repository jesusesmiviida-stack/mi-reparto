let entregas = [
    { id: 1, nombre: "Super La Paz", lat: -34.7619729, lng: -56.2283198, telefono: "59899123456", finalizado: false },
    { id: 2, nombre: "Cliente de Prueba", lat: -34.6037, lng: -58.3816, telefono: "59899000000", finalizado: false }
];

function iniciarApp() {
    dibujarInterfaz();
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
        const wspLink = `https://wa.me/${e.telefono}?text=Hola%20${e.nombre},%20estoy%20en%20camino%20con%20tu%20pedido.`;
        
        lista.innerHTML += `
            <div class="p-4 border-2 rounded-2xl mb-2 flex justify-between items-center ${e.finalizado ? 'bg-green-50 border-green-500' : 'bg-white border-blue-100'}">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800">${e.nombre}</h3>
                    <p class="text-sm text-blue-600 font-bold">${e.finalizado ? '✓ OK' : distText}</p>
                </div>
                <div class="flex gap-2">
                    <a href="${wspLink}" target="_blank" class="bg-green-500 text-white p-2 rounded-full shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.481 5.229 3.481 8.406c0 6.556-5.332 11.888-11.888 11.888-2.01 0-3.991-.51-5.741-1.478l-6.243 1.701zm6.086-5.309l.395.235c1.408.84 3.12 1.282 4.885 1.282 5.204 0 9.442-4.238 9.442-9.441 0-2.52-1.01-4.889-2.842-6.722s-4.202-2.841-6.721-2.841c-5.204 0-9.441 4.238-9.441 9.441 0 1.933.566 3.813 1.635 5.41l.258.388-1.071 3.908 4.053-1.103z"/></svg>
                    </a>
                </div>
            </div>`;
    });
}

iniciarApp();
