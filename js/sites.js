/**
 * Sites Management Page Logic
 * Manages display and creation of excavation sites
 */

import { auth, db } from './firebase-config.js';
import { VREExcavationSiteService } from './vre-excavation-site-service.js';
import { VREUserAccountService } from './vre-user-account-service.js';
import { getRandomExcavationSiteImage } from './image-utilities.js';
import { setupImageSystem } from './image-system-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let currentUser = null;
let currentUserAccount = null;

// Initialize image system on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        setupImageSystem();
    } catch (error) {
        console.warn('⚠️ Image system initialization warning:', error.message);
    }
});

// Initialize page
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            currentUserAccount = await VREUserAccountService.getUserAccount(user.uid);
            await loadUserSites();
        } catch (error) {
            console.error('Error loading user account:', error);
        }
    }
});

// Load user sites
async function loadUserSites() {
    try {
        const sites = await VREExcavationSiteService.getUserOwnedSites(currentUser.uid);
        displaySites(sites);
    } catch (error) {
        console.error('Error loading sites:', error);
        showAlert('Fehler beim Laden der Stätten', 'danger');
    }
}

// Display sites in list
function displaySites(sites) {
    const sitesList = document.getElementById('sitesList');
    const noSitesMessage = document.getElementById('noSitesMessage');

    if (!sites || sites.length === 0) {
        sitesList.innerHTML = '';
        noSitesMessage.style.display = 'block';
        return;
    }

    noSitesMessage.style.display = 'none';
    
    sitesList.innerHTML = sites.map(site => `
        <li style="padding: 20px; background: var(--card-darker); border-radius: 12px; border: 1px solid var(--border); transition: all 0.3s ease; cursor: pointer; hover: box-shadow: 0 4px 12px rgba(244, 164, 96, 0.2);" data-site-id="${site.id}">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: var(--text);">${site.name}</h3>
                    <p style="margin: 0 0 8px 0; color: var(--muted); font-size: 14px;">${site.description || ''}</p>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: var(--muted); margin-top: 10px;">
                        ${site.country ? `<span><i class="fas fa-map-marker-alt"></i> ${site.country}${site.region ? ', ' + site.region : ''}</span>` : ''}
                        ${site.period ? `<span><i class="fas fa-hourglass-half"></i> ${site.period}</span>` : ''}
                        <span><i class="fas fa-users"></i> ${site.contributors?.length || 1} Mitglieder</span>
                        <span style="padding: 2px 8px; background: ${site.visibility === 'public' ? 'rgba(132, 204, 22, 0.2); color: #84cc16' : 'rgba(244, 164, 96, 0.2); color: var(--accent)'}; border-radius: 4px;">
                            ${site.visibility === 'public' ? 'Öffentlich' : 'Privat'}
                        </span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-direction: column;">
                    <button class="btn btn-primary" onclick="goToSite('${site.id}')" style="padding: 8px 16px; font-size: 12px; white-space: nowrap;">
                        <i class="fas fa-map"></i> Zur Karte
                    </button>
                    <button class="btn btn-secondary" onclick="editSite('${site.id}')" style="padding: 8px 16px; font-size: 12px; white-space: nowrap;">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                </div>
            </div>
        </li>
    `).join('');
}

// Go to site map (updated to project detail)
function goToSite(siteId) {
    localStorage.setItem('activeSiteId', siteId);
    window.location.href = `/pages/project-detail/index.html?project=${siteId}`;
}

// Edit site (placeholder for future)
function editSite(siteId) {
    alert('Seitenbearbeitung wird in Kürze verfügbar sein');
}

// Modal controls
const createNewSiteBtn = document.getElementById('createNewSiteBtn');
const createSiteModal = document.getElementById('createSiteModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const submitCreateSiteBtn = document.getElementById('submitCreateSiteBtn');

createNewSiteBtn.addEventListener('click', () => {
    createSiteModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

const closeModal = () => {
    createSiteModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('createSiteForm').reset();
};

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Close modal on background click
createSiteModal.addEventListener('click', (e) => {
    if (e.target === createSiteModal) {
        closeModal();
    }
});

// Submit form
submitCreateSiteBtn.addEventListener('click', async () => {
    const formData = {
        name: document.getElementById('siteName').value,
        description: document.getElementById('siteDescription').value,
        country: document.getElementById('siteCountry').value,
        region: document.getElementById('siteRegion').value,
        period: document.getElementById('sitePeriod').value,
        visibility: document.getElementById('siteVisibility').value,
    };

    if (!formData.name.trim()) {
        showAlert('Der Name der Stätte ist erforderlich', 'danger');
        return;
    }

    try {
        submitCreateSiteBtn.disabled = true;
        submitCreateSiteBtn.innerHTML = '<span class="loading-spinner"></span> Wird erstellt...';

        // Create site
        const site = await VREExcavationSiteService.createExcavationSite(formData, currentUser.uid);

        // Add to user's projects
        if (currentUserAccount) {
            await VREUserAccountService.addOwnedProject(currentUser.uid, site.id);
        }

        showAlert('✓ Stätte erfolgreich erstellt!', 'success');
        closeModal();

        // Reload sites
        setTimeout(() => {
            loadUserSites();
        }, 1000);
    } catch (error) {
        console.error('Error creating site:', error);
        showAlert('Fehler beim Erstellen der Stätte: ' + error.message, 'danger');
    } finally {
        submitCreateSiteBtn.disabled = false;
        submitCreateSiteBtn.innerHTML = '<i class="fas fa-check"></i> Stätte erstellen';
    }
});

// Show alert message
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.hidden = false;

    setTimeout(() => {
        alert.hidden = true;
    }, 3000);
}

// Add loading spinner style
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    li:hover {
        box-shadow: 0 4px 12px rgba(244, 164, 96, 0.2);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);
