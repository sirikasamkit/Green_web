const dns = require('dns').promises;
const crypto = require('crypto');
const { scanWebsite } = require('../services/scanner');
const { calculateCarbonMetrics } = require('../services/carbonEngine');
const { generateAuditRecommendations } = require('../services/auditRules');
const { dbAsync } = require('../models/db');

/**
 * Handle new website scan
 */
async function scanUrl(req, res) {
  try {
    const { url, device = 'desktop', monthlyViews = 10000 } = req.body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: 'Please enter a valid website URL.' });
    }

    let cleanUrl = url.trim();

    // Auto-complete casual names (e.g. "youtube", "roblox", "apple")
    if (!cleanUrl.includes('.') && !cleanUrl.includes('localhost')) {
      cleanUrl = `https://www.${cleanUrl.toLowerCase()}.com`;
    } else if (cleanUrl.toLowerCase().startsWith('www.') && cleanUrl.split('.').length === 2) {
      cleanUrl = `https://${cleanUrl.toLowerCase()}.com`;
    } else if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Extract domain and verify DNS resolution
    const domain = cleanUrl.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];
    if (!domain.includes('localhost') && !domain.includes('127.0.0.1')) {
      try {
        await dns.lookup(domain);
      } catch (dnsErr) {
        return res.status(400).json({
          error: `ไม่สามารถเข้าถึงเว็บไซต์ "${domain}" ได้ (DNS Error: NXDOMAIN ไม่พบโดเมนนี้ในโลกอินเทอร์เน็ต)`
        });
      }
    }

    console.log(`🔍 [SCAN INITIATED] URL: ${cleanUrl} | Device: ${device}`);

    // 1. Scan website with Puppeteer / HTTP fallback
    const scanData = await scanWebsite(cleanUrl, device);

    // 2. Compute Carbon Metrics
    const carbonMetrics = calculateCarbonMetrics(
      scanData.pageSizeBytes,
      scanData.isGreenHost,
      monthlyViews
    );

    // 3. Generate Audit Recommendations
    const recommendations = generateAuditRecommendations({
      ...scanData,
      carbonMetrics
    });

    const scanId = crypto.randomUUID();

    // 4. Save to SQLite Database
    const insertSql = `
      INSERT INTO scans (
        id, url, domain, title, carbon_grams, grade, cleaner_than_pct,
        page_size_bytes, requests_count, load_time_ms, ttfb_ms, dom_elements,
        is_green_host, green_host_info, resource_breakdown, carbon_equivalencies,
        recommendations, screenshot_url, device_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const params = [
      scanId,
      scanData.url,
      scanData.domain,
      scanData.title || scanData.domain,
      carbonMetrics.carbon_grams,
      carbonMetrics.grade,
      carbonMetrics.cleaner_than_pct,
      scanData.pageSizeBytes,
      scanData.requestsCount,
      scanData.loadTimeMs,
      scanData.ttfbMs,
      scanData.domElements,
      scanData.isGreenHost ? 1 : 0,
      JSON.stringify(scanData.greenHostInfo || {}),
      JSON.stringify(scanData.resourceBreakdown || {}),
      JSON.stringify(carbonMetrics.equivalencies || {}),
      JSON.stringify(recommendations || []),
      scanData.screenshotUrl,
      scanData.deviceType
    ];

    try {
      await dbAsync.run(insertSql, params);
    } catch (dbErr) {
      console.warn('⚠️ SQLite insert notice:', dbErr.message);
    }

    console.log(`✅ [SCAN SUCCESS] ${scanData.domain} -> ${carbonMetrics.grade} (${carbonMetrics.carbon_grams}g CO2e)`);

    return res.status(201).json({
      success: true,
      data: {
        id: scanId,
        url: scanData.url,
        domain: scanData.domain,
        title: scanData.title,
        carbon_grams: carbonMetrics.carbon_grams,
        carbon_first_visit: carbonMetrics.carbon_first_visit,
        carbon_return_visit: carbonMetrics.carbon_return_visit,
        grade: carbonMetrics.grade,
        grade_label: carbonMetrics.grade_label,
        grade_color: carbonMetrics.grade_color,
        score_rating: carbonMetrics.score_rating,
        cleaner_than_pct: carbonMetrics.cleaner_than_pct,
        page_size_bytes: scanData.pageSizeBytes,
        requests_count: scanData.requestsCount,
        load_time_ms: scanData.loadTimeMs,
        ttfb_ms: scanData.ttfbMs,
        dom_elements: scanData.domElements,
        is_green_host: scanData.isGreenHost,
        green_host_info: scanData.greenHostInfo,
        resource_breakdown: scanData.resourceBreakdown,
        equivalencies: carbonMetrics.equivalencies,
        recommendations,
        screenshot_url: scanData.screenshotUrl,
        device_type: scanData.deviceType,
        created_at: scanData.scannedAt
      }
    });

  } catch (error) {
    console.error('❌ Scan error:', error);
    return res.status(500).json({
      error: 'Unable to scan the target website.',
      details: error.message
    });
  }
}

/**
 * Get scan details by ID
 */
async function getScanById(req, res) {
  try {
    const { id } = req.params;
    const row = await dbAsync.get(`SELECT * FROM scans WHERE id = ?`, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }

    return res.json({
      success: true,
      data: formatScanRecord(row)
    });
  } catch (error) {
    console.error('❌ Fetch scan error:', error);
    return res.status(500).json({ error: 'Failed to retrieve scan result.' });
  }
}

/**
 * Helper to safely parse JSON columns from SQLite
 */
function formatScanRecord(row) {
  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    title: row.title,
    carbon_grams: row.carbon_grams,
    grade: row.grade,
    cleaner_than_pct: row.cleaner_than_pct,
    page_size_bytes: row.page_size_bytes,
    requests_count: row.requests_count,
    load_time_ms: row.load_time_ms,
    ttfb_ms: row.ttfb_ms,
    dom_elements: row.dom_elements,
    is_green_host: !!row.is_green_host,
    green_host_info: safeJsonParse(row.green_host_info, {}),
    resource_breakdown: safeJsonParse(row.resource_breakdown, {}),
    equivalencies: safeJsonParse(row.carbon_equivalencies, {}),
    recommendations: safeJsonParse(row.recommendations, []),
    screenshot_url: row.screenshot_url,
    device_type: row.device_type,
    created_at: row.created_at
  };
}

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

module.exports = {
  scanUrl,
  getScanById,
  formatScanRecord
};
