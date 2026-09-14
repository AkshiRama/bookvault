require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// CORS — in production, restrict to the deployed frontend origin.
// Set CLIENT_URL in your server environment variables.
// In development (no CLIENT_URL set), allow localhost:5173.
// ---------------------------------------------------------------------------
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/librarians', require('./routes/librarianRoutes'));
app.use('/api/borrowings', require('./routes/borrowingRoutes'));
app.use('/api/member', require('./routes/memberPortalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// ---------------------------------------------------------------------------
// Same-host production: serve the React build from ../client/dist
// This lets you run a single Railway/Render dyno that handles both API and UI.
// Only activated when NODE_ENV=production AND the dist folder exists.
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  const fs = require('fs');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback — return index.html for any non-API route
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // No dist folder — API-only mode (frontend deployed separately, e.g. Vercel)
    app.use('*', (req, res) => {
      res.status(404).json({ success: false, message: 'API route not found: ' + req.originalUrl });
    });
  }
} else {
  // Development: 404 handler for unknown API routes
  app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found: ' + req.originalUrl });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Start Server
// In a serverless environment (Vercel), VERCEL=1 is set automatically.
// We skip app.listen() there — the exported app is called directly per request.
// We still connect to the DB eagerly to avoid cold-start latency on first request.
// ---------------------------------------------------------------------------
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ BookVault Server [${process.env.NODE_ENV || 'development'}] running on port ${PORT}`);
  });
};

if (!process.env.VERCEL) {
  // Local development / traditional Node host — start the HTTP server normally
  startServer();
} else {
  // Vercel serverless — connect to DB on module load (warm invocations reuse the cached promise)
  connectDB().catch((err) => {
    console.error('DB connection failed on serverless boot:', err.message);
  });
}

module.exports = app;

