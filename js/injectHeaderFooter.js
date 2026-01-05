// Inject header and footer from external HTML files
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
  if (!document.querySelector('#header-container')) {
    const headerDiv = document.createElement('div');
    headerDiv.id = 'header-container';
    document.body.prepend(headerDiv);
  }
  if (!document.querySelector('#footer-container')) {
    const footerDiv = document.createElement('div');
    footerDiv.id = 'footer-container';
    document.body.appendChild(footerDiv);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  ensureContainers();

  let loaded = false;
  let lastError = null;

  // Determine the correct site root URL
  let siteRoot;
  if (document.location.protocol === 'file:') {
    // For local file viewing, root is two levels up from this script
    siteRoot = new URL('../../', import.meta.url).href;
  } else {
    // For http(s) protocols, handle potential subdirectories (like GitHub Pages)
    const origin = document.location.origin;
    const pathname = document.location.pathname;
    
    // Heuristic for GitHub Pages: if path contains repo name, use it as base
    const repoName = 'DatArchi'; // Your repository name
    const ghPagesBasePath = `/${repoName}/`;
    
    if (pathname.startsWith(ghPagesBasePath)) {
      siteRoot = `${origin}${ghPagesBasePath}`;
    } else {
      // Otherwise, assume it's served from the root
      siteRoot = origin + '/';
    }
  }

  // Ensure siteRoot always ends with a slash
  if (!siteRoot.endsWith('/')) {
    siteRoot += '/';
  }

  console.log('[Debug] Origin:', document.location.origin);
  console.log('[Debug] Pathname:', document.location.pathname);
  console.log('[Debug] Calculated siteRoot:', siteRoot);

  const headerUrl = new URL('partials/header.html', siteRoot).href;
  const footerUrl = new URL('partials/footer.html', siteRoot).href;

  console.log('[Debug] Fetching Header from:', headerUrl);
  console.log('[Debug] Fetching Footer from:', footerUrl);

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
