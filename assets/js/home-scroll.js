/* Ease desktop wheel steps; touch, keyboard, zoom and nested panels stay native. */
(() => {
    'use strict';
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(pointer: fine)');
    let frame = 0, target = window.scrollY, position = target, written = target, last = 0;
    const max = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const clamp = value => Math.max(0, Math.min(max(), value));
    function cancel() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = 0; target = position = written = window.scrollY;
    }
    function blocked() {
        return reduce.matches || !fine.matches || document.hidden ||
            root.classList.contains('is-intro-loading') ||
            getComputedStyle(document.body).overflow === 'hidden';
    }
    function tick(time) {
        frame = 0;
        // A scrollbar drag, anchor or other native scroll takes control immediately.
        if (blocked() || Math.abs(window.scrollY - written) > 2) { cancel(); return; }
        target = clamp(target);
        const elapsed = last ? Math.min(time - last, 50) : 16.67;
        last = time;
        position += (target - position) * (1 - Math.exp(-elapsed / 55));
        if (Math.abs(target - position) < .5) position = target;
        window.scrollTo({top: position, behavior: 'instant'});
        written = window.scrollY;
        if (position !== target) frame = requestAnimationFrame(tick);
        else last = 0;
    }
    window.addEventListener('wheel', event => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || blocked() ||
            Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
        // Trackpads already provide small, continuous steps and OS momentum.
        if (event.deltaMode === 0 && Math.abs(event.deltaY) < 50) { cancel(); return; }
        // Preserve scrolling within menus, dialogs, text fields and other panels.
        for (let el = event.target; el && el !== document.body; el = el.parentElement) {
            if (!(el instanceof Element)) continue;
            if (el.matches('input, textarea, select, [contenteditable="true"], [role="dialog"]') ||
                (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight)) return;
        }
        if (!frame) target = position = written = window.scrollY;
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        const next = clamp(target + delta);
        if (next === target && !frame) return;
        event.preventDefault(); target = next;
        if (!frame) frame = requestAnimationFrame(tick);
    }, {passive: false});
    window.addEventListener('keydown', cancel);
    window.addEventListener('pointerdown', cancel, {passive: true});
    window.addEventListener('resize', cancel);
    window.addEventListener('pagehide', cancel);
    document.addEventListener('visibilitychange', cancel);
    reduce.addEventListener('change', cancel);
    fine.addEventListener('change', cancel);
})();
