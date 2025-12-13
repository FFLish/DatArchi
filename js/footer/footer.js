// Footer component script
export function enhanceFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  // Add small enhancement: ensure email links open mail client
  const emailLinks = footer.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach((l) => l.setAttribute('rel', 'nofollow noopener'));
}

// Initialize enhancements after header/footer are injected
document.addEventListener('headerFooterReady', enhanceFooter);
