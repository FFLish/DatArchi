/**
 * Demo Setup Script
 * Erstellt ein Demo-Projekt mit Demo-Funden und Bildern
 */

import { auth, db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc,
    deleteDoc,
    Timestamp,
    query,
    where,
    getDocs
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const DEMO_PROJECT_NAME = 'Koumasa 2023 - Trench 16 Excavation';
const DEMO_USER_NAME = 'Elena Vasilopoulou';
export const DEMO_TARGET_USER_ID = 'W83D1lUHIqWllW2Vl5Y9MDQ8zd62';
const DEMO_DATASET_KEY = 'koumasa-2023-trench-16';
const MAX_PUBLIC_PROJECTS = 3;

function toMillis(value) {
    if (!value) return 0;
    if (typeof value?.toDate === 'function') {
        return value.toDate().getTime();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

// Array der verfügbaren Bilder aus partials/images/bilder
const DEMO_IMAGES = [
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

const DEMO_IMAGE_PATHS = DEMO_IMAGES.map((fileName) => `/partials/images/bilder/${fileName}`);

// Demo Projekt Daten - Based on Koumasa 2023 Real Excavation
const DEMO_PROJECT = {
    title: 'Koumasa 2023 - Trench 16 Excavation',
    name: 'Koumasa 2023 - Trench 16 Excavation',
    description: 'Excavation documentation from Koumasa 2023, Trench 16, dated 20.09.2023, featuring Units 115, 116, and 117 with find assemblages',
    description_long: 'Archaeological excavation data from Koumasa 2023. This documentation covers Trench 16 excavation conducted on September 20, 2023. The excavation includes three main excavation units (115, 116, 117) located in Room 1 and Room 2, with comprehensive documentation of ceramics, fauna, charcoal samples, and detailed stratigraphic relationships. The project demonstrates professional archaeological field recording practices including depth measurements, photographic documentation, and spatial correlation of finds.',
    location: 'Koumasa, Crete',
    region: 'Greece',
    period: 'Bronze Age (pending classification)',
    startDate: '2023-09-20',
    endDate: '2023-09-20',
    status: 'Completed',
    lead: 'Elena Vasilopoulou',
    creatorName: 'Elena Vasilopoulou',
    team: ['Elena Vasilopoulou', 'Martin Kim', 'Gregor Staudacher'],
    institution: 'Archaeological Excavation Koumasa',
    principalInvestigator: 'Elena Vasilopoulou',
    budget: 'Research Project',
    participants: '8',
    fundingSource: 'Academic Research',
    latitude: 35.2500,
    longitude: 25.0500,
    isPublic: true,
    visibility: 'public',
    mediaBasePath: '/partials/images/bilder/',
    mediaFiles: [...DEMO_IMAGES],
    findCount: 0,
    stars: 0,
    memberCount: 1,
    version: '1.0'
};

// Demo Funde Daten - Real finds from Koumasa 2023 Trench 16 Excavation
const DEMO_FINDS = [
    {
        name: '2023-16-115-C06: Conical Cup (Intact)',
        description: 'Complete conical cup vessel recovered from Unit 115, Room 1. Context indicates domestic/utilitarian use. Vessel collected with surrounding soil matrix (2023-16-115-SS05). Fine ware, carefully excavated and documented with detailed measurements.',
        category: 'Keramik',
        material: 'Keramik (Ton)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115 Layer',
        depth: '418.854m (measured B567)',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Vollständig',
        significance: 'Primary vessel find, domestic context',
        notes: 'Found inverted. Soil sample 2023-16-115-SS05 collected from immediate context. Depth measurement B566 d. 418.851 on cup surface.',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Vessel', 'Unit115'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Beneath layer of stones indicating end of Unit 115 deposits',
        images: ['partials/images/bilder/image.png']
    },
    {
        name: '2023-16-115-C02: Possible Bowl (Fragmented)',
        description: 'Fragment of what appears to be a bowl vessel from Unit 115. Fine ware ceramic. Represents typical domestic vessel forms for period. Carefully documented with depth measurement and photographic record.',
        category: 'Keramik',
        material: 'Keramik (Ton), Feinkeramik',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115 Layer',
        depth: '418.828m (measured B568)',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Fragment',
        significance: 'Functional vessel form identification',
        notes: 'Vessel type identification provisional. Measurement B568 recorded at find location',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Bowl', 'Unit115'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 115, brown stiff soil layer, same context as other vessels',
        images: ['partials/images/bilder/image copy.png']
    },
    {
        name: '2023-16-115-C03: Conical Cup (Fragmented)',
        description: 'Fragmented conical cup recovered from Unit 115. Fine ware ceramic vessel with typical conical form. Multiple sherds excavated and documented. Sketch 1 produced for morphological record.',
        category: 'Keramik',
        material: 'Keramik (Ton)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115 Layer',
        depth: '418.869m (measured B583)',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Fragmentarisch',
        significance: 'Vessel morphology documentation',
        notes: 'Sketch 1 produced showing fragment reconstruction. Depth measurement B583',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Conical Cup', 'Unit115'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 115 fine vessel assemblage',
        images: ['partials/images/bilder/image copy 2.png']
    },
    {
        name: '2023-16-115-C04: Inverted Conical Cup',
        description: 'Inverted conical cup vessel from Unit 115, suggesting intentional placement or collapse. Fine ware ceramic. Surrounding soil collected as sample 2023-16-115-SS03 for micro-botanical analysis. Vertical stratigraphy well documented.',
        category: 'Keramik',
        material: 'Keramik (Ton)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115 Layer',
        depth: '418.900m (measured B585) / Cup surface 418.100m (B564)',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Gut erhalten',
        samples_collected: '2023-16-115-SS03 (soil beneath vessel)',
        significance: 'Depositional context, inverted placement suggests behavioral act',
        notes: 'Sketch 4 produced. Depth measurements B585 and B564 document vessel position and orientation. Measurement discrepancy (B564) noted in original documentation.',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Vessel', 'Unit115', 'Inverted'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Intentional placement or post-depositional collapse within stiff soil matrix',
        images: ['partials/images/bilder/image copy 3.png']
    },
    {
        name: '2023-16-115-C05: Conical Cup with Pottery Sherds',
        description: 'Fifth conical cup vessel from Unit 115, recovered with associated pottery sherds in close spatial proximity. Fine ware. Excellent preservation and detailed documentation with surrounding context sampling.',
        category: 'Keramik',
        material: 'Keramik (Ton)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115 Layer',
        depth: '418.830m (measured B602) cup / 418.826m (B603) surrounding soil',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Gut erhalten',
        samples_collected: '2023-16-115-SS04 (surrounding soil)',
        significance: 'Ceramic vessel assemblage, domestic context',
        notes: 'Sketch 3 produced. Measurements B602 (vessel) and B603 (soil context) document vertical relationship. Associated pottery sherds indicate refuse or occupation deposit.',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Conical Cup', 'Vessel Cluster', 'Unit115'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Cluster of vessels in Unit 115, beneath stone layer boundary',
        images: ['partials/images/bilder/image copy 4.png']
    },
    {
        name: '2023-16-115-Pottery: Ceramic Sherds (Fine Ware)',
        description: 'Pottery sherds recovered from Unit 115, predominantly fine ware ceramics. Represents typical domestic pottery from the deposit. Multiple fragments indicating at least several vessels. Typological analysis pending.',
        category: 'Keramik',
        material: 'Keramik (Ton)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115, throughout layer',
        depth: '~418.8-418.9m',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Fragmentarisch',
        quantity: 'Multiple fragments',
        significance: 'Site chronology and domestic assemblage',
        notes: 'Mostly fine ware, consistent with domestic occupation. Catalogued under 2023-16-115-Pottery',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Sherds', 'Unit115', 'Fine Ware'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Distributed throughout Unit 115 brown stiff soil',
        images: ['partials/images/bilder/image copy 5.png']
    },
    {
        name: '2023-16-115-Bones: Animal Bone Assemblage',
        description: 'Faunal remains recovered from Unit 115. Bone fragments showing taphonomic processes and evidence of processing. Indicates subsistence patterns and dietary practices. Archaeozoological analysis pending.',
        category: 'Zoologie',
        material: 'Knochen (Animal bone)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115',
        depth: '~418.8-418.9m',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Fragmentarisch, avec traces de traitement',
        significance: 'Subsistence economy and faunal assemblage',
        notes: 'Faunal remains distributed throughout Unit 115. Processing and species identification pending laboratory analysis.',
        tags: ['Koumasa', 'Trench16', 'Fauna', 'Bones', 'Unit115', 'Subsistence'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Associated with ceramic vessels and charcoal in occupation deposit',
        images: ['partials/images/bilder/image copy 6.png']
    },
    {
        name: '2023-16-115-SA03: Plaster with Red Paint',
        description: 'Plaster fragments with adherent red pigment from Unit 115. Indicates architectural decoration or painted elements. Pigment analysis and archaeological context suggest interior wall surface. Important for understanding spatial organization.',
        category: 'Architectural',
        material: 'Kalk-Putz mit roter Farbe (Pigment)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 115',
        depth: '~418.8-418.9m',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '115',
        condition: 'Fragment mit Pigmentrest',
        significance: 'Architectural decoration, spatial interpretation',
        notes: 'Context indicates collapse or demolition of decorated interior surface. Red pigment preserved on plaster surface.',
        tags: ['Koumasa', 'Trench16', 'Architecture', 'Plaster', 'Paint', 'Unit115'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Mixed with ceramic and bone assemblage, suggesting secondary deposit or destruction context',
        images: ['partials/images/bilder/image copy 7.png']
    },
    {
        name: '2023-16-116-Pottery: Ceramic Sherds (Coarse Ware)',
        description: 'Pottery sherds from Unit 116 in Room 2, predominantly coarse ware ceramics. Includes utility vessels. Lower frequency of finds compared to Unit 115 suggests different depositional context or use pattern.',
        category: 'Keramik',
        material: 'Keramik (Ton), Grobkeramik',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 2, Unit 116 Layer',
        depth: '419.098m (measured B565)',
        grid_square: 'Trench 16, Room 2',
        excavation_unit: '116',
        condition: 'Fragmentarisch',
        significance: 'Ceramic assemblage typology, depositional context',
        notes: 'Primarily coarse ware, sparse distribution. Located S of ashlar block architectural element.',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Sherds', 'Unit116', 'Coarse Ware'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 116, beneath Unit 113, adjacent to ashlar architectural element',
        images: ['partials/images/bilder/image copy 8.png']
    },
    {
        name: '2023-16-116-Bones & SA03: Animal Bones with Associated Charcoal',
        description: 'Faunal remains from Unit 116 recovered adjacent to ashlar block feature. Charcoal sample 2023-16-116-SA03 collected from same locus, suggesting activity area. Context indicates potential burning or food preparation.',
        category: 'Zoologie',
        material: 'Knochen (Animal bone) + Holzkohle',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 2, Unit 116, next to ashlar block',
        depth: '~419.0-419.1m',
        grid_square: 'Trench 16, Room 2',
        excavation_unit: '116',
        condition: 'Fragmentarisch mit Kohlespuren',
        samples_collected: '2023-16-116-SS02 (soil around charcoal, measured B601 d. 419.096)',
        significance: 'Activity area, subsistence, energy use',
        notes: 'Bone and charcoal spatial association suggests cooking or refuse area. Charcoal sample document location and context.',
        tags: ['Koumasa', 'Trench16', 'Fauna', 'Charcoal', 'Unit116', 'Activity Area'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 116 stiff soil, adjacent to ashlar block which extends deeper',
        images: ['partials/images/bilder/image copy 9.png']
    },
    {
        name: '2023-16-116 Architecture: Ashlar Block Feature',
        description: 'Large ashlar block with burnt clay accumulation on surface. Architectural element predating Unit 116 deposition. Block reveals construction technique and continues to greater depth. Significant for understanding spatial and structural organization.',
        category: 'Architectural',
        material: 'Stein (Ashlar block), Ton (burnt clay accumulation)',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 2, Unit 116 / Unit 113 boundary',
        grid_square: 'Trench 16, Room 2',
        excavation_unit: '113-116 interface',
        condition: 'In situ',
        significance: 'Architectural structure, wall/construction element',
        notes: 'Burnt clay covering suggests exposure to fire or heat processing. Block continues deeper (Unit 114). Close-up photos (Figs. 4, 5; 11141, 11143) document feature details.',
        tags: ['Koumasa', 'Trench16', 'Architecture', 'Stone', 'Block'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Predates Unit 113 and 116. Stratigraphic relationships: Unit 116 underneath Unit 113',
        images: ['partials/images/bilder/image copy 10.png']
    },
    {
        name: '2023-16-117-Pottery: Ceramic Sherds with Paint Traces',
        description: 'Pottery sherds from Unit 117 (equivalent to Unit 104) with preserved paint surface treatment. Limited assemblage suggests partial excavation of this lower unit. Sherds indicate continuation of occupation sequence.',
        category: 'Keramik',
        material: 'Keramik (Ton) mit Farbspuren',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 117 Layer (below Unit 115)',
        depth: '~418.8-418.9m',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '117',
        condition: 'Fragmentarisch',
        significance: 'Sequence continuation, painted ceramic tradition',
        notes: 'Paint-decorated ceramics indicate aesthetic tradition and technical competence. Unit only partially excavated.',
        tags: ['Koumasa', 'Trench16', 'Ceramics', 'Paint', 'Unit117', 'Decorated'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 117 beneath Unit 115, brown stiff soil context, corresponds to Unit 104',
        images: ['partials/images/bilder/image copy 11.png']
    },
    {
        name: '2023-16-117-SA2: Plaster Fragments with Paint Traces',
        description: 'Plaster fragments from Unit 117 with preserved paint surfaces. Indicates architectural decoration in lower occupation phases. Paint preservation suggests rapid covering or occupation continuity with maintained decorated surfaces.',
        category: 'Architectural',
        material: 'Kalk-Putz mit Farbspuren',
        dating: 'Bronze Age (pending)',
        dateFound: '2023-09-20',
        location_found: 'Room 1, Unit 117',
        depth: '~418.8-418.9m',
        grid_square: 'Trench 16, Room 1',
        excavation_unit: '117',
        condition: 'Fragment mit Farboberfläche',
        significance: 'Architectural decoration stratigraphy',
        notes: 'Paint presence indicates inhabited space with aesthetic treatment. Unit 117 only partially excavated; surfaces may continue at depth.',
        tags: ['Koumasa', 'Trench16', 'Architecture', 'Plaster', 'Paint', 'Unit117'],
        latitude: 35.2500,
        longitude: 25.0500,
        stratigraphy: 'Unit 117 lower occupation layer, below Unit 115 ceramic vessel cluster',
        images: ['partials/images/bilder/image copy 12.png']
    }
];

/**
 * Prüfe ob Demo-Projekt bereits existiert
 */
async function checkDemoProjectExists(targetUserId) {
    try {
        if (!auth.currentUser || !targetUserId) return false;

        const q = query(
            collection(db, 'projects'),
            where('title', '==', DEMO_PROJECT_NAME),
            where('owner', '==', targetUserId)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Fehler beim Prüfen des Demo-Projekts:', error);
        return false;
    }
}

async function getCurrentPublicProjectCount() {
    try {
        const publicProjectsQuery = query(
            collection(db, 'projects'),
            where('visibility', '==', 'public')
        );
        const publicProjectsSnapshot = await getDocs(publicProjectsQuery);
        return publicProjectsSnapshot.size;
    } catch (error) {
        console.error('❌ Fehler beim Zählen öffentlicher Projekte:', error);
        return 0;
    }
}

async function cleanupOwnerPublicProjects(ownerUserId, maxPublicProjects = MAX_PUBLIC_PROJECTS) {
    try {
        const ownerPublicProjectsQuery = query(
            collection(db, 'projects'),
            where('owner', '==', ownerUserId),
            where('visibility', '==', 'public')
        );
        const ownerPublicProjectsSnapshot = await getDocs(ownerPublicProjectsQuery);

        if (ownerPublicProjectsSnapshot.size <= maxPublicProjects) {
            return { cleaned: 0, total: ownerPublicProjectsSnapshot.size };
        }

        const docs = ownerPublicProjectsSnapshot.docs.slice();
        docs.sort((a, b) => {
            const aData = a.data() || {};
            const bData = b.data() || {};
            const aTime = toMillis(aData.updatedAt) || toMillis(aData.createdAt);
            const bTime = toMillis(bData.updatedAt) || toMillis(bData.createdAt);
            return bTime - aTime;
        });

        const toKeep = docs.slice(0, maxPublicProjects).map((docSnap) => docSnap.id);
        const toPrivatize = docs.slice(maxPublicProjects);

        for (const docSnap of toPrivatize) {
            await updateDoc(docSnap.ref, {
                visibility: 'private',
                isPublic: false,
                updatedAt: Timestamp.now()
            });
        }

        console.log(`🧹 Cleanup abgeschlossen: ${toPrivatize.length} öffentliche Projekte auf privat gesetzt (behalten: ${toKeep.length})`);
        return { cleaned: toPrivatize.length, total: ownerPublicProjectsSnapshot.size };
    } catch (error) {
        console.error('❌ Fehler beim Cleanup öffentlicher Projekte:', error);
        return { cleaned: 0, total: 0 };
    }
}

/**
 * Erstelle Demo-Projekt mit Demo-Funden
 */
export async function setupDemoData(targetUserId = null) {
    try {
        if (!auth.currentUser) {
            return {
                success: false,
                error: 'Benutzer nicht angemeldet'
            };
        }

        const ownerUserId = targetUserId || DEMO_TARGET_USER_ID || auth.currentUser.uid;
        if (!ownerUserId) {
            return {
                success: false,
                error: 'Keine Ziel-User-ID vorhanden'
            };
        }

        console.log('🚀 Starte Demo-Setup...');

        await cleanupOwnerPublicProjects(ownerUserId, MAX_PUBLIC_PROJECTS);

        // Prüfe ob Demo-Projekt bereits existiert
        const demoExists = await checkDemoProjectExists(ownerUserId);
        if (demoExists) {
            console.log('ℹ️ Demo-Projekt existiert bereits');

            // Stelle sicher, dass bestehendes Demo-Projekt die userId für "Meine Projekte" enthält
            const existingDemoQuery = query(
                collection(db, 'projects'),
                where('title', '==', DEMO_PROJECT_NAME),
                where('owner', '==', ownerUserId)
            );
            const existingDemoSnapshot = await getDocs(existingDemoQuery);

            for (const projectDocSnap of existingDemoSnapshot.docs) {
                const existingProject = projectDocSnap.data();
                if (!existingProject.userId) {
                    await updateDoc(projectDocSnap.ref, {
                        userId: ownerUserId,
                        updatedAt: Timestamp.now()
                    });
                    console.log('🔧 Bestehendes Demo-Projekt auf userId migriert:', projectDocSnap.id);
                }

                if (existingProject.datasetKey !== DEMO_DATASET_KEY) {
                    await updateDoc(projectDocSnap.ref, {
                        datasetKey: DEMO_DATASET_KEY,
                        updatedAt: Timestamp.now()
                    });
                    console.log('🔧 Bestehendes Demo-Projekt auf datasetKey migriert:', projectDocSnap.id);
                }

                const missingMediaFiles = !Array.isArray(existingProject.mediaFiles) || existingProject.mediaFiles.length < DEMO_IMAGES.length;
                if (missingMediaFiles || !existingProject.mediaBasePath) {
                    await updateDoc(projectDocSnap.ref, {
                        mediaBasePath: '/partials/images/bilder/',
                        mediaFiles: [...DEMO_IMAGES],
                        updatedAt: Timestamp.now()
                    });
                    console.log('🔧 Bestehendes Demo-Projekt auf vollständige Bilder-Galerie migriert:', projectDocSnap.id);
                }

                const existingFindsQuery = query(
                    collection(db, 'finds'),
                    where('projectId', '==', projectDocSnap.id)
                );
                const existingFindsSnapshot = await getDocs(existingFindsQuery);

                for (const findDocSnap of existingFindsSnapshot.docs) {
                    const existingFind = findDocSnap.data();
                    const missingAllImages = !Array.isArray(existingFind.images) || existingFind.images.length < DEMO_IMAGE_PATHS.length;
                    const hasRelativeImagePaths = Array.isArray(existingFind.images)
                        && existingFind.images.some((imagePath) => String(imagePath || '').startsWith('partials/'));
                    const hasRelativePhotoUrl = String(existingFind.photoUrl || '').startsWith('partials/');
                    const hasRelativeImage = String(existingFind.image || '').startsWith('partials/');

                    if (missingAllImages || !existingFind.photoUrl || !existingFind.image || hasRelativeImagePaths || hasRelativePhotoUrl || hasRelativeImage) {
                        const fallbackImage = DEMO_IMAGE_PATHS[0];
                        await updateDoc(findDocSnap.ref, {
                            images: [...DEMO_IMAGE_PATHS],
                            image: fallbackImage,
                            photoUrl: fallbackImage,
                            updatedAt: Timestamp.now()
                        });
                    }
                }
            }

            return {
                success: true,
                message: 'Demo-Projekt existiert bereits',
                skipped: true
            };
        }

        const publicProjectCount = await getCurrentPublicProjectCount();
        if (publicProjectCount >= MAX_PUBLIC_PROJECTS) {
            console.log(`ℹ️ Demo-Projekt übersprungen: Public-Limit (${MAX_PUBLIC_PROJECTS}) erreicht`);
            return {
                success: true,
                message: `Public-Limit (${MAX_PUBLIC_PROJECTS}) erreicht, keine zusätzliche Demo-Anlage`,
                skipped: true
            };
        }

        // Erstelle Projekt
        const projectDoc = {
            ...DEMO_PROJECT,
            userId: ownerUserId,
            owner: ownerUserId,
            datasetKey: DEMO_DATASET_KEY,
            ownerEmail: targetUserId ? null : auth.currentUser.email,
            ownerAvatar: auth.currentUser.photoURL || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            findCount: 0,
            memberCount: 1
        };

        const projectRef = await addDoc(collection(db, 'projects'), projectDoc);
        const projectId = projectRef.id;
        console.log(`✅ Demo-Projekt erstellt: ${projectId}`);

        // Erstelle Funde
        let findCount = 0;
        for (const findData of DEMO_FINDS) {
            const fallbackImage = DEMO_IMAGE_PATHS[findCount % DEMO_IMAGE_PATHS.length];

            const findDoc = {
                ...findData,
                projectId,
                images: [...DEMO_IMAGE_PATHS],
                image: fallbackImage,
                photoUrl: fallbackImage,
                creator: ownerUserId,
                creatorEmail: targetUserId ? null : auth.currentUser.email,
                creatorName: targetUserId ? DEMO_USER_NAME : (auth.currentUser.displayName || 'Demo User'),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                verified: false,
                featured: false,
                views: 0,
                likes: 0,
                status: 'Documented',
                visibility: 'public'
            };

            const findRef = await addDoc(collection(db, 'finds'), findDoc);
            findCount++;
            console.log(`   ✅ Fund ${findCount} erstellt: ${findData.name.substring(0, 30)}...`);
        }

        // Aktualisiere findCount des Projekts
        await updateDoc(doc(db, 'projects', projectId), {
            findCount: findCount,
            updatedAt: Timestamp.now()
        });

        console.log(`\n✅ Demo-Setup abgeschlossen!`);
        console.log(`📊 Zusammenfassung:`);
        console.log(`   - Projekt erstellt: ${projectId}`);
        console.log(`   - Funde erstellt: ${findCount}`);
        console.log(`   - Bilder-Pfad: partials/images/bilder/`);

        return {
            success: true,
            projectId,
            findCount,
            message: `Demo-Projekt mit ${findCount} Funden erfolgreich erstellt`
        };
    } catch (error) {
        console.error('❌ Fehler beim Demo-Setup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Lösche Demo-Projekt (optional)
 */
export async function deleteDemoProject() {
    try {
        const q = query(
            collection(db, 'projects'),
            where('title', '==', DEMO_PROJECT_NAME)
        );
        const querySnapshot = await getDocs(q);
        
        for (const docSnap of querySnapshot.docs) {
            // Lösche zuerst alle Funde dieses Projekts
            const findsQuery = query(
                collection(db, 'finds'),
                where('projectId', '==', docSnap.id)
            );
            const findsSnapshot = await getDocs(findsQuery);
            
            for (const findDoc of findsSnapshot.docs) {
                await deleteDoc(findDoc.ref);
            }
            
            // Dann lösche das Projekt
            await deleteDoc(docSnap.ref);
        }
        
        console.log('✅ Demo-Projekt gelöscht');
        return { success: true };
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Demo-Projekts:', error);
        return { success: false, error: error.message };
    }
}
