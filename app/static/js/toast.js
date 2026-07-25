function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showConfirmDialog(message, options = {}) {
    const confirmText = options.confirmText || 'Confirmer';
    const cancelText = options.cancelText || 'Annuler';

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal show';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const icon = document.createElement('div');
        icon.className = 'modal-icon';
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

        const title = document.createElement('div');
        title.className = 'modal-title font-display';
        title.textContent = 'Attention';

        const text = document.createElement('div');
        text.className = 'modal-text';
        text.textContent = message;

        const actions = document.createElement('div');
        actions.className = 'confirm-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-ghost';
        cancelBtn.style.color = 'var(--color-text-primary)';
        cancelBtn.style.background = 'var(--color-surface-alt)';
        cancelBtn.textContent = cancelText;

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = confirmText;

        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(text);
        content.appendChild(actions);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        function cleanup(result) {
            overlay.remove();
            resolve(result);
        }

        cancelBtn.addEventListener('click', () => cleanup(false));
        confirmBtn.addEventListener('click', () => cleanup(true));
    });
}
