require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { runSeed } = require('./seedData');

const seed = async () => {
  try {
    await connectDB();
    await runSeed();
    console.log('Seed executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed execution failed:', err);
    process.exit(1);
  }
};

seed();
