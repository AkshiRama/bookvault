const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookvault';
  
  try {
    // Attempt standard connection with 3s timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB Connected to provided URI: ' + mongoose.connection.host);
  } catch (err) {
    console.warn('Could not connect to external MongoDB (' + err.message + '). Starting embedded MongoDB Memory Server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: { dbName: 'bookvault' }
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log('MongoDB Memory Server running and connected at: ' + memoryUri);
    } catch (memErr) {
      console.error('Failed to initialize MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }

  // Auto-seed if database is completely empty
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Automatically triggering database seed...');
      const { runSeed } = require('../seed/seedData');
      await runSeed();
    }
  } catch (seedErr) {
    console.error('Auto-seed check error:', seedErr.message);
  }
};

module.exports = { connectDB };
