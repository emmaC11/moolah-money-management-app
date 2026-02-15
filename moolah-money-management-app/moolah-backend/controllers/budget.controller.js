// controllers/budget.controller.js
import { pool } from '../config/database.js';

function getPaging(qs, { defaultLimit = 50, maxLimit = 200 } = {}) {
  const limit = Math.min(Math.max(parseInt(qs.limit ?? defaultLimit, 10) || defaultLimit, 1), maxLimit);
  const page = Math.max(parseInt(qs.page ?? '1', 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function isISODate(v) {
  return v == null || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));
}

function validate(body, { partial = false } = {}) {
  const errors = [];

  if (!partial) {
    if (!body.name) errors.push('name is required');
    if (body.amount === undefined || body.amount === null) errors.push('amount is required');
  }

  if (body.name !== undefined && typeof body.name !== 'string') {
    errors.push('name must be a string');
  }

  if (body.amount !== undefined) {
    const n = Number(body.amount);
    if (!Number.isFinite(n)) errors.push('amount must be a finite number');
    if (n < 0) errors.push('amount must be >= 0');
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string') errors.push('currency must be a string');
    if (body.currency.length < 3 || body.currency.length > 10) errors.push('currency must be a valid code');
  }

  if (body.periodStart !== undefined && !isISODate(body.periodStart)) {
    errors.push('periodStart must be YYYY-MM-DD or null');
  }
  if (body.periodEnd !== undefined && !isISODate(body.periodEnd)) {
    errors.push('periodEnd must be YYYY-MM-DD or null');
  }

  return errors;
}

// ---------- Handlers ----------
export const list = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { page, limit, offset } = getPaging(req.query);

    const [rows] = await pool.execute(
      `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
              period_start AS periodStart, period_end AS periodEnd,
              created_at AS createdAt, updated_at AS updatedAt
         FROM budgets
        WHERE user_uid = ?
        ORDER BY created_at DESC, budget_id DESC
        LIMIT ? OFFSET ?`,
      [uid, limit, offset]
    );

    // optional: fetch count for pagination UI
    const [[cnt]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM budgets WHERE user_uid = ?',
      [uid]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: cnt.total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(cnt.total / limit)),
      },
    });
  } catch (err) {
    console.error('budgets.list error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getById = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

    const [rows] = await pool.execute(
      `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
              period_start AS periodStart, period_end AS periodEnd,
              created_at AS createdAt, updated_at AS updatedAt
         FROM budgets
        WHERE budget_id = ? AND user_uid = ?`,
      [id, uid]
    );

    if (!rows[0]) return res.status(404).json({ success: false, error: 'Budget not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('budgets.getById error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const errors = validate(req.body, { partial: false });
    if (errors.length) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
    }

    const name = String(req.body.name).trim();
    const amount = Number(req.body.amount);
    const currency = (req.body.currency ?? 'EUR').trim();
    const periodStart = req.body.periodStart ?? null;
    const periodEnd = req.body.periodEnd ?? null;

    const [result] = await pool.execute(
      `INSERT INTO budgets (user_uid, name, amount, currency, period_start, period_end)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid, name, amount, currency, periodStart, periodEnd]
    );

    const [rows] = await pool.execute(
      `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
              period_start AS periodStart, period_end AS periodEnd,
              created_at AS createdAt, updated_at AS updatedAt
         FROM budgets
        WHERE budget_id = ?`,
      [result.insertId]
    );

    return res
      .status(201)
      .location(`/api/budgets/${result.insertId}`)
      .json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('budgets.create error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

    const errors = validate(req.body, { partial: true });
    if (errors.length) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
    }

    // Ensure ownership exists
    const [exist] = await pool.execute(
      'SELECT budget_id FROM budgets WHERE budget_id = ? AND user_uid = ?',
      [id, uid]
    );
    if (!exist[0]) return res.status(404).json({ success: false, error: 'Budget not found' });

    // Build dynamic update
    const fields = [];
    const params = [];

    if (req.body.name !== undefined) { fields.push('name = ?'); params.push(String(req.body.name).trim()); }
    if (req.body.amount !== undefined) { fields.push('amount = ?'); params.push(Number(req.body.amount)); }
    if (req.body.currency !== undefined) { fields.push('currency = ?'); params.push(String(req.body.currency).trim()); }
    if (req.body.periodStart !== undefined) { fields.push('period_start = ?'); params.push(req.body.periodStart ?? null); }
    if (req.body.periodEnd !== undefined) { fields.push('period_end = ?'); params.push(req.body.periodEnd ?? null); }

    if (!fields.length) {
      // No-op update: return current row
      const [rows] = await pool.execute(
        `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
                period_start AS periodStart, period_end AS periodEnd,
                created_at AS createdAt, updated_at AS updatedAt
           FROM budgets
          WHERE budget_id = ?`,
        [id]
      );
      return res.json({ success: true, data: rows[0] });
    }

    await pool.execute(
      `UPDATE budgets
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE budget_id = ? AND user_uid = ?`,
      [...params, id, uid]
    );

    const [rows] = await pool.execute(
      `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
              period_start AS periodStart, period_end AS periodEnd,
              created_at AS createdAt, updated_at AS updatedAt
         FROM budgets
        WHERE budget_id = ?`,
      [id]
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('budgets.update error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

    const [result] = await pool.execute(
      'DELETE FROM budgets WHERE budget_id = ? AND user_uid = ?',
      [id, uid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('budgets.remove error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};