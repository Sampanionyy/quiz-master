let showingAll = false;

function toggleReview() {
    const content = document.getElementById('reviewContent');
    const toggleText = document.getElementById('toggleText');
    const items = content.querySelectorAll('.answer-item');

    showingAll = !showingAll;

    if (showingAll) {
        items.forEach(item => item.style.display = 'block');
        toggleText.textContent = 'Masquer les correctes';
    } else {
        items.forEach(item => {
            if (item.classList.contains('correct')) {
                item.style.display = 'none';
            }
        });
        toggleText.textContent = 'Afficher tout';
    }
}

// Initially hide correct answers
window.addEventListener('load', () => {
    const items = document.querySelectorAll('.answer-item.correct');
    items.forEach(item => item.style.display = 'none');
});

// Animate the score number counting up
function animateScoreCount() {
    const el = document.getElementById('scoreNumber');
    if (!el) return;

    const target = parseInt(el.dataset.target, 10);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

window.addEventListener('load', animateScoreCount);