document.addEventListener('DOMContentLoaded', () => {
  const FINDS_STORAGE_KEY = 'datarchi.funde.v1';
  const container = document.getElementById('finds-list');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function renderFinds() {
    if (!container) return;

    const finds = JSON.parse(localStorage.getItem(FINDS_STORAGE_KEY)) || [];

    if (finds.length === 0) {
      container.innerHTML = `<p>Noch keine Funde erfasst. <a href="./eingeben.html">Jetzt den ersten Fund erfassen!</a></p>`;
      return;
    }

    container.innerHTML = finds.reverse().map(find => {
      const title = escapeHtml(find.titel || 'Unbenannter Fund');
      const description = escapeHtml(find.beschreibung || 'Keine Beschreibung vorhanden.');
      const material = escapeHtml(find.material || 'N/A');
      const datierung = escapeHtml(find.datierung || 'N/A');
      const imageSrc = find.photoDataUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAzMDAgMjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTZweCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkKein Bild vorhandenPC90ZXh0Pjwvc3ZnPg=='; // Placeholder SVG

      return `
        <div class="find-card">
          <img src="${imageSrc}" alt="${title}" class="find-card-image">
          <div class="find-card-content">
            <h3 class="find-card-title">${title}</h3>
            <p class="find-card-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
            <div class="find-card-details">
              <span><strong>Material:</strong> ${material}</span>
              <span><strong>Datierung:</strong> ${datierung}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderFinds();
});
