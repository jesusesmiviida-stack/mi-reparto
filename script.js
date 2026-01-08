// --- CONFIGURACIÓN DE RUTAS POR REPARTIDOR ---
// Aquí puedes agregar tantos repartidores y clientes como necesites
const rutas = {
    "YO": [ 
        { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "099000000" },
        { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" }
    ],
    "REPARTIDOR 1": [ 
        { nombre: "Planta Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" },
        { nombre: "Punto Entrega A", lat: -34.8000, lon: -56.2400, tel: "091000111" }
    ],
    "REPARTIDOR 2": [
        { nombre: "Cliente Norte", lat: -34.7500, lon: -56.2100, tel: "092000222" },
        { nombre: "Cliente Sur", lat: -34.7800, lon: -56.2300, tel: "093000333" }
    ]
};

// Lógica de inicio y selección de usuario
let usuarioActivo = localStorage.getItem('nombre_repartidor');

if (!usuarioActivo) {
    const nombresDisponibles = Object.keys(rutas).join(", ");
    let eleccion = prompt(`¿Quién eres? Escribe tu nombre:\n(${nombresDisponibles})`);
    
    if (eleccion && rutas[eleccion.toUpperCase()]) {
        usuarioActivo = eleccion.toUpperCase();
        localStorage.setItem('nombre_repartidor', usuarioActivo);
    } else {
        usuarioActivo = "YO"; 
        localStorage.setItem('nombre_repartidor', "YO");
    }
}

const clientes = rutas[usuarioActivo];

// --- SISTEMA DE SONIDOS ---
const sonidoCheck = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');
sonidoCheck.volume = 1.0;
sonidoAlerta.volume = 1.0;

let entregados = JSON.parse(localStorage.getItem(`entregas_${usuarioActivo}`)) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = []; 

const gpsOpciones = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };

// Función para cerrar sesión o cambiar repartidor
function cambiarUsuario() {
    if(confirm("¿Quieres salir de esta ruta y cambiar de repartidor?")) {
        localStorage.removeItem('nombre_repartidor');
        location.reload();
    }
}

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
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        sonidoCheck.play().catch(e => console.log("Click para audio"));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm(`¿Limpiar entregas de ${usuarioActivo}?`)) {
        entregados = [];
        clientesAlertados = [];
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status');
    
    const porcentaje = (entregados.length / clientes.length) * 100;
    progressBar.style.width = `${porcentaje}%`;
    statusText.innerHTML = `
        <div class="flex justify-between items-center w-full px-2">
            <span class="text-left">Repartidor: <b>${usuarioActivo}</b></span>
            <button onclick="cambiarUsuario()" class="text-[9px] bg-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold uppercase">Cambiar</button>
        </div>
        <div class="mt-1">PROGRESO: ${entregados.length} / ${clientes.length} (${porcentaje.toFixed(0)}%)</div>
    `;

    const listaOrdenada = [...clientes].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const d = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const distTxt = d.toFixed(2);
        const esEntregado = entregados.includes(c.nombre);

        if (!esEntregado && d < 0.20 && !clientesAlertados.includes(c.nombre)) {
            sonidoAlerta.play().catch(e => console.log("Audio bloq"));
            clientesAlertados.push(c.nombre);
        }
        
        const mapUrl = `https://support.google.com/maps/answer/18539?hl=es&co=GENIE.Platform%3DDesktop{c.lat},${c.lon}`;
        
        lista.innerHTML += `
            <div class="${esEntregado ? 'bg-gray-200 opacity-60' : (d < 0.20 ? 'bg-yellow-100 border-yellow-500 scale-105' : 'bg-white border-slate-200')} p-4 rounded-2xl shadow-sm border-2 flex justify-between items-center mb-3 transition-all">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800 text-sm leading-tight">${c.nombre}</h3>
                    <p class="${esEntregado ? 'text-gray-500' : (d < 0.20 ? 'text-red-600 animate-bounce' : 'text-blue-600')} text-[10px] font-black uppercase mt-1">
                        ${esEntregado ? 'Completado ✓' : (d < 0.20 ? '¡LLEGASTE!' : distTxt + ' km')}
                    </p>
                </div>
                <div class="flex gap-2 ml-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="p-2 ${esEntregado ? 'text-green-600' : 'text-slate-400'} text-2xl font-bold">✓</button>
                    <a href="${mapUrl}" target="_blank" class="bg-blue-600 p-3 rounded-xl text-white shadow-md flex items-center justify-center">📍</a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="bg-green-500 p-3 rounded-xl text-white shadow-md flex items-center justify-center font-bold text-xs italic">WA</a>
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
}, error => {
    document.getElementById('gps-dot').className = "w-2.5 h-2.5 bg-red-500 rounded-full";
    document.getElementById('gps-text').innerText = "Sin Señal GPS";
}, gpsOpciones);
}, gpsOpciones);


