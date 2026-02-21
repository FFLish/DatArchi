/**
 * API Reference - VRE Research Management Service
 * 
 * Complete API documentation for all implemented functions
 */

/**
 * ==========================================
 * ZONE/AREA MANAGEMENT API
 * ==========================================
 */

/**
 * createZone(excavationSiteId, zoneData, userId)
 * 
 * Creates a new excavation zone/area
 * 
 * @param {string} excavationSiteId - ID of the parent excavation site
 * @param {Object} zoneData - Zone configuration
 *   - name {string} - Zone name
 *   - description {string} - Detailed description
 *   - coordinates {Object} - Geographic coordinates
 *     - latitude {number}
 *     - longitude {number}
 *   - area {number} - Area in square meters
 *   - depth {number} - Depth in centimeters
 *   - gridReference {string} - Grid reference (e.g., "A1", "B2")
 *   - stratification {Array} - Array of stratigraphic units
 *   - status {string} - "planning" | "active" | "completed"
 *   - startDate {Date} - Start of excavation
 *   - endDate {Date} - End of excavation
 * @param {string} userId - ID of zone creator
 * @returns {Promise<ExcavationZone>} Created zone object
 * 
 * @example
 * const zone = await createZone(siteId, {
 *   name: 'Zone A',
 *   coordinates: { latitude: 50.1109, longitude: 8.6821 },
 *   area: 100,
 *   depth: 250,
 *   gridReference: 'A1'
 * }, userId);
 */

/**
 * getZone(excavationSiteId, zoneId)
 * 
 * Retrieves a specific zone by ID
 * 
 * @param {string} excavationSiteId - Parent excavation site ID
 * @param {string} zoneId - Zone ID to retrieve
 * @returns {Promise<ExcavationZone|null>} Zone object or null if not found
 */

/**
 * getZonesByExcavationSite(excavationSiteId)
 * 
 * Retrieves all zones in an excavation site
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<ExcavationZone[]>} Array of zones
 */

/**
 * updateZone(excavationSiteId, zoneId, updates)
 * 
 * Updates zone information
 * 
 * @param {string} excavationSiteId - Parent excavation site ID
 * @param {string} zoneId - Zone ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<ExcavationZone>} Updated zone object
 */

/**
 * deleteZone(excavationSiteId, zoneId)
 * 
 * Deletes a zone and all associated data
 * 
 * @param {string} excavationSiteId - Parent excavation site ID
 * @param {string} zoneId - Zone ID to delete
 * @returns {Promise<void>}
 */

/**
 * ==========================================
 * CIDOC CRM DATA LINKING API
 * ==========================================
 */

/**
 * createCIDOCRelationship(relationshipData, excavationSiteId)
 * 
 * Creates a CIDOC CRM relationship between two entities
 * Implements international archaeological data linking standard
 * 
 * @param {Object} relationshipData - Relationship configuration
 *   - sourceEntityId {string} - ID of source entity
 *   - sourceEntityType {string} - Type of source (Find, Zone, ExcavationSite)
 *   - targetEntityId {string} - ID of target entity
 *   - targetEntityType {string} - Type of target
 *   - relationshipType {string} - CIDOC property (e.g., P25_moved_to, P87_is_identified_by)
 *   - description {string} - Relationship description
 *   - properties {Object} - Additional properties
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<CIDOCCRMRelationship>} Created relationship
 * 
 * @example
 * // Link a find to its location
 * const rel = await createCIDOCRelationship({
 *   sourceEntityId: findId,
 *   sourceEntityType: 'Find',
 *   targetEntityId: zoneId,
 *   targetEntityType: 'Zone',
 *   relationshipType: 'P25_moved_to',
 *   description: 'Find location'
 * }, excavationSiteId);
 */

/**
 * getEntityRelationships(excavationSiteId, entityId, entityType)
 * 
 * Retrieves all relationships for a specific entity
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} entityId - Entity ID
 * @param {string} entityType - Entity type (Find, Zone, etc.)
 * @returns {Promise<CIDOCCRMRelationship[]>} Array of relationships
 */

/**
 * ==========================================
 * FIND LINKING API
 * ==========================================
 */

/**
 * linkFinds(excavationSiteId, sourceFindId, targetFindId, relationshipType)
 * 
 * Links two finds together with a specific relationship type
 * Creates bidirectional relationship data
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} sourceFindId - Source find ID
 * @param {string} targetFindId - Target find ID
 * @param {string} relationshipType - Type of relationship
 *   Options: "refits_to", "belongs_to", "adjacent_to", "related_to", "contains"
 * @returns {Promise<void>}
 * 
 * @example
 * // Link pottery fragments that refit together
 * await linkFinds(siteId, pottery1, pottery2, 'refits_to');
 */

/**
 * getRelatedFinds(excavationSiteId, findId)
 * 
 * Retrieves all finds related to a specific find
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} findId - Find ID to get relationships for
 * @returns {Promise<Array>} Array of related find references
 *   Each item: { findId, type, linkedAt }
 */

/**
 * ==========================================
 * HIERARCHICAL ORGANIZATION API
 * ==========================================
 */

/**
 * createStratigraphyUnit(excavationSiteId, zoneId, unitData)
 * 
 * Creates a stratigraphic unit (layer) in Harris Matrix format
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} unitData - Stratigraphy configuration
 *   - name {string} - Unit name (e.g., "Layer 1 - Topsoil")
 *   - description {string} - Description
 *   - level {number} - Hierarchical level (0=top)
 *   - depth {Object} - Depth range
 *     - top {number} - Depth at top (cm)
 *     - bottom {number} - Depth at bottom (cm)
 *   - materials {Array<string>} - Materials found (pottery, bone, etc.)
 *   - parentUnitId {string} - Parent unit ID for hierarchy
 *   - childUnitIds {Array<string>} - Child unit IDs
 * @returns {Promise<StratigraphyUnit>} Created unit
 * 
 * @example
 * const layer = await createStratigraphyUnit(siteId, zoneId, {
 *   name: 'Layer 1 - Topsoil',
 *   level: 0,
 *   depth: { top: 0, bottom: 25 },
 *   materials: ['soil', 'modern_debris']
 * });
 */

/**
 * getExcavationHierarchy(excavationSiteId)
 * 
 * Retrieves complete hierarchical structure of excavation
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<Object>} Hierarchical structure
 *   {
 *     excavationSiteId: string,
 *     zones: [{
 *       id: string,
 *       name: string,
 *       ... zone data ...,
 *       units: [{ id, ... }]
 *     }]
 *   }
 */

/**
 * ==========================================
 * DIRECT UPLOAD API
 * ==========================================
 */

/**
 * createDirectUpload(excavationSiteId, zoneId, uploadData, userId)
 * 
 * Creates a direct upload session for on-site data collection
 * Supports offline mode with GPS location tracking
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} uploadData - Upload configuration
 *   - location {Object} - GPS location
 *     - latitude {number}
 *     - longitude {number}
 *     - accuracy {number} - Accuracy in meters
 *   - finds {Array<string>} - Find IDs to include
 *   - photos {Array<string>} - Photo URLs
 *   - notes {string} - Field notes
 *   - offline {boolean} - Whether uploaded offline
 * @param {string} userId - User ID performing upload
 * @returns {Promise<DirectUpload>} Created upload session
 * 
 * @example
 * const upload = await createDirectUpload(siteId, zoneId, {
 *   location: { latitude: 50.1109, longitude: 8.6821, accuracy: 3 },
 *   notes: 'Afternoon excavation',
 *   offline: false
 * }, userId);
 */

/**
 * getPendingUploads(excavationSiteId)
 * 
 * Retrieves all pending (not yet processed) uploads
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<DirectUpload[]>} Array of pending uploads
 */

/**
 * ==========================================
 * REAL-TIME FILTERING API
 * ==========================================
 */

/**
 * class FindFilter
 * 
 * Filter configuration for find searches
 * 
 * Properties:
 *   - material {string|null} - Material type filter
 *   - category {string|null} - Category filter
 *   - zone {string|null} - Zone ID filter
 *   - period {string|null} - Historical period filter
 *   - status {string|null} - Status filter (documented, analyzed, published)
 *   - discoveredBy {string|null} - Discoverer user ID filter
 *   - dateRange {Object|null} - Date range filter
 *     - start {Date}
 *     - end {Date}
 *   - coordinates {Object|null} - Spatial filter (for future use)
 * 
 * @example
 * const filter = new FindFilter({
 *   material: 'pottery',
 *   category: 'ceramics',
 *   zone: 'A1'
 * });
 */

/**
 * subscribeToFilteredFinds(excavationSiteId, filter, onUpdate)
 * 
 * Subscribes to real-time filtered find updates
 * Uses Firebase real-time listeners for instant updates
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {FindFilter} filter - Filter criteria
 * @param {Function} onUpdate - Callback function
 *   Called with: (finds: Array<Find>) => void
 * @returns {Function} Unsubscribe function
 * 
 * @example
 * const filter = new FindFilter({
 *   material: 'pottery'
 * });
 * 
 * const unsubscribe = subscribeToFilteredFinds(siteId, filter, (finds) => {
 *   console.log('Found:', finds.length);
 *   updateUI(finds);
 * });
 * 
 * // Later, unsubscribe
 * unsubscribe();
 */

/**
 * ==========================================
 * CRMarchaeo EXCAVATION ACTIVITY API
 * ==========================================
 */

/**
 * createExcavationActivity(excavationSiteId, zoneId, activityData)
 * 
 * Creates an excavation activity record (CRMarchaeo)
 * Tracks detailed excavation processes and methodologies
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @param {Object} activityData - Activity configuration
 *   - name {string} - Activity name
 *   - description {string} - Description
 *   - activityType {string} - Type (excavation, documentation, sampling, etc.)
 *   - startDate {Date} - Start date
 *   - endDate {Date} - End date
 *   - participants {Array<string>} - Participant user IDs
 *   - findsAssociated {Array<string>} - Associated find IDs
 *   - methodology {string} - Excavation technique description
 *   - tools {Array<string>} - Tools used
 *   - documentation {Object} - Associated documentation
 *     - photos {Array<string>}
 *     - drawings {Array<string>}
 *     - notes {Array<string>}
 * @returns {Promise<ExcavationActivity>} Created activity
 * 
 * @example
 * const activity = await createExcavationActivity(siteId, zoneId, {
 *   name: 'Layer 3 Excavation',
 *   activityType: 'excavation',
 *   startDate: new Date('2024-06-15'),
 *   methodology: 'Harris Matrix',
 *   tools: ['trowel', 'brush', 'camera'],
 *   participants: [userId]
 * });
 */

/**
 * getExcavationActivities(excavationSiteId, zoneId)
 * 
 * Retrieves all excavation activities in a zone
 * Ordered by start date (most recent first)
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @param {string} zoneId - Zone ID
 * @returns {Promise<ExcavationActivity[]>} Array of activities
 */

/**
 * ==========================================
 * STATISTICS & ANALYTICS API
 * ==========================================
 */

/**
 * getExcavationStatistics(excavationSiteId)
 * 
 * Generates comprehensive statistics for an excavation
 * 
 * @param {string} excavationSiteId - Excavation site ID
 * @returns {Promise<Object>} Statistics object
 *   {
 *     totalFinds: number,
 *     totalZones: number,
 *     materialsCount: { [material]: count },
 *     categoriesCount: { [category]: count },
 *     generatedAt: Date
 *   }
 */

/**
 * ==========================================
 * DATA MODELS
 * ==========================================
 */

/**
 * ExcavationZone
 * Represents a physical excavation area/zone
 * 
 * Properties:
 *   - id: string
 *   - excavationSiteId: string
 *   - name: string
 *   - description: string
 *   - coordinates: { latitude, longitude }
 *   - area: number (m²)
 *   - depth: number (cm)
 *   - gridReference: string
 *   - stratification: StratigraphyUnit[]
 *   - status: "planning" | "active" | "completed"
 *   - startDate: Date | null
 *   - endDate: Date | null
 *   - createdBy: string
 *   - createdAt: Date
 *   - updatedAt: Date
 */

/**
 * CIDOCCRMRelationship
 * Represents a CIDOC CRM relationship between entities
 * 
 * Properties:
 *   - id: string
 *   - sourceEntityId: string
 *   - sourceEntityType: string
 *   - targetEntityId: string
 *   - targetEntityType: string
 *   - relationshipType: string (CIDOC property)
 *   - description: string
 *   - properties: Object
 *   - createdAt: Date
 *   - updatedAt: Date
 */

/**
 * StratigraphyUnit
 * Represents a stratigraphic layer in Harris Matrix format
 * 
 * Properties:
 *   - id: string
 *   - excavationSiteId: string
 *   - zoneId: string
 *   - name: string
 *   - description: string
 *   - level: number (0=top layer)
 *   - depth: { top: number, bottom: number }
 *   - materials: string[]
 *   - parentUnitId: string | null
 *   - childUnitIds: string[]
 *   - createdAt: Date
 */

/**
 * DirectUpload
 * Represents a direct data upload session
 * 
 * Properties:
 *   - id: string
 *   - excavationSiteId: string
 *   - zoneId: string
 *   - uploadedBy: string
 *   - uploadTimestamp: Date
 *   - location: { latitude, longitude, accuracy }
 *   - finds: string[]
 *   - photos: string[]
 *   - notes: string
 *   - status: "pending" | "processing" | "completed"
 *   - offline: boolean
 */

/**
 * ExcavationActivity (CRMarchaeo)
 * Represents a detailed excavation activity/process
 * 
 * Properties:
 *   - id: string
 *   - excavationSiteId: string
 *   - zoneId: string
 *   - name: string
 *   - description: string
 *   - activityType: string
 *   - startDate: Date
 *   - endDate: Date | null
 *   - participants: string[]
 *   - findsAssociated: string[]
 *   - methodology: string
 *   - tools: string[]
 *   - documentation: { photos, drawings, notes }
 *   - createdAt: Date
 */

/**
 * ==========================================
 * ERROR HANDLING
 * ==========================================
 * 
 * All functions throw descriptive errors with context:
 * 
 * - "Excavation site not found"
 * - "Error creating zone: [Firebase error message]"
 * - "Error fetching relationships: [details]"
 * 
 * All errors are logged to console with ❌ prefix
 * Success messages logged with ✅ prefix
 */

/**
 * ==========================================
 * BEST PRACTICES
 * ==========================================
 * 
 * 1. Always handle errors with try-catch blocks
 * 2. Use appropriate filters to reduce query results
 * 3. Unsubscribe from real-time listeners when done
 * 4. Validate input data before creating entities
 * 5. Use transactions for multi-step operations
 * 6. Regularly back up excavation data
 * 7. Document excavation processes thoroughly
 */

export default {
    // This file is documentation only
    // Import actual functions from vre-research-management-service.js
};
