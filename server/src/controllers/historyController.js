const { dbAsync } = require('../models/db');
const { formatScanRecord } = require('./scanController');

/**
 * Get scan history with filtering, searching, and pagination
 */
async function getAllScans(req, res) {
  try {
    const {
      search = '',
      grade = '',
      greenOnly = 'false',
      sort = 'latest',
      limit = 25,
      offset = 0
    } = req.query;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      conditions.push(`(domain LIKE ? OR url LIKE ? OR title LIKE ?)`);
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (grade.trim()) {
      conditions.push(`grade = ?`);
      params.push(grade.trim().toUpperCase());
    }

    if (greenOnly === 'true' || greenOnly === '1') {
      conditions.push(`is_green_host = 1`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderByClause = 'ORDER BY created_at DESC';
    if (sort === 'cleanest') orderByClause = 'ORDER BY carbon_grams ASC';
    else if (sort === 'heaviest') orderByClause = 'ORDER BY page_size_bytes DESC';
    else if (sort === 'fastest') orderByClause = 'ORDER BY load_time_ms ASC';
    else if (sort === 'oldest') orderByClause = 'ORDER BY created_at ASC';

    const sql = `
      SELECT * FROM scans
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit) || 25, Number(offset) || 0);

    const countSql = `SELECT COUNT(*) as total FROM scans ${whereClause}`;
    const countParams = params.slice(0, -2);

    const [rows, countResult] = await Promise.all([
      dbAsync.all(sql, params),
      dbAsync.get(countSql, countParams)
    ]);

    const scans = rows.map(formatScanRecord);

    return res.json({
      success: true,
      data: scans,
      pagination: {
        total: countResult ? countResult.total : 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('❌ Fetch history error:', error);
    return res.status(500).json({ error: 'Failed to retrieve scan history.' });
  }
}

/**
 * Delete a scan record by ID
 */
async function deleteScan(req, res) {
  try {
    const { id } = req.params;
    const result = await dbAsync.run(`DELETE FROM scans WHERE id = ?`, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    return res.json({ success: true, message: 'Scan deleted successfully.' });
  } catch (error) {
    console.error('❌ Delete scan error:', error);
    return res.status(500).json({ error: 'Failed to delete scan.' });
  }
}

/**
 * Compare multiple scans side-by-side
 */
async function compareScans(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 scan IDs to compare.' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const rows = await dbAsync.all(
      `SELECT * FROM scans WHERE id IN (${placeholders}) ORDER BY carbon_grams ASC`,
      ids
    );

    if (rows.length < 2) {
      return res.status(404).json({ error: 'Not enough valid scan records found for comparison.' });
    }

    const formatted = rows.map(formatScanRecord);

    // Identify winners in each category
    const winnerCarbon = [...formatted].sort((a, b) => a.carbon_grams - b.carbon_grams)[0];
    const winnerSpeed = [...formatted].sort((a, b) => a.load_time_ms - b.load_time_ms)[0];
    const winnerSize = [...formatted].sort((a, b) => a.page_size_bytes - b.page_size_bytes)[0];

    return res.json({
      success: true,
      data: {
        scans: formatted,
        highlights: {
          cleanest: { id: winnerCarbon.id, domain: winnerCarbon.domain, carbon_grams: winnerCarbon.carbon_grams },
          fastest: { id: winnerSpeed.id, domain: winnerSpeed.domain, load_time_ms: winnerSpeed.load_time_ms },
          lightest: { id: winnerSize.id, domain: winnerSize.domain, page_size_bytes: winnerSize.page_size_bytes }
        }
      }
    });
  } catch (error) {
    console.error('❌ Compare error:', error);
    return res.status(500).json({ error: 'Failed to compare scans.' });
  }
}

/**
 * Get aggregate sustainability statistics across all scans
 */
async function getStats(req, res) {
  try {
    const totalRow = await dbAsync.get(`SELECT COUNT(*) as count, AVG(carbon_grams) as avg_carbon, AVG(page_size_bytes) as avg_size, AVG(load_time_ms) as avg_time FROM scans`);
    const greenRow = await dbAsync.get(`SELECT COUNT(*) as green_count FROM scans WHERE is_green_host = 1`);
    const gradeRows = await dbAsync.all(`SELECT grade, COUNT(*) as count FROM scans GROUP BY grade`);
    const topCleanest = await dbAsync.all(`SELECT id, url, domain, carbon_grams, grade, page_size_bytes FROM scans ORDER BY carbon_grams ASC LIMIT 5`);

    const totalScans = totalRow ? totalRow.count : 0;
    const greenCount = greenRow ? greenRow.green_count : 0;
    const greenPercentage = totalScans > 0 ? Math.round((greenCount / totalScans) * 100) : 0;

    const gradeDistribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 };
    gradeRows.forEach(g => {
      if (gradeDistribution[g.grade] !== undefined) {
        gradeDistribution[g.grade] = g.count;
      }
    });

    return res.json({
      success: true,
      data: {
        total_scans: totalScans,
        average_carbon_grams: totalRow?.avg_carbon ? Number(totalRow.avg_carbon.toFixed(3)) : 0,
        average_page_size_bytes: totalRow?.avg_size ? Math.round(totalRow.avg_size) : 0,
        average_load_time_ms: totalRow?.avg_time ? Math.round(totalRow.avg_time) : 0,
        green_hosting_percentage: greenPercentage,
        grade_distribution: gradeDistribution,
        top_cleanest: topCleanest
      }
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
}

module.exports = {
  getAllScans,
  deleteScan,
  compareScans,
  getStats
};
