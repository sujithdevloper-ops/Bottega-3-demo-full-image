/**
 * Bottega Design Studio - Mobile Hamburger Navigation Drawer Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!toggleBtn || !mainNav) return;

    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        const isOpen = mainNav.classList.toggle('is-open');
        toggleBtn.classList.toggle('is-active', isOpen);
        overlay.classList.toggle('is-active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
        mainNav.classList.remove('is-open');
        toggleBtn.classList.remove('is-active');
        overlay.classList.remove('is-active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', closeMenu);

    // Close menu when tapping any navigation link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Creative Logo-Dot Menu Interaction
    const dotMenuBtn = document.getElementById('dotMenuBtn');
    const dotMenuPopover = document.getElementById('dotMenuPopover');

    if (dotMenuBtn && dotMenuPopover) {
        dotMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dotMenuBtn.classList.toggle('is-active');
            dotMenuPopover.classList.toggle('is-open', isActive);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.creative-dot-menu-wrap')) {
                dotMenuBtn.classList.remove('is-active');
                dotMenuPopover.classList.remove('is-open');
            }
        });
    }
});

