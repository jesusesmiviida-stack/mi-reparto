const clientes = [
    { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "099000000" },
    { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
    { nombre: "Planta Industrial Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
];

// SONIDOS MÁS FUERTES Y CLAROS
const sonidoCheck = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');

// Forzar volumen máximo
sonidoCheck.volume = 1.0;
sonidoAlerta.volume = 1.0;

let entregados = JSON.parse(localStorage.getItem('entregas_realizadas')) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = []; 

const gpsOpciones = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };

function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (lat1 === 0) return 999;
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
        sonidoCheck.play().catch(e => console.log("Toca la pantalla para activar audio"));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Quieres limpiar las entregas?")) {
        entregados = [];
        clientesAlertados = [];
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
        const d = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const distTxt = d.toFixed(2);
        const esEntregado = entregados.includes(c.nombre);

        // AVISO DE LLEGADA (200 metros)
        if (!esEntregado && d < 0.20 && !clientesAlertados.includes(c.nombre)) {
            sonidoAlerta.play().catch(e => console.log("Audio bloqueado"));
            clientesAlertados.push(c.nombre);
        }
        
        const mapUrl = `https://support.google.com/maps/answer/18539?hl=es&co=GENIE.Platform%3DDesktop{c.lat},${c.lon}`;
        
        lista.innerHTML += `
            <div class="${esEntregado ? 'bg-gray-200 opacity-60 border-slate-300' : (d < 0.20 ? 'bg-yellow-100 border-yellow-500 scale-105' : 'bg-white border-slate-200')} p-4 rounded-2xl shadow-sm border-2 flex justify-between items-center transition-all">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800">${c.nombre}</h3>
                    <p class="${esEntregado ? 'text-gray-500' : (d < 0.20 ? 'text-red-600 animate-bounce' : 'text-blue-600')} text-xs font-bold uppercase tracking-wider">
                        ${esEntregado ? 'Completado ✓' : (d < 0.20 ? '¡HAS LLEGADO!' : distTxt + ' km')}
                    </p>
                </div>
                <div class="flex gap-3">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-2 ${esEntregado ? 'text-green-600' : 'text-slate-400'} text-3xl font-bold">✓</button>
                    <a href="${mapUrl}" target="_blank" class="bg-blue-600 p-3 rounded-xl text-white shadow-md">📍</a>
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

