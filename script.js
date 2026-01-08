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
const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');

function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        entregados.push(nombre);
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Quieres limpiar la lista para mañana?")) {
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

    const porcentaje = (entregados.length / rutas[usuarioActivo].length) * 100;
    document.getElementById('progress-bar').style.width = `${porcentaje}%`;
    document.getElementById('status').innerText = `${entregados.length} / ${rutas[usuarioActivo].length} COMPLETADOS`;

    const listaOrdenada = [...rutas[usuarioActivo]].sort((a,b) => entregados.includes(a.nombre) - entregados.includes(b.nombre));

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const d = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        const cerca = d < 0.20 && !esEntregado;

        lista.innerHTML += `
            <div class="cliente-card p-5 rounded-2xl flex justify-between items-center shadow-sm ${esEntregado ? 'opacity-40 grayscale' : (cerca ? 'llegada-anim' : '')}">
                <div class="flex-1 text-left">
                    <h3 class="font-bold text-slate-900 text-base leading-tight">${c.nombre}</h3>
                    <p class="text-[10px] font-black mt-1 uppercase tracking-widest ${cerca ? 'text-blue-600 animate-pulse' : 'text-slate-400'}">
                        ${esEntregado ? 'Completado ✓' : (cerca ? '📍 ¡LLEGANDO!' : d.toFixed(2) + ' km')}
                    </p>
                </div>
                <div class="flex gap-2 ml-4">
                    <button onclick="marcarEntrega('${c.nombre}')" class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${esEntregado ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}">✓</button>
                    <a href="https://www.google.com/maps?q=${c.lat},${c.lon}" target="_blank" class="btn-maps w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md">📍</a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="btn-wa w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md">💬</a>
                </div>
            </div>
        `;
    });
}

navigator.geolocation.watchPosition(pos => {
    miUbicacion.lat = pos.coords.latitude;
    miUbicacion.lon = pos.coords.longitude;
    document.getElementById('gps-dot').style.backgroundColor = '#22c55e'; // Verde
    document.getElementById('gps-text').innerText = "GPS CONECTADO";
    actualizarPantalla();
}, null, { enableHighAccuracy: true });

actualizarPantalla();
