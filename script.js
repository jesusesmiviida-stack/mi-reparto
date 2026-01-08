const rutas = {
    "YO": [ 
        { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "59899000000" },
        { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "59899123456" },
        { nombre: "Cementerio La Paz", lat: -34.7522039, lon: -56.2288156, tel: "59823622619" },
        { nombre: "Planta Sarubbi", lat: -34.8052, lon: -56.2411, tel: "59898765432" }
    ]
};

let usuarioActivo = "YO";
let entregados = JSON.parse(localStorage.getItem(`entregas_${usuarioActivo}`)) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = [];

const sonidoAlerta = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

function vibrar(p) { if(navigator.vibrate) navigator.vibrate(p); }

function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        vibrar(50);
        entregados.push(nombre);
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Limpiar lista para mañana?")) {
        entregados = [];
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        location.reload();
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    if(!lista) return;

    const total = rutas[usuarioActivo].length;
    document.getElementById('status').innerText = `${entregados.length}/${total}`;
    document.getElementById('progress-bar').style.width = `${(entregados.length/total)*100}%`;

    const listaOrdenada = [...rutas[usuarioActivo]].sort((a,b) => entregados.includes(a.nombre) - entregados.includes(b.nombre));

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const d = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        const cerca = d < 0.20 && !esEntregado;

        if (cerca && !clientesAlertados.includes(c.nombre)) {
            vibrar([200, 100, 200]);
            sonidoAlerta.play().catch(()=>{});
            clientesAlertados.push(c.nombre);
        }

        lista.innerHTML += `
            <div class="cliente-card ${esEntregado ? 'opacity-40 grayscale' : (cerca ? 'llegada-anim' : '')}">
                <div class="flex-1 pr-4">
                    <h3 class="font-bold text-slate-800 text-base leading-tight">${c.nombre}</h3>
                    <p class="text-[11px] font-bold mt-1 ${cerca ? 'text-blue-600 animate-pulse' : 'text-slate-400'}">
                        ${esEntregado ? '✓ ENTREGADO' : (cerca ? '📍 LLEGANDO' : d.toFixed(2) + ' km')}
                    </p>
                </div>
                <div class="flex gap-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="btn-action btn-check ${esEntregado ? 'active' : ''}">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <a href="https://www.google.com/maps?q=${c.lat},${c.lon}" target="_blank" class="btn-action btn-maps">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    </a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="btn-action btn-wa">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.12 1.51 5.861L0 24l6.337-1.631C8.03 23.361 9.94 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                    </a>
                </div>
            </div>
        `;
    });
}

navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    const dot = document.getElementById('gps-dot');
    if(dot) dot.style.backgroundColor = '#10b981';
    const text = document.getElementById('gps-text');
    if(text) text.innerText = "GPS Activo";
    actualizarPantalla();
}, null, { enableHighAccuracy: true });

actualizarPantalla();
