const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subfolder)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = crypto.randomBytes(16).toString('hex') + ext;
      cb(null, safeName);
    },
  });
}

function imageFileFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'));
  }
  cb(null, true);
}

function documentFileFilter(req, file, cb) {
  if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    return cb(new Error('Only PDF or image files are allowed.'));
  }
  cb(null, true);
}

const uploadCourseImage = multer({
  storage: makeStorage('course-images'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadGalleryImage = multer({
  storage: makeStorage('gallery'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadOfferBanner = multer({
  storage: makeStorage('offers'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMaterial = multer({
  storage: makeStorage('materials'),
  fileFilter: documentFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = { uploadCourseImage, uploadGalleryImage, uploadOfferBanner, uploadMaterial };
