const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/', (req, res) => {
  const data = db.read();
  res.json({
    categories: data.categories,
    cities: data.cities,
    popularTags: ["Aluminium Ingot", "Bitumen", "Methanol", "PVC", "Secondary TMT"],
    marketPrices: [
      { commodity: "CRC Mild Steel (IS 513)", price: "₹58,500/MT", change: "+1.2%" },
      { commodity: "Aluminium Ingot 99.7%", price: "₹2,24,000/MT", change: "+0.8%" },
      { commodity: "Bitumen VG-30", price: "₹41,200/MT", change: "-0.4%" },
      { commodity: "PVC Resin K-67", price: "₹74,500/MT", change: "+2.1%" },
      { commodity: "Secondary TMT Rebar", price: "₹47,800/MT", change: "+0.5%" },
      { commodity: "Methanol Industrial", price: "₹28,400/MT", change: "-1.1%" }
    ]
  });
});

module.exports = router;
