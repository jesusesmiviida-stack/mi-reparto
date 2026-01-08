// 1. BASE DE DATOS DE ENTREGAS
let entregas = [
    { id: 1, nombre: "Panadería Central", lat: -34.7619685, lng: -56.2308947, finalizado: false },
    { id: 2, nombre: "Farmacia Sol", lat: -34.6100, lng: -58.4000, finalizado: false },
    { id: 3, nombre: "Supermercado Luna", lat: -34.5900, lng: -58.3700, finalizado: false }
];

// 2. MONITOR DE UBICACIÓN
function iniciarSeguimiento() {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta GPS");
        return;
    }

    navigator.geolocation.watchPosition(pos => {
        const miLat = pos.coords.latitude;
        const miLng = pos.coords.longitude;
        
        document.getElementById('status').innerText = `📡 GPS Activo: ${miLat.toFixed(4)}, ${miLng.toFixed(4)}`;

        verificarDistancias(miLat, miLng);
    }, error => {
        console.error(error);
        document.getElementById('status').innerText = "❌ Error al obtener GPS";
    }, {
        enableHighAccuracy: true
    });
}

// 3. LÓGICA DE CIERRE AUTOMÁTICO
function verificarDistancias(miLat, miLng) {
    entregas.forEach(e => {
        if (!e.finalizado) {
            e.distancia = calcularKM(miLat, miLng, e.lat, e.lng);
            
            // Si estás a menos de 50 metros (0.05 km), finaliza solo
            if (e.distancia < 0.05) {
                e.finalizado = true;
                notificarEntrega(e.nombre);
            }
        }
    });

    // Reordenar: Primero las pendientes por cercanía, luego las finalizadas
    entregas.sort((a, b) => a.finalizado - b.finalizado || a.distancia - b.distancia);
    dibujarInterfaz();
}

// 4. CÁLCULO MATEMÁTICO (Fórmula Haversine)
function calcularKM(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// 5. RENDERIZADO DE TARJETAS
function dibujarInterfaz() {
    const lista = document.getElementById('lista-entregas');
    lista.innerHTML = '';
    
    entregas.forEach(e => {
        const div = document.createElement('div');
        div.className = `card-entrega p-4 border-2 rounded-2xl bg-white shadow-sm ${e.finalizado ? 'entrega-finalizada' : 'border-blue-100'}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-slate-700">${e.nombre}</h3>
                    <p class="text-xs text-gray-400 font-mono">${e.lat}, ${e.lng}</p>
                </div>
                <div class="text-right">
                    <span class="text-sm font-black ${e.finalizado ? 'text-green-600' : 'text-blue-600'}">
                        ${e.finalizado ? '✓ OK' : e.distancia.toFixed(2) + ' km'}
                    </span>
                </div>
            </div>
        `;
        lista.appendChild(div);
    });
}

function notificarEntrega(nombre) {
    // Aquí puedes añadir un sonido o vibración
    if ("vibrate" in navigator) navigator.vibrate(200);
    console.log(`Entrega completada en: ${nombre}`);
}


iniciarSeguimiento();
