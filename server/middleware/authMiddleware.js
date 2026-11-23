const jwt = require('jsonwebtoken');
const db = require('../data/db');

const JWT_SECRET = process.env.JWT_SECRET || 'unnati_b2b_secret_key_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Authentication required. Please log in with a verified account.'
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

function requireVerified(req, res, next) {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      error: 'VERIFICATION_REQUIRED',
      message: 'Access restricted: Account verification required.'
    });
  }
  next();
}

// Allows Producer / Mill Supplier OR Admin to post and manage catalog goods!
function requireProducerOrAdmin(req, res, next) {
  const role = req.user?.role;
  if (role !== 'producer' && role !== 'manufacturer' && role !== 'admin') {
    return res.status(403).json({
      error: 'PRODUCER_ONLY',
      message: 'Only registered Mill Producers or Platform Admins can publish goods into the catalogue.'
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'ADMIN_ONLY',
      message: 'Access restricted to Platform Administrators only.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireVerified,
  requireProducerOrAdmin,
  requireAdmin,
  JWT_SECRET
};
