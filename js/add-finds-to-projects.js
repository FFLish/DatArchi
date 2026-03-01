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
            titel: 'Mosaikfragment mit geometrischem Muster',
            beschreibung: 'Fragment eines römischen Mosaikbodens mit charakteristischem geometrischem Muster in Schwarz und Weiß. Zeigt hochwertige römische Handwerkskunst',
            kategorie: 'ruinen',
            fundort: 'Nördlicher Korridor, Quadrat D4',
            datierung: '2. Jahrhundert n. Chr.',
            material: 'Steinmosaik',
            zustand: 'Gut erhalten',
            berichte: 'Zeigt hochwertige römische Handwerkskunst mit typischen geometrischen Mustern der Kaiserzeit'
        },
        {
            titel: 'Römischer Sestertius des Kaisers Hadrian',
            beschreibung: 'Bronzemünze (Sestertius) aus der Regierungszeit Hadrians mit deutlich erkennbarem Kaiserprofil und Rückseite-Darstellung',
            kategorie: 'gefaesse',
            fundort: 'Haupthalle, Quadrat C3',
            datierung: '117-138 n. Chr.',
            material: 'Bronze',
            zustand: 'Oxidiert, Prägebild lesbar',
            berichte: 'Wichtiger Fund zur Datierung der Villa-Nutzungsphase'
        },
        {
            titel: 'Terra Sigillata Schale mit Reliefdekor',
            beschreibung: 'Charakteristische rote glänzende Terra Sigillata Schale mit feinen Reliefdekorationen, typisch für südgallische Werkstätten',
            kategorie: 'gefaesse',
            fundort: 'Speisezimmer, Quadrat C4',
            datierung: '1.-2. Jahrhundert n. Chr.',
            material: 'Keramik (Terra Sigillata)',
            zustand: 'Fragmentarisch erhalten',
            berichte: 'Typische römische Feinkeramik aus gallischen Produktionsstätten, Importware'
        },
        {
            titel: 'Eisennägel und Türbeschläge',
            beschreibung: 'Sammlung von Konstruktionselementen: mehrere Eisennägel verschiedener Größen und Türbeschläge',
            kategorie: 'werkzeuge',
            fundort: 'Verschiedene Räume, Quadrat B3-D5',
            datierung: '2. Jahrhundert n. Chr.',
            material: 'Eisen',
            zustand: 'Stark korrodiert',
            berichte: 'Dokumentiert römische Bautechniken und Zimmermannshandwerk'
        },
        {
            titel: 'Glasperle und Fensterglasfragmente',
            beschreibung: 'Bernsteinfarbene Glasperle sowie mehrere Fragmente von buntem Fensterglas, typisch für gehobene römische Wohnkultur',
            kategorie: 'sonstiges',
            fundort: 'Wohnbereich, Quadrat E2',
            datierung: '2. Jahrhundert n. Chr.',
            material: 'Glas',
            zustand: 'Gut erhalten',
            berichte: 'Luxusgüter belegen den Wohlstand der Villa-Bewohner'
        }
    ],
    'Keltische Siedlung': [
        {
            titel: 'Eisenschwert im Hallstatt-Stil',
            beschreibung: 'Gut erhaltenes eisernes Langschwert mit verziertem Bronzegriff, charakteristisch für die hallstättische Elitekultur',
            kategorie: 'werkzeuge',
            fundort: 'Grubenbau westlich der Siedlung, Quadrat A1',
            datierung: '5. Jahrhundert v. Chr.',
            material: 'Eisen mit Bronzegriff',
            zustand: 'Hervorragend erhalten',
            berichte: 'Seltenes Exemplar einer Kriegerprestigewaffe, deutet auf hochrangige Persönlichkeit hin'
        },
        {
            titel: 'Vorratsgefäße mit Strichverzierung',
            beschreibung: 'Mehrere Fragmente handgeformter Vorratskrüge mit typischen keltischen Strichmustern',
            kategorie: 'gefaesse',
            fundort: 'Wohngebäude 3, Quadrat C2-C3',
            datierung: '6.-5. Jahrhundert v. Chr.',
            material: 'Ton',
            zustand: 'Mehrere größere Fragmente',
            berichte: 'Typische Alltagskeramik der keltischen Hauswirtschaft'
        },
        {
            titel: 'Gewandnadeln und Fibeln aus Bronze',
            beschreibung: 'Ensemble mehrerer Bronzenadeln und zwei verzierte Fibeln in verschiedenen Stilen',
            kategorie: 'sonstiges',
            fundort: 'Grab, Quadrat B4',
            datierung: '5. Jahrhundert v. Chr.',
            material: 'Bronze',
            zustand: 'Gut erhalten mit grüner Patina',
            berichte: 'Persönliche Trachtbestandteile, vermutlich aus Frauenbestattung'
        },
        {
            titel: 'Handmühle (Unter- und Oberlieger)',
            beschreibung: 'Vollständiger Satz einer Getreidemühle aus Granit: Unterlieger und Läuferstein',
            kategorie: 'werkzeuge',
            fundort: 'Speichergebäude, Quadrat D3-D4',
            datierung: '6.-5. Jahrhundert v. Chr.',
            material: 'Granit',
            zustand: 'Vollständig erhalten',
            berichte: 'Belegt lokale Getreideproduktion und Mehlherstellung'
        },
        {
            titel: 'Bernsteinperle mit Bronzefassung',
            beschreibung: 'Große baltische Bernsteinperle in fein gearbeiteter Bronzefassung mit Drahteinlage',
            kategorie: 'sonstiges',
            fundort: 'Grab, Quadrat B4',
            datierung: '5. Jahrhundert v. Chr.',
            material: 'Bernstein und Bronze',
            zustand: 'Hervorragend',
            berichte: 'Luxusobjekt, belegt weitreichende Handelsbeziehungen bis zur Ostsee'
        }
    ],
    'Mittelalterliches Kloster': [
        {
            titel: 'Steinzeugkrug mit Kreuzstempel',
            beschreibung: 'Fragmentarische Steinzeugkeramik mit eingeprägten Kreuzsymbolen, typisch für klösterliche Produktion',
            kategorie: 'gefaesse',
            fundort: 'Kirchenraum, Quadrat E4-E5',
            datierung: '10.-11. Jahrhundert',
            material: 'Steinzeug',
            zustand: 'Fragmentarisch',
            berichte: 'Religiöse Symbolik deutet auf liturgische Verwendung im Klosterkontext hin'
        },
        {
            titel: 'Bronzenes Prozessionskreuz',
            beschreibung: 'Gegossenes Bronzekreuz mit feinen floralen Verzierungen im romanischen Stil',
            kategorie: 'sonstiges',
            fundort: 'Altarbereich, Quadrat E5',
            datierung: '10. Jahrhundert',
            material: 'Bronze',
            zustand: 'Gut erhalten mit Patina',
            berichte: 'Wichtiges liturgisches Objekt, vermutlich Prozessionskreuz oder Altarkreuz'
        },
        {
            titel: 'Pilgerzeichen und Wallfahrtsmedaillen',
            beschreibung: 'Sammlung von Pilgerabzeichen verschiedener Wallfahrtsorte und Erinnerungsmedaillen',
            kategorie: 'sonstiges',
            fundort: 'Verschiedene Bereiche, Quadrat D4-E5',
            datierung: '10.-13. Jahrhundert',
            material: 'Bronze und Zinn-Blei-Legierung',
            zustand: 'Unterschiedlich erhalten',
            berichte: 'Belegt intensive Pilgertätigkeit und überregionale Verbindungen des Klosters'
        },
        {
            titel: 'Knochenwerkzeuge und Beinkämme',
            beschreibung: 'Verschiedene aus Knochen gefertigte Werkzeuge sowie zwei mehrteilige Beinkämme',
            kategorie: 'werkzeuge',
            fundort: 'Wohn- und Werkstattbereiche, Quadrat D3-E4',
            datierung: '10.-12. Jahrhundert',
            material: 'Tierknochen',
            zustand: 'Fragmentarisch bis gut',
            berichte: 'Dokumentiert klösterliches Alltagsleben und Handwerkstraditionen'
        },
        {
            titel: 'Mönchsbestattung (anthropologisch)',
            beschreibung: 'Skelettbestattung in gestreckter Rückenlage, West-Ost-Orientierung, ohne Grabbeigaben',
            kategorie: 'organisch',
            fundort: 'Klosterfriedhof südlich, Quadrat A5',
            datierung: '11. Jahrhundert',
            material: 'Menschliche Überreste',
            zustand: 'Teilweise erhalten',
            berichte: 'Ermöglicht Untersuchungen zu Gesundheit, Ernährung und Lebensbedingungen im Kloster'
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
                titel: findData.titel,
                beschreibung: findData.beschreibung,
                material: findData.material,
                datierung: findData.datierung,
                kategorie: findData.kategorie,
                fundort: findData.fundort,
                berichte: findData.berichte || findData.zustand,
                privacy: 'public',
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
            console.log(`   ✅ Fund erstellt: ${findData.titel}`);
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
