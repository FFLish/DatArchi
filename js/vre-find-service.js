/**
 * VRE Find Management Service
 * Manages find operations (create, update, delete, search, filter)
 */

import { 
    auth, 
    db, 
    storage 
} from './firebase-config.js';

import { Find, Comment } from './vre-data-models.js';

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
    orderBy,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Find Management Service Class
 */
export class VREFindService {
    /**
     * Create a new find
     * @param {Find} findData - Find data
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} discoveredBy - User ID of discoverer
     * @returns {Promise<Find>}
     */
    static async createFind(findData, excavationSiteId, discoveredBy) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const newFindRef = doc(findsRef);
            
            // Generate find number based on site and count
            const allFinds = await getDocs(findsRef);
            const findNumber = `${excavationSiteId.substring(0, 4).toUpperCase()}-${String(allFinds.size + 1).padStart(4, '0')}`;

            const find = new Find({
                ...findData,
                id: newFindRef.id,
                findNumber: findNumber,
                excavationSiteId: excavationSiteId,
                discoveredBy: discoveredBy,
                discoveredAt: new Date(),
                updatedAt: new Date()
            });

            await setDoc(newFindRef, find.toJSON());
            console.log('✅ Find created:', newFindRef.id);
            return find;
        } catch (error) {
            console.error('❌ Error creating find:', error);
            throw error;
        }
    }

    /**
     * Get find by ID
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @returns {Promise<Find>}
     */
    static async getFind(excavationSiteId, findId) {
        try {
            const docRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return new Find({
                    ...docSnap.data(),
                    id: findId
                });
            } else {
                console.warn('⚠️ Find not found:', findId);
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching find:', error);
            throw error;
        }
    }

    /**
     * Update find
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Find>}
     */
    static async updateFind(excavationSiteId, findId, updates) {
        try {
            const docRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });

            const updated = await this.getFind(excavationSiteId, findId);
            console.log('✅ Find updated:', findId);
            return updated;
        } catch (error) {
            console.error('❌ Error updating find:', error);
            throw error;
        }
    }

    /**
     * Delete find
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @returns {Promise<void>}
     */
    static async deleteFind(excavationSiteId, findId) {
        try {
            const docRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            await deleteDoc(docRef);
            console.log('✅ Find deleted:', findId);
        } catch (error) {
            console.error('❌ Error deleting find:', error);
            throw error;
        }
    }

    /**
     * Get all finds in excavation site
     * @param {string} excavationSiteId - Excavation site ID
     * @returns {Promise<Find[]>}
     */
    static async getFindsByExcavationSite(excavationSiteId) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const querySnapshot = await getDocs(findsRef);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                finds.push(new Find({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return finds;
        } catch (error) {
            console.error('❌ Error fetching finds:', error);
            throw error;
        }
    }

    /**
     * Get finds by zone
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} zone - Zone name
     * @returns {Promise<Find[]>}
     */
    static async getFindsByZone(excavationSiteId, zone) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const q = query(findsRef, where('zone', '==', zone));
            const querySnapshot = await getDocs(q);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                finds.push(new Find({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return finds;
        } catch (error) {
            console.error('❌ Error fetching finds by zone:', error);
            throw error;
        }
    }

    /**
     * Get finds by category
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} category - Category name
     * @returns {Promise<Find[]>}
     */
    static async getFindsByCategory(excavationSiteId, category) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const q = query(findsRef, where('category', '==', category));
            const querySnapshot = await getDocs(q);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                finds.push(new Find({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return finds;
        } catch (error) {
            console.error('❌ Error fetching finds by category:', error);
            throw error;
        }
    }

    /**
     * Get finds by material
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} material - Material name
     * @returns {Promise<Find[]>}
     */
    static async getFindsByMaterial(excavationSiteId, material) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const q = query(findsRef, where('material', '==', material));
            const querySnapshot = await getDocs(q);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                finds.push(new Find({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return finds;
        } catch (error) {
            console.error('❌ Error fetching finds by material:', error);
            throw error;
        }
    }

    /**
     * Get finds by period
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} period - Period name
     * @returns {Promise<Find[]>}
     */
    static async getFindsByPeriod(excavationSiteId, period) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const q = query(findsRef, where('period', '==', period));
            const querySnapshot = await getDocs(q);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                finds.push(new Find({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return finds;
        } catch (error) {
            console.error('❌ Error fetching finds by period:', error);
            throw error;
        }
    }

    /**
     * Add comment to find
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @param {string} authorId - Author user ID
     * @param {string} content - Comment content
     * @returns {Promise<Comment>}
     */
    static async addComment(excavationSiteId, findId, authorId, content) {
        try {
            const commentsRef = collection(db, 'excavationSites', excavationSiteId, 'finds', findId, 'comments');
            const newCommentRef = doc(commentsRef);

            const comment = new Comment({
                id: newCommentRef.id,
                findId: findId,
                author: authorId,
                content: content,
                createdAt: new Date()
            });

            await setDoc(newCommentRef, comment.toJSON());

            // Add comment ID to find's comments array
            const findRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            await updateDoc(findRef, {
                comments: arrayUnion(newCommentRef.id)
            });

            console.log('✅ Comment added:', newCommentRef.id);
            return comment;
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            throw error;
        }
    }

    /**
     * Get comments for find
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @returns {Promise<Comment[]>}
     */
    static async getComments(excavationSiteId, findId) {
        try {
            const commentsRef = collection(db, 'excavationSites', excavationSiteId, 'finds', findId, 'comments');
            const q = query(commentsRef, orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);
            
            const comments = [];
            querySnapshot.forEach((doc) => {
                comments.push(new Comment({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return comments;
        } catch (error) {
            console.error('❌ Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Delete comment
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @param {string} commentId - Comment ID
     * @returns {Promise<void>}
     */
    static async deleteComment(excavationSiteId, findId, commentId) {
        try {
            const commentRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId, 'comments', commentId);
            await deleteDoc(commentRef);

            // Remove comment ID from find's comments array
            const findRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            await updateDoc(findRef, {
                comments: arrayRemove(commentId)
            });

            console.log('✅ Comment deleted:', commentId);
        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            throw error;
        }
    }

    /**
     * Add related find
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} findId - Find ID
     * @param {string} relatedFindId - Related find ID
     * @returns {Promise<void>}
     */
    static async addRelatedFind(excavationSiteId, findId, relatedFindId) {
        try {
            const findRef = doc(db, 'excavationSites', excavationSiteId, 'finds', findId);
            await updateDoc(findRef, {
                relatedFinds: arrayUnion(relatedFindId)
            });

            console.log('✅ Related find added:', relatedFindId);
        } catch (error) {
            console.error('❌ Error adding related find:', error);
            throw error;
        }
    }

    /**
     * Search finds by tag
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} tag - Tag to search
     * @returns {Promise<Find[]>}
     */
    static async getFindsByTag(excavationSiteId, tag) {
        try {
            const findsRef = collection(db, 'excavationSites', excavationSiteId, 'finds');
            const querySnapshot = await getDocs(findsRef);
            
            const finds = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.tags && data.tags.includes(tag)) {
                    finds.push(new Find({
                        ...data,
                        id: doc.id
                    }));
                }
            });

            return finds;
        } catch (error) {
            console.error('❌ Error searching finds by tag:', error);
            throw error;
        }
    }
}

export { VREFindService };
export default VREFindService;
