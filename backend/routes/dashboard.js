const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — admin overview cards
router.get(
  '/stats',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const count = (sql, ...params) => db.prepare(sql).get(...params).c;
    const stats = {
      total_students: count('SELECT COUNT(*) AS c FROM students'),
      active_students: count("SELECT COUNT(*) AS c FROM students WHERE status = 'active'"),
      total_courses: count('SELECT COUNT(*) AS c FROM courses WHERE deleted_at IS NULL'),
      published_courses: count('SELECT COUNT(*) AS c FROM courses WHERE is_published = 1 AND deleted_at IS NULL'),
      total_enquiries: count('SELECT COUNT(*) AS c FROM enquiries'),
      new_enquiries: count("SELECT COUNT(*) AS c FROM enquiries WHERE status = 'new'"),
      total_admissions: count('SELECT COUNT(*) AS c FROM admissions'),
      total_staff: count('SELECT COUNT(*) AS c FROM staff'),
      total_batches: count('SELECT COUNT(*) AS c FROM batches'),
      ongoing_batches: count("SELECT COUNT(*) AS c FROM batches WHERE status = 'ongoing'"),
    };

    // Enquiries in the last 6 months, for a simple trend chart.
    const enquiryTrend = db
      .prepare(
        `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
         FROM enquiries
         WHERE created_at >= datetime('now', '-6 months')
         GROUP BY month ORDER BY month`
      )
      .all();

    const enquiryByStatus = db
      .prepare(`SELECT status, COUNT(*) AS count FROM enquiries GROUP BY status`)
      .all();

    res.json({ success: true, stats, enquiryTrend, enquiryByStatus });
  })
);

router.get(
  '/notifications',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50')
      .all();
    res.json({ success: true, notifications: rows });
  })
);

router.patch(
  '/notifications/:id/read',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  })
);

module.exports = router;
