const express = require('express');
const { body } = require('express-validator');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — public, powers header/footer/contact info site-wide
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ success: true, settings });
  })
);

// PUT /api/settings — admin only, accepts a flat key/value object
router.put(
  '/',
  requireAuth,
  requireRole('admin'),
  [body().custom((val) => typeof val === 'object' && val !== null)],
  validate,
  asyncHandler(async (req, res) => {
    const upsert = db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    );
    const tx = db.transaction((entries) => {
      entries.forEach(([k, v]) => upsert.run(k, String(v ?? '')));
    });
    tx(Object.entries(req.body));
    res.json({ success: true, message: 'Settings updated.' });
  })
);

module.exports = router;
