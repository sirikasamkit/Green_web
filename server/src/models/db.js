const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Initialize Schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      title TEXT,
      carbon_grams REAL NOT NULL,
      grade TEXT NOT NULL,
      cleaner_than_pct REAL DEFAULT 50,
      page_size_bytes INTEGER NOT NULL,
      requests_count INTEGER NOT NULL,
      load_time_ms INTEGER NOT NULL,
      ttfb_ms INTEGER DEFAULT 0,
      dom_elements INTEGER DEFAULT 0,
      is_green_host INTEGER DEFAULT 0,
      green_host_info TEXT,
      resource_breakdown TEXT,
      carbon_equivalencies TEXT,
      recommendations TEXT,
      screenshot_url TEXT,
      device_type TEXT DEFAULT 'desktop',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC)`);
});

// Promisified Helpers
const dbAsync = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

module.exports = { db, dbAsync };
