// moolah-backend/firebase/admin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceAccountPath = resolve(process.cwd(), 'secrets', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: '<your-project-id>.appspot.com',         // if using Storage
  });
}

export default admin;