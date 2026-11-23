const mongoose = require('mongoose');
const dbFallback = require('../data/db');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unnati_b2b';

let isMongoConnected = false;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // fast timeout if mongo service is not running locally
    });
    isMongoConnected = true;
    console.log('MongoDB successfully connected via Mongoose.');
  } catch (err) {
    console.log('Note: Local MongoDB service not detected. Running on persistent Mongoose-compatible JSON engine.');
    isMongoConnected = false;
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getStore: () => dbFallback
};
