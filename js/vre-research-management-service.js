/**
 * VRE Research Management Service
 * Implements all functions described in the research project:
 * - Zone/Area Management
 * - CIDOC CRM Data Linking
 * - Hierarchical Data Organization
 * - Find Relationships and Linking
 * - Direct Upload Functionality
 * - Real-time Tracking and Filtering
 * - CRMarchaeo Support for Excavation Processes
 */

import { auth, db, storage } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs, 
    arrayUnion, 
    arrayRemove,
    addDoc,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * ==========================================
 * 1. ZONE/AREA MANAGEMENT
 * ==========================================
 */

/**
 * Zone Model - Represents excavation zones/areas
 */
export class ExcavationZone {
    constructor(data = {}) {
        this.id = data.id || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.coordinates = data.coordinates || { latitude: 0, longitude: 0 };
        this.area = data.area || 0; // in square meters
        this.depth = data.depth || 0; // in centimeters
        this.gridReference = data.gridReference || ''; // e.g., "A1", "B2"
        this.stratification = data.stratification || []; // layers/stratigraphic units
        this.status = data.status || 'planning'; // planning, active, completed
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
        this.createdBy = data.createdBy || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            excavationSiteId: this.excavationSiteId,
            name: this.name,
            description: this.description,
            coordinates: this.coordinates,
            area: this.area,
            depth: this.depth,
            gridReference: this.gridReference,
            stratification: this.stratification,
            status: this.status,
            startDate: this.startDate,
            endDate: this.endDate,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Create a new excavation zone
 * @param {string} excavationSiteId - Excavation site ID
 * @param {Object} zoneData - Zone data
 * @param {string} userId - User ID of creator
 * @returns {Promise<ExcavationZone>}
 */
export async function createZone(excavationSiteId, zoneData, userId) {
    try {
        const zonesRef = collection(db, 'excavationSites', excavationSiteId, 'zones');
        const newZoneRef = doc(zonesRef);

        const zone = new ExcavationZone({
            ...zoneData,
            id: newZoneRef.id,
            excavationSiteId: excavationSiteId,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(newZoneRef, zone.toJSON());
        console.log('✅ Excavation zone created:', newZoneRef.id);
        return zone;
    } catch (error) {
        console.error('❌ Error creating zone:', error);
        throw error;
    }
}

/**
 * Get zone by ID
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @returns {Promise<ExcavationZone>}
 */
export async function getZone(excavationSiteId, zoneId) {
    try {
        const docRef = doc(db, 'excavationSites', excavationSiteId, 'zones', zoneId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return new ExcavationZone({
                ...docSnap.data(),
                id: zoneId
            });
        } else {
            console.warn('⚠️ Zone not found:', zoneId);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching zone:', error);
        throw error;
    }
}

/**
 * Get all zones in excavation site
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<ExcavationZone[]>}
 */
export async function getZonesByExcavationSite(excavationSiteId) {
    try {
        const zonesRef = collection(db, 'excavationSites', excavationSiteId, 'zones');
        const querySnapshot = await getDocs(zonesRef);

        const zones = [];
        querySnapshot.forEach((doc) => {
            zones.push(new ExcavationZone({
                ...doc.data(),
                id: doc.id
            }));
        });

        return zones;
    } catch (error) {
        console.error('❌ Error fetching zones:', error);
        throw error;
    }
}

/**
 * Update zone
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<ExcavationZone>}
 */
export async function updateZone(excavationSiteId, zoneId, updates) {
    try {
        const docRef = doc(db, 'excavationSites', excavationSiteId, 'zones', zoneId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date()
        });

        const updated = await getZone(excavationSiteId, zoneId);
        console.log('✅ Zone updated:', zoneId);
        return updated;
    } catch (error) {
        console.error('❌ Error updating zone:', error);
        throw error;
    }
}

/**
 * Delete zone
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @returns {Promise<void>}
 */
export async function deleteZone(excavationSiteId, zoneId) {
    try {
        const docRef = doc(db, 'excavationSites', excavationSiteId, 'zones', zoneId);
        await deleteDoc(docRef);
        console.log('✅ Zone deleted:', zoneId);
    } catch (error) {
        console.error('❌ Error deleting zone:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 2. CIDOC CRM DATA LINKING
 * ==========================================
 */

/**
 * CIDOC CRM Relationship Model
 * Represents relationships between entities according to CIDOC CRM standard
 */
export class CIDOCCRMRelationship {
    constructor(data = {}) {
        this.id = data.id || null;
        this.sourceEntityId = data.sourceEntityId || null;
        this.sourceEntityType = data.sourceEntityType || ''; // Find, Zone, ExcavationSite, etc.
        this.targetEntityId = data.targetEntityId || null;
        this.targetEntityType = data.targetEntityType || '';
        this.relationshipType = data.relationshipType || ''; // E.g., "P25_moved_to", "P87_is_identified_by"
        this.description = data.description || '';
        this.properties = data.properties || {}; // Additional properties
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            sourceEntityId: this.sourceEntityId,
            sourceEntityType: this.sourceEntityType,
            targetEntityId: this.targetEntityId,
            targetEntityType: this.targetEntityType,
            relationshipType: this.relationshipType,
            description: this.description,
            properties: this.properties,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Create CIDOC CRM relationship between two entities
 * @param {Object} relationshipData - Relationship data
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<CIDOCCRMRelationship>}
 */
export async function createCIDOCRelationship(relationshipData, excavationSiteId) {
    try {
        const relRef = collection(db, 'excavationSites', excavationSiteId, 'relationships');
        const newRelRef = doc(relRef);

        const relationship = new CIDOCCRMRelationship({
            ...relationshipData,
            id: newRelRef.id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await setDoc(newRelRef, relationship.toJSON());
        console.log('✅ CIDOC CRM relationship created:', newRelRef.id);
        return relationship;
    } catch (error) {
        console.error('❌ Error creating CIDOC relationship:', error);
        throw error;
    }
}

/**
 * Get all relationships for an entity
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} entityId - Entity ID
 * @param {string} entityType - Entity type
 * @returns {Promise<CIDOCCRMRelationship[]>}
 */
export async function getEntityRelationships(excavationSiteId, entityId, entityType) {
    try {
        const relRef = collection(db, 'excavationSites', excavationSiteId, 'relationships');
        const q = query(
            relRef,
            where('sourceEntityId', '==', entityId),
            where('sourceEntityType', '==', entityType)
        );

        const querySnapshot = await getDocs(q);
        const relationships = [];

        querySnapshot.forEach((doc) => {
            relationships.push(new CIDOCCRMRelationship({
                ...doc.data(),
                id: doc.id
            }));
        });

        return relationships;
    } catch (error) {
        console.error('❌ Error fetching relationships:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 3. FIND LINKING AND RELATIONSHIPS
 * ==========================================
 */

/**
 * Link two finds together
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} sourceFindId - Source find ID
 * @param {string} targetFindId - Target find ID
 * @param {string} relationshipType - Type of relationship (e.g., "refits_to", "belongs_to", "adjacent_to")
 * @returns {Promise<void>}
 */
export async function linkFinds(excavationSiteId, sourceFindId, targetFindId, relationshipType = 'related_to') {
    try {
        // Create bidirectional relationship
        const findRef = doc(db, 'excavationSites', excavationSiteId, 'finds', sourceFindId);
        
        // Add the relationship metadata
        const relationship = {
            findId: targetFindId,
            type: relationshipType,
            linkedAt: new Date()
        };

        await updateDoc(findRef, {
            relatedFinds: arrayUnion(relationship)
        });

        console.log(`✅ Find ${sourceFindId} linked to ${targetFindId} with type: ${relationshipType}`);
    } catch (error) {
        console.error('❌ Error linking finds:', error);
        throw error;
    }
}

/**
 * Get all related finds
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} findId - Find ID
 * @returns {Promise<Array>}
 */
export async function getRelatedFinds(excavationSiteId, findId) {
    try {
        const findRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
        const findSnap = await getDoc(findRef);

        if (findSnap.exists()) {
            const find = findSnap.data();
            return find.relatedFinds || [];
        }

        return [];
    } catch (error) {
        console.error('❌ Error getting related finds:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 4. HIERARCHICAL DATA ORGANIZATION
 * ==========================================
 */

/**
 * Stratigraphy Unit Model - Represents layers in excavation
 */
export class StratigraphyUnit {
    constructor(data = {}) {
        this.id = data.id || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.zoneId = data.zoneId || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.level = data.level || 0; // Hierarchical level (0=top layer)
        this.depth = data.depth || { top: 0, bottom: 0 }; // in cm
        this.materials = data.materials || []; // Materials found in this layer
        this.parentUnitId = data.parentUnitId || null; // For hierarchical structure
        this.childUnitIds = data.childUnitIds || [];
        this.createdAt = data.createdAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            excavationSiteId: this.excavationSiteId,
            zoneId: this.zoneId,
            name: this.name,
            description: this.description,
            level: this.level,
            depth: this.depth,
            materials: this.materials,
            parentUnitId: this.parentUnitId,
            childUnitIds: this.childUnitIds,
            createdAt: this.createdAt
        };
    }
}

/**
 * Create stratigraphy unit
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} unitData - Unit data
 * @returns {Promise<StratigraphyUnit>}
 */
export async function createStratigraphyUnit(excavationSiteId, zoneId, unitData) {
    try {
        const unitsRef = collection(db, 'excavationSites', excavationSiteId, 'zones', zoneId, 'stratigraphyUnits');
        const newUnitRef = doc(unitsRef);

        const unit = new StratigraphyUnit({
            ...unitData,
            id: newUnitRef.id,
            excavationSiteId: excavationSiteId,
            zoneId: zoneId,
            createdAt: new Date()
        });

        await setDoc(newUnitRef, unit.toJSON());
        console.log('✅ Stratigraphy unit created:', newUnitRef.id);
        return unit;
    } catch (error) {
        console.error('❌ Error creating stratigraphy unit:', error);
        throw error;
    }
}

/**
 * Get hierarchical structure of excavation site
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<Object>} Hierarchical structure
 */
export async function getExcavationHierarchy(excavationSiteId) {
    try {
        const zonesRef = collection(db, 'excavationSites', excavationSiteId, 'zones');
        const zonesSnap = await getDocs(zonesRef);

        const hierarchy = {
            excavationSiteId: excavationSiteId,
            zones: []
        };

        for (const zoneDoc of zonesSnap.docs) {
            const zone = zoneDoc.data();
            const unitsRef = collection(db, 'excavationSites', excavationSiteId, 'zones', zoneDoc.id, 'stratigraphyUnits');
            const unitsSnap = await getDocs(unitsRef);

            zone.units = unitsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            hierarchy.zones.push({
                id: zoneDoc.id,
                ...zone
            });
        }

        return hierarchy;
    } catch (error) {
        console.error('❌ Error getting excavation hierarchy:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 5. DIRECT UPLOAD FUNCTIONALITY
 * ==========================================
 */

/**
 * Upload Model - Represents a direct upload session
 */
export class DirectUpload {
    constructor(data = {}) {
        this.id = data.id || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.zoneId = data.zoneId || null;
        this.uploadedBy = data.uploadedBy || null;
        this.uploadTimestamp = data.uploadTimestamp || new Date();
        this.location = data.location || { latitude: 0, longitude: 0, accuracy: 0 };
        this.finds = data.finds || []; // Array of find IDs
        this.photos = data.photos || [];
        this.notes = data.notes || '';
        this.status = data.status || 'pending'; // pending, processing, completed
        this.offline = data.offline || false; // Indicates if uploaded offline
    }

    toJSON() {
        return {
            id: this.id,
            excavationSiteId: this.excavationSiteId,
            zoneId: this.zoneId,
            uploadedBy: this.uploadedBy,
            uploadTimestamp: this.uploadTimestamp,
            location: this.location,
            finds: this.finds,
            photos: this.photos,
            notes: this.notes,
            status: this.status,
            offline: this.offline
        };
    }
}

/**
 * Create direct upload session
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} uploadData - Upload data
 * @param {string} userId - User ID
 * @returns {Promise<DirectUpload>}
 */
export async function createDirectUpload(excavationSiteId, zoneId, uploadData, userId) {
    try {
        const uploadsRef = collection(db, 'excavationSites', excavationSiteId, 'directUploads');
        const newUploadRef = doc(uploadsRef);

        const upload = new DirectUpload({
            ...uploadData,
            id: newUploadRef.id,
            excavationSiteId: excavationSiteId,
            zoneId: zoneId,
            uploadedBy: userId,
            uploadTimestamp: new Date()
        });

        await setDoc(newUploadRef, upload.toJSON());
        console.log('✅ Direct upload session created:', newUploadRef.id);
        return upload;
    } catch (error) {
        console.error('❌ Error creating direct upload:', error);
        throw error;
    }
}

/**
 * Process pending direct uploads
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<DirectUpload[]>}
 */
export async function getPendingUploads(excavationSiteId) {
    try {
        const uploadsRef = collection(db, 'excavationSites', excavationSiteId, 'directUploads');
        const q = query(uploadsRef, where('status', '==', 'pending'), orderBy('uploadTimestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const uploads = [];
        querySnapshot.forEach((doc) => {
            uploads.push(new DirectUpload({
                ...doc.data(),
                id: doc.id
            }));
        });

        return uploads;
    } catch (error) {
        console.error('❌ Error getting pending uploads:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 6. REAL-TIME TRACKING AND FILTERING
 * ==========================================
 */

/**
 * Find Filter Model
 */
export class FindFilter {
    constructor(data = {}) {
        this.material = data.material || null;
        this.category = data.category || null;
        this.zone = data.zone || null;
        this.period = data.period || null;
        this.status = data.status || null;
        this.discoveredBy = data.discoveredBy || null;
        this.dateRange = data.dateRange || { start: null, end: null };
        this.coordinates = data.coordinates || null; // For spatial filtering
    }
}

/**
 * Search and filter finds with real-time updates
 * @param {string} excavationSiteId - Excavation site ID
 * @param {FindFilter} filter - Filter criteria
 * @param {Function} onUpdate - Callback for real-time updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToFilteredFinds(excavationSiteId, filter, onUpdate) {
    try {
        const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
        let q = findsRef;

        // Build query based on filters
        const constraints = [];

        if (filter.material) {
            constraints.push(where('material', '==', filter.material));
        }

        if (filter.category) {
            constraints.push(where('category', '==', filter.category));
        }

        if (filter.zone) {
            constraints.push(where('zone', '==', filter.zone));
        }

        if (filter.status) {
            constraints.push(where('status', '==', filter.status));
        }

        if (constraints.length > 0) {
            q = query(findsRef, ...constraints, orderBy('discoveredAt', 'desc'));
        } else {
            q = query(findsRef, orderBy('discoveredAt', 'desc'));
        }

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const finds = [];
            snapshot.forEach((doc) => {
                finds.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            onUpdate(finds);
        });

        return unsubscribe;
    } catch (error) {
        console.error('❌ Error subscribing to filtered finds:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 7. CRMarchaeo SUPPORT - EXCAVATION PROCESSES
 * ==========================================
 */

/**
 * CRMarchaeo Excavation Activity Model
 * Represents excavation activities and processes
 */
export class ExcavationActivity {
    constructor(data = {}) {
        this.id = data.id || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.zoneId = data.zoneId || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.activityType = data.activityType || ''; // E.g., "excavation", "documentation", "sampling"
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
        this.participants = data.participants || [];
        this.findsAssociated = data.findsAssociated || [];
        this.methodology = data.methodology || ''; // Excavation technique description
        this.tools = data.tools || []; // Tools used
        this.documentation = data.documentation || {
            photos: [],
            drawings: [],
            notes: []
        };
        this.createdAt = data.createdAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            excavationSiteId: this.excavationSiteId,
            zoneId: this.zoneId,
            name: this.name,
            description: this.description,
            activityType: this.activityType,
            startDate: this.startDate,
            endDate: this.endDate,
            participants: this.participants,
            findsAssociated: this.findsAssociated,
            methodology: this.methodology,
            tools: this.tools,
            documentation: this.documentation,
            createdAt: this.createdAt
        };
    }
}

/**
 * Create excavation activity (CRMarchaeo)
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} activityData - Activity data
 * @returns {Promise<ExcavationActivity>}
 */
export async function createExcavationActivity(excavationSiteId, zoneId, activityData) {
    try {
        const activitiesRef = collection(db, 'excavationSites', excavationSiteId, 'zones', zoneId, 'excavationActivities');
        const newActivityRef = doc(activitiesRef);

        const activity = new ExcavationActivity({
            ...activityData,
            id: newActivityRef.id,
            excavationSiteId: excavationSiteId,
            zoneId: zoneId,
            createdAt: new Date()
        });

        await setDoc(newActivityRef, activity.toJSON());
        console.log('✅ Excavation activity created:', newActivityRef.id);
        return activity;
    } catch (error) {
        console.error('❌ Error creating excavation activity:', error);
        throw error;
    }
}

/**
 * Get all excavation activities in a zone
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @returns {Promise<ExcavationActivity[]>}
 */
export async function getExcavationActivities(excavationSiteId, zoneId) {
    try {
        const activitiesRef = collection(db, 'excavationSites', excavationSiteId, 'zones', zoneId, 'excavationActivities');
        const q = query(activitiesRef, orderBy('startDate', 'desc'));
        const querySnapshot = await getDocs(q);

        const activities = [];
        querySnapshot.forEach((doc) => {
            activities.push(new ExcavationActivity({
                ...doc.data(),
                id: doc.id
            }));
        });

        return activities;
    } catch (error) {
        console.error('❌ Error fetching excavation activities:', error);
        throw error;
    }
}

/**
 * ==========================================
 * 8. DATA STATISTICS AND ANALYTICS
 * ==========================================
 */

/**
 * Get excavation statistics
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getExcavationStatistics(excavationSiteId) {
    try {
        const zones = await getZonesByExcavationSite(excavationSiteId);
        
        let totalFinds = 0;
        let totalZones = zones.length;
        let materialsCount = {};
        let categoriesCount = {};

        for (const zone of zones) {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'zones', zone.id, 'finds');
            const findsSnap = await getDocs(findsRef);
            
            findsSnap.forEach((doc) => {
                const find = doc.data();
                totalFinds++;
                
                // Count materials
                if (find.material) {
                    materialsCount[find.material] = (materialsCount[find.material] || 0) + 1;
                }
                
                // Count categories
                if (find.category) {
                    categoriesCount[find.category] = (categoriesCount[find.category] || 0) + 1;
                }
            });
        }

        return {
            totalFinds,
            totalZones,
            materialsCount,
            categoriesCount,
            generatedAt: new Date()
        };
    } catch (error) {
        console.error('❌ Error getting excavation statistics:', error);
        throw error;
    }
}

export default {
    // Zone Management
    createZone,
    getZone,
    getZonesByExcavationSite,
    updateZone,
    deleteZone,

    // CIDOC CRM
    createCIDOCRelationship,
    getEntityRelationships,

    // Find Linking
    linkFinds,
    getRelatedFinds,

    // Hierarchical Organization
    createStratigraphyUnit,
    getExcavationHierarchy,

    // Direct Upload
    createDirectUpload,
    getPendingUploads,

    // Real-time Filtering
    subscribeToFilteredFinds,

    // CRMarchaeo
    createExcavationActivity,
    getExcavationActivities,

    // Analytics
    getExcavationStatistics,

    // Models
    ExcavationZone,
    CIDOCCRMRelationship,
    StratigraphyUnit,
    DirectUpload,
    FindFilter,
    ExcavationActivity
};
