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
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT t.id, t.student_name, t.review, t.photo_url, c.title AS course_title
         FROM testimonials t LEFT JOIN courses c ON c.id = t.course_id
         WHERE t.is_published = 1 ORDER BY t.display_order, t.created_at DESC`
      )
      .all();
    res.json({ success: true, testimonials: rows });
  })
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    res.json({ success: true, testimonials: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [body('student_name').trim().notEmpty(), body('review').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { student_name, course_id, review, photo_url, is_published } = req.body;
    const id = uuid();
    db.prepare(
      `INSERT INTO testimonials (id, student_name, course_id, review, photo_url, is_published) VALUES (?,?,?,?,?,?)`
    ).run(id, student_name, course_id || null, review, photo_url || null, is_published ? 1 : 0);
    res.status(201).json({ success: true, message: 'Testimonial added.', id });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const fields = ['student_name', 'course_id', 'review', 'photo_url', 'is_published', 'display_order'];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(f === 'is_published' ? (req.body[f] ? 1 : 0) : req.body[f]);
      }
    });
    if (updates.length === 0) throw new ApiError(400, 'No fields to update.');
    values.push(req.params.id);
    const result = db.prepare(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) throw new ApiError(404, 'Testimonial not found.');
    res.json({ success: true, message: 'Testimonial updated.' });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Testimonial not found.');
    res.json({ success: true, message: 'Testimonial deleted.' });
  })
);

module.exports = router;
