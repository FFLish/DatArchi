// js/auth-guard.js
// ====================
// Protection for private pages - redirects unauthenticated users to login
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

(function() {
    const currentPath = window.location.pathname;

    // Define explicitly public pages (only login page and legal)
    const publicPages = [
        '/',
        '/index.html',
        '/pages/legal/faq.html',
        '/pages/legal/impressum.html',
        '/pages/legal/datenschutz.html',
        '/pages/profile/index.html'  // Profile page handles its own auth with login/register forms
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
        if (pathSegments.length > 0 && pathSegments[0] === 'DatArchi') {
            // Handle /DatArchi/ prefix if present
            for (let i = 0; i < pathSegments.length - 1; i++) {
                relativePath += '../';
            }
        } else {
            // Assume paths like /index.html or /pages/projects/index.html directly from root
            for (let i = 0; i < pathSegments.length - 1; i++) {
                relativePath += '../';
            }
        }
        return relativePath;
    }
    const relativePathToRoot = getRelativePathToRoot();

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in
            // If logged in and on a public page (including index.html), redirect to projects page
            if (isPublicPage) {
                console.log('Auth Guard: User logged in, redirecting from public page to projects page.');
                const relativePathToProjects = relativePathToRoot + 'pages/projects/index.html';
                window.location.href = relativePathToProjects;
            }
            // If logged in and on a private page, do nothing (let it load)
        } else {
            // User is NOT logged in
            // If not logged in and on a private page, redirect to home page
            if (!isPublicPage) {
                console.log('Auth Guard: User not logged in, redirecting from private page to home page.');
                window.location.href = `${relativePathToRoot}index.html`;
            }
            // If not logged in and on a public page, do nothing (let it load)
        }
    });
})();
