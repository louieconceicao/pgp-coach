const express = require('express');
const { pool } = require('../db');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.adminId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// All members with progress
router.get('/hires', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'complete') AS modules_complete
      FROM hires h
      LEFT JOIN modules m ON h.id = m.hire_id
      GROUP BY h.id
      ORDER BY h.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single member full detail
router.get('/hires/:id', requireAdmin, async (req, res) => {
  try {
    const member = await pool.query('SELECT * FROM hires WHERE id = $1', [req.params.id]);
    const modules = await pool.query(
      'SELECT * FROM modules WHERE hire_id = $1 ORDER BY module_index', [req.params.id]
    );
    const plan = await pool.query('SELECT * FROM plans WHERE hire_id = $1', [req.params.id]);
    res.json({ ...member.rows[0], modules: modules.rows, plan: plan.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create member
router.post('/hires', requireAdmin, async (req, res) => {
  const { first_name, last_name, role, manager_name, start_date, context_notes, team } = req.body;
  try {
    let pin, exists = true;
    while (exists) {
      pin = generatePIN();
      const check = await pool.query('SELECT id FROM hires WHERE pin = $1', [pin]);
      exists = check.rows.length > 0;
    }
    const result = await pool.query(
      `INSERT INTO hires (first_name, last_name, role, manager_name, start_date, context_notes, team, pin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [first_name, last_name, role, manager_name, start_date || null, context_notes, team || null, pin]
    );
    const member = result.rows[0];
    const moduleKeys = ['identity','vision','system','impact','reflection','integration'];
    for (let i = 0; i < moduleKeys.length; i++) {
      await pool.query(
        `INSERT INTO modules (hire_id, module_key, module_index, status) VALUES ($1,$2,$3,$4)`,
        [member.id, moduleKeys[i], i, i === 0 ? 'unlocked' : 'locked']
      );
    }
    res.json({ ...member, pin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member
router.put('/hires/:id', requireAdmin, async (req, res) => {
  const { first_name, last_name, role, manager_name, start_date, context_notes, team } = req.body;
  try {
    await pool.query(
      `UPDATE hires SET first_name=$1, last_name=$2, role=$3, manager_name=$4, start_date=$5, context_notes=$6, team=$7 WHERE id=$8`,
      [first_name, last_name, role, manager_name, start_date || null, context_notes, team || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete member
router.delete('/hires/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM hires WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
