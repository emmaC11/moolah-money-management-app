// controllers/user.controller.js (MySQL + Firebase Auth for identity only)
const pool = require('../config/database');
const admin = require('../firebase/admin'); // still needed to read/update Auth (displayName/disabled)

function isAdmin(req) {
  const u = req.user || {};
  return u.admin === true || u.role === 'admin' || (Array.isArray(u.roles) && u.roles.includes('admin')) || u.claims?.admin === true;
}

function pickSelf(body) {
  const out = {};
  if (body.displayName !== undefined) out.display_name = String(body.displayName).trim();
  if (body.photoURL !== undefined) out.photo_url = body.photoURL || null;
  if (body.locale !== undefined) out.locale = String(body.locale).trim();
  if (body.timezone !== undefined) out.timezone = String(body.timezone).trim();
  if (body.currency !== undefined) out.currency = String(body.currency).trim();
  return out;
}

exports.me = async (req, res) => {
  const { uid } = req.user || {};
  if (!uid) return res.status(401).json({ error: 'Unauthenticated' });

  const [[row]] = await pool.execute(
    `SELECT user_uid AS id, display_name AS displayName, email, photo_url AS photoURL,
            locale, timezone, currency, roles, status,
            created_at AS createdAt, updated_at AS updatedAt
       FROM users WHERE user_uid = ?`,
    [uid]
  );

  // Try to enrich from Auth (best-effort)
  let authUser = null;
  try { authUser = await admin.auth().getUser(uid); } catch (_) {}

  if (!row && !authUser) return res.status(404).json({ error: 'User not found' });

  const merged = {
    id: uid,
    displayName: row?.displayName ?? authUser?.displayName ?? null,
    email: row?.email ?? authUser?.email ?? null,
    photoURL: row?.photoURL ?? authUser?.photoURL ?? null,
    locale: row?.locale ?? null,
    timezone: row?.timezone ?? null,
    currency: row?.currency ?? 'EUR',
    roles: row?.roles ? JSON.parse(row.roles) : [],
    status: row?.status ?? (authUser?.disabled ? 'disabled' : 'active'),
    createdAt: row?.createdAt ?? null,
    updatedAt: row?.updatedAt ?? null
  };

  res.json(merged);
};

exports.upsertMe = async (req, res) => {
  const { uid, email } = req.user || {};
  if (!uid) return res.status(401).json({ error: 'Unauthenticated' });

  const base = pickSelf(req.body);
  // Always refresh email from token if present
  if (email) base.email = email;

  // Upsert
  await pool.execute(
    `INSERT INTO users (user_uid, display_name, email, photo_url, locale, timezone, currency)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       display_name = VALUES(display_name),
       email        = VALUES(email),
       photo_url    = VALUES(photo_url),
       locale       = VALUES(locale),
       timezone     = VALUES(timezone),
       currency     = VALUES(currency),
       updated_at   = CURRENT_TIMESTAMP`,
    [
      uid,
      base.display_name || null,
      base.email || null,
      base.photo_url || null,
      base.locale || null,
      base.timezone || null,
      base.currency || 'EUR'
    ]
  );

  // Best-effort sync to Auth profile
  try {
    await admin.auth().updateUser(uid, {
      displayName: base.display_name || undefined,
      photoURL: base.photo_url || undefined
    });
  } catch (_) {}

  return exports.me(req, res);
};

exports.updateMe = async (req, res) => {
  const { uid } = req.user || {};
  if (!uid) return res.status(401).json({ error: 'Unauthenticated' });

  const updates = pickSelf(req.body);
  const assignments = Object.keys(updates).map(k => `${k} = ?`);
  if (assignments.length) {
    await pool.execute(
      `UPDATE users SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`,
      [...Object.values(updates), uid]
    );
    // sync to Auth
    try {
      await admin.auth().updateUser(uid, {
        displayName: updates.display_name || undefined,
        photoURL: updates.photo_url || undefined
      });
    } catch (_) {}
  }

  return exports.me(req, res);
};

exports.getById = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { uid } = req.params;

  const [[row]] = await pool.execute(
    `SELECT user_uid AS id, display_name AS displayName, email, photo_url AS photoURL,
            locale, timezone, currency, roles, status,
            created_at AS createdAt, updated_at AS updatedAt
       FROM users WHERE user_uid = ?`,
    [uid]
  );
  let authUser = null; try { authUser = await admin.auth().getUser(uid); } catch (_) {}
  if (!row && !authUser) return res.status(404).json({ error: 'User not found' });

  res.json({
    id: uid,
    displayName: row?.displayName ?? authUser?.displayName ?? null,
    email: row?.email ?? authUser?.email ?? null,
    photoURL: row?.photoURL ?? authUser?.photoURL ?? null,
    locale: row?.locale ?? null,
    timezone: row?.timezone ?? null,
    currency: row?.currency ?? 'EUR',
    roles: row?.roles ? JSON.parse(row.roles) : [],
    status: row?.status ?? (authUser?.disabled ? 'disabled' : 'active'),
    createdAt: row?.createdAt ?? null,
    updatedAt: row?.updatedAt ?? null
  });
};

exports.updateById = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { uid } = req.params;

  const allowed = pickSelf(req.body);
  // Admin-managed fields
  if (req.body.roles !== undefined) {
    if (!Array.isArray(req.body.roles)) return res.status(400).json({ error: 'roles must be an array' });
    allowed.roles = JSON.stringify(req.body.roles);
  }
  if (req.body.status !== undefined) {
    if (!['active','disabled','deleted'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    allowed.status = req.body.status;
  }

  const assignments = Object.keys(allowed).map(k => `${k} = ?`);
  if (assignments.length) {
    await pool.execute(
      `UPDATE users SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`,
      [...Object.values(allowed), uid]
    );
    // sync disabled flag to Auth if status provided
    if (allowed.status !== undefined) {
      try { await admin.auth().updateUser(uid, { disabled: allowed.status !== 'active' }); } catch (_) {}
    }
    if (allowed.display_name !== undefined || allowed.photo_url !== undefined) {
      try {
        await admin.auth().updateUser(uid, {
          displayName: allowed.display_name || undefined,
          photoURL: allowed.photo_url || undefined
        });
      } catch (_) {}
    }
  }
  return exports.getById(req, res);
};

exports.removeById = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { uid } = req.params;
  const hard = String(req.query.hard || '').toLowerCase() === 'true';

  if (hard) {
    try { await admin.auth().deleteUser(uid); } catch (_) {}
    await pool.execute(`DELETE FROM users WHERE user_uid = ?`, [uid]);
    return res.status(204).send();
  }

  await pool.execute(`UPDATE users SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`, [uid]);
  try { await admin.auth().updateUser(uid, { disabled: true }); } catch (_) {}
  return res.status(204).send();
};