document.addEventListener('DOMContentLoaded', () => {
  const FINDS_STORAGE_KEY = 'datarchi.funde.v1';

  // Map initialisation
  const map = L.map('fundMap').setView([47.0, 8.0], 6);
  // Dark basemap for a consistent dark theme
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &amp; CARTO'
  }).addTo(map);

  let marker = null;
  const latInput = document.getElementById('latitude');
  const lonInput = document.getElementById('longitude');

  function setMarker(lat, lng) {
    if (!isFinite(lat) || !isFinite(lng)) return;
    const popupMessage = `Position ausgewählt: <br>Lat: ${lat.toFixed(6)} <br>Lon: ${lng.toFixed(6)}`;
    if (marker) {
      marker.setLatLng([lat, lng]);
      marker.getPopup().setContent(popupMessage);
    } else {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.bindPopup(popupMessage).openPopup();
      marker.on('moveend', e => {
        const p = e.target.getLatLng();
        latInput.value = p.lat.toFixed(6);
        lonInput.value = p.lng.toFixed(6);
        marker.getPopup().setContent(`Position ausgewählt: <br>Lat: ${p.lat.toFixed(6)} <br>Lon: ${p.lng.toFixed(6)}`);
      });
    }
    latInput.value = Number(lat).toFixed(6);
    lonInput.value = Number(lng).toFixed(6);
    marker.openPopup(); // Ensure popup is open when marker is first set or moved.
  }

  map.on('click', (e) => {
    setMarker(e.latlng.lat, e.latlng.lng);
  });



  // Form & storage
  const form = document.getElementById('fundForm');
  const savedFinds = JSON.parse(localStorage.getItem(FINDS_STORAGE_KEY)) || [];

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    data.id = `fund-${Date.now()}`; // Add a unique ID

    const photoInput = document.getElementById('foto');
    const file = photoInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        data.photoDataUrl = reader.result;
        saveAndRender(data);
      };
      reader.readAsDataURL(file);
    } else {
      saveAndRender(data);
    }
  });

  function saveAndRender(data) {
    savedFinds.push(data);
    localStorage.setItem(FINDS_STORAGE_KEY, JSON.stringify(savedFinds));

    // Add marker for saved find (if coords present)
    if (isFinite(data.latitude) && isFinite(data.longitude)) {
      const popupContent = buildPopupContent(data);
      const m = L.marker([data.latitude, data.longitude]).addTo(map);
      m.bindPopup(popupContent);
    }

    renderSavedList();
    form.reset();

    const alertEl = document.getElementById('alert');
    if (alertEl) {
      alertEl.innerHTML = `
        <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>Fund erfolgreich gespeichert! Er wird in der Liste unten und auf der Funde-Seite angezeigt.</span>`;
      alertEl.hidden = false;
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }
  }

  function buildPopupContent(d) {
    const title = escapeHtml(d.titel || 'Kein Titel');
    const desc = escapeHtml(d.beschreibung || '');
    let html = `<strong>${title}</strong>`;
    if (desc) html += `<div>${desc}</div>`;
    if (d.photoDataUrl) html += `<img src="${d.photoDataUrl}" style="max-width:220px;margin-top:8px;border-radius:4px;">`;
    return html;
  }

  function renderSavedList() {
    const container = document.getElementById('savedList');
    container.innerHTML = '<h2>Gespeicherte Funde</h2>';
    if (savedFinds.length === 0) {
      container.innerHTML += '<p>Keine Funde gespeichert.</p>';
      return;
    }
    const ul = document.createElement('ul');
    for (const f of savedFinds) {
      const li = document.createElement('li');
      li.style.marginBottom = '8px';
      const title = escapeHtml(f.titel || '—');
      const mat = escapeHtml(f.material || '');
      const coords = (isFinite(f.latitude) && isFinite(f.longitude)) ? `(${Number(f.latitude).toFixed(6)}, ${Number(f.longitude).toFixed(6)})` : '(keine Koordinaten)';
      li.innerHTML = `<strong>${title}</strong> ${mat ? '— ' + mat : ''} <span class="muted">${coords}</span>`;
      if (f.photoDataUrl) {
        const img = document.createElement('img');
        img.src = f.photoDataUrl;
        img.style.maxWidth = '80px';
        img.style.marginLeft = '8px';
        li.appendChild(img);
      }
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }
  
  // --- Initial load ---
  function initializePage() {
    renderSavedList();
    savedFinds.forEach(find => {
      if (isFinite(find.latitude) && isFinite(find.longitude)) {
        const popupContent = buildPopupContent(find);
        L.marker([find.latitude, find.longitude]).addTo(map).bindPopup(popupContent);
      }
    });
  }

  initializePage();
});