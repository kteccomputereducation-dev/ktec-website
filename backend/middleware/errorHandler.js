// Wrap async route handlers so thrown errors reach the error middleware
// instead of crashing the process or leaving a hung request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'The requested resource was not found.' });
}

// Must be registered LAST, after all routes.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (!isProd) {
    // Full detail in dev logs only — never sent to the client.
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  const message =
    statusCode < 500
      ? err.message || 'Invalid request.'
      : 'Something went wrong. Please try again.';

  res.status(statusCode).json({ success: false, message });
}

module.exports = { asyncHandler, ApiError, notFoundHandler, errorHandler };
