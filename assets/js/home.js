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
    const loader = document.getElementById('bottega-intro-loader');
    const introStarted = performance.now();
    let introComplete = !loader;
    if (!loader) {
        document.documentElement.classList.remove('is-intro-loading');
        clearTimeout(window.bottegaIntroWatchdog);
    }
    const cache = new Map();
    let current = 0, active = 0, wanted = 0, busy = false, timer = null, inView = true;
    let cycleStarted = performance.now();
    const foliage = window.createHeroFoliage?.(layers, motion);
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
        if (slides.length < 2 || busy || document.hidden || !inView || !introComplete) return;
        timer = setTimeout(() => request(current + 1), Math.max(0, 6000 - (performance.now() - cycleStarted)));
    }
    async function show() {
        if (busy || wanted === current) { schedule(); return; }
        busy = true; stop();
        const target = wanted;
        try {
            const [image] = await Promise.all([load(target), window.prepareHeroBranchScene?.(target)]);
            // A newer click wins while an image is still downloading.
            if (target !== wanted) return;
            cycleStarted = performance.now();
            const old = layers[active], next = layers[1 - active];
            foliage?.set(1 - active, image, slides[target].img);
            next.style.transition = 'none'; next.style.opacity = '0';
            next.style.transform = 'none';
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
                // The requested non-spatial dissolve also runs with reduced motion.
                next.style.transition = 'opacity 2000ms ease-in-out';
                next.style.opacity = '1';
                // Start both photo and botanical fades in this same render frame.
                window.setHeroBranchScene?.(target);
                fallback = setTimeout(done, 2150);
            });
            old.style.opacity = '0'; foliage?.hide(active); active = 1 - active; current = target;
            updateControls();
            load((current + 1) % slides.length).catch(() => {});
        } catch (_) {
            // Preserve the last good photo if the requested image is missing/offline.
            if (wanted === target) wanted = current;
            cycleStarted = performance.now();
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
    let revealed = false;
    function reveal() {
        if (revealed) return;
        revealed = true;
        if (loader) {
            // Restore the original logo pause and full architectural arch reveal.
            setTimeout(() => {
                loader.classList.add('is-loaded');
                let finishTimer;
                const finish = event => {
                    if (event && (event.target !== loader || event.propertyName !== 'opacity')) return;
                    if (introComplete) return;
                    clearTimeout(finishTimer);
                    loader.removeEventListener('transitionend', finish);
                    loader.hidden = true; loader.style.display = 'none';
                    document.documentElement.classList.remove('is-intro-loading');
                    clearTimeout(window.bottegaIntroWatchdog);
                    introComplete = true;
                    cycleStarted = performance.now();
                    schedule();
                };
                // Release scrolling as the visible curtain ends, without a trailing hold.
                loader.addEventListener('transitionend', finish);
                finishTimer = setTimeout(finish, 1800);
            }, Math.max(0, 1000 - (performance.now() - introStarted)));
        }
    }
    // Load the actual lettering before revealing text or starting the arch.
    const fontsReady = document.fonts ? Promise.all([
        document.fonts.load('400 48px "Pinyon Script"', 'Bottega'),
        document.fonts.load('400 96px "ambroise-francois-std"', 'BOTTEGA DESIGN'),
        document.fonts.load('400 64px "sloop-script-three"', 'Studio')
    ]).catch(() => {}) : Promise.resolve();
    const letteringReady = fontsReady.then(() => {
        document.documentElement.classList.add('intro-fonts-ready');
    });
    // One fallback; an unavailable font or image can never trap visitors.
    const fallback = setTimeout(reveal, 2500);
    updateControls();
    const firstPhotoReady = load(0).then(image => foliage?.set(0, image, slides[0].img)).catch(() => {});
    Promise.all([firstPhotoReady, letteringReady]).finally(() => {
        cycleStarted = performance.now();
        clearTimeout(fallback); reveal(); schedule();
        load(1 % slides.length).catch(() => {});
    });
})();
