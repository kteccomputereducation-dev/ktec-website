require('dotenv').config();

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('../db/init');

const adminEmail =
  process.env.SEED_ADMIN_EMAIL || 'admin@kteccomputereducation.com';

const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminPassword || adminPassword.length < 8) {
  throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
}

// Make sure required roles exist
const roles = ['admin', 'staff', 'student'];

const insertRole = db.prepare(
  'INSERT OR IGNORE INTO roles (name) VALUES (?)'
);

roles.forEach((role) => insertRole.run(role));

const adminRole = db
  .prepare("SELECT id FROM roles WHERE name = 'admin'")
  .get();

const passwordHash = bcrypt.hashSync(adminPassword, 10);

const existingAdmin = db
  .prepare('SELECT id FROM users WHERE email = ?')
  .get(adminEmail);

if (existingAdmin) {
  db.prepare(`
    UPDATE users
    SET password_hash = ?,
        is_active = 1,
        deleted_at = NULL,
        updated_at = datetime('now')
    WHERE email = ?
  `).run(passwordHash, adminEmail);

  console.log(`Admin password reset successfully for ${adminEmail}`);
} else {
  db.prepare(`
    INSERT INTO users
    (id, full_name, email, phone, password_hash, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuid(),
    'K TEC Admin',
    adminEmail,
    '',
    passwordHash,
    adminRole.id
  );

  console.log(`Admin user created successfully: ${adminEmail}`);
}