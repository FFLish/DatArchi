// Main navbar script to connect all sections
import { handleZonen } from '../zonen.js';
import { handleObjekte } from '../objekte.js';
import { handleFotos } from '../fotos.js';
import { handleTeam } from '../team.js';

document.addEventListener('headerFooterReady', () => {
  const navLinks = document.querySelectorAll('.header-nav a');
  if (navLinks.length >= 4) {
    navLinks[0].addEventListener('click', (e) => { e.preventDefault(); handleZonen(); });
    navLinks[1].addEventListener('click', (e) => { e.preventDefault(); handleObjekte(); });
    navLinks[2].addEventListener('click', (e) => { e.preventDefault(); handleFotos(); });
    navLinks[3].addEventListener('click', (e) => { e.preventDefault(); handleTeam(); });
  }
});
