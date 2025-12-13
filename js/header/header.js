// Header component script
export function createHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Add header-specific functionality here
  console.log('Header initialized');
}

// Wait for header/footer injection to complete; then initialize header
document.addEventListener('headerFooterReady', createHeader);
