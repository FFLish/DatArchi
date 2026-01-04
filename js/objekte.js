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
      const imageHtml = find.photoDataUrl
        ? `<img src="${find.photoDataUrl}" alt="${title}" class="find-card-image">`
        : `<div class="find-card-image-placeholder">Kein Bild vorhanden</div>`;

      return `
        <div class="find-card">
          ${imageHtml}
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
