const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticate, requireVerified } = require('../middleware/authMiddleware');

// Middleware: allow guest prototype fallback or authenticated user
router.get('/', (req, res) => {
  const authHeader = req.headers['authorization'];
  let userId = 'prototype_default';

  if (authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/authMiddleware');
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  const items = db.getCart(userId);
  res.json({ items });
});

// POST Add to Cart
router.post('/add', authenticate, requireVerified, (req, res) => {
  const { item } = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'INVALID_ITEM', message: 'Item details required.' });
  }

  const cartItem = {
    ...item,
    quantity: Number(item.quantity) || 1,
    addedAt: new Date().toISOString()
  };

  const updatedCart = db.addToCart(req.user.id, cartItem);
  res.json({ message: 'Item added to cart', items: updatedCart });
});

// PUT Update Quantity
router.put('/quantity', authenticate, requireVerified, (req, res) => {
  const { itemId, delta } = req.body;
  const updatedCart = db.updateCartQuantity(req.user.id, itemId, delta || 1);
  res.json({ message: 'Quantity updated', items: updatedCart });
});

// DELETE Remove item
router.delete('/:itemId', authenticate, requireVerified, (req, res) => {
  const updatedCart = db.removeFromCart(req.user.id, req.params.itemId);
  res.json({ message: 'Item removed', items: updatedCart });
});

// POST Checkout
router.post('/checkout', authenticate, requireVerified, (req, res) => {
  const { paymentMethod } = req.body;
  const items = db.getCart(req.user.id);

  if (!items.length) {
    return res.status(400).json({ error: 'EMPTY_CART', message: 'Your cart is empty.' });
  }

  const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const gst = Math.round(subtotal * 0.18);
  const freight = items.some(i => i.type === 'product') ? 15000 : 0;
  const total = subtotal + gst + freight;

  const order = {
    id: 'ORD_' + Math.floor(100000 + Math.random() * 900000),
    userId: req.user.id,
    buyerName: req.user.name,
    companyName: req.user.companyName,
    gstNumber: req.user.gstNumber,
    items,
    subtotal,
    gst,
    freight,
    total,
    paymentMethod: paymentMethod || 'direct',
    paymentStatus: paymentMethod === '30_day_credit' ? 'FINANCED_VIA_CREDIT_LINE' : 'PAID',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  db.createOrder(order);
  db.clearCart(req.user.id);

  res.status(201).json({
    message: 'Order successfully confirmed & dispatched!',
    order
  });
});

module.exports = router;
