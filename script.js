// --- CONFIGURACIÓN DE RUTAS ---
const rutas = {
    "YO": [ 
        { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "099000000" },
        { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" }
    ],
    "REPARTIDOR 1": [ 
        { nombre: "Planta Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
    ]
};

// Lógica de usuario
let usuarioActivo = localStorage.getItem('nombre_repartidor');
if (!usuarioActivo) {
    let eleccion = prompt("¿Quién eres? (Escribe YO o REPARTIDOR 1)");
    usuarioActivo = (eleccion && rutas[eleccion.toUpperCase()]) ? eleccion.toUpperCase() : "YO";
    localStorage.setItem('nombre_repartidor', usuarioActivo);
}

const clientes = rutas[usuarioActivo] || rutas["YO"];

// --- SONIDOS ---
const sonidoCheck = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');
sonidoCheck.volume = 1.0;
sonidoAlerta.volume = 1.0;

let entregados = JSON.parse(localStorage.getItem(`entregas_${usuarioActivo}`)) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = []; 

// --- FUNCIONES DE CONTROL ---
function reiniciarRuta() {
    if (confirm(`¿Quieres limpiar todas las entregas de ${usuarioActivo}?`)) {
        entregados = [];
        clientesAlertados = [];
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        entregados.push(nombre);
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        sonidoCheck.play().catch(() => {});
        actualizarPantalla();
    }
}

function cambiarUsuario() {
    if(confirm("¿Cambiar de repartidor?")) {
        localStorage.removeItem('nombre_repartidor');
        location.reload();
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (!lat1 || lat1 === 0) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    if (!lista) return;
    
    const porcentaje = (entregados.length / clientes.length) * 100;
    document.getElementById('progress-bar').style.width = `${porcentaje}%`;
    document.getElementById('status').innerHTML = `
        <div class="flex justify-between items-center w-full px-2">
            <span>Repartidor: <b>${usuarioActivo}</b></span>
            <button onclick="cambiarUsuario()" class="text-[9px] bg-slate-200 px-2 py-1 rounded">Cambiar</button>
        </div>
        <div class="mt-1 font-bold">PROGRESO: ${entregados.length} / ${clientes.length}</div>
    `;

    const listaOrdenada = [...clientes].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const d = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        const cerca = d < 0.20 && !esEntregado; // Menos de 200 metros
        
        if (cerca && !clientesAlertados.includes(c.nombre)) {
            sonidoAlerta.play().catch(() => {});
            clientesAlertados.push(c.nombre);
        }

        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}&travelmode=driving`;

        lista.innerHTML += `
            <div class="${esEntregado ? 'opacity-50 bg-gray-200' : (cerca ? 'bg-yellow-100 border-yellow-500 scale-105' : 'bg-white border-slate-200')} p-4 rounded-2xl shadow-sm border-2 flex justify-between items-center mb-3 transition-all duration-300">
                <div class="flex-1">
                    <h3 class="font-bold text-sm text-slate-800">${c.nombre}</h3>
                    <p class="${esEntregado ? 'text-gray-500' : (cerca ? 'text-red-600 animate-bounce' : 'text-blue-600')} text-xs font-black uppercase mt-1">
                        ${esEntregado ? 'LISTO ✓' : (cerca ? '¡HAS LLEGADO!' : d.toFixed(2) + ' km')}
                    </p>
                </div>
                <div class="flex gap-2 ml-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-2 text-2xl font-bold ${esEntregado ? 'text-green-600' : 'text-slate-400'}">✓</button>
                    <a href="${mapUrl}" target="_blank" class="bg-blue-600 p-3 rounded-xl text-white shadow-md">📍</a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="bg-green-500 p-3 rounded-xl text-white shadow-md italic font-bold text-xs">WA</a>
                </div>
            </div>
        `;
    });
}

navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    document.getElementById('gps-dot').className = "w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    document.getElementById('gps-text').innerText = "GPS Conectado";
    actualizarPantalla();
}, () => {
    document.getElementById('gps-text').innerText = "Sin GPS";
}, { enableHighAccuracy: true });

// Carga inicial
actualizarPantalla();

