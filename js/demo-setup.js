/**
 * Demo Setup Module
 * Automatically initializes demo users, projects, and archaeological finds
 */

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, setDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Automatically initialize demo data if it doesn't exist
 * This ensures projects are always available
 */

/**
 * Get system user ID for demo projects
 */
function getSystemUserId() {
    return 'system-demo-user-id';
}

/**
 * Check if a user already exists by email
 * Note: Returns false if can't check due to permissions (will attempt creation anyway)
 */
async function checkUserExists(db, email) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        // If permission denied, we'll try to create and let Firebase handle the error
        return false;
    }
}

/**
 * Check if a project already exists by title
 * Note: Returns false if can't check due to permissions (will attempt creation anyway)
 */
async function checkProjectExists(db, title) {
    try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('title', '==', title));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        // If permission denied, we'll try to create and let Firebase handle the error
        return false;
    }
}


/**
 * Create demo projects with system user ID
 */
async function createDemoProjects() {
    const db = getFirestore();
    const auth = getAuth();

    const demoProjects = [
        {
            title: 'Römische Villa bei München',
            description: 'Ausgrabung einer wohlhabenden Römischen Villa aus dem 2. Jahrhundert mit Mosaikböden und Hypokaust-System',
            region: 'Bayern',
            location: 'Nähe München, Deutschland',
            period: 'Römisch (1.-3. Jahrhundert)',
            startDate: Timestamp.fromDate(new Date('2023-06-01')),
            status: 'in_progress',
            lead: 'Dr. Maria Schmidt',
            creatorName: 'Dr. Maria Schmidt',
            team: ['Dr. Maria Schmidt', 'Prof. Hans Müller', 'Dr. Anna Weber'],
            description_long: 'Diese Ausgrabung dokumentiert die Überreste einer Römischen Villa mit beeindruckenden Mosaikfußböden und einem funktionierenden Hypokaust-Heizungssystem. Die Fundstelle zeigt Hinweise auf Wohlstand und kulturelle Verbindungen zum Mittelmeerraum. Die Ausgrabung wird unter Leitung von Dr. Maria Schmidt durchgeführt und hat bereits über 150 Artefakte freigelegt.',
            keywords: ['Römisch', 'Villa', 'Mosaiken', 'Hypokaust'],
            institution: 'Universität München - Institut für Archäologie',
            principalInvestigator: 'Dr. Maria Schmidt',
            budget: 'EUR 450.000',
            participants: 12,
            fundingSource: 'Deutsche Forschungsgemeinschaft (DFG)',
            isDemo: true,
            demoLabel: '🎯 Beispielprojekt'
        },
        {
            title: 'Mittelalterliche Burganlage Heidelberg',
            description: 'Untersuchung einer Burganlage aus dem 13. Jahrhundert mit Wehrbauten und Wohnquartieren',
            region: 'Baden-Württemberg',
            location: 'Heidelberg, Deutschland',
            period: 'Mittelalter (13.-15. Jahrhundert)',
            startDate: Timestamp.fromDate(new Date('2023-09-15')),
            status: 'in_progress',
            lead: 'Prof. Hans Müller',
            creatorName: 'Prof. Hans Müller',
            team: ['Prof. Hans Müller', 'Dr. Anna Weber', 'Dr. Maria Schmidt'],
            description_long: 'Umfangreiche Ausgrabungen in und um die Heidelberg Burganlage mit Fokus auf die mittelalterliche Wehrarchitektur und das tägliche Leben der Burgbewohner. Die Untersuchung hat bedeutende Keramikfunde, Münzen und Artefakte aus dem 13.-15. Jahrhundert erbracht.',
            keywords: ['Mittelalter', 'Burg', 'Wehranlage', 'Keramik'],
            institution: 'Heidelberg Universität - Abteilung Mittelalterarchäologie',
            principalInvestigator: 'Prof. Hans Müller',
            budget: 'EUR 380.000',
            participants: 10,
            fundingSource: 'Heidelberg Universität',
            isDemo: true,
            demoLabel: '🎯 Beispielprojekt'
        },
        {
            title: 'Keltische Oppida-Siedlung',
            description: 'Archäologische Untersuchung einer großen befestigten Keltischen Siedlung mit Handwerksbereichen',
            region: 'Böhmen',
            location: 'Böhmen, Tschechien',
            period: 'Keltisch (4.-1. Jahrhundert v.Chr.)',
            startDate: Timestamp.fromDate(new Date('2023-07-10')),
            status: 'completed',
            lead: 'Dr. Anna Weber',
            creatorName: 'Dr. Anna Weber',
            team: ['Dr. Anna Weber', 'Dr. Maria Schmidt', 'Prof. Hans Müller'],
            description_long: 'Großflächige Grabung einer Keltischen Oppida mit Handwerksbereichen, Handelswaren und Hinweisen auf regionale Handelsnetze. Das Projekt hat über 300 Funde dokumentiert und trägt wesentlich zum Verständnis der keltischen Besiedlung Mitteleuropas bei. Abgeschlossen mit umfassenden Publikationen.',
            keywords: ['Keltisch', 'Oppida', 'Handwerk', 'Handel'],
            institution: 'TU Dresden - Lehrstuhl für Klassische Archäologie',
            principalInvestigator: 'Dr. Anna Weber',
            budget: 'EUR 320.000',
            participants: 15,
            fundingSource: 'Sächsisches Staatsministerium für Kultus',
            isDemo: true,
            demoLabel: '🎯 Beispielprojekt'
        },
        {
            title: 'Eisenzeit-Gräberfeld Alpen',
            description: 'Freilegung eines ausgedehnten Gräberfeldes mit reichen Grabbeigaben aus der Hallstattzeit',
            region: 'Oberösterreich',
            location: 'Alpenregion, Österreich',
            period: 'Eisenzeit Hallstattkultur (800-450 v.Chr.)',
            startDate: Timestamp.fromDate(new Date('2024-05-01')),
            status: 'planning',
            lead: 'Dr. Maria Schmidt',
            creatorName: 'Dr. Maria Schmidt',
            team: ['Dr. Maria Schmidt', 'Prof. Hans Müller', 'Dr. Anna Weber'],
            description_long: 'Systematische Ausgrabung eines großen Gräberfeldes mit gut erhaltenen Skelettfunden und wertvollen Grabbeigaben aus Metall, Bernstein und Keramik. Das Projekt wird in Kooperation mit österreichischen Instituten durchgeführt und verspricht neue Erkenntnisse zur Hallstattkultur.',
            keywords: ['Eisenzeit', 'Hallstatt', 'Gräberfeld', 'Bestattungen'],
            institution: 'Internationale Zusammenarbeit - Universität München & Universität Wien',
            principalInvestigator: 'Dr. Maria Schmidt',
            budget: 'EUR 550.000',
            participants: 18,
            fundingSource: 'EU Horizon Europe & DFG',
            isDemo: true,
            demoLabel: '🎯 Beispielprojekt'
        }
    ];

    const createdProjects = [];

    for (const projectData of demoProjects) {
        try {
            // Use system user ID for all demo projects
            const userId = getSystemUserId();
            
            const projectsRef = collection(db, 'projects');
            const docRef = await addDoc(projectsRef, {
                ...projectData,
                userId: userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                visibility: 'public',
                isPublic: true,
                collaborators: [],
                findCount: 0
            });

            console.log(`✅ Created demo project: ${projectData.title}`);
            createdProjects.push({ ...projectData, id: docRef.id });
        } catch (error) {
            // Permission denied or other error - continue gracefully
            console.warn(`⚠️ Could not create project ${projectData.title}:`, error.message);
        }
    }

    return createdProjects;
}

/**
 * Add archaeological finds to projects
 */
async function addFindsToProjects() {
    const db = getFirestore();

    const finds = {
        'Römische Villa bei München': [
            { category: 'Keramik', name: 'Sigillata-Schale mit Herstellerstempel', period: 'Römisch 2. Jh.', material: 'Keramik', description: 'Feine rote Sigillata-Keramik mit Herstellerstempel aus Gau', discoverer: 'Dr. Maria Schmidt', dateFound: '2023-06-15' },
            { category: 'Münzen', name: 'Bronzemünze des Antoninus Pius', period: 'Römisch 138-161 n.Chr.', material: 'Bronze', description: 'Gut erhaltene Münze mit Porträt des Kaisers und Rückseite mit Fortuna', discoverer: 'Prof. Hans Müller', dateFound: '2023-07-02' },
            { category: 'Glas', name: 'Glaskrug-Fragment mit Verzierungen', period: 'Römisch 2. Jh.', material: 'Glas', description: 'Grünes Glas mit aufgeschmolzenen Verzierungen, typisch für die Periode', discoverer: 'Dr. Anna Weber', dateFound: '2023-07-10' },
            { category: 'Metall', name: 'Bronzefibel Schlangenform', period: 'Römisch 2. Jh.', material: 'Bronze', description: 'Fibel als Gewandverschluss, kunstvoll gestaltete Schlangenform', discoverer: 'Dr. Maria Schmidt', dateFound: '2023-08-05' },
            { category: 'Stein', name: 'Mosaik-Tessera Blau', period: 'Römisch 2. Jh.', material: 'Stein', description: 'Kleine Steinwürfel vom Mosaikboden, blaue Farbe erhalten', discoverer: 'Team Grabung', dateFound: '2023-06-20' }
        ],
        'Mittelalterliche Burganlage Heidelberg': [
            { category: 'Keramik', name: 'Grauware-Schüssel mit Ritzmuster', period: 'Mittelalter 13. Jh.', material: 'Keramik', description: 'Typische mittelalterliche Grauware-Keramik mit geometrischem Ritzmuster', discoverer: 'Prof. Hans Müller', dateFound: '2023-09-20' },
            { category: 'Metall', name: 'Eiserner Türschlüssel mit Verzierung', period: 'Mittelalter 14. Jh.', material: 'Eisen', description: 'Großer Schlüssel aus Schmiedeeisen mit dekorativer Öse', discoverer: 'Dr. Anna Weber', dateFound: '2023-10-15' },
            { category: 'Knochen', name: 'Knöcherner Knopf mit Gravur', period: 'Mittelalter 13. Jh.', material: 'Knochen', description: 'Dekorativer Knopf aus Tierknochen mit Gravuren', discoverer: 'Prof. Hans Müller', dateFound: '2023-09-28' },
            { category: 'Münzen', name: 'Silberpfennig 13. Jahrhundert', period: 'Mittelalter 13. Jh.', material: 'Silber', description: 'Kleine Silbermünze, stark abgenutzt, mit Adelswappen', discoverer: 'Grabungsteam', dateFound: '2023-10-08' }
        ],
        'Keltische Oppida-Siedlung': [
            { category: 'Keramik', name: 'Hallstatt-Amphore mit Ornamenten', period: 'Keltisch 5. Jh. v.Chr.', material: 'Keramik', description: 'Große Vorratsamphore mit geometrischen Mustern und Wellenmotiven', discoverer: 'Dr. Anna Weber', dateFound: '2023-07-25' },
            { category: 'Metall', name: 'Eisenschwert Fragment mit Griffangel', period: 'Keltisch 4. Jh. v.Chr.', material: 'Eisen', description: 'Kampfwaffe aus Schmiedeeisen, gut erhaltene Griffangel sichtbar', discoverer: 'Dr. Maria Schmidt', dateFound: '2023-08-12' },
            { category: 'Bernstein', name: 'Baltischer Bernstein-Anhänger', period: 'Keltisch 5. Jh. v.Chr.', material: 'Bernstein', description: 'Baltischer Bernstein, Hinweis auf Fernhandel über große Distanzen', discoverer: 'Dr. Anna Weber', dateFound: '2023-07-30' },
            { category: 'Metall', name: 'Bronzefibel-Keltisch verziert', period: 'Keltisch 4. Jh. v.Chr.', material: 'Bronze', description: 'Aufwendig verzierte Gewandnadel mit Spiralmotiven', discoverer: 'Prof. Hans Müller', dateFound: '2023-08-18' },
            { category: 'Ton', name: 'Spinnwirtel aus Ton', period: 'Keltisch 5. Jh. v.Chr.', material: 'Ton', description: 'Zeugnisse für Textilproduktion und Handwerk in der Oppida', discoverer: 'Grabungsteam', dateFound: '2023-07-22' },
            { category: 'Keramik', name: 'Handgemachtes Gefäß Hallstatt früh', period: 'Keltisch 6. Jh. v.Chr.', material: 'Keramik', description: 'Frühe Hallstatt-Keramik, handgeformt, schwarze Oberflächenbearbeitung', discoverer: 'Dr. Anna Weber', dateFound: '2023-08-05' }
        ],
        'Eisenzeit-Gräberfeld Alpen': [
            { category: 'Metall', name: 'Goldhalsring Statussymbol', period: 'Hallstatt 700 v.Chr.', material: 'Gold', description: 'Massiver Goldhalsring als Statussymbol, seltenes Grabbeigabe-Stück', discoverer: 'Dr. Maria Schmidt', dateFound: '2024-05-10' },
            { category: 'Metall', name: 'Bronzearmreife Paar verziert', period: 'Hallstatt 650 v.Chr.', material: 'Bronze', description: 'Paar aus aufwendig verziertem Bronzeguss mit Spiralmustern', discoverer: 'Prof. Hans Müller', dateFound: '2024-05-18' },
            { category: 'Bernstein', name: 'Bernsteinperlen-Kette', period: 'Hallstatt 700 v.Chr.', material: 'Bernstein', description: 'Kette aus baltischem Bernstein, zeigt Handelskontakte', discoverer: 'Dr. Anna Weber', dateFound: '2024-05-22' },
            { category: 'Keramik', name: 'Funerales Gefäß mit Motiven', period: 'Hallstatt 650 v.Chr.', material: 'Keramik', description: 'Funeräres Gefäß mit Bestattungsfunktion und geometrischen Motiven', discoverer: 'Team Grabung', dateFound: '2024-06-01' },
            { category: 'Stein', name: 'Jade-Amulett asiatisch', period: 'Hallstatt 700 v.Chr.', material: 'Jade', description: 'Seltenes asiatisches Amulett, Beweis für weite Handelswege', discoverer: 'Dr. Maria Schmidt', dateFound: '2024-05-25' },
            { category: 'Knochen', name: 'Elfenbein-Flasche Behälter', period: 'Hallstatt 650 v.Chr.', material: 'Elfenbein', description: 'Kleine Behälterflasche aus Elefantenstoßzahn, luxuriöse Grabbeigabe', discoverer: 'Prof. Hans Müller', dateFound: '2024-06-05' }
        ]
    };

    const createdFinds = [];

    for (const [projectTitle, findsList] of Object.entries(finds)) {
        try {
            // Find project by title
            const projectsRef = collection(db, 'projects');
            const q = query(projectsRef, where('title', '==', projectTitle));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Project doesn't exist yet, skip adding finds
                return;
            }

            const projectId = querySnapshot.docs[0].id;
            const projectData = querySnapshot.docs[0].data();
            const findsRef = collection(db, 'projects', projectId, 'finds');

            for (const findData of findsList) {
                try {
                    const userId = getSystemUserId();
                    
                    await addDoc(findsRef, {
                        ...findData,
                        userId: userId,
                        projectId: projectId,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                        status: 'cataloged',
                        photos: [],
                        coordinates: {
                            latitude: 0,
                            longitude: 0
                        }
                    });
                } catch (error) {
                    // Continue even if one find fails
                    console.warn(`⚠️ Could not add find to ${projectTitle}:`, error.message);
                }
            }

            console.log(`✅ Added ${findsList.length} finds to "${projectTitle}"`);
            createdFinds.push({ project: projectTitle, count: findsList.length });
        } catch (error) {
            // Continue gracefully
            console.warn(`⚠️ Could not process project ${projectTitle}:`, error.message);
        }
    }

    return createdFinds;
}

/**
 * Main setup function - orchestrates demo data creation
 * Only creates data if it doesn't already exist
 */
export async function setupDemoData() {
    try {
        console.log('🚀 Checking demo data...');

        // Create demo projects with system user
        console.log('📂 Checking demo projects...');
        await createDemoProjects();

        // Add finds to projects
        console.log('🏺 Checking archaeological finds...');
        await addFindsToProjects();

        console.log('✅ Demo data ready!');
        return { success: true, message: 'Demo data ready' };
    } catch (error) {
        console.error('❌ Demo setup error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Auto-initialize demo data on every page load
 * Ensures demo data always exists without duplication
 */
export async function autoInitializeDemoData() {
    console.log('🔄 Ensuring demo data is available...');
    await setupDemoData();
}
