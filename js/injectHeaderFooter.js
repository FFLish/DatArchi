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

function adjustLinks(container, siteRoot, basePath = '') { 
  if (!container || !siteRoot) return;
  // Ensure siteRoot ends with slash
  if (!siteRoot.endsWith('/')) siteRoot = siteRoot + '/';

  // Adjust anchors and asset links that start with '/'
  const anchors = container.querySelectorAll('a[href]');
  anchors.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('mailto:') && !href.startsWith('http')) {
      // Prepend basePath to root-relative paths
      a.href = new URL(basePath + href, siteRoot).href;
    }
  });

  const assets = container.querySelectorAll('[src]');
  assets.forEach((el) => {
    const src = el.getAttribute('src');
    if (!src) return;
    if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith('http')) {
      // Prepend basePath to root-relative paths
      el.src = new URL(basePath + src, siteRoot).href;
    }
  });

  const links = container.querySelectorAll('link[href]');
  links.forEach((l) => {
    const href = l.getAttribute('href');
    if (!href) return;
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
      // Prepend basePath to root-relative paths
      l.href = new URL(basePath + href, siteRoot).href;
    }
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

// Try to load header/footer. Many browsers block fetch() when opening files
// directly (file://). Prefer serving the site over HTTP. This function
// attempts two fetch strategies and inserts a helpful message on failure.
document.addEventListener('DOMContentLoaded', async () => {
  ensureContainers();

  let loaded = false;
  let lastError = null;

  // Determine the correct project root based on protocol
  let projectRoot = null;
  if (document.location.protocol === 'file:') {
    // For file:// protocol, derive projectRoot from script's own URL
    try {
      // Assuming injectHeaderFooter.js is at projectRoot/js/injectHeaderFooter.js
      projectRoot = new URL('../../', import.meta.url).href;
    } catch (e) {
      console.error('Failed to determine projectRoot for file:// protocol:', e);
      projectRoot = document.baseURI; // Fallback, might still be problematic if baseURI is nested
    }
  } else {
    // For http(s):// protocols, projectRoot is simply the origin
    projectRoot = document.location.origin + '/';
  }

  // Determine basePath for GitHub Pages or other subdirectories
  let basePath = '';
  // Check if it's a GitHub Pages domain (or a local simulation of it)
  if (document.location.hostname.endsWith('github.io')) {
    // Assuming repository name is the first segment of the pathname
    // e.g., /your-repo-name/path/to/page.html -> /your-repo-name
    const pathSegments = document.location.pathname.split('/');
    // Use the first non-empty segment after the root '/'
    if (pathSegments.length > 1 && pathSegments[1] !== '') {
        // This is a heuristic: assume the first segment after '/' is the repo name if on github.io
        // or if it's 'DatArchi' when running locally (if testing a subfolder setup)
        if (pathSegments[1] === 'DatArchi') { // Explicitly check for "DatArchi" or infer better
            basePath = '/' + pathSegments[1];
        }
    }
  }


  const attemptUrls = [];

  // Always use projectRoot for fetching partials
  attemptUrls.push({
    header: new URL('partials/header.html', projectRoot).href,
    footer: new URL('partials/footer.html', projectRoot).href,
    note: 'calculated-absolute'
  });

  for (const urls of attemptUrls) {
    try {
      await Promise.all([
        injectSection('#header-container', urls.header),
        injectSection('#footer-container', urls.footer)
      ]);
      // The siteRoot for adjusting injected links is the determined projectRoot
      const siteRootForAdjust = projectRoot; // Using a distinct name for clarity
      const headerEl = document.querySelector('#header-container');
      const footerEl = document.querySelector('#footer-container');
      adjustLinks(headerEl, siteRootForAdjust, basePath);
      adjustLinks(footerEl, siteRootForAdjust, basePath);
      loaded = true;
      document.dispatchEvent(new Event('headerFooterReady'));
      break;
    } catch (err) {
      lastError = err;
      console.warn('injectHeaderFooter: attempt failed (', urls.note, '):', err);
    }
  }

  if (!loaded) {
    console.error('injectHeaderFooter: failed to load header/footer. See earlier warnings.', lastError);
    // Insert a small visible hint so the user sees something on the page
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
