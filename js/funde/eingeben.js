import { firebaseService } from '../firebase-service.js';
import { auth, storage } from '../firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', async () => {
  let activeSite = await db.getActiveSite();
  if (!activeSite) {
      console.error('No active site found. Redirecting to site management.');
      window.location.href = '../sites/index.html';
      return;
  }

  const form = document.getElementById('fundForm');

  // #region Map Initialisation
  const map = L.map('fundMap', {
    crs: L.CRS.Simple
  });
  
  const imageUrl = activeSite.mapImageUrl;
  if (imageUrl) {
      const img = new Image();
      img.onload = async () => { // Made async to await initializePage
          const imageBounds = [[0, 0], [img.naturalHeight, img.naturalWidth]];
          L.imageOverlay(imageUrl, imageBounds).addTo(map);
          map.fitBounds(imageBounds);
          await initializePage(); // Initialize markers after map is ready
      };
      img.onerror = () => {
          console.error('Failed to load image for map overlay:', imageUrl);
          // Fallback if image fails to load
          document.getElementById('fundMap').innerHTML = '<p style="text-align:center; padding: 20px;">Kartenbild konnte nicht geladen werden.</p>';
          initializePage(); // Still initialize to show existing markers
      };
      img.src = imageUrl;
  } else {
      document.getElementById('fundMap').innerHTML = '<p style="text-align:center; padding: 20px;">Kein Kartenbild für diese Stätte. Gehen Sie zur <a href="../sites/index.html">Stättenverwaltung</a> um eines hinzuzufügen.</p>';
      await initializePage(); // Still initialize to show existing markers
  }


  let marker = null;
  const latInput = document.getElementById('latitude');
  const lonInput = document.getElementById('longitude');

  function setMarker(lat, lng) {
    if (!isFinite(lat) || !isFinite(lng)) return;
    const popupMessage = `Position ausgewählt: <br>Lat: ${lat.toFixed(4)} <br>Lon: ${lng.toFixed(4)}`;
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
        marker.getPopup().setContent(`Position ausgewählt: <br>Lat: ${p.lat.toFixed(4)} <br>Lon: ${p.lng.toFixed(4)}`);
      });
    }
    latInput.value = Number(lat).toFixed(6);
    lonInput.value = Number(lng).toFixed(6);
    marker.openPopup();
  }

  map.on('click', (e) => {
    setMarker(e.latlng.lat, e.latlng.lng);
  });
  // #endregion

  // #region Form & Storage Logic (Firebase Storage for files)
  async function uploadFileToFirebase(file, path) {
    if (!file) return null;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async function findZoneForCoordinates(lat, lng) {
    const zones = await db.getZones(); // Get zones for the active site from Firestore
    if (!zones || zones.length === 0) return null;
    const findX = lng;
    const findY = lat;
    for (const zone of zones) {
      const { x, y, width, height } = zone;
      if (findX >= x && findX <= x + width && findY >= y && findY <= y + height) {
        return zone.label || `Zone ${zone.id}`;
      }
    }
    return null;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // --- Process form data ---
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    data.id = data.fundId || `fund-${Date.now()}`;
    
    if (isFinite(data.latitude) && isFinite(data.longitude)) {
      data.zoneLabel = await findZoneForCoordinates(data.latitude, data.longitude);
    }

    // --- Handle file uploads to Firebase Storage ---
    const photoFile = document.getElementById('foto').files[0];
    const modelFile = document.getElementById('modell').files[0];

    const uid = auth.currentUser ? auth.currentUser.uid : 'anonymous'; // Fallback for testing
    const basePath = `users/${uid}/sites/${activeSite.id}/finds/${data.id}`;

    try {
      const photoUrl = await uploadFileToFirebase(photoFile, `${basePath}/photo-${photoFile?.name}`);
      const modelUrl = await uploadFileToFirebase(modelFile, `${basePath}/model-${modelFile?.name}`);
      
      data.photoUrl = photoUrl; // Store download URL, not Data URL
      data.modelUrl = modelUrl; // Store download URL, not Data URL

      // Remove local Data URLs, no longer needed
      delete data.photoDataUrl;
      delete data.modelDataUrl;

      await db.addFind(data); // Add find to active site in Firestore
      showSuccessAlert('Fund erfolgreich gespeichert!');
      
      // Clear all existing markers and re-render everything
      map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      await initializePage(); // Re-initialize to show updated finds
      form.reset();

    } catch (error) {
      console.error("Fehler beim Speichern des Fundes:", error);
      showSuccessAlert('Fehler beim Speichern des Fundes.', 'danger'); // Show error alert
    }
  });

  function showSuccessAlert(message, type = 'success') {
      const alertEl = document.getElementById('alert');
      if (alertEl) {
          alertEl.innerHTML = `
            <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>${message}</span>`;
          alertEl.className = `alert alert-${type}`;
          alertEl.hidden = false;
          setTimeout(() => { alertEl.hidden = true; }, 4000);
      }
  }
  // #endregion

  // #region UI Rendering
  function buildPopupContent(d) {
    const title = escapeHtml(d.titel || 'Kein Titel');
    const id = escapeHtml(d.id || 'N/A');
    const kategorie = escapeHtml(d.kategorie || 'N/A');
    const datierung = escapeHtml(d.datierung || 'N/A');

    let html = `<strong>${title}</strong><br><small>ID: ${id}</small>`;
    if (d.photoUrl) { // Use photoUrl from Firebase Storage
      html += `<img src="${d.photoUrl}" style="width:100%;max-width:220px;margin-top:8px;border-radius:4px;">`;
    }
    html += `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">`;
    html += `<div><strong>Kategorie:</strong> ${kategorie}</div>`;
    html += `<div><strong>Datierung:</strong> ${datierung}</div>`;
    if (d.modelUrl) {
        html += `<div><strong>3D-Modell:</strong> <a href="${d.modelUrl}" target="_blank" rel="noopener">Ansehen</a></div>`;
    }
    html += `</div>`;
    return html;
  }

  async function renderSavedList() {
    const container = document.getElementById('savedList');
    const finds = await db.getFinds(); // Get finds from active site from Firestore
    container.innerHTML = '<h2>Kürzlich hinzugefügte Funde</h2>';
    if (finds.length === 0) {
      container.innerHTML += '<p>Noch keine Funde erfasst.</p>';
      return;
    }

    const findsGrid = document.createElement('div');
    findsGrid.classList.add('saved-finds-grid');
    
    // Show newest first, but limit to the last 5 for performance
    const recentFinds = finds.slice(-5).reverse();

    for (const f of recentFinds) {
      const title = escapeHtml(f.titel || 'Unbenannter Fund');
      const description = escapeHtml(f.beschreibung || 'Keine Beschreibung.');
      const fundId = escapeHtml(f.id || 'N/A'); // Use f.id which is fundId
      const material = escapeHtml(f.material || 'N/A');
      const kategorie = escapeHtml(f.kategorie || 'N/A');
      const datierung = escapeHtml(f.datierung || 'N/A');
      const privacy = escapeHtml(f.privacy || 'private');
      const hasModel = f.modelUrl ? 'Ja' : 'Nein';


      const imageHtml = f.photoUrl // Use photoUrl from Firebase Storage
        ? `<img src="${f.photoUrl}" alt="${title}" class="saved-find-card-image">`
        : `<div class="find-card-image-placeholder">Kein Bild</div>`;

      const cardHtml = `
        <div class="saved-find-card">
          ${imageHtml}
          <div class="saved-find-card-content">
            <h4 class="saved-find-card-title">${title} <span class="text-muted" style="font-size: 12px; font-weight: 400;">(${fundId})</span></h4>
            <p class="saved-find-card-description">${description.substring(0, 70)}${description.length > 70 ? '...' : ''}</p>
            <div class="saved-find-card-details">
              <span><strong>Material:</strong> ${material}</span>
              <span><strong>Kategorie:</strong> ${kategorie}</span>
              <span><strong>Datierung:</strong> ${datierung}</span>
              <span><strong>Sichtbarkeit:</strong> ${privacy}</span>
              <span><strong>3D-Modell:</strong> ${hasModel}</span>
            </div>
          </div>
        </div>
      `;
      findsGrid.innerHTML += cardHtml;
    }
    container.appendChild(findsGrid);
  }
  // #endregion

  // #region Example & Delete Logic
    const addExampleFindsBtn = document.getElementById('addExampleFindsBtn');
    if (addExampleFindsBtn) {
        addExampleFindsBtn.addEventListener('click', () => {
            alert('Die Funktion zum Hinzufügen von Beispielen wird überarbeitet.');
        });
    }

    const deleteAllFindsBtn = document.getElementById('deleteAllFindsBtn');
    if (deleteAllFindsBtn) {
        deleteAllFindsBtn.addEventListener('click', async () => {
        if (confirm(`Möchten Sie wirklich alle Funde der aktiven Stätte "${activeSite.name}" löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            await db.clearFindsForActiveSite(); // Clear finds in Firestore
            showSuccessAlert('Alle Funde der aktiven Stätte gelöscht!');
            // Clear existing markers and re-render everything
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            await initializePage(); // Re-initialize to reflect changes
        }
        });
    }
  // #endregion

  // #region Initialisation
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]'/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',''':'&#39;'}[c]));
  }
  
  async function initializePage() {
    activeSite = await db.getActiveSite(); // Re-fetch active site in case it changed
    if (!activeSite) { // Double check in case of concurrent changes
        window.location.href = '../sites/index.html';
        return;
    }

    await renderSavedList();
    
    // Clear all existing markers on the map before adding new ones
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const finds = await db.getFinds(); // Get finds from active site from Firestore
    finds.forEach(find => {
      if (isFinite(find.latitude) && isFinite(find.longitude)) {
        const popupContent = buildPopupContent(find);
        L.marker([find.latitude, find.longitude])
          .addTo(map)
          .bindPopup(popupContent);
      }
    });
  }

  // If map image is not set, initializePage immediately (no image.onload to wait for)
  if (!activeSite.mapImageUrl) {
      await initializePage();
  } else { // If map image is set, wait for it to load
      img.src = imageUrl; // Re-assign src to trigger onload if not already loaded (e.g. on first page load)
  }
  // #endregion
});
