/**
 * Test User Setup Script
 * Erstellt Test-Projekte für einen spezifischen Benutzer
 */

import { firebaseService } from './firebase-service.js';
import { auth, db } from './firebase-config.js';
import { collection, addDoc, writeBatch, doc, Timestamp, getDocs, query, where, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

// Tristancoutant User ID
const TRISTANCOUTANT_USER_ID = 'sGsaBu2P3tVlUZOTBtc5H8e2Zc82';
const KOUMASA_DATASET_KEY = 'koumasa-2023-trench-16';
const MAX_PUBLIC_PROJECTS = 3;
let demoAutoInitListenerRegistered = false;

async function getRemainingPublicProjectSlots() {
    const publicProjectsQuery = query(
        collection(db, 'projects'),
        where('visibility', '==', 'public')
    );
    const publicProjectsSnapshot = await getDocs(publicProjectsQuery);
    return Math.max(0, MAX_PUBLIC_PROJECTS - publicProjectsSnapshot.size);
}

const KOUMASA_PHOTOS = [
    '11139', '11140', '11141', '11142', '11143', '11144', '11145', '11146',
    '11168', '11169', '11170', '11171', '11172', '11173', '11174', '11175',
    '11176', '11177', '11187', '11188', '11189', 'DF0060', 'DF0061', 'DF0062',
    'DF0063', 'DF0064'
];

const KOUMASA_SKETCHES = [
    'Sketch 1: Fragmented conical cup 2023-16-115-C03',
    'Sketch 2: Fragmented possible bowl 2023-16-115-C02',
    'Sketch 3: Fragmented conical cup 2023-16-115-C05',
    'Sketch 4: Fragmented conical cup 2023-16-115-C04'
];

const KOUMASA_MEDIA_FILES = [
    'image.png',
    'image copy.png',
    'image copy 2.png',
    'image copy 3.png',
    'image copy 4.png',
    'image copy 5.png',
    'image copy 6.png',
    'image copy 7.png',
    'image copy 8.png',
    'image copy 9.png',
    'image copy 10.png',
    'image copy 11.png',
    'image copy 12.png'
];

/**
 * Erstelle Test-Projekte für einen Benutzer
 */
async function createTestProjectsForUser(userId, userName) {
    try {
        console.log(`Erstelle Test-Projekte für Benutzer: ${userName}`);

        const remainingSlots = await getRemainingPublicProjectSlots();
        if (remainingSlots <= 0) {
            console.log(`ℹ️ Public-Limit (${MAX_PUBLIC_PROJECTS}) erreicht, keine neuen Test-Projekte erstellt.`);
            return true;
        }

        const testProjects = [
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

        const projectsToCreate = testProjects.slice(0, remainingSlots);

        const batch = writeBatch(db);
        let projectCount = 0;

        for (const projectData of projectsToCreate) {
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
                name: 'TSS-001: Denarius des Divus Augustus - Silbermünze postum geprägt',
                category: 'Münzen & Währung',
                period: 'Römisch - Frühe Kaiserzeit',
                material: 'Silber (AR), 3.2g',
                description: 'Posthum geprägter Silber-Denar des vergöttlichten Augustus. Avers: DIVVS AVGVSTVS PATER mit Kopf nach rechts. Revers: Providentia-Sitzend mit Globus und Zepter. Prägeort wahrscheinlich Rom, unter Tiberius (14-37 n.Chr.). Erhaltung: VF (very fine), leichte Prägeschwäche am Rand. Fund-Nr. Mü-2024-VR-001.',
                discoverer: 'Dr. Hans Mueller',
                dateFound: '2024-03-15'
            },
            {
                name: 'TSS-002: Terra Sigillata-Schale Drag. 37 mit Eierstabdekor',
                category: 'Keramik',
                period: 'Römisch - Mittlere Kaiserzeit',
                material: 'Keramik (Terra Sigillata), feiner roter Ton',
                description: 'Reliefverzierte Schüssel der Form Dragendorff 37 aus südgallischer Produktion (La Graufesenque). Dekor: Eierstab-Fries, Medaillons mit Tiermotiven (Hase, Hund). Töpferstempel: OF·CASTI (Officina Castiani). Datierung: ca. 70-110 n.Chr. Fragment umfasst 40% des Gefäßrandes, rekonstruierbarer Randdurchmesser: 22cm. Fund-Nr. Mü-2024-VR-007.',
                discoverer: 'Dr. Sarah Wagner',
                dateFound: '2024-03-18'
            },
            {
                name: 'TSS-003: Römische Bildlampe Typ Loeschcke VIII mit Gladiatorendarstellung',
                category: 'Artefakte',
                period: 'Römisch - Mittlere Kaiserzeit',
                material: 'Keramik (Firmalampe), Öl-Rußablagerungen',
                description: 'Vollständig erhaltene Bildlampe des Typs Loeschcke VIII mit Spiegel-Dekor: Gladiatorenkampfszene (Thraker vs. Murmillo). Diskus zeigt Kampfszene in hoher Detailgenauigkeit. Bodenmarke: FORTIS. Datierung: 2. Jh. n.Chr. Brandspuren am Schnauzenauslass belegen intensive Nutzung. Länge: 11,2 cm. Fund-Nr. Mü-2024-VR-012.',
                discoverer: 'Thomas Klein',
                dateFound: '2024-04-02'
            },
            {
                name: 'TSS-004: Goldener Siegelring mit Karneol-Gemme "Fortuna"',
                category: 'Schmuck & Verzierungen',
                period: 'Römisch - Mittlere Kaiserzeit',
                material: 'Gold (18K, 6.8g), Karneol-Intaglio',
                description: 'Exzeptionell erhaltener goldener Fingerring mit ovaler Karneol-Gemme. Intaglio zeigt Fortuna mit Füllhorn und Steuerruder (klassische Ikonographie). Ringschiene mit feiner Gravur: palmetten-Ornament. Innendurchmesser: 18mm (Größe 8). Vermutlich Eigentum einer hochrangigen Villen-Bewohnerin (matrona). Datierung: 2.-3. Jh. n.Chr. Fund-Nr. Mü-2024-VR-015.',
                discoverer: 'Dr. Hans Mueller',
                dateFound: '2024-04-10'
            }
        ];

        // Funde für Keltische Siedlung
        const celticSettlementFinds = [
            {
                name: 'TAU-001: Fibula vom Certosa-Typ mit Koralleneinlage - Späthallstattzeit',
                category: 'Schmuck & Verzierungen',
                period: 'Latène-Zeit / Späthallstatt (Ha D)',
                material: 'Bronze (Cu-Sn), Koralle (organisch)',
                description: 'Zweigliedrige Bogenfibel vom Certosa-Typ mit charakteristischem Fußknopf. Bügel verziert mit feiner Strichgruppen-Ornamentik und eingelassenen Korallenscheibchen (Mittelmeer-Import). L: 8,7 cm. Nadel fragmentarisch erhalten. Typologisch: Variante IIIa nach Mansfeld. Datierung: spätes 6. bis frühes 5. Jh. v. Chr. Fundkontext: Befestigungsgraben Schnitt 4, Planum 3. Fund-Nr. TAU-2024-073.',
                discoverer: 'Dr. Klaus Weber',
                dateFound: '2024-07-10'
            },
            {
                name: 'TAU-002: Paukenfibel mit polychromer Emaileinlage - Latènekunst',
                category: 'Schmuck & Verzierungen',
                period: 'Keltisch / Mittellatènezeit (LT C)',
                material: 'Bronze, Blechemail (Rot, Blau, Gelb)',
                description: 'Paukenfibel mit charakteristischer runder Paukenkopf-Form, verziert mit polychromer Zellenemail-Technik. Dekor zeigt geometrisches Muster aus Spiralen und Triskelen in rotem, blauem und gelbem Email. Nadel vollständig erhalten mit Spiralkonstruktion. L: 6,2 cm, Paukendurchmesser: 3,1 cm. Typologisch: Nauheimer Schema. Datierung: ca. 200-100 v. Chr. Prestigeobjekt der keltischen Oberschicht. Fund-Nr. TAU-2024-089.',
                discoverer: 'Prof. Andrea Schmidt',
                dateFound: '2024-06-22'
            },
            {
                name: 'TAU-003: Latènezeitliches Hiebschwert Typ Gündlingen mit Scheide',
                category: 'Waffen',
                period: 'Latène-Zeit (LT B-C)',
                material: 'Eisen (geschmiedet), Bronzebeschläge an Scheide',
                description: 'Außergewöhnlich gut erhaltenes eisernes Langschwert vom Typ Gündlingen mit zugehöriger Schwertscheide. Klinge: zweischneidig, parallele Schneiden, L: 82 cm, B: 4,8 cm. Organische Angel teilweise erhalten (Holzgriff mineralisiert). Scheide mit Bronzeblechbeschlägen, durchbrochene Ortbandverzierung mit Latenestil-Ranken. Kampfspuren an Schneide. Fundkontext: Grab eines Kriegers mit Waffenbeigaben (Grab 17, Hügel C). Datierung: 4. Jh. v. Chr. Fund-Nr. TAU-2024-112.',
                discoverer: 'Dr. Klaus Weber',
                dateFound: '2024-07-25'
            }
        ];

        // Funde für Mittelalterliches Kloster
        const monasteryFinds = [
            {
                name: 'SEM-001: Limoges-Gürtelschnalle mit Niellodekor - Ottonische Zeit',
                category: 'Metallgegenstände',
                period: 'Frühmittelalter / Ottonisch (10.-11. Jh.)',
                material: 'Bronze-Buntmetall, Niello-Einlage',
                description: 'Hochwertige Riemenzunge einer Gürtelgarnitur mit charakteristischer Niello-Tauschierung. Dekor zeigt christliches Kreuz-Motiv umgeben von geometrischen Flechtbandornamenten. Rückseitig zwei Nietlöcher zur Befestigung. L: 6,8 cm, B: 3,2 cm. Typologisch verwandt mit Limoges-Produktionen. Vermutlich Klerikerbesitz (Mönch oder Prior). Fundkontext: Klausur Ostflügel, Raum 4. Datierung: ca. 980-1050 n. Chr. Fund-Nr. SEM-2024-034.',
                discoverer: 'Dr. Josef Mueller',
                dateFound: '2024-05-03'
            },
            {
                name: 'SEM-002: Kugeltopf mit Rollstempeldekor - Hochmittelalterliche Gebrauchskeramik',
                category: 'Keramik',
                period: 'Hochmittelalter (12.-13. Jh.)',
                material: 'Graphittonkeramik, grau reduzierend gebrannt',
                description: 'Nahezu vollständig rekonstruierbarer Kugeltopf der hochmittelalterlichen Graphittonware. Grobkeramisches Kochgeschirr mit Rollstempelverzierung am Schulterbereich (Wellenlinienmuster). Rand ausladend, Boden leicht linsenförmig. H: 18,5 cm, Maulweite: 14 cm, größter Durchmesser: 19 cm. Sekundäre Brandspuren innen (Herdfeuer). Typische Klosterküchen-Keramik. Vergleichsfunde: Regensburg, Passau. Fund-Nr. SEM-2024-056.',
                discoverer: 'Prof. Maria Rossi',
                dateFound: '2024-06-15'
            },
            {
                name: 'SEM-003: Silberlöffel mit vergoldeter Laffe und Aposteldarstellung',
                category: 'Artefakte',
                period: 'Hochmittelalter (12. Jh.)',
                material: 'Silber (925er), Feuervergoldung',
                description: 'Hochwertig gearbeiteter liturgischer Löffel mit figürlich gegossenem Griff. Laffeninnenseite zeigt gravierte und teilvergoldete Apostelfigur (vermutlich Petrus mit Schlüssel). Stiel hexagonal facettiert mit Inschrift: "+SCS·PETRVS". L: 16,2 cm, Gewicht: 42g. Verwendung im Kloster bei Zeremonien oder im Refektorium der Äbte. Außergewöhnlich qualitätvolle Goldschmiedearbeit, möglicherweise Regensburger Werkstatt. Fund-Nr. SEM-2024-067.',
                discoverer: 'Markus Hoffmann',
                dateFound: '2024-05-20'
            },
            {
                name: 'SEM-004: Knochenflöte mit sechs Grifflöchern - Mittelalterliches Musikinstrument',
                category: 'Musikinstrumente',
                period: 'Hochmittelalter (11.-12. Jh.)',
                material: 'Tierknochen (Schaf/Ziege - Röhrenknochen)',
                description: 'Nahezu vollständig erhaltene End-geblasene Knochenflöte mit sechs ungleichmäßig gebohrten Grifflöchern. L: 14,7 cm, Durchmesser: 1,2-1,5 cm. Anblasloch leicht V-förmig zugeschnitten. Akustische Tests: pentatonische Tonleiter rekonstruierbar. Vermutlich genutzt in der Klosterschule zur musikalischen Unterweisung der Novizen oder im Rahmen der monastischen Freizeit (recreatio). Vergleichsfunde: Kloster Lorsch, St. Gallen. Fund-Nr. SEM-2024-082.',
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
                    name: 'EZ-001: Bernstein-Collier mit Bronzefibel - Hallstattzeitlicher Grabschmuck',
                    category: 'Schmuck & Verzierungen',
                    period: 'Eisenzeit / Frühe Hallstattzeit (Ha C)',
                    material: 'Baltischer Bernstein, Bronze, Textilreste mineralisiert',
                    description: 'Außergewöhnlich erhaltenes Schmuck-Ensemble aus 47 Bernsteinperlen (diskoid und bikonisch), arrangiert als mehrreihiges Collier. Beigefügt eine bronzene Bogenfibel mit Spiralscheiben-Konstruktion als Verschluss. Perlendurchmesser: 0,8-2,1 cm. Bernstein-Provenienz: Baltikum (FTIR-Analyse: Baltischer Succinit). Textilabdrücke an Bronze: Köperbindung, Wolle. Fundkontext: Körpergrab einer adulten Frau (Grab 23). Datierung: 800-700 v. Chr. Belegt weitreichende Handelskontakte. Fund-Nr. EZ-2024-015.',
                    discoverer: 'Dr. Andrea Krause',
                    dateFound: '2024-08-10'
                },
                {
                    name: 'EZ-002: Situlen-Keramik mit graphitierter Oberfläche - Funeräres Gefäß',
                    category: 'Keramik',
                    period: 'Eisenzeit / Hallstatt D',
                    material: 'Feinkeramik mit Graphitüberzug, sekundärer Brand',
                    description: 'Nahezu vollständiges situlenförmiges Gefäß mit konischem Unterteil und zylindrischem Hals. Oberfläche mit hochglänzendem Graphitüberzug (graphitierte Keramik). Verzierung: umlaufende Rillenbänder am Hals und Schulter. H: 24,5 cm, Maulweite: 18 cm. Sekundäre Brandspuren (Leichenbrand-Brandtemperatur). Fundkontext: Urnenbestattung mit Beigaben (Grab 31). Inhalt: kalzinierte Knochenreste, Leichenbrand eines juvenilen Individuums. Datierung: 6. Jh. v. Chr. Fund-Nr. EZ-2024-027.',
                    discoverer: 'Prof. Werner Schmidt',
                    dateFound: '2024-08-22'
                },
                {
                    name: 'EZ-003: Tüllenbeil mit Ösenbefestigung - Landwirtschaftsgerät der Eisenzeit',
                    category: 'Werkzeuge',
                    period: 'Eisenzeit / Hallstatt',
                    material: 'Geschmiedetes Eisen, Holzspuren in Tülle',
                    description: 'Schmales Tüllenbeil mit rechteckigem Querschnitt und leicht geschwungener Schneide. Tülle zur Schaftaufnahme mit durchgehender Öse zur Querverstiftung. Schneide asymmetrisch geschärft (Rechtshänder-Werkzeug). L: 16,8 cm, Schneidenbreite: 7,2 cm, Gewicht: 485g. Holzreste in Tülle: Esche (xylologische Bestimmung). Funktion: Landwirtschaftliches Rodungswerkzeug (Hacke/Haue). Qualitätvolle Schmiedetechnik mit gehärteter Schneide. Datierung: 7.-6. Jh. v. Chr. Fund-Nr. EZ-2024-043.',
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

function buildKoumasaProject(userId, userName) {
    const koumasaReports = [
        {
            id: 'report-koumasa-overview',
            title: 'KOUMASA 2023 — Trench 16 (Tagesübersicht)',
            type: 'Tagesbericht',
            date: '2023-09-20',
            author: 'Elena Vasilopoulou',
            summary: 'Tagesübersicht mit Units 115/116/117, Stratigraphie, Volumina, Team und Kernbefunden.',
            content: [
                'Date: 20.09.2023',
                'Excavated Units: 115, 116, 117',
                'Area/Room: Room 1, Room 2',
                'Volume of sediment: Unit 115: 210 L; Unit 116: 150 L; Unit 117: 60 L',
                'Buckets: large 16L, small 12L',
                'Plan: Orthophoto',
                'Photos: 11139, 11140, 11141, 11142, 11143, 11144, 11145, 11146, 11168, 11169, 11170, 11171, 11172, 11173, 11174, 11175, 11176, 11177, 11187, 11188, 11189, DF0060, DF0061, DF0062, DF0063, DF0064',
                'Stratigraphy: Unit 115 N/NE of old Unit 64; Unit 116 underneath Unit 113; Unit 117 underneath Unit 115.',
                'Staff: Martin Kim, Gregor Staudacher, Elena Vasilopoulou',
                'Workers: Dimitris Tsiknakis, Giannis Tsiknakis, Nektarios Kadianakis, Lefteris Kavousanakis',
                'Written by: Elena Vasilopoulou',
                '',
                'At the beginning of the day drone photos were taken (Fig. 1, DF0063). Overviews of Unit 116 were documented (Figs. 2–3; 11139, 11140) and close-ups of the ashlar block with burnt clay (Figs. 4–5; 11141, 11143). Borders and initial depth were measured (B544–B549).',
                'Room naming was standardized: Walls 11/53/7/5 = Room 1, and the room to the W defined by Walls 6/α/γ/11 = Room 2.'
            ].join('\n'),
            createdAt: '2023-09-20T18:00:00.000Z'
        },
        {
            id: 'report-koumasa-unit-115',
            title: 'Unit 115 — Vollständiger Befundbericht',
            type: 'Befundbericht',
            date: '2023-09-20',
            author: 'Elena Vasilopoulou',
            summary: 'Ausgrabung in Room 1 mit sehr steifem Boden, zahlreichen Proben, 5 Gefäßen und Abschlussmessung B604.',
            content: [
                'The excavation of Unit 115 proceeded in Room 1. The unit is formed by very stiff soil.',
                'Finds: 2023-16-115-Pottery (mostly fine ware), 2023-16-115-SA02 (charcoal), 2023-16-115-SA04 (plaster), 2023-16-115-SA03 (plaster with red paint), 2023-16-115-Bones (animal bones).',
                'Samples: 2023-16-115-SS02 (charcoal area, measured B582 d. 418.835), 2023-16-115-SS05, 2023-16-115-SS03, 2023-16-115-SS04.',
                'Vessels (5 total; two inverted):',
                '- 2023-16-115-C06 conical cup (measured B566 d. 418.851), surrounding soil sample SS05 measured B567 d. 418.854',
                '- 2023-16-115-C02 possible bowl (measured B568 d. 418.828)',
                '- 2023-16-115-C03 (measured B583 d. 418.869)',
                '- 2023-16-115-C04 inverted conical cup (cup measured B564 d. 418.100; soil sample SS03 measured B585 d. 418.900)',
                '- 2023-16-115-C05 conical cup (cup measured B602 d. 418.830; surrounding soil SS04 measured B603 d. 418.826)',
                'Detailed photos: Figs. 6–8 (11169, 11171, 11176). Sketches: 1, 2, 3, 4.',
                'Unit was closed when a stone layer appeared. No dense stone concentration as in other parts of the room.',
                'Final depth: B604 d. 418.841. Final photo: Fig. 9 (11168).'
            ].join('\n'),
            createdAt: '2023-09-20T18:10:00.000Z'
        },
        {
            id: 'report-koumasa-unit-116',
            title: 'Unit 116 — Vollständiger Befundbericht',
            type: 'Befundbericht',
            date: '2023-09-20',
            author: 'Elena Vasilopoulou',
            summary: 'Unit 116 unterhalb Unit 113 (Room 2, Süd), mit Probenahmen, Ashlar-Block-Freilegung und Abschlussmessungen.',
            content: [
                'Unit 116 lies directly underneath Unit 113, in the S part of Room 2. The unit consists of very stiff soil.',
                'Finds: 2023-16-116-Pottery (few, mostly coarse ware), 2023-16-116-SA01 (charcoal), 2023-16-116-SA02 (plaster), 2023-16-116-SA04 (clay lump), 2023-16-116-Bones (animal bones), 2023-16-116-SA03 (charcoal near ashlar block).',
                'Samples/Measurements: 2023-16-116-SS01 (phytolith sample; B565 d. 419.098), 2023-16-116-Flotation 12 L, 2023-16-116-SS02 (charcoal area; B601 d. 419.096).',
                'Ashlar block was further revealed and appears to continue deeper.',
                'Final photos: Figs. 10–11 (11187, 11189).',
                'Final depths: B635 d. 419.239 (top of block), B636 d. 419.076 (middle).',
                'Unit closed for careful continuation into the next layer.'
            ].join('\n'),
            createdAt: '2023-09-20T18:20:00.000Z'
        },
        {
            id: 'report-koumasa-unit-117',
            title: 'Unit 117 — Vollständiger Befundbericht',
            type: 'Befundbericht',
            date: '2023-09-20',
            author: 'Elena Vasilopoulou',
            summary: 'Teilweise freigelegte Schicht unter Unit 115 (entspricht Unit 104) mit Grenzpunkten und Hauptfunden.',
            content: [
                'The layer beneath Unit 115 in Room 1 was excavated as Unit 117 (corresponding to Unit 104).',
                'Borders were defined and measured: B605 d. 418.863; B606 d. 418.831; B607 d. 418.833; B608 d. 418.853.',
                'Unit 117 was only partly excavated.',
                'Finds: 2023-16-117-Pottery, 2023-16-117-SA01 (charcoal), 2023-16-117-SA2 (plaster fragments with paint traces).'
            ].join('\n'),
            createdAt: '2023-09-20T18:30:00.000Z'
        },
        {
            id: 'report-koumasa-media-index',
            title: 'Foto- und Skizzenindex',
            type: 'Dokumentation',
            date: '2023-09-20',
            author: 'Elena Vasilopoulou',
            summary: 'Index der Figuren 1–12 sowie Sketches 1–4 gemäß Tagesdokumentation.',
            content: [
                'Fig. 1: Drone photo at the beginning of the day (DF0063)',
                'Fig. 2: Overview of the beginning of Unit 116, view from W (11139)',
                'Fig. 3: Overview of the beginning of Unit 116, view from N (11140)',
                'Fig. 4: Close-up ashlar block and burnt clay, view from SE (11141)',
                'Fig. 5: Close-up ashlar block and burnt clay, view from S (11143)',
                'Fig. 6: Close-up 2023-16-115-C01 and C03, view from SW',
                'Fig. 7: Close-up 2023-16-115-C04, view from NE',
                'Fig. 8: Close-up 2023-16-115-C05 with pottery sherds, view from SW',
                'Fig. 9: Overview of the end of Unit 115, view from SW (11168)',
                'Fig. 10: Overview of the end of Unit 116, view from S (11187)',
                'Fig. 11: Overview of the end of Unit 116, view from N (11189)',
                'Fig. 12: Orthophoto depicting the progress of the day (Orthophoto)',
                '',
                'Sketch 1: Fragmented conical cup 2023-16-115-C03',
                'Sketch 2: Fragmented possible bowl 2023-16-115-C02',
                'Sketch 3: Fragmented conical cup 2023-16-115-C05',
                'Sketch 4: Fragmented conical cup 2023-16-115-C04'
            ].join('\n'),
            createdAt: '2023-09-20T18:40:00.000Z'
        }
    ];

    const fullReport = [
        'KOUMASA 2023 — Trench 16',
        '',
        'KURZÜBERSICHT',
        '- Datum: 20.09.2023',
        '- Units: 115, 116, 117',
        '- Räume: Room 1, Room 2',
        '- Plan: Orthophoto',
        '- Sedimentvolumen: U115 210 L | U116 150 L | U117 60 L',
        '',
        'STRATIGRAPHIE',
        '- Unit 115: N und NE von alter Unit 64',
        '- Unit 116: unter Unit 113',
        '- Unit 117: unter Unit 115',
        '',
        'PERSONAL',
        '- Staff: Martin Kim, Gregor Staudacher, Elena Vasilopoulou',
        '- Workers: Dimitris Tsiknakis, Giannis Tsiknakis, Nektarios Kadianakis, Lefteris Kavousanakis',
        '- Bericht: Elena Vasilopoulou',
        '',
        'TAGESABLAUF',
        'Am Tagesbeginn wurden Drohnenaufnahmen und Übersichten zu Unit 116 erstellt. Zusätzlich wurden Detailfotos des Ashlar-Blocks mit gebranntem Lehm dokumentiert. Anschließend erfolgten Rand- und Tiefenmessungen.',
        '',
        'UNIT 115 (ROOM 1)',
        '- Sehr kompakter Boden',
        '- Funde: Pottery, SA02, SA04, SA03, Bones',
        '- Proben: SS02, SS03, SS04, SS05',
        '- Gefäße: C02, C03, C04, C05, C06',
        '- Messpunkte u. a.: B582, B567, B566, B568, B583, B585, B564, B602, B603, B604',
        '- Abschlussfoto: 11168; Details: 11169, 11171, 11176',
        '',
        'UNIT 116 (ROOM 2)',
        '- Lage: direkt unter Unit 113 (Sektor Süd)',
        '- Funde: Pottery, SA01, SA02, SA03, SA04, Bones',
        '- Proben: SS01 (Phytolith), SS02, Flotation 12 L',
        '- Messpunkte: B565, B601, B635, B636',
        '- Abschlussfotos: 11187, 11189',
        '',
        'UNIT 117 (ROOM 1)',
        '- Entspricht Unit 104; teilweise freigelegt',
        '- Grenzen: B605, B606, B607, B608',
        '- Funde: 2023-16-117-Pottery, SA01, SA2',
        '',
        'DOKUMENTATION',
        `- Fotos: ${KOUMASA_PHOTOS.join(', ')}`,
        `- Skizzen: ${KOUMASA_SKETCHES.join(' | ')}`
    ].join('\n');

    return {
        datasetKey: KOUMASA_DATASET_KEY,
        title: 'KOUMASA 2023 — Trench 16: Minoische Wohnkomplexe mit Mehrphasiger Stratigraphie',
        name: 'KOUMASA 2023 — Trench 16: Minoische Wohnkomplexe mit Mehrphasiger Stratigraphie',
        description: 'Feldkampagne 2023 - Großflächige Ausgrabung von zwei aneinander grenzenden minoischen Wohnräumen mit ausgezeichneter keramischer und faunistischer Erhaltung. Ausgrabung von Units 115/116/117 mit systematischer Dokumentation, Probennahme und hochauflösender Photogrammetrie.',
        description_long: fullReport,
        location: 'Koumasa, Kreta, Griechenland',
        region: 'Kreta',
        period: 'Bronzezeit / Minoisch (Feldkampagne 2023)',
        trench: 'Trench 16',
        areaRooms: ['Room 1', 'Room 2'],
        excavatedUnits: ['115', '116', '117'],
        workDate: '2023-09-20',
        sedimentVolumeLiters: {
            unit115: 210,
            unit116: 150,
            unit117: 60,
            bucketLarge: 16,
            bucketSmall: 12
        },
        plan: 'Orthophoto',
        profile: 'Nicht gesondert angegeben',
        photos: KOUMASA_PHOTOS,
        sketches: KOUMASA_SKETCHES,
        mediaBasePath: '../../partials/images/bilder/',
        mediaFiles: KOUMASA_MEDIA_FILES,
        mediaFilePattern: '{id}',
        mediaExtensions: ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'],
        reports: koumasaReports,
        stratigraphy: [
            'Unit 115: N und NE von old Unit 64',
            'Unit 116: Unterhalb von Unit 113',
            'Unit 117: Unterhalb von Unit 115'
        ],
        staff: ['Martin Kim', 'Gregor Staudacher', 'Elena Vasilopoulou'],
        workers: ['Dimitris Tsiknakis', 'Giannis Tsiknakis', 'Nektarios Kadianakis', 'Lefteris Kavousanakis'],
        writtenBy: 'Elena Vasilopoulou',
        startDate: '2023-09-20',
        endDate: '2023-09-20',
        status: 'Abgeschlossen',
        lead: 'Elena Vasilopoulou',
        creatorName: userName,
        team: ['Martin Kim', 'Gregor Staudacher', 'Elena Vasilopoulou', 'Dimitris Tsiknakis', 'Giannis Tsiknakis', 'Nektarios Kadianakis', 'Lefteris Kavousanakis'],
        institution: 'KOUMASA Field Team',
        principalInvestigator: 'Elena Vasilopoulou',
        budget: 'N/A',
        participants: '7',
        fundingSource: 'Field Campaign 2023',
        latitude: 35.045,
        longitude: 24.88,
        isPublic: true,
        visibility: 'public',
        findCount: 0,
        stars: 0,
        memberCount: 7,
        version: '1.0',
        userId,
        owner: userId,
        createdAt: Timestamp.fromDate(new Date('2023-09-20T12:00:00Z')),
        updatedAt: Timestamp.now()
    };
}

function buildKoumasaFinds(projectId, userId) {
    const bilderPath = '/partials/images/bilder/';
    const bilderImages = [
        'image.png',
        'image copy.png',
        'image copy 2.png',
        'image copy 3.png',
        'image copy 4.png',
        'image copy 5.png',
        'image copy 6.png',
        'image copy 7.png',
        'image copy 8.png',
        'image copy 9.png',
        'image copy 10.png',
        'image copy 11.png',
        'image copy 12.png'
    ];

    return [
        {
            title: 'KOU-2023-16-CER-001: Konischer Becher (TT-Form), LM IIIA/B, Unit 115/Room 1',
            name: 'KOU-2023-16-CER-001: Konischer Becher (TT-Form), LM IIIA/B, Unit 115/Room 1',
            category: 'Keramik - Trinkgefäße',
            kategorie: 'Keramik - Trinkgefäße',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Feinkeramik, reduzierend gebrannt, graugelber Ton',
            description: 'Konischer Becher (Fundnummer 2023-16-115-C06) aus Unit 115 in Room 1. Fundkontext: sehr kompaktes Sediment, direkt angrenzend an Probenentnahmepunkt SS05. Erhaltung: 65% des Gefäßes, Rand mit leichten Abplatzungen erhalten. Typologische Einordnung: TT-Becher nach Furumark (1941), charakteristisch für Spätminoische Haushaltskeramik. H (rekonstruiert): 8,5 cm, Maulweite: 7,2 cm, Wanddicke: 0,5-0,7 cm. Messpunkte: B566 (Gefäßoberkante d. 418.851), SS05 (Bodensediment d. 418.854).',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[0],
            photoRefs: ['11169', '11171', '11176'],
            sketchRefs: ['Sketch 1'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-CER-002: Schale (möglicherweise Einzug-Schale), LM IIIA/B, Unit 115/Room 1',
            name: 'KOU-2023-16-CER-002: Schale (möglicherweise Einzug-Schale), LM IIIA/B, Unit 115/Room 1',
            category: 'Keramik - Schüsseln und Schalen',
            kategorie: 'Keramik - Schüsseln und Schalen',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Feinkeramik, oxidierend gebrannt, weißgrauer Ton',
            description: 'Schale-Fragment (Fundnummer 2023-16-115-C02) aus Unit 115, Bereich mit hoher keramischer Fundkonzentration. Erhaltung: 40% des Gefäßes, Rand vollständig vorhanden. Typologische Einordnung: wahrscheinlich Einzug-Schale (kylix-ähnlich) nach Standardtypen. Charakteristisches Merkmal: nach innen eingezogener Rand, flacher Boden. H (rekonstruiert): 5,8 cm, Randdurchmesser: 12,5 cm, Wanddicke: 0,4-0,6 cm. Fundlage im Kontext von C03, C04, C05, C06 deutet auf gemeinschaftliche Essensituation hin. Messpunkt: B568 (d. 418.828).',
            discoverer: 'Gregor Staudacher',
            entdecker: 'Gregor Staudacher',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[1],
            photoRefs: ['11168', '11169'],
            sketchRefs: ['Sketch 2'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-CHR-003: Holzkohleprobe aus Brandschicht, Unit 115, C14-/Dendrochronologie-Analyse',
            name: 'KOU-2023-16-CHR-003: Holzkohleprobe aus Brandschicht, Unit 115, C14-/Dendrochronologie-Analyse',
            category: 'Probe - Radiokarbondatierung',
            kategorie: 'Probe - Radiokarbondatierung',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Holzkohle, verkohlte Holzreste',
            description: 'Archäobotanische Holzkohleprobe (SA02) aus intensiver Brandzone von Unit 115, explizit für C14-Datierung und Dendrostratigraphie entnommen. Kontextdokumentation: Messpunkt B582 mit absolute Höhe d. 418.835 (relative Tiefe unter Oberkante: 0,16 m). Probenvolumen: 150 mL Sediment mit hochkonzentrierten Holzkohlestücken (geschätzte Konzentration: >30%). Probennahme-Protokoll: Sterile Behälter, Isolierung vom Rest des Kontextes. Ziele der Analyse: 1) Präzise Chronologische Ankerung der Lebensphase Room 1, 2) Identifikation der verbrannten Holzarten (Clusteranalyse), 3) Dendrochronologische Sequenzierung falls mehrjährige Jahrringe erkennbar.',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B) - zu kalibrieren',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1, Brandzone',
            latitude: 35.0450,
            longitude: 24.8800,
            image: bilderPath + bilderImages[2],
            photoRefs: ['11141', '11143'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-ARC-004: Wandverputzfragment mit Rotmalerei (Ocker-/Eisenoxidpigment), Unit 115',
            name: 'KOU-2023-16-ARC-004: Wandverputzfragment mit Rotmalerei (Ocker-/Eisenoxidpigment), Unit 115',
            category: 'Architekturfund - Malerei/Dekor',
            kategorie: 'Architekturfund - Malerei/Dekor',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Verputz/Kalkputz mit Pigmentresten (Ocker, Eisenoxid), Gips-Komponenten',
            description: 'Verputzfragment mit erhaltenen roten Pigmentresten (SA03) aus Unit 115, dokumentiert Wandmalerei-Tradition minoischer Hausarchitektur. Dimension: 6,2 cm × 4,8 cm × 1,2 cm (Verputzdicke zur Mauer: 1,2 cm). Stratigraphie: Oberflächlicher Verputz mit applizierter roter Maltechnik. Pigmentanalyse (ausstehend): XRF-Spektroskopie zur Identifikation exakter Pigment-Zusammensetzung (wahrscheinlich natürlicher Ocker + Eisenoxid). Strukturelle Besonderheit: Kalkputz zeigt feine Kratzspur-Struktur (Untergrundvorbereitung), darauf aufgetragene rote Farbschicht. Interpretation: Fragment einer dekorativ bemalten Raumwand, möglicherweise aus Privatquartier (pars privata) der minoischen Wohneinheit. Konservierung: separate Verpackung zur Erhaltung der Pigmentriste für Laboranalytik.',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1, Südwand',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[3],
            photoRefs: ['11171', '11176'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-FAU-005: Tierknochenkonzentration aus Haushaltsdepot, Unit 116/Room 2, Zooarchäologische Analyse',
            name: 'KOU-2023-16-FAU-005: Tierknochenkonzentration aus Haushaltsdepot, Unit 116/Room 2, Zooarchäologische Analyse',
            category: 'Faunenrest - Knochenensemble',
            kategorie: 'Faunenrest - Knochenensemble',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Tierknochen und Knochenfragmente, vergesellschaftet mit Asche und Keramikdebris',
            description: 'Konzentration fragmentierter Tierknochen aus Unit 116 unmittelbar unter der Grenze von Unit 113 im südlichen Sektor von Room 2. Befundinterpretation: sekundär verlagertes Haushaltsdepot, wahrscheinlich aus Küchenaktivitäten stammend (Speiseabfall/Schlachtabfall). Fundkontext: Vergesellschaftung mit Holzkohle-Partikeln (SA01) und Keramik-Sherds deutet auf anthropogene Aufarbeitung hin. Knochenkonzentration erstreckt sich über ca. 0,35 m × 0,28 m Fläche. Höhenkote: Messpunkt B565 (d. 419.098), Flotation durchgeführt (12 Liter Sediment). Zooarchäologische Ziele: 1) Artbestimmung der Knochenfragmente (Rind, Schaf/Ziege, Schwein, Geflügel), 2) Altersanalyse (Epiphygenfusion), 3) Schlachtmuster-Analyse, 4) Ernährungsrekonstruktion. Knochenfragmentierungsgrad: hoch (deutet auf intensive Nahrungsvorbereitung / Knochenmark-Extraktion hin). Raubtierspuren: gering, anthropogene Schnittmarken präsent.',
            discoverer: 'Martin Kim',
            entdecker: 'Martin Kim',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 2, Trench 16',
            fundort: 'Unit 116, Room 2, südlicher Sektor (unter Unit 113)',
            latitude: 35.0449,
            longitude: 24.8798,
            image: bilderPath + bilderImages[4],
            photoRefs: ['11187', '11189'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-CER-006: Konischer Becher C03 (Unit 115), LM IIIA/B mit Dekor-Resten',
            name: 'KOU-2023-16-CER-006: Konischer Becher C03 (Unit 115), LM IIIA/B mit Dekor-Resten',
            category: 'Keramik - Trinkgefäße',
            kategorie: 'Keramik - Trinkgefäße',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Feinkeramik, Dekorationsreste (Pigment)',
            description: 'Konischer Becher (Fundnummer 2023-16-115-C03) aus Unit 115, direkter Nachbarfund zu C06. Erhaltung: 72% des Gefäßes, Randbereich und Bodenbasis erhalten. Besonderheit: Oberflächendekor mit dunklen Farbresten erkennbar (wahrscheinlich Pflanzenwurzeln-Motiv oder Spiralmuster). H (rekonstruiert): 8,2 cm, Maulweite: 7,5 cm. Messpunkt: B583 (d. 418.869). Dekoranalyse: digitale Oberflächenrasterung mit Makroskopie-Dokumentation geplant. Fundkontext: gemeinsame Fundlage mit C02, C04, C05 in dichtem Keramik-Horizon deutet auf synchrone Zerstörung hin.',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[5],
            photoRefs: ['11169', '11176'],
            sketchRefs: ['Sketch 1'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-CER-007: Inverted Conical Cup C04, LM IIIA/B, Unit 115 - Sekundäre Deponierung',
            name: 'KOU-2023-16-CER-007: Inverted Conical Cup C04, LM IIIA/B, Unit 115 - Sekundäre Deponierung',
            category: 'Keramik - Trinkgefäße',
            kategorie: 'Keramik - Trinkgefäße',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Feinkeramik, beige bis bräunlich gefärbt',
            description: 'Konischer Becher (Fundnummer 2023-16-115-C04) aus Unit 115, charakteristisch umgestülpt (Gefäß mit Öffnung nach unten in Grube). Erhaltung: 85% des Gefäßes rekonstruiert, beide Hälften bei Ausgrabung dokumentiert. Fundlage: Umgestülptes Gefäß überlagerte Bodensediment (sekundäre Deponierung). H (original): 8,6 cm, Maulweite: 7,8 cm. Hochkote (Gefäßoberkante): Messpunkt B564 (d. 418.100), Bodensitzfläche: B585 (d. 418.900). Interpretation: Gefäß möglicherweise als Abdeckung eines sub-floor-Depots oder Opferdeposition verwendet (rituelle Kontexte in LM III). Oberflächenbehandlung: Polierung erkennbar.',
            discoverer: 'Gregor Staudacher',
            entdecker: 'Gregor Staudacher',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1, Bodenkontakt',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[6],
            photoRefs: ['11169'],
            sketchRefs: ['Sketch 4'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-CER-008: Konischer Becher C05, LM IIIA/B mit Basis-Erhaltung, Unit 115',
            name: 'KOU-2023-16-CER-008: Konischer Becher C05, LM IIIA/B mit Basis-Erhaltung, Unit 115',
            category: 'Keramik - Trinkgefäße',
            kategorie: 'Keramik - Trinkgefäße',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Feinkeramik, graubeige bis orangebraun gefärbt',
            description: 'Konischer Becher (Fundnummer 2023-16-115-C05) aus Unit 115, nahezu vollständig erhalten. Erhaltung: 95% des Gefäßes, Basis intakt mit charakteristischer ringförmiger Standplattform (Fuß-Form). H: 8,9 cm, Maulweite: 8,2 cm, Basisdurchmesser: 3,8 cm. Hochkoten: Gefäßoberkante Messpunkt B602 (d. 418.830), Bodenkontext Bodenmessung B603 (d. 418.826). Oberflächendekor: feine Politur erkennbar, keine plastischen Verzierungen. Tonquelle-Analyse: visuelle Macroscopy zeigt Quarz-Magerung aus lokalen Ressourcen. Vergleichsfunde: typische kretische Haushaltsware des LM III aus anderen Fundplätzen (Karphi, Kavousi). Sediment-Assoziationen: Soil-Sample SS04 dokumentiert direktes Umfeld (d. 418.826).',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 115, Room 1, nahe Boden',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[7],
            photoRefs: ['11171', '11176', '11177'],
            sketchRefs: ['Sketch 3'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-SED-009: Sediment-Proben aus Unit 117 (unterlagernde Schicht), Paläoökologische Analysen',
            name: 'KOU-2023-16-SED-009: Sediment-Proben aus Unit 117 (unterlagernde Schicht), Paläoökologische Analysen',
            category: 'Probe - Stratigraphie/Sedimentanalyse',
            kategorie: 'Probe - Stratigraphie/Sedimentologie',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Überlagertes Sediment, graubraun, Holzkohle-Partikel',
            description: 'Kollektion von Sedimentproben aus Unit 117 (unter Unit 115 entsprechend Unit 104), explizit für paläoökologische und geoarchäologische Rekonstruktion entnommen. Probennahme-Strategie: systematisch aus verschiedenen Stratigraphie-Positionen. Gesamtvolumen: ca. 500 mL aus Kernbereich. Sediment-Beschaffenheit: graubraun, verdichtet, mit Holzkohle-Partikeln und Mica-Glimmer-Schüppchen. Analytische Ziele: 1) Mikromorphologische Dünnschliff-Analyse zur Bodenerosions/Ablagerungsgeschichte, 2) Phytolith-Extraktion (Pflanzen-Opal-Körper), 3) Magnetische Suszeptibilität zur Brandspuren-Erfassung, 4) Zooarchäobotanische PNM-Analyse. Grenzmessungen: Nordgrenze B605 (d. 418.863), Südgrenze B606 (d. 418.831), Ostgrenze B607 (d. 418.833), Westgrenze B608 (d. 418.853).',
            discoverer: 'Elena Vasilopoulou',
            entdecker: 'Elena Vasilopoulou',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B) - unterlagernde Schicht',
            location: 'Room 1, Trench 16',
            fundort: 'Unit 117, Room 1, unterlagernde Schicht (unter Unit 115)',
            latitude: 35.0451,
            longitude: 24.8801,
            image: bilderPath + bilderImages[8],
            photoRefs: [],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        },
        {
            title: 'KOU-2023-16-ARC-010: Verputzfragment mit Malspuren aus Unit 116 (Room 2), SA02',
            name: 'KOU-2023-16-ARC-010: Verputzfragment mit Malspuren aus Unit 116 (Room 2), SA02',
            category: 'Architekturfund - Wandverputz/Konstruktion',
            kategorie: 'Architekturfund - Wandverputz',
            period: 'Spätminoisch III (LM IIIA/B, 1375-1050 v.Chr.)',
            material: 'Kalk-Leichtputz mit Malspuren, möglicherweise crete soil binder',
            description: 'Verputzfragment (SA02 aus Unit 116) von einer Wand im südlichen Sektor von Room 2, unterhalb des Ashlar-Blocks-Befundes. Dimension: 5,1 cm × 3,8 cm × 0,9 cm. Kennzeichnend: dunkle Malspuren auf der Oberseite (wahrscheinlich Kohle von Brandzeichen oder sekundäre Verfärbung). Stratigraphie: Oberflächlicher Verputz zeigt weniger sorgfältige Verarbeitung als SA03 aus Unit 115 (rudere Struktur, grobere Körnung). Kontext: Fundlage assoziiert mit Aschlen und Keramikdebris, möglicherweise aus destruktivem Brandereignis stammend. Interpretation: Fragment aus weniger dekoriert ausgestatteter sekundären Raumfläche oder Lagerraum (utilitas-Raum). Konservierung: Pigmentverrussung bleibt erhalten für spektroskopische Analyse.',
            discoverer: 'Martin Kim',
            entdecker: 'Martin Kim',
            dateFound: '2023-09-20',
            datierung: 'Spätminoisch III (LM IIIA/B)',
            location: 'Room 2, Trench 16',
            fundort: 'Unit 116, Room 2, unter Ashlar-Block',
            latitude: 35.0449,
            longitude: 24.8798,
            image: bilderPath + bilderImages[9],
            photoRefs: ['11187'],
            projectId,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        }
    ];
}

async function replaceKoumasaFinds(projectId, userId) {
    const subcollectionFindsRef = collection(db, 'projects', projectId, 'finds');
    const subcollectionSnapshot = await getDocs(subcollectionFindsRef);

    for (const findDoc of subcollectionSnapshot.docs) {
        try {
            await deleteDoc(findDoc.ref);
        } catch (error) {
            console.warn('⚠️ Konnte Subcollection-Fund nicht löschen:', findDoc.id, error.message);
        }
    }

    const topLevelFindsRef = collection(db, 'finds');
    const topLevelFindsQuery = query(topLevelFindsRef, where('projectId', '==', projectId));
    const topLevelSnapshot = await getDocs(topLevelFindsQuery);

    for (const findDoc of topLevelSnapshot.docs) {
        const data = findDoc.data() || {};
        if (data.userId !== userId) {
            continue;
        }

        try {
            await deleteDoc(findDoc.ref);
        } catch (error) {
            console.warn('⚠️ Konnte Top-Level-Fund nicht löschen:', findDoc.id, error.message);
        }
    }

    const finds = buildKoumasaFinds(projectId, userId);

    for (const findData of finds) {
        await addDoc(subcollectionFindsRef, findData);
        await addDoc(topLevelFindsRef, findData);
    }

    await updateDoc(doc(db, 'projects', projectId), {
        findCount: finds.length,
        updatedAt: Timestamp.now()
    });

    return finds.length;
}

async function clearUserProjectsAndFinds(userId) {
    let permissionIssues = false;

    try {
        const projectsRef = collection(db, 'projects');
        const userProjectsQuery = query(projectsRef, where('userId', '==', userId));
        const userProjectsSnapshot = await getDocs(userProjectsQuery);

        for (const projectDoc of userProjectsSnapshot.docs) {
            try {
                const subFindsRef = collection(db, 'projects', projectDoc.id, 'finds');
                const subFindsSnapshot = await getDocs(subFindsRef);

                for (const subFindDoc of subFindsSnapshot.docs) {
                    await deleteDoc(subFindDoc.ref);
                }

                await deleteDoc(projectDoc.ref);
            } catch (err) {
                permissionIssues = true;
                console.warn('⚠️ Konnte Projekt/Unterfunde nicht löschen:', projectDoc.id, err.message);
            }
        }
    } catch (err) {
        permissionIssues = true;
        console.warn('⚠️ Konnte Benutzerprojekte nicht zum Löschen laden:', err.message);
    }

    try {
        const topLevelFindsRef = collection(db, 'finds');
        const userFindsQuery = query(topLevelFindsRef, where('userId', '==', userId));
        const userFindsSnapshot = await getDocs(userFindsQuery);

        for (const findDoc of userFindsSnapshot.docs) {
            try {
                await deleteDoc(findDoc.ref);
            } catch (err) {
                permissionIssues = true;
                console.warn('⚠️ Konnte Top-Level-Fund nicht löschen:', findDoc.id, err.message);
            }
        }
    } catch (err) {
        permissionIssues = true;
        console.warn('⚠️ Konnte Top-Level-Funde nicht laden/löschen:', err.message);
    }

    return { permissionIssues };
}

async function createKoumasaDemoProjectForUser(userId, userName = 'demo', options = {}) {
    try {
        console.log('🔄 Erstelle KOUMASA Demo-Projekt mit vollständiger Dokumentation...');

        const projectsRef = collection(db, 'projects');
        const existingKoumasaQuery = query(projectsRef, where('userId', '==', userId), where('datasetKey', '==', KOUMASA_DATASET_KEY));
        const existingKoumasaSnapshot = await getDocs(existingKoumasaQuery);

        if (!existingKoumasaSnapshot.empty) {
            const existingProjectDoc = existingKoumasaSnapshot.docs[0];
            await updateDoc(doc(db, 'projects', existingProjectDoc.id), {
                ...buildKoumasaProject(userId, userName),
                updatedAt: Timestamp.now()
            });
            const updatedFindCount = await replaceKoumasaFinds(existingProjectDoc.id, userId);
            console.log(`✅ KOUMASA Demo-Projekt aktualisiert (kein Duplikat erzeugt, ${updatedFindCount} Funde synchronisiert)`);
            return existingProjectDoc.id;
        }

        const enforceSingle = Boolean(options.enforceSingle);
        if (enforceSingle) {
            const cleanup = await clearUserProjectsAndFinds(userId);
            if (cleanup.permissionIssues) {
                console.warn('⚠️ KOUMASA wurde erstellt, aber alte Demo-Daten konnten nicht vollständig gelöscht werden (Firestore Rules).');
            }
        }

        const projectData = buildKoumasaProject(userId, userName);
        const projectRef = await addDoc(collection(db, 'projects'), projectData);

        const finds = buildKoumasaFinds(projectRef.id, userId);
        const subcollectionFindsRef = collection(db, 'projects', projectRef.id, 'finds');

        for (const findData of finds) {
            await addDoc(subcollectionFindsRef, findData);
            await addDoc(collection(db, 'finds'), findData);
        }

        await updateDoc(projectRef, {
            findCount: finds.length,
            updatedAt: Timestamp.now()
        });

        console.log(`✅ KOUMASA Demo-Projekt erstellt (1 Projekt, ${finds.length} Dokumentationsfunde)`);
        return projectRef.id;
    } catch (error) {
        console.error('Fehler beim Erstellen des KOUMASA Demo-Projekts:', error);
        throw error;
    }
}

async function deleteKoumasaDemoProjectForUser(userId) {
    try {
        console.log('🗑️ Lösche KOUMASA Demo-Projekt...');

        const projectsRef = collection(db, 'projects');
        const koumasaQuery = query(
            projectsRef,
            where('userId', '==', userId),
            where('datasetKey', '==', KOUMASA_DATASET_KEY)
        );
        const koumasaSnapshot = await getDocs(koumasaQuery);

        if (koumasaSnapshot.empty) {
            console.log('ℹ️ Kein KOUMASA Demo-Projekt zum Löschen gefunden.');
            return { deletedProjects: 0, deletedFinds: 0 };
        }

        let deletedProjects = 0;
        let deletedFinds = 0;
        const topLevelFindsRef = collection(db, 'finds');

        for (const projectDoc of koumasaSnapshot.docs) {
            const projectId = projectDoc.id;

            try {
                const subFindsRef = collection(db, 'projects', projectId, 'finds');
                const subFindsSnapshot = await getDocs(subFindsRef);

                for (const subFindDoc of subFindsSnapshot.docs) {
                    await deleteDoc(subFindDoc.ref);
                    deletedFinds++;
                }
            } catch (subErr) {
                console.warn('⚠️ Konnte Subcollection-Funde nicht vollständig löschen:', projectId, subErr.message);
            }

            try {
                const topLevelFindsQuery = query(topLevelFindsRef, where('projectId', '==', projectId));
                const topLevelSnapshot = await getDocs(topLevelFindsQuery);

                for (const findDoc of topLevelSnapshot.docs) {
                    const data = findDoc.data() || {};
                    if (data.userId && data.userId !== userId) {
                        continue;
                    }
                    await deleteDoc(findDoc.ref);
                    deletedFinds++;
                }
            } catch (topErr) {
                console.warn('⚠️ Konnte Top-Level-Funde nicht vollständig löschen:', projectId, topErr.message);
            }

            await deleteDoc(projectDoc.ref);
            deletedProjects++;
        }

        console.log(`✅ KOUMASA Demo-Projekt gelöscht (${deletedProjects} Projekt(e), ${deletedFinds} Fund-Dokument(e))`);
        return { deletedProjects, deletedFinds };
    } catch (error) {
        console.error('❌ Fehler beim Löschen des KOUMASA Demo-Projekts:', error);
        throw error;
    }
}

// Exportiere Funktionen für externe Nutzung
window.createTestProjectsForUser = createTestProjectsForUser;
window.createTestFindsForUserProjects = createTestFindsForUserProjects;
window.createKoumasaDemoProjectForUser = createKoumasaDemoProjectForUser;
window.deleteKoumasaDemoProjectForUser = deleteKoumasaDemoProjectForUser;

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
        const allowForeignSeed = Boolean(window.__allowForeignSeed);
        const currentUid = auth?.currentUser?.uid || null;
        const enableDemoAutoInit = Boolean(window.__enableDemoAutoInit);
        if (allowForeignSeed || currentUid === TRISTANCOUTANT_USER_ID) {
            setTimeout(autoInitializeTristancoutantProjects, 1000);
        }
        if (enableDemoAutoInit) {
            setTimeout(autoInitializeDemoUserProjects, 1200);
        } else {
            console.info('ℹ️ Demo Auto-Initialisierung ist deaktiviert (setze window.__enableDemoAutoInit = true zum Aktivieren).');
        }
    });
}

/**
 * Auto-Initialisierung: Erstelle automatisch Test-Projekte für demo@datarchi.com
 * wenn dieser User angemeldet ist und noch keine Projekte besitzt.
 */
async function autoInitializeDemoUserProjects() {
    try {
        if (demoAutoInitListenerRegistered) {
            return;
        }
        demoAutoInitListenerRegistered = true;

        onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            if (user.email && user.email.toLowerCase() === 'demo@datarchi.com') {
                try {
                    const projectsRef = collection(db, 'projects');
                    const q = query(projectsRef, where('userId', '==', user.uid));
                    const existingProjects = await getDocs(q);

                    const hasKoumasaDataset = existingProjects.docs.some(docSnap => docSnap.data()?.datasetKey === KOUMASA_DATASET_KEY);

                    if (!hasKoumasaDataset) {
                        await createKoumasaDemoProjectForUser(user.uid, user.displayName || 'demo', { enforceSingle: false });
                        console.log('✅ KOUMASA 2023 — Trench 16 für Demo-User angelegt');
                        if (existingProjects.size > 0) {
                            console.log('ℹ️ Vorhandene Demo-Projekte blieben erhalten (ohne Admin-Löschrechte).');
                        }
                    } else {
                        await createKoumasaDemoProjectForUser(user.uid, user.displayName || 'demo', { enforceSingle: false });
                        console.log('✅ KOUMASA Demo-Projekt existiert bereits und ist aktuell');
                    }
                } catch (err) {
                    console.log('ℹ️ Auto-Initialisierung (demo):', err.message);
                }
            }
        });
    } catch (error) {
        console.log('ℹ️ Auto-Initialisierung (demo) Fehler:', error.message);
    }
}

async function autoDeleteKoumasaDemoProjectForDemoUser() {
    try {
        onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            const email = String(user.email || '').toLowerCase();
            if (email !== 'demo@datarchi.com') return;

            try {
                const result = await deleteKoumasaDemoProjectForUser(user.uid);
                if (result.deletedProjects > 0) {
                    console.log(`✅ KOUMASA Demo-Projekt automatisch entfernt (${result.deletedProjects} Projekt(e), ${result.deletedFinds} Fund-Dokument(e))`);
                } else {
                    console.log('ℹ️ Kein KOUMASA Demo-Projekt zum automatischen Entfernen gefunden.');
                }
            } catch (err) {
                console.warn('⚠️ Automatisches Entfernen des KOUMASA Demo-Projekts fehlgeschlagen:', err.message);
            }
        });
    } catch (error) {
        console.warn('⚠️ Auto-Delete Hook konnte nicht initialisiert werden:', error.message);
    }
}

console.log('Test User Setup Script geladen. Nutze createTestProjectsForUser(userId, userName)');

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(autoDeleteKoumasaDemoProjectForDemoUser, 1400);
    });
}
