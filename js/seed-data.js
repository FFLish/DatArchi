// js/seed-data.js
// ====================
// Seed data functionality for test/development
import { auth, db, storage } from './firebase-config.js';
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

// Base64 image placeholder (small, generic 1x1 pixel PNG)
const BASE64_PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// For seed data functionality
document.addEventListener('DOMContentLoaded', () => {
    const seedDataBtn = document.getElementById('seedDataBtn');
    const alertEl = document.getElementById('alert');

    function showAlert(message, type = 'success') {
        if (!alertEl) return;
        alertEl.innerHTML = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.hidden = false;
        setTimeout(() => {
            alertEl.hidden = true;
        }, 5000);
    }

    async function seedData() {
        if (!auth.currentUser) {
            showAlert('Sie müssen angemeldet sein, um Beispieldaten hinzuzufügen.', 'danger');
            return;
        }

        showAlert('Beispieldaten werden erstellt...', 'info');

        try {
            // --- 1. Create Example Sites ---
            const exampleSites = [
                { id: `site-${Date.now()}-1`, name: 'Villa Rustica am Weinberg' },
                { id: `site-${Date.now()}-2`, name: 'Römisches Kastell Saalburg' },
                { id: `site-${Date.now()}-3`, name: 'Mittelalterliche Burganlage' },
            ];

            const uploadedMapUrls = {};

            for (const site of exampleSites) {
                // Upload a placeholder map image to Storage
                const mapImagePath = `users/${auth.currentUser.uid}/sites/${site.id}/map-placeholder.png`;
                const storageRef = ref(storage, mapImagePath);
                await uploadString(storageRef, BASE64_PLACEHOLDER_IMAGE, 'data_url');
                const mapImageUrl = await getDownloadURL(storageRef);
                
                const newSite = {
                    id: site.id,
                    name: site.name,
                    mapImageUrl: mapImageUrl,
                };
                await db.addSite(newSite);
                uploadedMapUrls[site.id] = mapImageUrl; // Store for finds
            }

            // Set the first site as active
            await db.setActiveSite(exampleSites[0].id);

            // --- 2. Create Example Finds for each Site ---
            const findTemplates = [
                {
                    titel: "Keramikscherbe", 
                    beschreibung: "Fragment einer römischen Terra Sigillata Schale.",
                    material: "Keramik", 
                    datierung: "1. - 2. Jh. n. Chr.", 
                    funddatum: "2024-05-10",
                    kategorie: "gefaesse", 
                    privacy: "public",
                    latitude: 100, 
                    longitude: 100
                },
                {
                    titel: "Bronzefibel", 
                    beschreibung: "Gut erhaltene Bronzefibel, Typ Aucissa.",
                    material: "Bronze", 
                    datierung: "1. Jh. v. Chr.", 
                    funddatum: "2024-05-12",
                    kategorie: "werkzeuge", 
                    privacy: "private",
                    latitude: 105, 
                    longitude: 202
                },
                {
                    titel: "Feuersteinabschlag", 
                    beschreibung: "Unretouchierter Feuersteinabschlag.",
                    material: "Feuerstein", 
                    datierung: "4000 - 3000 v. Chr.", 
                    funddatum: "2024-05-11",
                    kategorie: "werkzeuge", 
                    privacy: "public",
                    latitude: 98, 
                    longitude: 199
                },
            ];

            for (const site of exampleSites) {
                await db.setActiveSite(site.id); // Set active site to add finds
                let findCounter = 0;
                for (const template of findTemplates) {
                    const fundId = `FUND-${site.id.substring(site.id.length - 4)}-${++findCounter}`;
                    const newFind = {
                        ...template,
                        id: fundId,
                        photoUrl: uploadedMapUrls[site.id], // Use site map as find photo for now
                        siteId: site.id,
                        zoneLabel: `Zone ${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 1}`
                    };
                    await db.addFind(newFind);
                }
            }

            // --- 3. Create Example Zones for the first Site ---
            await db.setActiveSite(exampleSites[0].id); // Ensure first site is active for zones
            const exampleZones = [
                { id: 'zone-1-1', label: 'Zone A1', x: 50, y: 50, width: 50, height: 50 },
                { id: 'zone-1-2', label: 'Zone A2', x: 100, y: 50, width: 50, height: 50 },
            ];
            await db.saveZones(exampleZones);

            showAlert('Beispieldaten erfolgreich hinzugefügt und erste Stätte aktiviert!', 'success');

        } catch (error) {
            console.error("Fehler beim Erstellen der Beispieldaten:", error);
            showAlert(`Fehler beim Erstellen der Beispieldaten: ${error.message}`, 'danger');
        }
    }

    if (seedDataBtn) {
        seedDataBtn.addEventListener('click', seedData);
    }
});
