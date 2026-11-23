const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticate, requireVerified } = require('../middleware/auth');

// GET providers list and facilities
router.get('/facilities', (req, res) => {
  const data = db.read();
  res.json({
    facilities: ["Cold Storage", "Drop Shipping", "Inventory Check", "Customize Facilities"],
    providers: data.warehousingProviders,
    cities: data.cities
  });
});

// Calculate fee
router.post('/estimate', (req, res) => {
  const { facility, city, provider } = req.body;
  const data = db.read();
  const match = data.warehousingProviders.find(p =>
    p.facility === facility &&
    (provider ? p.provider === provider : true) &&
    p.cities.includes(city)
  );

  const fee = match ? match.baseFeePerMonth : 20000;
  res.json({ fee, provider: match ? match.provider : 'UNNATI Logistics Partner' });
});

module.exports = router;
