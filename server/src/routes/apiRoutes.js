const express = require('express');
const router = express.Router();

const { scanUrl, getScanById } = require('../controllers/scanController');
const { getAllScans, deleteScan, compareScans, getStats } = require('../controllers/historyController');

// Scan Endpoints
router.post('/scan', scanUrl);
router.get('/scans/:id', getScanById);

// History & Compare Endpoints
router.get('/scans', getAllScans);
router.delete('/scans/:id', deleteScan);
router.post('/compare', compareScans);

// Overall Analytics / Stats
router.get('/stats', getStats);

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Green Web Analyzer API'
  });
});

module.exports = router;
