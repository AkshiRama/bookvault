const mongoose = require('mongoose');

// Cache the connection promise so serverless warm invocations reuse the
// existing connection instead of opening a new one on every request.
let connectionPromise = null;

const connectDB = async () => {
  // Return the cached connection if already established
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookvault';
    const isProduction = process.env.NODE_ENV === 'production';

    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB Connected to provided URI: ' + mongoose.connection.host);
    } catch (err) {
      if (isProduction) {
        // In production (Vercel serverless), the memory server binary cannot
        // be downloaded or executed — fail fast with a clear message.
        console.error('FATAL: Could not connect to MongoDB Atlas. Ensure MONGO_URI is set correctly in Vercel environment variables.');
        console.error('Connection error:', err.message);
        throw err;
      }

      // Development fallback: spin up an embedded in-memory MongoDB
      console.warn('Could not connect to external MongoDB (' + err.message + '). Starting embedded MongoDB Memory Server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'bookvault' },
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
  })();

  return connectionPromise;
};

module.exports = { connectDB };
