const { validationResult } = require('express-validator');

// Runs after an array of express-validator checks; returns a clean 400
// with the first validation problem instead of leaking express-validator's
// internal error shape straight to the client.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ success: false, message: first.msg, field: first.path });
  }
  next();
}

module.exports = validate;
