// Pillar 3 (The Action): CRUD & RESTful HTTP
// Pillar 4 (The Shield): every query below uses a parameterized
// statement ('?' placeholders) instead of string concatenation,
// which is what defeats SQL injection (see "Neutralizing Attacks
// with Parameterized Queries").

const express = require('express');
const db = require('../db');

const router = express.Router();

// CREATE = POST = SQL INSERT
router.post('/', (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)'
    );
    const info = stmt.run(name, email, age ?? null);
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(info.lastInsertRowid);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// READ (all) = GET = SQL SELECT
router.get('/', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();
  res.json(users);
});

// READ (one) = GET = SQL SELECT
router.get('/:id', (req, res) => {
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

// READ nested orders for a user (demonstrates the 1:Many relationship)
router.get('/:id/orders', (req, res) => {
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });

  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id')
    .all(req.params.id);
  res.json({ ...user, orders });
});

// UPDATE = PUT = SQL UPDATE
router.put('/:id', (req, res) => {
  const { name, email, age } = req.body;
  const existing = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'user not found' });

  try {
    db.prepare(
      'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?'
    ).run(
      name ?? existing.name,
      email ?? existing.email,
      age ?? existing.age,
      req.params.id
    );
    const updated = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE = DELETE = SQL DELETE (cascades to orders via ON DELETE CASCADE)
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'user not found' });
  }
  res.status(204).send();
});

module.exports = router;
