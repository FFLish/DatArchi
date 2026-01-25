// js/injectHeaderFooter.js
// ====================
// Inject header and footer from external HTML files

// Determine site root based on current location
const getSiteRoot = () => {
  const pathname = window.location.pathname;
  // If hosted on GitHub Pages, the repo name is part of the path
  if (pathname.includes('/DatArchi/')) {
    return window.location.origin + '/DatArchi/';
  }
  // For local development or other hosting, assume root is '/'
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

  selectors.forEach((selector, index) => {
    const attribute = attributes[index];
    const elements = container.querySelectorAll(selector);

    elements.forEach((el) => {
      const path = el.getAttribute(attribute);
      if (!path) return;

      // Adjust only root-relative paths, ignore external, mailto, etc.
      if (path.startsWith('/') && !path.startsWith('//')) {
        // Remove the leading slash and resolve relative to the siteRoot
        const relativePath = path.substring(1);
        el[attribute] = new URL(relativePath, siteRoot).href;
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

// Function to reload header and footer
async function reloadHeaderFooter() {
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

    document.dispatchEvent(new Event('headerFooterReady'));
  } catch (err) {
    console.warn('reloadHeaderFooter: failed to reload partials:', err);
  }
}

// Export reload function globally
window.reloadHeaderFooter = reloadHeaderFooter;

document.addEventListener('DOMContentLoaded', async () => {
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
    document.dispatchEvent(new Event('headerFooterReady'));

    // Load mobile navigation script after header is injected
    const navScript = document.createElement('script');
    navScript.type = 'module';
    navScript.src = new URL('header/nav-mobile.js', SITE_ROOT + 'js/').href;
    document.head.appendChild(navScript);

  } catch (err) {
    lastError = err;
    console.warn('injectHeaderFooter: failed to load partials:', err);
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
