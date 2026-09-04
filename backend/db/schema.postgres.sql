-- =====================================================================
-- K TEC COMPUTER EDUCATION - PRODUCTION SCHEMA (PostgreSQL)
-- =====================================================================
-- This is the reference schema for production deployment (PostgreSQL 14+).
-- The dev environment uses an equivalent SQLite schema, auto-created by
-- db/init.js, so you can run the whole app locally with zero setup.
-- When you deploy, point DATABASE_URL at a managed Postgres instance and
-- run this file once (or adapt to a migration tool such as Prisma/Knex).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- USERS & ROLES (shared login table for admin / staff / student)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('admin','staff','student'))
);
INSERT INTO roles (name) VALUES ('admin'), ('staff'), ('student');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ -- soft delete
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Extended student profile (1:1 with users where role = student)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. KTEC-2026-0001
  qualification VARCHAR(150),
  dob DATE,
  address TEXT,
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(20),
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','completed','dropped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extended staff/trainer profile (1:1 with users where role = staff)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designation VARCHAR(100),
  specialization VARCHAR(200),
  joined_on DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- COURSES
-- ---------------------------------------------------------------------
CREATE TABLE course_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INTEGER REFERENCES course_categories(id),
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  short_description TEXT,
  overview TEXT,
  duration VARCHAR(50),          -- e.g. "3 Months"
  fees NUMERIC(10,2),            -- editable from admin; nullable = "Contact for fees"
  eligibility TEXT,
  skills_learned TEXT,           -- newline / JSON list
  career_opportunities TEXT,
  tools_covered TEXT,
  certificate_info TEXT,
  image_url TEXT,
  brochure_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category_id);

CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE course_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  question VARCHAR(300) NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------------
-- BATCHES & ENROLLMENTS
-- ---------------------------------------------------------------------
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  trainer_id UUID REFERENCES staff(id),
  batch_code VARCHAR(50) UNIQUE NOT NULL,
  start_date DATE,
  end_date DATE,
  timing VARCHAR(100),          -- e.g. "Mon-Fri, 10am-12pm"
  mode VARCHAR(20) DEFAULT 'offline' CHECK (mode IN ('offline','online','hybrid')),
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  batch_id UUID REFERENCES batches(id),
  enrolled_on DATE DEFAULT CURRENT_DATE,
  progress_percent INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','dropped')),
  UNIQUE (student_id, course_id, batch_id)
);

-- ---------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present','absent','late')),
  marked_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (batch_id, student_id, session_date)
);

-- ---------------------------------------------------------------------
-- ENQUIRIES & ADMISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  course_id UUID REFERENCES courses(id),
  qualification VARCHAR(150),
  preferred_batch VARCHAR(100),
  preferred_mode VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new','contacted','follow_up','converted','closed')),
  follow_up_notes TEXT,
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_enquiries_status ON enquiries(status);

CREATE TABLE admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id),
  student_id UUID REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  batch_id UUID REFERENCES batches(id),
  admission_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- STUDY MATERIALS
-- ---------------------------------------------------------------------
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  title VARCHAR(200) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20), -- pdf, video, doc, note
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- CERTIFICATES
-- ---------------------------------------------------------------------
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  issued_date DATE NOT NULL,
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued','revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_cert_number ON certificates(certificate_number);

-- ---------------------------------------------------------------------
-- OFFERS
-- ---------------------------------------------------------------------
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id),
  discount_text VARCHAR(100),   -- e.g. "20% OFF" or "Flat ₹1000 off"
  banner_image_url TEXT,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- GALLERY
-- ---------------------------------------------------------------------
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- classroom, lab, events, workshops, activities, certificates, competitions
  image_url TEXT NOT NULL,
  caption VARCHAR(200),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(150) NOT NULL,
  course_id UUID REFERENCES courses(id),
  review TEXT NOT NULL,
  photo_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(20) DEFAULT 'all' CHECK (audience IN ('all','students','staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- SETTINGS (single-row key/value site configuration)
-- ---------------------------------------------------------------------
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (internal admin/staff notifications, e.g. new enquiry)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- null = broadcast to all admins
  title VARCHAR(200) NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
