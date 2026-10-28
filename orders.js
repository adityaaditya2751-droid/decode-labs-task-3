const express = require('express');
const db = require('../db');

const router = express.Router();

// CREATE = POST = SQL INSERT
router.post('/', (req, res) => {
  const { user_id, item, total } = req.body;
  if (!user_id || !item || total === undefined) {
    return res
      .status(400)
      .json({ error: 'user_id, item, and total are required' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
  if (!user) {
    return res.status(400).json({ error: 'user_id does not reference an existing user' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO orders (user_id, item, total) VALUES (?, ?, ?)'
    );
    const info = stmt.run(user_id, item, total);
    const order = db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(info.lastInsertRowid);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ (all) = GET = SQL SELECT
router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id').all();
  res.json(orders);
});

// READ (one) = GET = SQL SELECT
router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(req.params.id);
  if (!order) return res.status(404).json({ error: 'order not found' });
  res.json(order);
});

// UPDATE = PUT/PATCH = SQL UPDATE
router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'order not found' });

  const { item, total } = req.body;
  try {
    db.prepare('UPDATE orders SET item = ?, total = ? WHERE id = ?').run(
      item ?? existing.item,
      total ?? existing.total,
      req.params.id
    );
    const updated = db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE = DELETE = SQL DELETE
router.delete('/:id', (req, res) => {
  const info = db
    .prepare('DELETE FROM orders WHERE id = ?')
    .run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'order not found' });
  }
  res.status(204).send();
});

module.exports = router;
