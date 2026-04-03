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

// All hires with tags + progress
router.get('/hires', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color))
          FILTER (WHERE t.id IS NOT NULL), '[]') AS tags,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'complete') AS modules_complete
      FROM hires h
      LEFT JOIN hire_tags ht ON h.id = ht.hire_id
      LEFT JOIN tags t ON ht.tag_id = t.id
      LEFT JOIN modules m ON h.id = m.hire_id
      GROUP BY h.id
      ORDER BY h.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single hire full detail
router.get('/hires/:id', requireAdmin, async (req, res) => {
  try {
    const hire = await pool.query(`
      SELECT h.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color))
          FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
      FROM hires h
      LEFT JOIN hire_tags ht ON h.id = ht.hire_id
      LEFT JOIN tags t ON ht.tag_id = t.id
      WHERE h.id = $1 GROUP BY h.id
    `, [req.params.id]);
    const modules = await pool.query(
      'SELECT * FROM modules WHERE hire_id = $1 ORDER BY module_index', [req.params.id]
    );
    const plan = await pool.query('SELECT * FROM plans WHERE hire_id = $1', [req.params.id]);
    res.json({ ...hire.rows[0], modules: modules.rows, plan: plan.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create hire
router.post('/hires', requireAdmin, async (req, res) => {
  const { first_name, last_name, role, manager_name, start_date, context_notes, tag_ids } = req.body;
  try {
    // Generate unique PIN
    let pin, exists = true;
    while (exists) {
      pin = generatePIN();
      const check = await pool.query('SELECT id FROM hires WHERE pin = $1', [pin]);
      exists = check.rows.length > 0;
    }
    const result = await pool.query(
      `INSERT INTO hires (first_name, last_name, role, manager_name, start_date, context_notes, pin)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [first_name, last_name, role, manager_name, start_date || null, context_notes, pin]
    );
    const hire = result.rows[0];
    // Create all 6 module records
    const moduleKeys = ['identity','vision','system','impact','reflection','integration'];
    for (let i = 0; i < moduleKeys.length; i++) {
      await pool.query(
        `INSERT INTO modules (hire_id, module_key, module_index, status) VALUES ($1,$2,$3,$4)`,
        [hire.id, moduleKeys[i], i, i === 0 ? 'unlocked' : 'locked']
      );
    }
    // Assign tags
    if (tag_ids && tag_ids.length > 0) {
      for (const tid of tag_ids) {
        await pool.query('INSERT INTO hire_tags (hire_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [hire.id, tid]);
      }
    }
    res.json({ ...hire, pin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update hire
router.put('/hires/:id', requireAdmin, async (req, res) => {
  const { first_name, last_name, role, manager_name, start_date, context_notes, tag_ids } = req.body;
  try {
    await pool.query(
      `UPDATE hires SET first_name=$1, last_name=$2, role=$3, manager_name=$4, start_date=$5, context_notes=$6 WHERE id=$7`,
      [first_name, last_name, role, manager_name, start_date || null, context_notes, req.params.id]
    );
    await pool.query('DELETE FROM hire_tags WHERE hire_id = $1', [req.params.id]);
    if (tag_ids && tag_ids.length > 0) {
      for (const tid of tag_ids) {
        await pool.query('INSERT INTO hire_tags (hire_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, tid]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete hire
router.delete('/hires/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM hires WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tags
router.get('/tags', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tags', requireAdmin, async (req, res) => {
  const { name, color } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tags (name, color) VALUES ($1,$2)
       ON CONFLICT (name) DO UPDATE SET color=$2 RETURNING *`,
      [name, color || 'purple']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tags/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tags WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
