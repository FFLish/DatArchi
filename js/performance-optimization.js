/**
 * Performance Optimization Module
 * Comprehensive optimization strategies for DatArchi
 */

/**
 * 1. IMAGE LAZY LOADING
 * Defer loading of images until they're visible
 */
export function enableLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    } else {
        // Fallback: load all images immediately
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

/**
 * 2. DEBOUNCE - Prevent excessive function calls
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 3. THROTTLE - Limit function execution frequency
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 4. REQUEST ANIMATION FRAME
 * Use for smooth animations and scrolling
 */
export function smoothScroll(target, duration = 1000) {
    const start = window.scrollY;
    const distance = target - start;
    const startTime = performance.now();

    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);

        window.scrollTo(0, start + distance * ease);

        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    };

    requestAnimationFrame(scroll);
}

/**
 * 5. RESOURCE HINTS
 * Dynamically add preload/prefetch hints
 */
export function addResourceHints() {
    const criticalResources = [
        { href: 'css/critical.css', rel: 'preload', as: 'style' },
        { href: 'js/firebase-config.js', rel: 'modulepreload' },
        { href: 'js/image-utilities.js', rel: 'modulepreload' }
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = resource.rel;
        link.href = resource.href;
        if (resource.as) link.as = resource.as;
        document.head.appendChild(link);
    });
}

/**
 * 6. LOCAL STORAGE CACHING
 * Cache data locally to reduce server requests
 */
export class CacheManager {
    constructor(cacheName = 'datarchi-cache', expirationMinutes = 60) {
        this.cacheName = cacheName;
        this.expirationMs = expirationMinutes * 60 * 1000;
    }

    set(key, value) {
        const data = {
            value,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(`${this.cacheName}-${key}`, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage full:', e);
        }
    }

    get(key) {
        try {
            const item = localStorage.getItem(`${this.cacheName}-${key}`);
            if (!item) return null;

            const data = JSON.parse(item);
            const isExpired = Date.now() - data.timestamp > this.expirationMs;

            if (isExpired) {
                localStorage.removeItem(`${this.cacheName}-${key}`);
                return null;
            }

            return data.value;
        } catch (e) {
            console.warn('Cache retrieval error:', e);
            return null;
        }
    }

    clear(key) {
        try {
            localStorage.removeItem(`${this.cacheName}-${key}`);
        } catch (e) {
            console.warn('Cache clear error:', e);
        }
    }

    clearAll() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.cacheName))
                .forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('Cache clearAll error:', e);
        }
    }
}

/**
 * 7. REQUEST BATCHING
 * Batch multiple Firestore requests
 */
export class RequestBatcher {
    constructor(batchSize = 10, delayMs = 100) {
        this.queue = [];
        this.batchSize = batchSize;
        this.delayMs = delayMs;
        this.timeout = null;
    }

    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            
            if (this.queue.length >= this.batchSize) {
                this.flush();
            } else if (!this.timeout) {
                this.timeout = setTimeout(() => this.flush(), this.delayMs);
            }
        });
    }

    async flush() {
        if (this.timeout) clearTimeout(this.timeout);
        
        const batch = this.queue.splice(0, this.batchSize);
        if (batch.length === 0) return;

        try {
            const promises = batch.map(item => item.request());
            const results = await Promise.all(promises);
            
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        } catch (error) {
            batch.forEach(item => {
                item.reject(error);
            });
        }

        if (this.queue.length > 0) {
            this.timeout = setTimeout(() => this.flush(), this.delayMs);
        }
    }
}

/**
 * 8. PERFORMANCE MONITORING
 * Track Core Web Vitals
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    markStart(name) {
        performance.mark(`${name}-start`);
    }

    markEnd(name) {
        performance.mark(`${name}-end`);
        try {
            performance.measure(name, `${name}-start`, `${name}-end`);
            const measure = performance.getEntriesByName(name)[0];
            this.metrics[name] = measure.duration;
            console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
            return measure.duration;
        } catch (e) {
            console.warn('Performance measure failed:', e);
        }
    }

    getMetrics() {
        return this.metrics;
    }

    // Monitor Core Web Vitals
    monitorsWebVitals(callback) {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('🎯 LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP monitoring unavailable');
            }
        }

        // Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
            try {
                let cls = 0;
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            cls += entry.value;
                            console.log('📊 CLS:', cls.toFixed(3));
                        }
                    }
                });
                observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS monitoring unavailable');
            }
        }
    }
}

/**
 * 9. VIRTUAL SCROLLING
 * For rendering large lists efficiently
 */
export class VirtualScroller {
    constructor(container, items, itemHeight, renderItem) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.scrollTop = 0;
        this.visibleItems = [];
        
        this.container.addEventListener('scroll', () => this.onScroll());
        this.render();
    }

    onScroll() {
        this.scrollTop = this.container.scrollTop;
        this.render();
    }

    render() {
        const containerHeight = this.container.clientHeight;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.ceil((this.scrollTop + containerHeight) / this.itemHeight);

        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < endIndex && i < this.items.length; i++) {
            const item = this.renderItem(this.items[i], i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.height = `${this.itemHeight}px`;
            fragment.appendChild(item);
        }

        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}

/**
 * 10. WEB WORKERS FOR HEAVY COMPUTATION
 * Offload CPU-intensive tasks
 */
export async function processLargeDatasetWithWorker(data, workerScript) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerScript);
        
        worker.onmessage = (event) => {
            resolve(event.data);
            worker.terminate();
        };

        worker.onerror = (error) => {
            reject(error);
            worker.terminate();
        };

        worker.postMessage(data);
    });
}

/**
 * 11. MEMORY OPTIMIZATION
 * Clean up listeners and references
 */
export class ResourceManager {
    constructor() {
        this.listeners = new Map();
        this.timers = new Set();
        this.subscriptions = new Set();
    }

    addListener(element, event, handler) {
        element.addEventListener(event, handler);
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler });
    }

    addTimer(timerId) {
        this.timers.add(timerId);
    }

    addSubscription(unsubscribeFn) {
        this.subscriptions.add(unsubscribeFn);
    }

    cleanup() {
        // Remove all listeners
        this.listeners.forEach((events, element) => {
            events.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.listeners.clear();

        // Clear all timers
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();

        // Unsubscribe from all subscriptions
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions.clear();
    }
}

/**
 * Initialize all optimizations
 */
export function initializeOptimizations() {
    console.log('🚀 Initializing performance optimizations...');

    // Enable lazy loading
    enableLazyLoading();

    // Add resource hints
    addResourceHints();

    // Initialize performance monitoring
    const perfMonitor = new PerformanceMonitor();
    perfMonitor.monitorsWebVitals();

    // Log initial metrics
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('⚡ Performance Metrics:');
            console.log(`  DNS: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms`);
            console.log(`  TCP: ${perfData.connectEnd - perfData.connectStart}ms`);
            console.log(`  DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
            console.log(`  Total Load Time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        }, 100);
    });

    console.log('✅ Optimizations initialized');
}

export default {
    enableLazyLoading,
    debounce,
    throttle,
    smoothScroll,
    addResourceHints,
    CacheManager,
    RequestBatcher,
    PerformanceMonitor,
    VirtualScroller,
    processLargeDatasetWithWorker,
    ResourceManager,
    initializeOptimizations
};
