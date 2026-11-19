/* Pause the shared scroll engine in background tabs; use native scrolling on touch/reduced-motion devices. */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Lenis === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
    const lenis = new Lenis({ duration: 0.9, smoothWheel: true, syncTouch: false });
    window.lenis = lenis;
    let frame = null;
    function tick(time) { lenis.raf(time); frame = requestAnimationFrame(tick); }
    function resume() { if (!document.hidden && frame === null) frame = requestAnimationFrame(tick); }
    function pause() { if (frame !== null) cancelAnimationFrame(frame); frame = null; }
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', resume);
    resume();
});
