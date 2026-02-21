// main.js - Consolidated version of all DatArchi JavaScript files

// ====================
// Image System Initialization
// ====================
import { setupImageSystem } from './image-system-init.js';
import { setupImageErrorHandling } from './image-error-handler.js';

// ====================
// js/firebase-config.js
// ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApkaTvPC_xWvpAyRltbqG1YQNf_E-hcOA",
  authDomain: "archaeologydatabase.firebaseapp.com",
  projectId: "archaeologydatabase",
  storageBucket: "archaeologydatabase.firebasestorage.app",
  messagingSenderId: "442873949773",
  appId: "1:442873949773:web:5e5e15ac58e45c31d07604",
  measurementId: "G-VY5E4PY3YQ"
};

// Initialize Firebase
let app;
let analytics;
let auth;
let db;
let storage;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Set auth persistence
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log('✅ Auth persistence set to local');
        })
        .catch((error) => {
            console.error('❌ Auth persistence error:', error);
        });
    
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// Export Firebase services
export { app, analytics, auth, db, storage, onAuthStateChanged };

// ====================
// js/config.js
// ====================
// This file contains shared configuration variables for the DatArchi application.

// Determine the site root dynamically
const getSiteRoot = () => {
  const pathname = window.location.pathname;
  // If hosted on GitHub Pages, the repo name is part of the path
  if (pathname.includes('/DatArchi/')) {
    return window.location.origin + '/DatArchi/';
  }
  // For local development or other hosting, assume root is '/'
  return window.location.origin + '/';
};

export const SITE_ROOT = getSiteRoot();

// The main image of the excavation site used for map overlays.
export const getMapImageUrl = () => {
  const excavationImages = [
    'ausgrabungsstätte1.jpg',
    'ausgrabungsstätte2.png',
    'ausgrabungsstätte3.png',
    'ausgrabungsstätte4.png',
    'ausgrabungsstätte5.png',
    'ausgrabungsstätte6.png'
  ];
  const randomImage = excavationImages[Math.floor(Math.random() * excavationImages.length)];
  return SITE_ROOT + 'partials/images/ausgrabungsstätte/' + randomImage;
};

// ====================
// js/database.js
// ====================
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc,
    query, 
    where, 
    writeBatch 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Collection paths
const getSitesCollection = (uid) => collection(db, `users/${uid}/sites`);
const getFindsCollection = (uid, siteId) => collection(db, `users/${uid}/sites/${siteId}/finds`);
const getZonesDoc = (uid, siteId) => doc(db, `users/${uid}/sites/${siteId}/zones/doc`);

const ACTIVE_SITE_ID_KEY = 'datarchi.activeSiteId';

let currentUserId = null;
let authInitialized = false;
let authResolve;
const authReadyPromise = new Promise((resolve) => {
    authResolve = resolve;
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
    authInitialized = true;
    authResolve();
    console.log('Auth state changed, user:', currentUserId ? 'logged in' : 'logged out');
});

// Utility to ensure user is logged in
async function getUserId() {
    if (!authInitialized) {
        await authReadyPromise;
    }
    
    if (!currentUserId) {
        throw new Error("User not authenticated.");
    }
    return currentUserId;
}

// --- Public API ---

export async function getSites() {
    const uid = await getUserId();
    const sitesSnap = await getDocs(getSitesCollection(uid));
    return sitesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getActiveSite() {
    const uid = await getUserId();
    const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
    if (!activeSiteId) return null;

    const siteDoc = await getDoc(doc(getSitesCollection(uid), activeSiteId));
    return siteDoc.exists() ? { id: siteDoc.id, ...siteDoc.data() } : null;
}

export async function setActiveSite(siteId) {
    const uid = await getUserId();
    const siteDoc = await getDoc(doc(getSitesCollection(uid), siteId));
    if (siteDoc.exists()) {
        localStorage.setItem(ACTIVE_SITE_ID_KEY, siteId);
        return true;
    } else {
        console.error(`Site with ID ${siteId} not found for user ${uid}.`);
        throw new Error(`Site with ID ${siteId} not found.`);
    }
}

export async function addFind(findData) {
    const uid = await getUserId();
    const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
    if (!activeSiteId) throw new Error("No active site selected.");

    const findWithTimestamp = {
        ...findData,
        siteId: activeSiteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    await addDoc(getFindsCollection(uid, activeSiteId), findWithTimestamp);
}

export async function getFinds(scope = 'active') {
    const uid = await getUserId();
    let finds = [];

    if (scope === 'all') {
        const sites = await getSites();
        for (const site of sites) {
            const findsSnap = await getDocs(getFindsCollection(uid, site.id));
            finds.push(...findsSnap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                siteId: site.id 
            })));
        }
    } else {
        const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
        if (!activeSiteId) return [];
        const findsSnap = await getDocs(getFindsCollection(uid, activeSiteId));
        finds.push(...findsSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            siteId: activeSiteId 
        })));
    }
    return finds;
}

export async function addSite(siteData) {
    const uid = await getUserId();
    const siteWithTimestamp = {
        ...siteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        findsCount: 0
    };
    
    await setDoc(doc(getSitesCollection(uid), siteData.id), siteWithTimestamp);
}

export async function clearFindsForActiveSite() {
    const uid = await getUserId();
    const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
    if (!activeSiteId) throw new Error("No active site selected.");

    const findsSnap = await getDocs(getFindsCollection(uid, activeSiteId));
    const batch = writeBatch(db);
    findsSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
}

export async function getZones() {
    const uid = await getUserId();
    const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
    if (!activeSiteId) return [];

    const zonesDoc = await getDoc(getZonesDoc(uid, activeSiteId));
    return zonesDoc.exists() ? zonesDoc.data().zones || [] : [];
}

export async function saveZones(zonesArray) {
    const uid = await getUserId();
    const activeSiteId = localStorage.getItem(ACTIVE_SITE_ID_KEY);
    if (!activeSiteId) throw new Error("No active site selected.");

    await setDoc(getZonesDoc(uid, activeSiteId), { 
        zones: zonesArray,
        updatedAt: new Date().toISOString()
    });
}

export async function updateSite(siteId, key, value) {
    const uid = await getUserId();
    await updateDoc(doc(getSitesCollection(uid), siteId), { 
        [key]: value,
        updatedAt: new Date().toISOString()
    });
}

export async function initializeUserData() {
    const uid = await getUserId();
    const sites = await getSites();
    if (sites.length === 0) {
        console.log("Initializing default site for new user.");
        const defaultSiteId = `site-${Date.now()}`;
        const defaultSite = {
            id: defaultSiteId,
            name: 'Meine erste Ausgrabung',
            mapImageUrl: null,
            findsCount: 0,
            zones: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(getSitesCollection(uid), defaultSiteId), defaultSite);
        localStorage.setItem(ACTIVE_SITE_ID_KEY, defaultSiteId);
    }
}

// Helper function to get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Helper to check if user is authenticated
export function isAuthenticated() {
    return auth.currentUser !== null;
}

// ====================
// js/migration.js
// ====================
import { collection, doc, addDoc, setDoc, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const OLD_FINDS_KEY = 'datarchi.funde.v1'; // Old flat finds array
const OLD_DB_KEY = 'datarchi.vre.v1'; // Old structured local DB

export function runMigration() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // No user logged in, cannot migrate yet.
            // Data will remain in localStorage until user logs in.
            return;
        }

        const uid = user.uid;
        const sitesCollectionRef = collection(db, `users/${uid}/sites`);

        // Check if user already has sites in Firestore
        const firestoreSitesSnap = await getDocs(sitesCollectionRef);
        const hasFirestoreData = !firestoreSitesSnap.empty;

        // Check for old local storage data
        const oldFindsData = localStorage.getItem(OLD_FINDS_KEY);
        const oldStructuredData = localStorage.getItem(OLD_DB_KEY);

        if (hasFirestoreData) {
            // User already has data in Firestore. Clean up any remaining local data.
            if (oldFindsData) localStorage.removeItem(OLD_FINDS_KEY);
            if (oldStructuredData) localStorage.removeItem(OLD_DB_KEY);
            return;
        }

        // --- Migration from old flat finds array ---
        if (oldFindsData) {
            console.log('Migration: Old flat finds data found. Migrating to Firestore...');
            try {
                const oldFinds = JSON.parse(oldFindsData);

                const newSiteRef = doc(sitesCollectionRef); // Let Firestore generate site ID
                const newSiteId = newSiteRef.id;

                const defaultSite = {
                    id: newSiteId,
                    name: 'Meine erste Ausgrabung (Migriert)',
                    mapImageUrl: null,
                };
                await setDoc(newSiteRef, defaultSite);

                const findsCollectionRef = collection(db, `users/${uid}/sites/${newSiteId}/finds`);
                const batch = writeBatch(db);
                oldFinds.forEach(find => {
                    const findRef = doc(findsCollectionRef); // Let Firestore generate find ID
                    batch.set(findRef, find);
                });
                await batch.commit();

                localStorage.setItem(ACTIVE_SITE_ID_KEY, newSiteId);
                localStorage.removeItem(OLD_FINDS_KEY);
                localStorage.removeItem(OLD_ZONES_KEY); // Old zones would have been with finds

                console.log('Migration: Successfully migrated old flat finds data to Firestore.');
                window.location.reload();
                return;

            } catch (error) {
                console.error('Migration: Error during old flat finds data migration.', error);
            }
        }
        
        // --- Migration from old structured local DB ---
        if (oldStructuredData) {
            console.log('Migration: Old structured local data found. Migrating to Firestore...');
            try {
                const localDb = JSON.parse(oldStructuredData);

                for (const siteData of localDb.sites) {
                    const siteRef = doc(sitesCollectionRef);
                    siteData.id = siteRef.id; // Assign Firestore ID to site
                    await setDoc(siteRef, { ...siteData, finds: [], zones: [] }); // Create site doc without finds/zones

                    const findsCollectionRef = collection(db, `users/${uid}/sites/${siteData.id}/finds`);
                    const findsBatch = writeBatch(db);
                    siteData.finds.forEach(find => {
                        const findRef = doc(findsCollectionRef);
                        findsBatch.set(findRef, find);
                    });
                    await findsBatch.commit();

                    if (siteData.zones && siteData.zones.length > 0) {
                        const zonesDocRef = doc(db, `users/${uid}/sites/${siteData.id}/zones/doc`);
                        await setDoc(zonesDocRef, { zones: siteData.zones });
                    }
                }

                if (localDb.activeSiteId) {
                    // Find the new Firestore ID for the active site
                    const oldActiveSite = localDb.sites.find(s => s.id === localDb.activeSiteId);
                    if (oldActiveSite) {
                        localStorage.setItem(ACTIVE_SITE_ID_KEY, oldActiveSite.id);
                    }
                }
                
                localStorage.removeItem(OLD_DB_KEY);
                console.log('Migration: Successfully migrated old structured local data to Firestore.');
                window.location.reload();
                return;

            } catch (error) {
                console.error('Migration: Error during old structured local data migration.', error);
            }
        }

        // If no data was migrated but no Firestore data exists, create a default site for the user
        if (!hasFirestoreData && !oldFindsData && !oldStructuredData) {
            console.log("No existing data found, creating default site for new user.");
            const defaultSiteId = `site-${Date.now()}`;
            const defaultSite = {
                id: defaultSiteId,
                name: 'Meine erste Ausgrabung',
                mapImageUrl: null,
            };
            await setDoc(doc(sitesCollectionRef, defaultSiteId), defaultSite);
            localStorage.setItem(ACTIVE_SITE_ID_KEY, defaultSiteId);
        }
    });
}

// ====================
// js/auth-guard.js
// ====================
(function() {
    const currentPath = window.location.pathname;

    // Define explicitly public pages
    const publicPages = [
        '/',
        '/index.html',
        '/pages/legal/faq.html',
        '/pages/legal/impressum.html',
        '/pages/legal/datenschutz.html'
    ];

    // Check if the current page is one of the explicitly public pages
    const isPublicPage = publicPages.some(page => currentPath.endsWith(page));

    // If it's a public page, or we are on the root URL, do nothing and let it load
    if (isPublicPage || currentPath === '/') {
        return;
    }

    // Determine the relative path to the root index.html dynamically
    function getRelativePathToRoot() {
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        let relativePath = '';
        if (pathSegments.length > 0 && pathSegments[0] === 'DatArchi') { // Handle /DatArchi/ prefix if present
            for (let i = 0; i < pathSegments.length - 1; i++) {
                relativePath += '../';
            }
        } else { // Assume paths like /index.html or /pages/projects/index.html directly from root
            for (let i = 0; i < pathSegments.length - 1; i++) {
                relativePath += '../';
            }
        }
        return relativePath;
    }
    const relativePathToRoot = getRelativePathToRoot();

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) { // User is logged in
            // If logged in and on a public page (including index.html), redirect to projects page
            if (isPublicPage) {
                console.log('Auth Guard: User logged in, redirecting from public page to projects page.');
                const relativePathToProjects = getRelativePathToRoot() + 'pages/projects/index.html';
                window.location.href = relativePathToProjects;
            }
            // If logged in and on a private page, do nothing (let it load)
        } else { // User is NOT logged in
            // If not logged in and on a private page, redirect to home page
            if (!isPublicPage) {
                console.log('Auth Guard: User not logged in, redirecting from private page to home page.');
                window.location.href = `${relativePathToRoot}index.html`;
            }
            // If not logged in and on a public page, do nothing (let it load)
        }
    });
})();

// ====================
// js/auth-system.js
// ====================
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Global flag to track if system is initialized
let authSystemInitialized = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth System: DOM ready, initializing...');
    
    // Initialize Image System
    try {
        setupImageSystem();
        setupImageErrorHandling();
        console.log('✅ Image System initialized');
    } catch (error) {
        console.warn('⚠️ Image System initialization warning:', error.message);
    }
    
    initializeAuthSystem();
});

async function initializeAuthSystem() {
    if (authSystemInitialized) return;
    
    console.log('Auth System: Starting initialization...');
    
    // Check if auth forms exist on this page
    if (!document.getElementById('loginAuthForm') && !document.getElementById('registerAuthForm')) {
        console.log('Auth System: No auth forms found on this page');
        return;
    }
    
    try {
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            console.log('Auth System: Auth state changed, user:', user ? user.email : 'none');
            // Don't redirect on auth state change anymore - let users stay on index.html
        });
        
        authSystemInitialized = true;
        console.log('Auth System: Initialization complete');
        
        // Hide any loading overlay
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Auth System: Initialization failed:', error);
        hideLoadingOverlay();
    }
}

function setupEventListeners() {
    console.log('Setting up auth event listeners...');
    
    // Tab switching
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginTab) {
        loginTab.addEventListener('click', () => showAuthForm('login'));
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => showAuthForm('register'));
    }
    
    // Form submission handlers
    const loginForm = document.getElementById('loginAuthForm');
    const registerForm = document.getElementById('registerAuthForm');
    const resetForm = document.getElementById('resetAuthForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    
    // Google login button
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('reset');
        });
    }
    
    // Back to login from reset
    const backToLoginBtn = document.getElementById('backToLoginFromReset');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => showAuthForm('login'));
    }
    
    // Password visibility toggles
    setupPasswordToggles();
    
    // Password strength indicator
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
        registerPassword.addEventListener('input', checkPasswordMatch);
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }
    
    console.log('Event listeners setup complete');
}

function setupPasswordToggles() {
    const toggleLoginBtn = document.getElementById('toggleLoginPassword');
    const toggleRegisterBtn = document.getElementById('toggleRegisterPassword');
    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
    
    if (toggleLoginBtn) {
        toggleLoginBtn.addEventListener('click', () => togglePasswordVisibility('loginPassword', toggleLoginBtn));
    }
    
    if (toggleRegisterBtn) {
        toggleRegisterBtn.addEventListener('click', () => togglePasswordVisibility('registerPassword', toggleRegisterBtn));
    }
    
    if (toggleConfirmBtn) {
        toggleConfirmBtn.addEventListener('click', () => togglePasswordVisibility('confirmPassword', toggleConfirmBtn));
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const loginBtn = document.getElementById('loginBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    // Clear previous messages
    clearMessages();
    
    // Basic validation
    if (!email || !password) {
        showMessage(authError, 'Bitte E-Mail und Passwort eingeben', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage(authError, 'Bitte eine gültige E-Mail-Adresse eingeben', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true, loginBtn);
    
    try {
        console.log('Attempting Firebase login...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Login successful for user:', user.email);
        
        // Check email verification
        if (!user.emailVerified) {
            console.log('Sending verification email...');
            await sendEmailVerification(user);
            showMessage(authSuccess, 'Bitte verifizieren Sie Ihre E-Mail. Ein Link wurde gesendet.', 'success');
        } else {
            showMessage(authSuccess, 'Erfolgreich angemeldet! Weiterleitung...', 'success');
        }
        
        // Initialize user data
        console.log('Initializing user data...');
        await initializeUserData(user.uid);
        
        // Clear form
        if (loginForm) loginForm.reset();
        
        // Redirect after short delay
        setTimeout(() => {
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 
                               getMapPageUrl();
            sessionStorage.removeItem('redirectAfterLogin');
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }, 2000);
        
    } catch (error) {
        console.error('Login error details:', error);
        const errorMessage = getGermanErrorMessage(error);
        showMessage(authError, errorMessage, 'error');
        setLoadingState(false, loginBtn);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Registration attempt...');
    
    const name = document.getElementById('registerName')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const acceptTerms = document.getElementById('acceptTerms');
    const registerBtn = document.getElementById('registerBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    // Clear previous messages
    clearMessages();
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage(authError, 'Bitte alle Felder ausfüllen', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage(authError, 'Bitte eine gültige E-Mail-Adresse eingeben', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(authError, 'Passwörter stimmen nicht überein', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(authError, 'Passwort muss mindestens 6 Zeichen lang sein', 'error');
        return;
    }
    
    if (acceptTerms && !acceptTerms.checked) {
        showMessage(authError, 'Bitte Datenschutzbestimmungen akzeptieren', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true, registerBtn);
    
    try {
        console.log('Creating user account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created:', user.uid);
        
        // Update profile with name
        console.log('Updating profile...');
        await updateProfile(user, { displayName: name });
        
        // Send verification email
        console.log('Sending verification email...');
        await sendEmailVerification(user);
        
        // Initialize user data
        console.log('Initializing user data...');
        await initializeUserData(user.uid);
        
        showMessage(authSuccess, 'Registrierung erfolgreich! Bitte E-Mail verifizieren.', 'success');
        
        // Clear form
        if (registerForm) registerForm.reset();
        
        // Switch to login form after delay
        setTimeout(() => {
            showAuthForm('login');
            setLoadingState(false, registerBtn);
            showMessage(authSuccess, 'Sie können sich jetzt mit Ihrer E-Mail anmelden.', 'success');
        }, 3000);
        
    } catch (error) {
        console.error('Registration error details:', error);
        const errorMessage = getGermanErrorMessage(error);
        showMessage(authError, errorMessage, 'error');
        setLoadingState(false, registerBtn);
    }
}

async function handleGoogleLogin() {
    console.log('Google login attempt...');
    
    const googleBtn = document.getElementById('googleLoginBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    // Clear previous messages
    clearMessages();
    
    // Show loading state
    setLoadingState(true, googleBtn);
    
    try {
        const provider = new GoogleAuthProvider();
        console.log('Opening Google sign-in popup...');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('Google login successful for:', user.email);
        
        // Check if new user
        const isNewUser = result._tokenResponse?.isNewUser || false;
        
        if (isNewUser) {
            console.log('New Google user, initializing data...');
            await initializeUserData(user.uid);
            showMessage(authSuccess, 'Google-Registrierung erfolgreich!', 'success');
        } else {
            showMessage(authSuccess, 'Google-Anmeldung erfolgreich!', 'success');
        }
        
        // Clear forms
        const loginForm = document.getElementById('loginAuthForm');
        const registerForm = document.getElementById('registerAuthForm');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Redirect after delay
        setTimeout(() => {
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 
                               getMapPageUrl();
            sessionStorage.removeItem('redirectAfterLogin');
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }, 2000);
        
    } catch (error) {
        console.error('Google auth error details:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            const errorMessage = getGermanErrorMessage(error);
            showMessage(authError, errorMessage, 'error');
        }
        setLoadingState(false, googleBtn);
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();
    console.log('Password reset request...');
    
    const email = document.getElementById('resetEmail')?.value.trim();
    const resetBtn = document.getElementById('resetPasswordBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    // Clear previous messages
    clearMessages();
    
    if (!email) {
        showMessage(authError, 'Bitte E-Mail eingeben', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage(authError, 'Bitte eine gültige E-Mail-Adresse eingeben', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true, resetBtn);
    
    try {
        console.log('Sending password reset email...');
        await sendPasswordResetEmail(auth, email);
        showMessage(authSuccess, 'Passwort-Reset-Link wurde gesendet! Bitte prüfen Sie Ihr E-Mail-Postfach.', 'success');
        
        // Clear form
        if (resetForm) resetForm.reset();
        
        // Switch back to login form after delay
        setTimeout(() => {
            showAuthForm('login');
            setLoadingState(false, resetBtn);
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error details:', error);
        const errorMessage = getGermanErrorMessage(error);
        showMessage(authError, errorMessage, 'error');
        setLoadingState(false, resetBtn);
    }
}

// ====================
// HELPER FUNCTIONS
// ====================

function setLoadingState(isLoading, button = null) {
    console.log('Setting loading state:', isLoading);
    
    // Show/hide loading overlay
    const loadingOverlay = document.getElementById('authLoading');
    if (loadingOverlay) {
        loadingOverlay.hidden = !isLoading;
        console.log('Loading overlay visibility:', !isLoading ? 'hidden' : 'visible');
    } else {
        console.warn('Loading overlay element not found!');
    }
    
    // Disable/enable specific button if provided
    if (button) {
        button.disabled = isLoading;
        const icon = button.querySelector('i');
        if (icon && isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bitte warten...';
        }
    }
    
    // Also disable/enable all form inputs
    const inputs = document.querySelectorAll('.auth-form input, .auth-form button');
    inputs.forEach(input => {
        if (input !== button && input.type !== 'submit') {
            input.disabled = isLoading;
        }
    });
}

function hideLoadingOverlay() {
    console.log('Hiding loading overlay...');
    const loadingOverlay = document.getElementById('authLoading');
    if (loadingOverlay) {
        loadingOverlay.hidden = true;
        console.log('Loading overlay hidden');
    }
    
    // Also enable all form elements
    const inputs = document.querySelectorAll('.auth-form input, .auth-form button');
    inputs.forEach(input => {
        input.disabled = false;
        
        // Reset button text if it has a spinner
        if (input.tagName === 'BUTTON' && input.innerHTML.includes('fa-spinner')) {
            if (input.id === 'loginBtn') {
                input.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
            } else if (input.id === 'registerBtn') {
                input.innerHTML = '<i class="fas fa-user-plus"></i> Konto erstellen';
            } else if (input.id === 'googleLoginBtn') {
                input.innerHTML = '<i class="fab fa-google"></i> Mit Google fortfahren';
            } else if (input.id === 'resetPasswordBtn') {
                input.innerHTML = '<i class="fas fa-paper-plane"></i> Link senden';
            }
        }
    });
}

function showMessage(element, message, type) {
    if (!element) {
        console.warn('Message element not found, trying alternatives...');
        
        // Try to find any message element
        const authError = document.getElementById('authError');
        const authSuccess = document.getElementById('authSuccess');
        
        element = type === 'error' ? authError : authSuccess;
        
        if (!element) {
            console.error('No message elements found!');
            return;
        }
    }
    
    element.textContent = message;
    element.hidden = false;
    
    // Update classes
    element.classList.remove('alert-success', 'alert-danger', 'alert-info');
    
    switch (type) {
        case 'success':
            element.classList.add('alert-success');
            break;
        case 'error':
            element.classList.add('alert-danger');
            break;
        case 'info':
            element.classList.add('alert-info');
            break;
        case 'clear':
            element.hidden = true;
            break;
    }
    
    console.log(`Showing ${type} message:`, message);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (!element.hidden) {
                element.hidden = true;
                console.log('Auto-hid success message');
            }
        }, 5000);
    }
}

function clearMessages() {
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    if (authError) {
        authError.hidden = true;
        authError.textContent = '';
    }
    
    if (authSuccess) {
        authSuccess.hidden = true;
        authSuccess.textContent = '';
    }
}

function getGermanErrorMessage(error) {
    console.log('Firebase error code:', error.code);
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Diese E-Mail-Adresse wird bereits verwendet.';
        case 'auth/invalid-email':
            return 'Ungültige E-Mail-Adresse.';
        case 'auth/user-not-found':
            return 'Kein Konto mit dieser E-Mail gefunden.';
        case 'auth/wrong-password':
            return 'Falsches Passwort.';
        case 'auth/weak-password':
            return 'Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.';
        case 'auth/too-many-requests':
            return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
        case 'auth/operation-not-allowed':
            return 'Diese Anmeldemethode ist nicht aktiviert.';
        case 'auth/user-disabled':
            return 'Dieses Konto wurde deaktiviert.';
        case 'auth/popup-closed-by-user':
            return 'Anmeldung wurde abgebrochen.';
        case 'auth/popup-blocked':
            return 'Pop-up wurde blockiert. Bitte erlauben Sie Pop-ups für diese Seite.';
        case 'auth/network-request-failed':
            return 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
        default:
            return `Ein Fehler ist aufgetreten: ${error.message}`;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function updatePasswordStrength() {
    const password = document.getElementById('registerPassword')?.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText || !password) return;
    
    let strength = 0;
    let color = '#dc3545';
    let text = 'Schwach';
    
    // Length check
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Determine strength
    if (strength >= 4) {
        color = '#28a745';
        text = 'Stark';
    } else if (strength >= 3) {
        color = '#ffc107';
        text = 'Mittel';
    }
    
    // Update UI
    strengthBar.style.width = `${strength * 20}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

function checkPasswordMatch() {
    const password = document.getElementById('registerPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    const matchElement = document.getElementById('passwordMatch');
    
    if (!matchElement || !password || !confirm) {
        if (matchElement) matchElement.hidden = true;
        return;
    }
    
    if (password === confirm) {
        matchElement.innerHTML = '<i class="fas fa-check"></i> <span>Passwörter stimmen überein</span>';
        matchElement.style.color = '#28a745';
        matchElement.hidden = false;
    } else {
        matchElement.innerHTML = '<i class="fas fa-times"></i> <span>Passwörter stimmen nicht überein</span>';
        matchElement.style.color = '#dc3545';
        matchElement.hidden = false;
    }
}

function togglePasswordVisibility(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const icon = toggleBtn.querySelector('i');
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showAuthForm(formType) {
    console.log('Switching to form:', formType);
    
    // Hide all forms
    const forms = document.querySelectorAll('.auth-form-container');
    forms.forEach(form => {
        form.style.display = 'none';
    });
    
    // Hide reset form if it exists separately
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        resetForm.hidden = true;
    }
    
    // Show selected form
    let formToShow;
    if (formType === 'reset') {
        formToShow = document.getElementById('resetPasswordForm');
    } else {
        formToShow = document.getElementById(`${formType}Form`);
    }
    
    if (formToShow) {
        if (formType === 'reset') {
            formToShow.hidden = false;
        } else {
            formToShow.style.display = 'block';
        }
    }
    
    // Update tabs
    const tabs = document.querySelectorAll('.auth-tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tab = document.getElementById(`${formType}Tab`);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Clear messages
    clearMessages();
}

function getProjectsPageUrl() {
    const relativePath = getRelativePathToRoot();
    return `${relativePath}pages/projects/index.html`;
}

function getRelativePathToRoot() {
    const pathname = window.location.pathname;
    
    // If we're at root, no need for relative path
    if (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html')) {
        return '';
    }
    
    // Calculate relative path
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    let relativePath = '';
    
    for (let i = 0; i < pathSegments.length - 1; i++) {
        relativePath += '../';
    }
    
    return relativePath;
}

// Export for debugging
window.authSystem = {
    initializeAuthSystem,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handlePasswordReset,
    hideLoadingOverlay
};

console.log('Auth system module loaded');

// ====================
// js/injectHeaderFooter.js
// ====================
// Run migration check on every page load.
runMigration();

// Inject header and footer from external HTML files
async function injectSection(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    const html = await response.text();
    el.innerHTML = html;
    return;
  } catch (e) {
    // Rethrow to allow caller to attempt fallback
    throw e;
  }
}

function adjustLinks(container, siteRoot) {
  if (!container || !siteRoot) return;

  const selectors = ['a[href]', '[src]', 'link[href]'];
  const attributes = ['href', 'src', 'href'];

  selectors.forEach((selector, index) => {
    const attribute = attributes[index];
    const elements = container.querySelectorAll(selector);

    elements.forEach((el) => {
      const path = el.getAttribute(attribute);
      if (!path) return;

      // Adjust only root-relative paths, ignore external, mailto, etc.
      if (path.startsWith('/') && !path.startsWith('//')) {
        // Remove the leading slash and resolve relative to the siteRoot
        const relativePath = path.substring(1);
        el[attribute] = new URL(relativePath, siteRoot).href;
      }
    });
  });
}

function ensureContainers() {
  if (!document.querySelector('#header-container')) {
    const headerDiv = document.createElement('div');
    headerDiv.id = 'header-container';
    document.body.prepend(headerDiv);
  }
  if (!document.querySelector('#footer-container')) {
    const footerDiv = document.createElement('div');
    footerDiv.id = 'footer-container';
    document.body.appendChild(footerDiv);
  }
}

let loaded = false;
let lastError = null;

document.addEventListener('DOMContentLoaded', async () => {
  ensureContainers();

  const siteRoot = SITE_ROOT; // Use the imported site root

  const headerUrl = new URL('partials/header.html', siteRoot).href;
  const footerUrl = new URL('partials/footer.html', siteRoot).href;
  
  try {
    await Promise.all([
      injectSection('#header-container', headerUrl),
      injectSection('#footer-container', footerUrl)
    ]);

    const headerEl = document.querySelector('#header-container');
    const footerEl = document.querySelector('#footer-container');

    // Adjust links inside the newly injected header and footer
    adjustLinks(headerEl, siteRoot);
    adjustLinks(footerEl, siteRoot);

    loaded = true;
    document.dispatchEvent(new Event('headerFooterReady'));

  } catch (err) {
    lastError = err;
    console.warn('injectHeaderFooter: failed to load partials:', err);
  }

  if (!loaded) {
    console.error('injectHeaderFooter: failed to load header/footer. See earlier warnings.', lastError);
    const header = document.querySelector('#header-container');
    const footer = document.querySelector('#footer-container');
    const message = `
      <div style="background:#fff3cd;border:1px solid #ffecb5;padding:12px;border-radius:6px;color:#533f03">
        <strong>Header/Footer not loaded.</strong>
        This usually happens when opening pages directly via <code>file://</code>.
        Run a local HTTP server from the project root and open <code>http://localhost:8000</code> instead.
      </div>`;
    if (header && header.innerHTML.trim() === '') header.innerHTML = message;
    if (footer && footer.innerHTML.trim() === '') footer.innerHTML = '';
  }
});

// ====================
// js/leaflet-zones.js
// ====================
let map = null;
let zoneLayerGroup = null;
let imageBounds = null; // To be set from the main map

// Debounce save function to avoid excessive writes to database
const saveZonesDebounced = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => await saveZones(), 250); // Await saveZones
  };
})();

// --- Core Functions ---

async function saveZones() { // Made async
  if (!zoneLayerGroup) return;

  const zones = [];
  zoneLayerGroup.eachLayer(layer => {
    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
      // CRS.Simple: lat is y, lng is x
      const zoneData = {
        id: layer.options.zoneId,
        label: layer.options.zoneLabel,
        x: bounds.getWest(),  // lng
        y: bounds.getNorth(), // lat
        width: bounds.getEast() - bounds.getWest(),
        height: bounds.getSouth() - bounds.getNorth(),
      };
      // Correct for negative height from Leaflet's bounds
      if (zoneData.height < 0) {
        zoneData.y = zoneData.y + zoneData.height;
        zoneData.height = -zoneData.height;
      }
      zones.push(zoneData);
    }
  });
  
  await db.saveZones(zones); // Await db.saveZones
  console.log(`[Zones] Saved ${zones.length} zones to active site.`);
  await updateSidebarList(); // Await updateSidebarList
}

async function loadZones() { // Made async
  if (!zoneLayerGroup) return;
  
  const zones = await db.getZones(); // Await db.getZones
  if (!zones || zones.length === 0) {
    console.log('[Zones] No zones found for active site.');
    return;
  }

  clearAllLayers(true); // silent clear all Leaflet layers first

  zones.forEach(zoneData => {
    const { x, y, width, height, id, label } = zoneData;
    // Leaflet bounds are [[north, west], [south, east]]
    // With CRS.Simple, North/South are y, West/East are x
    const bounds = [[y, x], [y + height, x + width]];
    
    const rect = L.rectangle(bounds, {
      zoneId: id,
      zoneLabel: label,
      color: 'var(--accent)',
      weight: 1,
      fillOpacity: 0.1,
    });

    rect.bindPopup(`<strong>${label}</strong>`);
    rect.on('click', () => rect.bringToFront());
    zoneLayerGroup.addLayer(rect);
  });
  
  console.log(`[Zones] Loaded ${zones.length} zones onto the map.`);
  await updateSidebarList(); // Await updateSidebarList
}

async function generateGrid(cols, rows) { // Made async
  if (!imageBounds) {
    console.error('[Zones] Cannot generate grid, image bounds not set.');
    return;
  }

  const totalWidth = imageBounds.getEast() - imageBounds.getWest();
  const totalHeight = imageBounds.getNorth() - imageBounds.getSouth();

  const cellWidth = totalWidth / cols;
  const cellHeight = totalHeight / rows;
  
  let idCounter = 1;
  const newZones = [];

  const activeSite = await db.getActiveSite(); // Await db.getActiveSite()

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x1 = imageBounds.getWest() + c * cellWidth;
      const y1 = imageBounds.getNorth() - r * cellHeight;
      const x2 = x1 + cellWidth;
      const y2 = y1 - cellHeight;
      
      const bounds = [[y1, x1], [y2, x2]];
      const label = `Zone ${r + 1}-${c + 1}`;
      const id = `zone-${activeSite.id}-${idCounter++}`; // Unique ID per site
      
      const rect = L.rectangle(bounds, {
        zoneId: id,
        zoneLabel: label,
        color: 'var(--accent)',
        weight: 1,
        fillOpacity: 0.1,
      });

      rect.bindPopup(`<strong>${label}</strong>`);
      zoneLayerGroup.addLayer(rect);
      newZones.push({x: x1, y: y1, width: cellWidth, height: cellHeight, id: id, label: label});
    }
  }

  await db.saveZones(newZones); // Await db.saveZones
  console.log(`[Zones] Generated a ${cols}x${rows} grid.`);
  await updateSidebarList(); // Await updateSidebarList
}

async function clearAllLayers(silent = false) { // Made async
  if (!zoneLayerGroup) return;
  zoneLayerGroup.clearLayers();
  if (!silent) {
    console.log('[Zones] Cleared all zones.');
    await db.saveZones([]); // Await db.saveZones
  }
  await updateSidebarList(); // Await updateSidebarList
}

// --- UI and Sidebar ---

async function updateSidebarList() { // Made async
  const zoneListEl = document.getElementById('zoneList');
  if (!zoneListEl) return;
  
  zoneListEl.innerHTML = '';
  
  const zones = await db.getZones(); // Await db.getZones
  if (!zones || zones.length === 0) {
    zoneListEl.innerHTML = '<li class="text-muted" style="padding: 10px;">Keine Zonen definiert.</li>';
    return;
  }

  zones.forEach(zoneData => {
    const li = document.createElement('li');
    li.textContent = zoneData.label;
    li.setAttribute('data-zone-id', zoneData.id);

    li.addEventListener('click', () => {
      // Find the corresponding Leaflet layer
      zoneLayerGroup.eachLayer(layer => {
          if (layer.options.zoneId === zoneData.id) {
              map.fitBounds(layer.getBounds(), { padding: [50, 50] });
              layer.openPopup();
          }
      });
    });
    
    zoneListEl.appendChild(li);
  });
}

function attachUIListeners() {
  const btnGenerate = document.getElementById('btnGenerateGrid');
  const gridColsInput = document.getElementById('gridCols');
  const gridRowsInput = document.getElementById('gridRows');
  const gridClearCheckbox = document.getElementById('gridClear');
  const gridInfoMessage = document.getElementById('gridInfoMessage');

  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => { // Made async
      const cols = parseInt(gridColsInput.value, 10) || 4;
      const rows = parseInt(gridRowsInput.value, 10) || 3;

      if (gridClearCheckbox.checked) {
        if (confirm(`Dies löscht alle vorhandenen Zonen und generiert ein neues ${cols}x${rows} Raster. Fortfahren?`)) {
          await clearAllLayers(true); // silent clear before generating (await)
          await generateGrid(cols, rows); // await generateGrid
        }
      }
      else {
        if ((await db.getZones()).length > 0) { // Await db.getZones
          alert('Es existieren bereits Zonen. Bitte aktivieren Sie die "Löschen" Checkbox, um das Raster zu ersetzen.');
          return;
        }
        await generateGrid(cols, rows); // Await generateGrid
      }
    });
  }

  async function updateGenerateButtonState() { // Made async
        const hasZones = (await db.getZones()).length > 0; // Await db.getZones
        if (hasZones) {
            gridInfoMessage.textContent = 'Aktivieren Sie "Löschen", um das Raster zu ersetzen.';
            btnGenerate.textContent = 'Ersetzen';
            btnGenerate.disabled = !gridClearCheckbox.checked;
        } else {
            gridInfoMessage.textContent = '';
            btnGenerate.textContent = 'Generieren';
            btnGenerate.disabled = false;
        }
    }
  
    if (gridClearCheckbox) {
      gridClearCheckbox.addEventListener('change', updateGenerateButtonState);
    }
    // Initial state
    // This part should only run after initialization
    // The init function will call updateGenerateButtonState
}

// --- Initialization ---
export async function initZones(leafletMap, bounds) { // Made async
  if (!leafletMap) {
    console.error('[Zones] Leaflet map object is required for initialization.');
    return;
  }
  map = leafletMap;
  imageBounds = bounds;
  zoneLayerGroup = L.layerGroup().addTo(map);

  attachUIListeners();
  await loadZones(); // Await loadZones
  // Call updateGenerateButtonState after zones are loaded
  const gridClearCheckbox = document.getElementById('gridClear');
  const btnGenerate = document.getElementById('btnGenerateGrid');
  if (gridClearCheckbox && btnGenerate) {
    updateGenerateButtonState(); // Initial state update
  }
}

// ====================
// js/main-map.js
// ====================
document.addEventListener('DOMContentLoaded', async () => { // Made async
  let activeSite = await db.getActiveSite(); // Await getActiveSite
  if (!activeSite) {
      console.error('No active site found. Redirecting to site management.');
      const imageMap = document.getElementById('imageMap');
      if (imageMap) {
        imageMap.innerHTML = `<p style="text-align:center; padding: 20px;">Bitte wählen oder erstellen Sie eine Ausgrabungsstätte in der <a href="../sites/index.html">Stättenverwaltung</a>.</p>`;
      }
      return;
  }

  // 1. Initialize Leaflet Map
  const map = L.map('imageMap', {
    crs: L.CRS.Simple,
    zoomControl: false,
  });

  // 2. Load Image Overlay from active site
  const mapImageUrl = activeSite.mapImageUrl;
  if (mapImageUrl) {
    const img = new Image();
    img.onload = async () => { // Made async
      // Defer execution to ensure the browser has completed layout calculations
      setTimeout(async () => { // Made async
        const mapContainer = document.getElementById('imageMap');
        if (!mapContainer) return;

        const containerWidth = mapContainer.offsetWidth;
        const imageAspectRatio = img.naturalHeight / img.naturalWidth;
        const calculatedHeight = containerWidth * imageAspectRatio;

        mapContainer.style.height = `${calculatedHeight}px`;
        
        const imageBounds = L.latLngBounds([[0, 0], [img.naturalHeight, img.naturalWidth]]);
        
        // Invalidate map size AFTER setting the new height
        map.invalidateSize();

        L.imageOverlay(mapImageUrl, imageBounds).addTo(map);
        map.fitBounds(imageBounds);

        // Initialize Zone Management
        await initZones(map, imageBounds); // Await zones.init
        await loadAndDisplayFinds(); // Await loadAndDisplayFinds
      }, 0);
    };
    img.onerror = async () => { // Made async
      console.error('Failed to load map image:', mapImageUrl);
      const imageMap = document.getElementById('imageMap');
      if (imageMap) {
        imageMap.innerHTML = '<p style="text-align:center; padding: 20px;">Kartenbild konnte nicht geladen werden.</p>';
      }
      // Still load finds even if map image fails
      await loadAndDisplayFinds(); // Await loadAndDisplayFinds
    };
    img.src = mapImageUrl;
  } else {
    const imageMap = document.getElementById('imageMap');
    if (imageMap) {
      imageMap.innerHTML = `<p style="text-align:center; padding: 20px;">Kein Kartenbild für diese Stätte hinterlegt. Gehen Sie zur <a href="../sites/index.html">Stättenverwaltung</a> um eines hinzuzufügen.</p>`;
    }
    // Still load finds even if map image is missing
    await loadAndDisplayFinds(); // Await loadAndDisplayFinds
  }

  // Helper function to escape HTML for popups
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'" : '&#39;'
    }[c]));
  }

  // Helper function to build the popup content for a find
  function buildPopupContent(find) {
    const title = escapeHtml(find.name || find.titel || 'Unbenannter Fund');
    const description = escapeHtml(find.description || find.beschreibung || 'Keine Beschreibung.');
    const datierung = escapeHtml(find.dating || find.datierung || 'N/A');
    const zoneLabel = escapeHtml(find.zoneLabel || '');
    const fundId = escapeHtml(find.id || 'N/A'); // Use find.id for fundId
    const kategorie = escapeHtml(find.category || find.kategorie || 'N/A');
    
    let html = `<h3 style="margin: 0 0 5px 0; font-size: 16px;">${title} <small class="text-muted" style="font-size: 0.8em;">(ID: ${fundId})</small></h3>`;
    if (find.photoUrl) { // Use photoUrl from Firebase Storage
      html += `<img src="${find.photoUrl}" alt="${title}" style="width:100%; height:auto; max-height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">`;
    }
    html += `<p style="margin: 0; font-size: 14px;">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>`;
    
    let detailsHtml = `<div style="margin-top: 8px; font-size: 12px; color: #666;">`;
    detailsHtml += `<div><strong>Datierung:</strong> ${datierung}</div>`;
    detailsHtml += `<div><strong>Kategorie:</strong> ${kategorie}</div>`;
    if (zoneLabel) {
      detailsHtml += `<div><strong>Zone:</strong> ${zoneLabel}</div>`;
    }
    if (find.modelUrl) {
      detailsHtml += `<div><strong>3D-Modell:</strong> <a href="${find.modelUrl}" target="_blank" rel="noopener">Ansehen</a></div>`;
    }
    detailsHtml += `</div>`;
    
    html += detailsHtml;
    
    return html;
  }

  // 4. Function to Load Finds and Display them
  async function loadAndDisplayFinds() { // Made async
    // Clear all existing markers on the map before adding new ones
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const finds = await db.getFinds('active'); // Await db.getFinds
    
    if (finds.length === 0) {
      console.log('No finds in active site to display.');
      return;
    }

    finds.forEach(find => {
      // Check if the find has valid coordinates
      if (isFinite(find.latitude) && isFinite(find.longitude)) { // Changed from find.latitude && find.longitude to isFinite()
        const popupContent = buildPopupContent(find);
        L.marker([find.latitude, find.longitude])
          .addTo(map)
          .bindPopup(popupContent);
      }
    });

    console.log(`Displayed ${finds.filter(f => isFinite(f.latitude)).length} finds on the map for active site.`);
  }
});

// ====================
// js/theme-toggle.js
// ====================
(function() {
  const THEME_STORAGE_KEY = 'datarchi.theme';
  const themeToggleButton = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  // Update toggle UI if available
  function updateToggleUI(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const sun = button.querySelector('.sun');
    const moon = button.querySelector('.moon');
    if (sun) sun.hidden = (theme === 'dark');
    if (moon) moon.hidden = (theme === 'light');
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} mode`);
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    updateToggleUI(newTheme);
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priority: 1. Saved theme, 2. System preference, 3. Default to light
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
  }

  // Use delegated listener for theme toggle (works anytime button appears)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      e.preventDefault();
      toggleTheme();
    }
  }, true);

  // Initialize theme and update UI when header loads
  document.addEventListener('headerFooterReady', () => {
    const current = htmlElement.getAttribute('data-theme') || 'light';
    updateToggleUI(current);
  });

  // Run initialization
  initializeTheme();
})();

// ====================
// Additional Page-Specific Functions
// ====================

// For finds.html page
document.addEventListener('DOMContentLoaded', async () => { // Made DOMContentLoaded async
  const container = document.getElementById('finds-list');
  const searchInput = document.getElementById('searchInput');
  const materialFilter = document.getElementById('materialFilter');
  const kategorieFilter = document.getElementById('kategorieFilter');
  const searchAllSitesCheckbox = document.getElementById('searchAllSites');

  let allFinds = []; // Cache for all finds from the selected scope (active site or all sites)

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&#39;'}[c]));
  }

  async function fetchAndRenderFinds() { // Made async
    const activeSite = await db.getActiveSite();
    if (!activeSite && !(searchAllSitesCheckbox?.checked ?? false)) {
        if (container) {
          container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">Keine aktive Ausgrabungsstätte ausgewählt. Bitte gehen Sie zur <a href="../sites/index.html">Stättenverwaltung</a>.</p>`;
        }
        // Also clear filters if no finds
        if (materialFilter) materialFilter.innerHTML = '<option value="">Alle Materialien</option>';
        if (kategorieFilter) kategorieFilter.innerHTML = '<option value="">Alle Kategorien</option>';
        return;
    }

    allFinds = (searchAllSitesCheckbox?.checked ?? false) ? await db.getFinds('all') : await db.getFinds('active'); // Await db.getFinds
    allFinds.reverse(); // Show newest first
    
    // Make allFinds available globally for other modules (e.g., funde-map.js)
    window.allFinds = allFinds;

    if (allFinds.length === 0 && container) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">Noch keine Funde erfasst. <a href="./eingeben.html">Jetzt den ersten Fund erfassen!</a></p>`;
        // Also clear filters if no finds
        if (materialFilter) materialFilter.innerHTML = '<option value="">Alle Materialien</option>';
        if (kategorieFilter) kategorieFilter.innerHTML = '<option value="">Alle Kategorien</option>';
        return;
    }
    
    populateFilters();
    renderFinds();
  }

  function populateFilters() {
    if (!allFinds.length) {
        if (materialFilter) materialFilter.innerHTML = '<option value="">Alle Materialien</option>';
        if (kategorieFilter) kategorieFilter.innerHTML = '<option value="">Alle Kategorien</option>';
        return;
    }

    // Preserve current selection if possible
    const currentMaterial = materialFilter?.value;
    const currentKategorie = kategorieFilter?.value;

    const materials = [...new Set(allFinds.map(find => find.material).filter(Boolean))].sort();
    const kategorien = [...new Set(allFinds.map(find => find.category || find.kategorie).filter(Boolean))].sort();

    // Reset and populate material filter
    if (materialFilter) {
        materialFilter.innerHTML = '<option value="">Alle Materialien</option>';
        materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialFilter.appendChild(option);
        });
        if (currentMaterial && materials.includes(currentMaterial)) materialFilter.value = currentMaterial;
    }
    // Reset and populate category filter
    if (kategorieFilter) {
        kategorieFilter.innerHTML = '<option value="">Alle Kategorien</option>';
        kategorien.forEach(kategorie => {
            const option = document.createElement('option');
            option.value = kategorie;
            option.textContent = kategorie.charAt(0).toUpperCase() + kategorie.slice(1);
            kategorieFilter.appendChild(option);
        });
        if (currentKategorie && kategorien.includes(currentKategorie)) kategorieFilter.value = currentKategorie;
    }
  }

  async function renderFinds() { // Made async
    if (!container) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedMaterial = materialFilter?.value;
    const selectedKategorie = kategorieFilter?.value;

    const filteredFinds = allFinds.filter(find => {
      const matchesSearch = (
        find.name?.toLowerCase().includes(searchTerm) || 
        find.titel?.toLowerCase().includes(searchTerm) ||
        find.description?.toLowerCase().includes(searchTerm) ||
        find.beschreibung?.toLowerCase().includes(searchTerm) ||
        find.material?.toLowerCase().includes(searchTerm)
      );
      const matchesMaterial = !selectedMaterial || find.material === selectedMaterial;
      const matchesKategorie = !selectedKategorie || find.category === selectedKategorie || find.kategorie === selectedKategorie;
      
      return matchesSearch && matchesMaterial && matchesKategorie;
    });

    if (filteredFinds.length === 0) {
      container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">Keine Funde für die aktuellen Filtereinstellungen gefunden.</p>`;
      return;
    }

    const sites = await db.getSites(); // Await getSites for site name display
    const activeSite = await db.getActiveSite();

    container.innerHTML = filteredFinds.map(find => {
      const title = escapeHtml(find.name || find.titel || 'Unbenannter Fund');
      const description = escapeHtml(find.description || find.beschreibung || 'Keine Beschreibung vorhanden.');
      const fundId = escapeHtml(find.id || 'N/A'); // Using find.id for fundId
      const material = escapeHtml(find.material || 'N/A');
      const kategorie = escapeHtml(find.category || find.kategorie || 'N/A');
      const datierung = escapeHtml(find.dating || find.datierung || 'N/A');
      const privacy = escapeHtml(find.visibility || find.privacy || 'private');
      const berichte = escapeHtml(find.reports || find.berichte || '');
      const hasModel = find.modelUrl ? 'Ja' : 'Nein';

      let siteInfoHtml = '';
      if ((searchAllSitesCheckbox?.checked ?? false) && find.siteId) {
          const findSite = sites.find(s => s.id === find.siteId); // Use fetched sites
          if (findSite) {
              siteInfoHtml = `<span style="font-size: 0.8em; color: var(--muted); margin-left: 8px;">(Stätte: ${escapeHtml(findSite.name)})</span>`;
          }
      } else if (activeSite) {
          siteInfoHtml = `<span style="font-size: 0.8em; color: var(--muted); margin-left: 8px;">(Stätte: ${escapeHtml(activeSite.name)})</span>`;
      }

      // Use random find image if no photo URL provided
      let imageUrl = find.photoUrl;
      if (!imageUrl) {
        // Import random find image utility
        const { getRandomFindImage } = await import('./image-utilities.js');
        imageUrl = getRandomFindImage();
      }
      
      const imageHtml = imageUrl && !imageUrl.includes('undefined')
        ? `<img src="${imageUrl}" alt="${title}" class="find-card-image">`
        : `<div class="find-card-image-placeholder">Kein Bild vorhanden</div>`;

      const modelLinkHtml = find.modelUrl 
        ? `<span><strong>3D-Modell:</strong> <a href="${find.modelUrl}" target="_blank" rel="noopener">Ansehen</a></span>`
        : `<span><strong>3D-Modell:</strong> Nein</span>`;

      return `
        <div class="find-card">
          ${imageHtml}
          <div class="find-card-content">
            <h3 class="find-card-title">${title} <span class="text-muted" style="font-size: 12px; font-weight: 400;">(${fundId})</span>${siteInfoHtml}</h3>
            <p class="find-card-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
            ${berichte ? `<p class="find-card-description"><small>Berichte: ${berichte.substring(0, 70)}${berichte.length > 70 ? '...' : ''}</small></p>` : ''}
            <div class="find-card-details">
              <span><strong>Material:</strong> ${material}</span>
              <span><strong>Kategorie:</strong> ${kategorie}</span>
              <span><strong>Datierung:</strong> ${datierung}</span>
              <span><strong>Sichtbarkeit:</strong> ${privacy}</span>
              ${modelLinkHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Update map tab if it exists
    if (window.updateFundorteMapTab) {
      window.updateFundorteMapTab();
    }
  }
  
  function init() {
    if (searchInput) searchInput.addEventListener('input', renderFinds);
    if (materialFilter) materialFilter.addEventListener('change', renderFinds);
    if (kategorieFilter) kategorieFilter.addEventListener('change', renderFinds);
    if (searchAllSitesCheckbox) searchAllSitesCheckbox.addEventListener('change', fetchAndRenderFinds);

    fetchAndRenderFinds();
  }

  if (container) {
    init();
  }
});

// ====================
// js/sites.js
// ====================
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

// For sites.html page
document.addEventListener('DOMContentLoaded', async () => { // Made DOMContentLoaded async
    const sitesListEl = document.getElementById('sitesList');
    const createSiteForm = document.getElementById('createSiteForm');
    const updateMapImageBtn = document.getElementById('updateMapImageBtn');
    const siteMapImageInput = document.getElementById('siteMapImage');
    const alertEl = document.getElementById('alert');

    async function uploadFileToFirebase(file, path) {
        if (!file) return null;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }

    async function renderSites() { // Make async
        if (!sitesListEl) return;

        const sites = await db.getSites(); // Await db.getSites()
        const activeSite = await db.getActiveSite(); // Await db.getActiveSite()
        
        sitesListEl.innerHTML = ''; // Clear list

        if (!sites || sites.length === 0) {
            sitesListEl.innerHTML = '<li style="padding: 10px;">Keine Stätten gefunden. Bitte legen Sie eine neue Stätte an.</li>';
            return;
        }

        sites.forEach(site => {
            const isActive = site.id === activeSite?.id;
            const li = document.createElement('li');
            li.style.padding = '12px';
            li.style.border = '1px solid var(--border)';
            li.style.borderRadius = 'var(--radius-md)';
            li.style.marginBottom = '8px';
            li.style.display = 'flex';
            li.style.gap = '16px';
            li.style.alignItems = 'center';
            if (isActive) {
                li.style.borderColor = 'var(--accent)';
                li.style.background = 'rgba(59, 130, 246, 0.05)';
            }
            
            const siteInfo = `
                <span>
                    <strong>${site.name}</strong> ${isActive ? '(Aktiv)' : ''}<br>
                    <small class="text-muted">ID: ${site.id}</small>
                </span>
            `;

            const mapImagePreview = site.mapImageUrl 
                ? `<img src="${site.mapImageUrl}" alt="Kartenbild" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);">`
                : `<div style="width: 80px; height: 80px; background-color: var(--card-darker); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: var(--muted); text-align: center;">Kein Bild</div>`;

            li.innerHTML = `
                ${mapImagePreview}
                <div style="flex-grow: 1;">${siteInfo}</div>
                <button class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}" data-site-id="${site.id}" ${isActive ? 'disabled' : ''}>
                    ${isActive ? 'Aktiv' : 'Aktivieren'}
                </button>
            `;

            sitesListEl.appendChild(li);
        });
    }

    function showAlert(message, type = 'success') {
        if (!alertEl) return;
        alertEl.textContent = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.hidden = false;
        setTimeout(() => {
            alertEl.hidden = true;
        }, 4000);
    }

    // --- Event Listeners ---
    if (sitesListEl) {
        sitesListEl.addEventListener('click', async (e) => { // Made async
            if (e.target.matches('button[data-site-id]')) {
                const siteId = e.target.dataset.siteId;
                await db.setActiveSite(siteId); // Await setActiveSite
                const activeSite = await db.getActiveSite(); // Await getActiveSite
                showAlert(`"${activeSite.name}" ist jetzt die aktive Ausgrabungsstätte.`);
                await renderSites(); // Await renderSites
            }
        });
    }

    if (createSiteForm) {
        createSiteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const siteName = document.getElementById('siteName').value;
            const siteMapImageFile = siteMapImageInput.files[0];

            if (!siteName) {
                showAlert('Bitte geben Sie einen Namen für die Stätte an.', 'danger');
                return;
            }
            
            const uid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
            const siteId = `site-${Date.now()}`;
            let mapImageUrl = null;
            if (siteMapImageFile) {
                const imagePath = `users/${uid}/sites/${siteId}/map-${siteMapImageFile.name}`;
                mapImageUrl = await uploadFileToFirebase(siteMapImageFile, imagePath);
            }

            const newSite = {
                id: siteId,
                name: siteName,
                mapImageUrl: mapImageUrl,
            };

            await db.addSite(newSite); // Await addSite
            await db.setActiveSite(newSite.id); // Await setActiveSite

            showAlert(`Neue Stätte "${siteName}" erfolgreich angelegt und aktiviert.`);
            createSiteForm.reset();
            await renderSites(); // Await renderSites
        });
    }

    if (updateMapImageBtn) {
        updateMapImageBtn.addEventListener('click', async () => { // Made async
            const activeSite = await db.getActiveSite(); // Await getActiveSite
            if (!activeSite) {
                showAlert('Bitte wählen Sie zuerst eine aktive Stätte aus oder erstellen Sie eine neue.', 'danger');
                return;
            }

            const siteMapImageFile = siteMapImageInput.files[0];
            if (!siteMapImageFile) {
                showAlert('Bitte wählen Sie ein Kartenbild zum Hochladen aus.', 'danger');
                return;
            }

            const uid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
            const imagePath = `users/${uid}/sites/${activeSite.id}/map-${siteMapImageFile.name}`;
            const mapImageUrl = await uploadFileToFirebase(siteMapImageFile, imagePath);
            
            await db.updateSite(activeSite.id, 'mapImageUrl', mapImageUrl); // Await updateSite
            showAlert(`Kartenbild für "${activeSite.name}" erfolgreicht aktualisiert.`);
            siteMapImageInput.value = ''; // Clear file input
            await renderSites(); // Await renderSites
        });
    }

    // Initial render
    await renderSites(); // Await initial render
});

// ====================
// js/seed-data.js
// ====================
// Base64 image placeholder for map and finds (small, generic image)
const BASE64_PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// For seed data functionality
document.addEventListener('DOMContentLoaded', () => {
    const seedDataBtn = document.getElementById('seedDataBtn');
    const alertEl = document.getElementById('alert');

    function showAlert(message, type = 'success') {
        if (!alertEl) return;
        alertEl.innerHTML = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.hidden = false;
        setTimeout(() => {
            alertEl.hidden = true;
        }, 5000);
    }

    async function seedData() {
        if (!auth.currentUser) {
            showAlert('Sie müssen angemeldet sein, um Beispieldaten hinzuzufügen.', 'danger');
            return;
        }

        showAlert('Beispieldaten werden erstellt...', 'info');

        try {
            // --- 1. Create Example Sites ---
            const exampleSites = [
                { id: `site-${Date.now()}-1`, name: 'Villa Rustica am Weinberg' },
                { id: `site-${Date.now()}-2`, name: 'Römisches Kastell Saalburg' },
                { id: `site-${Date.now()}-3`, name: 'Mittelalterliche Burganlage' },
            ];

            const uploadedMapUrls = {};

            for (const site of exampleSites) {
                // Upload a placeholder map image to Storage
                const mapImagePath = `users/${auth.currentUser.uid}/sites/${site.id}/map-placeholder.png`;
                const storageRef = ref(storage, mapImagePath);
                await uploadString(storageRef, BASE64_PLACEHOLDER_IMAGE, 'data_url');
                const mapImageUrl = await getDownloadURL(storageRef);
                
                const newSite = {
                    id: site.id,
                    name: site.name,
                    mapImageUrl: mapImageUrl,
                };
                await db.addSite(newSite);
                uploadedMapUrls[site.id] = mapImageUrl; // Store for finds
            }

            // Set the first site as active
            await db.setActiveSite(exampleSites[0].id);

            // --- 2. Create Example Finds for each Site ---
            const findTemplates = [
                {
                    titel: "Keramikscherbe", beschreibung: "Fragment einer römischen Terra Sigillata Schale.",
                    material: "Keramik", datierung: "1. - 2. Jh. n. Chr.", funddatum: "2024-05-10",
                    kategorie: "gefaesse", privacy: "public",
                    latitude: 100, longitude: 100
                },
                {
                    titel: "Bronzefibel", beschreibung: "Gut erhaltene Bronzefibel, Typ Aucissa.",
                    material: "Bronze", datierung: "1. Jh. v. Chr.", funddatum: "2024-05-12",
                    kategorie: "werkzeuge", privacy: "private",
                    latitude: 105, longitude: 202
                },
                {
                    titel: "Feuersteinabschlag", beschreibung: "Unretouchierter Feuersteinabschlag.",
                    material: "Feuerstein", datierung: "4000 - 3000 v. Chr.", funddatum: "2024-05-11",
                    kategorie: "werkzeuge", privacy: "public",
                    latitude: 98, longitude: 199
                },
            ];

            for (const site of exampleSites) {
                await db.setActiveSite(site.id); // Set active site to add finds
                let findCounter = 0;
                for (const template of findTemplates) {
                    const fundId = `FUND-${site.id.substring(site.id.length - 4)}-${++findCounter}`;
                    const newFind = {
                        ...template,
                        id: fundId,
                        photoUrl: uploadedMapUrls[site.id], // Use site map as find photo for now
                        siteId: site.id,
                        zoneLabel: `Zone ${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 1}`
                    };
                    await db.addFind(newFind);
                }
            }

            // --- 3. Create Example Zones for the first Site ---
            await db.setActiveSite(exampleSites[0].id); // Ensure first site is active for zones
            const exampleZones = [
                { id: 'zone-1-1', label: 'Zone A1', x: 50, y: 50, width: 50, height: 50 },
                { id: 'zone-1-2', label: 'Zone A2', x: 100, y: 50, width: 50, height: 50 },
            ];
            await db.saveZones(exampleZones);

            showAlert('Beispieldaten erfolgreich hinzugefügt und erste Stätte aktiviert!', 'success');

        } catch (error) {
            console.error("Fehler beim Erstellen der Beispieldaten:", error);
            showAlert(`Fehler beim Erstellen der Beispieldaten: ${error.message}`, 'danger');
        }
    }

    if (seedDataBtn) {
        seedDataBtn.addEventListener('click', seedData);
    }
});

console.log('main.js loaded successfully');