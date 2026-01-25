// js/public-projects.js
// Verwaltet die öffentliche Projektseite (GitHub-style)

import { firebaseService } from './firebase-service.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { auth } from './firebase-config.js';

let allPublicProjects = [];
let projectsListener = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Track current user
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
    });
    
    loadPublicProjects();
    setupEventListeners();
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchProjects');
    const filterRegion = document.getElementById('filterRegion');
    const filterPeriod = document.getElementById('filterPeriod');
    const modal = document.getElementById('projectDetailModal');
    const closeBtn = document.querySelector('.close');

    searchInput?.addEventListener('input', filterAndDisplayProjects);
    filterRegion?.addEventListener('change', filterAndDisplayProjects);
    filterPeriod?.addEventListener('change', filterAndDisplayProjects);

    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function loadPublicProjects() {
    try {
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Projekte werden geladen...</div>';

        // Lade alle öffentlichen Projekte von Firebase
        allPublicProjects = await firebaseService.getPublicProjects(100);
        console.log('✅ Öffentliche Projekte geladen:', allPublicProjects.length);
        
        if (!allPublicProjects || allPublicProjects.length === 0) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h2>Keine öffentlichen Projekte</h2>
                    <p>Seien Sie der Erste, der ein öffentliches Projekt teilt!</p>
                </div>
            `;
            return;
        }

        displayProjects(allPublicProjects);
    } catch (error) {
        console.error('Fehler beim Laden der öffentlichen Projekte:', error);
        document.getElementById('projectsList').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Fehler beim Laden der Projekte</p>
            </div>
        `;
    }
}

function displayProjects(projects) {
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

    projectsList.innerHTML = projects.map(project => `
        <div class="public-project-card" onclick="showProjectDetail('${project.id}')">
            <div class="project-card-image-container">
                <img src="/partials/images/ausgrabungsstätte.jpg" alt="Ausgrabungsstätte" class="public-project-card-image">
            </div>
            <div class="project-card-header">
                <div class="project-owner">
                    <div class="owner-avatar-placeholder">
                        ${project.ownerAvatar ? `<img src="${project.ownerAvatar}" alt="${project.ownerName}" class="owner-avatar">` : `<div class="owner-avatar-initials"><i class="fas fa-user"></i></div>`}
                    </div>
                    <div class="owner-info">
                        <div class="owner-name">${project.creatorName || project.ownerName || project.lead || 'Anonym'}</div>
                        <div class="project-date">${formatDate(project.createdAt)}</div>
                    </div>
                </div>
            </div>
            
            <h3 class="project-title">${project.title || project.name || 'Untitled'}</h3>
            <p class="project-description">${project.description || 'Keine Beschreibung'}</p>

            <div class="project-tags">
                ${project.period ? `<span class="tag">${project.period}</span>` : ''}
                ${project.location ? `<span class="tag">${project.location}</span>` : ''}
                ${project.demoLabel ? `<span class="tag demo-tag">${project.demoLabel}</span>` : ''}
            </div>

            <div class="project-stats-public">
                <div class="stat-item">
                    <i class="fas fa-cube"></i>
                    <span>${project.findCount || 0}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-star"></i>
                    <span>${project.stars || 0}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-git-alt"></i>
                    <span>${project.version || '1.0'}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-users"></i>
                    <span>${project.memberCount || 1}</span>
                </div>
            </div>

            <div class="project-hover-info">
                <div class="hover-info-content">
                    ${project.region ? `<p><strong>Region:</strong> ${project.region}</p>` : ''}
                    ${project.status ? `<p><strong>Status:</strong> ${project.status}</p>` : ''}
                    ${project.institution ? `<p><strong>Institution:</strong> ${project.institution}</p>` : ''}
                    ${project.principalInvestigator ? `<p><strong>Leitung:</strong> ${project.principalInvestigator}</p>` : ''}
                    <p class="hover-click-hint"><i class="fas fa-mouse"></i> Klicken für mehr Details</p>
                </div>
            </div>
        </div>
    `).join('');
}

function filterAndDisplayProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const regionFilter = document.getElementById('filterRegion').value;
    const periodFilter = document.getElementById('filterPeriod').value;

    let filtered = allPublicProjects.filter(project => {
        const projectName = (project.title || project.name || '').toLowerCase();
        const projectDesc = (project.description || '').toLowerCase();
        const matchesSearch = projectName.includes(searchTerm) || projectDesc.includes(searchTerm);
        const matchesRegion = !regionFilter || (project.location && project.location.includes(regionFilter));
        const matchesPeriod = !periodFilter || project.period === periodFilter;
        return matchesSearch && matchesRegion && matchesPeriod;
    });

    displayProjects(filtered);
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function showProjectDetail(projectId) {
    try {
        const project = allPublicProjects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectDetailModal');
        const content = document.getElementById('projectDetailContent');

        const finds = await firebaseService.getProjectFinds(projectId);
        
        const projectTitle = project.title || project.name || 'Untitled';
        const ownerName = project.creatorName || project.ownerName || project.lead || 'Anonym';
        
        // Check if current user owns this project
        const isOwner = currentUser && project.userId === currentUser.uid;
        
        content.innerHTML = `
            <div class="project-detail-header">
                <div class="project-owner-detail">
                    <img src="${project.ownerAvatar || 'https://via.placeholder.com/64'}" alt="${ownerName}" class="owner-avatar-lg">
                    <div class="owner-info-detail">
                        <h2>${projectTitle}</h2>
                        <p class="owner-name">${ownerName}</p>
                        <p class="project-date">${formatDate(project.createdAt)}</p>
                        ${project.demoLabel ? `<p class="demo-label">${project.demoLabel}</p>` : ''}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="starProject('${projectId}')">
                    <i class="fas fa-star"></i> Mit Stern markieren
                </button>
            </div>

            <div class="project-detail-description">
                <h3>Beschreibung</h3>
                <p>${project.description_long || project.description || 'Keine Beschreibung verfügbar'}</p>
            </div>

            <div class="project-detail-info">
                <div class="info-column">
                    <h4>Projektdetails</h4>
                    ${project.location ? `<p><strong>Ort:</strong> ${project.location}</p>` : ''}
                    ${project.period ? `<p><strong>Zeitraum:</strong> ${project.period}</p>` : ''}
                    ${project.region ? `<p><strong>Region:</strong> ${project.region}</p>` : ''}
                    <p><strong>Status:</strong> ${project.status || 'Aktiv'}</p>
                    <p><strong>Funde:</strong> ${finds.length}</p>
                </div>
                <div class="info-column">
                    <h4>Projektinformation</h4>
                    ${project.institution ? `<p><strong>Institution:</strong> ${project.institution}</p>` : ''}
                    ${project.principalInvestigator ? `<p><strong>Leitung:</strong> ${project.principalInvestigator}</p>` : ''}
                    ${project.budget ? `<p><strong>Budget:</strong> ${project.budget}</p>` : ''}
                    ${project.participants ? `<p><strong>Mitwirkende:</strong> ${project.participants}</p>` : ''}
                </div>
            </div>

            <div class="project-detail-finds">
                <h3>Funde (${finds.length})</h3>
                <div class="finds-list">
                    ${finds.map(find => `
                        <div class="find-item">
                            <div class="find-info">
                                <h5>${find.name || 'Unbenannt'}</h5>
                                <p class="find-category"><strong>Kategorie:</strong> ${find.category || ''}</p>
                                <p class="find-material"><strong>Material:</strong> ${find.material || ''}</p>
                                <p class="find-period"><strong>Periode:</strong> ${find.period || ''}</p>
                                <p class="find-description">${find.description || ''}</p>
                                ${find.discoverer ? `<p class="find-discoverer"><i class="fas fa-user"></i> ${find.discoverer}</p>` : ''}
                                ${find.dateFound ? `<p class="find-date"><i class="fas fa-calendar"></i> ${find.dateFound}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="project-detail-actions">
                ${isOwner ? `
                    <a href="/pages/project-detail/index.html?project=${projectId}" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Projekt bearbeiten
                    </a>
                ` : `
                    <p class="read-only-notice">
                        <i class="fas fa-lock"></i> Dies ist ein öffentliches Projekt. Sie können es nicht bearbeiten.
                    </p>
                `}
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Fehler beim Laden der Projektdetails:', error);
    }
}

// Exportiere globale Funktionen
window.showProjectDetail = showProjectDetail;

window.starProject = async (projectId) => {
    const project = allPublicProjects.find(p => p.id === projectId);
    if (project) {
        project.stars = (project.stars || 0) + 1;
        console.log(`Projekt ${projectId} mit Stern markiert! (${project.stars} Sterne)`);
    }
};
