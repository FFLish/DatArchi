/**
 * VRE User Account Service
 * Manages user account operations (creation, updates, profile management)
 */

import { 
    auth, 
    db, 
    storage 
} from './firebase-config.js';

import { VREUserAccount } from './vre-data-models.js';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * User Account Service Class
 */
export class VREUserAccountService {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User full name
     * @param {string} role - User role (archaeologist, student, institute)
     * @returns {Promise<VREUserAccount>}
     */
    static async registerUser(email, password, name, role = 'archaeologist') {
        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: name
            });

            // Generate username from email (part before @)
            const username = email.split('@')[0];

            // Create VRE User Account in Firestore
            const userAccount = new VREUserAccount({
                id: user.uid,
                email: email,
                name: name,
                username: username,
                role: role,
                ownProjects: [],
                participatingProjects: [],
                createdAt: new Date(),
                lastLogin: new Date()
            });

            // Save to Firestore
            await setDoc(doc(db, 'users', user.uid), userAccount.toJSON());

            console.log('✅ User registered successfully:', user.uid);
            return userAccount;
        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<VREUserAccount>}
     */
    static async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login time
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date()
            });

            // Fetch user account data
            const userAccount = await this.getUserAccount(user.uid);
            console.log('✅ User logged in:', user.uid);
            return userAccount;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    static async logoutUser() {
        try {
            await signOut(auth);
            console.log('✅ User logged out');
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    }

    /**
     * Get user account details
     * @param {string} userId - User ID
     * @returns {Promise<VREUserAccount>}
     */
    static async getUserAccount(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Ensure arrays are initialized for existing users
                if (!data.ownProjects) data.ownProjects = [];
                if (!data.participatingProjects) data.participatingProjects = [];
                
                return new VREUserAccount({
                    ...data,
                    id: userId
                });
            } else {
                console.warn('⚠️ User account not found:', userId);
                // Return null so profile page can handle it
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching user account:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updates - Profile updates
     * @returns {Promise<VREUserAccount>}
     */
    static async updateUserProfile(userId, updates) {
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            });

            // Also update Firebase Auth profile if name or photo changed
            const user = auth.currentUser;
            if (user) {
                if (updates.name || updates.profileImage) {
                    await updateProfile(user, {
                        displayName: updates.name || user.displayName,
                        photoURL: updates.profileImage || user.photoURL
                    });
                }
            }

            const updated = await this.getUserAccount(userId);
            console.log('✅ User profile updated:', userId);
            return updated;
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Update user email
     * @param {string} userId - User ID
     * @param {string} newEmail - New email address
     * @returns {Promise<void>}
     */
    static async updateUserEmail(userId, newEmail) {
        try {
            const user = auth.currentUser;
            if (user) {
                await updateEmail(user, newEmail);
                await updateDoc(doc(db, 'users', userId), {
                    email: newEmail,
                    updatedAt: new Date()
                });
                console.log('✅ Email updated:', newEmail);
            }
        } catch (error) {
            console.error('❌ Error updating email:', error);
            throw error;
        }
    }

    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    static async updateUserPassword(newPassword) {
        try {
            const user = auth.currentUser;
            if (user) {
                await updatePassword(user, newPassword);
                console.log('✅ Password updated');
            }
        } catch (error) {
            console.error('❌ Error updating password:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    static async sendPasswordReset(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('✅ Password reset email sent to:', email);
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async deleteUserAccount(userId) {
        try {
            const user = auth.currentUser;
            if (user && user.uid === userId) {
                // Delete from Firestore
                await deleteDoc(doc(db, 'users', userId));
                // Delete from Firebase Auth
                await user.delete();
                console.log('✅ User account deleted:', userId);
            }
        } catch (error) {
            console.error('❌ Error deleting user account:', error);
            throw error;
        }
    }

    /**
     * Search users by username
     * @param {string} username - Username to search for
     * @returns {Promise<VREUserAccount>}
     */
    static async getUserByUsername(username) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            return new VREUserAccount({
                ...doc.data(),
                id: doc.id
            });
        } catch (error) {
            console.error('❌ Error searching user by username:', error);
            throw error;
        }
    }

    /**
     * Search users by name or email
     * @param {string} searchTerm - Search term
     * @returns {Promise<VREUserAccount[]>}
     */
    static async searchUsers(searchTerm) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('name', '>=', searchTerm),
                where('name', '<=', searchTerm + '\uf8ff')
            );
            const querySnapshot = await getDocs(q);
            
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push(new VREUserAccount({
                    ...doc.data(),
                    id: doc.id
                }));
            });

            return users;
        } catch (error) {
            console.error('❌ Error searching users:', error);
            throw error;
        }
    }

    /**
     * Add project to user's owned projects
     * @param {string} userId - User ID
     * @param {string} projectId - Project ID
     * @returns {Promise<void>}
     */
    static async addOwnedProject(userId, projectId) {
        try {
            const docRef = doc(db, 'users', userId);
            const userDoc = await getDoc(docRef);
            const currentProjects = userDoc.data().ownProjects || [];
            
            if (!currentProjects.includes(projectId)) {
                currentProjects.push(projectId);
                await updateDoc(docRef, {
                    ownProjects: currentProjects
                });
            }
        } catch (error) {
            console.error('❌ Error adding owned project:', error);
            throw error;
        }
    }

    /**
     * Add project to user's participating projects
     * @param {string} userId - User ID
     * @param {string} projectId - Project ID
     * @returns {Promise<void>}
     */
    static async addParticipatingProject(userId, projectId) {
        try {
            const docRef = doc(db, 'users', userId);
            const userDoc = await getDoc(docRef);
            const currentProjects = userDoc.data().participatingProjects || [];
            
            if (!currentProjects.includes(projectId)) {
                currentProjects.push(projectId);
                await updateDoc(docRef, {
                    participatingProjects: currentProjects
                });
            }
        } catch (error) {
            console.error('❌ Error adding participating project:', error);
            throw error;
        }
    }
}
