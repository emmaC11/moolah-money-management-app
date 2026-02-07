// controllers/category.controller.js (MySQL)
const pool = require('../config/database');

function validate(body, { partial = false } = {}) {
  const errs = [];
  if (!partial) {
    if (!body.name) errs.push('name is required');
  }
  if (body.name !== undefined && typeof body.name !== 'string') errs.push('name must be a string');
  if (body.type !== undefined && !['expense','income','transfer'].includes(body.type)) errs.push('type must be expense|income|transfer');
  if (body.colour !== undefined && body.colour !== null && typeof body.colour !== 'string') errs.push('colour must be a string or null');
  if (body.parentId !== undefined && body.parentId !== null && Number.isNaN(Number(body.parentId))) errs.push('parentId must be a number or null');
  if (body.sortOrder !== undefined && Number.isNaN(Number(body.sortOrder))) errs.push('sortOrder must be a number');
  if (body.status !== undefined && !['active','archived'].includes(body.status)) errs.push('status must be active|archived');
  return errs;
}

exports.list = async (req, res) => {
  const { uid } = req.user || {};
  const {
    status = 'active', parentId, topLevel, limit = 200, orderBy = 'sort_order', sort = 'asc'
  } = req.query;

  const ob = ['sort_order','name'].includes(orderBy) ? orderBy : 'sort_order';
  const srt = String(sort).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const lim = Math.min(parseInt(limit, 10) || 200, 500);

  const clauses = ['user_uid = ?']; const params = [uid];
  if (status) { clauses.push('status = ?'); params.push(status); }
  if (topLevel === 'true') { clauses.push('parent_id IS NULL'); }
  else if (parentId !== undefined) { clauses.push('parent_id <=> ?'); params.push(parentId ? Number(parentId) : null); }

  const [rows] = await pool.execute(
    `SELECT category_id AS id, user_uid AS userId, name, type, colour, parent_id AS parentId,
            sort_order AS sortOrder, status, created_at AS createdAt, updated_at AS updatedAt
       FROM categories
      WHERE ${clauses.join(' AND ')}
      ORDER BY ${ob} ${srt}, name ASC
      LIMIT ?`,
    [...params, lim]
  );
  res.json(rows);
};

exports.getById = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const [rows] = await pool.execute(
    `SELECT category_id AS id, user_uid AS userId, name, type, colour, parent_id AS parentId,
            sort_order AS sortOrder, status, created_at AS createdAt, updated_at AS updatedAt
       FROM categories WHERE category_id = ? AND user_uid = ?`,
    [Number(id), uid]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const { uid } = req.user || {};
  const errors = validate(req.body, { partial: false });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const {
    name, type = 'expense', colour = null, parentId = null, sortOrder = 0, status = 'active'
  } = req.body;

  const nameLower = String(name).trim().toLowerCase();

  // duplicate guard per user
  const [dups] = await pool.execute(
    `SELECT 1 FROM categories WHERE user_uid = ? AND name_lower = ? LIMIT 1`,
    [uid, nameLower]
  );
  if (dups[0]) return res.status(409).json({ error: 'Category with this name already exists' });

  // optional parent validation
  if (parentId) {
    const [p] = await pool.execute(`SELECT category_id FROM categories WHERE category_id = ? AND user_uid = ?`, [Number(parentId), uid]);
    if (!p[0]) return res.status(400).json({ error: 'Invalid parentId' });
  }

  const [result] = await pool.execute(
    `INSERT INTO categories (user_uid, name, name_lower, type, colour, parent_id, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid, String(name).trim(), nameLower, type, colour, parentId ? Number(parentId) : null, Number(sortOrder) || 0, status]
  );

  const [rows] = await pool.execute(
    `SELECT category_id AS id, user_uid AS userId, name, type, colour, parent_id AS parentId,
            sort_order AS sortOrder, status, created_at AS createdAt, updated_at AS updatedAt
       FROM categories WHERE category_id = ?`,
    [result.insertId]
  );
  res.status(201).json(rows[0]);
};

exports.update = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const errors = validate(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const [existing] = await pool.execute(`SELECT * FROM categories WHERE category_id = ? AND user_uid = ?`, [Number(id), uid]);
  if (!existing[0]) return res.status(404).json({ error: 'Category not found' });

  const fields = []; const params = [];

  if (req.body.name !== undefined) {
    const newName = String(req.body.name).trim();
    const nameLower = newName.toLowerCase();
    const [dups] = await pool.execute(
      `SELECT 1 FROM categories WHERE user_uid = ? AND name_lower = ? AND category_id <> ? LIMIT 1`,
      [uid, nameLower, Number(id)]
    );
    if (dups[0]) return res.status(409).json({ error: 'Category with this name already exists' });
    fields.push('name = ?', 'name_lower = ?'); params.push(newName, nameLower);
  }
  if (req.body.type !== undefined) { fields.push('type = ?'); params.push(req.body.type); }
  if (req.body.colour !== undefined) { fields.push('colour = ?'); params.push(req.body.colour || null); }
  if (req.body.parentId !== undefined) {
    const newParent = req.body.parentId ? Number(req.body.parentId) : null;
    if (newParent) {
      const [p] = await pool.execute(`SELECT category_id FROM categories WHERE category_id = ? AND user_uid = ?`, [newParent, uid]);
      if (!p[0]) return res.status(400).json({ error: 'Invalid parentId' });
      if (newParent === Number(id)) return res.status(400).json({ error: 'parentId cannot equal id' });
    }
    fields.push('parent_id = ?'); params.push(newParent);
  }
  if (req.body.sortOrder !== undefined) { fields.push('sort_order = ?'); params.push(Number(req.body.sortOrder) || 0); }
  if (req.body.status !== undefined) { fields.push('status = ?'); params.push(req.body.status); }

  if (fields.length) {
    await pool.execute(
      `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE category_id = ? AND user_uid = ?`,
      [...params, Number(id), uid]
    );
  }

  const [rows] = await pool.execute(
    `SELECT category_id AS id, user_uid AS userId, name, type, colour, parent_id AS parentId,
            sort_order AS sortOrder, status, created_at AS createdAt, updated_at AS updatedAt
       FROM categories WHERE category_id = ?`,
    [Number(id)]
  );
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const { uid } = req.user || {};
  const { id } = req.params;
  const cascade = String(req.query.cascade || '').toLowerCase() === 'true';

  // check children
  const [children] = await pool.execute(
    `SELECT category_id FROM categories WHERE parent_id = ? AND user_uid = ? LIMIT 1`,
    [Number(id), uid]
  );
  if (!cascade && children[0]) {
    return res.status(409).json({ error: 'Category has children', message: 'Delete/move children first or call ?cascade=true' });
  }

  // simple cascade (parent + direct children)
  if (cascade) {
    await pool.execute(`DELETE FROM categories WHERE (category_id = ? OR parent_id = ?) AND user_uid = ?`, [Number(id), Number(id), uid]);
    return res.status(204).send();
  }

  const [result] = await pool.execute(`DELETE FROM categories WHERE category_id = ? AND user_uid = ?`, [Number(id), uid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
  res.status(204).send();
};