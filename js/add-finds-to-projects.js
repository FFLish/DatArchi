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
            titel: 'VR-TES-001: Tessellat-Mosaikfragment mit opus vermiculatum Mäanderbordüre',
            beschreibung: 'Fragment eines schwarz-weißen römischen Mosaikbodens (opus tessellatum) mit charakteristischer Mäander-Bordüre ("laufender Hund") in opus vermiculatum Technik. Tesserae: weißer Kalkstein und schwarzer Schiefer, Größe 0,8-1,2 cm. Fixierung auf römischem Estrich (opus signinum) mit Ziegelmehl. Fragment 32 x 28 cm. Typisch für Villen-Triclinia der mittleren Kaiserzeit.',
            kategorie: 'ruinen',
            fundort: 'Nördlicher Korridor (Triclinium), Quadrat D4, Planum 3',
            datierung: '2. Jahrhundert n. Chr. (120-180 n.Chr., antoninisch)',
            material: 'Steinmosaik (Kalkstein/Schiefer-Tesserae), Kalkmörtel',
            zustand: 'Gut erhalten, ca. 15% der Gesamtfläche',
            berichte: 'Zeigt hochwertige römische Handwerkskunst mit typischen geometrischen Mustern der Kaiserzeit. Vergleichsfunde: Bad Kreuznach, Nennig.'
        },
        {
            titel: 'VR-NUM-002: Hadrianischer Sestertius "Providentia Augusti" (AE, Rom)',
            beschreibung: 'Römische Bronzemünze (Sestertius) aus der Regierungszeit Kaiser Hadrians. Avers: HADRIANVS AVG COS III P P mit Büste nach rechts, Lorbeerkranz. Revers: PROVIDENTIA AVG S C, Providentia stehend mit Globus und Kornähre. Prägestätte: Rom, ca. 119-138 n.Chr. Gewicht: 23,8g, Durchmesser: 33mm. Erhaltung: F-VF (fine to very fine) mit grünlicher Kupferoxid-Patina.',
            kategorie: 'gefaesse',
            fundort: 'Haupthalle (Atrium), SW-Ecke nahe Impluvium, Quadrat C3',
            datierung: '119-138 n. Chr. (Regierung Hadrian, mittlere Kaiserzeit)',
            material: 'Bronze (Orichalcum-Buntmetall), Kupferoxidpatina',
            zustand: 'Oxidiert, Prägebild gut lesbar, Randausbruch',
            berichte: 'Wichtiger numismatischer Fund zur präzisen Datierung der Villa-Nutzungsphase II. Korreliert mit keramischem Fundmaterial.'
        },
        {
            titel: 'VR-SIG-003: Terra Sigillata Drag. 37 mit Reliefdekor und Töpferstempel',
            beschreibung: 'Reliefverzierte Terra Sigillata Schüssel der Form Dragendorff 37 aus südgallischer Produktion (La Graufesenque). Charakteristischer roter hochglänzender Überzug, Dekor zeigt Jagdszene (Hirsch, Hund) gerahmt von Eierstabfries. Bodenstempel (fragmentiert): "[...]CINTVS" (Töpfer Iracintus). Randfragment, rekonstruierter Durchmesser: ca. 23 cm. Typisch flavisch-trajanisch.',
            kategorie: 'gefaesse',
            fundort: 'Speisezimmer (Triclinium), über Mosaikfläche, Quadrat C4',
            datierung: '1.-2. Jahrhundert n. Chr. (80-120, flavisch-trajanisch)',
            material: 'Keramik (Terra Sigillata, feinster oxidierend gebrannter Ton)',
            zustand: 'Fragmentarisch erhalten (ca. 40%), teilweise rekonstruierbar',
            berichte: 'Typische römische Feinkeramik aus südgallischen Manufakturen. Importware belegt überregionalen Fernhandel. Vergleiche: Hofheim, Saalburg.'
        },
        {
            titel: 'VR-FER-004: Konvolut römischer Zimmermannsnägel (Clavi) - 23 Exemplare',
            beschreibung: 'Sammlung von geschmiedeten Konstruktionsnägeln verschiedener Größentypen. Typ A mit Pyramidenkopf: 18 Ex., L: 8,5-13,8 cm. Typ B mit T-Kopf: 5 Ex., L: 6,2-9,1 cm. Schaftquerschnitt vierkantig. Eisennägel und Türbeschläge mit starker Oxidation, ursprüngliche Formen aber rekonstruierbar. Beifunde: Holzkohlereste (Eiche).',
            kategorie: 'werkzeuge',
            fundort: 'Verschiedene Räume, Verfüllschichten, Quadrat B3-D5',
            datierung: '2. Jahrhundert n. Chr. (kaiserzeitlich)',
            material: 'Geschmiedetes Eisen, Eisenoxidschicht (Rost)',
            zustand: 'Stark korrodiert, typologisch klassifizierbar',
            berichte: 'Dokumentiert römische Bautechniken und Zimmermannshandwerk. Größenklassifizierung nach Manning (1985). Vergleiche: Saalburg, Vindonissa.'
        },
        {
            titel: 'VR-VITR-005: Kobaltblaue Glasperle und Fensterglas-Ensemble',
            beschreibung: 'Ensemble bestehend aus einer bikonischen kobaltblauen Glasperle (∅ 1,3 cm, L: 0,9 cm, durchbohrt) sowie 9 Fragmenten von grünlichem Fensterglas (Dicke: 2-4mm). Glasperle: Fadentechnik. Fensterglas: gegossen, eine Seite glatt poliert, Rückseite rau (Sandabdruck). Typisch für gehobene römische Wohnkultur mit Fensterverglasung.',
            kategorie: 'sonstiges',
            fundort: 'Wohnbereich (Cubiculum), Ostflügel, Quadrat E2',
            datierung: '2. Jahrhundert n. Chr. (mittlere Kaiserzeit)',
            material: 'Soda-Kalk-Glas, Kobaltpigment (Perle), Fensterglas',
            zustand: 'Perle: vollständig; Fensterglas: fragmentarisch',
            berichte: 'Luxusgüter belegen hohen Wohlstand und sozialen Status der Villa-Bewohner. Fensterverglasung war Privileg der Oberschicht.'
        }
    ],
    'Keltische Siedlung': [
        {
            titel: 'KEL-WAF-001: Latènezeitliches Langschwert Typ Gündlingen mit Bronzescheide',
            beschreibung: 'Außergewöhnlich gut erhaltenes eisernes Langschwert vom Typ Gündlingen (klassische Variante) mit verziertem Bronzegriff im keltischen Latènestil. Klinge zweischneidig, parallele Schneiden, L: 76 cm, B: 4,8 cm. Organische Griffangel mit mineralisierten Holzresten. Schwertscheide mit durchbrochenen Bronzeblechbeschlägen, Frühlatèneornamentik. Aus Kriegergrab mit vollständiger Waffenausstattung.',
            kategorie: 'werkzeuge',
            fundort: 'Grubenbau westlich der Siedlung (Waffengrab 12), Quadrat A1',
            datierung: '5. Jahrhundert v. Chr. (Frühlatène LT A-B)',
            material: 'Geschmiedetes Eisen, Bronzegriff und -scheide, Holz',
            zustand: 'Hervorragend erhalten, minimale Korrosion',
            berichte: 'Seltenes Exemplar einer keltischen Elitekrieger-Prestigewaffe, deutet auf hochrangige Persönlichkeit hin. Vergleiche: Glauberg, Hochdorf.'
        },
        {
            titel: 'KEL-CER-002: Hallstattzeitliche Vorratsgefäße mit Kammstrichdekor - 6 Fragmente',
            beschreibung: 'Konvolut von 6 großen Fragmenten handgeformter Vorratskrüge mit charakteristischen horizontalen und wellenförmigen Kammstrichmustern. Randformen ausbiegend, betonter Halsansatz. Grobkeramik mit Quarz-Schamotte-Magerung. Rekonstruierte H: 34-38 cm, Maulweite: 19-23 cm. Typische eisenzeitliche Haushalts- und Wirtschaftskeramik der Hallstatt-D-Kultur.',
            kategorie: 'gefaesse',
            fundort: 'Wohngebäude 3 (Pfostenbau), Vorratsgruben, Quadrat C2-C3',
            datierung: '6.-5. Jahrhundert v. Chr. (Späthallstatt Ha D)',
            material: 'Handgeformte Grobkeramik, grober Ton, reduzierend gebrannt',
            zustand: 'Mehrere größere Fragmente, 30-45% rekonstruierbar',
            berichte: 'Typische Alltagskeramik der keltischen Hauswirtschaft. Kammstrichdekor charakteristisch für regionale Töpfertraditionen. Funktional: Vorratshaltung.'
        },
        {
            titel: 'KEL-FIB-003: Ensemble bronzener Certosa-Fibeln und Gewandnadeln (7 St.)',
            beschreibung: 'Geschlossenes Ensemble mehrerer bronzener Trachtbestandteile: 5 einfache Schaftnadeln (L: 9-12 cm) und 2 zweigliedrige Bogenfibeln vom Certosa-Typ mit charakteristischem Fußknopf (L: 6,9 und 7,4 cm). Alle Objekte zeigen grüne Patina. Fundkontext: Körperbestattung (Frauengrab 14, adult). Lage im Grab: Brust-/Schulterbereich (Gewandverschlüsse).',
            kategorie: 'sonstiges',
            fundort: 'Gräberfeld Süd, Grab 14 (Frauenbestattung), Quadrat B4',
            datierung: '5. Jahrhundert v. Chr. (Späthallstatt bis Frühlatène)',
            material: 'Bronze (gegossen und geschmiedet), Kupferoxidpatina',
            zustand: 'Gut erhalten mit grüner Patina, Nadelspitzen teils abgebrochen',
            berichte: 'Persönliche Trachtbestandteile aus Frauenbestattung. Fibeln als Gewandverschlüsse (Peplos, Mantel). Typologisch: Übergangszeit.'
        },
        {
            titel: 'KEL-MOL-004: Sattelquern-Mühle aus Granit (komplett: Unterlieger + Läufer)',
            beschreibung: 'Vollständiger Satz einer Handgetreidemühle: Sattelquern (Unterlieger) mit konkaver Mahlfläche (L: 47 cm, B: 27 cm) und Handstein (Läuferstein, L: 31 cm, B: 17 cm, konvexe Unterseite). Material: feinkörniger Granit, nicht-lokaler Herkunft (wahrscheinlich Odenwald-Import). Mahlflächen zeigen intensive Abnutzungsspuren. Mikroskopische Getreidemehlreste nachweisbar (Emmer).',
            kategorie: 'werkzeuge',
            fundort: 'Speichergebäude (Magazin), Raum 2, Quadrat D3-D4',
            datierung: '6.-5. Jahrhundert v. Chr. (Hallstatt D)',
            material: 'Granit (feinkörnig, Odenwald-Provenienz)',
            zustand: 'Vollständig erhalten, funktionsfähig',
            berichte: 'Belegt lokale Getreideproduktion und Mehlherstellung. Sattelquern-Typ vor Einführung der Drehmühle. Experimentelle Rekonstruktion: 1,8 kg Mehl/Std.'
        },
        {
            titel: 'KEL-ORG-005: Baltische Bernsteinperle mit spiraliger Bronzedrahtfassung',
            beschreibung: 'Große ovale Bernsteinperle mit fein gearbeiteter Bronzedrahtfassung und integrierter Spiralöse zur Aufhängung. Bernstein: orangebraun transparent, L: 2,9 cm, Gewicht: 4,5g. FTIR-Analyse bestätigt: Baltischer Succinit (Ostseeküste). Fundkontext: Frauengrab 14, Position Halsbereich (Teil eines Colliers mit organischen Perlen, nicht erhalten). Fernhandelsindikator.',
            kategorie: 'sonstiges',
            fundort: 'Gräberfeld Süd, Grab 14, Quadrat B4',
            datierung: '5. Jahrhundert v. Chr. (Späthallstatt Ha D)',
            material: 'Baltischer Bernstein (Succinit), spiraliger Bronzedraht',
            zustand: 'Hervorragend erhalten, keine Verwitterung',
            berichte: 'Luxusobjekt, belegt weitreichende Handelsbeziehungen zur Ostsee (ca. 1000 km) via "Bernsteinstraße". Indikator hohen sozialen Status.'
        }
    ],
    'Mittelalterliches Kloster': [
        {
            titel: 'KLO-CER-001: Ottonischer Kugeltopf mit Kreuzstempel - Klosterkeramik',
            beschreibung: 'Fragmentarischer Steinzeugkrug in Kugeltopfform mit eingeprägten christologischen Kreuzsymbolen (drei Kreuze in Reihe, Rollstempeldekor). Form: bauchig, ausladender Rand, flacher Boden. H (rekons.): 18,5 cm, Maulweite: 15 cm. Sekundäre Rußspuren außen (Kochgeschirr). Grau reduzierend gebrannt. Typisch für ottonisch-frühsalische klösterliche Keramikproduktion.',
            kategorie: 'gefaesse',
            fundort: 'Kirchenraum (Seitenschiff Nord), Verfüllung, Quadrat E4-E5',
            datierung: '10.-11. Jahrhundert (ottonisch-frühsalisch)',
            material: 'Steinzeug, grau reduzierend gebrannt, Quarzmagerung',
            zustand: 'Fragmentarisch erhalten (55% rekonstruiert)',
            berichte: 'Religiöse Symbolik (Kreuze) deutet auf liturgische oder symbolische Verwendung im Klosterkontext hin. Möglicherweise Refektoriums-Geschirr.'
        },
        {
            titel: 'KLO-LIT-002: Romanisches Altarkreuz mit Christusfigur und Evangelistensymbolen',
            beschreibung: 'Gegossenes Bronzekreuz mit plastischer Christusfigur (Corpus Christi) im hochromanischen Stil. Kreuzbalken mit feinen floralen Ranken-Verzierungen (Akanthus) und Evangelistensymbolen in Medaillons an Kreuzenden (Tetramorphsymbole). Christus: thronend, lebend (nicht tot), Kreuznimbus. H: 43 cm, B: 29 cm, Gewicht: 1,9 kg. Feuervergoldung partiell erhalten, grünliche Patina.',
            kategorie: 'sonstiges',
            fundort: 'Altarbereich (Hauptchor, in situ Position), Quadrat E5',
            datierung: '10. Jahrhundert (hochottonisch, ca. 980-1020)',
            material: 'Bronze (Hohlguss-Technik), partielle Feuervergoldung',
            zustand: 'Gut erhalten mit schöner Patina, Vergoldung fragmentarisch',
            berichte: 'Wichtiges liturgisches Objekt (Altarkreuz oder Prozessionskreuz). Stilistische Parallelen: Reichenau, St. Gallen. Hochwertige Bronzeguss-Werkstatt.'
        },
        {
            titel: 'KLO-DEV-003: Konvolut von Pilgerabzeichen europäischer Wallfahrtsorte (14 St.)',
            beschreibung: 'Sammlung von 14 gegossenen Pilgerabzeichen und Wallfahrtsmedaillen verschiedener europäischer Pilgerzentren: Santiago de Compostela (Jakobsmuschel, 4 Ex.), Rom (Petrus-Schlüssel, 3 Ex.), Canterbury (Becket-Ampulle, 2 Ex.), Aachen (Mariensymbol, 3 Ex.), diverse (2 Ex.). Material: Zinn-Blei-Legierung. Größen: 2,6 - 5,1 cm. Mit Befestigungsösen zur Gewandanbringung.',
            kategorie: 'sonstiges',
            fundort: 'Verschiedene Bereiche im Kloster, verstreut, Quadrat D4-E5',
            datierung: '10.-13. Jahrhundert (hochmittelalterlich bis spätmittelalterlich)',
            material: 'Zinn-Blei-Legierung (gegossen)',
            zustand: 'Unterschiedlich erhalten, teils Bleikorrosion',
            berichte: 'Belegt intensive Pilgertätigkeit und überregionale, ja transeurop äische Verbindungen des Klosters. Kloster als Pilgerherberge. Jakobsweg-Route.'
        },
        {
            titel: 'KLO-ORG-004: Ensemble bearbeiteter Knochenwerkzeuge und Kompositkämme (10 St.)',
            beschreibung: 'Konvolut verschiedener aus Tierknochen gefertigter Werkzeuge und Toilettenartikel: 8 Werkzeuge (Ahlen, Glätter, Pfrieme aus Röhrenknochen) sowie 2 mehrteilige Beinkämme (Kompositkämme mit Eisennieten, doppelseitig grob/fein, L: 9,3 und 11,2 cm). Rohstoff: Rind- und Pferdeknochen. Herstellungsspuren sichtbar: Sägeschnitte, Bohrungen, Politur. Klösterliche Knochenverarbeitung.',
            kategorie: 'werkzeuge',
            fundort: 'Wohn- und Werkstattbereiche (Klausur Westflügel), Quadrat D3-E4',
            datierung: '10.-12. Jahrhundert (hochmittelalterlich)',
            material: 'Tierknochen (Rind, Pferd, Schaf), Eisennieten',
            zustand: 'Fragmentarisch bis gut erhalten, Gebrauchsspuren',
            berichte: 'Dokumentiert klösterliches Alltagsleben und Handwerkstraditionen. Knochenbearbeitung als Nebengewerbe. Kämme: Körperhygiene, Tonsur-Pflege.'
        },
        {
            titel: 'KLO-ANT-005: Körperbestattung Grab 47 - Anthropologische Analyse eines Mönchs',
            beschreibung: 'Skelettbestattung in gestreckter Rückenlage, kanonische West-Ost-Orientierung (Kopf im Westen, Blick gen Osten/Jerusalem), ohne Grabbeigaben (typisch für monastische Bestattungen nach Regula Benedicti). Individuum: adult-matur, männlich, Sterbealter: 45-55 Jahre. Statur: 167 cm. Paläopathologie: Arthrose (Wirbelsäule, Kniegelenke), verheilte Rippenfraktur, starker Zahnabrieb.',
            kategorie: 'organisch',
            fundort: 'Klosterfriedhof südlich der Kirche, Grab 47, Quadrat A5',
            datierung: '11. Jahrhundert (hochmittelalterlich, 14C: 960 ± 40 BP)',
            material: 'Menschliche Skelettreste (Knochen), Bestattungserde',
            zustand: 'Teilweise erhalten (ca. 70% Skelett), Erosion',
            berichte: 'Ermöglicht anthropologische und paläopathologische Untersuchungen zu Gesundheit, Ernährung (vegetarisch geprägt) und Lebensbedingungen im Kloster. Isotopendaten: lokale Herkunft.'
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
