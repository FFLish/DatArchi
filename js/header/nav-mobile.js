document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const headerMenu = document.querySelector('.header-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggleLabel = document.querySelector('.nav-toggle-label');

    // Direct click handler on the label
    if (navToggleLabel) {
        navToggleLabel.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navToggle) {
                navToggle.checked = !navToggle.checked;
                navToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    // Mobile menu toggle
    if (navToggle && headerMenu) {
        navToggle.addEventListener('change', function() {
            if (this.checked) {
                headerMenu.classList.add('is-active');
                document.body.style.overflow = 'hidden';
            } else {
                headerMenu.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle) {
                navToggle.checked = false;
                navToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    // Close menu when clicking outside (on mobile)
    document.addEventListener('click', (e) => {
        if (navToggle && navToggle.checked) {
            const isClickInside = headerMenu && headerMenu.contains(e.target);
            const isClickOnToggle = navToggleLabel && navToggleLabel.contains(e.target);
            
            if (!isClickInside && !isClickOnToggle) {
                navToggle.checked = false;
                navToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });

    // Handle window resize - close mobile menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navToggle && navToggle.checked) {
            navToggle.checked = false;
            navToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // Keyboard support - close menu on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navToggle && navToggle.checked) {
            navToggle.checked = false;
            navToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // Touch feedback for mobile buttons
    if (navToggleLabel) {
        navToggleLabel.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        navToggleLabel.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    }
});