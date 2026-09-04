const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadMaterial } = require('../middleware/upload');

const router = express.Router();

router.get(
  '/course/:courseId',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare('SELECT * FROM study_materials WHERE course_id = ? ORDER BY created_at DESC')
      .all(req.params.courseId);
    res.json({ success: true, materials: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  uploadMaterial.single('file'),
  [body('course_id').notEmpty(), body('title').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded.');
    const id = uuid();
    const fileUrl = `/uploads/materials/${req.file.filename}`;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
    db.prepare(
      `INSERT INTO study_materials (id, course_id, batch_id, title, file_url, file_type, uploaded_by)
       VALUES (?,?,?,?,?,?,?)`
    ).run(id, req.body.course_id, req.body.batch_id || null, req.body.title, fileUrl, fileType, req.user.id);
    res.status(201).json({ success: true, message: 'Material uploaded.', id });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM study_materials WHERE id = ?').run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Material not found.');
    res.json({ success: true, message: 'Material deleted.' });
  })
);

module.exports = router;
