/**
 * VRE Excavation Site Service
 * Manages excavation site operations (create, update, manage collaborators)
 */

import { 
    auth, 
    db, 
    storage 
} from './firebase-config.js';

import { ExcavationSite } from './vre-data-models.js';

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
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Excavation Site Service Class
 */
export class VREExcavationSiteService {
    /**
     * Create a new excavation site
     * @param {ExcavationSite} siteData - Excavation site data
     * @param {string} ownerId - Owner user ID
     * @returns {Promise<ExcavationSite>}
     */
    static async createExcavationSite(siteData, ownerId) {
        try {
            const sitesRef = collection(db, 'excavationSites');
            const newSiteRef = doc(sitesRef);
            
            const site = new ExcavationSite({
                ...siteData,
                id: newSiteRef.id,
                owner: ownerId,
                contributors: [ownerId],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await setDoc(newSiteRef, site.toJSON());
            console.log('✅ Excavation site created:', newSiteRef.id);
            return site;
        } catch (error) {
            console.error('❌ Error creating excavation site:', error);
            throw error;
        }
    }

    /**
     * Get excavation site by ID
     * @param {string} siteId - Site ID
     * @returns {Promise<ExcavationSite>}
     */
    static async getExcavationSite(siteId) {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return new ExcavationSite({
                    ...docSnap.data(),
                    id: siteId
                });
            } else {
                console.warn('⚠️ Excavation site not found:', siteId);
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching excavation site:', error);
            throw error;
        }
    }

    /**
     * Update excavation site
     * @param {string} siteId - Site ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<ExcavationSite>}
     */
    static async updateExcavationSite(siteId, updates) {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });

            const updated = await this.getExcavationSite(siteId);
            console.log('✅ Excavation site updated:', siteId);
            return updated;
        } catch (error) {
            console.error('❌ Error updating excavation site:', error);
            throw error;
        }
    }

    /**
     * Delete excavation site
     * @param {string} siteId - Site ID
     * @returns {Promise<void>}
     */
    static async deleteExcavationSite(siteId) {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            await deleteDoc(docRef);
            console.log('✅ Excavation site deleted:', siteId);
        } catch (error) {
            console.error('❌ Error deleting excavation site:', error);
            throw error;
        }
    }

    /**
     * Get all public excavation sites
     * @returns {Promise<ExcavationSite[]>}
     */
    static async getPublicExcavationSites() {
        try {
            const sitesRef = collection(db, 'excavationSites');
            const q = query(sitesRef, where('visibility', '==', 'public'));
            const querySnapshot = await getDocs(q);
            
            const sites = [];
            querySnapshot.forEach((doc) => {
                sites.push(new ExcavationSite({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return sites;
        } catch (error) {
            console.error('❌ Error fetching public excavation sites:', error);
            throw error;
        }
    }

    /**
     * Get excavation sites owned by user
     * @param {string} userId - User ID
     * @returns {Promise<ExcavationSite[]>}
     */
    static async getUserOwnedSites(userId) {
        try {
            const sitesRef = collection(db, 'excavationSites');
            const q = query(sitesRef, where('owner', '==', userId));
            const querySnapshot = await getDocs(q);
            
            const sites = [];
            querySnapshot.forEach((doc) => {
                sites.push(new ExcavationSite({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return sites;
        } catch (error) {
            console.error('❌ Error fetching user owned sites:', error);
            throw error;
        }
    }

    /**
     * Add contributor to excavation site
     * @param {string} siteId - Site ID
     * @param {string} userId - User ID to add
     * @param {string} role - Role (owner, contributor, viewer)
     * @returns {Promise<void>}
     */
    static async addContributor(siteId, userId, role = 'contributor') {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            
            await updateDoc(docRef, {
                contributors: arrayUnion(userId)
            });

            // Create contributor record
            const contributorRef = doc(db, 'excavationSites', siteId, 'contributors', userId);
            await setDoc(contributorRef, {
                userId: userId,
                role: role,
                addedAt: new Date()
            });

            console.log('✅ Contributor added:', userId);
        } catch (error) {
            console.error('❌ Error adding contributor:', error);
            throw error;
        }
    }

    /**
     * Remove contributor from excavation site
     * @param {string} siteId - Site ID
     * @param {string} userId - User ID to remove
     * @returns {Promise<void>}
     */
    static async removeContributor(siteId, userId) {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            
            await updateDoc(docRef, {
                contributors: arrayRemove(userId)
            });

            // Delete contributor record
            const contributorRef = doc(db, 'excavationSites', siteId, 'contributors', userId);
            await deleteDoc(contributorRef);

            console.log('✅ Contributor removed:', userId);
        } catch (error) {
            console.error('❌ Error removing contributor:', error);
            throw error;
        }
    }

    /**
     * Search excavation sites
     * @param {string} searchTerm - Search term
     * @returns {Promise<ExcavationSite[]>}
     */
    static async searchExcavationSites(searchTerm) {
        try {
            const sitesRef = collection(db, 'excavationSites');
            const q = query(
                sitesRef,
                where('visibility', '==', 'public'),
                where('name', '>=', searchTerm),
                where('name', '<=', searchTerm + '\uf8ff')
            );
            const querySnapshot = await getDocs(q);
            
            const sites = [];
            querySnapshot.forEach((doc) => {
                sites.push(new ExcavationSite({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return sites;
        } catch (error) {
            console.error('❌ Error searching excavation sites:', error);
            throw error;
        }
    }

    /**
     * Get excavation sites by country
     * @param {string} country - Country name
     * @returns {Promise<ExcavationSite[]>}
     */
    static async getSitesByCountry(country) {
        try {
            const sitesRef = collection(db, 'excavationSites');
            const q = query(
                sitesRef,
                where('visibility', '==', 'public'),
                where('country', '==', country)
            );
            const querySnapshot = await getDocs(q);
            
            const sites = [];
            querySnapshot.forEach((doc) => {
                sites.push(new ExcavationSite({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return sites;
        } catch (error) {
            console.error('❌ Error fetching sites by country:', error);
            throw error;
        }
    }

    /**
     * Change site visibility
     * @param {string} siteId - Site ID
     * @param {string} visibility - Visibility (public or private)
     * @returns {Promise<void>}
     */
    static async changeSiteVisibility(siteId, visibility) {
        try {
            const docRef = doc(db, 'excavationSites', siteId);
            await updateDoc(docRef, {
                visibility: visibility,
                updatedAt: new Date()
            });

            console.log('✅ Site visibility changed to:', visibility);
        } catch (error) {
            console.error('❌ Error changing site visibility:', error);
            throw error;
        }
    }
}

export { VREExcavationSiteService };
export default VREExcavationSiteService;
