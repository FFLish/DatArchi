export function enhanceFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const emailLinks = footer.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach((l) => l.setAttribute('rel', 'nofollow noopener'));
}
document.addEventListener('headerFooterReady', enhanceFooter);
