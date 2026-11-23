const express = require('express');
const router = express.Router();

let subscribers = [
  { email: "buyer@gujaratfab.com", sector: "Mild Steel", frequency: "Daily", subscribedAt: new Date().toISOString() },
  { email: "procurement@tatasteel.com", sector: "All Commodities", frequency: "Weekly", subscribedAt: new Date().toISOString() }
];

const bulletins = [
  {
    id: "bulletin_142",
    edition: "Edition #142",
    date: "November 23, 2026",
    title: "Indian Flat Steel & CRC Index: Automotive & Infrastructure Demand Outlook",
    sector: "Mild Steel",
    summary: "Domestic Cold Rolled Coil (CRC) benchmark holds steady at ₹58,500/MT ex-Ahmedabad. Blast furnace primary producers maintain firm offer prices supported by robust automotive OEM quarterly order books and rising metallurgical coking coal prices.",
    keyMetrics: [
      { label: "Prime CRC (0.8 - 2.0mm)", value: "₹ 58,500 / MT", change: "+0.8%" },
      { label: "Hot Rolled Coil E250", value: "₹ 54,200 / MT", change: "+0.5%" },
      { label: "Import Parity Landed", value: "₹ 53,800 / MT", change: "-0.2%" },
      { label: "Coking Coal (FOB Aus)", value: "$210 / MT", change: "+1.4%" }
    ],
    fullReport: "Industrial demand across northern and western manufacturing hubs demonstrated strong resilience through mid-Q4. Mill lead times for automotive CR1 grade remain extended at 18-21 days. Secondary re-rollers have adjusted billet procurement rates upward by ₹400/MT following scrap price increases in Mandi Gobindgarh. Downstream MSME fabricators are advised to cover forward requirements up to 45 days to hedge against anticipated input cost escalation in early December."
  },
  {
    id: "bulletin_141",
    edition: "Edition #141",
    date: "November 20, 2026",
    title: "Petrochemicals & Polymer Resins: PVC Import Parity & Anti-Dumping Analysis",
    sector: "Polymers & Chemicals",
    summary: "Suspension PVC Resin K-67 trades at ₹74,500/MT in western coastal hubs. DGFT anti-dumping duty inquiries on Northeast Asian shipments continue to drive higher domestic mill allocation from Reliance and Chemplast Sanmar.",
    keyMetrics: [
      { label: "Suspension PVC K-67", value: "₹ 74,500 / MT", change: "+1.2%" },
      { label: "Industrial Methanol", value: "₹ 28,400 / MT", change: "-0.4%" },
      { label: "Bitumen VG-30 (Drums)", value: "₹ 41,200 / MT", change: "+0.9%" },
      { label: "Crude Brent Benchmark", value: "$76.40 / bbl", change: "+0.6%" }
    ],
    fullReport: "Agricultural pipe extruders and construction conduit manufacturers maintained steady operating rates of 78% capacity. Domestic polymer producers have absorbed slight feedstock naphtha volatility while offering 30-day extended credit incentives for MSME processing clusters in Gujarat and Maharashtra. Port inventories at Nhava Sheva and Kandla stand at 42,000 MT, representing a healthy 14-day supply cushion."
  },
  {
    id: "bulletin_140",
    edition: "Edition #140",
    date: "November 16, 2026",
    title: "National 3PL Warehousing & Multi-Modal Freight: Rail vs Road Logistics",
    sector: "Logistics & Warehousing",
    summary: "Average secondary freight costs for industrial steel and polymers stabilized at ₹1,450/MT across 500km transit zones. Western Dedicated Freight Corridor (DFC) operations recorded a 14% improvement in container rake turnaround times.",
    keyMetrics: [
      { label: "Avg Road Freight (500km)", value: "₹ 1,450 / MT", change: "-1.1%" },
      { label: "Rail Rake Container", value: "₹ 1,120 / MT", change: "-2.3%" },
      { label: "Cold Storage Index", value: "₹ 28,000 / mo", change: "0.0%" },
      { label: "Diesel Commercial Ex-Mum", value: "₹ 89.60 / L", change: "0.0%" }
    ],
    fullReport: "Multi-modal hub integrations at Ahmedabad, Pune, and Concor terminals have significantly reduced transit loss and demurrage penalties for bulk metal and resin consignments. 3PL warehousing capacity utilization across Tier-1 logistics parks reached 86%, with cold chain and hazmat inventory auditing facilities seeing the highest quarterly demand."
  }
];

// Subscribe
router.post('/subscribe', (req, res) => {
  const { email, sector, frequency } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Please provide a valid corporate business email.' });
  }

  const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.sector = sector || existing.sector;
    existing.frequency = frequency || existing.frequency;
    return res.json({
      message: 'Subscription updated! You will continue receiving UNNATI Commodity Intelligence Bulletins.',
      subscriber: existing
    });
  }

  const newSub = {
    email: email.toLowerCase().trim(),
    sector: sector || 'All Commodities',
    frequency: frequency || 'Daily',
    subscribedAt: new Date().toISOString()
  };
  subscribers.push(newSub);

  res.status(201).json({
    message: 'Successfully subscribed to UNNATI Daily Commodity & Market Price Intelligence!',
    subscriber: newSub
  });
});

// Get Bulletins
router.get('/bulletins', (req, res) => {
  res.json({ bulletins });
});

module.exports = router;
