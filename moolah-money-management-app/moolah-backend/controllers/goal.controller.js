// controllers/goal.controller.js
import { pool } from '../config/database.js';

function validateGoal(body, { partial = false } = {}) {
  const errors = [];
  if (!partial) {
    if (!body.title) errors.push('title is required');
    if (body.targetAmount === undefined || body.targetAmount === null) errors.push('targetAmount is required');
  }
  const isNum = (v) => (v === undefined || v === null) ? true : Number.isFinite(Number(v));
  if (body.title !== undefined && typeof body.title !== 'string') errors.push('title must be a string');
  if (!isNum(body.targetAmount)) errors.push('targetAmount must be a number');
  if (!isNum(body.currentAmount)) errors.push('currentAmount must be a number');
  if (body.currency !== undefined && typeof body.currency !== 'string') errors.push('currency must be a string');
  if (body.status !== undefined && !['active', 'completed', 'archived'].includes(body.status)) {
    errors.push('status must be one of: active, completed, archived');
  }
  return errors;
}
function computeStatus({ currentAmount, targetAmount, status }) {
  if (status === 'archived') return 'archived';
  const t = Number(targetAmount);
  const c = Number(currentAmount);
  if (Number.isFinite(t) && t > 0 && Number.isFinite(c) && c >= t) return 'completed';
  return status ?? 'active';
}
function isISODate(v) {
  return v == null || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));
}

export const list = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const {
      status, categoryId, dueBefore, dueAfter, orderBy = 'created_at', sort = 'desc', limit = 50,
    } = req.query;

    const allowedOrder = ['due_date', 'created_at'];
    const ob = allowedOrder.includes(orderBy) ? orderBy : 'created_at';
    const srt = String(sort).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const lim = Math.min(parseInt(limit, 10) || 50, 200);

    if (!isISODate(dueAfter) || !isISODate(dueBefore)) {
      return res.status(400).json({ success: false, error: 'Dates must be YYYY-MM-DD if provided' });
    }

    const clauses = ['user_uid = ?']; const params = [uid];
    if (status) { clauses.push('status = ?'); params.push(status); }
    if (categoryId) { clauses.push('category_id = ?'); params.push(Number(categoryId)); }
    if (dueAfter) { clauses.push('due_date >= ?'); params.push(dueAfter); }
    if (dueBefore) { clauses.push('due_date <= ?'); params.push(dueBefore); }

    const [rows] = await pool.execute(
      `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
              current_amount AS currentAmount, currency, category_id AS categoryId,
              notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
         FROM goals
        WHERE ${clauses.join(' AND ')}
        ORDER BY ${ob} ${srt}
        LIMIT ?`,
      [...params, lim]
    );

    // progress (client-friendly)
    rows.forEach(r => {
      if (r.targetAmount > 0 && r.currentAmount != null) {
        r.progress = Math.max(0, Math.min(100, Math.round((Number(r.currentAmount) / Number(r.targetAmount)) * 100)));
      } else {
        r.progress = null;
      }
    });

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('goals.list error', err);
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
      `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
              current_amount AS currentAmount, currency, category_id AS categoryId,
              notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
         FROM goals WHERE goal_id = ? AND user_uid = ?`,
      [id, uid]
    );

    if (!rows[0]) return res.status(404).json({ success: false, error: 'Goal not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('goals.getById error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const errors = validateGoal(req.body, { partial: false });
    if (errors.length) return res.status(400).json({ success: false, error: 'Validation failed', details: errors });

    const {
      title, targetAmount, currentAmount = 0, currency = 'EUR',
      dueDate = null, categoryId = null, notes = null, status,
    } = req.body;

    if (!isISODate(dueDate)) {
      return res.status(400).json({ success: false, error: 'dueDate must be YYYY-MM-DD or null' });
    }

    const finalStatus = computeStatus({ currentAmount, targetAmount, status });

    const [result] = await pool.execute(
      `INSERT INTO goals
       (user_uid, title, target_amount, current_amount, currency, category_id, notes, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, String(title).trim(), Number(targetAmount), Number(currentAmount),
       currency, categoryId ? Number(categoryId) : null, notes, finalStatus, dueDate]
    );

    const [rows] = await pool.execute(
      `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
              current_amount AS currentAmount, currency, category_id AS categoryId,
              notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
         FROM goals WHERE goal_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('goals.create error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

    const errors = validateGoal(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ success: false, error: 'Validation failed', details: errors });

    // ensure ownership
    const [exists] = await pool.execute(
      'SELECT * FROM goals WHERE goal_id = ? AND user_uid = ?',
      [id, uid]
    );
    if (!exists[0]) return res.status(404).json({ success: false, error: 'Goal not found' });

    const fields = []; const params = [];
    const set = (col, val) => { fields.push(`${col} = ?`); params.push(val); };

    let merged = { ...exists[0] }; // base for status recompute

    if (req.body.title !== undefined) { const v = String(req.body.title).trim(); set('title', v); merged.title = v; }
    if (req.body.targetAmount !== undefined) { const v = Number(req.body.targetAmount); set('target_amount', v); merged.target_amount = v; }
    if (req.body.currentAmount !== undefined) { const v = Number(req.body.currentAmount); set('current_amount', v); merged.current_amount = v; }
    if (req.body.currency !== undefined) { set('currency', req.body.currency); merged.currency = req.body.currency; }
    if (req.body.categoryId !== undefined) {
      const v = req.body.categoryId ? Number(req.body.categoryId) : null; set('category_id', v); merged.category_id = v;
    }
    if (req.body.notes !== undefined) { set('notes', req.body.notes ?? null); merged.notes = req.body.notes ?? null; }
    if (req.body.dueDate !== undefined) {
      if (!isISODate(req.body.dueDate)) return res.status(400).json({ success: false, error: 'dueDate must be YYYY-MM-DD or null' });
      set('due_date', req.body.dueDate ?? null);
      merged.due_date = req.body.dueDate ?? null;
    }

    const recomputeStatus = computeStatus({
      currentAmount: req.body.currentAmount !== undefined ? req.body.currentAmount : merged.current_amount,
      targetAmount: req.body.targetAmount !== undefined ? req.body.target_amount : merged.target_amount,
      status: req.body.status !== undefined ? req.body.status : exists[0].status,
    });
    set('status', recomputeStatus);

    if (!fields.length) {
      const [rows] = await pool.execute(
        `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
                current_amount AS currentAmount, currency, category_id AS categoryId,
                notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
           FROM goals WHERE goal_id = ?`,
        [id]
      );
      return res.json({ success: true, data: rows[0] });
    }

    await pool.execute(
      `UPDATE goals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ? AND user_uid = ?`,
      [...params, id, uid]
    );

    const [rows] = await pool.execute(
      `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
              current_amount AS currentAmount, currency, category_id AS categoryId,
              notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
         FROM goals WHERE goal_id = ?`,
      [id]
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('goals.update error', err);
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
      'DELETE FROM goals WHERE goal_id = ? AND user_uid = ?',
      [id, uid]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Goal not found' });

    return res.status(204).send();
  } catch (err) {
    console.error('goals.remove error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};