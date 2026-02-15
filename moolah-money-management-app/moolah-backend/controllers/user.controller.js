// controllers/user.controller.js
import { pool } from '../config/database.js';
import admin from '../firebase/admin.js';

// Adjust to your source of truth for admin checks (e.g., custom claims)
function isAdmin(req) {
  const u = req?.user ?? {};
  return u?.claims?.admin === true || u?.role === 'admin' || (Array.isArray(u?.roles) && u.roles.includes('admin'));
}

function pickSelf(body) {
  const out = {};
  if (body.displayName !== undefined) out.display_name = String(body.displayName).trim();
  if (body.photoURL !== undefined)   out.photo_url   = body.photoURL ?? null;
  if (body.locale !== undefined)     out.locale      = String(body.locale).trim();
  if (body.timezone !== undefined)   out.timezone    = String(body.timezone).trim();
  if (body.currency !== undefined)   out.currency    = String(body.currency).trim();
  return out;
}

export const me = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const [[row]] = await pool.execute(
      `SELECT user_uid AS id, display_name AS displayName, email, photo_url AS photoURL,
              locale, timezone, currency, roles, status,
              created_at AS createdAt, updated_at AS updatedAt
         FROM users WHERE user_uid = ?`,
      [uid]
    );

    // Enrich from Firebase Auth (best-effort)
    let authUser = null;
    try { authUser = await admin.auth().getUser(uid); } catch (_) { /* ignore */ }

    if (!row && !authUser) return res.status(404).json({ success: false, error: 'User not found' });

    let rolesArr = [];
    if (row?.roles) {
      try { rolesArr = JSON.parse(row.roles); } catch { rolesArr = []; }
    }

    const merged = {
      id: uid,
      displayName: row?.displayName ?? authUser?.displayName ?? null,
      email:       row?.email       ?? authUser?.email       ?? null,
      photoURL:    row?.photoURL    ?? authUser?.photoURL    ?? null,
      locale:      row?.locale      ?? null,
      timezone:    row?.timezone    ?? null,
      currency:    row?.currency    ?? 'EUR',
      roles:       rolesArr,
      status:      row?.status ?? (authUser?.disabled ? 'disabled' : 'active'),
      createdAt:   row?.createdAt ?? null,
      updatedAt:   row?.updatedAt ?? null,
    };

    return res.json({ success: true, data: merged });
  } catch (err) {
    console.error('users.me error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const upsertMe = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    const email = req?.user?.email;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const base = pickSelf(req.body);
    if (email) base.email = email; // trust token

    await pool.execute(
      `INSERT INTO users (user_uid, display_name, email, photo_url, locale, timezone, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         display_name = VALUES(display_name),
         email       = VALUES(email),
         photo_url   = VALUES(photo_url),
         locale      = VALUES(locale),
         timezone    = VALUES(timezone),
         currency    = VALUES(currency),
         updated_at  = CURRENT_TIMESTAMP`,
      [
        uid,
        base.display_name ?? null,
        base.email ?? null,
        base.photo_url ?? null,
        base.locale ?? null,
        base.timezone ?? null,
        base.currency ?? 'EUR',
      ]
    );

    // Best-effort sync to Auth profile
    try {
      await admin.auth().updateUser(uid, {
        displayName: base.display_name ?? undefined,
        photoURL:    base.photo_url    ?? undefined,
      });
    } catch (_) { /* ignore */ }

    return me(req, res); // reuse
  } catch (err) {
    console.error('users.upsertMe error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const updates = pickSelf(req.body);
    const assignments = Object.keys(updates).map(k => `${k} = ?`);

    if (assignments.length) {
      await pool.execute(
        `UPDATE users SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`,
        [...Object.values(updates), uid]
      );
      try {
        await admin.auth().updateUser(uid, {
          displayName: updates.display_name ?? undefined,
          photoURL:    updates.photo_url    ?? undefined,
        });
      } catch (_) { /* ignore */ }
    }

    return me(req, res);
  } catch (err) {
    console.error('users.updateMe error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getById = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const uid = req.params.uid;

    const [[row]] = await pool.execute(
      `SELECT user_uid AS id, display_name AS displayName, email, photo_url AS photoURL,
              locale, timezone, currency, roles, status,
              created_at AS createdAt, updated_at AS updatedAt
         FROM users WHERE user_uid = ?`,
      [uid]
    );

    let authUser = null; try { authUser = await admin.auth().getUser(uid); } catch (_) {}

    if (!row && !authUser) return res.status(404).json({ success: false, error: 'User not found' });

    let rolesArr = [];
    if (row?.roles) {
      try { rolesArr = JSON.parse(row.roles); } catch { rolesArr = []; }
    }

    return res.json({
      success: true,
      data: {
        id: uid,
        displayName: row?.displayName ?? authUser?.displayName ?? null,
        email:       row?.email       ?? authUser?.email       ?? null,
        photoURL:    row?.photoURL    ?? authUser?.photoURL    ?? null,
        locale:      row?.locale ?? null,
        timezone:    row?.timezone ?? null,
        currency:    row?.currency ?? 'EUR',
        roles:       rolesArr,
        status:      row?.status ?? (authUser?.disabled ? 'disabled' : 'active'),
        createdAt:   row?.createdAt ?? null,
        updatedAt:   row?.updatedAt ?? null,
      },
    });
  } catch (err) {
    console.error('users.getById error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateById = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const uid = req.params.uid;

    const allowed = pickSelf(req.body);

    if (req.body.roles !== undefined) {
      if (!Array.isArray(req.body.roles)) return res.status(400).json({ success: false, error: 'roles must be an array' });
      allowed.roles = JSON.stringify(req.body.roles);
    }
    if (req.body.status !== undefined) {
      if (!['active', 'disabled', 'deleted'].includes(req.body.status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      allowed.status = req.body.status;
    }

    const assignments = Object.keys(allowed).map(k => `${k} = ?`);
    if (assignments.length) {
      await pool.execute(
        `UPDATE users SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`,
        [...Object.values(allowed), uid]
      );

      // Sync disabled/display/photo to Auth if provided
      if (allowed.status !== undefined) {
        try { await admin.auth().updateUser(uid, { disabled: allowed.status !== 'active' }); } catch (_) {}
      }
      if (allowed.display_name !== undefined || allowed.photo_url !== undefined) {
        try {
          await admin.auth().updateUser(uid, {
            displayName: allowed.display_name ?? undefined,
            photoURL:    allowed.photo_url    ?? undefined,
          });
        } catch (_) {}
      }
    }

    return getById(req, res);
  } catch (err) {
    console.error('users.updateById error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const removeById = async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const uid = req.params.uid;
    const hard = String(req.query.hard ?? '').toLowerCase() === 'true';

    if (hard) {
      // Attempt Auth first, then DB
      try { await admin.auth().deleteUser(uid); } catch (_) { /* ignore (user may not exist) */ }
      await pool.execute('DELETE FROM users WHERE user_uid = ?', [uid]);
      return res.status(204).send();
    }

    await pool.execute(
      `UPDATE users SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE user_uid = ?`,
      [uid]
    );
    try { await admin.auth().updateUser(uid, { disabled: true }); } catch (_) {}

    return res.status(204).send();
  } catch (err) {
    console.error('users.removeById error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};