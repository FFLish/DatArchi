// js/leaflet-zones.js

const ZONES_STORAGE_KEY = 'datarchi.zones.v1';
let map = null;
let zoneLayerGroup = null;
let imageBounds = null; // To be set from the main map

// Debounce save function to avoid excessive writes to localStorage
const saveZonesDebounced = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(saveZones, 250);
  };
})();

// --- Core Functions ---

function saveZones() {
  if (!zoneLayerGroup) return;

  const zones = [];
  zoneLayerGroup.eachLayer(layer => {
    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      // CRS.Simple: lat is y, lng is x
      const zoneData = {
        id: layer.options.zoneId,
        label: layer.options.zoneLabel,
        x: bounds.getWest(),  // lng
        y: bounds.getNorth(), // lat
        width: bounds.getEast() - bounds.getWest(),
        height: bounds.getSouth() - bounds.getNorth(), // This will be negative, which is fine
      };
      // Correct for negative height from Leaflet's bounds
      if (zoneData.height < 0) {
        zoneData.y = zoneData.y + zoneData.height;
        zoneData.height = -zoneData.height;
      }
      zones.push(zoneData);
    }
  });
  
  const dataToSave = { savedAt: Date.now(), zones: zones };
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(dataToSave));
  console.log(`[Zones] Saved ${zones.length} zones to local storage.`);
  updateSidebarList();
}

function loadZones() {
  if (!zoneLayerGroup) return;
  
  const rawData = localStorage.getItem(ZONES_STORAGE_KEY);
  if (!rawData) {
    console.log('[Zones] No zones found in local storage.');
    return;
  }

  const data = JSON.parse(rawData);
  if (!data.zones || data.zones.length === 0) {
    return;
  }

  clearAllZones(true); // silent clear

  data.zones.forEach(zoneData => {
    const { x, y, width, height, id, label } = zoneData;
    // Leaflet bounds are [[north, west], [south, east]]
    // With CRS.Simple, North/South are y, West/East are x
    const bounds = [[y, x], [y + height, x + width]];
    
    const rect = L.rectangle(bounds, {
      zoneId: id,
      zoneLabel: label,
      color: 'var(--accent)',
      weight: 1,
      fillOpacity: 0.1,
    });

    rect.bindPopup(`<strong>${label}</strong>`);
    rect.on('click', () => rect.bringToFront());
    zoneLayerGroup.addLayer(rect);
  });
  
  console.log(`[Zones] Loaded ${data.zones.length} zones onto the map.`);
  updateSidebarList();
}

function generateGrid(cols, rows) {
  if (!imageBounds) {
    console.error('[Zones] Cannot generate grid, image bounds not set.');
    return;
  }

  const totalWidth = imageBounds.getEast() - imageBounds.getWest();
  const totalHeight = imageBounds.getNorth() - imageBounds.getSouth();

  const cellWidth = totalWidth / cols;
  const cellHeight = totalHeight / rows;
  
  let idCounter = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x1 = imageBounds.getWest() + c * cellWidth;
      const y1 = imageBounds.getNorth() - r * cellHeight;
      const x2 = x1 + cellWidth;
      const y2 = y1 - cellHeight;
      
      const bounds = [[y1, x1], [y2, x2]];
      const label = `Zone ${r + 1}-${c + 1}`;
      const id = idCounter++;
      
      const rect = L.rectangle(bounds, {
        zoneId: id,
        zoneLabel: label,
        color: 'var(--accent)',
        weight: 1,
        fillOpacity: 0.1,
      });

      rect.bindPopup(`<strong>${label}</strong>`);
      zoneLayerGroup.addLayer(rect);
    }
  }

  console.log(`[Zones] Generated a ${cols}x${rows} grid.`);
  saveZones();
}

function clearAllZones(silent = false) {
  if (!zoneLayerGroup) return;
  zoneLayerGroup.clearLayers();
  if (!silent) {
    console.log('[Zones] Cleared all zones.');
    saveZones();
  }
  updateSidebarList();
}

// --- UI and Sidebar ---

function updateSidebarList() {
  const zoneListEl = document.getElementById('zoneList');
  if (!zoneListEl) return;
  
  zoneListEl.innerHTML = '';
  
  if (!zoneLayerGroup || zoneLayerGroup.getLayers().length === 0) {
    zoneListEl.innerHTML = '<li class="text-muted" style="padding: 10px;">Keine Zonen definiert.</li>';
    return;
  }

  zoneLayerGroup.eachLayer(layer => {
    const li = document.createElement('li');
    li.textContent = layer.options.zoneLabel;
    li.setAttribute('data-zone-id', layer.options.zoneId);

    li.addEventListener('click', () => {
      map.fitBounds(layer.getBounds(), { padding: [50, 50] });
      layer.openPopup();
    });
    
    zoneListEl.appendChild(li);
  });
}

function attachUIListeners() {
  const btnGenerate = document.getElementById('btnGenerateGrid');
  const gridColsInput = document.getElementById('gridCols');
  const gridRowsInput = document.getElementById('gridRows');
  const gridClearCheckbox = document.getElementById('gridClear');
  const gridInfoMessage = document.getElementById('gridInfoMessage');

  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      const cols = parseInt(gridColsInput.value, 10) || 4;
      const rows = parseInt(gridRowsInput.value, 10) || 3;

      if (gridClearCheckbox.checked) {
        if (confirm(`Dies löscht alle vorhandenen Zonen und generiert ein neues ${cols}x${rows} Raster. Fortfahren?`)) {
          clearAllZones(true); // silent clear before generating
          generateGrid(cols, rows);
        }
      } else {
        if (zoneLayerGroup.getLayers().length > 0) {
          alert('Es existieren bereits Zonen. Bitte aktivieren Sie die "Löschen" Checkbox, um das Raster zu ersetzen.');
          return;
        }
        generateGrid(cols, rows);
      }
    });
  }

  function updateGenerateButtonState() {
        const hasZones = zoneLayerGroup && zoneLayerGroup.getLayers().length > 0;
        if (hasZones) {
            gridInfoMessage.textContent = 'Aktivieren Sie "Löschen", um das Raster zu ersetzen.';
            btnGenerate.textContent = 'Ersetzen';
            btnGenerate.disabled = !gridClearCheckbox.checked;
        } else {
            gridInfoMessage.textContent = '';
            btnGenerate.textContent = 'Generieren';
            btnGenerate.disabled = false;
        }
    }
  
    gridClearCheckbox.addEventListener('change', updateGenerateButtonState);
    // Initial state
    if (zoneLayerGroup) {
       updateGenerateButtonState();
    }
}


// --- Initialization ---

export function init(leafletMap, bounds) {
  if (!leafletMap) {
    console.error('[Zones] Leaflet map object is required for initialization.');
    return;
  }
  map = leafletMap;
  imageBounds = bounds;
  zoneLayerGroup = L.layerGroup().addTo(map);

  attachUIListeners();
  loadZones();
}
