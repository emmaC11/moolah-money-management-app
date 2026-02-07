// controllers/budget.controller.js (MySQL)
const pool = require('../config/database');

function validate(body, { partial = false } = {}) {
  const errors = [];
  if (!partial) {
    if (!body.name) errors.push('name is required');
    if (body.amount === undefined || body.amount === null) errors.push('amount is required');
  }
  if (body.name !== undefined && typeof body.name !== 'string') errors.push('name must be a string');
  if (body.amount !== undefined && Number.isNaN(Number(body.amount))) errors.push('amount must be a number');
  if (body.currency !== undefined && typeof body.currency !== 'string') errors.push('currency must be a string');
  return errors;
}

exports.list = async (req, res) => {
  const { uid } = req.user || {};
  if (!uid) return res.status(401).json({ error: 'Unauthenticated' });

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const [rows] = await pool.execute(
    `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
            period_start AS periodStart, period_end AS periodEnd,
            created_at AS createdAt, updated_at AS updatedAt
       FROM budgets
      WHERE user_uid = ?
      ORDER BY created_at DESC
      LIMIT ?`,
    [uid, limit]
  );
  res.json(rows);
};

exports.getById = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const [rows] = await pool.execute(
    `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
            period_start AS periodStart, period_end AS periodEnd,
            created_at AS createdAt, updated_at AS updatedAt
       FROM budgets WHERE budget_id = ? AND user_uid = ?`,
    [Number(id), uid]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Budget not found' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const { uid } = req.user || {};
  const errors = validate(req.body, { partial: false });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const { name, amount, currency = 'EUR', periodStart = null, periodEnd = null } = req.body;
  const [result] = await pool.execute(
    `INSERT INTO budgets (user_uid, name, amount, currency, period_start, period_end)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uid, String(name).trim(), Number(amount), currency, periodStart, periodEnd]
  );

  const [rows] = await pool.execute(
    `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
            period_start AS periodStart, period_end AS periodEnd,
            created_at AS createdAt, updated_at AS updatedAt
       FROM budgets WHERE budget_id = ?`,
    [result.insertId]
  );
  res.status(201).json(rows[0]);
};

exports.update = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const errors = validate(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  // Ensure ownership
  const [exist] = await pool.execute(`SELECT budget_id FROM budgets WHERE budget_id = ? AND user_uid = ?`, [Number(id), uid]);
  if (!exist[0]) return res.status(404).json({ error: 'Budget not found' });

  // Build dynamic update
  const fields = [];
  const params = [];
  if (req.body.name !== undefined) { fields.push('name = ?'); params.push(String(req.body.name).trim()); }
  if (req.body.amount !== undefined) { fields.push('amount = ?'); params.push(Number(req.body.amount)); }
  if (req.body.currency !== undefined) { fields.push('currency = ?'); params.push(req.body.currency); }
  if (req.body.periodStart !== undefined) { fields.push('period_start = ?'); params.push(req.body.periodStart || null); }
  if (req.body.periodEnd !== undefined) { fields.push('period_end = ?'); params.push(req.body.periodEnd || null); }

  if (fields.length) {
    await pool.execute(`UPDATE budgets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE budget_id = ? AND user_uid = ?`,
      [...params, Number(id), uid]);
  }

  const [rows] = await pool.execute(
    `SELECT budget_id AS id, user_uid AS userId, name, amount, currency,
            period_start AS periodStart, period_end AS periodEnd,
            created_at AS createdAt, updated_at AS updatedAt
       FROM budgets WHERE budget_id = ?`,
    [Number(id)]
  );
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const [result] = await pool.execute(
    `DELETE FROM budgets WHERE budget_id = ? AND user_uid = ?`,
    [Number(id), uid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Budget not found' });
  res.status(204).send();
};