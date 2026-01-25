/**
 * VRE Collaboration Service
 * Manages collaboration features (comments, discussions, project chat)
 */

import { 
    auth, 
    db, 
    storage 
} from './firebase-config.js';

import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    arrayUnion,
    arrayRemove,
    limit
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Collaboration Service Class
 */
export class VRECollaborationService {
    /**
     * Post a discussion message in project
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} authorId - Author user ID
     * @param {string} message - Message content
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>}
     */
    static async postDiscussion(excavationSiteId, authorId, message, metadata = {}) {
        try {
            const discussionsRef = collection(db, 'excavationSites', excavationSiteId, 'discussions');
            const newDiscussionRef = doc(discussionsRef);

            const discussion = {
                id: newDiscussionRef.id,
                author: authorId,
                content: message,
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: 0,
                replies: [],
                ...metadata
            };

            await setDoc(newDiscussionRef, discussion);
            console.log('✅ Discussion posted:', newDiscussionRef.id);
            return discussion;
        } catch (error) {
            console.error('❌ Error posting discussion:', error);
            throw error;
        }
    }

    /**
     * Get all discussions in excavation site
     * @param {string} excavationSiteId - Excavation site ID
     * @returns {Promise<Object[]>}
     */
    static async getDiscussions(excavationSiteId) {
        try {
            const discussionsRef = collection(db, 'excavationSites', excavationSiteId, 'discussions');
            const q = query(discussionsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const discussions = [];
            querySnapshot.forEach((doc) => {
                discussions.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            return discussions;
        } catch (error) {
            console.error('❌ Error fetching discussions:', error);
            throw error;
        }
    }

    /**
     * Reply to a discussion
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} discussionId - Discussion ID
     * @param {string} authorId - Author user ID
     * @param {string} message - Reply message
     * @returns {Promise<Object>}
     */
    static async replyToDiscussion(excavationSiteId, discussionId, authorId, message) {
        try {
            const repliesRef = collection(
                db, 
                'excavationSites', 
                excavationSiteId, 
                'discussions', 
                discussionId, 
                'replies'
            );
            const newReplyRef = doc(repliesRef);

            const reply = {
                id: newReplyRef.id,
                author: authorId,
                content: message,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(newReplyRef, reply);

            // Add reply ID to discussion
            const discussionRef = doc(db, 'excavationSites', excavationSiteId, 'discussions', discussionId);
            await updateDoc(discussionRef, {
                replies: arrayUnion(newReplyRef.id)
            });

            console.log('✅ Reply posted:', newReplyRef.id);
            return reply;
        } catch (error) {
            console.error('❌ Error posting reply:', error);
            throw error;
        }
    }

    /**
     * Get replies to a discussion
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} discussionId - Discussion ID
     * @returns {Promise<Object[]>}
     */
    static async getReplies(excavationSiteId, discussionId) {
        try {
            const repliesRef = collection(
                db, 
                'excavationSites', 
                excavationSiteId, 
                'discussions', 
                discussionId, 
                'replies'
            );
            const q = query(repliesRef, orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);
            
            const replies = [];
            querySnapshot.forEach((doc) => {
                replies.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            return replies;
        } catch (error) {
            console.error('❌ Error fetching replies:', error);
            throw error;
        }
    }

    /**
     * Like a discussion message
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} discussionId - Discussion ID
     * @returns {Promise<void>}
     */
    static async likeDiscussion(excavationSiteId, discussionId) {
        try {
            const discussionRef = doc(db, 'excavationSites', excavationSiteId, 'discussions', discussionId);
            await updateDoc(discussionRef, {
                likes: (await getDoc(discussionRef)).data().likes + 1
            });

            console.log('✅ Discussion liked');
        } catch (error) {
            console.error('❌ Error liking discussion:', error);
            throw error;
        }
    }

    /**
     * Create a project announcement
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} authorId - Author user ID
     * @param {string} title - Announcement title
     * @param {string} content - Announcement content
     * @returns {Promise<Object>}
     */
    static async createAnnouncement(excavationSiteId, authorId, title, content) {
        try {
            const announcementsRef = collection(db, 'excavationSites', excavationSiteId, 'announcements');
            const newAnnouncementRef = doc(announcementsRef);

            const announcement = {
                id: newAnnouncementRef.id,
                author: authorId,
                title: title,
                content: content,
                createdAt: new Date(),
                pinned: false
            };

            await setDoc(newAnnouncementRef, announcement);
            console.log('✅ Announcement created:', newAnnouncementRef.id);
            return announcement;
        } catch (error) {
            console.error('❌ Error creating announcement:', error);
            throw error;
        }
    }

    /**
     * Get announcements for excavation site
     * @param {string} excavationSiteId - Excavation site ID
     * @returns {Promise<Object[]>}
     */
    static async getAnnouncements(excavationSiteId) {
        try {
            const announcementsRef = collection(db, 'excavationSites', excavationSiteId, 'announcements');
            const q = query(announcementsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const announcements = [];
            querySnapshot.forEach((doc) => {
                announcements.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            return announcements;
        } catch (error) {
            console.error('❌ Error fetching announcements:', error);
            throw error;
        }
    }

    /**
     * Pin/unpin announcement
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} announcementId - Announcement ID
     * @param {boolean} pinned - Pin status
     * @returns {Promise<void>}
     */
    static async setPinnedAnnouncement(excavationSiteId, announcementId, pinned = true) {
        try {
            const announcementRef = doc(db, 'excavationSites', excavationSiteId, 'announcements', announcementId);
            await updateDoc(announcementRef, {
                pinned: pinned
            });

            console.log(`✅ Announcement ${pinned ? 'pinned' : 'unpinned'}`);
        } catch (error) {
            console.error('❌ Error updating announcement pin status:', error);
            throw error;
        }
    }

    /**
     * Delete announcement
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} announcementId - Announcement ID
     * @returns {Promise<void>}
     */
    static async deleteAnnouncement(excavationSiteId, announcementId) {
        try {
            const announcementRef = doc(db, 'excavationSites', excavationSiteId, 'announcements', announcementId);
            await deleteDoc(announcementRef);
            console.log('✅ Announcement deleted');
        } catch (error) {
            console.error('❌ Error deleting announcement:', error);
            throw error;
        }
    }

    /**
     * Record contribution (audit trail)
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} userId - User ID
     * @param {string} action - Action performed
     * @param {string} target - Target of action
     * @param {Object} details - Action details
     * @returns {Promise<Object>}
     */
    static async recordContribution(excavationSiteId, userId, action, target, details = {}) {
        try {
            const contributionsRef = collection(db, 'excavationSites', excavationSiteId, 'contributions');
            const newContributionRef = doc(contributionsRef);

            const contribution = {
                id: newContributionRef.id,
                userId: userId,
                action: action,
                target: target,
                details: details,
                timestamp: new Date()
            };

            await setDoc(newContributionRef, contribution);
            console.log('✅ Contribution recorded:', newContributionRef.id);
            return contribution;
        } catch (error) {
            console.error('❌ Error recording contribution:', error);
            throw error;
        }
    }

    /**
     * Get contribution history for excavation site
     * @param {string} excavationSiteId - Excavation site ID
     * @param {number} limitCount - Number of contributions to fetch
     * @returns {Promise<Object[]>}
     */
    static async getContributionHistory(excavationSiteId, limitCount = 100) {
        try {
            const contributionsRef = collection(db, 'excavationSites', excavationSiteId, 'contributions');
            const q = query(
                contributionsRef, 
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            
            const contributions = [];
            querySnapshot.forEach((doc) => {
                contributions.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            return contributions;
        } catch (error) {
            console.error('❌ Error fetching contribution history:', error);
            throw error;
        }
    }

    /**
     * Get contributions by user
     * @param {string} excavationSiteId - Excavation site ID
     * @param {string} userId - User ID
     * @returns {Promise<Object[]>}
     */
    static async getContributionsByUser(excavationSiteId, userId) {
        try {
            const contributionsRef = collection(db, 'excavationSites', excavationSiteId, 'contributions');
            const q = query(
                contributionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const contributions = [];
            querySnapshot.forEach((doc) => {
                contributions.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            return contributions;
        } catch (error) {
            console.error('❌ Error fetching user contributions:', error);
            throw error;
        }
    }
}

export { VRECollaborationService };
export default VRECollaborationService;
