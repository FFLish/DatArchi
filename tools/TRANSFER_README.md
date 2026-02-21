Server-side transfer helper (admin)

Why
- Browser/client code is blocked by Firestore security rules for admin-level operations.
- Use this script with a service account to perform the transfer with full privileges.

Setup
1. Install dependencies:

```bash
cd tools
npm init -y
npm install firebase-admin
```

2. Obtain a Firebase service account JSON from your Firebase console (Project Settings → Service accounts → Generate new private key).
3. Place the JSON file in `tools/serviceAccountKey.json` or set environment variable `SERVICE_ACCOUNT_PATH` to its path.

Usage

```bash
# From repo root
node tools/transfer-projects-admin.js <oldUserId> <newUserEmail> [password] [displayName]

# Example:
node tools/transfer-projects-admin.js sGsaBu2P3tVlUZOTBtc5H8e2Zc82 demo@datarchi.com 123456 "Demo User"
```

What it does
- Ensures the target user exists in Firebase Auth (creates if missing)
- Ensures a `users/<uid>` Firestore document exists (creates/updates)
- Transfers any `projects` where `userId == oldUserId` or `owner == oldUserId` to the target user

Notes
- Running this requires a service account with Firestore and Auth privileges.
- Always test on a non-production dataset or backup your data first.