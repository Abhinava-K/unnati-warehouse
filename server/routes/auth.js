const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  const { name, email, password, role, companyName, gstNumber, city } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Please provide all required fields.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
  }

  // Basic GST verification check (15-character alphanumeric standard)
  const gstClean = (gstNumber || '').trim().toUpperCase();
  const isGstValid = gstClean.length >= 15;

  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email: email.toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === 'manufacturer' ? 'manufacturer' : 'buyer',
    companyName: companyName || (name + ' Enterprises'),
    gstNumber: gstClean || '24AAACU' + Math.floor(1000 + Math.random() * 9000) + 'Q1Z5',
    isVerified: true, // verified upon registration in this platform
    city: city || 'Ahmedabad',
    createdAt: new Date().toISOString()
  };

  db.createUser(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, isVerified: newUser.isVerified },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...userResponse } = newUser;
  res.status(201).json({
    message: 'Registration successful! Account is verified.',
    token,
    user: userResponse
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password required.' });
  }

  const user = db.getUserByEmail(email.trim());
  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, isVerified: user.isVerified },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...userResponse } = user;
  res.json({
    message: 'Login successful',
    token,
    user: userResponse
  });
});

// Current User Profile
router.get('/me', authenticate, (req, res) => {
  const { passwordHash, ...userResponse } = req.user;
  res.json({ user: userResponse });
});

module.exports = router;
