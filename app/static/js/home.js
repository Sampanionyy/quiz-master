function animateCount(element) {
    const target = parseInt(element.dataset.value, 10);
    const suffix = element.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

window.addEventListener('load', () => {
    document.querySelectorAll('[data-count]').forEach(animateCount);
});
