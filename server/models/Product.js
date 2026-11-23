const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  sku: { type: String, required: true },
  city: { type: String, required: true },
  manufacturerId: { type: String, required: true },
  manufacturerName: { type: String, required: true },
  isVerifiedSeller: { type: Boolean, default: true },
  pricePerTon: { type: Number, required: true },
  moqTons: { type: Number, required: true, default: 10 },
  stockTons: { type: Number, required: true, default: 100 },
  unit: { type: String, default: 'Metric Ton' },
  specifications: { type: Map, of: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
