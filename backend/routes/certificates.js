const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please try again shortly.' },
});

// POST /api/certificates/verify  { certificate_number }  — public
// Deliberately returns only what's needed to confirm authenticity, not the
// student's contact details, address, etc.
router.post(
  '/verify',
  verifyLimiter,
  [body('certificate_number').trim().notEmpty().withMessage('Enter a certificate ID.')],
  validate,
  asyncHandler(async (req, res) => {
    const cert = db
      .prepare(
        `SELECT cert.certificate_number, cert.issued_date, cert.status,
                s.student_code, u.full_name AS student_name,
                c.title AS course_title
         FROM certificates cert
         JOIN students s ON s.id = cert.student_id
         JOIN users u ON u.id = s.user_id
         JOIN courses c ON c.id = cert.course_id
         WHERE cert.certificate_number = ?`
      )
      .get(req.body.certificate_number.trim());

    if (!cert) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate not found / Invalid certificate ID.' });
    }
    if (cert.status === 'revoked') {
      return res.json({ success: true, valid: false, message: 'This certificate has been revoked.' });
    }
    res.json({
      success: true,
      valid: true,
      certificate: {
        certificate_number: cert.certificate_number,
        student_name: cert.student_name,
        course: cert.course_title,
        issued_date: cert.issued_date,
        institute_name: 'K TEC COMPUTER EDUCATION',
      },
    });
  })
);

// ---- Admin issuance --------------------------------------------------------

router.get(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT cert.*, u.full_name AS student_name, c.title AS course_title
         FROM certificates cert
         JOIN students s ON s.id = cert.student_id
         JOIN users u ON u.id = s.user_id
         JOIN courses c ON c.id = cert.course_id
         ORDER BY cert.created_at DESC`
      )
      .all();
    res.json({ success: true, certificates: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('student_id').notEmpty(),
    body('course_id').notEmpty(),
    body('issued_date').isISO8601().withMessage('Enter a valid issue date.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { student_id, course_id, issued_date, certificate_number } = req.body;

    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
    if (!student) throw new ApiError(400, 'Student not found.');
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
    if (!course) throw new ApiError(400, 'Course not found.');

    const certNumber = certificate_number || `KTEC-CERT-${Date.now().toString(36).toUpperCase()}`;
    const existing = db.prepare('SELECT id FROM certificates WHERE certificate_number = ?').get(certNumber);
    if (existing) throw new ApiError(409, 'Certificate number already exists.');

    const id = uuid();
    db.prepare(
      `INSERT INTO certificates (id, certificate_number, student_id, course_id, issued_date, status)
       VALUES (?,?,?,?,?, 'issued')`
    ).run(id, certNumber, student_id, course_id, issued_date);
    res.status(201).json({ success: true, message: 'Certificate issued.', certificateId: id, certificateNumber: certNumber });
  })
);

router.patch(
  '/:id/revoke',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = db.prepare("UPDATE certificates SET status = 'revoked' WHERE id = ?").run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Certificate not found.');
    res.json({ success: true, message: 'Certificate revoked.' });
  })
);

module.exports = router;
