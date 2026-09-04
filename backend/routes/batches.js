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
    const rows = db
      .prepare(
        `SELECT b.*, c.title AS course_title,
                (SELECT full_name FROM users u JOIN staff st ON st.user_id = u.id WHERE st.id = b.trainer_id) AS trainer_name,
                (SELECT COUNT(*) FROM enrollments en WHERE en.batch_id = b.id) AS student_count
         FROM batches b JOIN courses c ON c.id = b.course_id
         ORDER BY b.start_date DESC`
      )
      .all();
    res.json({ success: true, batches: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('course_id').notEmpty(),
    body('batch_code').trim().notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { course_id, trainer_id, batch_code, start_date, end_date, timing, mode, capacity } = req.body;
    const existing = db.prepare('SELECT id FROM batches WHERE batch_code = ?').get(batch_code);
    if (existing) throw new ApiError(409, 'Batch code already exists.');
    const id = uuid();
    db.prepare(
      `INSERT INTO batches (id, course_id, trainer_id, batch_code, start_date, end_date, timing, mode, capacity)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(id, course_id, trainer_id || null, batch_code, start_date || null, end_date || null, timing || null, mode || 'offline', capacity || null);
    res.status(201).json({ success: true, message: 'Batch created.', batchId: id });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const fields = ['trainer_id', 'start_date', 'end_date', 'timing', 'mode', 'capacity', 'status'];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });
    if (updates.length === 0) throw new ApiError(400, 'No fields to update.');
    values.push(req.params.id);
    const result = db.prepare(`UPDATE batches SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) throw new ApiError(404, 'Batch not found.');
    res.json({ success: true, message: 'Batch updated.' });
  })
);

// ---- Attendance -------------------------------------------------------

// POST /api/batches/:id/attendance  { session_date, records: [{student_id, status}] }
router.post(
  '/:id/attendance',
  requireAuth,
  requireRole('admin', 'staff'),
  [body('session_date').isISO8601(), body('records').isArray({ min: 1 })],
  validate,
  asyncHandler(async (req, res) => {
    const { session_date, records } = req.body;
    const insert = db.prepare(
      `INSERT INTO attendance (id, batch_id, student_id, session_date, status, marked_by)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(batch_id, student_id, session_date) DO UPDATE SET status = excluded.status`
    );
    const tx = db.transaction((recs) => {
      recs.forEach((r) => {
        if (!['present', 'absent', 'late'].includes(r.status)) {
          throw new ApiError(400, `Invalid attendance status for student ${r.student_id}.`);
        }
        insert.run(uuid(), req.params.id, r.student_id, session_date, r.status, req.user.id === undefined ? null : null);
      });
    });
    tx(records);
    res.status(201).json({ success: true, message: 'Attendance recorded.' });
  })
);

router.get(
  '/:id/attendance',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.*, u.full_name AS student_name
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN users u ON u.id = s.user_id
         WHERE a.batch_id = ? ORDER BY a.session_date DESC`
      )
      .all(req.params.id);
    res.json({ success: true, attendance: rows });
  })
);

module.exports = router;
