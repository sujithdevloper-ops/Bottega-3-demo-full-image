/* Homepage: decoded-image crossfades, one autoplay timer, no unused section engines. */
(() => {
    'use strict';
    const slides = JSON.parse(document.getElementById('hero-slide-data').textContent);
    const layers = [document.getElementById('hero-bg'), document.getElementById('hero-bg-next')];
    if (!slides.length || layers.some(layer => !layer)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controls = document.querySelector('.hero-slider-controls');
    const dots = [...document.querySelectorAll('.hero-slider-dot')];
    const counter = document.getElementById('hero-slider-counter');
    const caption = document.getElementById('hero-project-title');
    const cache = new Map();
    let current = 0, active = 0, wanted = 0, busy = false, timer = null, inView = true;
    let focused = false, hovered = false;
    function load(index) {
        if (!cache.has(index)) {
            const promise = new Promise((resolve, reject) => {
                const image = new Image();
                const timeout = setTimeout(() => reject(new Error('Image load timed out')), 15000);
                image.onload = async () => {
                    try { if (image.decode) await image.decode(); } catch (_) { /* Loaded image remains usable. */ }
                    clearTimeout(timeout); resolve(image);
                };
                image.onerror = () => { clearTimeout(timeout); reject(new Error('Image unavailable')); };
                image.src = slides[index].img;
            });
            cache.set(index, promise);
            promise.catch(() => cache.delete(index));
        }
        return cache.get(index);
    }
    function updateControls() {
        if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === current);
            dot.setAttribute('aria-current', index === current ? 'true' : 'false');
        });
        if (caption) { caption.textContent = slides[current].projectName || ''; caption.classList.toggle('is-visible', !!slides[current].projectName); }
    }
    function stop() { clearTimeout(timer); timer = null; }
    function schedule() {
        stop();
        if (slides.length < 2 || busy || document.hidden || !inView || motion.matches || focused || hovered) return;
        timer = setTimeout(() => request(current + 1), 7000);
    }
    async function show() {
        if (busy || wanted === current) { schedule(); return; }
        busy = true; stop();
        const target = wanted;
        try {
            await load(target);
            // A newer click wins while an image is still downloading.
            if (target !== wanted) return;
            const old = layers[active], next = layers[1 - active];
            next.style.transition = 'none'; next.style.opacity = '0';
            next.style.backgroundImage = `url("${slides[target].img}")`;
            next.style.zIndex = '2'; old.style.zIndex = '1';
            // Keep the old image opaque beneath the new layer: never fade to a blank background.
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await new Promise(resolve => {
                let fallback;
                const done = event => {
                    if (event && (event.target !== next || event.propertyName !== 'opacity')) return;
                    clearTimeout(fallback); next.removeEventListener('transitionend', done); resolve();
                };
                next.addEventListener('transitionend', done);
                next.style.transition = motion.matches ? 'none' : 'opacity 1000ms ease';
                next.style.opacity = '1';
                fallback = setTimeout(done, motion.matches ? 0 : 1100);
            });
            old.style.opacity = '0'; active = 1 - active; current = target;
            updateControls();
            load((current + 1) % slides.length).catch(() => {});
        } catch (_) {
            // Preserve the last good photo if the requested image is missing/offline.
            if (wanted === target) wanted = current;
        } finally {
            busy = false;
            if (wanted !== current) show(); else schedule();
        }
    }
    function request(index) {
        wanted = ((index % slides.length) + slides.length) % slides.length;
        stop(); show();
    }
    window.navigateHeroTo = index => request(index);
    window.navigateHeroSlide = direction => request(wanted + direction);
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', schedule);
    motion.addEventListener('change', schedule);
    if (controls) {
        controls.addEventListener('mouseenter', () => { hovered = true; stop(); });
        controls.addEventListener('mouseleave', () => { hovered = false; schedule(); });
        controls.addEventListener('focusin', () => { focused = true; stop(); });
        controls.addEventListener('focusout', event => { if (!controls.contains(event.relatedTarget)) { focused = false; schedule(); } });
    }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }).observe(document.querySelector('.bottega-hero-section'));
    }
    const brand = document.getElementById('site-brand-logo');
    let scrollPending = false;
    window.addEventListener('scroll', () => {
        if (scrollPending) return;
        scrollPending = true;
        requestAnimationFrame(() => { if (brand) brand.classList.toggle('is-sticky-logo', window.scrollY > 100); scrollPending = false; });
    }, { passive: true });
    const loader = document.getElementById('bottega-intro-loader');
    let revealed = false;
    function reveal() {
        if (revealed) return;
        revealed = true;
        if (loader) {
            loader.classList.add('is-loaded');
            setTimeout(() => { loader.hidden = true; loader.style.display = 'none'; }, motion.matches ? 0 : 1300);
        }
    }
    // One fallback; a failed image/font request can never trap visitors behind the intro.
    const fallback = setTimeout(reveal, 2500);
    updateControls();
    load(0).catch(() => {}).finally(() => {
        clearTimeout(fallback); reveal(); schedule();
        load(1 % slides.length).catch(() => {});
    });
})();
