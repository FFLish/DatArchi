// js/main-map.js
import { mapImageUrl } from './config.js';
import * as zones from './leaflet-zones.js';

document.addEventListener('DOMContentLoaded', () => {
  const FINDS_STORAGE_KEY = 'datarchi.funde.v1';

  // 1. Initialize Leaflet Map
    const map = L.map('imageMap', {
      crs: L.CRS.Simple,
      zoomControl: false, // Optional: disable default zoom control if not needed
    });
  
    // 2. Load Image Overlay
      const img = new Image();
      img.onload = () => {
        // Defer execution to ensure the browser has completed layout calculations
        setTimeout(() => {
          const mapContainer = document.getElementById('imageMap');
          if (!mapContainer) return;
    
          const containerWidth = mapContainer.offsetWidth;
          const imageAspectRatio = img.naturalHeight / img.naturalWidth;
          const calculatedHeight = containerWidth * imageAspectRatio;
    
          mapContainer.style.height = `${calculatedHeight}px`;
          
          const imageBounds = L.latLngBounds([[0, 0], [img.naturalHeight, img.naturalWidth]]);
          
          // Invalidate map size AFTER setting the new height
          map.invalidateSize();
    
          L.imageOverlay(mapImageUrl, imageBounds).addTo(map);
          map.fitBounds(imageBounds);
    
          // Initialize Zone Management
          zones.init(map, imageBounds);
    
          // Load Finds and Add Markers
          loadAndDisplayFinds();
        }, 0);
      };
      img.onerror = () => {    console.error('Failed to load map image:', mapImageUrl);
    // You could display a fallback message in the map container
    document.getElementById('imageMap').innerHTML = '<p style="text-align:center; padding: 20px;">Kartenbild konnte nicht geladen werden.</p>';
  };
  img.src = mapImageUrl;

  // Helper function to escape HTML for popups
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]|\'/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'" : '&#39;'
    }[c]));
  }

  // Helper function to build the popup content for a find
  function buildPopupContent(find) {
    const title = escapeHtml(find.titel || 'Unbenannter Fund');
    const description = escapeHtml(find.beschreibung || 'Keine Beschreibung.');
    const datierung = escapeHtml(find.datierung || 'N/A');
    const zoneLabel = escapeHtml(find.zoneLabel || '');
    
    let html = `<h3 style="margin: 0 0 5px 0; font-size: 16px;">${title}</h3>`;
    if (find.photoDataUrl) {
      html += `<img src="${find.photoDataUrl}" alt="${title}" style="width:100%; height:auto; max-height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">`;
    }
    html += `<p style="margin: 0; font-size: 14px;">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>`;
    
    let detailsHtml = `<div style="margin-top: 8px; font-size: 12px; color: #666;">`;
    detailsHtml += `<div><strong>Datierung:</strong> ${datierung}</div>`;
    if (zoneLabel) {
      detailsHtml += `<div><strong>Zone:</strong> ${zoneLabel}</div>`;
    }
    detailsHtml += `</div>`;
    
    html += detailsHtml;
    
    return html;
  }

  // 4. Function to Load Finds and Display them
  function loadAndDisplayFinds() {
    const savedFinds = JSON.parse(localStorage.getItem(FINDS_STORAGE_KEY)) || [];
    
    if (savedFinds.length === 0) {
      console.log('No finds in local storage to display.');
      return;
    }

    savedFinds.forEach(find => {
      // Check if the find has valid coordinates
      if (find.latitude && find.longitude && isFinite(find.latitude) && isFinite(find.longitude)) {
        const popupContent = buildPopupContent(find);
        L.marker([find.latitude, find.longitude])
          .addTo(map)
          .bindPopup(popupContent);
      }
    });

    console.log(`Displayed ${savedFinds.filter(f => f.latitude).length} finds on the map.`);
  }
});
