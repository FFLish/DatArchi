/**
 * Admin Script - Transfer Projects from One User to Another
 * This script creates a new user and transfers projects from an old user
 */

import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Transfer projects from old user to existing user
 */
async function transferProjectsToExistingUser(oldUserId, newUserId) {
    try {
        console.log('🔄 Starting project transfer to existing user...');
        console.log(`Old User ID: ${oldUserId}`);
        console.log(`New User ID: ${newUserId}`);
        
        // Get the new user's data from Firestore to get email and name
        const newUserDoc = await getDoc(doc(db, 'users', newUserId));
        const newUserData = newUserDoc.data() || {};
        const newUserEmail = newUserData.email || 'unknown@datarchi.com';
        const newUserName = newUserData.displayName || 'Demo User';
        
        console.log(`✅ New user found: ${newUserName} (${newUserEmail})`);
        
        // Get all projects from old user
        console.log('\n🔍 Finding projects from old user...');
        const projectsRef = collection(db, 'projects');
        
        // Query by userId field
        const q1 = query(projectsRef, where('userId', '==', oldUserId));
        const querySnapshot1 = await getDocs(q1);
        
        // Also query by owner field as fallback
        const q2 = query(projectsRef, where('owner', '==', oldUserId));
        const querySnapshot2 = await getDocs(q2);
        
        const projectIds = new Set();
        querySnapshot1.forEach(doc => projectIds.add(doc.id));
        querySnapshot2.forEach(doc => projectIds.add(doc.id));
        
        console.log(`✅ Found ${projectIds.size} project(s) to transfer`);
        
        // Transfer projects
        console.log('\n📦 Transferring projects to new user...');
        let transferredCount = 0;
        
        for (const projectId of projectIds) {
            try {
                const projectRef = doc(db, 'projects', projectId);
                await updateDoc(projectRef, {
                    userId: newUserId,
                    owner: newUserId,
                    ownerEmail: newUserEmail,
                    ownerName: newUserName,
                    updatedAt: serverTimestamp()
                });
                transferredCount++;
                console.log(`  ✅ Transferred project: ${projectId}`);
            } catch (error) {
                console.error(`  ❌ Error transferring project ${projectId}:`, error);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ PROJECT TRANSFER COMPLETED SUCCESSFULLY');
        console.log('='.repeat(50));
        console.log(`New User ID: ${newUserId}`);
        console.log(`Email: ${newUserEmail}`);
        console.log(`Display Name: ${newUserName}`);
        console.log(`Projects Transferred: ${transferredCount}`);
        console.log('='.repeat(50));
        
        return {
            success: true,
            newUserId: newUserId,
            email: newUserEmail,
            projectsTransferred: transferredCount,
            message: `Successfully transferred ${transferredCount} project(s) to ${newUserEmail}`
        };
        
    } catch (error) {
        console.error('❌ Error during project transfer:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create a new user and transfer projects from old user to new user
 */
async function transferProjectsToNewUser(oldUserId, email, password, displayName = 'Demo User') {
    try {
        console.log('🔄 Starting project transfer process...');
        console.log(`Old User ID: ${oldUserId}`);
        console.log(`New User Email: ${email}`);
        
        // Step 1: Create new user or use existing
        console.log('\n📝 Step 1: Creating new user account or using existing...');
        let newUser;
        let newUserId;
        let isNewUser = false;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            newUser = userCredential.user;
            newUserId = newUser.uid;
            isNewUser = true;
            console.log(`✅ New user created with ID: ${newUserId}`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`ℹ️  User with email ${email} already exists, proceeding with project transfer...`);
                // For existing users, we need to use the existing user
                // Since we can't get the user object, we'll need to look it up in Firestore
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', email));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    throw new Error(`User with email ${email} exists in Auth but not in Firestore. Admin intervention required.`);
                }
                
                const userDoc = querySnapshot.docs[0];
                newUserId = userDoc.id;
                console.log(`✅ Using existing user with ID: ${newUserId}`);
            } else {
                throw error;
            }
        }
        
        // Step 2: Update profile (only for newly created users)
        console.log('\n👤 Step 2: Updating user profile...');
        if (isNewUser && newUser) {
            await updateProfile(newUser, { displayName: displayName });
            console.log(`✅ Profile updated: ${displayName}`);
        } else {
            console.log(`ℹ️  Skipping profile update for existing user`);
        }
        
        // Step 3: Initialize or update user data in Firestore
        console.log('\n📁 Step 3: Creating or updating user document in Firestore...');
        const userRef = doc(db, 'users', newUserId);
        const userSnapshot = await getDoc(userRef);
        
        if (!userSnapshot.exists()) {
            // Create new user document
            await setDoc(userRef, {
                uid: newUserId,
                email: email,
                displayName: displayName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                photoURL: null,
                bio: '',
                institution: '',
                role: 'researcher'
            });
            console.log(`✅ User document created in Firestore`);
        } else {
            // Update existing user document
            await updateDoc(userRef, {
                updatedAt: serverTimestamp()
            });
            console.log(`✅ User document updated in Firestore`);
        }
        
        // Step 4: Get all projects from old user
        console.log('\n🔍 Step 4: Finding projects from old user...');
        const projectsRef = collection(db, 'projects');
        
        // Query by userId field
        const q1 = query(projectsRef, where('userId', '==', oldUserId));
        const querySnapshot1 = await getDocs(q1);
        
        // Also query by owner field as fallback
        const q2 = query(projectsRef, where('owner', '==', oldUserId));
        const querySnapshot2 = await getDocs(q2);
        
        const projectIds = new Set();
        querySnapshot1.forEach(doc => projectIds.add(doc.id));
        querySnapshot2.forEach(doc => projectIds.add(doc.id));
        
        console.log(`✅ Found ${projectIds.size} project(s) to transfer`);
        
        // Step 5: Transfer projects
        console.log('\n📦 Step 5: Transferring projects to new user...');
        let transferredCount = 0;
        
        for (const projectId of projectIds) {
            try {
                const projectRef = doc(db, 'projects', projectId);
                await updateDoc(projectRef, {
                    userId: newUserId,
                    owner: newUserId,
                    ownerEmail: email,
                    ownerName: displayName,
                    updatedAt: serverTimestamp()
                });
                transferredCount++;
                console.log(`  ✅ Transferred project: ${projectId}`);
            } catch (error) {
                console.error(`  ❌ Error transferring project ${projectId}:`, error);
            }
        }
        
        // Step 6: Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ PROJECT TRANSFER COMPLETED SUCCESSFULLY');
        console.log('='.repeat(50));
        console.log(`New User ID: ${newUserId}`);
        console.log(`Email: ${email}`);
        console.log(`Display Name: ${displayName}`);
        console.log(`Projects Transferred: ${transferredCount}`);
        console.log('='.repeat(50));
        
        // Step 7: Send verification email (only for newly created users)
        console.log('\n📧 Step 7: Sending verification email...');
        if (isNewUser && newUser) {
            try {
                await sendEmailVerification(newUser);
                console.log(`✅ Verification email sent to ${email}`);
            } catch (error) {
                console.warn(`⚠️  Could not send verification email:`, error.message);
            }
        } else {
            console.log(`ℹ️  Skipping verification email for existing user`);
        }
        
        return {
            success: true,
            newUserId: newUserId,
            email: email,
            projectsTransferred: transferredCount,
            message: `Successfully created user ${email} and transferred ${transferredCount} project(s)`
        };
        
    } catch (error) {
        console.error('❌ Error during project transfer:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Auto-transfer projects when demo user already exists
 */
async function autoTransferToExistingDemo() {
    try {
        // Wait for Firebase and auth to be ready
        await new Promise(resolve => {
            const checkFirebase = setInterval(() => {
                if (auth.currentUser && db) {
                    clearInterval(checkFirebase);
                    resolve();
                }
            }, 100);
            // Timeout after 10 seconds
            setTimeout(() => clearInterval(checkFirebase), 10000);
        });

        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('ℹ️ No user logged in, skipping auto-transfer');
            return;
        }

        // Check if this is the demo user
        if (currentUser.email === 'demo@datarchi.com') {
            console.log('🚀 Auto-transferring projects to demo@datarchi.com...');
            const result = await transferProjectsToExistingUser(
                'sGsaBu2P3tVlUZOTBtc5H8e2Zc82',
                currentUser.uid
            );
            
            if (result.success) {
                console.log('✅ AUTO TRANSFER SUCCESS');
                console.log(`📊 Summary: Transferred ${result.projectsTransferred} projects to demo@datarchi.com`);
            }
        }
    } catch (error) {
        console.warn('ℹ️ Auto-transfer to existing demo user skipped:', error.message);
    }
}

/**
 * Auto-execute transfer on page load
 */
async function autoExecuteTransfer() {
    try {
        // Wait for Firebase to be ready
        await new Promise(resolve => {
            const checkFirebase = setInterval(() => {
                if (window.transferProjectsToNewUser) {
                    clearInterval(checkFirebase);
                    resolve();
                }
            }, 100);
            // Timeout after 10 seconds
            setTimeout(() => clearInterval(checkFirebase), 10000);
        });

        // Auto-execute the transfer
        console.log('🚀 Auto-executing project transfer...');
        const result = await transferProjectsToNewUser(
            'sGsaBu2P3tVlUZOTBtc5H8e2Zc82',
            'demo@datarchi.com',
            '123456',
            'Demo User'
        );
        
        if (result.success) {
            console.log('✅ AUTO TRANSFER SUCCESS');
            console.log(`📊 Summary: Created demo@datarchi.com and transferred ${result.projectsTransferred} projects`);
        } else {
            console.warn('⚠️ Auto transfer skipped or failed (might already exist):', result.error);
        }
    } catch (error) {
        console.warn('⚠️ Auto-transfer skipped:', error.message);
    }
}

// Export for use
export { transferProjectsToNewUser, transferProjectsToExistingUser, autoTransferToExistingDemo, autoExecuteTransfer };

// If run directly, execute the transfer (only on home page)
if (typeof window !== 'undefined') {
    window.transferProjectsToNewUser = transferProjectsToNewUser;
    window.transferProjectsToExistingUser = transferProjectsToExistingUser;
    window.autoExecuteTransfer = autoExecuteTransfer;
    window.autoTransferToExistingDemo = autoTransferToExistingDemo;
    console.log('✅ Admin transfer function available as: transferProjectsToNewUser()');
    console.log('Usage: transferProjectsToNewUser("sGsaBu2P3tVlUZOTBtc5H8e2Zc82", "demo@datarchi.com", "123456", "Demo User")');
    
    // Only auto-execute on home/index pages, not on profile pages
    const isProfilePage = window.location.pathname.includes('/profile/') || 
                         window.location.pathname.includes('/pages/profile');
    
    if (!isProfilePage) {
        // Auto-execute is disabled by default for safety. Enable explicitly by setting
        // `window.__allowAdminTransfer = true` in the browser console or only allow on localhost.
        const hostname = (window.location && window.location.hostname) || '';
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
        const allowAuto = Boolean(window.__allowAdminTransfer) || isLocalhost;

        if (!allowAuto) {
            console.warn('⚠️ Auto project transfer is disabled by default. To enable set `window.__allowAdminTransfer = true` (use with caution).');
        } else {
            // Auto-execute on DOM ready (only the new user transfer, not the existing user transfer)
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(autoExecuteTransfer, 500);
                    // Note: autoTransferToExistingDemo requires admin permissions and will fail
                    // Only use it with elevated privileges or from admin console
                });
            } else {
                // Auto-execute immediately if DOM is already ready
                setTimeout(autoExecuteTransfer, 500);
            }
        }
    }
}
