const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadGalleryImage } = require('../middleware/upload');

const router = express.Router();

const CATEGORIES = ['classroom', 'lab', 'events', 'workshops', 'activities', 'certificates', 'competitions'];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery';
    const params = [];
    if (category && CATEGORIES.includes(category)) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY display_order, created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ success: true, images: rows, categories: CATEGORIES });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  uploadGalleryImage.single('image'),
  [body('category').isIn(CATEGORIES).withMessage('Invalid gallery category.')],
  validate,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No image uploaded.');
    const id = uuid();
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    db.prepare(
      `INSERT INTO gallery (id, category, image_url, caption, display_order) VALUES (?,?,?,?,?)`
    ).run(id, req.body.category, imageUrl, req.body.caption || '', req.body.display_order || 0);
    res.status(201).json({ success: true, message: 'Image uploaded.', imageUrl });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Image not found.');
    res.json({ success: true, message: 'Image deleted.' });
  })
);

module.exports = router;
