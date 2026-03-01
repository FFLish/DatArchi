import { firebaseService } from './firebase-service.js';
import { auth } from './firebase-config.js';
import { setupImageSystem } from './image-system-init.js';
import { formatDate, getCategoryIcon, getMaterialColor } from './page-enhancements.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

const DEFAULT_EXCAVATION_IMAGE = '/partials/images/ausgrabungsstätte/ausgrabungsstätte2.png';
const DEFAULT_FIND_IMAGE = '/partials/images/bilder/image.png';

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project') || urlParams.get('id') || localStorage.getItem('selectedProject');

let currentProject = null;
let findsUnsubscriber = null;
let fundorteMap = null;
let mapMarkers = {};

// Initialize image system on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        setupImageSystem();
    } catch (error) {
        console.warn('⚠️ Image system initialization warning:', error.message);
    }
    
    // Warte auf Auth State bevor Projekt geladen wird
    onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed. User:', user ? user.email : 'keine');
        setupAndLoadProject();
    });
});

function setupAndLoadProject() {
    loadProjectDetail();
    setupTabNavigation();
    setupEventListeners();
    
    // Initialisiere Karte wenn Tab sichtbar wird
    const locationsTab = document.getElementById('locations');
    if (locationsTab) {
        const observer = new MutationObserver(() => {
            if (locationsTab.classList.contains('active') && !fundorteMap) {
                setTimeout(() => initializeMap(), 100);
            }
        });
        observer.observe(locationsTab, { attributes: true, attributeFilter: ['class'] });
    }
}

/**
 * Initialisiere Leaflet Map mit zufälligem Ausgrabungsstätte-Bild (horizontal, vollständig)
 */
function initializeMap() {
    if (fundorteMap) {
        fundorteMap.remove();
    }
    
    const mapContainer = document.getElementById('fundorte-map');
    if (!mapContainer) return;
    
    // Entferne Rotation - Bild ist horizontal
    mapContainer.style.transform = 'none';
    mapContainer.style.transformOrigin = 'center';
    
    // Erstelle Karte mit Bild als Layer
    fundorteMap = L.map('fundorte-map', {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 4,
        zoom: 0
    });
    
    // Definiere Bildgrenzen - fülle gesamten Raum aus
    // Verwende asymmetrische Bounds um horizontales Format zu erzeugen
    const bounds = L.latLngBounds([[0, 0], [60, 100]]);
    
    // Verwende festes Ausgrabungsstätte-Bild
    const imageUrl = DEFAULT_EXCAVATION_IMAGE;
    L.imageOverlay(imageUrl, bounds).addTo(fundorteMap);
    
    // Setze Kartenausschnitt auf Bild mit Padding
    fundorteMap.fitBounds(bounds, { padding: [0, 0] });
    
    mapMarkers = {};
}

/**
 * Konvertiere Firebase Timestamp zu Date Objekt
 */
function convertTimestamp(timestamp) {
    if (!timestamp) return null;
    
    // Wenn es ein Firestore Timestamp ist (hat toDate Methode)
    if (timestamp.toDate) {
        return timestamp.toDate();
    }
    
    // Wenn es bereits ein Date ist
    if (timestamp instanceof Date) {
        return timestamp;
    }
    
    // Wenn es ein String oder Number ist
    return new Date(timestamp);
}

/**
 * Formatiere Datum im Format DD.MM.YYYY
 */
function formatDateSafe(timestamp) {
    const date = convertTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function normalizeImagePath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
        return raw;
    }

    const withAbsoluteRoot = raw.startsWith('partials/') ? `/${raw}` : raw;

    return withAbsoluteRoot
        .split('/')
        .map((segment, index) => {
            if (index === 0 && segment === '') return '';
            return encodeURIComponent(segment);
        })
        .join('/');
}

const DEFAULT_MEDIA_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const mediaUrlCache = new Map();
const mediaProbeCache = new Map();

function getProjectMediaBasePath() {
    return currentProject?.mediaBasePath || '../../partials/images/bilder/';
}

function getProjectMediaExtensions() {
    const configured = Array.isArray(currentProject?.mediaExtensions) && currentProject.mediaExtensions.length > 0
        ? currentProject.mediaExtensions
        : DEFAULT_MEDIA_EXTENSIONS;

    const unique = [];
    const seen = new Set();
    for (const ext of configured) {
        const normalized = String(ext || '').trim().toLowerCase();
        if (!normalized || seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        unique.push(normalized);
    }

    return unique.length > 0 ? unique : DEFAULT_MEDIA_EXTENSIONS;
}

function buildMediaFileUrl(fileName) {
    const safePath = String(fileName || '')
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    return `${getProjectMediaBasePath()}${safePath}`;
}

function escapeHtmlAttr(value) {
    return String(value || '').replace(/"/g, '&quot;');
}

async function probeImageUrl(url) {
    const normalizedUrl = String(url || '').trim();
    if (!normalizedUrl) {
        return false;
    }

    if (mediaProbeCache.has(normalizedUrl)) {
        return mediaProbeCache.get(normalizedUrl);
    }

    const probePromise = (async () => {
        try {
            const headResponse = await fetch(normalizedUrl, {
                method: 'HEAD',
                cache: 'no-store'
            });
            if (headResponse.ok) {
                return true;
            }
        } catch (_) {
        }

        try {
            const getResponse = await fetch(normalizedUrl, {
                method: 'GET',
                cache: 'no-store'
            });
            return getResponse.ok;
        } catch (_) {
            return false;
        }
    })();

    mediaProbeCache.set(normalizedUrl, probePromise);
    return probePromise;
}

async function resolveMediaUrlById(mediaId) {
    const id = String(mediaId || '').trim();
    if (!id) return null;

    if (mediaUrlCache.has(id)) {
        return mediaUrlCache.get(id);
    }

    const basePath = getProjectMediaBasePath();
    const extensions = getProjectMediaExtensions();

    for (const ext of extensions) {
        const candidate = `${basePath}${id}.${ext}`;
        const ok = await probeImageUrl(candidate);
        if (ok) {
            mediaUrlCache.set(id, candidate);
            return candidate;
        }
    }

    mediaUrlCache.set(id, null);
    return null;
}

async function renderProjectMediaGallery() {
    const galleryEl = document.getElementById('mediaGalleryContainer');
    const sectionEl = document.getElementById('mediaGallerySection');
    if (!galleryEl || !sectionEl) return;

    const photoIds = Array.isArray(currentProject?.photos) ? currentProject.photos : [];
    const mediaFiles = Array.isArray(currentProject?.mediaFiles) ? currentProject.mediaFiles : [];
    const sketches = Array.isArray(currentProject?.sketches) ? currentProject.sketches : [];

    if (photoIds.length === 0 && mediaFiles.length === 0 && sketches.length === 0) {
        sectionEl.style.display = 'none';
        return;
    }

    sectionEl.style.display = 'block';
    galleryEl.innerHTML = '<div class="no-data"><i class="fas fa-spinner fa-spin"></i><p>Medien werden geladen...</p></div>';

    const photoCards = [];
    const bilderBasePath = '/partials/images/bilder/';
    const fallbackBilderFiles = [
        'image.png',
        'image copy.png',
        'image copy 2.png',
        'image copy 3.png',
        'image copy 4.png',
        'image copy 5.png',
        'image copy 6.png',
        'image copy 7.png',
        'image copy 8.png',
        'image copy 9.png'
    ];

    const buildBilderUrl = (fileName) => `${bilderBasePath}${String(fileName || '')
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/')}`;

    if (mediaFiles.length > 0) {
        for (const fileName of mediaFiles) {
            const fileUrl = buildBilderUrl(fileName);
            photoCards.push(`
                <div class="media-card">
                    <img src="${fileUrl}" alt="Bild ${escapeHtmlAttr(fileName)}" loading="lazy">
                    <div class="media-card-meta">
                        <div class="media-pill"><i class="fas fa-image"></i> Bild</div>
                        <div>${escapeHtml(fileName)}</div>
                    </div>
                </div>
            `);
        }
    }

    if (mediaFiles.length === 0 && photoIds.length > 0) {
        const sourceFiles = fallbackBilderFiles.length > 0 ? fallbackBilderFiles : ['image.png'];
        for (const photoId of photoIds) {
            const sourceFile = sourceFiles[photoCards.length % sourceFiles.length];
            const resolvedUrl = buildBilderUrl(sourceFile);
            photoCards.push(`
                <div class="media-card">
                    <img src="${resolvedUrl}" alt="Foto ${escapeHtmlAttr(photoId)}" loading="lazy">
                    <div class="media-card-meta">
                        <div class="media-pill"><i class="fas fa-camera"></i> Foto</div>
                        <div><strong>ID:</strong> ${escapeHtml(photoId)}</div>
                    </div>
                </div>
            `);
        }
    }

    const sketchCards = sketches.map((sketchText, index) => `
        <div class="media-card">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect width='100%25' height='100%25' fill='%23eef2ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%234338ca'%3ESketch ${index + 1}%3C/text%3E%3C/svg%3E" alt="Sketch ${index + 1}" loading="lazy">
            <div class="media-card-meta">
                <div class="media-pill"><i class="fas fa-pencil-ruler"></i> Skizze</div>
                <div>${escapeHtml(sketchText)}</div>
            </div>
        </div>
    `);

    galleryEl.innerHTML = `${photoCards.join('')}${sketchCards.join('')}`;
}

async function loadProjectDetail() {
    if (!projectId) {
        window.location.href = '/pages/projects/index.html';
        return;
    }

    try {
        // Hole das Projekt aus Firebase
        currentProject = await firebaseService.getProject(projectId);
        
        if (!currentProject) {
            showError('Projekt nicht gefunden');
            return;
        }

        // Überprüfe Zugriff
        const isPublic = currentProject.visibility === 'public' || currentProject.isPublic;
        const isOwner = currentProject.userId === auth.currentUser?.uid || currentProject.owner === auth.currentUser?.uid;
        
        if (!isPublic && !isOwner) {
            showError('Du hast keine Berechtigung dieses Projekt zu sehen');
            return;
        }

        updateProjectHeader();
        updateOverviewTab();
        
        // Abonniere Echtzeit-Updates für Funde
        subscribeToFinds();
        
        updateMembersList();
        updateReportsList();
        updateSettingsForm();
    } catch (error) {
        console.error('❌ Fehler beim Laden des Projekts:', error);
        showError('Fehler beim Laden des Projekts');
    }
}

/**
 * Abonniere Echtzeit-Updates für Funde
 */
function subscribeToFinds() {
    if (findsUnsubscriber) {
        findsUnsubscriber();
    }

    findsUnsubscriber = firebaseService.subscribeToProjectFinds(
        projectId,
        (finds) => {
            updateFindsList(finds);
            updateFundorteList(finds);
            console.log('🔄 Funde aktualisiert:', finds.length);
        }
    );
}

async function updateProjectHeader() {
    document.getElementById('projectTitle').textContent = currentProject.title || currentProject.name || 'Namenlos';
    document.getElementById('projectDescription').textContent = currentProject.description || 'Keine Beschreibung';
    document.getElementById('projectLocation').textContent = currentProject.location || 'Unbekannt';
    document.getElementById('projectPeriod').textContent = currentProject.period || currentProject.startDate || 'Zeitraum nicht angegeben';
    
    const finds = (await firebaseService.getProjectFinds(projectId)) || [];
    document.getElementById('projectFinds').textContent = `${finds.length} Fund${finds.length !== 1 ? 'e' : ''}`;
    document.getElementById('projectMembers').textContent = `${currentProject.team?.length || currentProject.memberCount || 1} Mitglied${(currentProject.team?.length || currentProject.memberCount || 1) !== 1 ? 'er' : ''}`;
}

async function updateOverviewTab() {
    const finds = (await firebaseService.getProjectFinds(projectId)) || [];

    document.getElementById('statsFinds').textContent = finds.length;
    document.getElementById('statsZones').textContent = new Set(finds.map(f => f.location || 'Unbekannt')).size;
    
    const createdDate = convertTimestamp(currentProject.createdAt);
    const daysActive = createdDate && !isNaN(createdDate.getTime()) ? 
        Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24)) : 0;
    document.getElementById('statsDays').textContent = daysActive;
    document.getElementById('statsTeam').textContent = currentProject.team?.length || currentProject.memberCount || 1;

    document.getElementById('createdDate').textContent = formatDateSafe(currentProject.createdAt);
    document.getElementById('updatedDate').textContent = formatDateSafe(currentProject.updatedAt) || 'Noch nicht geändert';
    const descriptionEl = document.getElementById('descriptionText');
    descriptionEl.textContent = currentProject.description_long || currentProject.description || '-';
    descriptionEl.style.whiteSpace = 'pre-line';

    // Recent activity
    const activityHtml = finds.slice(-5).reverse().map(find => `
        <div style="padding: 12px; border-left: 3px solid #5b21b6; background: #f9f9f9; margin-bottom: 10px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${find.titel || find.name || find.title || 'Unbenannt'}</strong>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 0.85rem;">
                        ${find.kategorie || find.category || 'Kategorie unbekannt'} • ${find.material || 'Material unbekannt'}
                    </p>
                </div>
                <span style="font-size: 0.8rem; color: #999;">vor kurzem</span>
            </div>
        </div>
    `).join('');

    document.getElementById('recentActivity').innerHTML = activityHtml || `
        <div class="no-data">
            <i class="fas fa-inbox"></i>
            <p>Keine Aktivitäten vorhanden</p>
        </div>
    `;

    await renderProjectMediaGallery();
}

async function updateFindsList(finds = null) {
    // Hole Funde wenn nicht übergeben
    if (!finds) {
        finds = (await firebaseService.getProjectFinds(projectId)) || [];
    }
    
    if (finds.length === 0) {
        document.getElementById('findsList').innerHTML = `
            <div class="no-data" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <p>Noch keine Funde vorhanden</p>
                <button class="btn btn-primary" style="margin-top: 15px;" onclick="openAddFindModal()">
                    <i class="fas fa-plus"></i> Ersten Fund hinzufügen
                </button>
            </div>
        `;
        return;
    }

    const findCardsHtml = finds.map(find => {
        const category = find.kategorie || find.category || 'Unbekannt';
        const material = find.material || '-';
        const discovered = find.entdecker || find.discoverer || '-';
        const imageCandidates = Array.isArray(find.images) && find.images.length > 0
            ? find.images
            : [find.image || find.photoUrl || DEFAULT_FIND_IMAGE];
        const findImages = imageCandidates
            .map(normalizeImagePath)
            .filter(Boolean);
        const findImageUrl = findImages[0] || DEFAULT_FIND_IMAGE;
        const galleryHtml = findImages.map((img, idx) => `
            <img src="${img}" alt="${find.titel || find.name || find.title || 'Fund'} Bild ${idx + 1}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; flex-shrink: 0;">
        `).join('');
        
        return `
            <div class="find-card" onclick="editFind('${find.id}')">
                <div class="find-image">
                    ${findImageUrl && !findImageUrl.includes('undefined') ? `<img src="${findImageUrl}" alt="${find.titel || find.name || find.title}">` : 
                      `<i class="fas fa-cube"></i>`}
                </div>
                <div class="find-info">
                    <h4 title="${find.titel || find.name || find.title || 'Unbenannt'}">${find.titel || find.name || find.title || 'Unbenannt'}</h4>
                    <p><i class="fas fa-tag"></i> ${category}</p>
                    <p><i class="fas fa-palette"></i> ${material}</p>
                    <p><i class="fas fa-user"></i> ${discovered}</p>
                    <div style="display: flex; gap: 6px; overflow-x: auto; margin: 10px 0 2px 0; padding-bottom: 2px;">
                        ${galleryHtml}
                    </div>
                    <div class="find-badges" style="margin-top: auto;">
                        ${find.datierung || find.dating ? `<span class="find-badge"><i class="fas fa-calendar"></i> ${find.datierung || find.dating}</span>` : ''}
                        ${find.zustand || find.condition ? `<span class="find-badge"><i class="fas fa-star"></i> ${find.zustand || find.condition}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn btn-sm" style="flex: 1; font-size: 0.8rem;" onclick="editFind('${find.id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button class="btn btn-sm btn-danger" style="flex: 1; font-size: 0.8rem;" onclick="deleteFind('${find.id}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('findsList').innerHTML = findCardsHtml;
}

/**
 * Aktualisiere die Fundorte-Anzeige mit allen Funden als Marker auf der Bild
 */
async function updateFundorteList(finds = null) {
    // Hole Funde wenn nicht übergeben
    if (!finds) {
        finds = (await firebaseService.getProjectFinds(projectId)) || [];
    }
    
    const fundorteListElement = document.getElementById('fundorteList');
    const fundorteMarkersElement = document.getElementById('fundorteMarkers');
    
    if (finds.length === 0) {
        fundorteListElement.innerHTML = `
            <div class="loading">
                <i class="fas fa-inbox"></i>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Noch keine Funde an dieser Ausgrabungsstätte gefunden</p>
            </div>
        `;
        fundorteMarkersElement.innerHTML = '';
        return;
    }

    // Erstelle Marker auf dem Bild
    let markersHTML = '';
    finds.forEach((find, index) => {
        // Koordinaten in Prozent (0-100) für positionierung auf dem Bild
        const x = find.latitude ? (find.latitude % 100) : (Math.random() * 80 + 10);
        const y = find.longitude ? (find.longitude % 100) : (Math.random() * 80 + 10);
        
        const markerNumber = index + 1;
        const findName = find.titel || find.name || find.title || 'Fund ' + markerNumber;
        
        markersHTML += `
            <div class="fundort-marker" 
                 data-index="${index}"
                 style="left: ${x}%; top: ${y}%;"
                 onclick="selectFundortMarker(${index}); event.stopPropagation();"
                 title="${findName}">
                <span>${markerNumber}</span>
                <div class="fundort-marker-tooltip">${findName}</div>
            </div>
        `;
    });
    fundorteMarkersElement.innerHTML = markersHTML;

    // Erstelle Liste mit Funden
    const fundorteHTML = finds.map((find, index) => {
        const category = find.kategorie || find.category || 'Sonstiges';
        const markerNumber = index + 1;
        return `
            <div class="fundort-item" 
                 onclick="selectFundortMarker(${index})" 
                 data-index="${index}">
                <h4><span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; color: white; font-size: 0.75rem; font-weight: bold; margin-right: 8px;">${markerNumber}</span>${find.titel || find.name || find.title || 'Unbenannt'}</h4>
                <p><i class="fas fa-tag" style="color: #5b21b6; margin-right: 6px;"></i>${category}</p>
                <p><i class="fas fa-palette" style="color: #5b21b6; margin-right: 6px;"></i>${find.material || '-'}</p>
                <p><i class="fas fa-calendar" style="color: #5b21b6; margin-right: 6px;"></i>${find.datierung || find.dateFound || find.dating || '-'}</p>
                <p><i class="fas fa-user" style="color: #5b21b6; margin-right: 6px;"></i>${find.discoverer || '-'}</p>
                    <div style="margin-top: 8px;">
                    <span class="badge"><i class="fas fa-map-marker-alt"></i> ${ (find.latitude != null && find.longitude != null) ? (Number(find.latitude).toFixed(4) + ', ' + Number(find.longitude).toFixed(4)) : (find.location || 'Keine Position') }</span>
                    ${find.period ? `<span class="badge" style="background: #fce7f3; color: #be185d;"><i class="fas fa-layer-group"></i> ${find.period}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    fundorteListElement.innerHTML = fundorteHTML;
}

/**
 * Wähle einen Marker auf dem Bild aus
 */
window.selectFundortMarker = function(index) {
    // Entferne aktive Klasse von allen Items und Markern
    document.querySelectorAll('.fundort-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.fundort-marker').forEach(marker => marker.classList.remove('active'));
    
    // Markiere Item und Marker als aktiv
    const item = document.querySelector(`.fundort-item[data-index="${index}"]`);
    const marker = document.querySelector(`.fundort-marker[data-index="${index}"]`);
    
    if (item) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (marker) {
        marker.classList.add('active');
    }
}

function updateMembersList() {
    // Zeige Team-Mitglieder aus dem Team-Array an
    const members = (currentProject.team || []).map((name, index) => ({
        id: `team-${index}`,
        name: name,
        email: currentProject.principalInvestigator === name ? 'PI@excavation.de' : '',
        avatar: null,
        role: currentProject.principalInvestigator === name ? 'admin' : 'editor'
    }));

    const membersHtml = members.map(member => {
        const avatarHtml = member.avatar ? 
            `<img src="${member.avatar}" alt="${member.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
            `<div class="member-avatar" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #5b21b6, #7c3aed); color: white; border-radius: 50%; font-weight: bold; font-size: 0.9rem;">${member.name.charAt(0).toUpperCase()}</div>`;
        
        return `
        <div class="member-item" style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;">
            ${avatarHtml}
            <div class="member-info" style="flex: 1; margin-left: 12px;">
                <h4 style="margin: 0; font-weight: 600;">${member.name}</h4>
                ${member.email ? `<p style="margin: 2px 0 0 0; color: #999; font-size: 0.9rem;">${member.email}</p>` : ''}
            </div>
            <span style="background: #5b21b6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                ${member.role === 'admin' ? 'Leitung' : member.role === 'editor' ? 'Team' : 'Betrachter'}
            </span>
        </div>
    `}).join('');

    document.getElementById('membersList').innerHTML = membersHtml || `
        <div class="no-data">
            <i class="fas fa-users"></i>
            <p>Keine Mitglieder hinzugefügt</p>
        </div>
    `;
}

function normalizeReports() {
    if (!currentProject) {
        return [];
    }

    if (Array.isArray(currentProject.reports)) {
        return currentProject.reports;
    }

    if (currentProject.reports && typeof currentProject.reports === 'object') {
        currentProject.reports = Object.values(currentProject.reports);
        return currentProject.reports;
    }

    if (Array.isArray(currentProject.dailyReports)) {
        currentProject.reports = currentProject.dailyReports;
        return currentProject.reports;
    }

    if (Array.isArray(currentProject.reportEntries)) {
        currentProject.reports = currentProject.reportEntries;
        return currentProject.reports;
    }

    currentProject.reports = [];
    return currentProject.reports;
}

function normalizeReportText(value) {
    return String(value || '')
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function truncateReportText(value, maxLength = 280) {
    const normalized = normalizeReportText(value);
    if (!normalized) {
        return '';
    }
    if (normalized.length <= maxLength) {
        return normalized;
    }
    return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildImprovedReportSummary(report) {
    const rawSummary = normalizeReportText(report?.summary);
    const rawContent = normalizeReportText(report?.content);

    if (rawSummary) {
        return truncateReportText(rawSummary, 280);
    }

    if (!rawContent) {
        return 'Kurzfassung nicht verfügbar.';
    }

    const firstParagraph = rawContent.split('\n\n')[0] || rawContent;
    const sentences = firstParagraph
        .split(/(?<=[.!?])\s+/)
        .map(sentence => sentence.trim())
        .filter(Boolean);

    if (sentences.length > 0) {
        return truncateReportText(sentences.slice(0, 2).join(' '), 280);
    }

    return truncateReportText(firstParagraph, 280);
}

function buildImprovedReportContent(report) {
    const rawContent = normalizeReportText(report?.content);
    if (!rawContent) {
        return '';
    }

    const lines = rawContent
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.replace(/^[-•]\s*/, '• '));

    if (lines.length === 0) {
        return truncateReportText(rawContent, 1500);
    }

    const maxLines = 14;
    const limitedLines = lines.slice(0, maxLines);
    const isTruncated = lines.length > maxLines;

    return `${limitedLines.join('\n')}${isTruncated ? '\n\n…' : ''}`;
}

function buildAutoReportsFromProject(minCount = 4) {
    if (!currentProject) {
        return [];
    }

    const compactText = (value, maxLength = 260) => {
        const normalized = String(value || '')
            .replace(/\s+/g, ' ')
            .replace(/\s*[-•]\s*/g, ' ')
            .trim();

        if (!normalized) {
            return '';
        }

        if (normalized.length <= maxLength) {
            return normalized;
        }

        return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
    };

    const buildSummaryFromFields = () => {
        const summaryParts = [];

        if (currentProject.location) {
            summaryParts.push(`Ort: ${currentProject.location}`);
        }

        if (currentProject.period) {
            summaryParts.push(`Periode: ${currentProject.period}`);
        }

        const units = Array.isArray(currentProject.excavatedUnits)
            ? currentProject.excavatedUnits.filter(Boolean)
            : [];
        if (units.length > 0) {
            summaryParts.push(`Units: ${units.join(', ')}`);
        }

        const teamMembers = Array.isArray(currentProject.team)
            ? currentProject.team.filter(Boolean)
            : [];
        if (teamMembers.length > 0) {
            summaryParts.push(`Team: ${teamMembers.length} Personen`);
        }

        const baseSummary = compactText(currentProject.description, 220);
        if (baseSummary) {
            summaryParts.push(baseSummary);
        }

        const merged = summaryParts.join(' · ');
        return compactText(merged, 300);
    };

    const buildAutoContent = () => {
        const contentParts = [];
        const shortDescription = compactText(currentProject.description, 380);
        const longDescription = compactText(currentProject.description_long, 700);

        if (shortDescription) {
            contentParts.push(shortDescription);
        }

        if (longDescription && longDescription !== shortDescription) {
            contentParts.push(longDescription);
        }

        if (contentParts.length === 0) {
            return '';
        }

        return contentParts.join('\n\n');
    };

    const units = Array.isArray(currentProject.excavatedUnits)
        ? currentProject.excavatedUnits.filter(Boolean)
        : [];
    const rooms = Array.isArray(currentProject.areaRooms)
        ? currentProject.areaRooms.filter(Boolean)
        : [];
    const team = Array.isArray(currentProject.team)
        ? currentProject.team.filter(Boolean)
        : [];
    const staff = Array.isArray(currentProject.staff)
        ? currentProject.staff.filter(Boolean)
        : [];
    const workers = Array.isArray(currentProject.workers)
        ? currentProject.workers.filter(Boolean)
        : [];
    const stratigraphy = Array.isArray(currentProject.stratigraphy)
        ? currentProject.stratigraphy.filter(Boolean)
        : [];
    const photos = Array.isArray(currentProject.photos)
        ? currentProject.photos.filter(Boolean)
        : [];
    const mediaFiles = Array.isArray(currentProject.mediaFiles)
        ? currentProject.mediaFiles.filter(Boolean)
        : [];
    const sketches = Array.isArray(currentProject.sketches)
        ? currentProject.sketches.filter(Boolean)
        : [];

    const reportDate = currentProject.workDate || currentProject.startDate || null;
    const author = currentProject.writtenBy || currentProject.lead || currentProject.creatorName || 'Projektteam';
    const summary = buildSummaryFromFields();
    const content = buildAutoContent();

    if (!summary && !content && units.length === 0 && team.length === 0 && photos.length === 0 && mediaFiles.length === 0) {
        return [];
    }

    const baseTitle = currentProject.title || currentProject.name || 'Projekt';
    const projectKey = currentProject.id || projectId || 'project';
    const reportTemplates = [
        {
            key: 'overview',
            title: `${baseTitle} — Überblick`,
            type: 'Zusammenfassung',
            summary,
            content: content || 'Grunddaten und Zielsetzung des Projekts wurden zusammengefasst.'
        },
        {
            key: 'context',
            title: `${baseTitle} — Kontext & Stratigraphie`,
            type: 'Kontextbericht',
            summary: truncateReportText(`Units: ${units.join(', ') || 'nicht angegeben'} · Räume: ${rooms.join(', ') || 'nicht angegeben'} · Periode: ${currentProject.period || 'nicht angegeben'}`, 280),
            content: [
                units.length > 0 ? `• Bearbeitete Units: ${units.join(', ')}` : '',
                rooms.length > 0 ? `• Räume/Bereiche: ${rooms.join(', ')}` : '',
                stratigraphy.length > 0 ? `• Stratigraphie:\n${stratigraphy.map(entry => `• ${entry}`).join('\n')}` : '• Keine spezifische Stratigraphie dokumentiert.'
            ].filter(Boolean).join('\n\n')
        },
        {
            key: 'team',
            title: `${baseTitle} — Team & Organisation`,
            type: 'Teambericht',
            summary: truncateReportText(`Leitung: ${currentProject.writtenBy || currentProject.lead || currentProject.principalInvestigator || 'nicht angegeben'} · Teamgröße: ${team.length || staff.length || workers.length || 0}`, 280),
            content: [
                currentProject.writtenBy || currentProject.lead || currentProject.principalInvestigator
                    ? `• Projektleitung: ${currentProject.writtenBy || currentProject.lead || currentProject.principalInvestigator}`
                    : '',
                team.length > 0 ? `• Team: ${team.join(', ')}` : '',
                staff.length > 0 ? `• Staff: ${staff.join(', ')}` : '',
                workers.length > 0 ? `• Workers: ${workers.join(', ')}` : ''
            ].filter(Boolean).join('\n\n') || '• Teamdaten nicht im Detail hinterlegt.'
        },
        {
            key: 'media',
            title: `${baseTitle} — Medien & Dokumentation`,
            type: 'Dokumentation',
            summary: truncateReportText(`Fotos: ${photos.length} · Medien-Dateien: ${mediaFiles.length} · Skizzen: ${sketches.length}`, 280),
            content: [
                photos.length > 0 ? `• Foto-IDs (Auszug): ${photos.slice(0, 12).join(', ')}${photos.length > 12 ? ' …' : ''}` : '• Keine Foto-IDs hinterlegt.',
                mediaFiles.length > 0 ? `• Medien-Dateien: ${mediaFiles.slice(0, 12).join(', ')}${mediaFiles.length > 12 ? ' …' : ''}` : '• Keine Medien-Dateien hinterlegt.',
                sketches.length > 0 ? `• Skizzen: ${sketches.slice(0, 8).join(' | ')}${sketches.length > 8 ? ' …' : ''}` : '• Keine Skizzen hinterlegt.'
            ].join('\n\n')
        }
    ];

    const reports = reportTemplates
        .slice(0, Math.max(4, minCount))
        .map((template, index) => ({
            id: `auto-report-${projectKey}-${template.key}-${index + 1}`,
            title: template.title,
            type: template.type,
            date: reportDate,
            author,
            summary: template.summary,
            content: template.content,
            isAutoGenerated: true
        }));

    return reports;
}

function updateReportsList() {
    const reportsListEl = document.getElementById('reportsList');
    const addReportBtn = document.getElementById('addReportBtn');
    if (!reportsListEl) return;

    const isOwner = auth.currentUser?.uid === currentProject?.owner || auth.currentUser?.uid === currentProject?.userId;
    if (addReportBtn) {
        addReportBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }

    let reports = normalizeReports();
    if (reports.length < 4) {
        const existingIds = new Set(reports.map(report => String(report?.id || '').trim()).filter(Boolean));
        const existingTitles = new Set(reports.map(report => String(report?.title || '').trim().toLowerCase()).filter(Boolean));
        const autoReports = buildAutoReportsFromProject(4).filter((autoReport) => {
            const autoId = String(autoReport?.id || '').trim();
            const autoTitle = String(autoReport?.title || '').trim().toLowerCase();
            if (autoId && existingIds.has(autoId)) {
                return false;
            }
            if (autoTitle && existingTitles.has(autoTitle)) {
                return false;
            }
            return true;
        });

        if (autoReports.length > 0) {
            const needed = Math.max(0, 4 - reports.length);
            reports = [...reports, ...autoReports.slice(0, needed)];
            currentProject.reports = reports;
        }
    }

    if (reports.length === 0) {
        reportsListEl.innerHTML = `
            <div class="no-data">
                <i class="fas fa-file-alt"></i>
                <p>Noch keine Berichte vorhanden</p>
            </div>
        `;
        return;
    }

    const sortedReports = [...reports].sort((a, b) => {
        const da = new Date(a.date || a.createdAt || 0).getTime();
        const db = new Date(b.date || b.createdAt || 0).getTime();
        return db - da;
    });

    reportsListEl.innerHTML = sortedReports.map((report) => {
        const reportDate = report.date ? new Date(report.date).toLocaleDateString('de-DE') : '-';
        const canDelete = isOwner;
        const reportSummary = buildImprovedReportSummary(report);
        const reportContent = buildImprovedReportContent(report);
        return `
            <div style="border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin-bottom:12px; background:#fff;">
                <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; flex-wrap:wrap;">
                    <div>
                        <h3 style="margin:0 0 6px 0; font-size:1rem;">${escapeHtml(report.title || 'Ohne Titel')}</h3>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:0.82rem; color:#6b7280;">
                            <span><i class="fas fa-tag"></i> ${escapeHtml(report.type || 'Bericht')}</span>
                            <span><i class="fas fa-calendar"></i> ${reportDate}</span>
                            <span><i class="fas fa-user"></i> ${escapeHtml(report.author || 'Unbekannt')}</span>
                        </div>
                    </div>
                    ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="deleteReport('${escapeHtml(report.id)}')"><i class="fas fa-trash"></i> Löschen</button>` : ''}
                </div>
                ${reportSummary ? `<p style="margin:10px 0 8px 0; color:#374151; font-weight:500;">${escapeHtml(reportSummary)}</p>` : ''}
                <div style="white-space:pre-line; color:#4b5563; line-height:1.55;">${escapeHtml(reportContent)}</div>
            </div>
        `;
    }).join('');
}

async function updateSettingsForm() {
    document.getElementById('settingName').value = currentProject.title || currentProject.name || '';
    document.getElementById('settingPeriod').value = currentProject.period || currentProject.startDate || '';
    document.getElementById('settingLocation').value = currentProject.location || '';
    document.getElementById('settingVisibility').value = currentProject.visibility || (currentProject.isPublic ? 'public' : 'private');
    document.getElementById('settingDescription').value = currentProject.description || '';
}

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all tabs and buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function setupEventListeners() {
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Edit project form
    document.getElementById('editProjectForm').addEventListener('submit', saveEditProject);
    
    // Add find form
    document.getElementById('addFindForm').addEventListener('submit', addFind);
    
    // Add member form
    document.getElementById('addMemberForm').addEventListener('submit', addMember);

    // Add report form
    const addReportForm = document.getElementById('addReportForm');
    if (addReportForm) {
        addReportForm.addEventListener('submit', addReport);
    }
    
    // Modal close on background click
    const modals = ['addFindModal', 'addMemberModal', 'addReportModal', 'editProjectModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modalId);
                }
            });
        }
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && modal.classList.contains('show')) {
                    closeModal(modalId);
                }
            });
        }
    });
}

function openAddFindModal() {
    const modal = document.getElementById('addFindModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.getElementById('addFindForm').reset();
}

function openAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.getElementById('addMemberForm').reset();
}

function openAddReportModal() {
    const isOwner = auth.currentUser?.uid === currentProject?.owner || auth.currentUser?.uid === currentProject?.userId;
    if (!isOwner) {
        showNotification('Du hast keine Berechtigung Berichte hinzuzufügen', 'error');
        return;
    }

    const modal = document.getElementById('addReportModal');
    if (!modal) return;
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.getElementById('addReportForm')?.reset();
    const dateEl = document.getElementById('reportDate');
    if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
}

async function addFind(e) {
    e.preventDefault();
    
    if (!auth.currentUser || auth.currentUser.uid !== currentProject.owner) {
        alert('Du hast keine Berechtigung Funde hinzuzufügen');
        return;
    }

    try {
        const findData = {
            titel: document.getElementById('findTitle')?.value || document.getElementById('findName')?.value,
            material: document.getElementById('findMaterial')?.value,
            kategorie: document.getElementById('findCategory')?.value,
            datierung: document.getElementById('findDating')?.value,
            beschreibung: document.getElementById('findDescription')?.value,
            fundort: document.getElementById('findLocation')?.value,
            latitude: parseFloat(document.getElementById('findLatitude')?.value) || null,
            longitude: parseFloat(document.getElementById('findLongitude')?.value) || null
        };

        const newFind = await firebaseService.createFind(projectId, findData);
        closeModal('addFindModal');
        document.getElementById('addFindForm').reset();
        
        showNotification('✅ Fund erfolgreich hinzugefügt!', 'success');
        console.log('✅ Fund erstellt:', newFind.id);
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen des Funds:', error);
        showNotification('Fehler beim Hinzufügen des Funds', 'error');
    }
}

async function addReport(e) {
    e.preventDefault();

    const isOwner = auth.currentUser?.uid === currentProject?.owner || auth.currentUser?.uid === currentProject?.userId;
    if (!isOwner) {
        showNotification('Du hast keine Berechtigung Berichte hinzuzufügen', 'error');
        return;
    }

    try {
        const reports = normalizeReports();
        const reportData = {
            id: `report-${Date.now()}`,
            title: document.getElementById('reportTitle')?.value?.trim() || 'Ohne Titel',
            type: document.getElementById('reportType')?.value || 'Bericht',
            date: document.getElementById('reportDate')?.value || new Date().toISOString().slice(0, 10),
            summary: document.getElementById('reportSummary')?.value?.trim() || '',
            content: document.getElementById('reportContent')?.value?.trim() || '',
            author: auth.currentUser?.displayName || auth.currentUser?.email || 'Unbekannt',
            createdAt: new Date().toISOString()
        };

        reports.unshift(reportData);
        await firebaseService.updateProject(projectId, { reports });
        currentProject.reports = reports;

        updateReportsList();
        closeModal('addReportModal');
        document.getElementById('addReportForm')?.reset();
        showNotification('✅ Bericht hinzugefügt', 'success');
    } catch (error) {
        console.error('❌ Fehler beim Speichern des Berichts:', error);
        showNotification('Fehler beim Speichern des Berichts', 'error');
    }
}

async function deleteReport(reportId) {
    const isOwner = auth.currentUser?.uid === currentProject?.owner || auth.currentUser?.uid === currentProject?.userId;
    if (!isOwner) {
        showNotification('Keine Berechtigung zum Löschen', 'error');
        return;
    }

    if (!confirm('Diesen Bericht wirklich löschen?')) return;

    try {
        const reports = normalizeReports().filter(r => r.id !== reportId);
        await firebaseService.updateProject(projectId, { reports });
        currentProject.reports = reports;
        updateReportsList();
        showNotification('✅ Bericht gelöscht', 'success');
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Berichts:', error);
        showNotification('Fehler beim Löschen des Berichts', 'error');
    }
}

async function editFind(findId) {
    try {
        const finds = await firebaseService.getProjectFinds(projectId);
        const find = finds.find(f => f.id === findId);
        
        if (!find) {
            showNotification('Fund nicht gefunden', 'error');
            return;
        }

        // Create and show edit modal
        const modal = document.createElement('div');
        modal.id = 'editFindModalProject';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 24px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <h2 style="margin-top: 0; margin-bottom: 20px;">Fund bearbeiten</h2>
                <form id="editFindFormProject" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label for="editFindTitle" style="display: block; margin-bottom: 6px; font-weight: 500;">Titel</label>
                        <input type="text" id="editFindTitle" value="${escapeHtml(find.titel || find.name || find.title || '')}" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                        <label for="editFindDescription" style="display: block; margin-bottom: 6px; font-weight: 500;">Beschreibung</label>
                        <textarea id="editFindDescription" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box; resize: vertical; min-height: 100px;">${escapeHtml(find.beschreibung || find.description || '')}</textarea>
                    </div>
                    <div>
                        <label for="editFindNotes" style="display: block; margin-bottom: 6px; font-weight: 500;">Berichte / Anmerkungen</label>
                        <textarea id="editFindNotes" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box; resize: vertical; min-height: 80px;">${escapeHtml(find.berichte || '')}</textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label for="editFindMaterial" style="display: block; margin-bottom: 6px; font-weight: 500;">Material</label>
                            <input type="text" id="editFindMaterial" value="${escapeHtml(find.material || '')}" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="editFindCategory" style="display: block; margin-bottom: 6px; font-weight: 500;">Kategorie</label>
                            <select id="editFindCategory" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;">
                                <option value="">Bitte wählen...</option>
                                <option value="organisch" ${find.kategorie === 'organisch' ? 'selected' : ''}>Organisch</option>
                                <option value="werkzeuge" ${find.kategorie === 'werkzeuge' ? 'selected' : ''}>Werkzeuge</option>
                                <option value="gefaesse" ${find.kategorie === 'gefaesse' ? 'selected' : ''}>Gefäße</option>
                                <option value="ruinen" ${find.kategorie === 'ruinen' ? 'selected' : ''}>Ruinen / Architektur</option>
                                <option value="sonstiges" ${find.kategorie === 'sonstiges' ? 'selected' : ''}>Sonstiges</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label for="editFindDating" style="display: block; margin-bottom: 6px; font-weight: 500;">Datierung</label>
                            <input type="text" id="editFindDating" value="${escapeHtml(find.datierung || find.dating || '')}" placeholder="z.B. 2. Jh. v. Chr." style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="editFindDate" style="display: block; margin-bottom: 6px; font-weight: 500;">Funddatum</label>
                            <input type="date" id="editFindDate" value="${find.funddatum || ''}" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                    </div>
                    <div>
                        <label for="editFindLocation" style="display: block; margin-bottom: 6px; font-weight: 500;">Fundort</label>
                        <input type="text" id="editFindLocation" value="${escapeHtml(find.fundort || find.location || '')}" style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <button type="button" onclick="document.getElementById('editFindModalProject').remove();" style="flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px; background: white; cursor: pointer; font-weight: 500;">Abbrechen</button>
                        <button type="submit" style="flex: 1; padding: 10px; border: none; border-radius: 4px; background: #5b21b6; color: white; cursor: pointer; font-weight: 500;">Speichern</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('editFindFormProject').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const updates = {
                    titel: document.getElementById('editFindTitle').value,
                    beschreibung: document.getElementById('editFindDescription').value,
                    berichte: document.getElementById('editFindNotes').value,
                    material: document.getElementById('editFindMaterial').value,
                    kategorie: document.getElementById('editFindCategory').value,
                    datierung: document.getElementById('editFindDating').value,
                    funddatum: document.getElementById('editFindDate').value,
                    fundort: document.getElementById('editFindLocation').value
                };

                await firebaseService.updateFind(findId, updates);
                modal.remove();
                
                showNotification('✅ Fund erfolgreich aktualisiert!', 'success');
                // Listener wird automatisch aktualisieren
            } catch (error) {
                console.error('Fehler beim Aktualisieren des Funds:', error);
                showNotification('Fehler beim Aktualisieren des Funds: ' + error.message, 'error');
            }
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

    } catch (error) {
        console.error('❌ Fehler beim Bearbeiten des Funds:', error);
        showNotification('Fehler beim Bearbeiten des Funds', 'error');
    }
}

async function deleteFind(findId) {
    if (!confirm('Wirklich löschen?')) return;

    try {
        await firebaseService.deleteFind(findId, projectId);
        showNotification('✅ Fund gelöscht!', 'success');
        // Listener wird automatisch aktualisieren
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Funds:', error);
        showNotification('❌ Fehler beim Löschen', 'error');
    }
}

function addMember(e) {
    e.preventDefault();
    
    if (!auth.currentUser || auth.currentUser.uid !== currentProject.owner) {
        showNotification('Du hast keine Berechtigung Mitglieder hinzuzufügen', 'error');
        return;
    }
    
    const memberEmail = document.getElementById('memberEmail')?.value;
    const memberRole = document.getElementById('memberRole')?.value || 'viewer';
    
    if (!memberEmail) {
        showNotification('Bitte gib eine E-Mail-Adresse ein', 'error');
        return;
    }
    
    try {
        // Einfache Implementierung - füge Mitglied zum Team hinzu
        if (!currentProject.team) {
            currentProject.team = [];
        }
        
        // Prüfe ob Mitglied bereits existiert
        const exists = currentProject.team.some(m => m.email === memberEmail);
        if (exists) {
            showNotification('Dieses Mitglied ist bereits im Team', 'info');
            return;
        }
        
        currentProject.team.push({
            email: memberEmail,
            role: memberRole,
            addedAt: new Date().toISOString()
        });
        
        // Aktualisiere Projekt in Firebase
        firebaseService.updateProject(projectId, {
            team: currentProject.team
        });
        
        closeModal('addMemberModal');
        document.getElementById('addMemberForm').reset();
        updateMembersList();
        showNotification(`✅ Mitglied ${memberEmail} wurde hinzugefügt!`, 'success');
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen des Mitglieds:', error);
        showNotification('Fehler beim Hinzufügen des Mitglieds', 'error');
    }
}

async function editProject() {
    // Fülle Formular mit aktuellen Daten
    document.getElementById('editProjectTitle').value = currentProject.title || currentProject.name || '';
    document.getElementById('editProjectDescription').value = currentProject.description || '';
    document.getElementById('editProjectLocation').value = currentProject.location || '';
    document.getElementById('editProjectPeriod').value = currentProject.period || currentProject.startDate || '';
    
    // Öffne Modal
    const modal = document.getElementById('editProjectModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function shareProject() {
    const url = `${window.location.origin}/pages/public-projects/index.html?project=${projectId}`;
    if (navigator.share) {
        navigator.share({
            title: currentProject.name,
            text: `Schaue dir mein archäologisches Projekt an!`,
            url: url
        });
    } else {
        alert('Link zum Teilen:\n' + url);
    }
}

async function deleteProject() {
    if (!confirm('Wirklich dieses Projekt löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        return;
    }

    try {
        await firebaseService.deleteProject(projectId);
        showNotification('✅ Projekt gelöscht!', 'success');
        setTimeout(() => {
            window.location.href = '/pages/projects/index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Projekts:', error);
        showNotification('❌ Fehler beim Löschen: ' + error.message, 'error');
    }
}

async function saveSettings(e) {
    e.preventDefault();
    
    if (auth.currentUser?.uid !== currentProject.owner) {
        showNotification('Du hast keine Berechtigung diese Einstellungen zu speichern', 'error');
        return;
    }

    try {
        const updates = {
            name: document.getElementById('settingName').value,
            startDate: document.getElementById('settingPeriod').value,
            location: document.getElementById('settingLocation').value,
            visibility: document.getElementById('settingVisibility').value,
            description: document.getElementById('settingDescription').value
        };

        await firebaseService.updateProject(projectId, updates);
        
        // Aktualisiere lokales Objekt
        Object.assign(currentProject, updates);
        
        updateProjectHeader();
        showNotification('✅ Einstellungen gespeichert!', 'success');
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        showNotification('❌ Fehler beim Speichern: ' + error.message, 'error');
    }
}

/**
 * Speichere Projektänderungen aus dem Edit-Modal
 */
async function saveEditProject(e) {
    e.preventDefault();
    
    try {
        const updatedProject = {
            title: document.getElementById('editProjectTitle').value,
            name: document.getElementById('editProjectTitle').value,
            description: document.getElementById('editProjectDescription').value,
            location: document.getElementById('editProjectLocation').value,
            period: document.getElementById('editProjectPeriod').value
        };
        
        await firebaseService.updateProject(projectId, updatedProject);
        showNotification('✅ Projekt erfolgreich aktualisiert!', 'success');
        
        // Aktualisiere lokale Daten
        currentProject = { ...currentProject, ...updatedProject };
        updateProjectHeader();
        updateSettingsForm();
        
        // Schließe Modal
        closeModal('editProjectModal');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Projektänderungen:', error);
        showNotification('❌ Fehler beim Speichern: ' + error.message, 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') notification.style.backgroundColor = '#10b981';
    else if (type === 'error') notification.style.backgroundColor = '#ef4444';
    else notification.style.backgroundColor = '#3b82f6';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const container = document.querySelector('.project-detail-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 20px;"></i>
                <h2>${message}</h2>
                <a href="../projects/index.html" class="btn btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i> Zurück
                </a>
            </div>
        `;
    }
}

// Global functions for onclick handlers
window.openAddFindModal = openAddFindModal;
window.openAddMemberModal = openAddMemberModal;
window.openAddReportModal = openAddReportModal;
window.closeModal = closeModal;
window.editFind = editFind;
window.deleteFind = deleteFind;
window.deleteReport = deleteReport;
window.editProject = editProject;
window.shareProject = shareProject;
window.deleteProject = deleteProject;

// Cleanup beim Verlassen
window.addEventListener('beforeunload', () => {
    if (findsUnsubscriber) {
        findsUnsubscriber();
    }
    firebaseService.unsubscribeAll();
});

// Exportiere Funktionen global für Inline-Event-Handler
window.convertTimestamp = convertTimestamp;
window.formatDateSafe = formatDateSafe;
window.editFind = editFind;
window.deleteFind = deleteFind;
window.openAddFindModal = openAddFindModal;
window.openAddMemberModal = openAddMemberModal;
window.openAddReportModal = openAddReportModal;
window.addFind = addFind;
window.addMember = addMember;
window.addReport = addReport;
window.deleteReport = deleteReport;
window.saveSettings = saveSettings;
window.saveEditProject = saveEditProject;
window.editProject = editProject;
window.shareProject = shareProject;
window.deleteProject = deleteProject;
window.closeModal = closeModal;
