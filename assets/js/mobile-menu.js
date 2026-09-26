/**
 * Bottega Design Studio - Navigation & Mobile Sidebar Drawer Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    const dotMenuBtn = document.getElementById('dotMenuBtn');
    const dotMenuPopover = document.getElementById('dotMenuPopover');

    if (dotMenuBtn && dotMenuPopover) {
        // Create backdrop if not already created
        let backdrop = document.querySelector('.dot-menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'dot-menu-backdrop';
            document.body.appendChild(backdrop);
        }

        function openSidebar() {
            dotMenuBtn.classList.add('is-active');
            dotMenuPopover.classList.add('is-open');
            backdrop.classList.add('is-active');
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
        }

        function closeSidebar() {
            dotMenuBtn.classList.remove('is-active');
            dotMenuPopover.classList.remove('is-open');
            backdrop.classList.remove('is-active');
            document.body.style.overflow = '';
        }

        dotMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dotMenuPopover.classList.contains('is-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        backdrop.addEventListener('click', closeSidebar);

        const popLinks = dotMenuPopover.querySelectorAll('.pop-link');
        popLinks.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.creative-dot-menu-wrap') && !e.target.closest('.dot-menu-popover')) {
                closeSidebar();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && dotMenuPopover.classList.contains('is-open')) {
                document.body.style.overflow = '';
            }
        });
    }
});
