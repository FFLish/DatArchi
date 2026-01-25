import { firebaseService } from '/js/firebase-service.js';
import { auth } from '/js/firebase-config.js';
import { formatDate, getCategoryIcon, getMaterialColor } from '/js/page-enhancements.js';

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project') || urlParams.get('id') || localStorage.getItem('selectedProject');

let currentProject = null;
let findsUnsubscriber = null;
let fundorteMap = null;
let mapMarkers = {};

/**
 * Initialisiere Leaflet Map mit Ausgrabungsstätte-Bild (horizontal, vollständig)
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
    
    // Füge Ausgrabungsstätte-Bild als Layer hinzu
    const imageUrl = '../../partials/images/ausgrabungsstätte.jpg';
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

document.addEventListener('DOMContentLoaded', () => {
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
});

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
    document.getElementById('descriptionText').textContent = currentProject.description || '-';

    // Recent activity
    const activityHtml = finds.slice(-5).reverse().map(find => `
        <div style="padding: 12px; border-left: 3px solid #5b21b6; background: #f9f9f9; margin-bottom: 10px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${find.name || find.title || 'Unbenannt'}</strong>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 0.85rem;">
                        ${find.category || 'Kategorie unbekannt'} • ${find.material || 'Material unbekannt'}
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

    const findCardsHtml = finds.map(find => `
        <div class="find-card" onclick="editFind('${find.id}')">
            <div class="find-image">
                ${find.image ? `<img src="${find.image}" alt="${find.name || find.title}">` : 
                  `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #5b21b6, #7c3aed); color: white; font-size: 2rem;">
                    <i class="fas fa-cube"></i>
                  </div>`}
            </div>
            <div class="find-info">
                <h4>${find.name || find.title || 'Unbenannt'}</h4>
                <p><strong>Kategorie:</strong> ${find.category || 'Unbekannt'}</p>
                <p><strong>Material:</strong> ${find.material || '-'}</p>
                <p><strong>Entdeckung:</strong> ${find.dateFound || find.dating || '-'}</p>
                <p><strong>Entdecker:</strong> ${find.discoverer || '-'}</p>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px;">
                    <button class="btn btn-sm" onclick="editFind('${find.id}'); event.stopPropagation();">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFind('${find.id}'); event.stopPropagation();">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('findsList').innerHTML = findCardsHtml;
}

/**
 * Aktualisiere die Fundorte-Anzeige mit allen Funden als Marker auf der Karte
 */
async function updateFundorteList(finds = null) {
    // Hole Funde wenn nicht übergeben
    if (!finds) {
        finds = (await firebaseService.getProjectFinds(projectId)) || [];
    }
    
    const fundorteListElement = document.getElementById('fundorteList');
    
    if (finds.length === 0) {
        fundorteListElement.innerHTML = `
            <div class="loading">
                <i class="fas fa-inbox"></i>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Noch keine Funde an dieser Ausgrabungsstätte gefunden</p>
            </div>
        `;
        return;
    }

    // Initialisiere Karte wenn nötig
    if (!fundorteMap) {
        initializeMap();
    }
    
    // Entferne alte Marker
    Object.values(mapMarkers).forEach(marker => fundorteMap.removeLayer(marker));
    mapMarkers = {};
    
    // Erstelle Custom Marker Icons
    const markerIcons = {
        'Keramik': '🏺',
        'Münze': '🪙',
        'Schmuck': '💎',
        'Werkzeug': '🔨',
        'Waffe': '⚔️',
        'Knochen': '🦴',
        'Stein': '🪨',
        'Metall': '⚙️',
        'Sonstiges': '📦'
    };

    // Sammle alle Positionen um Kartenausschnitt zu berechnen
    const validCoordinates = finds.filter(f => f.latitude && f.longitude);
    let bounds = null;

    // Erstelle Marker auf der Karte mit Funden
    finds.forEach((find, index) => {
        // Koordinaten im Bereich 0-100 für das Ausgrabungsstätte-Bild
        let lat = find.latitude || (Math.random() * 80 + 10);
        let lng = find.longitude || (Math.random() * 80 + 10);
        
        const category = find.category || 'Sonstiges';
        const icon = markerIcons[category] || '📍';
        
        // Erstelle HTML für Popup
        const popupContent = `
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 10px 0; color: #5b21b6;">${index + 1}. ${find.name || find.title || 'Unbenannt'}</h4>
                <p style="margin: 5px 0;"><strong>Kategorie:</strong> ${category}</p>
                <p style="margin: 5px 0;"><strong>Material:</strong> ${find.material || '-'}</p>
                <p style="margin: 5px 0;"><strong>Periode:</strong> ${find.period || '-'}</p>
                <p style="margin: 5px 0;"><strong>Entdecker:</strong> ${find.discoverer || '-'}</p>
                <p style="margin: 5px 0;"><strong>Datum:</strong> ${find.dateFound || find.dating || '-'}</p>
                <p style="margin: 5px 0;"><strong>Position:</strong> ${find.location || 'Keine Angabe'}</p>
                ${find.description ? `<p style="margin: 5px 0; border-top: 1px solid #e5e7eb; padding-top: 8px;">${find.description}</p>` : ''}
            </div>
        `;
        
        // Erstelle Marker
        const marker = L.marker([lat, lng], {
            title: find.name || find.title || 'Fund ' + (index + 1)
        })
            .bindPopup(popupContent)
            .addTo(fundorteMap);
        
        // Speichere Marker für später
        mapMarkers[index] = marker;
        
        // Erweitere Bounds
        if (!bounds) {
            bounds = L.latLngBounds([lat, lng], [lat, lng]);
        } else {
            bounds.extend([lat, lng]);
        }
    });

    // Passe Kartenausschnitt an alle Marker an
    if (bounds && Object.keys(mapMarkers).length > 0) {
        fundorteMap.fitBounds(bounds, { padding: [50, 50] });
    }

    // Erstelle Liste mit Funden
    const fundorteHTML = finds.map((find, index) => {
        const category = find.category || 'Sonstiges';
        return `
            <div class="fundort-item" 
                 onclick="selectFundortOnMap(${index})" 
                 data-index="${index}">
                <h4><i class="fas fa-cube" style="color: #5b21b6; margin-right: 8px;"></i>${index + 1}. ${find.name || find.title || 'Unbenannt'}</h4>
                <p><strong>Kategorie:</strong> ${category}</p>
                <p><strong>Material:</strong> ${find.material || '-'}</p>
                <p><strong>Entdeckung:</strong> ${find.dateFound || find.dating || '-'}</p>
                <p><strong>Entdecker:</strong> ${find.discoverer || '-'}</p>
                <div>
                    <span class="badge"><i class="fas fa-map-marker-alt"></i> ${find.location || 'Keine Position'}</span>
                    <span class="badge" style="background: #fce7f3; color: #be185d;"><i class="fas fa-layer-group"></i> ${find.period || 'Unbekannt'}</span>
                </div>
            </div>
        `;
    }).join('');

    fundorteListElement.innerHTML = fundorteHTML;
}

/**
 * Wähle einen Fundort auf der Karte aus und zeige Details
 */
window.selectFundortOnMap = function(index) {
    // Entferne aktive Klasse von allen Items
    document.querySelectorAll('.fundort-item').forEach(item => item.classList.remove('active'));
    
    // Markiere Item als aktiv
    document.querySelector(`.fundort-item[data-index="${index}"]`)?.classList.add('active');
    
    // Öffne Marker Popup auf der Karte
    if (mapMarkers[index]) {
        mapMarkers[index].openPopup();
        fundorteMap.flyTo(mapMarkers[index].getLatLng(), 16, { duration: 0.5 });
    }
    
    // Scrolle zu Item in Liste
    document.querySelector(`.fundort-item[data-index="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
}

function openAddFindModal() {
    document.getElementById('addFindModal').style.display = 'block';
    document.getElementById('addFindForm').reset();
}

function openAddMemberModal() {
    document.getElementById('addMemberModal').style.display = 'block';
    document.getElementById('addMemberForm').reset();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function addFind(e) {
    e.preventDefault();
    
    if (!auth.currentUser || auth.currentUser.uid !== currentProject.owner) {
        alert('Du hast keine Berechtigung Funde hinzuzufügen');
        return;
    }

    try {
        const findData = {
            name: document.getElementById('findTitle')?.value || document.getElementById('findName')?.value,
            material: document.getElementById('findMaterial')?.value,
            category: document.getElementById('findCategory')?.value,
            dating: document.getElementById('findDating')?.value,
            description: document.getElementById('findDescription')?.value,
            location: document.getElementById('findLocation')?.value,
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

async function editFind(findId) {
    try {
        const finds = await firebaseService.getProjectFinds(projectId);
        const find = finds.find(f => f.id === findId);
        
        if (!find) {
            showNotification('Fund nicht gefunden', 'error');
            return;
        }

        // Fülle Modal mit Find-Daten
        document.getElementById('findTitle').value = find.name || find.title || '';
        document.getElementById('findMaterial').value = find.material || '';
        document.getElementById('findCategory').value = find.category || '';
        document.getElementById('findDating').value = find.dating || '';
        document.getElementById('findDescription').value = find.description || '';

        openAddFindModal();

        // Ändere Submit-Handler
        const form = document.getElementById('addFindForm');
        const oldOnSubmit = form.onsubmit;
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            try {
                const updates = {
                    name: document.getElementById('findTitle').value,
                    material: document.getElementById('findMaterial').value,
                    category: document.getElementById('findCategory').value,
                    dating: document.getElementById('findDating').value,
                    description: document.getElementById('findDescription').value
                };

                await firebaseService.updateFind(findId, updates);
                form.onsubmit = oldOnSubmit;
                closeModal('addFindModal');
                form.reset();
                showNotification('✅ Fund aktualisiert!', 'success');
                // Listener wird automatisch aktualisieren
            } catch (error) {
                showNotification('❌ Fehler beim Aktualisieren: ' + error.message, 'error');
            }
        };
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
    showNotification('👷 Mitglieder-Management kommt bald!', 'info');
}

async function editProject() {
    // Fülle Formular mit aktuellen Daten
    document.getElementById('editProjectTitle').value = currentProject.title || currentProject.name || '';
    document.getElementById('editProjectDescription').value = currentProject.description || '';
    document.getElementById('editProjectLocation').value = currentProject.location || '';
    document.getElementById('editProjectPeriod').value = currentProject.period || currentProject.startDate || '';
    
    // Öffne Modal
    document.getElementById('editProjectModal').style.display = 'block';
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
                <a href="/pages/projects/index.html" class="btn btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i> Zurück
                </a>
            </div>
        `;
    }
}

/**
 * Füge Test-Funde mit Koordinaten zum Projekt hinzu
 */
async function addTestFinds() {
    if (!auth.currentUser || auth.currentUser.uid !== currentProject.owner) {
        showNotification('Du hast keine Berechtigung Test-Funde hinzuzufügen', 'error');
        return;
    }

    const testFinds = [
        {
            name: 'Keramikscherbe (Terra Sigillata)',
            category: 'Keramik',
            material: 'Keramik',
            period: '1.-2. Jh. n.Chr.',
            dating: 'Römisch',
            location: 'Grabungsbereich A, Schnitt 5',
            discoverer: 'Dr. Schmidt',
            dateFound: '2024-01-15',
            description: 'Fragment einer römischen Terra Sigillata Schale mit roten Glasurflecken',
            latitude: 30,
            longitude: 40
        },
        {
            name: 'Bronzefibel (Aucissa)',
            category: 'Schmuck',
            material: 'Bronze',
            period: '1. Jh. v.Chr.',
            dating: 'Latène',
            location: 'Grabungsbereich B, Schnitt 3',
            discoverer: 'Prof. Müller',
            dateFound: '2024-01-18',
            description: 'Gut erhaltene Bronzefibel mit Dorn und Spirale',
            latitude: 60,
            longitude: 70
        },
        {
            name: 'Feuersteinabschlag',
            category: 'Werkzeug',
            material: 'Feuerstein',
            period: 'Neolithikum',
            dating: '4000-3000 v.Chr.',
            location: 'Grabungsbereich C, Schnitt 1',
            discoverer: 'Dr. Weber',
            dateFound: '2024-01-20',
            description: 'Unretouchierter Feuersteinabschlag, möglicherweise Messerkante',
            latitude: 25,
            longitude: 60
        },
        {
            name: 'Münze (Denar)',
            category: 'Münze',
            material: 'Silber',
            period: '1.-2. Jh. n.Chr.',
            dating: 'Römisch',
            location: 'Grabungsbereich A, Schnitt 7',
            discoverer: 'Prof. Müller',
            dateFound: '2024-01-22',
            description: 'Silberdenar mit Kaiserkopf, Prägung von Trajan',
            latitude: 45,
            longitude: 50
        },
        {
            name: 'Knochenwerkzeug',
            category: 'Werkzeug',
            material: 'Knochen',
            period: 'Neolithikum',
            dating: '5000-4000 v.Chr.',
            location: 'Grabungsbereich D, Schnitt 2',
            discoverer: 'Dr. Schmidt',
            dateFound: '2024-01-25',
            description: 'Bearbeiteter Tierknochen, wahrscheinlich Spitzhacke oder Angelhaken',
            latitude: 70,
            longitude: 30
        },
        {
            name: 'Eisennagel (Clava)',
            category: 'Werkzeug',
            material: 'Eisen',
            period: '1.-2. Jh. n.Chr.',
            dating: 'Römisch',
            location: 'Grabungsbereich B, Schnitt 6',
            discoverer: 'Dr. Weber',
            dateFound: '2024-01-27',
            description: 'Stark korrodierter Eisennagel, möglicherweise von Dachkonstruktion',
            latitude: 55,
            longitude: 45
        },
        {
            name: 'Glasperlenkette (Fragment)',
            category: 'Schmuck',
            material: 'Glas',
            period: '2.-3. Jh. n.Chr.',
            dating: 'Römisch',
            location: 'Grabungsbereich A, Schnitt 4',
            discoverer: 'Prof. Müller',
            dateFound: '2024-02-01',
            description: 'Drei kleine Glasperlen in Blau und Weiß, Teil einer Halskette',
            latitude: 50,
            longitude: 75
        },
        {
            name: 'Webgewicht (Loom Weight)',
            category: 'Werkzeug',
            material: 'Ton',
            period: 'Eisenzeit',
            dating: '800-400 v.Chr.',
            location: 'Grabungsbereich C, Schnitt 5',
            discoverer: 'Dr. Schmidt',
            dateFound: '2024-02-03',
            description: 'Keramisches Webgewicht mit Loch, wahrscheinlich für Webstuhl',
            latitude: 35,
            longitude: 80
        }
    ];

    try {
        showNotification('Test-Funde werden hinzugefügt...', 'info');
        
        for (const find of testFinds) {
            await firebaseService.createFind(projectId, find);
        }
        
        showNotification(`✅ ${testFinds.length} Test-Funde hinzugefügt!`, 'success');
        console.log('✅ Test-Funde erstellt');
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen der Test-Funde:', error);
        showNotification('Fehler beim Hinzufügen der Test-Funde', 'error');
    }
}

// Global functions for onclick handlers
window.openAddFindModal = openAddFindModal;
window.openAddMemberModal = openAddMemberModal;
window.closeModal = closeModal;
window.editFind = editFind;
window.deleteFind = deleteFind;
window.editProject = editProject;
window.shareProject = shareProject;
window.deleteProject = deleteProject;
window.addTestFinds = addTestFinds;

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
window.addFind = addFind;
window.addMember = addMember;
window.saveSettings = saveSettings;
window.saveEditProject = saveEditProject;
window.editProject = editProject;
window.shareProject = shareProject;
window.deleteProject = deleteProject;
window.closeModal = closeModal;
