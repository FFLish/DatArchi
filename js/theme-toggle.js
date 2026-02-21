// js/theme-toggle.js
// ====================
// Dark/Light theme toggle functionality with delegated event handling

(function() {
  // Prevent running multiple times
  if (window.__themeToggleInitialized) {
    return;
  }
  window.__themeToggleInitialized = true;

  const THEME_STORAGE_KEY = 'datarchi.theme';
  const htmlElement = document.documentElement;

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateToggleUI(theme);
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priority: 1. Saved theme, 2. System preference, 3. Default to light
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
  }

  // Helper: update button icons/aria
  function updateToggleUI(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    
    const sun = button.querySelector('.sun');
    const moon = button.querySelector('.moon');
    
    // Show sun for light, moon for dark
    if (sun) sun.hidden = (theme === 'dark');
    if (moon) moon.hidden = (theme === 'light');
    
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} mode`);
  }

  // Use delegated listening on document to catch theme button whenever it appears
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      e.preventDefault();
      toggleTheme();
    }
  }, true); // Use capture phase for reliability

  // Also wait for header injection to update UI state
  document.addEventListener('headerFooterReady', () => {
    const current = htmlElement.getAttribute('data-theme') || 'light';
    updateToggleUI(current);
  });

  // Run initialization immediately
  initializeTheme();
})();
