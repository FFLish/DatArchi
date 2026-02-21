// Node.js script to transfer projects from one user to another using Firebase Admin SDK
// Usage: set SERVICE_ACCOUNT_PATH or place serviceAccountKey.json next to this file
//        node transfer-projects-admin.js <oldUserId> <newUserEmail> <password?> <displayName?>

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error('Failed to load service account JSON. Set SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in tools/.');
  console.error(err.message);
  process.exit(2);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function transfer(oldUserId, email, password = 'changeme', displayName = 'Demo User') {
  try {
    console.log('Starting server-side transfer...');

    // Ensure target user exists (create if missing)
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`Found existing Auth user: ${userRecord.uid}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || /user-not-found/i.test(err.message)) {
        console.log('Target user not found in Auth, creating...');
        userRecord = await admin.auth().createUser({ email, password, displayName, emailVerified: true });
        console.log(`Created Auth user: ${userRecord.uid}`);
      } else {
        throw err;
      }
    }

    const newUserId = userRecord.uid;

    // Ensure users document exists or create it
    const userRef = db.collection('users').doc(newUserId);
    const userSnap = await userRef.get();
    const now = admin.firestore.FieldValue.serverTimestamp();
    if (!userSnap.exists) {
      await userRef.set({
        uid: newUserId,
        email: email,
        displayName: displayName,
        createdAt: now,
        updatedAt: now,
        role: 'researcher'
      });
      console.log('Created Firestore user document.');
    } else {
      await userRef.update({ updatedAt: now });
      console.log('Updated Firestore user document timestamp.');
    }

    // Collect project IDs where oldUserId is owner or userId
    const projectsRef = db.collection('projects');
    const q1 = await projectsRef.where('userId', '==', oldUserId).get();
    const q2 = await projectsRef.where('owner', '==', oldUserId).get();
    const ids = new Set();
    q1.forEach(d => ids.add(d.id));
    q2.forEach(d => ids.add(d.id));

    console.log(`Found ${ids.size} project(s) to transfer.`);
    if (ids.size === 0) {
      console.log('Nothing to transfer. Exiting.');
      return;
    }

    // Batch updates
    const batch = db.batch();
    let count = 0;
    for (const id of ids) {
      const ref = projectsRef.doc(id);
      batch.update(ref, {
        userId: newUserId,
        owner: newUserId,
        ownerEmail: email,
        ownerName: displayName,
        updatedAt: now
      });
      count++;
    }

    await batch.commit();
    console.log(`Successfully transferred ${count} project(s) to ${email} (${newUserId}).`);
  } catch (err) {
    console.error('Error during transfer:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  const [,, oldUserId, email, password, displayName] = process.argv;
  if (!oldUserId || !email) {
    console.error('Usage: node transfer-projects-admin.js <oldUserId> <newUserEmail> [password] [displayName]');
    process.exit(2);
  }
  transfer(oldUserId, email, password, displayName);
}

module.exports = { transfer };