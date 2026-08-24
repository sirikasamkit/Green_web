const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');
const { db } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable ETag for 304 cache validation
app.set('etag', 'strong');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for screenshots with 1-year immutable caching
app.use(
  '/screenshots',
  express.static(path.join(__dirname, '../public/screenshots'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
  })
);

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({
    message: '🌿 Green Web Analyzer API is running',
    version: '1.0.0',
    endpoints: {
      scan: 'POST /api/scan',
      getScan: 'GET /api/scans/:id',
      history: 'GET /api/scans',
      compare: 'POST /api/compare',
      stats: 'GET /api/stats',
      health: 'GET /api/health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Green Web Analyzer Server running at http://localhost:${PORT}`);
  console.log(`🌿 Carbon Engine & Puppeteer ready for scans.`);
});

module.exports = app;
