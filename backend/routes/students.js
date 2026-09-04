const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function studentIdForUser(userId) {
  const row = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);
  if (!row) throw new ApiError(404, 'Student profile not found.');
  return row.id;
}

// ---- Student self-service (role: student) ---------------------------------

router.get(
  '/me/profile',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const profile = db
      .prepare(
        `SELECT u.full_name, u.email, u.phone, s.student_code, s.qualification, s.dob,
                s.address, s.guardian_name, s.guardian_phone, s.photo_url, s.status
         FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = ?`
      )
      .get(req.user.id);
    if (!profile) throw new ApiError(404, 'Student profile not found.');
    res.json({ success: true, profile });
  })
);

// Only a limited set of fields are student-editable; academic/status fields
// stay admin-controlled.
router.put(
  '/me/profile',
  requireAuth,
  requireRole('student'),
  [
    body('phone').optional({ checkFalsy: true }).trim(),
    body('address').optional({ checkFalsy: true }).trim(),
    body('guardian_name').optional({ checkFalsy: true }).trim(),
    body('guardian_phone').optional({ checkFalsy: true }).trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { phone, address, guardian_name, guardian_phone } = req.body;
    if (phone !== undefined) db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, req.user.id);
    db.prepare(
      `UPDATE students SET address = COALESCE(?, address), guardian_name = COALESCE(?, guardian_name),
        guardian_phone = COALESCE(?, guardian_phone), updated_at = datetime('now') WHERE user_id = ?`
    ).run(address, guardian_name, guardian_phone, req.user.id);
    res.json({ success: true, message: 'Profile updated.' });
  })
);

router.get(
  '/me/courses',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const sid = studentIdForUser(req.user.id);
    const rows = db
      .prepare(
        `SELECT en.id AS enrollment_id, en.status, en.progress_percent, en.enrolled_on,
                c.title AS course_title, c.slug, b.batch_code, b.timing, b.start_date
         FROM enrollments en
         JOIN courses c ON c.id = en.course_id
         LEFT JOIN batches b ON b.id = en.batch_id
         WHERE en.student_id = ? ORDER BY en.enrolled_on DESC`
      )
      .all(sid);
    res.json({ success: true, courses: rows });
  })
);

router.get(
  '/me/attendance',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const sid = studentIdForUser(req.user.id);
    const rows = db
      .prepare(
        `SELECT a.session_date, a.status, b.batch_code, c.title AS course_title
         FROM attendance a
         JOIN batches b ON b.id = a.batch_id
         JOIN courses c ON c.id = b.course_id
         WHERE a.student_id = ? ORDER BY a.session_date DESC`
      )
      .all(sid);
    const total = rows.length;
    const present = rows.filter((r) => r.status === 'present').length;
    const percentage = total ? Math.round((present / total) * 100) : null;
    res.json({ success: true, attendance: rows, summary: { total, present, percentage } });
  })
);

router.get(
  '/me/materials',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const sid = studentIdForUser(req.user.id);
    // Materials assigned to any course/batch the student is enrolled in.
    const rows = db
      .prepare(
        `SELECT DISTINCT m.id, m.title, m.file_url, m.file_type, m.created_at, c.title AS course_title
         FROM study_materials m
         JOIN enrollments en ON en.course_id = m.course_id
           AND (m.batch_id IS NULL OR m.batch_id = en.batch_id)
         JOIN courses c ON c.id = m.course_id
         WHERE en.student_id = ? ORDER BY m.created_at DESC`
      )
      .all(sid);
    res.json({ success: true, materials: rows });
  })
);

router.get(
  '/me/certificates',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const sid = studentIdForUser(req.user.id);
    const rows = db
      .prepare(
        `SELECT cert.certificate_number, cert.issued_date, cert.file_url, cert.status, c.title AS course_title
         FROM certificates cert JOIN courses c ON c.id = cert.course_id
         WHERE cert.student_id = ? ORDER BY cert.issued_date DESC`
      )
      .all(sid);
    res.json({ success: true, certificates: rows });
  })
);

router.get(
  '/me/announcements',
  requireAuth,
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT id, title, body, created_at FROM announcements
         WHERE is_active = 1 AND audience IN ('all','students') ORDER BY created_at DESC LIMIT 20`
      )
      .all();
    res.json({ success: true, announcements: rows });
  })
);

// ---- Admin/staff student management ----------------------------------------

router.get(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    let query = `SELECT s.id, s.student_code, s.status, s.qualification, u.full_name, u.email, u.phone
                 FROM students s JOIN users u ON u.id = s.user_id WHERE 1=1`;
    const params = [];
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR s.student_code LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    query += ' ORDER BY s.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ success: true, students: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  [
    body('full_name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().isLength({ min: 8 }),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { full_name, email, phone, password, qualification } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) throw new ApiError(409, 'A user with this email already exists.');

    const studentRoleId = db.prepare("SELECT id FROM roles WHERE name = 'student'").get().id;
    const userId = uuid();
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO users (id, full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?,?)`
      ).run(userId, full_name, email, phone, bcrypt.hashSync(password, 10), studentRoleId);
      const year = new Date().getFullYear();
      const seq = db.prepare('SELECT COUNT(*) AS c FROM students').get().c + 1;
      const studentCode = `KTEC-${year}-${String(seq).padStart(4, '0')}`;
      db.prepare(
        `INSERT INTO students (id, user_id, student_code, qualification) VALUES (?,?,?,?)`
      ).run(uuid(), userId, studentCode, qualification || '');
    });
    tx();
    res.status(201).json({ success: true, message: 'Student added.' });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) throw new ApiError(404, 'Student not found.');

    const { qualification, address, guardian_name, guardian_phone, status } = req.body;
    db.prepare(
      `UPDATE students SET
        qualification = COALESCE(?, qualification),
        address = COALESCE(?, address),
        guardian_name = COALESCE(?, guardian_name),
        guardian_phone = COALESCE(?, guardian_phone),
        status = COALESCE(?, status),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(qualification, address, guardian_name, guardian_phone, status, req.params.id);
    res.json({ success: true, message: 'Student updated.' });
  })
);

router.post(
  '/:id/assign-course',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('course_id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { course_id, batch_id } = req.body;
    const exists = db
      .prepare('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND batch_id IS ?')
      .get(req.params.id, course_id, batch_id || null);
    if (exists) throw new ApiError(409, 'Student is already enrolled in this course/batch.');
    db.prepare(`INSERT INTO enrollments (id, student_id, course_id, batch_id) VALUES (?,?,?,?)`).run(
      uuid(),
      req.params.id,
      course_id,
      batch_id || null
    );
    res.status(201).json({ success: true, message: 'Course assigned.' });
  })
);

module.exports = router;
