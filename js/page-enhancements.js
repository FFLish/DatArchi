// js/page-enhancements.js
// Global page enhancements and utilities

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Enhance all links to smooth scroll
    enhanceLinks();
    
    // 2. Add smooth scroll behavior
    addSmoothScroll();
    
    // 3. Enhance form submissions
    enhanceFormSubmissions();
    
    // 4. Add loading states
    addLoadingStates();
    
    // 5. Add keyboard shortcuts
    addKeyboardShortcuts();
    
    // 6. Add scroll-to-top button
    addScrollToTop();
    
    // 7. Enhance images
    enhanceImages();
    
    // 8. Add animations on scroll
    addScrollAnimations();
});

/**
 * Enhance all internal links with smooth transitions
 */
function enhanceLinks() {
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if target="_blank"
            if (this.target === '_blank') return;
            
            // Skip if has class "no-transition"
            if (this.classList.contains('no-transition')) return;
            
            // Add fade-out effect
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#')) {
                document.body.style.opacity = '0.7';
                document.body.style.transition = 'opacity 0.3s ease';
            }
        });
    });
}

/**
 * Add smooth scroll behavior
 */
function addSmoothScroll() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

/**
 * Enhance form submissions with visual feedback
 */
function enhanceFormSubmissions() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.classList.contains('no-loading')) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird verarbeitet...';
                submitBtn.disabled = true;
                
                // Restore after 3 seconds (adjust as needed)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

/**
 * Add loading states to buttons with data-loading attribute
 */
function addLoadingStates() {
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-loading]');
        if (!btn) return;
        
        const originalHTML = btn.innerHTML;
        const loadingHTML = btn.getAttribute('data-loading') || '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        btn.innerHTML = loadingHTML;
        btn.disabled = true;
        
        // Restore after 2 seconds
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    });
}

/**
 * Add useful keyboard shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K / Cmd+K - Open search (if search exists)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const search = document.querySelector('[data-search], input[placeholder*="search" i]');
            if (search) search.focus();
        }
        
        // Esc - Close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

/**
 * Add scroll-to-top button
 */
function addScrollToTop() {
    // Create button
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToTopBtn';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.title = 'Nach oben scrollen';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #5b21b6, #7c3aed);
        color: white;
        border: none;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 998;
        box-shadow: 0 4px 12px rgba(91, 33, 182, 0.4);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Hover effects
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'translateY(-5px)';
        scrollBtn.style.boxShadow = '0 6px 16px rgba(91, 33, 182, 0.5)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'translateY(0)';
        scrollBtn.style.boxShadow = '0 4px 12px rgba(91, 33, 182, 0.4)';
    });
}

/**
 * Add loading skeleton to images
 */
function enhanceImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add loading="lazy" if not already present
        if (!img.loading) {
            img.loading = 'lazy';
        }
        
        // Add error handling
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage not found%3C/text%3E%3C/svg%3E';
            this.style.opacity = '0.5';
        });
    });
}

/**
 * Add scroll animations to elements with data-animate attribute
 */
function addScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const animation = entry.target.getAttribute('data-animate');
                    entry.target.style.animation = animation;
                    entry.target.style.animationFillMode = 'forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
}

/**
 * Utility: Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Utility: Confirm dialog
 */
window.showConfirm = function(message, onConfirm, onCancel) {
    const confirmed = confirm(message);
    if (confirmed && onConfirm) onConfirm();
    else if (!confirmed && onCancel) onCancel();
    return confirmed;
};

/**
 * Utility: Format date
 */
export function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Utility: Get category icon
 */
export function getCategoryIcon(category) {
    const icons = {
        'gefaesse': 'fa-jar',
        'werkzeuge': 'fa-hammer',
        'schmuck': 'fa-ring',
        'waffen': 'fa-sword',
        'objekte': 'fa-cube',
        'sonstiges': 'fa-ellipsis'
    };
    return icons[category] || 'fa-cube';
}

/**
 * Utility: Get material color
 */
export function getMaterialColor(material) {
    const colors = {
        'Keramik': '#e74c3c',
        'Bronze': '#d4a574',
        'Eisen': '#7f8c8d',
        'Feuerstein': '#34495e',
        'Knochen': '#f5deb3',
        'Gold': '#f1c40f',
        'Silber': '#ecf0f1'
    };
    return colors[material] || '#95a5a6';
}

/**
 * Show confirmation dialog (returning promise)
 */
function showConfirm(message, onConfirm, onCancel) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="confirm-content">
            <p>${message}</p>
            <div class="confirm-buttons">
                <button class="btn btn-secondary" id="confirmCancel">Abbrechen</button>
                <button class="btn btn-primary" id="confirmOk">Bestätigen</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    return new Promise((resolve) => {
        dialog.querySelector('#confirmCancel').addEventListener('click', () => {
            dialog.remove();
            if (onCancel) onCancel();
            resolve(false);
        });
        
        dialog.querySelector('#confirmOk').addEventListener('click', () => {
            dialog.remove();
            if (onConfirm) onConfirm();
            resolve(true);
        });
    });
}

/**
 * Export for module usage
 */
export { showToast, showConfirm };

// Make available globally too
window.showToast = showToast;
window.showConfirm = showConfirm;
