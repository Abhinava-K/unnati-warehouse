const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticate, requireVerified, requireProducerOrAdmin } = require('../middleware/authMiddleware');

// GET /api/products
router.get('/', (req, res) => {
  const { category, subcategory, sku, city, search, manufacturerId } = req.query;
  const products = db.getProducts({ category, subcategory, sku, city, search, manufacturerId });
  res.json({ products, count: products.length });
});

// POST /api/products (Producer or Admin only)
router.post('/', authenticate, requireVerified, requireProducerOrAdmin, (req, res) => {
  const { title, category, subcategory, sku, city, pricePerTon, moqTons, stockTons, unit, specifications, image } = req.body;

  if (!title || !category || !pricePerTon || !moqTons) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Title, Category, Price, and MOQ are required.' });
  }

  const newProduct = {
    id: 'prod_' + Date.now(),
    title,
    category,
    subcategory: subcategory || 'Flat Products',
    sku: sku || 'Standard Grade',
    city: city || req.user.city || 'Ahmedabad',
    manufacturerId: req.user.id,
    manufacturerName: req.user.companyName,
    isVerifiedSeller: true,
    pricePerTon: Number(pricePerTon),
    moqTons: Number(moqTons),
    stockTons: Number(stockTons) || 100,
    unit: unit || 'Metric Ton',
    specifications: specifications || { "Standards": "IS / ASTM Certified" },
    image: image || "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString()
  };

  db.addProduct(newProduct);
  res.status(201).json({ message: 'Goods uploaded successfully to the catalogue!', product: newProduct });
});

// DELETE /api/products/:id (Producer or Admin)
router.delete('/:id', authenticate, requireVerified, requireProducerOrAdmin, (req, res) => {
  db.deleteProduct(req.params.id);
  res.json({ message: 'Product listing removed from catalogue.' });
});

module.exports = router;
