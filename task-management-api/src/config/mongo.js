const mongoose = require('mongoose');

let connected = false;

async function connectMongo() {
  if (connected) return;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri);
  connected = true;
}

module.exports = { connectMongo };
