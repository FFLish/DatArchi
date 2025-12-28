// Consolidated zones module: persistence, UI controls, selection/draw interaction
// Exports: createZoneElement, getNextId, toggleActiveById, createZoneRect, handleZonesNav, default init
const STORAGE_KEY = 'datarchi.zones.v1';

function qs(sel) { return document.querySelector(sel); }

// Persistence
function serializeZones(zonesGroup, zoneList) {
  const rects = Array.from(zonesGroup.querySelectorAll('rect'));
  return rects.map(r => {
    const id = r.getAttribute('data-zone') || r.id.replace(/^zone-/, '');
    const li = zoneList.querySelector(`li[data-zone='${id}']`);
    return {
      id: String(id),
      x: parseFloat(r.getAttribute('x')) || 0,
      y: parseFloat(r.getAttribute('y')) || 0,
      width: parseFloat(r.getAttribute('width')) || 0,
      height: parseFloat(r.getAttribute('height')) || 0,
      class: r.getAttribute('class') || '',
      label: li ? (li.textContent || '') : `Zone ${id}`
    };
  });
}

function saveZonesDebounced() {
  if (saveZonesDebounced._t) clearTimeout(saveZonesDebounced._t);
  saveZonesDebounced._t = setTimeout(() => saveZones(), 120);
}

function saveZones() {
  const svg = qs('#overlay');
  if (!svg) return;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  if (!zonesGroup || !zoneList) return;
  const data = { savedAt: Date.now(), zones: serializeZones(zonesGroup, zoneList) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log('[zone] zones saved', data.zones.length);
}

function clearDomZones(zonesGroup, zoneList) {
  zonesGroup.querySelectorAll('rect').forEach(c => c.remove());
  zoneList.querySelectorAll('li').forEach(li => li.remove());
}

// Zone element management
function createZoneElement(data, zonesGroup, zoneList, attachListeners = true) {
  const id = data.id || getNextId(zonesGroup);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('id', `zone-${id}`);
  rect.setAttribute('data-zone', String(id));
  rect.setAttribute('x', String(data.x || 0));
  rect.setAttribute('y', String(data.y || 0));
  rect.setAttribute('width', String(data.width || 10));
  rect.setAttribute('height', String(data.height || 10));
  if (data.class) rect.setAttribute('class', data.class);
  zonesGroup.appendChild(rect);

  const li = document.createElement('li');
  li.setAttribute('data-zone', String(id));
  li.textContent = data.label || `Zone ${id}`;
  zoneList.appendChild(li);

  if (attachListeners) attachPerZoneListeners(rect, li);
  return { rect, li };
}

function attachPerZoneListeners(rect, li) {
  rect.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gridEditMode) {
      openZoneEditor(rect, li);
      return;
    }
    // otherwise toggle selection
    const id = rect.getAttribute('data-zone');
    toggleActiveById(id);
  });

  // Double-click is kept as a convenient shortcut for desktop users
  rect.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (gridEditMode) {
      openZoneEditor(rect, li);
    }
  });

  li.addEventListener('click', (e) => {
    const id = li.getAttribute('data-zone');
    if (gridEditMode) {
      const rect = document.querySelector(`#zone-${id}`);
      if (rect) openZoneEditor(rect, li);
      return;
    }
    toggleActiveById(id);
  });

  // Double-clicking list item also enters edit mode
  li.addEventListener('dblclick', (e) => {
    const id = li.getAttribute('data-zone');
    const rect = document.querySelector(`#zone-${id}`);
    if (rect) openZoneEditor(rect, li);
  });
}

function toggleActiveById(id) {
  const rect = document.querySelector(`#zone-${id}`);
  const li = document.querySelector(`#zoneList li[data-zone='${id}']`);
  if (!rect || !li) return;
  const now = rect.classList.toggle('active');
  li.classList.toggle('active', now);
}

function getNextId(zonesGroup) {
  const ids = Array.from(zonesGroup.querySelectorAll('rect')).map(c => parseInt(c.getAttribute('data-zone') || '0', 10)).filter(Boolean);
  const max = ids.length ? Math.max(...ids) : 0;
  return max + 1;
}

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
  rects = zonesGroup ? Array.from(zonesGroup.querySelectorAll('rect')) : [];
  saveZonesDebounced();
  console.log('[zone] generated grid', cols, 'x', rows);
  return true;
}

// promptGridAndGenerate removed — manual zone creation is disabled.
// Grid generation can still be triggered programmatically via `generateGrid()` if needed by admins.

function loadZones() {
  const svg = qs('#overlay');
  if (!svg) return;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  if (!zonesGroup || !zoneList) return;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Manual creation disabled: start with zero zones when nothing is saved.
    clearDomZones(zonesGroup, zoneList);
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.zones)) return;
    clearDomZones(zonesGroup, zoneList);
    parsed.zones.forEach(z => createZoneElement(z, zonesGroup, zoneList, true));
    console.log('[zone] loaded', parsed.zones.length, 'zones');
  } catch (err) {
    console.error('[zone] loadZones parse error', err);
  }
}

function deleteSelectedZones() {
  const svg = qs('#overlay');
  if (!svg) return;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  const selected = Array.from(zonesGroup.querySelectorAll('rect.active'));
  if (selected.length === 0) return;
  selected.forEach(c => {
    const id = c.getAttribute('data-zone');
    c.remove();
    const li = zoneList.querySelector(`li[data-zone='${id}']`);
    if (li) li.remove();
  });
  saveZonesDebounced();
}

function clearAllZones() {
  const svg = qs('#overlay');
  if (!svg) return;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  clearDomZones(zonesGroup, zoneList);
  saveZonesDebounced();
}

function createControlUI() {
  const aside = document.querySelector('.sidebar') || document.querySelector('.main') || document.body;
  const container = document.createElement('div');
  container.id = 'zonesControlsContainer';
  container.className = 'zones-controls';
  container.style.margin = '12px 0';
  // hide panel by default — open via navbar button
  container.style.display = 'none';
  container.innerHTML = `
    <div class="zone-controls-group">
      <button id="btnResetView" class="btn btn-sm" title="Réinitialiser la vue">Vue complète</button>
      <button id="btnToggleEdit" class="btn btn-sm">Éditer zones</button>
      <button id="btnDrawZone" class="btn btn-sm">Dessiner zone</button>
    </div>

    <details id="gridToolsDetails" class="zone-controls-details" open>
      <summary>Outils de grille</summary>
      <div class="zone-tools">
        <label>Cols: <input id="gridCols" type="number" min="1" value="4"></label>
        <label>Rows: <input id="gridRows" type="number" min="1" value="3"></label>
        <label><input id="gridClear" type="checkbox"> Effacer existant</label>
        <button id="btnGenerateGrid" class="btn btn-sm">Générer grille</button>
      </div>
    </details>

    <details id="dangerZoneDetails" class="zone-controls-details">
      <summary class="text-danger">Actions dangereuses</summary>
      <div class="zone-tools">
        <button id="btnDelete" class="btn btn-sm btn-danger">Supprimer sélection</button>
        <button id="btnClear" class="btn btn-sm btn-outline">Tout effacer</button>
      </div>
    </details>

    <div id="zoneEditHint" class="hint-message">
      <strong>Mode édition:</strong> Cliquez (ou tapez) une zone pour modifier son étiquette et sa géométrie.
    </div>
    <div id="drawHint" class="hint-message">
      <strong>Mode dessin:</strong> Cliquez-glissez sur l'image pour dessiner une nouvelle zone. (Touche <kbd>d</kbd> pour activer/désactiver)
    </div>
  `;
  aside.prepend(container);

  // Attach listeners to new elements
  container.querySelector('#btnResetView').addEventListener('click', () => resetView());
  container.querySelector('#btnDelete').addEventListener('click', () => {
    if (!confirm('Supprimer toutes les zones sélectionnées?')) return;
    deleteSelectedZones();
  });
  container.querySelector('#btnClear').addEventListener('click', () => {
    if (!confirm('Voulez-vous vraiment effacer toutes les zones? Cette action est irréversible.')) return;
    clearAllZones();
  });

  const btnGenerate = container.querySelector('#btnGenerateGrid');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      const cols = Math.max(1, parseInt(container.querySelector('#gridCols').value, 10) || 1);
      const rows = Math.max(1, parseInt(container.querySelector('#gridRows').value, 10) || 1);
      const clear = container.querySelector('#gridClear').checked;
      const svgLocal = qs('#overlay');
      const zonesGroupLocal = svgLocal ? svgLocal.querySelector('.zones') : null;
      const existing = zonesGroupLocal ? zonesGroupLocal.querySelectorAll('rect').length : 0;
      if (existing && !clear) {
        alert('Une grille existe déjà. Cochez "Effacer existant" pour la remplacer, ou ouvrez le panneau via la barre de navigation pour modifier la configuration.');
        return;
      }
      if (existing && clear) {
        if (!confirm(`Ceci effacera toutes les zones existantes et générera une grille de ${cols}x${rows}. Continuer?`)) return;
        clearAllZones();
      }
      generateGrid(cols, rows, true);
      updateGenerateButtonState();
    });
  }

  const btnToggle = container.querySelector('#btnToggleEdit');
  const hint = container.querySelector('#zoneEditHint');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      gridEditMode = !gridEditMode;
      btnToggle.textContent = gridEditMode ? 'Quitter édition' : 'Éditer zones';
      if (hint) hint.style.display = gridEditMode ? 'block' : 'none';
      if (gridEditMode) toggleDrawMode(false); // Disable draw mode when editing
    });
  }

  const btnDrawZone = container.querySelector('#btnDrawZone');
  const drawHint = container.querySelector('#drawHint');
  if (btnDrawZone) {
    btnDrawZone.addEventListener('click', () => {
      toggleDrawMode();
      btnDrawZone.textContent = drawMode ? 'Quitter dessin' : 'Dessiner zone';
      if (drawHint) drawHint.style.display = drawMode ? 'block' : 'none';
      if (drawMode) gridEditMode = false; // Disable edit mode when drawing
    });
  }

  // Initial UI sync
  function setInitialControlUI() {
    if (btnToggle) btnToggle.textContent = gridEditMode ? 'Quitter édition' : 'Éditer zones';
    if (hint) hint.style.display = gridEditMode ? 'block' : 'none';
    if (btnDrawZone) btnDrawZone.textContent = drawMode ? 'Quitter dessin' : 'Dessiner zone';
    if (drawHint) drawHint.style.display = drawMode ? 'block' : 'none';
  }
  setInitialControlUI();
}

function createBackdrop() {
  let backdrop = document.querySelector('.zones-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'zones-backdrop';
    backdrop.style.display = 'none';
    document.body.appendChild(backdrop);
  }
  // clicking backdrop should also close editor if open
  if (!backdrop._listenerAdded) {
    backdrop.addEventListener('click', () => {
      backdrop.style.display = 'none';
      const container = document.querySelector('.zones-controls');
      if (container) container.style.display = 'none';
      closeZoneEditor();
      // also collapse the compact tools if open
      const tools = document.querySelector('#zoneTools');
      if (tools && tools.tagName && tools.tagName.toLowerCase() === 'details') tools.open = false;
    });
    backdrop._listenerAdded = true;
  }
  return backdrop;
}

function openZonesPanel() {
  const aside = document.querySelector('.sidebar');
  if (!aside) return;
  // Open inline: ensure the compact tools details is open and visible; do not center the sidebar
  const tools = aside.querySelector('#zoneTools');
  if (tools && tools.tagName && tools.tagName.toLowerCase() === 'details') tools.open = true;
  const container = aside.querySelector('.zones-controls');
  if (container) container.style.display = '';
  updateGenerateButtonState();
  // focus first control for accessibility
  const first = aside.querySelector('#sbGridCols');
  if (first) first.focus();
}

function closeZonesPanel() {
  const aside = document.querySelector('.sidebar');
  if (!aside) return;
  aside.classList.remove('centered');
  const backdrop = document.querySelector('.zones-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  const container = aside.querySelector('.zones-controls');
  if (container) container.style.display = 'none';
}

function updateGenerateButtonState() {
  const svgLocal = qs('#overlay');
  const zonesGroupLocal = svgLocal ? svgLocal.querySelector('.zones') : null;
  const existing = zonesGroupLocal ? zonesGroupLocal.querySelectorAll('rect').length : 0;
  const containerEl = document.querySelector('#zonesControlsContainer');
  if (!containerEl) return;
  const btnGenerate = containerEl.querySelector('#btnGenerateGrid');
  const gridClear = containerEl.querySelector('#gridClear');
  let info = containerEl.querySelector('#gridInfoMessage');
  if (!info) {
    info = document.createElement('div');
    info.id = 'gridInfoMessage';
    info.style.marginTop = '8px';
    info.style.color = '#666';
    containerEl.appendChild(info);
  }
  if (existing === 0) {
    if (btnGenerate) { btnGenerate.disabled = false; btnGenerate.textContent = 'Generate Grid'; }
    info.textContent = 'Aucune grille détectée. Utilisez les contrôles pour en créer une.';
  } else {
    if (btnGenerate) { btnGenerate.disabled = !gridClear.checked; btnGenerate.textContent = gridClear.checked ? 'Remplacer la grille' : 'Generate Grid'; }
    info.textContent = 'Une grille existe déjà. Cochez "Clear existing" pour la remplacer, ou modifiez les paramètres et cochez la case.';
  }
  // attach change handler
  if (gridClear && !gridClear._listenerAdded) {
    gridClear.addEventListener('change', updateGenerateButtonState);
    gridClear._listenerAdded = true;
  }
}

document.addEventListener('openZones', () => openZonesPanel());
// header or other modules can trigger draw mode
document.addEventListener('toggleZoneDraw', () => {
  toggleDrawMode();
  // ensure panel visible when we toggle draw from header
  openZonesPanel();
});

// Listen for external grid generation requests (dispatched from sidebar controls)
document.addEventListener('generateGrid', (e) => {
  const { cols = 4, rows = 3, clear = false } = (e && e.detail) || {};
  if (clear) {
    if (!confirm(`This will clear existing zones and generate a ${cols}x${rows} grid. Proceed?`)) return;
    clearAllZones();
  }
  generateGrid(cols, rows, true);
  updateGenerateButtonState();
  // open panel so user can edit after generation
  openZonesPanel();
});

// Toggle the edit mode from external controls
document.addEventListener('toggleGridEdit', () => {
  gridEditMode = !gridEditMode;
  const container = document.querySelector('#zonesControlsContainer');
  const btn = container ? container.querySelector('#btnToggleEdit') : null;
  const hint = container ? container.querySelector('#zoneEditHint') : null;
  if (btn) btn.textContent = gridEditMode ? 'Exit Edit' : 'Edit Grid';
  if (hint) hint.style.display = gridEditMode ? 'block' : 'none';
  if (gridEditMode) openZonesPanel();
});

// Editor UI for modifying a single zone's geometry/label
function openZoneEditor(rect, li) {
  closeZoneEditor(); // ensure a single editor
  if (!rect) return;
  const id = rect.getAttribute('data-zone');
  const x = parseFloat(rect.getAttribute('x')) || 0;
  const y = parseFloat(rect.getAttribute('y')) || 0;
  const width = parseFloat(rect.getAttribute('width')) || 0;
  const height = parseFloat(rect.getAttribute('height')) || 0;
  const label = li ? (li.textContent || '') : `Zone ${id}`;

  const editor = document.createElement('div');
  editor.className = 'zone-editor';
  editor.innerHTML = `
    <div class="zone-editor-inner">
      <h3>Éditer la zone ${id}</h3>
      <label style="display:flex;justify-content:space-between;gap:12px"><span>X</span><input id="editor_x" type="number" value="${x}"></label>
      <label style="display:flex;justify-content:space-between;gap:12px"><span>Y</span><input id="editor_y" type="number" value="${y}"></label>
      <label style="display:flex;justify-content:space-between;gap:12px"><span>Largeur</span><input id="editor_w" type="number" value="${width}"></label>
      <label style="display:flex;justify-content:space-between;gap:12px"><span>Hauteur</span><input id="editor_h" type="number" value="${height}"></label>
      <label style="display:flex;justify-content:space-between;gap:12px"><span>Label</span><input id="editor_label" type="text" value="${label}"></label>
      <div class="actions" style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
        <button id="editorSave" class="btn btn-sm">Enregistrer</button>
        <button id="editorDelete" class="btn btn-sm btn-danger">Supprimer</button>
        <button id="editorCancel" class="btn btn-sm btn-outline">Annuler</button>
      </div>
    </div>
  `;
  const backdrop = document.querySelector('.zones-backdrop') || createBackdrop();
  backdrop.style.display = 'block';
  document.body.appendChild(editor);

  editor.querySelector('#editorCancel').addEventListener('click', closeZoneEditor);
  editor.querySelector('#editorSave').addEventListener('click', () => {
    const nx = parseFloat(editor.querySelector('#editor_x').value) || 0;
    const ny = parseFloat(editor.querySelector('#editor_y').value) || 0;
    const nw = parseFloat(editor.querySelector('#editor_w').value) || 0;
    const nh = parseFloat(editor.querySelector('#editor_h').value) || 0;
    const nlabel = editor.querySelector('#editor_label').value || '';
    rect.setAttribute('x', String(nx));
    rect.setAttribute('y', String(ny));
    rect.setAttribute('width', String(nw));
    rect.setAttribute('height', String(nh));
    if (li) li.textContent = nlabel;
    saveZonesDebounced();
    closeZoneEditor();
  });
  editor.querySelector('#editorDelete').addEventListener('click', () => {
    if (!confirm('Supprimer cette zone ?')) return;
    const id = rect.getAttribute('data-zone');
    rect.remove();
    if (li) li.remove();
    saveZonesDebounced();
    closeZoneEditor();
  });
}

function closeZoneEditor() {
  const editor = document.querySelector('.zone-editor');
  if (editor) editor.remove();
  const backdrop = document.querySelector('.zones-backdrop');
  if (backdrop) backdrop.style.display = 'none';
}

function observeAndPersist(zonesGroup, zoneList) {
  if (!zonesGroup || !zoneList) return;
  const obs = new MutationObserver(() => saveZonesDebounced());
  obs.observe(zonesGroup, { childList: true, subtree: true, attributes: true });
  obs.observe(zoneList, { childList: true, subtree: true, attributes: true });
}

// Selection / draw
let svg = null;
let zonesGroup = null;
let zoneList = null;
let rects = [];
let selectionRect = null;
let startPoint = null;
let isDragging = false;
let gridEditMode = false; // when true, double-click a zone to edit its geometry/label

// Draw mode state
let drawMode = false; // when true, click-drag draws a new zone
let isDrawing = false;
let drawingRect = null;

function toggleDrawMode(on) {
  drawMode = typeof on === 'boolean' ? on : !drawMode;
  // show hint in UI if present
  const containerEl = document.querySelector('#zonesControlsContainer');
  if (containerEl) {
    const drawHint = containerEl.querySelector('#drawHint');
    const drawBtn = containerEl.querySelector('#btnDrawZone');
    if (drawHint) drawHint.style.display = drawMode ? 'block' : 'none';
    if (drawBtn) drawBtn.textContent = drawMode ? 'Exit Draw' : 'Draw Zone';
  }
}

function startDrawing(p) {
  if (!svg) return;
  isDrawing = true;
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  r.setAttribute('x', String(p.x));
  r.setAttribute('y', String(p.y));
  r.setAttribute('width', '0');
  r.setAttribute('height', '0');
  r.setAttribute('class', 'zone-preview');
  drawingRect = r;
  svg.appendChild(r);
}

function updateDrawing(p) {
  if (!isDrawing || !drawingRect) return;
  const x0 = parseFloat(drawingRect.getAttribute('x')) || 0;
  const y0 = parseFloat(drawingRect.getAttribute('y')) || 0;
  const x = Math.min(x0, p.x);
  const y = Math.min(y0, p.y);
  const w = Math.abs(p.x - x0);
  const h = Math.abs(p.y - y0);
  drawingRect.setAttribute('x', String(x));
  drawingRect.setAttribute('y', String(y));
  drawingRect.setAttribute('width', String(w));
  drawingRect.setAttribute('height', String(h));
}

function finishDrawing() {
  if (!isDrawing || !drawingRect) return;
  const x = parseFloat(drawingRect.getAttribute('x')) || 0;
  const y = parseFloat(drawingRect.getAttribute('y')) || 0;
  const w = Math.abs(parseFloat(drawingRect.getAttribute('width')) || 0);
  const h = Math.abs(parseFloat(drawingRect.getAttribute('height')) || 0);
  drawingRect.remove();
  drawingRect = null;
  isDrawing = false;
  // ignore tiny rects
  if (w < 4 || h < 4) return;
  // create real zone
  createZoneElement({ x, y, width: w, height: h, label: 'Zone' }, zonesGroup, zoneList, true);
  rects = zonesGroup ? Array.from(zonesGroup.querySelectorAll('rect')) : [];
  saveZonesDebounced();
}


function toSvgPoint(clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function clearActiveClasses() {
  rects.forEach(r => r.classList.remove('active'));
  if (zoneList) Array.from(zoneList.querySelectorAll('li')).forEach(li => li.classList.remove('active'));
}

function setZoneActive(zoneIndex, active = true) {
  const rect = document.querySelector(`#zone-${zoneIndex}`);
  const li = zoneList ? zoneList.querySelector(`li[data-zone="${zoneIndex}"]`) : null;
  if (!rect || !li) return;
  rect.classList.toggle('active', active);
  li.classList.toggle('active', active);
}

function toggleZone(zoneIndex) {
  const rect = document.querySelector(`#zone-${zoneIndex}`);
  if (!rect) return;
  const isActive = rect.classList.contains('active');
  setZoneActive(zoneIndex, !isActive);
}

function rectsIntersectRect(rx, ry, rw, rh) {
  const found = [];
  rects.forEach(r => {
    const x = parseFloat(r.getAttribute('x')) || 0;
    const y = parseFloat(r.getAttribute('y')) || 0;
    const w = parseFloat(r.getAttribute('width')) || 0;
    const h = parseFloat(r.getAttribute('height')) || 0;
    if (x < rx + rw && x + w > rx && y < ry + rh && y + h > ry) {
      found.push(r);
    }
  });
  return found;
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  e.preventDefault();
  startPoint = toSvgPoint(e.clientX, e.clientY);

  // If draw mode active and clicked on background, start drawing
  if (drawMode && e.target === svg) {
    startDrawing(startPoint);
    return;
  }

  // Otherwise start selection drag
  isDragging = true;
  selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  selectionRect.setAttribute('x', startPoint.x);
  selectionRect.setAttribute('y', startPoint.y);
  selectionRect.setAttribute('width', 0);
  selectionRect.setAttribute('height', 0);
  selectionRect.setAttribute('class', 'selection-rect');
  selectionRect.setAttribute('rx', '4');
  svg.appendChild(selectionRect);
}

function onMouseMove(e) {
  const p = toSvgPoint(e.clientX, e.clientY);
  if (isDrawing) {
    updateDrawing(p);
    return;
  }
  if (!isDragging) return;
  if (selectionRect) {
    const x = Math.min(p.x, startPoint.x);
    const y = Math.min(p.y, startPoint.y);
    const w = Math.abs(p.x - startPoint.x);
    const h = Math.abs(p.y - startPoint.y);
    selectionRect.setAttribute('x', x);
    selectionRect.setAttribute('y', y);
    selectionRect.setAttribute('width', w);
    selectionRect.setAttribute('height', h);
  }
}

function onMouseUp(e) {
  // finalize drawing if in draw mode
  if (isDrawing) {
    finishDrawing();
    return;
  }

  if (!isDragging) return;
  isDragging = false;
  if (!selectionRect) return;
  const rx = parseFloat(selectionRect.getAttribute('x')) || 0;
  const ry = parseFloat(selectionRect.getAttribute('y')) || 0;
  const rw = parseFloat(selectionRect.getAttribute('width')) || 0;
  const rh = parseFloat(selectionRect.getAttribute('height')) || 0;

  const found = rectsIntersectRect(rx, ry, rw, rh);
  clearActiveClasses();
  found.forEach(r => {
    const zid = r.getAttribute('data-zone');
    setZoneActive(zid, true);
  });

  selectionRect.remove();
  selectionRect = null;
}

function attachListeners() {
  // Click on rects
  rects.forEach(r => {
    r.addEventListener('click', (e) => {
      e.stopPropagation();
      const zid = r.getAttribute('data-zone');
      toggleZone(zid);
    });
  });

  // Click on list
  if (zoneList) {
    zoneList.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const zid = li.getAttribute('data-zone');
      toggleZone(zid);
    });
  }

  // Rectangle selection / draw on svg
  if (svg) svg.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Keyboard shortcuts: Escape clears selection, 'd' toggles draw mode, Delete/Backspace deletes selected zones
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearActiveClasses();
      return;
    }
    if (e.key === 'd' || e.key === 'D') {
      // toggle draw mode
      toggleDrawMode();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // only delete when there are active selections
      const svgLocal = svg || document.querySelector('#overlay');
      const zonesGrp = svgLocal ? svgLocal.querySelector('.zones') : null;
      if (zonesGrp && zonesGrp.querySelectorAll('rect.active').length) {
        deleteSelectedZones();
      }
    }
  });

  // draw mode and UI toggles removed — manual zone creation is disabled.

  // Observe zones group to keep rects up-to-date when other modules add/remove zones
  if (zonesGroup && window.MutationObserver) {
    const obs = new MutationObserver(() => {
      rects = Array.from(zonesGroup.querySelectorAll('rect'));
      // re-attach per-zone listeners for newly added rects
      rects.forEach(r => {
        const id = r.getAttribute('data-zone');
        const li = zoneList ? zoneList.querySelector(`li[data-zone='${id}']`) : null;
        if (li) attachPerZoneListeners(r, li);
      });
    });
    obs.observe(zonesGroup, { childList: true, subtree: true });
  }
}

function setOverlayViewBoxToImage() {
  const img = document.querySelector('.image-map img');
  if (!img) return;
  const apply = () => {
    if (!svg) return;
    const w = img.naturalWidth || img.width || 1000;
    const h = img.naturalHeight || img.height || 600;
    if (w && h) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      console.log('[zone] overlay viewBox set to image', w, 'x', h);
    }
  };
  if (img.complete && img.naturalWidth) apply(); else img.addEventListener('load', apply);
  window.addEventListener('resize', () => { if (img.naturalWidth) apply(); });
}

function init() {
  svg = qs('#overlay');
  if (!svg) { console.warn('[zone] #overlay not found'); return; }
  // Ensure overlay viewBox matches the underlying image so the grid aligns with the visible image
  setOverlayViewBoxToImage();
  zonesGroup = svg.querySelector('.zones');
  zoneList = qs('#zoneList');
  if (!zonesGroup || !zoneList) { console.warn('[zone] .zones or #zoneList missing'); return; }

  rects = zonesGroup ? Array.from(zonesGroup.querySelectorAll('rect')) : [];
  rects.forEach(r => {
    const id = r.getAttribute('data-zone') || r.id.replace(/^zone-/, '');
    const li = zoneList.querySelector(`li[data-zone='${id}']`);
    if (li) attachPerZoneListeners(r, li);
  });

  // Prepare backdrop (hidden) — panel opens only when requested
  const asideElem = document.querySelector('.sidebar');
  if (asideElem) {
    let backdrop = document.querySelector('.zones-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'zones-backdrop';
      backdrop.style.display = 'none';
      document.body.appendChild(backdrop);
    }
    backdrop.addEventListener('click', () => {
      backdrop.style.display = 'none';
      const container = asideElem.querySelector('.zones-controls');
      if (container) container.style.display = 'none';
      // collapse the compact tools if open
      const tools = asideElem.querySelector('#zoneTools');
      if (tools && tools.tagName && tools.tagName.toLowerCase() === 'details') tools.open = false;
      closeZoneEditor();
    });
  }

  createControlUI();
  observeAndPersist(zonesGroup, zoneList);
  attachListeners();
  loadZones();

  // save on unload to reduce risk of lost changes
  window.addEventListener('beforeunload', () => saveZones());
}

function createZoneRect(data) {
  const svg = qs('#overlay');
  if (!svg) return null;
  const zonesGroup = svg.querySelector('.zones');
  const zoneList = qs('#zoneList');
  if (!zonesGroup || !zoneList) return null;
  const res = createZoneElement({ x: data.x, y: data.y, width: data.width, height: data.height, label: data.label }, zonesGroup, zoneList, true);
  saveZonesDebounced();
  return res;
}

// Auto-initialize on pages that include this script
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

// small nav helper — open the zones panel when called from header nav
export function handleZonesNav() { openZonesPanel(); }

export { createZoneElement, getNextId, toggleActiveById, createZoneRect };
export default { init };
