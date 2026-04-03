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
    res.setSession({ adminId: admin.id, adminName: admin.name });
    res.json({ success: true, name: admin.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/logout', (req, res) => {
  res.clearSession();
  res.json({ success: true });
});

// Member PIN login
router.post('/hire/login', async (req, res) => {
  const { pin } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, role, manager_name, start_date, status FROM hires WHERE pin = $1',
      [pin.trim()]
    );
    const member = result.rows[0];
    if (!member) return res.status(401).json({ error: 'Invalid PIN. Please check with your manager.' });
    await pool.query('UPDATE hires SET last_active_at = NOW() WHERE id = $1', [member.id]);
    res.setSession({ hireId: member.id, hireName: member.first_name });
    res.json({ success: true, hire: member });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hire/logout', (req, res) => {
  res.clearSession();
  res.json({ success: true });
});

router.get('/session', (req, res) => {
  if (req.session.adminId) return res.json({ type: 'admin', name: req.session.adminName });
  if (req.session.hireId) return res.json({ type: 'hire', id: req.session.hireId, name: req.session.hireName });
  res.json({ type: null });
});

module.exports = router;
