/**
 * Resource Preloading and Prefetching Strategy
 * Optimizes resource loading for better performance
 */

export class ResourceOptimizer {
  static initPreloading() {
    // Preload critical fonts
    this.preloadFont('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2', 'font');
    
    // Prefetch next likely pages (optional - only for anticipated navigation)
    // this.prefetchPage('/pages/dashboard.html');
  }

  static preloadFont(href, as = 'font', type = 'font/woff2', crossorigin = true) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  static prefetchPage(href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  static preconnectTo(url) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  }

  // DNS Prefetch for third-party domains
  static dnsPrefetch(hostname) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${hostname}`;
    document.head.appendChild(link);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ResourceOptimizer.initPreloading());
} else {
  ResourceOptimizer.initPreloading();
}
