/**
 * Add Test Finds to Existing Projects
 * Fügt Beispiel-Funde zu bestehenden Projekten hinzu
 */

import { auth, db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

// Beispiel-Funde für verschiedene Projekttypen
const SAMPLE_FINDS = {
    'Römische Villa': [
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
            notes: 'Zeigt hochwertige römische Handwerkskunst'
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
            notes: 'Hilft bei der Datierung der Villa'
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
            notes: 'Typische römische Feinkeramik aus Gallien'
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
            notes: 'Zeigt römische Konstruktionsmethoden'
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
            notes: 'Luxusgüter der wohlhabenden Villa-Bewohner'
        }
    ],
    'Keltische Siedlung': [
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
            notes: 'Seltenes Exemplar, wahrscheinlich Prestigewaffe eines Kriegers'
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
            notes: 'Typische Alltagskeramik der keltischen Besiedlung'
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
            notes: 'Persönliche Gegenstände, wahrscheinlich Frauengrab'
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
            notes: 'Zeigt Landwirtschaft und Getreideproduktion'
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
            notes: 'Luxusgut, zeigt Fernhandel mit Baltikum'
        }
    ],
    'Mittelalterliches Kloster': [
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
            notes: 'Religiöse Symbolik deutet auf Klosterkontext hin'
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
            notes: 'Wichtiges liturgisches Artefakt, möglicherweise Prozessionskreuz'
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
            notes: 'Zeigt Pilgertätigkeit und internationale Verbindungen'
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
            notes: 'Zeigt Alltagsleben und Handwerkstechniken'
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
            notes: 'Ermöglicht Demographie und Lebensbedingungen der Mönche'
        }
    ]
};

/**
 * Bestimmte Keywords in Projekttitel um passende Funde zu finden
 */
function matchFindsToProject(projectTitle) {
    for (const [key, finds] of Object.entries(SAMPLE_FINDS)) {
        if (projectTitle.includes(key) || projectTitle.toLowerCase().includes(key.toLowerCase())) {
            return finds;
        }
    }
    return SAMPLE_FINDS['Römische Villa']; // Default
}

/**
 * Füge Funde zu einem Projekt hinzu
 */
async function addFindsToProject(projectId, projectTitle, projectData) {
    try {
        const finds = matchFindsToProject(projectTitle);
        let createdCount = 0;

        for (const findData of finds) {
            const findDoc = {
                ...findData,
                projectId,
                creator: auth.currentUser.uid,
                creatorName: auth.currentUser.displayName || 'Benutzer',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                verified: false,
                featured: false,
                views: Math.floor(Math.random() * 100),
                likes: Math.floor(Math.random() * 30),
                status: 'Documented'
            };

            await addDoc(collection(db, 'finds'), findDoc);
            createdCount++;
            console.log(`   ✅ Fund erstellt: ${findData.name}`);
        }

        // Aktualisiere findCount des Projekts
        await updateDoc(doc(db, 'projects', projectId), {
            findCount: finds.length,
            updatedAt: Timestamp.now()
        });

        console.log(`📊 ${finds.length} Funde hinzugefügt zu: ${projectTitle}\n`);
        return createdCount;
    } catch (error) {
        console.error(`❌ Fehler beim Hinzufügen von Funden zu ${projectTitle}:`, error);
        throw error;
    }
}

/**
 * Füge Funde zu allen Projekten des Benutzers hinzu
 */
async function addFindsToAllProjects() {
    try {
        if (!auth.currentUser) {
            throw new Error('Benutzer nicht angemeldet');
        }

        console.log(`🚀 Füge Funde zu allen Projekten hinzu...`);
        
        // Hole alle Projekte des Benutzers
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        let totalFinds = 0;
        let projectsWithFinds = 0;

        querySnapshot.forEach(async (doc) => {
            const project = doc.data();
            const projectId = doc.id;
            
            // Überspringe Projekte die bereits Funde haben
            if (project.findCount && project.findCount > 0) {
                console.log(`⏭️  Übersprungen (hat bereits Funde): ${project.name || project.title}`);
                return;
            }

            try {
                const count = await addFindsToProject(projectId, project.name || project.title, project);
                totalFinds += count;
                projectsWithFinds++;
            } catch (error) {
                console.error(`Fehler bei Projekt ${projectId}:`, error);
            }
        });

        console.log('🎉 Fertig!');
        console.log(`📈 Zusammenfassung:`);
        console.log(`   - Projekte mit Funden: ${projectsWithFinds}`);
        console.log(`   - Gesamtfunde hinzugefügt: ${totalFinds}`);

        return { projectsWithFinds, totalFinds };
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen von Funden:', error);
        throw error;
    }
}

// Export
export { addFindsToAllProjects, addFindsToProject, SAMPLE_FINDS };
