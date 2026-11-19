document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('dotMenuBtn');
    const menu = document.getElementById('dotMenuPopover');
    if (!button || !menu) return;
    let backdrop = document.querySelector('.dot-menu-backdrop');
    if (!backdrop) { backdrop = document.createElement('div'); backdrop.className = 'dot-menu-backdrop'; document.body.appendChild(backdrop); }
    let open = false, previousOverflow = '';
    button.setAttribute('aria-controls', menu.id);
    button.setAttribute('aria-expanded', 'false');
    menu.inert = true;
    function setOpen(value, restoreFocus = false) {
        if (open === value) return;
        open = value;
        button.classList.toggle('is-active', open); menu.classList.toggle('is-open', open); backdrop.classList.toggle('is-active', open);
        button.setAttribute('aria-expanded', String(open)); menu.inert = !open;
        if (open) { previousOverflow = document.body.style.overflow; if (window.innerWidth <= 768) document.body.style.overflow = 'hidden'; if (window.lenis) window.lenis.stop(); }
        else { document.body.style.overflow = previousOverflow; if (window.lenis) window.lenis.start(); if (restoreFocus) button.focus(); }
    }
    button.addEventListener('click', event => { event.stopPropagation(); setOpen(!open); });
    backdrop.addEventListener('click', () => setOpen(false, true));
    menu.querySelectorAll('.pop-link').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', event => { if (open && !menu.contains(event.target) && !button.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', event => {
        if (!open) return;
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
        if (event.key === 'Tab') {
            const focusable = [button, ...menu.querySelectorAll('a[href],button:not([disabled])')];
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    window.addEventListener('resize', () => { if (open) document.body.style.overflow = window.innerWidth <= 768 ? 'hidden' : previousOverflow; }, { passive:true });
});
