// middleware/authFirebase.js (ESM)
import admin from '../firebase/admin.js';

export default async function authFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const decoded = await admin.auth().verifyIdToken(token); // { uid, email, ... }

    // Attach only what controllers/routes need
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      claims: decoded, // contains custom claims if you set them
    };

    next();
  } catch (e) {
    console.error('authFirebase error:', e.message);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}