// LISTA DE CLIENTES (Actualiza las coordenadas aquí)
const clientes = [
    { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
    { nombre: "Planta Industrial Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
];

let entregados = JSON.parse(localStorage.getItem('entregas_realizadas')) || [];
let miUbicacion = { lat: 0, lon: 0 };

const gpsOpciones = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15000
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (lat1 === 0) return "...";
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status');
    
    const porcentaje = (entregados.length / clientes.length) * 100;
    progressBar.style.width = `${porcentaje}%`;
    statusText.innerText = `PROGRESO: ${entregados.length} / ${clientes.length} (${porcentaje.toFixed(0)}%)`;

    const listaOrdenada = [...clientes].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const dist = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        
        // ENLACE DE GOOGLE MAPS CORREGIDO:
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`;
        
        lista.innerHTML += `
            <div class="${esEntregado ? 'bg-gray-200 opacity-60' : 'bg-white'} p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center transition-all">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800">${c.nombre}</h3>
                    <p class="${esEntregado ? 'text-gray-500' : 'text-blue-600'} text-xs font-bold uppercase tracking-wider">
                        ${esEntregado ? 'Completado ✓' : dist + ' km'}
                    </p>
                </div>
                <div class="flex gap-3">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-2 ${esEntregado ? 'text-green-600' : 'text-slate-300'} text-2xl font-bold">✓</button>
                    <a href="${mapUrl}" target="_blank" class="bg-blue-600 p-3 rounded-xl text-white shadow-md">📍</a>
                    <a href="https://wa.me/${c.tel}" class="bg-green-500 p-3 rounded-xl text-white shadow-md">WA</a>
                </div>
            </div>
        `;
    });
}

navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    
    const dot = document.getElementById('gps-dot');
    const txt = document.getElementById('gps-text');
    
    dot.className = "w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    txt.innerText = "GPS Conectado";
    txt.className = "text-[10px] font-bold text-green-600 tracking-widest uppercase";

    actualizarPantalla();
}, error => {
    const dot = document.getElementById('gps-dot');
    const txt = document.getElementById('gps-text');
    dot.className = "w-2.5 h-2.5 bg-red-500 rounded-full";
    txt.innerText = "Sin Señal GPS";
}, gpsOpciones);
