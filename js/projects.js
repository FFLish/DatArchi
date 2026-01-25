// js/projects.js
// Verwaltet die persönliche Projektseite mit Firebase

import { auth } from './firebase-config.js';
import { firebaseService } from './firebase-service.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let currentProjects = [];
let currentUserId = null;
let projectUnsubscriber = null; // Für Listener Management

const DEMO_USER_ID = 'user-demo';

document.addEventListener('DOMContentLoaded', () => {
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
            console.log('⚠️ Benutzer abgemeldet');
            currentUserId = DEMO_USER_ID;
            localStorage.setItem('currentUserId', currentUserId);
            
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
        currentUserId = localStorage.getItem('currentUserId') || DEMO_USER_ID;
        console.log('⚠️ Demo-Modus:', currentUserId);
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
            // Demo-Modus - keine Projekte ohne Auth
            console.log('⚠️ Demo-Modus: Keine Projekte ohne Authentifizierung');
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

    const projectsHTML = await Promise.all(projects.map(async project => {
        const finds = await firebaseService.getProjectFinds(project.id).catch(() => []) || [];
        const findCategories = [...new Set(finds.map(f => f.category))];
        const materials = [...new Set(finds.map(f => f.material))];
        
        return `
        <div class="project-card">
            <div class="project-card-image">
                <img src="/partials/images/ausgrabungsstätte.jpg" alt="Ausgrabungsstätte" class="project-card-img">
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
            
            <p class="project-description">${project.description}</p>
            
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
                    <span>${project.findCount || 0} Funde</span>
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

            ${finds.length > 0 ? `
            <div class="finds-preview" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <h4 style="font-size: 12px; color: #999; margin-bottom: 8px; text-transform: uppercase;">Gefundene Artefakte</h4>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${finds.slice(0, 5).map(find => `
                        <span class="find-badge" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; background: linear-gradient(135deg, #5b21b6, #7c3aed); color: white; border-radius: 20px; font-size: 11px; font-weight: 600;">
                            <i class="fas fa-gem"></i> ${find.titel}
                        </span>
                    `).join('')}
                    ${finds.length > 5 ? `<span style="padding: 6px 10px; color: #999; font-size: 11px;">+${finds.length - 5} mehr</span>` : ''}
                </div>
            </div>
            ` : ''}

            <div class="project-card-footer">
                <a href="/pages/project-detail/index.html?project=${project.id}" class="btn btn-sm btn-primary">
                    <i class="fas fa-folder-open"></i> Öffnen
                </a>
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
window.showProjectMenu = (event, projectId) => {
    console.log('Projektmenü für:', projectId);
};

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
