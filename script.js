const rutas = {
    "YO": [ 
        { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "099000000" },
        { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
        { nombre: "Cementerio La Paz", lat: -34.7522039, lon: -56.2288156, tel: "23622619" },
        { nombre: "Planta Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
    ]
};

let usuarioActivo = "YO";
let entregados = JSON.parse(localStorage.getItem(`entregas_${usuarioActivo}`)) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = [];

const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');

function vibrar(p) { if(navigator.vibrate) navigator.vibrate(p); }

function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        vibrar(40);
        entregados.push(nombre);
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Limpiar lista?")) {
        vibrar([30, 30]);
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
    const porcentaje = (entregados.length / rutas[usuarioActivo].length) * 100;
    document.getElementById('progress-bar').style.width = `${porcentaje}%`;
    document.getElementById('status').innerText = `${entregados.length}/${rutas[usuarioActivo].length}`;

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
            <div class="cliente-card p-5 flex justify-between items-center ${esEntregado ? 'opacity-40' : (cerca ? 'llegada-anim' : '')}">
                <div>
                    <h3 class="font-bold text-slate-800 text-base leading-tight">${c.nombre}</h3>
                    <p class="text-[11px] font-semibold mt-0.5 ${cerca ? 'text-blue-500' : 'text-slate-400'}">
                        ${esEntregado ? 'Entregado' : (cerca ? 'Llegaste al punto' : d.toFixed(2) + ' km')}
                    </p>
                </div>
                <div class="flex gap-2">
                    <button onclick="marcarEntrega('${c.nombre}')" class="btn-action btn-check ${esEntregado ? 'active' : ''}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <a href="https://www.google.com/maps?q=${c.lat},${c.lon}" target="_blank" class="btn-action btn-maps">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="btn-action btn-wa">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.912 0-3.791-.458-5.482-1.334l-6.515 1.742zm6.155-3.837l.389.231c1.472.873 3.165 1.335 4.904 1.336 5.178 0 9.386-4.209 9.389-9.39.002-2.51-.975-4.868-2.752-6.644s-4.134-2.753-6.644-2.755c-5.18 0-9.389 4.209-9.392 9.391-.001 1.83.528 3.615 1.531 5.18l.253.393-1.006 3.675 3.728-.997z"></path></svg>
                    </a>
                </div>
            </div>
        `;
    });
}

navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    document.getElementById('gps-dot').className = "w-2 h-2 bg-emerald-500 rounded-full animate-pulse";
    document.getElementById('gps-text').innerText = "En vivo";
    actualizarPantalla();
}, null, { enableHighAccuracy: true });

actualizarPantalla();

