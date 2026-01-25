/**
 * @file vre-optimization-service.js
 * @description Performance optimization utilities for DatArchi
 */

export class OptimizationService {
  /**
   * Debounce function calls to prevent excessive executions
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait = 300) {
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
   * Throttle function calls to limit execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit = 300) {
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
   * Lazy load images using Intersection Observer
   */
  static initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

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

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Track performance metrics
   */
  static trackPerformance() {
    if (!window.performance) return;

    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`📊 Page Load Time: ${pageLoadTime}ms`);

      // Log key metrics
      const metrics = {
        'DNS Time': perfData.domainLookupEnd - perfData.domainLookupStart,
        'TCP Connection': perfData.connectEnd - perfData.connectStart,
        'Server Response': perfData.responseEnd - perfData.requestStart,
        'DOM Processing': perfData.domComplete - perfData.domLoading,
        'Page Ready': perfData.loadEventEnd - perfData.navigationStart,
      };

      Object.entries(metrics).forEach(([key, value]) => {
        if (value > 0) {
          console.log(`  ${key}: ${value}ms`);
        }
      });
    });
  }

  /**
   * Monitor for console errors and report them
   */
  static enableErrorTracking() {
    window.addEventListener('error', (event) => {
      console.error('🔴 Error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🔴 Unhandled Promise Rejection:', event.reason);
    });
  }

  /**
   * Safe DOM query with error handling
   */
  static safeQuery(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`);
      return null;
    }
  }

  /**
   * Safe event listener attachment
   */
  static safeAddListener(element, event, handler, options = {}) {
    if (!element) return false;
    try {
      element.addEventListener(event, handler, options);
      return true;
    } catch (e) {
      console.warn(`Error attaching listener: ${e.message}`);
      return false;
    }
  }

  /**
   * Cache API responses
   */
  static createCache(ttl = 5 * 60 * 1000) {
    const cache = new Map();

    return {
      set: (key, value) => {
        cache.set(key, {
          value,
          timestamp: Date.now(),
        });
      },
      get: (key) => {
        const item = cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > ttl;
        if (isExpired) {
          cache.delete(key);
          return null;
        }

        return item.value;
      },
      clear: () => cache.clear(),
    };
  }

  /**
   * Batch multiple state updates
   */
  static batchUpdates(updates) {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Check if device supports certain features
   */
  static detectFeatures() {
    return {
      hasStorage: (() => {
        try {
          const test = '__storage_test__';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      })(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasIndexedDB: !!window.indexedDB,
      hasNotification: 'Notification' in window,
      supportsWebP: (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      })(),
      hasIntersectionObserver: 'IntersectionObserver' in window,
      hasGeolocation: 'geolocation' in navigator,
    };
  }
}

export default OptimizationService;
