// Main navbar script to connect all sections
import { handleZonen } from './zonen.js';
import { handleObjekte } from './objekte.js';
import { handleFotos } from './funde.js';
import { handleTeam } from './about-us.js';

document.addEventListener('headerFooterReady', () => {
  const navLinks = Array.from(document.querySelectorAll('.header-nav a'));
  if (navLinks.length === 0) return;

  navLinks.forEach((link) => {
    try {
      const path = new URL(link.getAttribute('href'), document.baseURI).pathname;
      if (path.includes('/pages/zonen')) {
        link.addEventListener('click', (e) => { handleZonen(); });
      } else if (path.includes('/pages/funde') || path.includes('/pages/objekte')) {
        link.addEventListener('click', (e) => { handleObjekte(); });
      } else if (path.includes('/pages/fotos')) {
        link.addEventListener('click', (e) => { handleFotos(); });
      } else if (path.includes('/pages/about-us') || path.includes('/pages/team')) {
        link.addEventListener('click', (e) => { handleTeam(); });
      }
      // All links allow default navigation
    } catch (e) {
      // ignore malformed hrefs
    }
  });
});
