// js/funde/statistics.js

document.addEventListener('DOMContentLoaded', () => {
  const FINDS_STORAGE_KEY = 'datarchi.funde.v1';
  const statisticsOverview = document.getElementById('statistics-overview');
  const categoryCheckboxes = document.querySelectorAll('#statistics-options input[type="checkbox"]');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<"'வுகளை]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  // --- Render Functions for each Statistic Card ---

  function renderTotalFindsCard(finds) {
    return `
      <div class="statistic-card" data-category="total">
        <h3>Gesamtzahl der Funde</h3>
        <p>${finds.length}</p>
      </div>
    `;
  }

  function renderMaterialCard(finds) {
    const materialCounts = finds.reduce((acc, find) => {
      const material = escapeHtml(find.material || 'Unbekannt');
      acc[material] = (acc[material] || 0) + 1;
      return acc;
    }, {});
    const sortedMaterials = Object.entries(materialCounts).sort(([,a], [,b]) => b - a);
    const materialList = sortedMaterials.length > 0
      ? sortedMaterials.map(([material, count]) => `<li><span>${material}</span> <strong>${count}</strong></li>`).join('')
      : '<li>Keine Daten</li>';
    return `
      <div class="statistic-card" data-category="material">
        <h3>Funde nach Material</h3>
        <ul>${materialList}</ul>
      </div>
    `;
  }

  function renderDatingCard(finds) {
    const datingCounts = finds.reduce((acc, find) => {
      const dating = escapeHtml(find.datierung || 'Unbekannt');
      acc[dating] = (acc[dating] || 0) + 1;
      return acc;
    }, {});

    // Optimized dating sort: try to extract year ranges for better sorting
    const sortedDatings = Object.entries(datingCounts).sort(([datingA], [datingB]) => {
      const parseYear = (s) => {
        const match = s.match(/(\d{1,4})\s*(v\.\s*Chr\.|n\.\s*Chr\.)?/);
        if (match) {
          let year = parseInt(match[1], 10);
          if (match[2] && match[2].includes('v. Chr.')) year = -year; // BC dates as negative
          return year;
        }
        return 999999; // Unknown dates at the end
      };
      const yearA = parseYear(datingA);
      const yearB = parseYear(datingB);
      return yearA - yearB;
    });

    const datingList = sortedDatings.length > 0
      ? sortedDatings.map(([dating, count]) => `<li><span>${dating}</span> <strong>${count}</strong></li>`).join('')
      : '<li>Keine Daten</li>';
    return `
      <div class="statistic-card" data-category="dating">
        <h3>Funde nach Datierung</h3>
        <ul>${datingList}</ul>
      </div>
    `;
  }

  function renderPhotoCard(finds) {
    const findsWithPhotos = finds.filter(find => find.photoDataUrl).length;
    const findsWithoutPhotos = finds.length - findsWithPhotos;
    return `
      <div class="statistic-card" data-category="photos">
        <h3>Funde mit/ohne Foto</h3>
        <ul>
          <li><span>Mit Foto</span> <strong>${findsWithPhotos}</strong></li>
          <li><span>Ohne Foto</span> <strong>${findsWithoutPhotos}</strong></li>
        </ul>
      </div>
    `;
  }

  function renderZoneCard(finds) {
    const zoneCounts = finds.reduce((acc, find) => {
      const zone = escapeHtml(find.zoneLabel || 'Unbekannte Zone');
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {});
    const sortedZones = Object.entries(zoneCounts).sort(([,a], [,b]) => b - a);
    const zoneList = sortedZones.length > 0
      ? sortedZones.map(([zone, count]) => `<li><span>${zone}</span> <strong>${count}</strong></li>`).join('')
      : '<li>Keine Daten</li>';
    return `
      <div class="statistic-card" data-category="zones">
        <h3>Funde nach Zone</h3>
        <ul>${zoneList}</ul>
      </div>
    `;
  }

  // --- Main Render Function ---
  function renderStatistics() {
    const finds = JSON.parse(localStorage.getItem(FINDS_STORAGE_KEY)) || [];
    statisticsOverview.innerHTML = ''; // Clear previous cards

    if (finds.length === 0) {
      statisticsOverview.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Noch keine Funde erfasst. <a href="./eingeben.html">Jetzt den ersten Fund erfassen!</a></p>';
      return;
    }

    // Determine which cards to render based on checkbox state
    const enabledCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.category);

    const cards = {
      total: renderTotalFindsCard(finds),
      material: renderMaterialCard(finds),
      dating: renderDatingCard(finds),
      photos: renderPhotoCard(finds),
      zones: renderZoneCard(finds)
    };

    enabledCategories.forEach(category => {
      if (cards[category]) {
        statisticsOverview.innerHTML += cards[category];
      }
    });

    // If no categories are selected, show a message
    if (enabledCategories.length === 0) {
      statisticsOverview.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Wählen Sie Kategorien oben aus, um Statistiken anzuzeigen.</p>';
    }
  }

  // --- Event Listeners ---
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', renderStatistics);
  });

  // Initial render on page load
  renderStatistics();
});
