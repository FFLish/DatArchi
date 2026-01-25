/**
 * Website Improvements & Enhancements
 * Better form handling, validation, and user feedback
 */

// ============================================
// 1. FORM VALIDATION ENHANCEMENTS
// ============================================

class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static validatePhone(phone) {
        return /^[\d\s\+\-\(\)]{10,}$/.test(phone.replace(/\s/g, ''));
    }

    static validateDate(date) {
        return !isNaN(Date.parse(date));
    }

    static async validateUsername(username) {
        if (username.length < 3) return false;
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) return false;
        return true;
    }

    static showValidationError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
        formGroup.classList.add('has-error');
        
        let feedback = formGroup.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback';
            formGroup.appendChild(feedback);
        }
        feedback.textContent = message;
    }

    static showValidationSuccess(inputElement) {
        const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
        formGroup.classList.remove('has-error');
        formGroup.classList.add('has-success');
    }

    static clearValidation(inputElement) {
        const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
        formGroup.classList.remove('has-error', 'has-success');
        const feedback = formGroup.querySelector('.form-feedback');
        if (feedback) feedback.textContent = '';
    }
}

// ============================================
// 2. ENHANCED BUTTON STATES
// ============================================

class ButtonManager {
    static setLoading(button, text = 'Wird verarbeitet...') {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner"></span> ${text}`;
    }

    static setSuccess(button, text = 'Erfolg!') {
        button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
        button.style.background = 'var(--success)';
        setTimeout(() => this.reset(button), 2000);
    }

    static setError(button, text = 'Fehler') {
        button.innerHTML = `<i class="fas fa-exclamation"></i> ${text}`;
        button.style.background = 'var(--danger)';
        setTimeout(() => this.reset(button), 2000);
    }

    static reset(button) {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = button.dataset.originalText;
        button.style.background = '';
    }
}

// ============================================
// 3. LOCAL STORAGE HELPERS
// ============================================

class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }

    static saveDraft(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const data = {};
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name) {
                data[field.name] = field.value;
            }
        });

        this.save(`draft_${formId}`, data);
    }

    static loadDraft(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const data = this.load(`draft_${formId}`);
        if (!data) return;

        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name && data[field.name]) {
                field.value = data[field.name];
            }
        });
    }

    static clearDraft(formId) {
        this.remove(`draft_${formId}`);
    }
}

// ============================================
// 4. NOTIFICATIONS SYSTEM
// ============================================

class NotificationManager {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.maxWidth = '400px';
        notification.style.zIndex = '9999';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    static success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 3000) {
        return this.show(message, 'danger', duration);
    }

    static warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// ============================================
// 5. DEBOUNCE & THROTTLE
// ============================================

function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function throttle(func, delay = 300) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// ============================================
// 6. KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
    static register(key, callback, options = {}) {
        const ctrl = options.ctrl || false;
        const shift = options.shift || false;
        const alt = options.alt || false;

        document.addEventListener('keydown', (e) => {
            if (e.key === key && e.ctrlKey === ctrl && e.shiftKey === shift && e.altKey === alt) {
                e.preventDefault();
                callback();
            }
        });
    }
}

// ============================================
// 7. INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

function observeElements(selector, className = 'visible') {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// ============================================
// 8. LAZY LOADING IMAGES
// ============================================

function enableLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// 9. COPY TO CLIPBOARD
// ============================================

function copyToClipboard(text, successMessage = 'Kopiert!') {
    navigator.clipboard.writeText(text).then(() => {
        NotificationManager.success(successMessage);
    }).catch(() => {
        NotificationManager.error('Fehler beim Kopieren');
    });
}

// ============================================
// 10. PAGE TRANSITION EFFECTS
// ============================================

class PageTransition {
    static fadeOut(callback) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: var(--bg);
            z-index: 9998;
            animation: fadeInTransition 0.3s ease forwards;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInTransition {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);
        setTimeout(callback, 300);
    }
}

// ============================================
// 11. AUTO-INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Enable lazy loading
    enableLazyLoading();

    // Auto-save form drafts
    document.querySelectorAll('form[data-auto-save]').forEach(form => {
        const formId = form.id;
        StorageManager.loadDraft(formId);
        
        form.addEventListener('input', debounce(() => {
            StorageManager.saveDraft(formId);
        }, 2000));
    });

    // Add enter key submission to forms
    document.querySelectorAll('form[data-auto-submit]').forEach(form => {
        form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        });
    });

    console.log('✅ Website improvements loaded');
});

// Export for use in other scripts
export {
    FormValidator,
    ButtonManager,
    StorageManager,
    NotificationManager,
    debounce,
    throttle,
    KeyboardShortcuts,
    observeElements,
    copyToClipboard,
    PageTransition
};
