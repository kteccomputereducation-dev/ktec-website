const express = require('express');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admissions — admin/staff
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.*, c.title AS course_title, e.student_name, e.mobile, e.email
         FROM admissions a
         JOIN courses c ON c.id = a.course_id
         LEFT JOIN enquiries e ON e.id = a.enquiry_id
         ORDER BY a.created_at DESC`
      )
      .all();
    res.json({ success: true, admissions: rows });
  })
);

// POST /api/admissions — admin creates an admission directly (not via enquiry)
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('course_id').notEmpty().withMessage('Course is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const { student_id, course_id, batch_id } = req.body;
    if (student_id) {
      const student = db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
      if (!student) throw new ApiError(400, 'Student not found.');
    }
    const id = uuid();
    db.prepare(
      `INSERT INTO admissions (id, student_id, course_id, batch_id, status) VALUES (?,?,?,?, 'pending')`
    ).run(id, student_id || null, course_id, batch_id || null);
    res.status(201).json({ success: true, message: 'Admission created.', admissionId: id });
  })
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('status').isIn(['pending', 'confirmed', 'cancelled'])],
  validate,
  asyncHandler(async (req, res) => {
    const result = db.prepare('UPDATE admissions SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Admission not found.');

    // Confirming an admission auto-creates the enrollment record so it
    // shows up in the student dashboard once a student account is linked.
    if (req.body.status === 'confirmed') {
      const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(req.params.id);
      if (admission.student_id) {
        const exists = db
          .prepare('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND batch_id IS ?')
          .get(admission.student_id, admission.course_id, admission.batch_id || null);
        if (!exists) {
          db.prepare(
            `INSERT INTO enrollments (id, student_id, course_id, batch_id) VALUES (?,?,?,?)`
          ).run(uuid(), admission.student_id, admission.course_id, admission.batch_id || null);
        }
      }
    }
    res.json({ success: true, message: 'Admission status updated.' });
  })
);

module.exports = router;
