/**
 * Fundeverwalten - Karte (Map) Tab
 * Displays all finds as interactive markers on the excavation site image
 */

function toFiniteNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function clampPercentage(value) {
    return Math.min(98, Math.max(2, value));
}

function buildMarkerPositions(finds) {
    const parsedCoordinates = finds.map((find) => {
        const latitude = toFiniteNumber(find.latitude ?? find.lat);
        const longitude = toFiniteNumber(find.longitude ?? find.lng ?? find.lon);
        return { latitude, longitude };
    });

    const validCoordinates = parsedCoordinates.filter((coord) => coord.latitude !== null && coord.longitude !== null);

    // Debug: Log coordinate info
    console.log(`🗺️ Fundekarte: ${finds.length} Funde geladen, ${validCoordinates.length} mit gültigen Koordinaten`);
    finds.slice(0, 3).forEach((f, i) => {
        console.log(`  Find ${i+1}: lat=${f.latitude}, lon=${f.longitude}`);
    });

    if (validCoordinates.length === 0) {
        return finds.map((_, index) => {
            const columns = Math.max(1, Math.ceil(Math.sqrt(finds.length)));
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = clampPercentage(12 + col * (76 / Math.max(1, columns - 1)));
            const y = clampPercentage(12 + row * 14);
            return { x, y, hasCoordinates: false };
        });
    }

    const latitudes = validCoordinates.map((coord) => coord.latitude);
    const longitudes = validCoordinates.map((coord) => coord.longitude);

    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);

    const latitudeRange = maxLatitude - minLatitude;
    const longitudeRange = maxLongitude - minLongitude;

    const padding = 8;
    const usableArea = 100 - padding * 2;

    return parsedCoordinates.map((coord, index) => {
        if (coord.latitude === null || coord.longitude === null) {
            const columns = Math.max(1, Math.ceil(Math.sqrt(finds.length)));
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = clampPercentage(12 + col * (76 / Math.max(1, columns - 1)));
            const y = clampPercentage(12 + row * 14);
            return { x, y, hasCoordinates: false };
        }

        const x = longitudeRange === 0
            ? 50
            : padding + ((coord.longitude - minLongitude) / longitudeRange) * usableArea;

        const y = latitudeRange === 0
            ? 50
            : padding + ((maxLatitude - coord.latitude) / latitudeRange) * usableArea;

        return {
            x: clampPercentage(x),
            y: clampPercentage(y),
            hasCoordinates: true
        };
    });
}

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
    let finds = window.allFinds || [];

    // Fallback Demo Finds with coordinates for Koumasa 2023 project
    const DEMO_FINDS_WITH_COORDS = [
        {id: 'find-001', titel: '2023-16-115-C06: Conical Cup (Intact)', latitude: 35.24200, longitude: 25.03100, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-002', titel: '2023-16-115-C02: Possible Bowl (Fragmented)', latitude: 35.24500, longitude: 25.04200, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-003', titel: '2023-16-115-C03: Conical Cup (Fragmented)', latitude: 35.24800, longitude: 25.05300, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-004', titel: '2023-16-115-C04: Inverted Conical Cup', latitude: 35.25100, longitude: 25.06400, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-005', titel: '2023-16-115-C05: Conical Cup with Pottery Sherds', latitude: 35.25400, longitude: 25.03500, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-006', titel: '2023-16-115-Pottery: Ceramic Sherds (Fine Ware)', latitude: 35.25700, longitude: 25.05900, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-007', titel: '2023-16-115-Bones: Animal Bone Assemblage', latitude: 35.26000, longitude: 25.04100, kategorie: 'Zoologie', material: 'Knochen'},
        {id: 'find-008', titel: '2023-16-115-SA03: Plaster with Red Paint', latitude: 35.24300, longitude: 25.06700, kategorie: 'Architectural', material: 'Kalk-Putz'},
        {id: 'find-009', titel: '2023-16-116-Pottery: Ceramic Sherds (Coarse Ware)', latitude: 35.25900, longitude: 25.03300, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-010', titel: '2023-16-116-Bones & SA03: Animal Bones with Associated Charcoal', latitude: 35.24100, longitude: 25.04900, kategorie: 'Zoologie', material: 'Knochen'},
        {id: 'find-011', titel: '2023-16-116 Architecture: Ashlar Block Feature', latitude: 35.26400, longitude: 25.05500, kategorie: 'Architectural', material: 'Stein'},
        {id: 'find-012', titel: '2023-16-117-Pottery: Ceramic Sherds with Paint Traces', latitude: 35.25600, longitude: 25.06100, kategorie: 'Keramik', material: 'Keramik'},
        {id: 'find-013', titel: '2023-16-117-SA2: Plaster Fragments with Paint Traces', latitude: 35.24600, longitude: 25.03800, kategorie: 'Architectural', material: 'Kalk-Putz'}
    ];

    // Check if finds have valid coordinates
    const findsWithCoords = finds.filter(f => f.latitude != null && f.longitude != null);
    
    // If no finds or very few finds with coordinates, use demo data
    if (!finds || finds.length === 0 || findsWithCoords.length < 5) {
        console.log(`ℹ️ Using fallback demo finds (loaded: ${finds.length}, with coords: ${findsWithCoords.length})`);
        finds = DEMO_FINDS_WITH_COORDS;
    }

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

    const markerPositions = buildMarkerPositions(finds);

    // Create markers on the map
    const markers = finds.map((find, index) => {
        const position = markerPositions[index];
        const markerTitle = find.titel || find.name || `Fund ${index + 1}`;
        const coordinateHint = position?.hasCoordinates
            ? `${Number(find.latitude ?? find.lat).toFixed(5)}, ${Number(find.longitude ?? find.lng ?? find.lon).toFixed(5)}`
            : 'Keine Koordinaten';

        return `
            <div class="fundort-marker" 
                 style="left: ${position.x}%; top: ${position.y}%;" 
                 onclick="selectFundortMap(${index}); event.stopPropagation();"
                 data-index="${index}"
                 title="${markerTitle} (${coordinateHint})">
                ${index + 1}
                <div class="fundort-marker-tooltip">${markerTitle}</div>
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
