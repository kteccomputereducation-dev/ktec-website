const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
    res.json({ success: true, announcements: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('title').trim().notEmpty(), body('body').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const id = uuid();
    db.prepare(
      `INSERT INTO announcements (id, title, body, audience, is_active) VALUES (?,?,?,?,?)`
    ).run(id, req.body.title, req.body.body, req.body.audience || 'all', req.body.is_active === false ? 0 : 1);
    res.status(201).json({ success: true, message: 'Announcement posted.', id });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Announcement not found.');
    res.json({ success: true, message: 'Announcement deleted.' });
  })
);

module.exports = router;
