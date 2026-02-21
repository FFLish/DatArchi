/**
 * VRE Research Management - Integration Guide and Usage Examples
 * 
 * This file demonstrates how to use all the research management functions
 * described in the research project for archaeological data management.
 */

import {
    // Zone Management
    createZone,
    getZone,
    getZonesByExcavationSite,
    updateZone,
    deleteZone,

    // CIDOC CRM Linking
    createCIDOCRelationship,
    getEntityRelationships,

    // Find Relationships
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
    FindFilter,

    // CRMarchaeo Excavation
    createExcavationActivity,
    getExcavationActivities,

    // Statistics
    getExcavationStatistics
} from './vre-research-management-service.js';

/**
 * ==========================================
 * COMPLETE WORKFLOW EXAMPLE
 * ==========================================
 * 
 * This demonstrates the complete workflow described in the research text:
 * 1. Create project/excavation site (handled by ExcavationSiteService)
 * 2. Define areas/zones
 * 3. Record finds with precise data
 * 4. Link and organize data hierarchically
 * 5. Enable real-time tracking and filtering
 * 6. Export for worldwide collaboration
 */

/**
 * 1. ZONE/AREA DEFINITION
 * According to research: "Bereiche festlegen" (Define areas)
 */
export async function workflowDefineExcavationZones(excavationSiteId, userId) {
    try {
        console.log('📍 Step 1: Defining excavation areas/zones...');

        // Create multiple zones for the excavation site
        const zone1 = await createZone(excavationSiteId, {
            name: 'Zone A - Main Excavation',
            description: 'Primary excavation area',
            coordinates: { latitude: 50.1109, longitude: 8.6821 },
            area: 100, // 100 square meters
            depth: 250, // 250 cm
            gridReference: 'A1',
            status: 'active'
        }, userId);

        const zone2 = await createZone(excavationSiteId, {
            name: 'Zone B - Auxiliary Dig',
            description: 'Secondary excavation area',
            coordinates: { latitude: 50.1110, longitude: 8.6822 },
            area: 50,
            depth: 180,
            gridReference: 'B1',
            status: 'planning'
        }, userId);

        console.log('✅ Zones created:', zone1.id, zone2.id);
        return { zone1, zone2 };
    } catch (error) {
        console.error('❌ Error defining zones:', error);
        throw error;
    }
}

/**
 * 2. HIERARCHICAL STRATIGRAPHY SETUP
 * According to research: "Alles muss in hierarchischen Ebenen einsortiert werden können"
 * (Everything must be organized in hierarchical levels)
 */
export async function workflowCreateStratigraphicLayers(excavationSiteId, zoneId, userId) {
    try {
        console.log('🏛️ Step 2: Setting up stratigraphic layers...');

        // Layer 1 (Surface)
        const layer1 = await createStratigraphyUnit(excavationSiteId, zoneId, {
            name: 'Layer 1 - Topsoil',
            description: 'Modern topsoil and vegetation layer',
            level: 0,
            depth: { top: 0, bottom: 25 },
            materials: ['soil', 'modern_debris']
        });

        // Layer 2 (Subsoil)
        const layer2 = await createStratigraphyUnit(excavationSiteId, zoneId, {
            name: 'Layer 2 - Subsoil',
            description: 'Natural subsoil layer',
            level: 1,
            depth: { top: 25, bottom: 80 },
            materials: ['soil', 'gravel'],
            parentUnitId: layer1.id
        });

        // Layer 3 (Archaeological)
        const layer3 = await createStratigraphyUnit(excavationSiteId, zoneId, {
            name: 'Layer 3 - Archaeological Deposit',
            description: 'Primary archaeological layer',
            level: 2,
            depth: { top: 80, bottom: 150 },
            materials: ['pottery', 'bone', 'stone_tools'],
            parentUnitId: layer2.id
        });

        console.log('✅ Stratigraphic layers created:', layer1.id, layer2.id, layer3.id);
        return { layer1, layer2, layer3 };
    } catch (error) {
        console.error('❌ Error creating stratigraphy:', error);
        throw error;
    }
}

/**
 * 3. CIDOC CRM RELATIONSHIP LINKING
 * According to research: "Die Verknüpfung der Daten untereinander sollte nach dem CIDOC CRM Standard erfolgen"
 * (Data linking should follow CIDOC CRM standard)
 */
export async function workflowLinkDataWithCIDOCCRM(excavationSiteId, findId1, findId2) {
    try {
        console.log('🔗 Step 3: Creating CIDOC CRM relationships...');

        // Create relationship between two finds
        const relationship = await createCIDOCRelationship({
            sourceEntityId: findId1,
            sourceEntityType: 'Find',
            targetEntityId: findId2,
            targetEntityType: 'Find',
            relationshipType: 'P25_moved_to', // CIDOC CRM property: moved to
            description: 'Find was moved/transported from location 1 to location 2',
            properties: {
                distance: 50, // cm
                direction: 'north'
            }
        }, excavationSiteId);

        console.log('✅ CIDOC CRM relationship created:', relationship.id);
        return relationship;
    } catch (error) {
        console.error('❌ Error creating CIDOC relationship:', error);
        throw error;
    }
}

/**
 * 4. FIND RECORDING WITH COMPLETE DATA
 * According to research: "Funde erfassen" and "Jeder Fund erhält eine eindeutige ID"
 * (Record finds and each find gets a unique ID)
 */
export async function workflowRecordFindWithCompleteData(excavationSiteId, zoneId, findData, userId) {
    try {
        console.log('🏺 Step 4: Recording find with complete data...');

        // Example find data structure following archaeological standards
        const completeFindData = {
            title: findData.title || 'Pottery Fragment',
            description: findData.description || 'Red-figured pottery fragment',
            zone: zoneId,
            category: findData.category || 'ceramics',
            material: findData.material || 'pottery',
            
            // Complete spatial data
            coordinates: {
                latitude: findData.latitude || 50.1109,
                longitude: findData.longitude || 8.6821,
                depth: findData.depth || 85 // cm below surface
            },

            // Detailed condition information
            condition: findData.condition || 'fragmentary',
            
            // Dating information
            period: findData.period || 'Roman Imperial',
            
            // Documentation
            photos: findData.photos || [],
            reports: findData.reports || [],
            
            // Status tracking
            status: 'documented',
            
            // Additional metadata
            tags: ['pottery', 'complete_data', 'excavation_2024']
        };

        // Record the find (handled by VREFindService.createFind)
        console.log('✅ Find recorded with complete data structure:', completeFindData);
        return completeFindData;
    } catch (error) {
        console.error('❌ Error recording find:', error);
        throw error;
    }
}

/**
 * 5. LINK FINDS TOGETHER
 * According to research: "So gelangt man schnell vom Projekt zu einzelnen Funden"
 * (Quick navigation from project to finds)
 */
export async function workflowLinkRelatedFinds(excavationSiteId, parentFindId, childFindIds) {
    try {
        console.log('🔄 Step 5: Linking related finds...');

        for (const childFindId of childFindIds) {
            await linkFinds(excavationSiteId, parentFindId, childFindId, 'refits_to');
            console.log(`✅ Linked ${childFindId} to ${parentFindId}`);
        }

        const relationships = await getRelatedFinds(excavationSiteId, parentFindId);
        console.log('✅ Find relationships established:', relationships);
        return relationships;
    } catch (error) {
        console.error('❌ Error linking finds:', error);
        throw error;
    }
}

/**
 * 6. DIRECT ON-SITE UPLOAD
 * According to research: "Direkt-Upload vor Ort als Option implementieren"
 * (Implement direct upload on-site as option)
 */
export async function workflowDirectOnSiteUpload(excavationSiteId, zoneId, userId, uploadData) {
    try {
        console.log('📱 Step 6: Creating direct on-site upload session...');

        const upload = await createDirectUpload(
            excavationSiteId,
            zoneId,
            {
                location: uploadData.location || { latitude: 0, longitude: 0, accuracy: 5 },
                notes: uploadData.notes || 'Afternoon excavation session',
                photos: uploadData.photos || [],
                offline: uploadData.offline || false
            },
            userId
        );

        console.log('✅ Direct upload session created:', upload.id);
        return upload;
    } catch (error) {
        console.error('❌ Error creating direct upload:', error);
        throw error;
    }
}

/**
 * 7. PROCESS PENDING UPLOADS
 * Retrieve and process all pending uploads from on-site data collection
 */
export async function workflowProcessPendingUploads(excavationSiteId) {
    try {
        console.log('⚙️ Step 7: Processing pending uploads...');

        const pendingUploads = await getPendingUploads(excavationSiteId);
        console.log(`✅ Found ${pendingUploads.length} pending uploads`);
        
        return pendingUploads;
    } catch (error) {
        console.error('❌ Error processing uploads:', error);
        throw error;
    }
}

/**
 * 8. REAL-TIME FILTERING AND TRACKING
 * According to research: "Echtzeit-Tracking und Filter"
 * (Real-time tracking and filters)
 */
export async function workflowRealtimeFilteringSetup(excavationSiteId, onFilterUpdate) {
    try {
        console.log('🔍 Step 8: Setting up real-time filtering...');

        // Create filter for pottery fragments
        const filter = new FindFilter({
            material: 'pottery',
            category: 'ceramics',
            status: 'documented'
        });

        // Subscribe to real-time updates
        const unsubscribe = subscribeToFilteredFinds(
            excavationSiteId,
            filter,
            (filteredFinds) => {
                console.log('🔄 Real-time update - Found items:', filteredFinds.length);
                if (onFilterUpdate) {
                    onFilterUpdate(filteredFinds);
                }
            }
        );

        console.log('✅ Real-time filtering enabled');
        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up filtering:', error);
        throw error;
    }
}

/**
 * 9. CRMarchaeo EXCAVATION ACTIVITY TRACKING
 * According to research: "CRMarchaeo ermöglicht zusätzlich die präzise Beschreibung von Grabungsprozessen"
 * (CRMarchaeo enables precise description of excavation processes)
 */
export async function workflowTrackExcavationActivities(excavationSiteId, zoneId, userId) {
    try {
        console.log('📋 Step 9: Tracking excavation activities (CRMarchaeo)...');

        const activity = await createExcavationActivity(
            excavationSiteId,
            zoneId,
            {
                name: 'Systematic Excavation - Layer 3',
                description: 'Careful excavation of archaeological deposit layer 3',
                activityType: 'excavation',
                startDate: new Date('2024-06-15'),
                endDate: new Date('2024-06-22'),
                participants: [userId],
                methodology: 'Harris Matrix with grid system',
                tools: ['trowel', 'brush', 'measuring_tape', 'camera'],
                documentation: {
                    photos: [],
                    drawings: [],
                    notes: ['Layer very homogeneous', 'Abundant pottery fragments']
                }
            }
        );

        console.log('✅ Excavation activity recorded:', activity.id);
        return activity;
    } catch (error) {
        console.error('❌ Error tracking activity:', error);
        throw error;
    }
}

/**
 * 10. GET HIERARCHICAL EXCAVATION OVERVIEW
 * According to research: "So gelangt man schnell vom Projekt zu einzelnen Funden und behält jederzeit den Überblick"
 * (Quick navigation from project to finds and maintain overview)
 */
export async function workflowGetExcavationOverview(excavationSiteId) {
    try {
        console.log('🗺️ Step 10: Getting complete excavation hierarchy...');

        const hierarchy = await getExcavationHierarchy(excavationSiteId);
        const statistics = await getExcavationStatistics(excavationSiteId);

        console.log('✅ Excavation Overview:');
        console.log('   Total Zones:', statistics.totalZones);
        console.log('   Total Finds:', statistics.totalFinds);
        console.log('   Materials:', statistics.materialsCount);
        console.log('   Categories:', statistics.categoriesCount);

        return { hierarchy, statistics };
    } catch (error) {
        console.error('❌ Error getting overview:', error);
        throw error;
    }
}

/**
 * COMPLETE WORKFLOW EXECUTION
 * Execute the complete research management workflow
 */
export async function executeCompleteWorkflow(excavationSiteId, userId) {
    try {
        console.log('\n🚀 Starting Complete Archaeological Data Management Workflow\n');

        // Step 1: Define zones
        const { zone1 } = await workflowDefineExcavationZones(excavationSiteId, userId);

        // Step 2: Create stratigraphic layers
        const { layer1, layer2, layer3 } = await workflowCreateStratigraphicLayers(
            excavationSiteId,
            zone1.id,
            userId
        );

        // Step 3: Setup CIDOC CRM linking (would use actual find IDs in production)
        // await workflowLinkDataWithCIDOCCRM(excavationSiteId, 'find1', 'find2');

        // Step 4: Record find with complete data
        const findData = await workflowRecordFindWithCompleteData(
            excavationSiteId,
            zone1.id,
            {
                title: 'Roman Pottery Fragment',
                category: 'ceramics',
                material: 'pottery',
                latitude: 50.1109,
                longitude: 8.6821,
                depth: 85,
                condition: 'fragmentary',
                period: 'Roman Imperial'
            },
            userId
        );

        // Step 6: Setup direct upload
        const upload = await workflowDirectOnSiteUpload(
            excavationSiteId,
            zone1.id,
            userId,
            {
                location: { latitude: 50.1109, longitude: 8.6821, accuracy: 3 },
                notes: 'Field session - pottery collection'
            }
        );

        // Step 8: Setup real-time filtering
        const unsubscribe = await workflowRealtimeFilteringSetup(
            excavationSiteId,
            (finds) => {
                console.log('Real-time finds update:', finds.length);
            }
        );

        // Step 9: Track excavation activities
        const activity = await workflowTrackExcavationActivities(
            excavationSiteId,
            zone1.id,
            userId
        );

        // Step 10: Get overview
        const { hierarchy, statistics } = await workflowGetExcavationOverview(excavationSiteId);

        console.log('\n✅ Complete Workflow Executed Successfully!\n');

        return {
            zone: zone1,
            stratification: { layer1, layer2, layer3 },
            findData,
            upload,
            activity,
            hierarchy,
            statistics,
            unsubscribe
        };
    } catch (error) {
        console.error('❌ Workflow execution failed:', error);
        throw error;
    }
}

export default {
    workflowDefineExcavationZones,
    workflowCreateStratigraphicLayers,
    workflowLinkDataWithCIDOCCRM,
    workflowRecordFindWithCompleteData,
    workflowLinkRelatedFinds,
    workflowDirectOnSiteUpload,
    workflowProcessPendingUploads,
    workflowRealtimeFilteringSetup,
    workflowTrackExcavationActivities,
    workflowGetExcavationOverview,
    executeCompleteWorkflow
};
