// Idempotent seed script — safe to run multiple times.
// Usage: npm run seed
require('dotenv').config();
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('./init');

function upsertSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, value);
}

// ---- Site settings ------------------------------------------------------
const defaultSettings = {
  institute_name: 'K TEC COMPUTER EDUCATION',
  tagline: 'Build Your Skills. Shape Your Career.',
  address_line: 'Opposite to NLC Arch Gate, Neyveli, Tamil Nadu, India',
  phone: '', // fill in real number in Admin > Settings
  whatsapp_number: '', // fill in real number in Admin > Settings (no + or spaces, e.g. 919999999999)
  email: '',
  google_maps_link: '',
  working_hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  google_business_url: '',
  website_title: 'K TEC Computer Education – Neyveli | Computer & CAD Training Institute',
  seo_description:
    'K TEC Computer Education, Neyveli — ISO certified computer institute offering programming, Tally, CAD/engineering software and professional IT courses with 100% practical training and placement assistance.',
  founder_name: 'Kaviyarasan G, B.E., MBA',
  founder_title: 'Founder / Head of Institution',
};
Object.entries(defaultSettings).forEach(([k, v]) => upsertSetting(k, v));

// ---- Default admin user --------------------------------------------------
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ktec.local';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123';
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const adminRoleId = db.prepare("SELECT id FROM roles WHERE name = 'admin'").get().id;
  db.prepare(
    `INSERT INTO users (id, full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?,?)`
  ).run(uuid(), 'K TEC Admin', adminEmail, '', bcrypt.hashSync(adminPassword, 10), adminRoleId);
  console.log(`Seeded admin user -> email: ${adminEmail}  password: ${adminPassword}`);
  console.log('IMPORTANT: change this password immediately after first login.');
} else {
  console.log('Admin user already exists, skipping.');
}

// ---- Course categories ---------------------------------------------------
const categories = [
  ['Computer Fundamentals', 'computer-fundamentals'],
  ['Programming', 'programming'],
  ['Accounting', 'accounting'],
  ['Design & Creative', 'design-creative'],
  ['CAD / Engineering Software', 'cad-engineering'],
  ['Professional / IT', 'professional-it'],
];
const catStmt = db.prepare(
  'INSERT INTO course_categories (name, slug, display_order) VALUES (?,?,?) ON CONFLICT(slug) DO NOTHING'
);
categories.forEach(([name, slug], i) => catStmt.run(name, slug, i));

function categoryId(slug) {
  return db.prepare('SELECT id FROM course_categories WHERE slug = ?').get(slug).id;
}

// ---- Sample courses (fees/duration are placeholders — edit in Admin) ----
const sampleCourses = [
  {
    category: 'computer-fundamentals',
    title: 'Basic Computer Course',
    slug: 'basic-computer-course',
    short: 'Foundational computer literacy for absolute beginners.',
    duration: '1 Month',
    fees: null,
  },
  {
    category: 'programming',
    title: 'Python Programming',
    slug: 'python-programming',
    short: 'Learn programming fundamentals and build real projects in Python.',
    duration: '2 Months',
    fees: null,
  },
  {
    category: 'accounting',
    title: 'Tally with GST',
    slug: 'tally-with-gst',
    short: 'Practical accounting and GST-compliant billing using Tally.',
    duration: '1.5 Months',
    fees: null,
  },
  {
    category: 'cad-engineering',
    title: 'AutoCAD (2D & 3D)',
    slug: 'autocad-2d-3d',
    short: 'Industry-standard drafting and design software for engineering and architecture.',
    duration: '2 Months',
    fees: null,
  },
  {
    category: 'design-creative',
    title: 'Graphic Designing',
    slug: 'graphic-designing',
    short: 'Visual design fundamentals with industry-standard creative tools.',
    duration: '2 Months',
    fees: null,
  },
  {
    category: 'professional-it',
    title: 'SAP',
    slug: 'sap-training',
    short: 'Enterprise resource planning training for career-focused professionals.',
    duration: '3 Months',
    fees: null,
  },
];

const courseStmt = db.prepare(
  `INSERT INTO courses (id, category_id, title, slug, short_description, duration, fees, is_published, display_order)
   VALUES (?,?,?,?,?,?,?,1,?)
   ON CONFLICT(slug) DO NOTHING`
);
sampleCourses.forEach((c, i) => {
  courseStmt.run(uuid(), categoryId(c.category), c.title, c.slug, c.short, c.duration, c.fees, i);
});

console.log('Seed complete.');
