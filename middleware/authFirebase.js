// middleware/authFirebase.js
const admin = require('../firebase/admin');

async function authFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

    const decoded = await admin.auth().verifyIdToken(token); // { uid, email, ... }
    // Attach ONLY what controllers need
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      claims: decoded
    };
    next();
  } catch (e) {
    console.error('authFirebase error:', e.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authFirebase;