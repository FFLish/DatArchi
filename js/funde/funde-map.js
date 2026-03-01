/**
 * Fundeverwalten - Karte (Map) Tab
 * Displays all finds as interactive markers on the excavation site image
 */

/**
 * Update the fundorte map with all finds
 */
export async function updateFundorteMapTab() {
    const markersContainer = document.getElementById('fundorte-markers-funde');
    const fundorteListElement = document.getElementById('fundorteList-funde');

    if (!markersContainer || !fundorteListElement) {
        return;
    }

    // Get finds from the global allFinds variable (set by main.js)
    // If not available, get from firebase
    let finds = window.allFinds || [];

    if (!finds || finds.length === 0) {
        fundorteListElement.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="margin: 10px 0 0 0; font-size: 1.1rem;">Noch keine Funde an dieser Ausgrabungsstätte gefunden</p>
            </div>
        `;
        markersContainer.innerHTML = '';
        return;
    }

    // Create markers on the map
    const markers = finds.map((find, index) => {
        // Generate random positions on the map if no coordinates available
        const x = find.latitude ? (find.latitude % 100) : Math.random() * 80 + 10;
        const y = find.longitude ? (find.longitude % 100) : Math.random() * 80 + 10;

        return `
            <div class="fundort-marker" 
                 style="left: ${x}%; top: ${y}%;" 
                 onclick="selectFundortMap(${index}); event.stopPropagation();"
                 data-index="${index}"
                 title="${find.titel || 'Unbenannt'}">
                ${index + 1}
                <div class="fundort-marker-tooltip">${find.titel || 'Fund ' + (index + 1)}</div>
            </div>
        `;
    }).join('');

    markersContainer.innerHTML = markers;

    // Create list with finds
    const fundorteHTML = finds.map((find, index) => `
        <div class="fundort-item" 
             onclick="selectFundortMap(${index})" 
             data-index="${index}"
             style="padding: 16px; border-left: 4px solid #5b21b6; background: #f9f9f9; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">
                <i class="fas fa-cube" style="color: #5b21b6; margin-right: 8px;"></i>${index + 1}. ${find.titel || 'Unbenannt'}
            </h4>
            <p style="margin: 4px 0; color: #4b5563; font-size: 0.9rem;"><strong>Kategorie:</strong> ${find.kategorie || 'Unbekannt'}</p>
            <p style="margin: 4px 0; color: #4b5563; font-size: 0.9rem;"><strong>Material:</strong> ${find.material || '-'}</p>
            <p style="margin: 4px 0; color: #4b5563; font-size: 0.9rem;"><strong>Datierung:</strong> ${find.datierung || '-'}</p>
            <p style="margin: 4px 0; color: #4b5563; font-size: 0.9rem;"><strong>Entdecker:</strong> ${find.entdecker || '-'}</p>
                <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="badge" style="display: inline-block; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 0.8rem; color: #666;">
                    <i class="fas fa-map-marker-alt"></i> ${ (find.latitude != null && find.longitude != null) ? (Number(find.latitude).toFixed(4) + ', ' + Number(find.longitude).toFixed(4)) : (find.fundort || find.location || 'Keine Position') }
                </span>
                <span class="badge" style="display: inline-block; padding: 4px 8px; background: #fce7f3; border-radius: 4px; font-size: 0.8rem; color: #be185d;">
                    <i class="fas fa-layer-group"></i> ${find.datierung || 'Unbekannt'}
                </span>
            </div>
        </div>
    `).join('');

    fundorteListElement.innerHTML = fundorteHTML;
}

/**
 * Select a fundort (find) and highlight it on the map and in the list
 */
window.selectFundortMap = function(index) {
    // Remove active class from all markers and items
    document.querySelectorAll('#fundorte-markers-funde .fundort-marker').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('#fundorteList-funde .fundort-item').forEach(item => item.classList.remove('active'));

    // Add active class to selected marker and item
    document.querySelector(`#fundorte-markers-funde .fundort-marker[data-index="${index}"]`)?.classList.add('active');
    document.querySelector(`#fundorteList-funde .fundort-item[data-index="${index}"]`)?.classList.add('active');

    // Add highlight style to active item
    const item = document.querySelector(`#fundorteList-funde .fundort-item[data-index="${index}"]`);
    if (item) {
        item.style.background = '#ede9fe';
        item.style.borderLeftColor = '#7c3aed';
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Remove highlight from other items
    document.querySelectorAll('#fundorteList-funde .fundort-item').forEach(i => {
        if (!i.classList.contains('active')) {
            i.style.background = '#f9f9f9';
            i.style.borderLeftColor = '#5b21b6';
        }
    });
};

// Export for use in other modules
window.updateFundorteMapTab = updateFundorteMapTab;
