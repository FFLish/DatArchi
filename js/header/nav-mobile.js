document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const headerMenu = document.querySelector('.header-menu'); // The container for the nav links

    if (navToggle && headerMenu) {
        navToggle.addEventListener('change', function() {
            if (this.checked) {
                headerMenu.classList.add('is-active');
                document.body.classList.add('nav-open'); // Add a class to body for potential styling (e.g., overflow: hidden)
            } else {
                headerMenu.classList.remove('is-active');
                document.body.classList.remove('nav-open');
            }
        });
    }
});