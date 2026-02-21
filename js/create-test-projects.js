/**
 * Create Test Projects Script
 * Erstellt Test-Projekte mit Funden für einen spezifischen Benutzer
 * User: sGsaBu2P3tVlUZOTBtc5H8e2Zc82
 */

import { auth, db } from './firebase-config.js';
import { collection, addDoc, writeBatch, doc, Timestamp, getDocs, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const TARGET_USER_ID = 'sGsaBu2P3tVlUZOTBtc5H8e2Zc82';
const USER_NAME = 'Test Archaeologist';

// Test Projects Data
const TEST_PROJECTS = [
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
        lead: USER_NAME,
        creatorName: USER_NAME,
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
        lead: USER_NAME,
        creatorName: USER_NAME,
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
        lead: USER_NAME,
        creatorName: USER_NAME,
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
        version: '1.0'
    }
];

// Test Finds Data
const TEST_FINDS_BY_PROJECT = {
    0: [ // Römische Villa
        {
            name: 'Mosaikfragment mit geometrischem Muster',
            type: 'Keramik/Mosaik',
            description: 'Fragment eines römischen Mosaikbodens mit charakteristischem geometrischem Muster in Schwarz und Weiß',
            category: 'Decoration',
            location_found: 'Nördlicher Korridor',
            depth: '0.85m',
            grid_square: 'D4',
            dating: '2. Jahrhundert n. Chr.',
            material: 'Steinmosaik',
            condition: 'Gut erhalten',
            significance: 'Hoch',
            notes: 'Zeigt hochwertige römische Handwerkskunst',
            tags: ['Mosaik', 'Römisch', 'Dekoration'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'Römische Münze - Sestertius',
            type: 'Münze/Geld',
            description: 'Bronzesesterz aus dem Hadrian-Zeitalter mit deutlich erkennbarem Profil',
            category: 'Numismatics',
            location_found: 'Haupthalle',
            depth: '0.62m',
            grid_square: 'C3',
            dating: '117-138 n. Chr.',
            material: 'Bronze',
            condition: 'Oxidiert, aber lesbar',
            significance: 'Mittel',
            notes: 'Hilft bei der Datierung der Villa',
            tags: ['Münze', 'Hadrian', 'Numismatik'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'Keramikschale - Sigillata',
            type: 'Keramik/Gefäße',
            description: 'Rote glänzende Sigillata-Schale mit Reliefdekorationen',
            category: 'Pottery',
            location_found: 'Speisezimmer',
            depth: '0.58m',
            grid_square: 'C4',
            dating: '1.-2. Jahrhundert n. Chr.',
            material: 'Ton (Sigillata)',
            condition: 'Fragmentarisch',
            significance: 'Hoch',
            notes: 'Typische römische Feinkeramik aus Gallien',
            tags: ['Sigillata', 'Keramik', 'Gefäß'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'Eisennägel und Beschläge',
            type: 'Metall/Werkzeuge',
            description: 'Sammlung von deformierten Eisennägeln und Türbeschlägen',
            category: 'Metal Objects',
            location_found: 'Verschiedene Räume',
            depth: '0.70m - 1.20m',
            grid_square: 'B3-D5',
            dating: '2. Jahrhundert n. Chr.',
            material: 'Eisen',
            condition: 'Verrostet',
            significance: 'Mittel',
            notes: 'Zeigt römische Konstruktionsmethoden',
            tags: ['Eisen', 'Nägel', 'Konstruktion'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'Glasfragmente und Perlen',
            type: 'Glas/Schmuck',
            description: 'Mehrere bunte Glasfragmente und eine bernsteinfarbene Glasperle',
            category: 'Glass & Jewelry',
            location_found: 'Schlafzimmer',
            depth: '0.75m',
            grid_square: 'E2',
            dating: '2. Jahrhundert n. Chr.',
            material: 'Glas und Bernstein',
            condition: 'Gut erhalten',
            significance: 'Hoch',
            notes: 'Luxusgüter der wohlhabenden Villa-Bewohner',
            tags: ['Glas', 'Schmuck', 'Luxus'],
            latitude: 50.9375,
            longitude: 6.9603
        }
    ],
    1: [ // Keltische Siedlung
        {
            name: 'Eisenschwert - Hallstatt-Typ',
            type: 'Waffe/Metall',
            description: 'Gut erhaltenes eisernes Schwert mit Bronze-Griff im Hallstatt-Stil',
            category: 'Weapons',
            location_found: 'Grubenbau westlich der Siedlung',
            depth: '1.35m',
            grid_square: 'A1',
            dating: '5. Jahrhundert v. Chr.',
            material: 'Eisen mit Bronzegriff',
            condition: 'Hervorragend',
            significance: 'Sehr hoch',
            notes: 'Seltenes Exemplar, wahrscheinlich Prestigewaffe eines Kriegers',
            tags: ['Schwert', 'Kelte', 'Hallstatt'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'Handgemachte Keramik mit Strichverzierung',
            type: 'Keramik/Gefäße',
            description: 'Fragmentarische Vorratskrüge mit charakteristischen Strichmustern',
            category: 'Pottery',
            location_found: 'Wohngebäude 3',
            depth: '0.92m',
            grid_square: 'C2-C3',
            dating: '6.-5. Jahrhundert v. Chr.',
            material: 'Ton',
            condition: 'Mehrere größere Fragmente',
            significance: 'Hoch',
            notes: 'Typische Alltagskeramik der keltischen Besiedlung',
            tags: ['Keramik', 'Kelte', 'Handwerk'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'Bronzenadeln und Fibeln',
            type: 'Schmuck/Mode',
            description: 'Mehrere Bronzenadeln und zwei Fibeln, verschiedene Stile',
            category: 'Jewelry & Clothing',
            location_found: 'Begräbnisstelle',
            depth: '1.20m',
            grid_square: 'B4',
            dating: '5. Jahrhundert v. Chr.',
            material: 'Bronze',
            condition: 'Gut erhalten mit Patina',
            significance: 'Hoch',
            notes: 'Persönliche Gegenstände, wahrscheinlich Frauengrab',
            tags: ['Bronze', 'Schmuck', 'Mode'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'Quernsteine - Mühlenanlage',
            type: 'Werkzeug/Haushalt',
            description: 'Unterlieger und Läufer aus Granit für Getreidemühle',
            category: 'Household Objects',
            location_found: 'Speichergebäude',
            depth: '0.78m',
            grid_square: 'D3-D4',
            dating: '6.-5. Jahrhundert v. Chr.',
            material: 'Granit',
            condition: 'Intakt',
            significance: 'Mittel',
            notes: 'Zeigt Landwirtschaft und Getreideproduktion',
            tags: ['Werkzeug', 'Mühle', 'Landwirtschaft'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'Bernsteinperle mit Metallfahsung',
            type: 'Schmuck/Luxus',
            description: 'Große Bernsteinperle in silberner Bronzefassung',
            category: 'Jewelry & Luxury',
            location_found: 'Begräbnisstelle',
            depth: '1.22m',
            grid_square: 'B4',
            dating: '5. Jahrhundert v. Chr.',
            material: 'Bernstein und Bronze',
            condition: 'Hervorragend',
            significance: 'Sehr hoch',
            notes: 'Luxusgut, zeigt Fernhandel mit Baltikum',
            tags: ['Bernstein', 'Handel', 'Luxus'],
            latitude: 50.3667,
            longitude: 8.4333
        }
    ],
    2: [ // Mittelalterliches Kloster
        {
            name: 'Steinkrüge mit Religionsmarkierungen',
            type: 'Keramik/Gefäße',
            description: 'Fragmentarische Steingutkeramik mit eingepressten Kreuzen',
            category: 'Pottery',
            location_found: 'Kirchenraum',
            depth: '0.65m',
            grid_square: 'E4-E5',
            dating: '10.-11. Jahrhundert',
            material: 'Steinzeug',
            condition: 'Fragmentarisch',
            significance: 'Hoch',
            notes: 'Religiöse Symbolik deutet auf Klosterkontext hin',
            tags: ['Kloster', 'Keramik', 'Religion'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'Bronzenes Kirchen-Kreuz',
            type: 'Kunstgewerbe/Liturgisch',
            description: 'Gegossenes Bronzekreuz mit floralen Verzierungen',
            category: 'Religious Objects',
            location_found: 'Altar-Bereich',
            depth: '0.45m',
            grid_square: 'E5',
            dating: '10. Jahrhundert',
            material: 'Bronze',
            condition: 'Gut erhalten mit schöner Patina',
            significance: 'Sehr hoch',
            notes: 'Wichtiges liturgisches Artefakt, möglicherweise Prozessionskreuz',
            tags: ['Kreuz', 'Liturgie', 'Bronze'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'Pilgermünzen und Wallfahrtszeichen',
            type: 'Münze/Pilgerschaft',
            description: 'Sammlung verschiedener Pilgermünzen und Erinnerungszeichen',
            category: 'Numismatics',
            location_found: 'Verschiedene Bereiche des Klosters',
            depth: '0.50m - 1.00m',
            grid_square: 'D4-E5',
            dating: '10.-13. Jahrhundert',
            material: 'Bronze und Zinn',
            condition: 'Unterschiedlich',
            significance: 'Hoch',
            notes: 'Zeigt Pilgertätigkeit und internationale Verbindungen',
            tags: ['Pilger', 'Münze', 'Wallfahrt'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'Knochenwerkzeuge und Kämme',
            type: 'Werkzeug/Mode',
            description: 'Mehrere bearbeitete Knochenwerkzeuge und zwei Kämme',
            category: 'Bone Objects',
            location_found: 'Wohn- und Werkstattbereiche',
            depth: '0.70m - 0.95m',
            grid_square: 'D3-E4',
            dating: '10.-12. Jahrhundert',
            material: 'Knochen',
            condition: 'Fragmentarisch bis gut',
            significance: 'Mittel',
            notes: 'Zeigt Alltagsleben und Handwerkstechniken',
            tags: ['Knochen', 'Werkzeug', 'Mode'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'Mönchsgrab mit Skelettbegleitung',
            type: 'Anthropologisch',
            description: 'Teilweise erhaltenes Skelett mit einfacher Bestattung ohne Beigaben',
            category: 'Human Remains',
            location_found: 'Friedhof südlich des Klosters',
            depth: '1.10m',
            grid_square: 'A5',
            dating: '11. Jahrhundert',
            material: 'Knochen',
            condition: 'Fragmentarisch',
            significance: 'Hoch',
            notes: 'Ermöglicht Demographie und Lebensbedingungen der Mönche',
            tags: ['Bestattung', 'Skelett', 'Mönch'],
            latitude: 47.5333,
            longitude: 10.2667
        }
    ]
};

/**
 * Erstelle Test-Projekte mit Funden
 */
async function createTestProjectsWithFinds() {
    try {
        console.log('🚀 Starte Erstellung von Test-Projekten für Benutzer:', TARGET_USER_ID);
        
        const projectIds = [];

        // 1. Erstelle Projekte
        for (let i = 0; i < TEST_PROJECTS.length; i++) {
            const projectData = TEST_PROJECTS[i];
            
            const projectDoc = {
                ...projectData,
                owner: TARGET_USER_ID,
                ownerEmail: 'test@example.com',
                ownerName: USER_NAME,
                ownerAvatar: null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                findCount: 0,
                memberCount: projectData.team.length,
                visibility: 'public',
                status: projectData.status,
                version: projectData.version
            };

            const projectRef = await addDoc(collection(db, 'projects'), projectDoc);
            projectIds.push(projectRef.id);
            console.log(`✅ Projekt erstellt (${i + 1}/${TEST_PROJECTS.length}): ${projectData.title} (${projectRef.id})`);
        }

        // 2. Erstelle Funde für jedes Projekt
        for (let projectIndex = 0; projectIndex < projectIds.length; projectIndex++) {
            const projectId = projectIds[projectIndex];
            const finds = TEST_FINDS_BY_PROJECT[projectIndex] || [];

            for (let findIndex = 0; findIndex < finds.length; findIndex++) {
                const findData = finds[findIndex];
                
                const findDoc = {
                    ...findData,
                    projectId,
                    creator: TARGET_USER_ID,
                    creatorName: USER_NAME,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    verified: false,
                    featured: false,
                    views: Math.floor(Math.random() * 100),
                    likes: Math.floor(Math.random() * 30),
                    status: 'Documented'
                };

                const findRef = await addDoc(collection(db, 'finds'), findDoc);
                console.log(`   ✅ Fund erstellt (${findIndex + 1}/${finds.length}): ${findData.name} (${findRef.id})`);
            }

            // Aktualisiere findCount des Projekts
            const findCount = finds.length;
            await updateDoc(doc(db, 'projects', projectId), {
                findCount: findCount,
                updatedAt: Timestamp.now()
            });
            console.log(`📊 Projekt aktualisiert: ${findCount} Funde hinzugefügt\n`);
        }

        console.log('🎉 Alle Test-Projekte und Funde erfolgreich erstellt!');
        console.log(`📈 Zusammenfassung:`);
        console.log(`   - Projekte erstellt: ${projectIds.length}`);
        console.log(`   - Gesamtfunde erstellt: ${Object.values(TEST_FINDS_BY_PROJECT).reduce((sum, finds) => sum + finds.length, 0)}`);
        console.log(`   - Benutzer: ${TARGET_USER_ID}`);

        return projectIds;
    } catch (error) {
        console.error('❌ Fehler beim Erstellen der Test-Projekte:', error);
        throw error;
    }
}

// Export für externe Nutzung
export { createTestProjectsWithFinds, TARGET_USER_ID };
