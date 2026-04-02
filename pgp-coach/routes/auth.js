const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.adminId = admin.id;
    req.session.adminName = admin.name;
    res.json({ success: true, name: admin.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Hire PIN login
router.post('/hire/login', async (req, res) => {
  const { pin } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, role, manager_name, start_date, status FROM hires WHERE pin = $1',
      [pin.trim()]
    );
    const hire = result.rows[0];
    if (!hire) return res.status(401).json({ error: 'Invalid PIN. Please check with your manager.' });
    await pool.query('UPDATE hires SET last_active_at = NOW() WHERE id = $1', [hire.id]);
    req.session.hireId = hire.id;
    req.session.hireName = hire.first_name;
    res.json({ success: true, hire });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hire/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/session', (req, res) => {
  if (req.session.adminId) return res.json({ type: 'admin', name: req.session.adminName });
  if (req.session.hireId) return res.json({ type: 'hire', id: req.session.hireId, name: req.session.hireName });
  res.json({ type: null });
});

module.exports = router;
