
const admin = require('firebase-admin');
// Use GOOGLE_APPLICATION_CREDENTIALS env var or load a service account JSON explicitly.
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
module.exports = admin;