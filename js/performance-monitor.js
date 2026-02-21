/**
 * Performance Monitoring Module
 * Tracks Core Web Vitals and performance metrics
 */

export class PerformanceMonitor {
  static init() {
    if ('PerformanceObserver' in window) {
      this.trackCoreWebVitals();
      this.trackResourceTiming();
    }
  }

  static trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('📊 LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
            console.log('📊 CLS:', cls.toFixed(3));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0];
        console.log('📊 FID:', entry.processingDuration, 'ms');
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }

  static trackResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const byType = {};
      
      resources.forEach(resource => {
        const type = resource.initiatorType;
        if (!byType[type]) byType[type] = { count: 0, time: 0, size: 0 };
        byType[type].count++;
        byType[type].time += resource.duration;
        byType[type].size += resource.transferSize || 0;
      });

      console.log('📊 Resource Summary:');
      Object.entries(byType).forEach(([type, stats]) => {
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  ${type}: ${stats.count} files, ${stats.time.toFixed(0)}ms, ${sizeMB}MB`);
      });
    });
  }

  static logNavigationTiming() {
    window.addEventListener('load', () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return;

      const metrics = {
        'DNS Lookup': nav.domainLookupEnd - nav.domainLookupStart,
        'TCP Connection': nav.connectEnd - nav.connectStart,
        'Server Response': nav.responseEnd - nav.responseStart,
        'DOM Processing': nav.domComplete - nav.domLoading,
        'Page Load Time': nav.loadEventEnd - nav.navigationStart,
      };

      console.log('⏱️ Page Load Metrics:');
      Object.entries(metrics).forEach(([label, time]) => {
        if (time > 0) console.log(`  ${label}: ${time.toFixed(0)}ms`);
      });
    });
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
} else {
  PerformanceMonitor.init();
}
