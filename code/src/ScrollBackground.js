const updateBackground = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const progress = scrollPosition / windowHeight;



    // Activate appropriate layer
    document.querySelectorAll('.background-layer').forEach((layer, index) => {
        if (Math.abs(index - progress) < 0.5) {
            layer.classList.add('active');
            /*
            console.debug({
                "scrollPosition": ((Math.round(scrollPosition * 100)) / 100),
                "progress": ((Math.round(progress * 100)) / 100),
                "active": layer.style.backgroundImage,
            });
            */
        } else {
            layer.classList.remove('active');
        }
    });

};

// Throttle scroll events
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateBackground();
            ticking = false;
        });
        ticking = true;
    }
});