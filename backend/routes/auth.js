const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { signToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Slow down brute-force login attempts without blocking legitimate retries.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function findUserByEmail(email) {
  return db
    .prepare(
      `SELECT u.*, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? AND u.deleted_at IS NULL`
    )
    .get(email);
}

// POST /api/auth/login  { email, password }
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = findUserByEmail(email);
    if (!user || !user.is_active) {
      throw new ApiError(401, 'Invalid email or password.');
    }
    const matches = bcrypt.compareSync(password, user.password_hash);
    if (!matches) {
      throw new ApiError(401, 'Invalid email or password.');
    }
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    const token = signToken(user);
    res.cookie('ktec_token', token, cookieOptions());
    res.json({
      success: true,
      message: 'Logged in successfully.',
      token, // also returned for non-browser / mobile clients
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role },
    });
  })
);

// POST /api/auth/register — self-registration is intentionally limited to
// students; admin/staff accounts are created by an existing admin via
// POST /api/auth/create-user, never through public signup.
router.post(
  '/register',
  [
    body('full_name').trim().isLength({ min: 2 }).withMessage('Enter your full name.'),
    body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('phone').trim().isLength({ min: 8 }).withMessage('Enter a valid phone number.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { full_name, email, phone, password } = req.body;
    const existing = findUserByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }
    const studentRoleId = db.prepare("SELECT id FROM roles WHERE name = 'student'").get().id;
    const userId = uuid();
    const passwordHash = bcrypt.hashSync(password, 10);

    const insertUser = db.prepare(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?,?)`
    );
    const insertStudent = db.prepare(
      `INSERT INTO students (id, user_id, student_code) VALUES (?,?,?)`
    );

    const tx = db.transaction(() => {
      insertUser.run(userId, full_name, email, phone, passwordHash, studentRoleId);
      const year = new Date().getFullYear();
      const seq = db.prepare('SELECT COUNT(*) AS c FROM students').get().c + 1;
      const studentCode = `KTEC-${year}-${String(seq).padStart(4, '0')}`;
      insertStudent.run(uuid(), userId, studentCode);
    });
    tx();

    res.status(201).json({ success: true, message: 'Account created. You can now log in.' });
  })
);

// POST /api/auth/create-user — admin-only creation of staff/admin accounts.
router.post(
  '/create-user',
  requireAuth,
  requireRole('admin'),
  [
    body('full_name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['admin', 'staff']).withMessage('Role must be admin or staff.'),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { full_name, email, phone, role, password } = req.body;
    if (findUserByEmail(email)) throw new ApiError(409, 'An account with this email already exists.');
    const roleId = db.prepare('SELECT id FROM roles WHERE name = ?').get(role).id;
    const userId = uuid();
    db.prepare(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?,?)`
    ).run(userId, full_name, email, phone || '', bcrypt.hashSync(password, 10), roleId);
    if (role === 'staff') {
      db.prepare(`INSERT INTO staff (id, user_id, designation) VALUES (?,?,?)`).run(
        uuid(),
        userId,
        req.body.designation || 'Trainer'
      );
    }
    res.status(201).json({ success: true, message: `${role} account created.` });
  })
);

router.post('/logout', (req, res) => {
  res.clearCookie('ktec_token', cookieOptions());
  res.json({ success: true, message: 'Logged out.' });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = db
      .prepare(
        `SELECT u.id, u.full_name, u.email, u.phone, r.name AS role
         FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`
      )
      .get(req.user.id);
    if (!user) throw new ApiError(404, 'User not found.');
    res.json({ success: true, user });
  })
);

module.exports = router;
