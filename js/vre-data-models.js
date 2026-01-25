/**
 * VRE Data Models
 * Defines the core data structures for the Virtual Research Environment
 */

/**
 * User Account Model
 * Represents an archaeologist or researcher account
 */
export class VREUserAccount {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.name = data.name || '';
        this.username = data.username || '';
        this.institution = data.institution || '';
        this.researchInterests = data.researchInterests || [];
        this.ownProjects = data.ownProjects || [];
        this.participatingProjects = data.participatingProjects || [];
        this.role = data.role || 'archaeologist'; // archaeologist, student, institute
        this.createdAt = data.createdAt || new Date();
        this.lastLogin = data.lastLogin || null;
        this.profileImage = data.profileImage || '';
        this.bio = data.bio || '';
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            username: this.username,
            institution: this.institution,
            researchInterests: this.researchInterests,
            ownProjects: this.ownProjects,
            participatingProjects: this.participatingProjects,
            role: this.role,
            createdAt: this.createdAt,
            lastLogin: this.lastLogin,
            profileImage: this.profileImage,
            bio: this.bio
        };
    }
}

/**
 * Excavation Site Model
 * Represents an archaeological excavation project/repository
 */
export class ExcavationSite {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.location = data.location || {};
        this.coordinates = data.coordinates || { latitude: 0, longitude: 0 };
        this.owner = data.owner || null;
        this.contributors = data.contributors || [];
        this.visibility = data.visibility || 'private'; // public, private
        this.findings = data.findings || [];
        this.zones = data.zones || [];
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || null;
        this.country = data.country || '';
        this.region = data.region || '';
        this.period = data.period || '';
        this.orthophotoUrl = data.orthophotoUrl || '';
        this.baseMap = data.baseMap || 'satellite';
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            location: this.location,
            coordinates: this.coordinates,
            owner: this.owner,
            contributors: this.contributors,
            visibility: this.visibility,
            findings: this.findings,
            zones: this.zones,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            startDate: this.startDate,
            endDate: this.endDate,
            country: this.country,
            region: this.region,
            period: this.period,
            orthophotoUrl: this.orthophotoUrl,
            baseMap: this.baseMap
        };
    }
}

/**
 * Find Model
 * Represents an individual find/artifact within an excavation
 */
export class Find {
    constructor(data = {}) {
        this.id = data.id || null;
        this.findNumber = data.findNumber || '';
        this.excavationSiteId = data.excavationSiteId || null;
        this.zone = data.zone || '';
        this.category = data.category || '';
        this.material = data.material || '';
        this.description = data.description || '';
        this.coordinates = data.coordinates || { latitude: 0, longitude: 0, depth: 0 };
        this.photos = data.photos || [];
        this.orthophotoUrl = data.orthophotoUrl || '';
        this.model3DUrl = data.model3DUrl || '';
        this.reports = data.reports || [];
        this.relatedFinds = data.relatedFinds || [];
        this.discoveredBy = data.discoveredBy || null;
        this.discoveredAt = data.discoveredAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.period = data.period || '';
        this.condition = data.condition || '';
        this.status = data.status || 'documented'; // documented, analyzed, published
        this.comments = data.comments || [];
        this.tags = data.tags || [];
    }

    toJSON() {
        return {
            id: this.id,
            findNumber: this.findNumber,
            excavationSiteId: this.excavationSiteId,
            zone: this.zone,
            category: this.category,
            material: this.material,
            description: this.description,
            coordinates: this.coordinates,
            photos: this.photos,
            orthophotoUrl: this.orthophotoUrl,
            model3DUrl: this.model3DUrl,
            reports: this.reports,
            relatedFinds: this.relatedFinds,
            discoveredBy: this.discoveredBy,
            discoveredAt: this.discoveredAt,
            updatedAt: this.updatedAt,
            period: this.period,
            condition: this.condition,
            status: this.status,
            comments: this.comments,
            tags: this.tags
        };
    }
}

/**
 * Comment Model
 * Represents a comment on a find or document
 */
export class Comment {
    constructor(data = {}) {
        this.id = data.id || null;
        this.findId = data.findId || null;
        this.author = data.author || null;
        this.content = data.content || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.replies = data.replies || [];
    }

    toJSON() {
        return {
            id: this.id,
            findId: this.findId,
            author: this.author,
            content: this.content,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            replies: this.replies
        };
    }
}

/**
 * Contribution Model
 * Tracks all contributions and changes for audit trail
 */
export class Contribution {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.findId = data.findId || null;
        this.action = data.action || ''; // created, updated, deleted, commented
        this.target = data.target || ''; // find, report, comment
        this.details = data.details || {};
        this.timestamp = data.timestamp || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            excavationSiteId: this.excavationSiteId,
            findId: this.findId,
            action: this.action,
            target: this.target,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

/**
 * Zone Model
 * Represents a zone/area within an excavation site
 */
export class Zone {
    constructor(data = {}) {
        this.id = data.id || null;
        this.excavationSiteId = data.excavationSiteId || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.coordinates = data.coordinates || [];
        this.area = data.area || 0;
        this.depth = data.depth || 0;
        this.createdAt = data.createdAt || new Date();
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
            createdAt: this.createdAt
        };
    }
}
