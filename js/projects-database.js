// js/projects-database.js
// Erweiterung der Datenbank für Projekt-Management mit Firestore Integration

import { TEST_PROJECTS, TEST_FINDS, TEST_USERS } from './test-projects-data.js';
import { auth, db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    doc,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firestore Datenbank für Projekte
class ProjectsDatabase {
    constructor() {
        this.projects = [];
        this.finds = [];
        this.users = [];
        this.useFirestore = true; // Nutze Firestore wenn möglich
        this.initialize();
    }

    initialize() {
        // Versuche Firestore zu verwenden, fallback zu localStorage
        if (auth && db) {
            console.log('✅ Verwende Firebase Firestore für Projekte');
            // Firestore wird bei Bedarf geladen
            this.loadFirebaseProjects();
        } else {
            console.log('⚠️ Firebase nicht verfügbar, verwende localStorage');
            this.useFirestore = false;
            this.initializeLocalStorage();
        }
    }

    initializeLocalStorage() {
        // Fallback zu localStorage
        const storedProjects = localStorage.getItem('dbc_projects');
        const storedFinds = localStorage.getItem('dbc_finds');
        const storedUsers = localStorage.getItem('dbc_users');

        this.projects = storedProjects ? JSON.parse(storedProjects) : [...TEST_PROJECTS];
        this.finds = storedFinds ? JSON.parse(storedFinds) : [...TEST_FINDS];
        this.users = storedUsers ? JSON.parse(storedUsers) : [...TEST_USERS];

        this.save();
    }

    save() {
        if (!this.useFirestore) {
            localStorage.setItem('dbc_projects', JSON.stringify(this.projects));
            localStorage.setItem('dbc_finds', JSON.stringify(this.finds));
            localStorage.setItem('dbc_users', JSON.stringify(this.users));
        }
    }

    // ===== FIREBASE PROJEKT-FUNKTIONEN =====

    async loadFirebaseProjects(userId = null) {
        try {
            if (!db) return [];
            
            const projectsRef = collection(db, 'projects');
            let q;
            
            if (userId) {
                q = query(projectsRef, where('owner', '==', userId), orderBy('createdAt', 'desc'));
            } else {
                q = query(projectsRef, orderBy('createdAt', 'desc'));
            }
            
            const querySnapshot = await getDocs(q);
            const projects = [];
            
            querySnapshot.forEach((doc) => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.projects = projects;
            return projects;
        } catch (error) {
            console.error('Fehler beim Laden von Firebase Projekten:', error);
            return [];
        }
    }

    // ===== PROJEKT-FUNKTIONEN =====

    async addProject(projectData) {
        try {
            const project = {
                name: projectData.name,
                description: projectData.description,
                location: projectData.location,
                period: projectData.period,
                visibility: projectData.visibility,
                owner: projectData.owner,
                ownerName: projectData.ownerName,
                ownerAvatar: projectData.ownerAvatar || null,
                ownerEmail: projectData.ownerEmail || null,
                status: projectData.status || 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                stars: 0,
                version: '1.0',
                findCount: 0,
                memberCount: 1
            };

            if (this.useFirestore && db) {
                try {
                    const docRef = await addDoc(collection(db, 'projects'), project);
                    const newProject = { id: docRef.id, ...project };
                    this.projects.push(newProject);
                    console.log('✅ Projekt in Firebase erstellt:', docRef.id);
                    return newProject;
                } catch (error) {
                    console.error('Fehler beim Speichern in Firebase:', error);
                    // Fallback zu localStorage
                    const localProject = {
                        id: `project-${Date.now()}`,
                        ...project,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    this.projects.push(localProject);
                    this.save();
                    return localProject;
                }
            } else {
                const localProject = {
                    id: `project-${Date.now()}`,
                    ...project,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.projects.push(localProject);
                this.save();
                return localProject;
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Projekts:', error);
            throw error;
        }
    }

    async getProject(projectId) {
        try {
            if (this.useFirestore && db) {
                const docRef = doc(db, 'projects', projectId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    return {
                        id: docSnap.id,
                        ...docSnap.data()
                    };
                }
            }
            
            return this.projects.find(p => p.id === projectId);
        } catch (error) {
            console.error('Fehler beim Laden des Projekts:', error);
            return this.projects.find(p => p.id === projectId);
        }
    }

    async getUserProjects(userId) {
        try {
            if (this.useFirestore && db) {
                const projectsRef = collection(db, 'projects');
                const q = query(projectsRef, where('owner', '==', userId), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const projects = [];
                
                querySnapshot.forEach((doc) => {
                    projects.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                return projects;
            }
            
            return this.projects.filter(p => p.owner === userId);
        } catch (error) {
            console.error('Fehler beim Laden von Benutzerprojekten:', error);
            return this.projects.filter(p => p.owner === userId);
        }
    }

    async getPublicProjects() {
        return this.projects.filter(p => p.visibility === 'public');
    }

    async updateProject(projectId, updates) {
        try {
            if (this.useFirestore && db) {
                try {
                    const docRef = doc(db, 'projects', projectId);
                    updates.updatedAt = new Date();
                    await updateDoc(docRef, updates);
                    
                    const project = this.projects.find(p => p.id === projectId);
                    if (project) {
                        Object.assign(project, updates);
                    }
                    return { id: projectId, ...updates };
                } catch (error) {
                    console.error('Fehler beim Update in Firebase:', error);
                }
            }
            
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                Object.assign(project, updates, { 
                    updatedAt: new Date().toISOString() 
                });
                this.save();
            }
            return project;
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Projekts:', error);
            throw error;
        }
    }

    async deleteProject(projectId) {
        try {
            if (this.useFirestore && db) {
                try {
                    await deleteDoc(doc(db, 'projects', projectId));
                    this.projects = this.projects.filter(p => p.id !== projectId);
                    return true;
                } catch (error) {
                    console.error('Fehler beim Löschen in Firebase:', error);
                }
            }
            
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.finds = this.finds.filter(f => f.projectId !== projectId);
            this.save();
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen des Projekts:', error);
            throw error;
        }
    }

    // ===== FUNDE-FUNKTIONEN =====

    async addFind(findData, projectId) {
        const find = {
            id: `find-${Date.now()}`,
            projectId,
            ...findData,
            createdAt: new Date().toISOString()
        };

        this.finds.push(find);
        
        // Update project's find count
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.findCount = (project.findCount || 0) + 1;
        }

        this.save();
        return find;
    }

    async getProjectFinds(projectId) {
        return this.finds.filter(f => f.projectId === projectId);
    }

    async getFind(findId) {
        return this.finds.find(f => f.id === findId);
    }

    async updateFind(findId, updates) {
        const find = this.finds.find(f => f.id === findId);
        if (find) {
            Object.assign(find, updates, { 
                updatedAt: new Date().toISOString() 
            });
            this.save();
        }
        return find;
    }

    async deleteFind(findId) {
        const find = this.finds.find(f => f.id === findId);
        if (find) {
            const project = this.projects.find(p => p.id === find.projectId);
            if (project && project.findCount > 0) {
                project.findCount--;
            }
        }

        this.finds = this.finds.filter(f => f.id !== findId);
        this.save();
    }

    // ===== BENUTZER-FUNKTIONEN =====

    async getUser(userId) {
        return this.users.find(u => u.id === userId);
    }

    async getUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    async addUser(userData) {
        const user = {
            id: `user-${Date.now()}`,
            ...userData,
            createdAt: new Date().toISOString(),
            stars: 0
        };

        this.users.push(user);
        this.save();
        return user;
    }

    // ===== STATISTIKEN =====

    async getProjectStats(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return null;

        const finds = this.finds.filter(f => f.projectId === projectId);
        const categories = {};
        const materials = {};

        finds.forEach(find => {
            categories[find.kategorie] = (categories[find.kategorie] || 0) + 1;
            materials[find.material] = (materials[find.material] || 0) + 1;
        });

        return {
            projectId,
            projectName: project.name,
            totalFinds: finds.length,
            categories,
            materials,
            memberCount: project.memberCount || 1,
            stars: project.stars || 0
        };
    }

    async getTopProjects(limit = 10) {
        return this.projects
            .filter(p => p.visibility === 'public')
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .slice(0, limit);
    }

    // ===== SUCHE =====

    async searchProjects(query) {
        const q = query.toLowerCase();
        return this.projects.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) ||
            p.location?.toLowerCase().includes(q)
        );
    }

    async searchFinds(query) {
        const q = query.toLowerCase();
        return this.finds.filter(f =>
            f.titel.toLowerCase().includes(q) ||
            f.material.toLowerCase().includes(q) ||
            f.kategorie.toLowerCase().includes(q)
        );
    }

    // ===== RESET & DEBUG =====

    async resetToTestData() {
        this.projects = [...TEST_PROJECTS];
        this.finds = [...TEST_FINDS];
        this.users = [...TEST_USERS];
        this.save();
    }

    getStats() {
        return {
            projects: this.projects.length,
            finds: this.finds.length,
            users: this.users.length,
            publicProjects: this.projects.filter(p => p.visibility === 'public').length
        };
    }
}

// Singleton-Pattern für ProjectsDatabase
ProjectsDatabase.instance = null;

ProjectsDatabase.getInstance = function() {
    if (!ProjectsDatabase.instance) {
        ProjectsDatabase.instance = new ProjectsDatabase();
    }
    return ProjectsDatabase.instance;
};

// Erstelle und exportiere eine globale Instanz
export const projectsDB = ProjectsDatabase.getInstance();

// Mache sie auch global verfügbar
window.projectsDB = projectsDB;
export { ProjectsDatabase };
