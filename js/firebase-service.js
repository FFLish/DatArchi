/**
 * Firebase Service - Zentraler Service für alle Firebase Operationen
 * Verwaltet Projekte, Funde, Benutzer und Echtzeit-Updates
 */

import { auth, db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    writeBatch,
    Timestamp,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

class FirebaseService {
    constructor() {
        this.projectsCache = [];
        this.findsCache = {};
        this.usersCache = {};
        this.unsubscribers = [];
    }

    // ===== PROJEKTE =====

    /**
     * Erstelle ein neues Projekt
     */
    async createProject(projectData) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const project = {
                ...projectData,
                owner: auth.currentUser.uid,
                ownerEmail: auth.currentUser.email,
                ownerName: auth.currentUser.displayName || 'Benutzer',
                ownerAvatar: auth.currentUser.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                findCount: 0,
                memberCount: 1,
                visibility: projectData.visibility || 'private',
                status: projectData.status || 'active',
                version: '1.0'
            };

            const docRef = await addDoc(collection(db, 'projects'), project);
            console.log('✅ Projekt erstellt:', docRef.id);

            return {
                id: docRef.id,
                ...project
            };
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Projekts:', error);
            throw error;
        }
    }

    /**
     * Hole alle Projekte des aktuellen Benutzers
     */
    async getUserProjects(userId) {
        try {
            const projectsRef = collection(db, 'projects');
            const q = query(
                projectsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const projects = [];

            querySnapshot.forEach((doc) => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.projectsCache = projects;
            return projects;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Projekte:', error);
            return [];
        }
    }

    /**
     * Hole öffentliche Projekte
     */
    async getPublicProjects(limitCount = 20) {
        try {
            const projectsRef = collection(db, 'projects');
            const q = query(
                projectsRef,
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const projects = [];

            querySnapshot.forEach((doc) => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return projects;
        } catch (error) {
            console.error('❌ Fehler beim Laden öffentlicher Projekte:', error);
            return [];
        }
    }

    /**
     * Hole ein einzelnes Projekt
     */
    async getProject(projectId) {
        try {
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Fehler beim Laden des Projekts:', error);
            return null;
        }
    }

    /**
     * Aktualisiere ein Projekt
     */
    async updateProject(projectId, updates) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const docRef = doc(db, 'projects', projectId);

            // Überprüfe ob Benutzer Owner ist
            const project = await this.getProject(projectId);
            if (project.userId !== auth.currentUser.uid) {
                throw new Error('Du hast keine Berechtigung dieses Projekt zu bearbeiten');
            }

            updates.updatedAt = serverTimestamp();
            await updateDoc(docRef, updates);

            console.log('✅ Projekt aktualisiert:', projectId);
            return { id: projectId, ...updates };
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren des Projekts:', error);
            throw error;
        }
    }

    /**
     * Lösche ein Projekt
     */
    async deleteProject(projectId) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const project = await this.getProject(projectId);
            if (project.userId !== auth.currentUser.uid) {
                throw new Error('Du hast keine Berechtigung dieses Projekt zu löschen');
            }

            // Lösche alle Funde des Projekts
            await this.deleteProjectFinds(projectId);

            // Lösche das Projekt
            await deleteDoc(doc(db, 'projects', projectId));

            console.log('✅ Projekt gelöscht:', projectId);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Löschen des Projekts:', error);
            throw error;
        }
    }

    /**
     * Abonniere Echtzeit-Updates für Projekte eines Benutzers
     */
    subscribeToUserProjects(userId, callback) {
        try {
            const projectsRef = collection(db, 'projects');
            const q = query(
                projectsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const projects = [];
                querySnapshot.forEach((doc) => {
                    projects.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                this.projectsCache = projects;
                callback(projects);
            }, (error) => {
                console.error('❌ Fehler beim Abonnieren von Projekten:', error);
            });

            this.unsubscribers.push(unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Fehler beim Setup des Listeners:', error);
        }
    }

    // ===== FUNDE =====

    /**
     * Erstelle einen neuen Fund
     */
    async createFind(projectId, findData) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const find = {
                ...findData,
                projectId,
                creator: auth.currentUser.uid,
                creatorName: auth.currentUser.displayName || 'Benutzer',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'finds'), find);

            // Aktualisiere findCount des Projekts
            await this.incrementProjectFinds(projectId, 1);

            console.log('✅ Fund erstellt:', docRef.id);

            return {
                id: docRef.id,
                ...find
            };
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Funds:', error);
            throw error;
        }
    }

    /**
     * Hole alle Funde eines Projekts
     */
    async getProjectFinds(projectId) {
        try {
            const findsRef = collection(db, 'finds');
            const q = query(
                findsRef,
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const finds = [];

            querySnapshot.forEach((doc) => {
                finds.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.findsCache[projectId] = finds;
            return finds;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Funde:', error);
            return [];
        }
    }

    /**
     * Aktualisiere einen Fund
     */
    async updateFind(findId, updates) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const docRef = doc(db, 'finds', findId);
            updates.updatedAt = serverTimestamp();

            await updateDoc(docRef, updates);

            console.log('✅ Fund aktualisiert:', findId);
            return { id: findId, ...updates };
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren des Funds:', error);
            throw error;
        }
    }

    /**
     * Lösche einen Fund
     */
    async deleteFind(findId, projectId) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            await deleteDoc(doc(db, 'finds', findId));

            // Dekrementiere findCount des Projekts
            await this.incrementProjectFinds(projectId, -1);

            console.log('✅ Fund gelöscht:', findId);
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Löschen des Funds:', error);
            throw error;
        }
    }

    /**
     * Lösche alle Funde eines Projekts
     */
    async deleteProjectFinds(projectId) {
        try {
            const finds = await this.getProjectFinds(projectId);
            const batch = writeBatch(db);

            finds.forEach((find) => {
                batch.delete(doc(db, 'finds', find.id));
            });

            await batch.commit();
            console.log('✅ Alle Funde des Projekts gelöscht');
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Löschen der Funde:', error);
            throw error;
        }
    }

    /**
     * Abonniere Echtzeit-Updates für Funde eines Projekts
     */
    subscribeToProjectFinds(projectId, callback) {
        try {
            const findsRef = collection(db, 'finds');
            const q = query(
                findsRef,
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const finds = [];
                querySnapshot.forEach((doc) => {
                    finds.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                this.findsCache[projectId] = finds;
                callback(finds);
            }, (error) => {
                console.error('❌ Fehler beim Abonnieren von Funden:', error);
            });

            this.unsubscribers.push(unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Fehler beim Setup des Listeners:', error);
        }
    }

    // ===== BENUTZER =====

    /**
     * Erstelle oder aktualisiere Benutzerprofil
     */
    async createOrUpdateUserProfile(userData) {
        try {
            if (!auth.currentUser) {
                throw new Error('Benutzer nicht angemeldet');
            }

            const userDoc = {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName || 'Benutzer',
                photoURL: auth.currentUser.photoURL || null,
                ...userData,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', auth.currentUser.uid), userDoc, { merge: true });

            console.log('✅ Benutzerprofil erstellt/aktualisiert');
            return userDoc;
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Benutzerprofils:', error);
            throw error;
        }
    }

    /**
     * Hole Benutzerprofil
     */
    async getUserProfile(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Fehler beim Laden des Benutzerprofils:', error);
            return null;
        }
    }

    /**
     * Hole aktuelles Benutzerprofil
     */
    async getCurrentUserProfile() {
        try {
            if (!auth.currentUser) {
                return null;
            }
            return await this.getUserProfile(auth.currentUser.uid);
        } catch (error) {
            console.error('❌ Fehler beim Laden des aktuellen Benutzerprofils:', error);
            return null;
        }
    }

    // ===== HILFSFUNKTIONEN =====

    /**
     * Inkrementiere findCount eines Projekts
     */
    async incrementProjectFinds(projectId, increment) {
        try {
            const docRef = doc(db, 'projects', projectId);
            const currentProject = await this.getProject(projectId);

            const newCount = (currentProject.findCount || 0) + increment;
            await updateDoc(docRef, {
                findCount: Math.max(0, newCount),
                updatedAt: serverTimestamp()
            });

            return newCount;
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren des findCount:', error);
        }
    }

    /**
     * Suche Projekte
     */
    async searchProjects(query, limit = 10) {
        try {
            const projectsRef = collection(db, 'projects');
            const q = query_(
                projectsRef,
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const results = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (
                    data.name.toLowerCase().includes(query.toLowerCase()) ||
                    data.description.toLowerCase().includes(query.toLowerCase())
                ) {
                    results.push({
                        id: doc.id,
                        ...data
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('❌ Fehler beim Suchen von Projekten:', error);
            return [];
        }
    }

    /**
     * Beende alle Listener
     */
    unsubscribeAll() {
        this.unsubscribers.forEach((unsubscribe) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.unsubscribers = [];
        console.log('✅ Alle Listener beendet');
    }

    /**
     * Leere alle Caches
     */
    clearCache() {
        this.projectsCache = [];
        this.findsCache = {};
        this.usersCache = {};
    }
}

// Singleton-Instanz
let instance = null;

export function getFirebaseService() {
    if (!instance) {
        instance = new FirebaseService();
    }
    return instance;
}

export const firebaseService = getFirebaseService();
export default FirebaseService;
