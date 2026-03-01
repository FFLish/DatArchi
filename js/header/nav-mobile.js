// Initialize mobile nav with retries for dynamic loading
function initMobileNav() {
    // Prevent multiple initializations
    if (window.__mobileNavInitialized) {
        return;
    }

    const navToggleBtn = document.getElementById('navToggle');
    const headerMenu = document.querySelector('.header-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggleBtn || !headerMenu) {
        console.warn('⚠️ Mobile nav elements not found. Retrying...');
        // Retry after a short delay if elements not found
        setTimeout(initMobileNav, 50);
        return;
    }

    // Mark as initialized
    window.__mobileNavInitialized = true;
    console.log('✅ Mobile nav initialized successfully');

    // Get all focusable elements within the menu for focus trap
    const getFocusableElements = () => {
        return headerMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    };

    // Helper function to close menu
    const closeMenu = () => {
        headerMenu.classList.remove('active');
        navToggleBtn.classList.remove('active');
        navToggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Return focus to toggle button
        navToggleBtn.focus();
    };

    // Helper function to open menu
    const openMenu = () => {
        headerMenu.classList.add('active');
        navToggleBtn.classList.add('active');
        navToggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // Focus first nav link
        setTimeout(() => {
            const firstLink = navLinks[0];
            if (firstLink) firstLink.focus();
        }, 100);
    };

    // Toggle menu on button click
    navToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (headerMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow link to navigate
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (headerMenu.classList.contains('active')) {
            const isClickInside = headerMenu.contains(e.target);
            const isClickOnButton = navToggleBtn.contains(e.target);
            
            if (!isClickInside && !isClickOnButton) {
                closeMenu();
            }
        }
    });

    // Handle window resize - close mobile menu on desktop view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && headerMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const isMenuOpen = headerMenu.classList.contains('active');
        
        // Close menu on Escape
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
            return;
        }

        // Focus trap - Tab through focusable elements in menu
        if (e.key === 'Tab' && isMenuOpen) {
            const focusableElements = getFocusableElements();
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (e.shiftKey) {
                // Shift + Tab
                if (activeElement === firstElement || !headerMenu.contains(activeElement)) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (activeElement === lastElement || !headerMenu.contains(activeElement)) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
} else {
    // DOM already loaded, initialize with small delay to ensure elements are available
    setTimeout(initMobileNav, 50);
}