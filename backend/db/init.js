// SQLite dev-database bootstrap.
// Mirrors backend/db/schema.postgres.sql closely enough that moving to
// Postgres/MySQL in production only requires swapping the driver + running
// schema.postgres.sql (or an equivalent migration) — application code talks
// to the `db` object via plain SQL, not SQLite-specific syntax where avoidable.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'ktec.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_code TEXT UNIQUE NOT NULL,
  qualification TEXT,
  dob TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designation TEXT,
  specialization TEXT,
  joined_on TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS course_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  category_id INTEGER REFERENCES course_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  overview TEXT,
  duration TEXT,
  fees REAL,
  eligibility TEXT,
  skills_learned TEXT,
  career_opportunities TEXT,
  tools_covered TEXT,
  certificate_info TEXT,
  image_url TEXT,
  brochure_url TEXT,
  is_published INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS course_faqs (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  trainer_id TEXT REFERENCES staff(id),
  batch_code TEXT UNIQUE NOT NULL,
  start_date TEXT,
  end_date TEXT,
  timing TEXT,
  mode TEXT DEFAULT 'offline',
  capacity INTEGER,
  status TEXT DEFAULT 'upcoming',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  enrolled_on TEXT DEFAULT (date('now')),
  progress_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  UNIQUE (student_id, course_id, batch_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_date TEXT NOT NULL,
  status TEXT NOT NULL,
  marked_by TEXT REFERENCES staff(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (batch_id, student_id, session_date)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  course_id TEXT REFERENCES courses(id),
  qualification TEXT,
  preferred_batch TEXT,
  preferred_mode TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  follow_up_notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admissions (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT REFERENCES enquiries(id),
  student_id TEXT REFERENCES students(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  admission_date TEXT DEFAULT (date('now')),
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_materials (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  issued_date TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'issued',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT REFERENCES courses(id),
  discount_text TEXT,
  banner_image_url TEXT,
  valid_from TEXT,
  valid_until TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id),
  review TEXT NOT NULL,
  photo_url TEXT,
  is_published INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT DEFAULT 'all',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// Seed roles once.
const roleCount = db.prepare('SELECT COUNT(*) AS c FROM roles').get().c;
if (roleCount === 0) {
  const insertRole = db.prepare('INSERT INTO roles (name) VALUES (?)');
  ['admin', 'staff', 'student'].forEach((r) => insertRole.run(r));
}

module.exports = db;
