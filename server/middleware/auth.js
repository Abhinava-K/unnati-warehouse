const jwt = require('jsonwebtoken');
const db = require('../data/db');

const JWT_SECRET = process.env.JWT_SECRET || 'unnati_b2b_secret_key_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Authentication required. Please log in.'
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'INVALID_USER', message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Session expired or invalid token.' });
  }
}

// Enforce verified status
function requireVerified(req, res, next) {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Access restricted: Your account must be verified by GST/KYC to perform this action.'
    });
  }
  next();
}

// Enforce manufacturer role
function requireManufacturer(req, res, next) {
  if (!req.user || req.user.role !== 'manufacturer') {
    return res.status(403).json({
      error: 'MANUFACTURER_ONLY',
      message: 'Only registered manufacturers and producers can post products and set prices.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireVerified,
  requireManufacturer,
  JWT_SECRET
};
