/**
 * Create Test Projects Script
 * Erstellt Test-Projekte mit Funden für einen spezifischen Benutzer
 * User: sGsaBu2P3tVlUZOTBtc5H8e2Zc82
 */

import { auth, db } from './firebase-config.js';
import { collection, addDoc, writeBatch, doc, Timestamp, getDocs, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const TARGET_USER_ID = 'sGsaBu2P3tVlUZOTBtc5H8e2Zc82';
const USER_NAME = 'Test Archaeologist';
const MAX_PUBLIC_PROJECTS = 3;

async function getRemainingPublicProjectSlots() {
    const publicProjectsQuery = query(
        collection(db, 'projects'),
        where('visibility', '==', 'public')
    );
    const publicProjectsSnapshot = await getDocs(publicProjectsQuery);
    const remaining = Math.max(0, MAX_PUBLIC_PROJECTS - publicProjectsSnapshot.size);
    return remaining;
}

// Test Projects Data
const TEST_PROJECTS = [
    {
        title: 'Villa Rustica Augusta - Rheinische Ausgrabung bei Colonia Claudia',
        name: 'Villa Rustica Augusta - Rheinische Ausgrabung bei Colonia Claudia',
        description: 'Systematische Freilegung einer hochrangigen römischen Landvilla mit polychromen Mosaikpavimenten und mehrphasiger Architekturentwicklung',
        description_long: 'Interdisziplinäre Ausgrabung einer römischen Villa rustica mit exzeptionell erhaltenen Mosaikböden aus dem 2.-3. Jahrhundert n. Chr. Die Anlage umfasst einen Haupttrakt (pars urbana) mit repräsentativen Wohnräumen, Thermenbereich und Wirtschaftsgebäude (pars rustica). Stratigraphische Analyse und Fundmaterial belegen eine kontinuierliche Besiedlung von der frühen bis späten Kaiserzeit. Das Anwesen diente vermutlich als landwirtschaftliches Zentrum eines wohlhabenden römischen Kaufmanns oder Veteranen.',
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
        title: 'Oppidum Taunodunum - Befestigte Späthallstatt-Siedlung',
        name: 'Oppidum Taunodunum - Befestigte Späthallstatt-Siedlung',
        description: 'Interdisziplinäre Untersuchung eines eisenzeitlichen Oppidums mit komplexer Befestigungsarchitektur, Handwerkerviertel und Fernhandelskontakten',
        description_long: 'Großflächige Ausgrabung einer eisenzeitlichen Höhensiedlung aus der späten Hallstatt- bis frühen Latènezeit (Ha D - LT A, ca. 5. Jh. v. Chr.). Die archäologische Stätte umfasst mehrphasige Befestigungsanlagen mit Murus Gallicus-Konstruktion, Wohnquartiere mit Pfostenhäusern, Speicherbauten und spezialisierte Handwerksbereiche. Fundmaterial aus mediterranem Import, lokaler Eisenverhüttung und Textilproduktion dokumentiert weitreichende Handelsnetzwerke und hochentwickelte keltische Gesellschaftsstrukturen. Geophysikalische Prospektion ergänzt die stratigraphischen Grabungen.',
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
        title: 'Benediktiner-Abtei St. Emmeram - Hochmittelalterliche Klosteranlage',
        name: 'Benediktiner-Abtei St. Emmeram - Hochmittelalterliche Klosteranlage',
        description: 'Archäologische Freilegung einer ottonisch-salischen Klosteranlage mit romanischer Klosterkirche, Klausur und Sepulkralbereich',
        description_long: 'Multidisziplinäre archäologische Untersuchung einer bedeutenden benediktinischen Klosteranlage des 10.-13. Jahrhunderts. Die Befundlage dokumentiert eine dreischiffige romanische Basilika mit Krypta, vollständig erhaltene Klausurgebäude nach der Regula Benedicti, Kreuzgang, Skriptorium und einen ausgedehnten Klosterfriedhof mit über 200 Bestattungen. Fundmaterial umfasst liturgische Geräte, illuminierte Handschriftenfragmente, Import-Keramik und bio-archäologisches Material. Anthropologische und paläopathologische Analysen der Skelettfunde erlauben Rückschlüsse auf Ernährung, Gesundheit und Lebensbedingungen der monastischen Gemeinschaft.',
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
            name: 'VRA-MOS-001: Schwarz-Weißes Tessellat-Fragment mit Mäanderborte',
            type: 'Mosaikpaviment/Architekturdekor',
            description: 'Fragment eines opus tessellatum Mosaikbodens in schwarz-weißer Bichromie. Erhaltene Fläche zeigt geometrisches Grundmuster mit umlaufender Mäanderborte (laufender Hund). Tesserae: Kalkstein (weiß) und Schiefer (schwarz), Größe: 0,8-1,2 cm. Fragment: 28 x 34 cm. Fixiermörtel: römischer Estrich mit Ziegelsplitt. Typisch für kaiserzeitliche Villen-Repräsentationsräume.',
            category: 'Decoration',
            location_found: 'Triclinium (Speisesaal), Nordflügel',
            depth: '0.85m',
            grid_square: 'D4',
            dating: 'Mittlere Kaiserzeit: 120-180 n. Chr.',
            material: 'Tessellae (Kalkstein/Schiefer), Kalkmörtel',
            condition: 'Gut erhalten, 12% der Gesamtfläche',
            significance: 'Hoch - Datierung und Raumfunktion',
            notes: 'Zeigt hochwertige römische Handwerkskunst mit standardisierten geometrischen Mustern der Kaiserzeit. Vergleichsfunde: Villa von Bad Kreuznach.',
            tags: ['Mosaik', 'Römisch', 'Architekturdekor', 'Tessellat'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'VRA-NUM-002: Sestertius des Hadrian mit Providentia-Revers (AE)',
            type: 'Münze/Numismatik',
            description: 'Bronzesesterz (AE) aus der Regierungszeit Hadrians. Avers: HADRIANVS AVG COS III P P mit Porträt nach rechts, Lorbeerkranz. Revers: PROVIDENTIA AVG, Providentia stehend mit Globus und Kornähre. Prägestätte: Rom. Gewicht: 24,1g, Durchmesser: 32mm. Erhaltung: F (fine), grünliche Patina, leichte Prägeschwäche am Rand.',
            category: 'Numismatics',
            location_found: 'Atrium, SW-Ecke nahe Impluvium',
            depth: '0.62m',
            grid_square: 'C3',
            dating: '119-138 n. Chr. (Regierungszeit Hadrian)',
            material: 'Bronze (Orichalcum-Legierung), Kupferoxidpatina',
            condition: 'Oxidiert, Prägebild gut lesbar',
            significance: 'Mittel-Hoch - Chronologischer Marker',
            notes: 'Wichtiger Münzfund zur präzisen Datierung der Nutzungsphase II der Villa. Korreliert mit keramischem Fundmaterial aus derselben Schicht.',
            tags: ['Münze', 'Hadrian', 'Numismatik', 'Bronze'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'VRA-CER-003: Reliefverzierte Terra Sigillata Drag. 37 mit Jagdszene',
            type: 'Keramik/Feinware',
            description: 'Fragmentierte Schüssel der Form Dragendorff 37 in Terra Sigillata-Technik. Reliefdekor zeigt Jagdszene: Hirsch verfolgt von Hund, gerahmt von Eierstabfries. Töpferstempel auf Boden (fragmentarisch): "[...]CINT[...]" (wahrscheinlich Iracintus). Randfragment mit rekonstruierbarem Durchmesser: 24 cm. Südgallische Produktion (La Graufesenque).',
            category: 'Pottery',
            location_found: 'Triclinium, Bodenschicht über Mosaik',
            depth: '0.58m',
            grid_square: 'C4',
            dating: 'Spätes 1. - frühes 2. Jahrhundert n.Chr. (80-120)',
            material: 'Terra Sigillata (oxidierend gebrannter Feinton)',
            condition: 'Fragmentarisch (45% erhalten), rekonstruierbar',
            significance: 'Hoch - Import-Keramik, Datierung',
            notes: 'Typische römische Feinkeramik aus südgallischen Manufakturen. Importware belegt überregionalen Handel. Dekorstil: frühflavisch.',
            tags: ['Sigillata', 'Keramik', 'Drag. 37', 'Gallien'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'VRA-FER-004: Ensemble römischer Zimmermannsnägel (Clavi) - 23 Exemplare',
            type: 'Metall/Baumaterial',
            description: 'Konvolut von 23 geschmiedeten eisernen Konstruktionsnägeln verschiedener Größenklassen. Typ A (Pyramidenkopf): 18 Ex., L: 8-14 cm. Typ B (T-Kopf): 5 Ex., L: 6-9 cm. Schaftquerschnitt: vierkantig. Starke Korrosion mit Eisenoxidschicht, ursprüngliche Formen gut rekennbar. Beifunde: Holzkohlereste (Eichenbohlen).',
            category: 'Metal Objects',
            location_found: 'Verschiedene Räume, Verfüllschichten',
            depth: '0.70m - 1.20m',
            grid_square: 'B3, C4, D5',
            dating: '1. - 3. Jahrhundert n. Chr.',
            material: 'Geschmiedetes Eisen, Eisenoxid-Korrosionsschicht',
            condition: 'Stark korrodiert, typologisch bestimmbar',
            significance: 'Mittel - Konstruktionstechnik',
            notes: 'Dokumentiert römische Bautechniken und standardisierte Zimmermannsarbeiten. Größenklassifizierung nach Manning (1985). Sekundär verlagert durch Gebäudeeinsturz.',
            tags: ['Eisen', 'Nägel', 'Konstruktion', 'Baumaterial'],
            latitude: 50.9375,
            longitude: 6.9603
        },
        {
            name: 'VRA-VITR-005: Blaue Glasperle und Fensterglasfragmente aus Villenkontext',
            type: 'Glas/Luxusgut',
            description: 'Ensemble aus einer kobaltblauen bikonischen Glasperle (D: 1,2 cm, L: 0,8 cm) und 7 Fragmenten von grünlichem Fensterglas (Dicke: 2-4mm). Glasperle: durchbohrt, Fadentechnik. Fensterglas: gegossen, eine Seite glatt, Rückseite rau (Sandabdruck). Typisch für gehobene römische Wohnkultur mit verglasten Fenstern.',
            category: 'Glass & Jewelry',
            location_found: 'Cubiculum (Schlafraum), Ostflügel',
            depth: '0.75m',
            grid_square: 'E2',
            dating: 'Mittlere Kaiserzeit: 150-220 n. Chr.',
            material: 'Soda-Kalk-Glas, Kobaltpigment (Perle)',
            condition: 'Perle: vollständig; Fensterglas: fragmentarisch',
            significance: 'Hoch - Luxusausstattung, sozialer Status',
            notes: 'Luxusgüter belegen den hohen Wohlstand und sozialen Status der Villa-Bewohner. Fensterverglasung in Wohnräumen war Privileg der Oberschicht.',
            tags: ['Glas', 'Schmuck', 'Luxus', 'Fenster'],
            latitude: 50.9375,
            longitude: 6.9603
        }
    ],
    1: [ // Keltische Siedlung
        {
            name: 'TAU-WAF-001: Latènezeitliches Langschwert Typ Gündlingen mit Schwertscheide',
            type: 'Waffe/Kriegsgerät',
            description: 'Außergewöhnlich gut erhaltenes eisernes Langschwert vom Typ Gündlingen (Variante B nach De Navarro). Klinge: zweischneidig, parallele Schneiden mit leichter Verjüngung zur Spitze, L: 74 cm, B: 4,6 cm. Griff: organische Angel mit mineralisierten Holzresten (xylologisch: Esche). Bronzener Knaufabschluss mit Ringöse. Schwertscheide mit durchbrochenen Bronzeblechbeschlägen im Frühlatènestil.',
            category: 'Weapons',
            location_found: 'Waffengrab, Grubenbau westl. Siedlungsrand',
            depth: '1.35m',
            grid_square: 'A1',
            dating: 'Frühlatènezeit (LT A-B): 450-350 v. Chr.',
            material: 'Geschmiedetes Eisen, Bronzebeschläge, Holz',
            condition: 'Hervorragend erhalten, minimale Korrosion',
            significance: 'Sehr hoch - Elitekrieger-Bestattung',
            notes: 'Seltenes Exemplar einer keltischen Prestigewaffe. Grab enthielt weitere Waffenbeigaben (Lanze, Schild). Deutet auf hochrangige Krieger-Persönlichkeit hin.',
            tags: ['Schwert', 'Kelten', 'Hallstatt', 'Latène'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'TAU-CER-002: Vorratsgefäße mit Kammstrichverzierung - Hallstatt D',
            type: 'Keramik/Grobware',
            description: 'Konvolut von 6 Fragmenten handgeformter Vorratskrüge mit charakteristischen Kammstrichmustern. Randformen: ausbiegend, Halsansatz betont. Verzierung: horizontale und wellenförmige Kammstrichbänder. Magerung: grob (Quarz, Schamotte). H (rekonstruiert): 32-38 cm, Maulweite: 18-22 cm. Typische eisenzeitliche Haushaltskeramik der Hallstattkultur.',
            category: 'Pottery',
            location_found: 'Pfostenhaus 3, Vorratsgruben',
            depth: '0.92m',
            grid_square: 'C2-C3',
            dating: 'Späthallstattzeit (Ha D1-D3): 650-450 v. Chr.',
            material: 'Handgeformte Grobkeramik, reduzierend gebrannt',
            condition: 'Mehrere größere Fragmente, 25-40% rekonstruierbar',
            significance: 'Hoch - Alltags- und Wirtschaftskeramik',
            notes: 'Typische Alltagskeramik der keltischen Besiedlung. Kammstrich-Dekor charakteristisch für regionale Keramikproduktion. Funktional: Vorratskeramik für Getreide.',
            tags: ['Keramik', 'Kelten', 'Handwerk', 'Hallstatt'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'TAU-FIB-003: Bronzene Certosa-Fibeln und Gewandnadeln - Trachtbestandteile',
            type: 'Schmuck/Trachtzubehör',
            description: 'Ensemble aus 5 Bronzenadeln und 2 zweigliedrigen Fibeln vom Certosa-Typ. Fibeln: Bogenbügel mit Fußzier, L: 6,8 und 7,2 cm. Nadeln: einfache Schaftnadeln mit schwach profiliertem Kopf, L: 9-12 cm. Alle Objekte zeigen grüne Patina. Fundkontext: Körperbestattung (Grab 14, adulte Frau). Positionierung: Brustbereich und Schultern.',
            category: 'Jewelry & Clothing',
            location_found: 'Gräberfeld Süd, Grab 14',
            depth: '1.20m',
            grid_square: 'B4',
            dating: 'Späthallstatt/Frühlatène (Ha D3-LT A): 500-450 v. Chr.',
            material: 'Bronze (Guss und geschmiedet), Kupferoxidpatina',
            condition: 'Gut erhalten, Nadelspitzen teils fragmentiert',
            significance: 'Hoch - Trachtkunde, Geschlechtszuweisung',
            notes: 'Persönliche Trachtbestandteile aus Frauenbestattung. Fibeln dienten als Gewandverschlüsse (Peplos/Mantel). Typologisch: Übergangszeit Hallstatt-Latène.',
            tags: ['Bronze', 'Schmuck', 'Fibel', 'Tracht'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'TAU-MOL-004: Sattelquern aus Granit - Getreide-Mahlanlage vollständig',
            type: 'Werkzeug/Landwirtschaft',
            description: 'Vollständig erhaltener Satz einer Handgetreidemühle: Unterlieger (Sattelquern) und Läuferstein (Handstein). Unterlieger: L: 48 cm, B: 28 cm, konkave Mahlfläche. Läufer: L: 32 cm, B: 18 cm, konvexe Unterseite. Material: feinkörniger Granit (nicht-lokal, wahrscheinlich Import vom Odenwald). Mahlflächen zeigen deutliche Abnutzungsspuren. Getreidemehl-Residuen nachweisbar.',
            category: 'Household Objects',
            location_found: 'Speichergebäude, Raum 2',
            depth: '0.78m',
            grid_square: 'D3-D4',
            dating: 'Hallstatt D bis Latène A: 600-400 v. Chr.',
            material: 'Granit (feinkörnig, Odenwald-Provenienz)',
            condition: 'Vollständig erhalten, funktionsfähig',
            significance: 'Mittel - Wirtschaft und Ernährung',
            notes: 'Belegt lokale Getreideproduktion und Mehlherstellung. Sattelquern-Typ typisch für Eisenzeit vor Einführung der Drehmühle. Experimentalarchäologie: 2kg Mehl/Stunde.',
            tags: ['Werkzeug', 'Mühle', 'Landwirtschaft', 'Getreide'],
            latitude: 50.3667,
            longitude: 8.4333
        },
        {
            name: 'TAU-ORG-005: Baltische Bernsteinperle mit Bronzedrahtöse - Fernhandelsindikator',
            type: 'Schmuck/Luxusgut',
            description: 'Große ovale Bernsteinperle mit integrierter Bronzedrahtöse zur Aufhängung. Bernstein: durchscheinend, orangebraun, L: 2,8 cm, Gewicht: 4,2g. FTIR-Analyse: Baltischer Succinit (Bernstein von Ostseeküste). Drahtöse: Bronze, spiralförmig gewickelt. Fundkontext: Grab 14 (wie FIB-003), Position: Halsbereich. Teil eines Colliers mit weiteren organischen Perlen (nicht erhalten).',
            category: 'Jewelry & Luxury',
            location_found: 'Gräberfeld Süd, Grab 14',
            depth: '1.22m',
            grid_square: 'B4',
            dating: 'Späthallstatt (Ha D): 550-450 v. Chr.',
            material: 'Baltischer Bernstein (Succinit), Bronze',
            condition: 'Hervorragend, keine Verwitterung',
            significance: 'Sehr hoch - Fernhandel, sozialer Status',
            notes: 'Luxusobjekt, belegt weitreichende Handelskontakte zum Baltikum (ca. 1000 km Luftlinie). Bernsteinhandel über "Bernsteinstraße". Indikator für hohen sozialen Status der Bestatteten.',
            tags: ['Bernstein', 'Handel', 'Luxus', 'Baltikum'],
            latitude: 50.3667,
            longitude: 8.4333
        }
    ],
    2: [ // Mittelalterliches Kloster
        {
            name: 'SEM-CER-001: Kugeltopf mit Kreuzstempel - Hochmittelalterliche Klosterkeramik',
            type: 'Keramik/Gebrauchsware',
            description: 'Fragmentarischer Kugeltopf aus Steinzeugkeramik mit eingeprägten Kreuzsymbolen (christologische Ikonographie). Form: bauchig, ausladender Rand, flacher Boden. Rollstempel-Dekor am Schulterbereich: drei Kreuze in Reihe. H (rekons.): 19 cm, Maulweite: 15 cm. Sekundäre Rußspuren außen (Kochgeschirr). Typisch für klösterliche Keramikproduktion.',
            category: 'Pottery',
            location_found: 'Klosterkirche, Seitenschiff Nord',
            depth: '0.65m',
            grid_square: 'E4-E5',
            dating: 'Hochmittelalter (ottonisch): 950-1050 n. Chr.',
            material: 'Steinzeug, grau reduzierend gebrannt',
            condition: 'Fragmentarisch (60% rekonstruiert)',
            significance: 'Hoch - Klosterkontext, christliche Symbolik',
            notes: 'Religiöse Symbolik (Kreuze) deutet auf liturgische oder symbolische Verwendung im Klosterkontext hin. Möglicherweise gemeinschaftliches Essgeschirr des Refektoriums.',
            tags: ['Kloster', 'Keramik', 'Kreuz', 'Religion'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'SEM-LIT-002: Romanisches Altarkreuz aus Bronze mit Christusfigur',
            type: 'Liturgisches Gerät/Sakralgerät',
            description: 'Gegossenes Bronzekreuz mit plastischer Christusfigur (Corpus Christi) im romanischen Stil. Kreuzbalken mit floralen Ranken-Verzierungen und Medaillons an den Kreuzenden (Evangelistensymbole). Christus: thronend, lebend (nicht tot), Nimbus mit Kreuznimbus. H: 42 cm, B: 28 cm, Gewicht: 1,8 kg. Grüne Patina, teilweise Feuervergoldung erhalten. Giessereikern noch in Hohlform.',
            category: 'Religious Objects',
            location_found: 'Altarbereich, Hauptchor',
            depth: '0.45m',
            grid_square: 'E5',
            dating: 'Hochromanik (salisch): 1020-1080 n. Chr.',
            material: 'Bronze (Hohlguss), Feuervergoldung (partiell)',
            condition: 'Gut erhalten, Patina, Vergoldung fragmentarisch',
            significance: 'Sehr hoch - Liturgie, Kunstgeschichte',
            notes: 'Wichtiges liturgisches Artefakt, möglicherweise Prozessionskreuz oder Altaraufsatz. Stilistische Parallelen: Reichenau, St. Gallen. Hochwertige Bronzeguss-Technik.',
            tags: ['Kreuz', 'Liturgie', 'Bronze', 'Romanik'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'SEM-NUM-003: Ensemble von Pilgerabzeichen und Wallfahrtsmedaillen (12 St.)',
            type: 'Devotionalien/Pilgerinsignien',
            description: 'Konvolut von 12 Pilgerabzeichen verschiedener europäischer Wallfahrtsorte: Santiago de Compostela (Jakobsmuschel), Rom (Petrus-Schlüssel), Canterbury, Aachen. Material: Zinn-Blei-Legierung, gegossen. Größen: 2,5 - 4,8 cm. Befestigungsösen erhalten. Ikonographie: religiöse Symbole, Heiligenfiguren. Fundkontext: verstreut in Klosterbereich.',
            category: 'Numismatics & Devotionalia',
            location_found: 'Verschiedene Bereiche im Klosterareal',
            depth: '0.50m - 1.00m',
            grid_square: 'D4, D5, E5',
            dating: 'Hochmittelalter bis Spätmittelalter: 1050-1300 n. Chr.',
            material: 'Zinn-Blei-Legierung (gegossen)',
            condition: 'Unterschiedlich, teils korrodiert',
            significance: 'Hoch - Wallfahrtswesen, internationale Kontakte',
            notes: 'Belegt intensive Pilgertätigkeit und überregionale, ja internationale Verbindungen des Klosters. Kloster fungierte möglicherweise als Pilgerherberge auf Fernpilgerrouten.',
            tags: ['Pilger', 'Abzeichen', 'Wallfahrt', 'Santiago'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'SEM-ORG-004: Knochenwerkzeuge und mehrteilige Beinkämme - Klosterhandwerk',
            type: 'Werkzeug/Alltagsgegenstände',
            description: 'Ensemble aus 8 bearbeiteten Knochenwerkzeugen und 2 mehrreihigen Beinkämmen. Werkzeuge: Ahlen, Glätter, Pfrieme aus Röhrenknochen (Rind/Schaf). Kämme: Kompositkämme mit Eisennieten, doppelseitig (grob/fein), L: 9 und 11 cm. Rohstoff: Rind- und Pferdeknochen. Herstellungsspuren: Sägeschnitte, Bohrungen, Politur. Hinweis auf klösterliche Knochenverarbeitung (Werkstatt).',
            category: 'Bone Objects',
            location_found: 'Wirtschaftsgebäude (Klausur Westflügel)',
            depth: '0.70m - 0.95m',
            grid_square: 'D3, E4',
            dating: 'Hochmittelalter: 1000-1200 n. Chr.',
            material: 'Tierknochen (Rind, Pferd, Schaf), Eisen (Nieten)',
            condition: 'Fragmentarisch bis gut erhalten',
            significance: 'Mittel - Handwerk, Alltagsleben',
            notes: 'Dokumentiert klösterliches Alltagsleben und Handwerkstraditionen. Knochenbearbeitung als Nebengewerbe. Kämme: Körperpflege, möglicherweise auch liturgische Funktion (Tonsur).',
            tags: ['Knochen', 'Werkzeug', 'Kamm', 'Handwerk'],
            latitude: 47.5333,
            longitude: 10.2667
        },
        {
            name: 'SEM-ANT-005: Körperbestattung Grab 47 mit Skelettanalyse - Mönch, ca. 45-55 Jahre',
            type: 'Anthropologisches Material',
            description: 'Skelettbestattung in gestreckter Rückenlage, West-Ost-Orientierung (Kopf im Westen, Blick nach Osten), ohne Grabbeigaben (charakteristisch für Mönchsbestattungen). Individuum: adult-matur, männlich, 45-55 Jahre (Zahnabrasion, Cranialnahtverknöcherung). Statur: 168 cm. Paläopathologie: Arthrose (Wirbelsäule, Knie), verheilte Rippenfraktur. Zahnstatus: starker Abrieb, Karies. Ernährungsrekonstruktion: Stickstoffisotopenanalyse.',
            category: 'Human Remains',
            location_found: 'Klosterfriedhof südlich der Kirche',
            depth: '1.10m',
            grid_square: 'A5',
            dating: 'Hochmittelalter: 1050-1150 n. Chr. (14C: 960 ± 40 BP)',
            material: 'Menschliche Skelettreste (Knochen), Bestattungserde',
            condition: 'Teilweise erhalten (70% Skelett), Erosionsspuren',
            significance: 'Hoch - Paläopathologie, Bioarchäologie',
            notes: 'Ermöglicht Untersuchungen zu Gesundheit, Ernährung (vegetarisch geprägt) und Lebensbedingungen der monastischen Gemeinschaft. Isotopendaten: lokale Herkunft. Arthrose: körperliche Arbeit.',
            tags: ['Anthropologie', 'Skelett', 'Mönch', 'Paläopathologie'],
            latitude: 47.5333,
            longitude: 10.2667
        }
    ]
};
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

        const remainingSlots = await getRemainingPublicProjectSlots();
        if (remainingSlots <= 0) {
            console.log(`ℹ️ Public-Limit (${MAX_PUBLIC_PROJECTS}) erreicht, keine neuen Test-Projekte erstellt.`);
            return [];
        }

        const projectsToCreate = TEST_PROJECTS.slice(0, remainingSlots);
        
        const projectIds = [];

        // 1. Erstelle Projekte
        for (let i = 0; i < projectsToCreate.length; i++) {
            const projectData = projectsToCreate[i];
            
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
            console.log(`✅ Projekt erstellt (${i + 1}/${projectsToCreate.length}): ${projectData.title} (${projectRef.id})`);
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
