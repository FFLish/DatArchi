// js/theme-toggle.js
// ====================
// Dark/Light theme toggle functionality

(function() {
  const THEME_STORAGE_KEY = 'datarchi.theme';
  const htmlElement = document.documentElement;

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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

  // Wait for the header to be injected before attaching event listener
  document.addEventListener('headerFooterReady', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
      themeToggleButton.addEventListener('click', toggleTheme);
    }
  });

  // Run initialization immediately
  initializeTheme();
})();
