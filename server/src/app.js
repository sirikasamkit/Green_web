const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');
const { db } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable ETag for cache validation
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

// Top-level Health Check for Cloud Platforms (Render, AWS, Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auto-unregister any stale service workers from previous projects on port 5000
app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send('self.addEventListener("install", () => self.skipWaiting()); self.addEventListener("activate", () => self.clients.claim()); self.registration.unregister();');
});

// Static files for screenshots with 1-year immutable caching
app.use(
  '/screenshots',
  express.static(path.join(__dirname, '../public/screenshots'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
  })
);

// REST API Routes
app.use('/api', apiRoutes);

// Frontend Client Static Files (Single-Port Full-Stack Hosting)
const clientDistPath = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  // Serve static assets from built React frontend
  app.use(express.static(clientDistPath, {
    maxAge: '1h',
    etag: true
  }));

  // SPA fallback: return index.html for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/screenshots') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback if client hasn't been built yet
  app.get('/', (req, res) => {
    res.json({
      message: '🌿 Green Web Analyzer API is running',
      version: '1.0.0',
      hint: 'Run "npm run build" in the /client directory to serve the full UI at this port.',
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
}

// 404 Handler for unhandled API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start Server on 0.0.0.0 for universal cloud & local routing
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Green Web Analyzer Full-Stack App running on http://0.0.0.0:${PORT}`);
  console.log(`🌿 Carbon Engine & Frontend UI ready on port ${PORT}`);
});

module.exports = app;
