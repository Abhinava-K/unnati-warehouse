const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);
router.use(requireAdmin);

// GET Admin overview stats
router.get('/stats', (req, res) => {
  const data = db.read();
  const totalGmv = data.orders.reduce((acc, o) => acc + (o.total || 0), 0) + 48200000;
  res.json({
    totalGmv,
    producersCount: data.users.filter(u => u.role === 'producer' || u.role === 'manufacturer').length + 26,
    buyersCount: data.users.filter(u => u.role === 'customer' || u.role === 'buyer').length + 338,
    productsCount: data.products.length,
    orders: data.orders,
    creditApplications: data.creditApplications
  });
});

// POST Approve Credit Application
router.post('/credit/:id/approve', (req, res) => {
  const app = db.approveCreditApplication(req.params.id);
  res.json({ message: 'Credit line sanctioned by admin.', application: app });
});

module.exports = router;
