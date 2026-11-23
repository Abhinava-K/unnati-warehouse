const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/db');

// Auto-sync uploaded KONECRANES coils hero image to client/public/images/
try {
  const userHeroImg = 'C:\\Users\\Abhinava\\.gemini\\antigravity\\brain\\dcd9844c-dc8f-41a9-ad77-64d8f743611a\\.user_uploaded\\media_1795431589951_c0f01dda.jpg';
  const destDir = path.join(__dirname, '..', 'client', 'public', 'images');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (fs.existsSync(userHeroImg)) {
    fs.copyFileSync(userHeroImg, path.join(destDir, 'hero-steel-factory.jpg'));
    fs.copyFileSync(userHeroImg, path.join(destDir, 'konecranes-coils.jpg'));
    fs.copyFileSync(userHeroImg, path.join(destDir, 'cold-rolled-coils.jpg'));
    console.log('[HERO ASSET] Successfully synced user KONECRANES coils image to client/public/images/');
  }
} catch (e) {
  console.log('[HERO ASSET] Note on asset sync:', e.message);
}

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const warehousingRoutes = require('./routes/warehousing');
const creditRoutes = require('./routes/credit');
const cartRoutes = require('./routes/cart');
const metaRoutes = require('./routes/metadata');
const adminRoutes = require('./routes/admin');
const newsletterRoutes = require('./routes/newsletter');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static asset serving for client assets
const localBrainAssets = 'C:\\Users\\Abhinava\\.gemini\\antigravity\\brain\\dcd9844c-dc8f-41a9-ad77-64d8f743611a';
if (fs.existsSync(localBrainAssets)) {
  app.use('/api/assets', express.static(localBrainAssets));
}
app.use('/images', express.static(path.join(__dirname, '..', 'client', 'public', 'images')));

// MERN REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehousing', warehousingRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/metadata', metaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    stack: 'MERN (MongoDB/Mongoose, Express, React, Node.js)',
    service: 'UNNATI B2B Platform API',
    port: PORT
  });
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  UNNATI MERN Backend is running on http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n====================================================`);
    console.error(`  [PORT CONFLICT] Port ${PORT} is already in use by an existing process.`);
    console.error(`  To free port ${PORT}, run this in PowerShell:`);
    console.error(`     Stop-Process -Name node -Force`);
    console.error(`====================================================\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
