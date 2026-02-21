/**
 * Image Lazy Loading Module
 * Uses Intersection Observer for efficient lazy loading
 */

export class ImageLazyLoader {
  static initialized = false;

  static init() {
    // Prevent multiple initializations
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  static setupLazyLoading() {
    const imageElements = document.querySelectorAll('img[data-src]');
    
    if (imageElements.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          const srcset = img.getAttribute('data-srcset');
          
          // Load the image
          if (src) img.src = src;
          if (srcset) img.srcset = srcset;
          
          // Remove the data-src attribute and observer
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          imageObserver.unobserve(img);
          
          img.classList.add('loaded');
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before image enters viewport
    });

    imageElements.forEach(img => {
      imageObserver.observe(img);
      // Add placeholder if no src
      if (!img.src) {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3C/svg%3E';
      }
    });
  }

  static loadAllImages() {
    const imageElements = document.querySelectorAll('img[data-src]');
    imageElements.forEach(img => {
      const src = img.getAttribute('data-src');
      const srcset = img.getAttribute('data-srcset');
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
    });
  }

  // Utility: Convert image to lazy-loadable
  static makeLazy(imgElement, src, srcset = null) {
    imgElement.setAttribute('data-src', src);
    if (srcset) imgElement.setAttribute('data-srcset', srcset);
    imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3C/svg%3E';
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ImageLazyLoader.init());
} else {
  ImageLazyLoader.init();
}
