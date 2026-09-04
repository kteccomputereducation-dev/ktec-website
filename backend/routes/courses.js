const express = require('express');
const { body, param } = require('express-validator');
const { v4: uuid } = require('uuid');
const db = require('../db/init');
const validate = require('../middleware/validate');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadCourseImage } = require('../middleware/upload');

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// GET /api/courses  (public — published only, unless ?all=1 with admin auth)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug
         FROM courses c LEFT JOIN course_categories cat ON cat.id = c.category_id
         WHERE c.is_published = 1 AND c.deleted_at IS NULL
         ORDER BY cat.display_order, c.display_order, c.title`
      )
      .all();
    res.json({ success: true, courses: rows });
  })
);

// GET /api/courses/categories (public)
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT * FROM course_categories ORDER BY display_order').all();
    res.json({ success: true, categories: rows });
  })
);

// GET /api/courses/:slug (public — course detail incl. modules + FAQs)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const course = db
      .prepare('SELECT * FROM courses WHERE slug = ? AND deleted_at IS NULL')
      .get(req.params.slug);
    if (!course || (!course.is_published && !(req.user && req.user.role === 'admin'))) {
      throw new ApiError(404, 'Course not found.');
    }
    const modules = db
      .prepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY display_order')
      .all(course.id);
    const faqs = db
      .prepare('SELECT * FROM course_faqs WHERE course_id = ? ORDER BY display_order')
      .all(course.id);
    res.json({ success: true, course, modules, faqs });
  })
);

// ---- Admin-only management ------------------------------------------------

// GET /api/courses/admin/all — includes unpublished + soft-deleted-excluded
router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT c.*, cat.name AS category_name
         FROM courses c LEFT JOIN course_categories cat ON cat.id = c.category_id
         WHERE c.deleted_at IS NULL ORDER BY c.created_at DESC`
      )
      .all();
    res.json({ success: true, courses: rows });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Course title is required.'),
    body('category_id').optional({ nullable: true }).isInt(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const {
      title,
      category_id,
      short_description,
      overview,
      duration,
      fees,
      eligibility,
      skills_learned,
      career_opportunities,
      tools_covered,
      certificate_info,
      is_published,
    } = req.body;

    let slug = slugify(title);
    const existing = db.prepare('SELECT id FROM courses WHERE slug = ?').get(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const id = uuid();
    db.prepare(
      `INSERT INTO courses
        (id, category_id, title, slug, short_description, overview, duration, fees, eligibility,
         skills_learned, career_opportunities, tools_covered, certificate_info, is_published)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id,
      category_id || null,
      title,
      slug,
      short_description || '',
      overview || '',
      duration || '',
      fees || null,
      eligibility || '',
      skills_learned || '',
      career_opportunities || '',
      tools_covered || '',
      certificate_info || '',
      is_published ? 1 : 0
    );
    res.status(201).json({ success: true, message: 'Course created.', courseId: id, slug });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found.');

    const fields = [
      'category_id',
      'title',
      'short_description',
      'overview',
      'duration',
      'fees',
      'eligibility',
      'skills_learned',
      'career_opportunities',
      'tools_covered',
      'certificate_info',
      'is_published',
      'display_order',
    ];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(f === 'is_published' ? (req.body[f] ? 1 : 0) : req.body[f]);
      }
    });
    if (updates.length === 0) throw new ApiError(400, 'No fields to update.');
    updates.push("updated_at = datetime('now')");
    values.push(req.params.id);
    db.prepare(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    res.json({ success: true, message: 'Course updated.' });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = db
      .prepare("UPDATE courses SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
      .run(req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Course not found.');
    res.json({ success: true, message: 'Course deleted.' });
  })
);

router.patch(
  '/:id/publish',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { publish } = req.body;
    const result = db
      .prepare('UPDATE courses SET is_published = ? WHERE id = ?')
      .run(publish ? 1 : 0, req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Course not found.');
    res.json({ success: true, message: publish ? 'Course published.' : 'Course unpublished.' });
  })
);

router.post(
  '/:id/image',
  requireAuth,
  requireRole('admin'),
  uploadCourseImage.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No image uploaded.');
    const imageUrl = `/uploads/course-images/${req.file.filename}`;
    const result = db.prepare('UPDATE courses SET image_url = ? WHERE id = ?').run(imageUrl, req.params.id);
    if (result.changes === 0) throw new ApiError(404, 'Course not found.');
    res.json({ success: true, message: 'Image uploaded.', imageUrl });
  })
);

// ---- Course modules & FAQs (admin) ---------------------------------------

router.post(
  '/:id/modules',
  requireAuth,
  requireRole('admin'),
  [body('title').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const id = uuid();
    db.prepare(
      `INSERT INTO course_modules (id, course_id, title, description, display_order) VALUES (?,?,?,?,?)`
    ).run(id, req.params.id, req.body.title, req.body.description || '', req.body.display_order || 0);
    res.status(201).json({ success: true, message: 'Module added.', id });
  })
);

router.post(
  '/:id/faqs',
  requireAuth,
  requireRole('admin'),
  [body('question').trim().notEmpty(), body('answer').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const id = uuid();
    db.prepare(
      `INSERT INTO course_faqs (id, course_id, question, answer, display_order) VALUES (?,?,?,?,?)`
    ).run(id, req.params.id, req.body.question, req.body.answer, req.body.display_order || 0);
    res.status(201).json({ success: true, message: 'FAQ added.', id });
  })
);

module.exports = router;
