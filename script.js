// 1. BASE DE DATOS DE RUTAS
const rutas = {
    "YO": [ 
        { nombre: "MI CASA", lat: -34.763602, lon: -56.243176, tel: "099000000" },
        { nombre: "Super La Paz", lat: -34.7621, lon: -56.2234, tel: "099123456" },
        { nombre: "Cementerio La Paz", lat: -34.7522039, lon: -56.2288156, tel: "23622619" },
        { nombre: "Planta Sarubbi", lat: -34.8052, lon: -56.2411, tel: "098765432" }
    ]
};

// 2. VARIABLES DE ESTADO
let usuarioActivo = "YO";
let entregados = JSON.parse(localStorage.getItem(`entregas_${usuarioActivo}`)) || [];
let miUbicacion = { lat: 0, lon: 0 };
let clientesAlertados = []; // Para evitar que la alerta suene repetidamente en un mismo punto

// 3. RECURSOS (Sonidos)
const sonidoAlerta = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1154-fountain-filled.mp3');

// 4. FUNCIONES DE APOYO (Vibración y Cálculo)
function vibrar(patron) {
    if (navigator.vibrate) {
        navigator.vibrate(patron);
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 5. ACCIONES DEL USUARIO
function marcarEntrega(nombre) {
    if (!entregados.includes(nombre)) {
        vibrar(50); // Vibración corta de éxito
        entregados.push(nombre);
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        actualizarPantalla();
    }
}

function reiniciarRuta() {
    if (confirm("¿Deseas limpiar la lista y comenzar una nueva jornada?")) {
        vibrar([50, 100, 50]);
        entregados = [];
        localStorage.setItem(`entregas_${usuarioActivo}`, JSON.stringify(entregados));
        location.reload();
    }
}

// 6. MOTOR DE RENDERIZADO (Dibuja la App)
function actualizarPantalla() {
    const lista = document.getElementById('lista-entregas');
    if (!lista) return;

    // Actualizar contador superior
    const total = rutas[usuarioActivo].length;
    document.getElementById('status').innerText = `${entregados.length} / ${total}`;
    
    // Actualizar barra de progreso (si existe en el HTML)
    const barra = document.getElementById('progress-bar');
    if (barra) {
        const porcentaje = (entregados.length / total) * 100;
        barra.style.width = `${porcentaje}%`;
    }

    // Ordenar: primero pendientes, luego entregados
    const listaOrdenada = [...rutas[usuarioActivo]].sort((a, b) => {
        return entregados.includes(a.nombre) - entregados.includes(b.nombre);
    });

    lista.innerHTML = '';
    listaOrdenada.forEach(c => {
        const dist = calcularDistancia(miUbicacion.lat, miUbicacion.lon, c.lat, c.lon);
        const esEntregado = entregados.includes(c.nombre);
        const cerca = dist < 0.20 && !esEntregado; // Menos de 200 metros

        // Disparar alerta si llega a un punto nuevo
        if (cerca && !clientesAlertados.includes(c.nombre)) {
            vibrar([200, 100, 200]);
            sonidoAlerta.play().catch(() => {});
            clientesAlertados.push(c.nombre);
        }

        lista.innerHTML += `
            <div class="cliente-card ${esEntregado ? 'opacity-50' : (cerca ? 'llegada-anim' : '')}">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800 text-base leading-tight">${c.nombre}</h3>
                    <p class="text-[11px] font-bold mt-1 ${cerca ? 'text-blue-600 animate-pulse' : 'text-slate-400'}">
                        ${esEntregado ? '✓ COMPLETADO' : (cerca ? '📍 ¡LLEGASTE!' : dist.toFixed(2) + ' km')}
                    </p>
                </div>
                <div class="flex gap-3">
                    <button onclick="marcarEntrega('${c.nombre}')" class="btn-action btn-check ${esEntregado ? 'active' : ''}">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}" target="_blank" class="btn-action btn-maps">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </a>
                    <a href="https://wa.me/${c.tel}" target="_blank" class="btn-action btn-wa">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.212l-.669 2.445 2.508-.658c.879.479 1.858.82 2.904.821h.006c3.182 0 5.768-2.586 5.769-5.766 0-3.18-2.587-5.765-5.769-5.765z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    });
}

// 7. INICIALIZACIÓN DEL GPS
function iniciarGPS() {
    if (!navigator.geolocation) {
        document.getElementById('gps-text').innerText = "GPS NO SOPORTADO";
        return;
    }

    navigator.geolocation.watchPosition(
        pos => {
            miUbicacion.lat = pos.coords.latitude;
            miUbicacion.lon = pos.coords.longitude;
            
            const dot = document.getElementById('gps-dot');
            const text = document.getElementById('gps-text');
            
            if (dot) dot.classList.replace('bg-slate-300', 'bg-emerald-500');
            if (text) text.innerText = "EN VIVO";
            
            actualizarPantalla();
        },
        err => {
            console.warn("Error GPS:", err);
            const text = document.getElementById('gps-text');
            if (text) text.innerText = "ERROR DE SEÑAL";
        },
        { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
        }
    );
}

// Ejecutar al cargar
iniciarGPS();
actualizarPantalla();
