// controllers/goal.controller.js (MySQL)
const pool = require('../config/database');

function validate(body, { partial = false } = {}) {
  const errors = [];
  if (!partial) {
    if (!body.title) errors.push('title is required');
    if (body.targetAmount === undefined || body.targetAmount === null) errors.push('targetAmount is required');
  }
  const isNum = (v) => v === undefined || v === null ? true : !Number.isNaN(Number(v));
  if (body.title !== undefined && typeof body.title !== 'string') errors.push('title must be a string');
  if (!isNum(body.targetAmount)) errors.push('targetAmount must be a number');
  if (!isNum(body.currentAmount)) errors.push('currentAmount must be a number');
  if (body.currency !== undefined && typeof body.currency !== 'string') errors.push('currency must be a string');
  if (body.status !== undefined && !['active','completed','archived'].includes(body.status)) errors.push('status must be one of: active, completed, archived');
  return errors;
}

function computeStatus({ currentAmount, targetAmount, status }) {
  if (status === 'archived') return 'archived';
  const t = Number(targetAmount); const c = Number(currentAmount);
  if (!Number.isNaN(t) && t > 0 && !Number.isNaN(c) && c >= t) return 'completed';
  return status || 'active';
}

exports.list = async (req, res) => {
  const { uid } = req.user || {};
  if (!uid) return res.status(401).json({ error: 'Unauthenticated' });

  const {
    status, categoryId, dueBefore, dueAfter,
    orderBy = 'created_at', sort = 'desc', limit = 50,
  } = req.query;

  const allowedOrder = ['due_date','created_at'];
  const ob = allowedOrder.includes(orderBy) ? orderBy : 'created_at';
  const srt = String(sort).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const lim = Math.min(parseInt(limit, 10) || 50, 200);

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

  // compute progress (not stored)
  rows.forEach(r => {
    if (r.targetAmount > 0 && r.currentAmount !== null && r.currentAmount !== undefined) {
      r.progress = Math.max(0, Math.min(100, Math.round((Number(r.currentAmount)/Number(r.targetAmount))*100)));
    } else {
      r.progress = null;
    }
  });

  res.json(rows);
};

exports.getById = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const [rows] = await pool.execute(
    `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
            current_amount AS currentAmount, currency, category_id AS categoryId,
            notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
       FROM goals WHERE goal_id = ? AND user_uid = ?`,
    [Number(id), uid]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Goal not found' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const { uid } = req.user || {};
  const errors = validate(req.body, { partial: false });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const {
    title, targetAmount, currentAmount = 0, currency = 'EUR',
    dueDate = null, categoryId = null, notes = null, status,
  } = req.body;

  const finalStatus = computeStatus({ currentAmount, targetAmount, status });

  const [result] = await pool.execute(
    `INSERT INTO goals
      (user_uid, title, target_amount, current_amount, currency, category_id, notes, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid, String(title).trim(), Number(targetAmount), Number(currentAmount), currency,
     categoryId ? Number(categoryId) : null, notes, finalStatus, dueDate]
  );

  const [rows] = await pool.execute(
    `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
            current_amount AS currentAmount, currency, category_id AS categoryId,
            notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt
       FROM goals WHERE goal_id = ?`,
    [result.insertId]
  );
  res.status(201).json(rows[0]);
};

exports.update = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const errors = validate(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  // ensure ownership
  const [exists] = await pool.execute(`SELECT * FROM goals WHERE goal_id = ? AND user_uid = ?`, [Number(id), uid]);
  if (!exists[0]) return res.status(404).json({ error: 'Goal not found' });

  const updates = {};
  const fields = []; const params = [];
  const set = (col, val) => { fields.push(`${col} = ?`); params.push(val); };

  const merged = { ...exists[0] }; // base for status recompute
  if (req.body.title !== undefined) { set('title', String(req.body.title).trim()); merged.title = String(req.body.title).trim(); }
  if (req.body.targetAmount !== undefined) { set('target_amount', Number(req.body.targetAmount)); merged.target_amount = Number(req.body.targetAmount); }
  if (req.body.currentAmount !== undefined) { set('current_amount', Number(req.body.currentAmount)); merged.current_amount = Number(req.body.currentAmount); }
  if (req.body.currency !== undefined) { set('currency', req.body.currency); merged.currency = req.body.currency; }
  if (req.body.categoryId !== undefined) { set('category_id', req.body.categoryId ? Number(req.body.categoryId) : null); merged.category_id = req.body.categoryId ? Number(req.body.categoryId) : null; }
  if (req.body.notes !== undefined) { set('notes', req.body.notes || null); merged.notes = req.body.notes || null; }
  if (req.body.dueDate !== undefined) { set('due_date', req.body.dueDate || null); merged.due_date = req.body.dueDate || null; }
  const recomputeStatus = computeStatus({
    currentAmount: req.body.currentAmount !== undefined ? req.body.currentAmount : merged.current_amount,
    targetAmount: req.body.targetAmount !== undefined ? req.body.targetAmount : merged.target_amount,
    status: req.body.status !== undefined ? req.body.status : exists[0].status
  });
  set('status', recomputeStatus);

  if (fields.length) {
    await pool.execute(
      `UPDATE goals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ? AND user_uid = ?`,
      [...params, Number(id), uid]
    );
  }

  const [rows] = await pool.execute(
    `SELECT goal_id AS id, user_uid AS userId, title, target_amount AS targetAmount,
            current_amount AS currentAmount, currency, category_id AS categoryId,
            notes, status, due_date AS dueDate, created_at AS createdAt, updated_at AS UpdatedAt
       FROM goals WHERE goal_id = ?`,
    [Number(id)]
  );
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const [result] = await pool.execute(`DELETE FROM goals WHERE goal_id = ? AND user_uid = ?`, [Number(id), uid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Goal not found' });
  res.status(204).send();
};