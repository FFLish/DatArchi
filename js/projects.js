// js/projects.js
// Verwaltet die persönliche Projektseite mit Firebase

import { auth } from './firebase-config.js';
import { firebaseService } from './firebase-service.js';
import { getRandomExcavationSiteImage } from './image-utilities.js';
import { setupImageSystem } from './image-system-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const DEMO_DATASET_KEY = 'koumasa-2023-trench-16';
const DEMO_PROJECT_NAME = 'Koumasa 2023 - Trench 16 Excavation';
const DEMO_CARD_IMAGES = [
    '../../partials/images/bilder/image.png',
    '../../partials/images/bilder/image%20copy.png',
    '../../partials/images/bilder/image%20copy%202.png',
    '../../partials/images/bilder/image%20copy%203.png',
    '../../partials/images/bilder/image%20copy%204.png',
    '../../partials/images/bilder/image%20copy%205.png',
    '../../partials/images/bilder/image%20copy%206.png',
    '../../partials/images/bilder/image%20copy%207.png',
    '../../partials/images/bilder/image%20copy%208.png',
    '../../partials/images/bilder/image%20copy%209.png',
    '../../partials/images/bilder/image%20copy%2010.png',
    '../../partials/images/bilder/image%20copy%2011.png',
    '../../partials/images/bilder/image%20copy%2012.png'
];

// Global variable declarations
let currentUserId = null;
let projectUnsubscriber = null;
let projectsData = [];
let currentProjects = [];


document.addEventListener('DOMContentLoaded', () => {
    // Initialize image system
    try {
        setupImageSystem();
    } catch (error) {
        console.warn('⚠️ Image system initialization warning:', error.message);
    }
    
    initializeProjectsPage();
    setupEventListeners();
    setupAuthStateListener();
});

function setupAuthStateListener() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            localStorage.setItem('currentUserId', currentUserId);
            console.log('✅ Benutzer angemeldet:', user.email);
            subscribeToProjectUpdates();
        } else {
            console.log('⚠️ Benutzer abgemeldet - bitte melden Sie sich an');
            currentUserId = null;
            
            // Beende alte Listener
            if (projectUnsubscriber) {
                projectUnsubscriber();
            }
            
            loadProjects();
        }
    });
}

function initializeProjectsPage() {
    if (auth.currentUser) {
        currentUserId = auth.currentUser.uid;
        console.log('✅ Benutzer beim Laden angemeldet:', currentUserId);
    } else {
        currentUserId = localStorage.getItem('currentUserId');
        if (!currentUserId) {
            console.log('ℹ️ User not authenticated - profile data unavailable');
        }
    }

    localStorage.setItem('currentUserId', currentUserId);
    loadProjects();
}

/**
 * Abonniere Echtzeit-Updates für Projekte
 */
function subscribeToProjectUpdates() {
    if (!auth.currentUser) return;

    // Beende alten Listener wenn vorhanden
    if (projectUnsubscriber) {
        projectUnsubscriber();
    }

    // Starte neuen Listener
    projectUnsubscriber = firebaseService.subscribeToUserProjects(
        auth.currentUser.uid,
        (projects) => {
            currentProjects = projects;
            displayProjects(projects);
            console.log('🔄 Projekte in Echtzeit aktualisiert');
        }
    );
}

function setupEventListeners() {
    const modal = document.getElementById('projectModal');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const closeBtn = document.querySelector('.close');
    const projectForm = document.getElementById('projectForm');
    const searchInput = document.getElementById('searchProjects');
    const filterStatus = document.getElementById('filterStatus');

    createProjectBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    projectForm.addEventListener('submit', handleCreateProject);
    searchInput.addEventListener('input', filterAndDisplayProjects);
    filterStatus.addEventListener('change', filterAndDisplayProjects);
}

async function loadProjects() {
    try {
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Projekte werden geladen...</div>';

        // Lade Projekte des aktuellen Benutzers von Firebase
        let projects = [];
        
        if (auth.currentUser) {
            // Benutzer ist angemeldet - lade von Firebase
            projects = await firebaseService.getUserProjects(currentUserId);
            console.log('✅ Projekte von Firebase geladen:', projects.length);
        } else {
            // No projects available without authentication
            console.log('ℹ️ Projects require authentication');
        }
        
        if (!currentProjects || currentProjects.length === 0) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h2>Keine Projekte gefunden</h2>
                    <p>Starten Sie ein neues archäologisches Projekt, um hier Ihre Ausgrabungen zu verwalten.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('projectModal').style.display = 'block'">
                        Erstes Projekt erstellen
                    </button>
                </div>
            `;
            return;
        }

        displayProjects(currentProjects);
    } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        document.getElementById('projectsList').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Fehler beim Laden der Projekte</p>
            </div>
        `;
    }
}

async function displayProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Keine Projekte gefunden</p>
            </div>
        `;
        return;
    }

    // Filter out projects with missing critical data
    const validProjects = projects.filter(p => p.id && p.name && p.name.trim());

    const isDemoUser = auth.currentUser?.email?.toLowerCase() === 'demo@datarchi.com';
    const visibleProjects = isDemoUser
        ? validProjects.filter(p => p.datasetKey === DEMO_DATASET_KEY || p.name === DEMO_PROJECT_NAME || p.title === DEMO_PROJECT_NAME).slice(0, 1)
        : validProjects;
    
    if (visibleProjects.length === 0) {
        if (isDemoUser) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hourglass-half"></i>
                    <p>Demo-Projekt wird vorbereitet …</p>
                </div>
            `;
            return;
        }
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Keine gültigen Projekte gefunden</p>
            </div>
        `;
        return;
    }

    const projectsHTML = await Promise.all(visibleProjects.map(async (project, index) => {
        const finds = await firebaseService.getProjectFinds(project.id).catch(() => []) || [];
        const findCategories = [...new Set(finds.map(f => f.category))];
        const materials = [...new Set(finds.map(f => f.material))];
        const cardImage = isDemoUser && project.datasetKey === DEMO_DATASET_KEY
            ? DEMO_CARD_IMAGES[index % DEMO_CARD_IMAGES.length]
            : getRandomExcavationSiteImage();
        
        return `
        <div class="project-card">
            <div class="project-card-image">
                <img src="${cardImage}" alt="Ausgrabungsstätte" class="project-card-img">
            </div>
            <div class="project-card-header">
                <div class="project-card-title">
                    <h3>${project.name}</h3>
                    <span class="project-status ${project.status || 'active'}">${getStatusLabel(project.status || 'active')}</span>
                </div>
                <div class="project-card-menu">
                    <button class="btn-icon" onclick="showProjectMenu(event, '${project.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            <p class="project-description">${project.description || 'Keine Beschreibung vorhanden'}</p>
            
            <div class="project-meta">
                <span class="meta-item">
                    <i class="fas fa-map-marker-alt"></i> ${project.location || 'Ort nicht angegeben'}
                </span>
                <span class="meta-item">
                    <i class="fas fa-history"></i> ${project.period || 'Zeitraum nicht angegeben'}
                </span>
            </div>

            <div class="project-stats">
                <div class="stat">
                    <i class="fas fa-cube"></i>
                    <span>${project.findCount || finds.length || 0} Funde</span>
                </div>
                <div class="stat">
                    <i class="fas fa-users"></i>
                    <span>${project.memberCount || 1} Mitglieder</span>
                </div>
                <div class="stat">
                    <i class="fas fa-lock${project.visibility === 'public' ? '-open' : ''}"></i>
                    <span>${project.visibility === 'public' ? 'Öffentlich' : 'Privat'}</span>
                </div>
            </div>

            

            <div class="project-card-footer">
                <button class="btn btn-sm btn-secondary" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
        </div>
    `
    }));

    projectsList.innerHTML = projectsHTML.join('');
}

function filterAndDisplayProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    let filtered = currentProjects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) || 
                            project.description.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    displayProjects(filtered);
}

async function handleCreateProject(e) {
    e.preventDefault();

    // Stelle sicher, dass wir den aktuellen Benutzer verwenden
    const userId = auth.currentUser?.uid || currentUserId;
    const userEmail = auth.currentUser?.email || null;
    const userName = auth.currentUser?.displayName || 'Mein Projekt';

    const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        location: document.getElementById('projectLocation').value,
        period: document.getElementById('projectPeriod').value,
        visibility: document.getElementById('projectVisibility').value,
        owner: userId,
        ownerName: userName,
        ownerEmail: userEmail,
        ownerAvatar: auth.currentUser?.photoURL || null,
        status: 'active'
    };

    try {
        const newProject = await firebaseService.createProject(projectData);
        
        document.getElementById('projectForm').reset();
        document.getElementById('projectModal').style.display = 'none';
        
        // Neuladen der Projekte
        currentUserId = userId;
        localStorage.setItem('currentUserId', currentUserId);
        loadProjects();
        
        showAlert('Projekt erfolgreich erstellt! 🎉', 'success');
        console.log('✅ Projekt erstellt:', newProject.id);
    } catch (error) {
        console.error('Fehler beim Erstellen des Projekts:', error);
        showAlert('Fehler beim Erstellen des Projekts', 'danger');
    }
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Aktiv',
        'archived': 'Archiviert',
        'planning': 'Planung'
    };
    return labels[status] || status;
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

// Exportiere globale Funktionen für HTML-Attribute
window.showProjectMenu = async (event, projectId) => {
    event.stopPropagation();

    // Entferne altes Menü
    const existing = document.getElementById('project-context-menu');
    if (existing) existing.remove();

    // Hole Projektdaten (für Prefill beim Edit)
    let project = null;
    try {
        project = await firebaseService.getProject(projectId);
    } catch (err) {
        console.warn('Konnte Projektdaten nicht laden für Kontextmenü:', err.message);
    }

    // Erstelle Menü
    const menu = document.createElement('div');
    menu.id = 'project-context-menu';
    menu.style.position = 'absolute';
    menu.style.zIndex = 9999;
    menu.style.background = 'white';
    menu.style.border = '1px solid #e5e7eb';
    menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    menu.style.borderRadius = '8px';
    menu.style.padding = '8px';
    menu.style.minWidth = '180px';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn';
    editBtn.style.display = 'block';
    editBtn.style.width = '100%';
    editBtn.style.textAlign = 'left';
    editBtn.innerHTML = '<i class="fas fa-edit" style="margin-right:8px;"></i> Bearbeiten';
    editBtn.onclick = (e) => {
        e.stopPropagation();
        // Öffne kleines Inline-Edit-Modal
        openInlineEditModal(projectId, project);
        menu.remove();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.style.display = 'block';
    deleteBtn.style.width = '100%';
    deleteBtn.style.textAlign = 'left';
    deleteBtn.style.marginTop = '6px';
    deleteBtn.innerHTML = '<i class="fas fa-trash" style="margin-right:8px;"></i> Löschen';
    deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (!confirm('Wirklich dieses Projekt löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
        try {
            await firebaseService.deleteProject(projectId);
            showAlert('Projekt gelöscht', 'success');
            // Aktualisiere Liste
            loadProjects();
        } catch (error) {
            console.error('Fehler beim Löschen des Projekts:', error);
            showAlert('Fehler beim Löschen: ' + (error.message || ''), 'danger');
        } finally {
            menu.remove();
        }
    };

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);

    document.body.appendChild(menu);

    // Positioniere Menü nahe am Klick
    const rect = event.target.getBoundingClientRect ? event.target.getBoundingClientRect() : { left: event.clientX, top: event.clientY };
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 8}px`;

    // Entferne Menü bei Klick außerhalb
    const onClickOutside = (ev) => {
        if (!menu.contains(ev.target)) {
            menu.remove();
            window.removeEventListener('click', onClickOutside);
        }
    };
    setTimeout(() => window.addEventListener('click', onClickOutside), 10);
};

/**
 * Öffnet ein kleines Inline-Modal zum Bearbeiten des Projektnamens und der Beschreibung
 */
function openInlineEditModal(projectId, project = {}) {
    // Entferne vorhandenes Modal
    const existing = document.getElementById('inline-edit-project-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'inline-edit-project-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.zIndex = 10000;

    const box = document.createElement('div');
    box.style.background = 'white';
    box.style.padding = '18px';
    box.style.borderRadius = '10px';
    box.style.width = '420px';
    box.style.maxWidth = '92%';
    box.style.boxShadow = '0 12px 36px rgba(0,0,0,0.16)';

    box.innerHTML = `
        <h3 style="margin:0 0 12px 0;">Projekt bearbeiten</h3>
        <div style="margin-bottom:10px;"><label style="display:block;font-weight:600;margin-bottom:6px;">Projekttitel</label><input id="inlineEditTitle" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;" /></div>
        <div style="margin-bottom:14px;"><label style="display:block;font-weight:600;margin-bottom:6px;">Beschreibung</label><textarea id="inlineEditDescription" rows="4" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;"></textarea></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;"><button id="inlineEditCancel" class="btn">Abbrechen</button><button id="inlineEditSave" class="btn btn-primary">Speichern</button></div>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    // Prefill
    document.getElementById('inlineEditTitle').value = project.name || project.title || '';
    document.getElementById('inlineEditDescription').value = project.description || '';

    // Handlers
    document.getElementById('inlineEditCancel').addEventListener('click', () => modal.remove());
    document.getElementById('inlineEditSave').addEventListener('click', async () => {
        const newName = document.getElementById('inlineEditTitle').value.trim();
        const newDesc = document.getElementById('inlineEditDescription').value.trim();
        if (!newName) {
            alert('Bitte einen Projektnamen eingeben');
            return;
        }

        try {
            await firebaseService.updateProject(projectId, { name: newName, title: newName, description: newDesc });
            showAlert('Projekt aktualisiert', 'success');
            modal.remove();
            // Refresh
            loadProjects();
        } catch (err) {
            console.error('Fehler beim Aktualisieren des Projekts:', err);
            showAlert('Fehler beim Speichern: ' + (err.message || ''), 'danger');
        }
    });

    // Close on background click
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

window.editProject = (projectId) => {
    window.location.href = `/pages/project-detail/index.html?project=${projectId}`;
};

// Cleanup beim Verlassen der Seite
window.addEventListener('beforeunload', () => {
    if (projectUnsubscriber) {
        projectUnsubscriber();
    }
    firebaseService.unsubscribeAll();
});
