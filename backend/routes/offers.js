const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadOfferBanner } = require('../middleware/upload');

const router = express.Router();

// GET /api/offers — public, only currently-active offers within date range
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT o.*, c.title AS course_title FROM offers o
         LEFT JOIN courses c ON c.id = o.course_id
         WHERE o.is_active = 1
           AND (o.valid_from IS NULL OR o.valid_from <= date('now'))
           AND (o.valid_until IS NULL OR o.valid_until >= date('now'))
         ORDER BY o.created_at DESC`
      )
      .all();
    res.json({ success: true, offers: rows });
  })
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
    res.json({ success: true, offers: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [body('title').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, course_id, discount_text, valid_from, valid_until, is_active } = req.body;
    const id = uuid();
    db.prepare(
      `INSERT INTO offers (id, title, description, course_id, discount_text, valid_from, valid_until, is_active)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(id, title, description || '', course_id || null, discount_text || '', valid_from || null, valid_until || null, is_active === false ? 0 : 1);
    res.status(201).json({ success: true, message: 'Offer created.', offerId: id });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const fields = ['title', 'description', 'course_id', 'discount_text', 'valid_from', 'valid_until', 'is_active'];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(f === 'is_active' ? (req.body[f] ? 1 : 0) : req.body[f]);
      }
    });
    if (updates.length === 0) throw new ApiError(400, 'No fields to update.');
    values.push(req.params.id);
    const result = db.prepare(`UPDATE offers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) throw new ApiError(404, 'Offer not found.');
    res.json({ success: true, message: 'Offer updated.' });
  })
);

router.post(
  '/:id/banner',
  requireAuth,
  requireRole('admin'),
  uploadOfferBanner.single('banner'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No image uploaded.');
    const bannerUrl = `/uploads/offers/${req.file.filename}`;
    const result = db.prepare('UPDATE offers SET banner_image_url = ? WHERE id = ?').run(bannerUrl, req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Offer not found.');
    res.json({ success: true, message: 'Banner uploaded.', bannerUrl });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Offer not found.');
    res.json({ success: true, message: 'Offer deleted.' });
  })
);

module.exports = router;
