import { handleTeam } from '../about-us.js';

document.addEventListener('headerFooterReady', () => {
  const navLinks = Array.from(document.querySelectorAll('.header-nav a'));
  if (navLinks.length === 0) return;

  navLinks.forEach((link) => {
    try {
      const path = new URL(link.getAttribute('href'), document.baseURI).pathname;
      if (path.includes('/pages/about-us')) {
        link.addEventListener('click', (e) => { handleTeam(); });
      }
    } catch (e) {
    }
  });

  // create button hidden — manual zone creation disabled
  const createBtn = document.querySelector('#btnCreateZone');
  if (createBtn) {
    createBtn.style.display = 'none';
  }

  // header: Zones panel open button
  const navZones = document.querySelector('#navZones');
  if (navZones) {
    navZones.addEventListener('click', (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('openZones'));
    });
  }

  // header: create zone shortcut button — toggles draw mode
  const createZoneBtn = document.querySelector('#btnCreateZone');
  if (createZoneBtn) {
    createZoneBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('toggleZoneDraw'));
    });
  }
});
