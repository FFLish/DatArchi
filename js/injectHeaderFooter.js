// js/injectHeaderFooter.js
// ====================
// Inject header and footer from external HTML files

// Determine site root based on current script location with sensible fallbacks
const getSiteRoot = () => {
  // 1) Try to derive from the currently executing script (module loader)
  const currentScript = document.currentScript && document.currentScript.src ? document.currentScript.src : null;
  if (currentScript) {
    try {
      const url = new URL(currentScript);
      // If script path contains '/js/', assume site root is everything before '/js/'
      const parts = url.pathname.split('/js/');
      if (parts.length > 0) {
        return url.origin + (parts[0].endsWith('/') ? parts[0] : parts[0] + '/') ;
      }
    } catch (e) {
      // ignore and fall through
    }
  }

  // 2) Try known hosting pattern with '/DatArchi/' in path
  const pathname = window.location.pathname;
  if (pathname.includes('/DatArchi/')) {
    return window.location.origin + '/DatArchi/';
  }

  // 3) Default to origin root
  return window.location.origin + '/';
};

const SITE_ROOT = getSiteRoot();

async function injectSection(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    const html = await response.text();
    el.innerHTML = html;
    return;
  } catch (e) {
    // Rethrow to allow caller to attempt fallback
    throw e;
  }
}

function adjustLinks(container, siteRoot) {
  if (!container || !siteRoot) return;

  const selectors = ['a[href]', '[src]', 'link[href]'];
  const attributes = ['href', 'src', 'href'];

  // Calculate current page depth from site root
  const currentPath = window.location.pathname;
  const siteRootPath = new URL(siteRoot).pathname;
  const relativePath = currentPath.replace(siteRootPath, '');
  const depth = relativePath.split('/').filter(p => p && p !== 'index.html').length;
  const basePrefix = depth > 0 ? '../'.repeat(depth) : './';

  selectors.forEach((selector, index) => {
    const attribute = attributes[index];
    const elements = container.querySelectorAll(selector);

    elements.forEach((el) => {
      const path = el.getAttribute(attribute);
      if (!path) return;

      // Adjust only root-relative paths, ignore external, mailto, etc.
      if (path.startsWith('/') && !path.startsWith('//')) {
        // Convert to relative path based on current page depth
        const relativePath = path.substring(1); // Remove leading slash
        el[attribute] = basePrefix + relativePath;
      }
    });
  });
}

function ensureContainers() {
  // Support multiple possible container IDs
  const possibleHeaderIds = ['header-container', 'headerContainer', 'header_container'];
  const possibleFooterIds = ['footer-container', 'footerContainer', 'footer_container'];

  // Check and create header container
  let headerEl = null;
  for (const id of possibleHeaderIds) {
    headerEl = document.querySelector(`#${id}`);
    if (headerEl) break;
  }
  if (!headerEl) {
    headerEl = document.createElement('div');
    headerEl.id = 'header-container';
    document.body.prepend(headerEl);
  }

  // Check and create footer container
  let footerEl = null;
  for (const id of possibleFooterIds) {
    footerEl = document.querySelector(`#${id}`);
    if (footerEl) break;
  }
  if (!footerEl) {
    footerEl = document.createElement('div');
    footerEl.id = 'footer-container';
    document.body.appendChild(footerEl);
  }
}

let loaded = false;
let lastError = null;
let headerFooterLoadingPromise = null;

// Function to reload header and footer
async function reloadHeaderFooter() {
  // Prevent multiple simultaneous loads
  if (headerFooterLoadingPromise) {
    return headerFooterLoadingPromise;
  }

  headerFooterLoadingPromise = (async () => {
    ensureContainers();

    const siteRoot = SITE_ROOT;
    const headerUrl = new URL('partials/header.html', siteRoot).href;
    const footerUrl = new URL('partials/footer.html', siteRoot).href;
    
    try {
      await Promise.all([
        injectSection('#header-container', headerUrl),
        injectSection('#footer-container', footerUrl)
      ]);

      const headerEl = document.querySelector('#header-container');
      const footerEl = document.querySelector('#footer-container');

      adjustLinks(headerEl, siteRoot);
      adjustLinks(footerEl, siteRoot);

      // Check if scripts are already loaded to prevent duplicates
      if (!document.querySelector('script[src*="nav-mobile.js"]')) {
        const navScript = document.createElement('script');
        navScript.type = 'module';
        navScript.src = new URL('header/nav-mobile.js', SITE_ROOT + 'js/').href;
        document.head.appendChild(navScript);
      }

      if (!document.querySelector('script[src*="theme-toggle.js"]')) {
        const themeScript = document.createElement('script');
        themeScript.type = 'module';
        themeScript.src = new URL('theme-toggle.js', SITE_ROOT + 'js/').href;
        document.head.appendChild(themeScript);
      }

      // Now notify that header/footer are ready so loaded scripts can attach listeners
      document.dispatchEvent(new Event('headerFooterReady'));
    } catch (err) {
      console.warn('reloadHeaderFooter: failed to reload partials:', err);
    } finally {
      headerFooterLoadingPromise = null;
    }
  })();

  return headerFooterLoadingPromise;
}

// Export reload function globally
window.reloadHeaderFooter = reloadHeaderFooter;

document.addEventListener('DOMContentLoaded', async () => {
  // Prevent running this code multiple times
  if (loaded) {
    console.log('Header/Footer already loaded, skipping duplicate initialization');
    return;
  }

  // Initialize image system
  try {
    const { setupImageSystem } = await import('./image-system-init.js');
    setupImageSystem();
  } catch (error) {
    console.warn('⚠️ Image system initialization warning:', error.message);
  }
  
  ensureContainers();

  const siteRoot = SITE_ROOT; // Use the imported site root

  const headerUrl = new URL('partials/header.html', siteRoot).href;
  const footerUrl = new URL('partials/footer.html', siteRoot).href;
  
  try {
    await Promise.all([
      injectSection('#header-container', headerUrl),
      injectSection('#footer-container', footerUrl)
    ]);

    const headerEl = document.querySelector('#header-container');
    const footerEl = document.querySelector('#footer-container');

    // Adjust links inside the newly injected header and footer
    adjustLinks(headerEl, siteRoot);
    adjustLinks(footerEl, siteRoot);

    loaded = true;

    // Load mobile navigation script and theme toggle before notifying listeners - prevent duplicates
    if (!document.querySelector('script[src*="nav-mobile.js"]')) {
      const navScript = document.createElement('script');
      navScript.type = 'module';
      navScript.src = new URL('header/nav-mobile.js', SITE_ROOT + 'js/').href;
      document.head.appendChild(navScript);
    }

    if (!document.querySelector('script[src*="theme-toggle.js"]')) {
      const themeScript = document.createElement('script');
      themeScript.type = 'module';
      themeScript.src = new URL('theme-toggle.js', SITE_ROOT + 'js/').href;
      document.head.appendChild(themeScript);
    }

    console.info('injectHeaderFooter: header/footer injected', headerUrl, footerUrl);
    document.dispatchEvent(new Event('headerFooterReady'));

  } catch (err) {
    lastError = err;
    console.warn('injectHeaderFooter: initial load failed:', err);

    // Fallback: try a couple of common alternate site roots
    const altRoots = [window.location.origin + '/', window.location.origin + '/DatArchi/'];
    let recovered = false;
    for (const root of altRoots) {
      try {
        const altHeader = new URL('partials/header.html', root).href;
        const altFooter = new URL('partials/footer.html', root).href;
        console.info('injectHeaderFooter: attempting fallback to', root, altHeader);
        await Promise.all([
          injectSection('#header-container', altHeader),
          injectSection('#footer-container', altFooter)
        ]);
        const headerEl = document.querySelector('#header-container');
        const footerEl = document.querySelector('#footer-container');
        adjustLinks(headerEl, root);
        adjustLinks(footerEl, root);

        // append scripts and dispatch
        const navScript2 = document.createElement('script');
        navScript2.type = 'module';
        navScript2.src = new URL('header/nav-mobile.js', root + 'js/').href;
        document.head.appendChild(navScript2);

        const themeScript2 = document.createElement('script');
        themeScript2.type = 'module';
        themeScript2.src = new URL('theme-toggle.js', root + 'js/').href;
        document.head.appendChild(themeScript2);

        console.info('injectHeaderFooter: fallback succeeded with root', root);
        document.dispatchEvent(new Event('headerFooterReady'));
        recovered = true;
        break;
      } catch (innerErr) {
        console.warn('injectHeaderFooter: fallback attempt failed for', root, innerErr);
      }
    }

    if (!recovered) console.warn('injectHeaderFooter: failed to load partials after fallbacks:', lastError);
  }

  if (!loaded) {
    console.error('injectHeaderFooter: failed to load header/footer. See earlier warnings.', lastError);
    const header = document.querySelector('#header-container');
    const footer = document.querySelector('#footer-container');
    const message = `
      <div style="background:#fff3cd;border:1px solid #ffecb5;padding:12px;border-radius:6px;color:#533f03">
        <strong>Header/Footer not loaded.</strong>
        This usually happens when opening pages directly via <code>file://</code>.
        Run a local HTTP server from the project root and open <code>http://localhost:8000</code> instead.
      </div>`;
    if (header && header.innerHTML.trim() === '') header.innerHTML = message;
    if (footer && footer.innerHTML.trim() === '') footer.innerHTML = '';
  }
});
