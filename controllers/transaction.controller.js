const pool = require('../config/database');

exports.list = async (req, res) => {
  const { uid } = req.user;                 // <<< use uid
  const {
    type, category_id, start_date, end_date, search,
    page = 1, limit = 20
  } = req.query;

  const clauses = ['t.user_uid = ?'];       // <<< scope by user_uid
  const params = [uid];

  if (type && ['income', 'expense'].includes(type)) { clauses.push('t.type = ?'); params.push(type); }
  if (category_id) { clauses.push('t.category_id = ?'); params.push(Number(category_id)); }
  if (start_date) { clauses.push('t.date >= ?'); params.push(start_date); }
  if (end_date) { clauses.push('t.date <= ?'); params.push(end_date); }
  if (search) { clauses.push('t.description LIKE ?'); params.push(`%${search}%`); }

  const where = clauses.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  const sql = `
    SELECT t.transaction_id, t.user_uid, t.category_id, c.name AS category_name,
           t.amount, t.description, t.type, t.date, t.created_at
    FROM transactions t                                  -- <<< lower-case, match schema
    JOIN categories c ON c.category_id = t.category_id
    WHERE ${where}
    ORDER BY t.date DESC, t.transaction_id DESC
    LIMIT ? OFFSET ?`;

  const countSql = `SELECT COUNT(*) AS total FROM transactions t WHERE ${where}`;

  const [rows] = await pool.execute(sql, [...params, Number(limit), offset]);
  const [cnt] = await pool.execute(countSql, params);

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: cnt[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(cnt[0].total / Number(limit))) // <<< fix stray "1"
    }
  });
};

exports.create = async (req, res) => {
  const { uid } = req.user;                 // <<< use uid
  const { category_id, amount, description = '', type, date } = req.body;

  if (!category_id || !amount || !type || !date)
    return res.status(400).json({ success: false, message: 'Missing required fields' });

  if (!['income','expense'].includes(type))
    return res.status(400).json({ success: false, message: 'Invalid type' });

  if (Number(amount) <= 0)
    return res.status(400).json({ success: false, message: 'Amount must be positive' });

  // Ensure category type matches (and same user)
  const [catRows] = await pool.execute(
    'SELECT type AS category_type FROM categories WHERE category_id = ? AND user_uid = ?',
    [Number(category_id), uid]
  );
  if (!catRows[0]) return res.status(400).json({ success: false, message: 'Invalid category_id' });
  if (catRows[0].category_type !== type)
    return res.status(400).json({ success: false, message: `Category type (${catRows[0].category_type}) does not match transaction type (${type})` });

  const [result] = await pool.execute(`
    INSERT INTO transactions (user_uid, category_id, amount, description, type, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uid, Number(category_id), Number(amount), description, type, date]);

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction_id: result.insertId, user_uid: uid, category_id, amount, description, type, date }
  });
};