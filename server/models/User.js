const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'manufacturer'], default: 'buyer' },
  companyName: { type: String, required: true },
  gstNumber: { type: String, required: true, uppercase: true, trim: true },
  isVerified: { type: Boolean, default: true },
  city: { type: String, default: 'Ahmedabad' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
