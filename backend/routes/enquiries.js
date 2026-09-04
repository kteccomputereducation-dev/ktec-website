const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Basic per-IP throttle so a bot can't spam the enquiry form / DB.
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again shortly.' },
});

// A lightweight duplicate guard: same mobile + course within 2 minutes is
// treated as an accidental double-click rather than a fresh enquiry.
function isRecentDuplicate(mobile, courseId) {
  const row = db
    .prepare(
      `SELECT id FROM enquiries
       WHERE mobile = ? AND (course_id IS ? )
         AND created_at > datetime('now', '-2 minutes')
       LIMIT 1`
    )
    .get(mobile, courseId || null);
  return !!row;
}

// POST /api/enquiries — public admission/enquiry form
router.post(
  '/',
  enquiryLimiter,
  [
    body('student_name').trim().isLength({ min: 2 }).withMessage('Enter the student name.'),
    body('mobile')
      .trim()
      .matches(/^[0-9+\-\s]{8,15}$/)
      .withMessage('Enter a valid mobile number.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address.'),
    body('course_id').optional({ checkFalsy: true }).isString(),
    body('message').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const {
      student_name,
      mobile,
      email,
      course_id,
      qualification,
      preferred_batch,
      preferred_mode,
      message,
    } = req.body;

    if (isRecentDuplicate(mobile, course_id)) {
      return res.json({
        success: true,
        message: 'We already received your enquiry — our team will contact you shortly.',
      });
    }

    if (course_id) {
      const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
      if (!course) throw new ApiError(400, 'Selected course is invalid.');
    }

    const id = uuid();
    db.prepare(
      `INSERT INTO enquiries
        (id, student_name, mobile, email, course_id, qualification, preferred_batch, preferred_mode, message)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(
      id,
      student_name,
      mobile,
      email || null,
      course_id || null,
      qualification || null,
      preferred_batch || null,
      preferred_mode || null,
      message || null
    );

    // Notify admins in-app. Email/WhatsApp notification requires the
    // corresponding credentials — see README "Third-party configuration".
    db.prepare(`INSERT INTO notifications (id, title, body) VALUES (?,?,?)`).run(
      uuid(),
      'New enquiry received',
      `${student_name} (${mobile}) submitted an enquiry.`
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you soon.',
    });
  })
);

// GET /api/enquiries — admin/staff, with search + status filter
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    let query = `SELECT e.*, c.title AS course_title FROM enquiries e
                 LEFT JOIN courses c ON c.id = e.course_id WHERE 1=1`;
    const params = [];
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (e.student_name LIKE ? OR e.mobile LIKE ? OR e.email LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += ' ORDER BY e.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ success: true, enquiries: rows });
  })
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('status').isIn(['new', 'contacted', 'follow_up', 'converted', 'closed'])],
  validate,
  asyncHandler(async (req, res) => {
    const result = db
      .prepare(`UPDATE enquiries SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(req.body.status, req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Enquiry not found.');
    res.json({ success: true, message: 'Status updated.' });
  })
);

router.patch(
  '/:id/notes',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('follow_up_notes').isString()],
  validate,
  asyncHandler(async (req, res) => {
    db.prepare(`UPDATE enquiries SET follow_up_notes = ?, updated_at = datetime('now') WHERE id = ?`).run(
      req.body.follow_up_notes,
      req.params.id
    );
    res.json({ success: true, message: 'Notes saved.' });
  })
);

// Convert an enquiry into an admission record (does not auto-create a login;
// admin completes admission details, student account can be created separately).
router.post(
  '/:id/convert',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('course_id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
    if (!enquiry) throw new ApiError(404, 'Enquiry not found.');

    const id = uuid();
    db.prepare(
      `INSERT INTO admissions (id, enquiry_id, course_id, batch_id, status) VALUES (?,?,?,?, 'pending')`
    ).run(id, enquiry.id, req.body.course_id, req.body.batch_id || null);
    db.prepare(`UPDATE enquiries SET status = 'converted', updated_at = datetime('now') WHERE id = ?`).run(
      enquiry.id
    );
    res.status(201).json({ success: true, message: 'Enquiry converted to admission.', admissionId: id });
  })
);

module.exports = router;
