// js/funde/statistics.js
import * as db from '../database.js';

document.addEventListener('DOMContentLoaded', async () => { // Make DOMContentLoaded async
  const statisticsOverview = document.getElementById('statistics-overview');
  const categoryCheckboxes = document.querySelectorAll('#statistics-options input[type="checkbox"]');
  const statsAllSitesCheckbox = document.getElementById('statsAllSites');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&#39;'}[c]));
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

    const sortedDatings = Object.entries(datingCounts).sort(([datingA], [datingB]) => {
      const parseYear = (s) => {
        const match = s.match(/(\d{1,4})\s*(v\.\s*Chr\.|n\.\s*Chr\.)?/);
        if (match) {
          let year = parseInt(match[1], 10);
          if (match[2] && match[2].includes('v. Chr.')) year = -year;
          return year;
        }
        return 999999;
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

  async function renderZoneCard(finds) { // Made async
    let sites = [];
    if (statsAllSitesCheckbox?.checked ?? false) {
        sites = await db.getSites(); // Await getSites if needed
    }

    const zoneCounts = finds.reduce((acc, find) => {
      let zoneLabel = escapeHtml(find.zoneLabel || 'Unbekannte Zone');
      if ((statsAllSitesCheckbox?.checked ?? false) && find.siteId) {
          const findSite = sites.find(s => s.id === find.siteId); // Use fetched sites
          if (findSite) {
              zoneLabel += ` (${escapeHtml(findSite.name)})`;
          }
      }
      acc[zoneLabel] = (acc[zoneLabel] || 0) + 1;
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
  async function renderStatistics() { // Make async
    const activeSite = await db.getActiveSite();
    if (!activeSite && !(statsAllSitesCheckbox?.checked ?? false)) {
        statisticsOverview.innerHTML = `<p style="text-align: center; grid-column: 1 / -1;">Keine aktive Ausgrabungsstätte ausgewählt. Bitte gehen Sie zur <a href="../sites/index.html">Stättenverwaltung</a>.</p>`;
        return;
    }

    const finds = (statsAllSitesCheckbox?.checked ?? false) ? await db.getFinds('all') : await db.getFinds('active');
    statisticsOverview.innerHTML = ''; // Clear previous cards

    if (finds.length === 0) {
      statisticsOverview.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Noch keine Funde erfasst. <a href="./eingeben.html">Jetzt den ersten Fund erfassen!</a></p>';
      return;
    }

    const enabledCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.category);

    // Collect all card promises
    const cardPromises = enabledCategories.map(async category => {
        switch (category) {
            case 'total': return renderTotalFindsCard(finds);
            case 'material': return renderMaterialCard(finds);
            case 'dating': return renderDatingCard(finds);
            case 'photos': return renderPhotoCard(finds);
            case 'zones': return await renderZoneCard(finds); // Await renderZoneCard
            default: return '';
        }
    });

    // Wait for all cards to be rendered
    const renderedCards = await Promise.all(cardPromises);

    renderedCards.forEach(cardHtml => {
        statisticsOverview.innerHTML += cardHtml;
    });


    if (enabledCategories.length === 0) {
      statisticsOverview.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Wählen Sie Kategorien oben aus, um Statistiken anzuzeigen.</p>';
    }
  }

  // --- Event Listeners ---
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', renderStatistics);
  });
  if (statsAllSitesCheckbox) {
      statsAllSitesCheckbox.addEventListener('change', renderStatistics);
  }

  // Initial render on page load
  await renderStatistics(); // Await initial render
});