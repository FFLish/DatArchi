// js/header/header.js
import { auth } from '../firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Global function for onclick handler
window.handleAuthBtnClick = async function() {
    const user = auth.currentUser;
    
    if (user) {
        // Logout
        try {
            await signOut(auth);
            window.location.href = '/index.html';
        } catch (error) {
            console.error("Firebase Logout Error:", error);
            alert("Error logging out. Please try again.");
        }
    } else {
        // Login
        window.location.href = '/index.html#auth-section';
    }
};

let authBtnListenerAttached = false;

function handleAuthUI(user) {
    const mainNav = document.getElementById('mainNav');
    const authBtn = document.getElementById('authBtn');
    const navToggleLabel = document.getElementById('navToggleLabel');

    if (user) {
        // --- LOGGED-IN STATE ---
        if (mainNav) mainNav.style.display = 'flex';
        if (authBtn) {
            authBtn.textContent = 'Log out';
            authBtn.classList.remove('btn-primary');
            authBtn.classList.add('btn-secondary');
            authBtn.style.display = 'inline-block';
        }
        if (navToggleLabel) navToggleLabel.style.display = 'flex';
    } else {
        // --- LOGGED-OUT STATE ---
        if (mainNav) mainNav.style.display = 'flex';
        if (authBtn) {
            authBtn.textContent = 'Log in';
            authBtn.classList.add('btn-primary');
            authBtn.classList.remove('btn-secondary');
            authBtn.style.display = 'inline-block';
        }
        if (navToggleLabel) navToggleLabel.style.display = 'flex';
    }
}

// Listen for auth state changes
document.addEventListener('headerFooterReady', () => {
    onAuthStateChanged(auth, (user) => {
        handleAuthUI(user);
        // If user logged in, trigger a reload to update UI
        if (user) {
            console.log('User logged in, updating header UI');
            handleAuthUI(user);
        }
    });
});
