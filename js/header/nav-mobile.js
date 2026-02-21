// Run immediately instead of waiting for DOMContentLoaded since this script is loaded dynamically
function initMobileNav() {
    // Prevent multiple initializations
    if (window.__mobileNavInitialized) {
        return;
    }
    window.__mobileNavInitialized = true;

    const navToggleBtn = document.getElementById('navToggle');
    const headerMenu = document.querySelector('.header-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggleBtn || !headerMenu) {
        console.warn('Mobile nav elements not found');
        return;
    }

    console.log('✅ Mobile nav initialized');

    // Toggle menu on button click
    navToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Menu button clicked');
        
        headerMenu.classList.toggle('active');
        const isOpen = headerMenu.classList.contains('active');
        navToggleBtn.classList.toggle('active', isOpen);
        navToggleBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        console.log('Menu is now:', isOpen ? 'OPEN' : 'CLOSED');
    });

    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            headerMenu.classList.remove('active');
            navToggleBtn.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (headerMenu.classList.contains('active')) {
            const isClickInside = headerMenu.contains(e.target);
            const isClickOnButton = navToggleBtn.contains(e.target);
            
            if (!isClickInside && !isClickOnButton) {
                headerMenu.classList.remove('active');
                navToggleBtn.classList.remove('active');
                navToggleBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    });

    // Handle window resize - close mobile menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && headerMenu.classList.contains('active')) {
            headerMenu.classList.remove('active');
            navToggleBtn.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // Keyboard support - close menu on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && headerMenu.classList.contains('active')) {
            headerMenu.classList.remove('active');
            navToggleBtn.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// Initialize immediately or when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
} else {
    initMobileNav();
}