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
  // Ensure siteRoot ends with slash
  if (!siteRoot.endsWith('/')) siteRoot = siteRoot + '/';

  // Adjust anchors and asset links that start with '/'
  const anchors = container.querySelectorAll('a[href]');
  anchors.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('mailto:') && !href.startsWith('http')) {
      a.href = new URL(href.replace(/^\/+/, ''), siteRoot).href;
    }
  });

  const assets = container.querySelectorAll('[src]');
  assets.forEach((el) => {
    const src = el.getAttribute('src');
    if (!src) return;
    if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith('http')) {
      el.src = new URL(src.replace(/^\/+/, ''), siteRoot).href;
    }
  });

  const links = container.querySelectorAll('link[href]');
  links.forEach((l) => {
    const href = l.getAttribute('href');
    if (!href) return;
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
      l.href = new URL(href.replace(/^\/+/, ''), siteRoot).href;
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

  // Strategy A: resolve relative to this module (works when served over HTTP)
  const attemptUrls = [];
  try {
    attemptUrls.push({
      header: new URL('../partials/header.html', import.meta.url).href,
      footer: new URL('../partials/footer.html', import.meta.url).href,
      note: 'module-relative'
    });
  } catch (e) {
    // import.meta may not be available in some environments; ignore
  }

  // Strategy B: resolve relative to the current document location
  try {
    attemptUrls.push({
      header: '/partials/header.html', 
      footer: '/partials/footer.html',
      note: 'document-relative-fixed'
    });
  } catch (e) {
    // ignore
  }

  let loaded = false;
  let lastError = null;

  for (const urls of attemptUrls) {
    try {
      await Promise.all([
        injectSection('#header-container', urls.header),
        injectSection('#footer-container', urls.footer)
      ]);
      // compute siteRoot based on the header URL that loaded successfully
      const siteRoot = document.location.origin + '/';
      const headerEl = document.querySelector('#header-container');
      const footerEl = document.querySelector('#footer-container');
      adjustLinks(headerEl, siteRoot);
      adjustLinks(footerEl, siteRoot);
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
