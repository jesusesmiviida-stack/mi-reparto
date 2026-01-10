document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del Menú Móvil
    const menuBtn = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
    });

    // 2. Galería Automática
    const carrusel = document.getElementById('galeria-carrusel');
    let isPaused = false;

    function autoScroll() {
        if (!isPaused) {
            carrusel.scrollLeft += 1;
            // Reiniciar cuando llega al final
            if (carrusel.scrollLeft >= (carrusel.scrollWidth - carrusel.clientWidth)) {
                carrusel.scrollLeft = 0;
            }
        }
    }

    let interval = setInterval(autoScroll, 25); // Velocidad suave

    // Pausar al tocar o pasar el mouse
    carrusel.addEventListener('mouseenter', () => isPaused = true);
    carrusel.addEventListener('mouseleave', () => isPaused = false);
    carrusel.addEventListener('touchstart', () => isPaused = true);
    carrusel.addEventListener('touchend', () => isPaused = false);

    // 3. Efecto Confetti al botón
    document.getElementById('btn-unirme').addEventListener('click', (e) => {
        e.preventDefault();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
});
