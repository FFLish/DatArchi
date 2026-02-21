/**
 * Firebase Configuration Module
 * Handles initialization and export of Firebase services
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";
import "./test-user-setup.js";
import "./admin-transfer-projects.js";

// Firebase configuration
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
    console.log('✅ Firebase app initialized');
    
    analytics = getAnalytics(app);
    console.log('✅ Firebase analytics initialized');
    
    auth = getAuth(app);
    console.log('✅ Firebase auth initialized');
    
    db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    storage = getStorage(app);
    console.log('✅ Firebase Storage initialized');
    
    // Set auth persistence
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log('✅ Auth persistence set to local');
            // Demo data disabled for production use
        })
        .catch((error) => {
            console.error('❌ Auth persistence error:', error);
        });
        
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Export Firebase services
export { 
    app, 
    analytics, 
    auth, 
    db, 
    storage, 
    firebaseConfig 
};
