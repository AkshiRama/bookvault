// Serverless entry point for Vercel.
// Imports the configured Express app and exports it as the default handler.
// Vercel's @vercel/node runtime will invoke this on every incoming request.

require('dotenv').config();
const app = require('../server');

module.exports = app;
