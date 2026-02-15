// controllers/transaction.controller.js
import { pool } from '../config/database.js';

// Helpers
function getPaging(qs, { defaultLimit = 20, maxLimit = 200 } = {}) {
  const limit = Math.min(Math.max(parseInt(qs.limit ?? defaultLimit, 10) || defaultLimit, 1), maxLimit);
  const page = Math.max(parseInt(qs.page ?? '1', 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
function isISODate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export const list = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { type, category_id, start_date, end_date, search } = req.query;
    const { page, limit, offset } = getPaging(req.query);

    const where = ['t.user_uid = ?'];
    const params = [uid];

    if (type && ['income', 'expense'].includes(type)) {
      where.push('t.type = ?'); params.push(type);
    }
    if (category_id) { where.push('t.category_id = ?'); params.push(Number(category_id)); }
    if (start_date) {
      if (!isISODate(start_date)) return res.status(400).json({ success: false, error: 'start_date must be YYYY-MM-DD' });
      where.push('t.date >= ?'); params.push(start_date);
    }
    if (end_date) {
      if (!isISODate(end_date)) return res.status(400).json({ success: false, error: 'end_date must be YYYY-MM-DD' });
      where.push('t.date <= ?'); params.push(end_date);
    }
    if (search) { where.push('t.description LIKE ?'); params.push(`%${search}%`); }

    const sql = `
      SELECT t.transaction_id, t.user_uid, t.category_id, c.name AS category_name,
             t.amount, t.description, t.type, t.date, t.created_at
        FROM transactions t
        JOIN categories c ON c.category_id = t.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY t.date DESC, t.transaction_id DESC
       LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM transactions t WHERE ${where.join(' AND ')}`;

    const [rows] = await pool.execute(sql, [...params, limit, offset]);
    const [cnt] = await pool.execute(countSql, params);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: cnt[0].total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(cnt[0].total / limit)),
      },
    });
  } catch (err) {
    console.error('transactions.list error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const uid = req?.user?.uid;
    if (!uid) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { category_id, amount, description = '', type, date } = req.body;

    if (!category_id || amount == null || !type || !date) {
      return res.status(400).json({ success: false, error: 'category_id, amount, type and date are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type must be income or expense' });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be a positive number' });
    }
    if (!isISODate(date)) {
      return res.status(400).json({ success: false, error: 'date must be YYYY-MM-DD' });
    }

    // Ensure category exists for this user and matches type
    const [catRows] = await pool.execute(
      'SELECT type AS category_type FROM categories WHERE category_id = ? AND user_uid = ?',
      [Number(category_id), uid]
    );
    if (!catRows[0]) {
      return res.status(400).json({ success: false, error: 'Invalid category_id' });
    }
    if (catRows[0].category_type !== type) {
      return res.status(400).json({
        success: false,
        error: `Category type (${catRows[0].category_type}) does not match transaction type (${type})`,
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO transactions (user_uid, category_id, amount, description, type, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid, Number(category_id), amt, description, type, date]
    );

    return res.status(201).json({
      success: true,
      data: {
        transaction_id: result.insertId,
        user_uid: uid,
        category_id: Number(category_id),
        amount: amt,
        description,
        type,
        date,
      },
    });
  } catch (err) {
    console.error('transactions.create error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};