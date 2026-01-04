import { getMapImageUrl } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
  const FINDS_STORAGE_KEY = 'datarchi.funde.v1';

  // Map initialisation
  const map = L.map('fundMap', {
    crs: L.CRS.Simple
  });
  
  const imageUrl = getMapImageUrl();
  
  const img = new Image();
  img.onload = () => {
    const imageBounds = [[0, 0], [img.naturalHeight, img.naturalWidth]];
    L.imageOverlay(imageUrl, imageBounds).addTo(map);
    map.fitBounds(imageBounds);
  };
  img.onerror = () => {
    console.error('Failed to load image for map overlay:', imageUrl);
    // Optionally, display a placeholder or an error message on the map
    // For now, we'll just log the error.
  };
  img.src = imageUrl;

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
  const ZONES_STORAGE_KEY = 'datarchi.zones.v1';

  // Find the zone that contains the given coordinates
  function findZoneForCoordinates(lat, lng) {
    const zonesData = JSON.parse(localStorage.getItem(ZONES_STORAGE_KEY));
    if (!zonesData || !zonesData.zones || zonesData.zones.length === 0) {
      return null;
    }

    // Leaflet's lat/lng in CRS.Simple corresponds to y/x
    // lat is y (from top), lng is x (from left)
    const findX = lng;
    const findY = lat;

    for (const zone of zonesData.zones) {
      const { x, y, width, height } = zone;
      if (findX >= x && findX <= x + width && findY >= y && findY <= y + height) {
        return zone.label || `Zone ${zone.id}`; // Return the zone's label or a fallback
      }
    }

    return null; // No containing zone found
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    data.id = `fund-${Date.now()}`; // Add a unique ID

    // Automatically associate find with a zone
    if (isFinite(data.latitude) && isFinite(data.longitude)) {
      data.zoneLabel = findZoneForCoordinates(data.latitude, data.longitude);
    }

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

  // --- Add Example Finds Logic ---
  const addExampleFindsBtn = document.getElementById('addExampleFindsBtn');
  if (addExampleFindsBtn) {
    addExampleFindsBtn.addEventListener('click', () => {
      addExampleFindsToPage();
    });
  }

  // Preset values for example finds
  const presetFindTemplates = [
    {
      titel: "Keramikscherbe",
      beschreibung: "Fragment einer römischen Terra Sigillata Schale.",
      material: "Keramik",
      datierung: "1. - 2. Jh. n. Chr.",
      funddatum: "2024-05-10"
    },
    {
      titel: "Bronzefibel",
      beschreibung: "Gut erhaltene Bronzefibel, möglicherweise vom Typ Aucissa.",
      material: "Bronze",
      datierung: "1. Jh. v. Chr.",
      funddatum: "2024-05-12"
    },
    {
      titel: "Feuersteinabschlag",
      beschreibung: "Unretouchierter Feuersteinabschlag, graues Material.",
      material: "Feuerstein",
      datierung: "4000 - 3000 v. Chr.",
      funddatum: "2024-05-11"
    },
    {
      titel: "Knochennadel",
      beschreibung: "Spitze Nadel aus Tierknochen, fein poliert.",
      material: "Knochen",
      datierung: "12. - 14. Jh. n. Chr.",
      funddatum: "2024-05-15"
    },
    {
      titel: "Glasscherbe",
      beschreibung: "Fragment eines modernen Glasgefäßes.",
      material: "Glas",
      datierung: "18. Jh. n. Chr.",
      funddatum: "2024-05-16"
    },
    {
      titel: "Eisensporn",
      beschreibung: "Korrodierter Eisensporn, mittelalterlich.",
      material: "Eisen",
      datierung: "9. - 11. Jh. n. Chr.",
      funddatum: "2024-05-18"
    },
    {
      titel: "Holzkammfragment",
      beschreibung: "Kleines Fragment eines Holzkamms, vermutlich frühmittelalterlich.",
      material: "Holz",
      datierung: "7. - 8. Jh. n. Chr.",
      funddatum: "2024-05-19"
    }
  ];

  function generateRandomFinds(count) { // Renamed from generateRandomFinds for clarity in this context
    const imageBounds = map.getBounds();
    const minLat = imageBounds.getNorth(); 
    const maxLat = imageBounds.getSouth(); 
    const minLon = imageBounds.getWest();  
    const maxLon = imageBounds.getEast();  
    
    const newFinds = [];
    for (let i = 0; i < count; i++) {
      const template = presetFindTemplates[Math.floor(Math.random() * presetFindTemplates.length)];
      const lat = Math.random() * (minLat - maxLat) + maxLat; 
      const lon = Math.random() * (maxLon - minLon) + minLon; 

      newFinds.push({
        id: `fund-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`, // More robust unique ID
        titel: template.titel,
        beschreibung: template.beschreibung,
        material: template.material,
        datierung: template.datierung,
        funddatum: template.funddatum,
        latitude: lat,
        longitude: lon,
        photoDataUrl: "", 
        zoneLabel: findZoneForCoordinates(lat, lon) || "Unbekannte Zone"
      });
    }
    return newFinds;
  }

  function addExampleFindsToPage() {
    const numInput = document.getElementById('numExampleFinds');
    let count = parseInt(numInput.value, 10);
    if (isNaN(count) || count < 1) {
      count = 10; 
      numInput.value = count; 
    }

    const generatedFinds = generateRandomFinds(count);
    let currentSavedFinds = JSON.parse(localStorage.getItem(FINDS_STORAGE_KEY)) || [];

    // Filter out existing finds by id to prevent exact duplicates on re-run
    const uniqueGeneratedFinds = generatedFinds.filter(genFind => 
        !currentSavedFinds.some(sFind => sFind.id === genFind.id));
    
    currentSavedFinds = [...currentSavedFinds, ...uniqueGeneratedFinds];
    localStorage.setItem(FINDS_STORAGE_KEY, JSON.stringify(currentSavedFinds));

    // Clear existing markers and re-render everything
    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    // Update the local savedFinds array for immediate page refresh
    savedFinds = currentSavedFinds; 
    initializePage();

    const alertEl = document.getElementById('alert');
    if (alertEl) {
      alertEl.innerHTML = `
        <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>${uniqueGeneratedFinds.length} Beispielfunde erfolgreich hinzugefügt!</span>`;
      alertEl.hidden = false;
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }
  }

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
    const zoneLabel = escapeHtml(d.zoneLabel || '');

    let html = `<strong>${title}</strong>`;
    if (desc) html += `<div>${desc}</div>`;
    if (zoneLabel) {
      html += `<div style="margin-top: 5px; font-size: 0.9em; color: #555;"><strong>Zone:</strong> ${zoneLabel}</div>`;
    }
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