// js/sidebar/sidebar.js
// This module handles the interactive logic for the zone management sidebar controls.

import {
  saveZonesDebounced,
  createZoneElement,
  getNextId,
  setOverlayViewBoxToImage,
  clearDomZones
} from '../zone.js';

function qs(sel) { return document.querySelector(sel); }

function generateGrid(cols = 4, rows = 3, attachListeners = true) {
  const svg = qs('#overlay');
  if (!svg) return;
  const viewBox = svg.getAttribute('viewBox') || '0 0 1000 600';
  const parts = viewBox.split(' ').map(Number);
  const vx = parts[0] || 0;
  const vy = parts[1] || 0;
  const vw = parts[2] || 1000;
  const vh = parts[3] || 600;

  const w = vw / cols;
  const h = vh / rows;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  if (!zonesGroup || !zoneList) return;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = vx + c * w;
      const y = vy + r * h;
      const label = `Zone ${r + 1}-${c + 1}`;
      createZoneElement({ x, y, width: w, height: h, label }, zonesGroup, zoneList, attachListeners);
    }
  }
  // rects = zonesGroup ? Array.from(zonesGroup.querySelectorAll('rect')) : []; // this line is commented out because `rects` is not defined in this scope
  saveZonesDebounced();
  console.log('[zone] generated grid', cols, 'x', rows);
  return true;
}

function clearAllZones() {
  const svg = qs('#overlay');
  if (!svg) return;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  clearDomZones(zonesGroup, zoneList);
  saveZonesDebounced();
}

function updateGenerateButtonState() {
  const svgLocal = qs('#overlay');
  const zonesGroupLocal = svgLocal ? svgLocal.querySelector('.zones') : null;
  const existing = zonesGroupLocal ? zonesGroupLocal.querySelectorAll('rect').length : 0;
  
  const btnGenerate = qs('#btnGenerateGrid');
  const gridClear = qs('#gridClear');
  const gridInfoMessage = qs('#gridInfoMessage');

  if (existing === 0) {
    if (btnGenerate) { btnGenerate.disabled = false; btnGenerate.textContent = 'Generieren'; }
    if (gridInfoMessage) gridInfoMessage.textContent = 'Kein Raster erkannt. Verwenden Sie die Steuerelemente, um eines zu erstellen.';
  } else {
    if (btnGenerate) { btnGenerate.disabled = !gridClear.checked; btnGenerate.textContent = gridClear.checked ? 'Raster ersetzen' : 'Generieren'; }
    if (gridInfoMessage) gridInfoMessage.textContent = 'Ein Raster existiert bereits. Aktivieren Sie "Löschen", um es zu ersetzen.';
  }
  // attach change handler if not already attached
  if (gridClear && !gridClear._listenerAdded) {
    gridClear.addEventListener('change', updateGenerateButtonState);
    gridClear._listenerAdded = true;
  }
}

function attachSidebarListeners() {
  // Grid generation
  const btnGenerate = qs('#btnGenerateGrid');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      const cols = Math.max(1, parseInt(qs('#gridCols').value, 10) || 1);
      const rows = Math.max(1, parseInt(qs('#gridRows').value, 10) || 1);
      const clear = qs('#gridClear').checked;
      
      const svgLocal = qs('#overlay');
      const zonesGroupLocal = svgLocal ? svgLocal.querySelector('.zones') : null;
      const existing = zonesGroupLocal ? zonesGroupLocal.querySelectorAll('rect').length : 0;

      if (existing && !clear) {
        alert('Ein Raster existiert bereits. Aktivieren Sie "Löschen", um es zu ersetzen.');
        return;
      }
      if (existing && clear) {
        if (!confirm(`Dies löscht alle vorhandenen Zonen und generiert ein Raster von ${cols}x${rows}. Fortfahren?`)) return;
        clearAllZones();
      }
      generateGrid(cols, rows, true);
      updateGenerateButtonState();
      saveZonesDebounced(); // Ensure zones are saved after grid generation
    });
  }

  // Initial UI sync for grid generate button
  updateGenerateButtonState();
}

document.addEventListener('DOMContentLoaded', attachSidebarListeners);
