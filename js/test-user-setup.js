/**
 * Test User Setup Script
 * Erstellt Test-Projekte für einen spezifischen Benutzer
 */

import { firebaseService } from './firebase-service.js';
import { auth, db } from './firebase-config.js';
import { collection, addDoc, writeBatch, doc, Timestamp, getDocs, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

// Tristancoutant User ID
const TRISTANCOUTANT_USER_ID = 'sGsaBu2P3tVlUZOTBtc5H8e2Zc82';

/**
 * Erstelle Test-Projekte für einen Benutzer
 */
async function createTestProjectsForUser(userId, userName) {
    try {
        console.log(`Erstelle Test-Projekte für Benutzer: ${userName}`);

        const testProjects = [
            {
                title: 'Römische Villa am Rhein',
                name: 'Römische Villa am Rhein',
                description: 'Ausgrabung einer gut erhaltenen römischen Villa mit Mosaiken',
                description_long: 'Eine faszinierende Ausgrabung einer römischen Villa aus dem 2. Jahrhundert n. Chr. Das Anwesen zeigt beeindruckende Mosaike und eine komplexe Architektur. Die Villa war wahrscheinlich das Landgut eines wohlhabenden römischen Händlers.',
                location: 'Köln, Deutschland',
                region: 'Rhineland-Palatinate',
                period: 'Römisch',
                startDate: '2024-01-15',
                endDate: '2024-09-30',
                status: 'Aktiv',
                lead: userName,
                creatorName: userName,
                team: ['Dr. Hans Mueller', 'Dr. Sarah Wagner', 'Thomas Klein'],
                institution: 'Archäologisches Institut Köln',
                principalInvestigator: 'Dr. Hans Mueller',
                budget: '€150,000',
                participants: '12',
                fundingSource: 'Deutsche Forschungsgemeinschaft',
                latitude: 50.9375,
                longitude: 6.9603,
                isPublic: true,
                visibility: 'public',
                findCount: 0,
                stars: 0,
                memberCount: 3,
                version: '1.0'
            },
            {
                title: 'Keltische Siedlung Taunus',
                name: 'Keltische Siedlung Taunus',
                description: 'Erforschung einer befestigten keltischen Siedlung aus dem 5. Jahrhundert v. Chr.',
                description_long: 'Diese archäologische Stätte zeigt die Überreste einer befestigten keltischen Gemeinde mit Wohngebäuden, Speichern und Verteidigungsanlagen. Die Funde geben Einblicke in das tägliche Leben, den Handel und die Handwerkstechniken der Kelten.',
                location: 'Taunus, Hessen',
                region: 'Hesse',
                period: 'Latène-Zeit',
                startDate: '2023-06-01',
                endDate: '2024-08-31',
                status: 'In Bearbeitung',
                lead: userName,
                creatorName: userName,
                team: ['Prof. Andrea Schmidt', 'Dr. Klaus Weber'],
                institution: 'Universität Frankfurt am Main',
                principalInvestigator: 'Prof. Andrea Schmidt',
                budget: '€200,000',
                participants: '8',
                fundingSource: 'Hessisches Ministerium für Wissenschaft',
                latitude: 50.3667,
                longitude: 8.4333,
                isPublic: true,
                visibility: 'public',
                findCount: 0,
                stars: 0,
                memberCount: 2,
                version: '1.5'
            },
            {
                title: 'Mittelalterliches Kloster Bayern',
                name: 'Mittelalterliches Kloster Bayern',
                description: 'Ausgrabungen der Fundamente eines benediktinischen Klosters aus dem 10. Jahrhundert',
                description_long: 'Die Ausgrabungsstelle offenbart die Grundlagen eines bedeutenden benediktinischen Klosters mit Kirche, Klostergebäuden und umfangreichen Bestattungen. Die Funde umfassen religiöse Artefakte, Keramik und Knochen von Mönchen und lokalen Bewohnern.',
                location: 'Allgäu, Bayern',
                region: 'Bavaria',
                period: 'Mittelalter',
                startDate: '2024-04-01',
                endDate: '2024-10-31',
                status: 'Planung',
                lead: userName,
                creatorName: userName,
                team: ['Dr. Josef Mueller', 'Prof. Maria Rossi', 'Dr. Thomas Bergmann', 'Markus Hoffmann'],
                institution: 'Bayerisches Landesamt für Denkmalpflege',
                principalInvestigator: 'Prof. Maria Rossi',
                budget: '€250,000',
                participants: '15',
                fundingSource: 'Bayerische Akademie der Wissenschaften',
                latitude: 47.5333,
                longitude: 10.2667,
                isPublic: true,
                visibility: 'public',
                findCount: 0,
                stars: 0,
                memberCount: 4,
                version: '2.0'
            }
        ];

        const batch = writeBatch(db);
        let projectCount = 0;

        for (const projectData of testProjects) {
            const projectRef = doc(collection(db, 'projects'));
            
            batch.set(projectRef, {
                ...projectData,
                userId: userId,
                owner: userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            projectCount++;
            console.log(`✓ Projekt vorbereitet: ${projectData.title}`);
        }

        await batch.commit();
        console.log(`✅ ${projectCount} Test-Projekte erfolgreich erstellt für ${userName}`);

        // Erstelle auch Funde für die Projekte
        await createTestFindsForUserProjects(userId);

        return true;
    } catch (error) {
        console.error('Fehler beim Erstellen der Test-Projekte:', error);
        throw error;
    }
}

/**
 * Erstelle Test-Funde für die Projekte des Benutzers
 */
async function createTestFindsForUserProjects(userId) {
    try {
        // Hole alle Projekte dieses Benutzers
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', userId));
        const projectDocs = await getDocs(q);

        if (projectDocs.empty) {
            console.log('Keine Projekte gefunden für Find-Erstellung');
            return;
        }

        // Funde für Römische Villa
        const romanVillaFinds = [
            {
                name: 'Römische Münze - Kaiser Augustus',
                category: 'Münzen & Währung',
                period: 'Römisch',
                material: 'Silber',
                description: 'Seltene Münze mit Porträt von Kaiser Augustus aus dem 1. Jahrhundert n.Chr.',
                discoverer: 'Dr. Hans Mueller',
                dateFound: '2024-03-15'
            },
            {
                name: 'Terra Sigillata Schale',
                category: 'Keramik',
                period: 'Römisch',
                material: 'Keramik (Terra Sigillata)',
                description: 'Rote Hochglanzkeramik mit Handwerkersignatur aus Südgallien',
                discoverer: 'Dr. Sarah Wagner',
                dateFound: '2024-03-18'
            },
            {
                name: 'Römische Öllampe',
                category: 'Artefakte',
                period: 'Römisch',
                material: 'Keramik, Öl-Rückstände',
                description: 'Intakte Öllampe mit Tiermotiven auf der Oberseite',
                discoverer: 'Thomas Klein',
                dateFound: '2024-04-02'
            },
            {
                name: 'Goldring mit Stein',
                category: 'Schmuck & Verzierungen',
                period: 'Römisch',
                material: 'Gold, Karneol',
                description: 'Eleganter Siegelring mit Karneol-Stein, möglicherweise der Hausherrin gehört',
                discoverer: 'Dr. Hans Mueller',
                dateFound: '2024-04-10'
            }
        ];

        // Funde für Keltische Siedlung
        const celticSettlementFinds = [
            {
                name: 'Keltische Fibel',
                category: 'Schmuck & Verzierungen',
                period: 'Latène-Zeit',
                material: 'Bronze',
                description: 'Sicherheitsnadel aus Bronze mit feinen geometrischen Verzierungen',
                discoverer: 'Dr. Klaus Weber',
                dateFound: '2024-07-10'
            },
            {
                name: 'Bronzebrosche mit Email',
                category: 'Schmuck & Verzierungen',
                period: 'Keltisch',
                material: 'Bronze, Email',
                description: 'Keltische Brosche mit farblichen Emailleverzierungen in Rot und Blau',
                discoverer: 'Prof. Andrea Schmidt',
                dateFound: '2024-06-22'
            },
            {
                name: 'Eisenschlagschwert',
                category: 'Waffen',
                period: 'Latène-Zeit',
                material: 'Eisen',
                description: 'Wohlerhaltenes keltisches Schwert mit Schottenmuster',
                discoverer: 'Dr. Klaus Weber',
                dateFound: '2024-07-25'
            }
        ];

        // Funde für Mittelalterliches Kloster
        const monasteryFinds = [
            {
                name: 'Mittelalterliche Gürtelschnalle',
                category: 'Metallgegenstände',
                period: 'Mittelalter',
                material: 'Bronze',
                description: 'Verzierte Gürtelschnalle eines Mönchs oder Priesters, möglicherweise 10.-11. Jh.',
                discoverer: 'Dr. Josef Mueller',
                dateFound: '2024-05-03'
            },
            {
                name: 'Keramikteller - Graphitton',
                category: 'Keramik',
                period: 'Mittelalter',
                material: 'Graphitton-Keramik',
                description: 'Typische Haushaltskeramik aus der Klosterzeit, grauer Graphitton',
                discoverer: 'Prof. Maria Rossi',
                dateFound: '2024-06-15'
            },
            {
                name: 'Silberner Löffel',
                category: 'Artefakte',
                period: 'Mittelalter',
                material: 'Silber',
                description: 'Schöner mittelalterlicher Silberlöffel mit vergoldeter Verzierung, wohl aus dem Kloster',
                discoverer: 'Markus Hoffmann',
                dateFound: '2024-05-20'
            },
            {
                name: 'Knochenflöte',
                category: 'Musikinstrumente',
                period: 'Mittelalter',
                material: 'Tierknochen',
                description: 'Mittelalterliche Knochenflöte, möglicherweise in der Klosterschule verwendet',
                discoverer: 'Dr. Thomas Bergmann',
                dateFound: '2024-07-01'
            }
        ];

        // Zuordnung: Projekt 0 -> Roman, Projekt 1 -> Celtic, Projekt 2 -> Medieval, Projekt 3 -> Iron Age
        const projectFindsMapping = [
            romanVillaFinds,
            celticSettlementFinds,
            monasteryFinds,
            [
                {
                    name: 'Eisenzeit-Schmuck',
                    category: 'Schmuck & Verzierungen',
                    period: 'Eisenzeit',
                    material: 'Bronze, Bernstein',
                    description: 'Wertvoller Schmuck aus der Eisenzeit mit Bernsteinelementen',
                    discoverer: 'Dr. Andrea Krause',
                    dateFound: '2024-08-10'
                },
                {
                    name: 'Grabbeigabe - Keramikkrug',
                    category: 'Keramik',
                    period: 'Eisenzeit',
                    material: 'Keramik',
                    description: 'Funerärer Keramikkrug aus einem Grab, mit beigaben für das Jenseits',
                    discoverer: 'Prof. Werner Schmidt',
                    dateFound: '2024-08-22'
                },
                {
                    name: 'Eisenhacke',
                    category: 'Werkzeuge',
                    period: 'Eisenzeit',
                    material: 'Eisen',
                    description: 'Landwirtschaftliches Werkzeug aus Eisen, zeigt hohe Handwerksfertigkeit',
                    discoverer: 'Dr. Andrea Krause',
                    dateFound: '2024-09-05'
                }
            ]
        ];

        let totalFinds = 0;
        const projectDocs_array = projectDocs.docs;

        for (let i = 0; i < projectDocs_array.length; i++) {
            const projectDoc = projectDocs_array[i];
            const projectId = projectDoc.id;
            const projectTitle = projectDoc.data().title;
            const subcollectionFindsRef = collection(db, 'projects', projectId, 'finds');

            // Get finds for this project (use mapping if available, otherwise use first set)
            const selectedFinds = projectFindsMapping[i] || romanVillaFinds;
            let projectFindCount = 0;

            for (const findData of selectedFinds) {
                // Add to subcollection
                await addDoc(subcollectionFindsRef, {
                    ...findData,
                    userId: userId,
                    projectId: projectId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                
                // Also add to top-level finds collection for querying
                await addDoc(collection(db, 'finds'), {
                    ...findData,
                    userId: userId,
                    projectId: projectId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                
                projectFindCount++;
                totalFinds++;
            }

            // Update project findCount
            const projectDocRef = doc(db, 'projects', projectId);
            await updateDoc(projectDocRef, { findCount: projectFindCount });
            console.log(`✓ ${projectFindCount} Funde hinzugefügt zu ${projectTitle}`);
        }

        console.log(`✅ ${totalFinds} Funde insgesamt erstellt`);
    } catch (error) {
        console.error('Fehler beim Erstellen der Test-Funde:', error);
    }
}

// Exportiere Funktionen für externe Nutzung
window.createTestProjectsForUser = createTestProjectsForUser;
window.createTestFindsForUserProjects = createTestFindsForUserProjects;

/**
 * Auto-Initialisierung: Erstelle automatisch Test-Projekte für tristancoutant beim Laden
 */
async function autoInitializeTristancoutantProjects() {
    try {
        // Überprüfe ob Projekte bereits existieren
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', TRISTANCOUTANT_USER_ID));
        const existingProjects = await getDocs(q);

        if (existingProjects.size === 0) {
            console.log('🔄 Erstelle automatisch Test-Projekte für tristancoutant...');
            await createTestProjectsForUser(TRISTANCOUTANT_USER_ID, 'tristancoutant');
            console.log('✅ Test-Projekte automatisch erstellt!');
        } else {
            console.log(`✅ Test-Projekte existieren bereits (${existingProjects.size} Projekte gefunden)`);
        }
    } catch (error) {
        console.log('ℹ️ Auto-Initialisierung: ', error.message);
    }
}

// Auto-initialize wenn Seite geladen wird (verzögert um Firebase zu laden)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(autoInitializeTristancoutantProjects, 1000);
    });
}

console.log('Test User Setup Script geladen. Nutze createTestProjectsForUser(userId, userName)');
