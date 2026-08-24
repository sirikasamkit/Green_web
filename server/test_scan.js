const { calculateCarbonMetrics } = require('./src/services/carbonEngine');
const { generateAuditRecommendations } = require('./src/services/auditRules');
const { dbAsync } = require('./src/models/db');
const { checkGreenHosting } = require('./src/services/scanner');

async function testEngine() {
  console.log('🧪 Testing Green Web Analyzer Components...');

  // 1. Test Carbon Engine
  const metrics = calculateCarbonMetrics(1500000, true, 10000); // 1.5MB green host
  console.log('✅ Carbon Metrics Test:', {
    carbon_grams: metrics.carbon_grams,
    grade: metrics.grade,
    cleaner_than_pct: metrics.cleaner_than_pct,
    trees_needed: metrics.equivalencies.trees_needed,
    car_km: metrics.equivalencies.car_km_driven
  });

  // 2. Test Audit Rules
  const recs = generateAuditRecommendations({
    pageSizeBytes: 2500000,
    resourceBreakdown: {
      images: { bytes: 1200000, count: 8 },
      javascript: { bytes: 800000, count: 5 },
      css: { bytes: 150000, count: 3 }
    },
    isGreenHost: false,
    headersInfo: { missingCaching: true, missingCompression: false },
    domElements: 800,
    loadTimeMs: 1400
  });
  console.log(`✅ Audit Rules Generated ${recs.length} recommendations:`, recs.map(r => r.title));

  // 3. Test Database Insert & Fetch
  const testId = 'test_' + Date.now();
  await dbAsync.run(`
    INSERT INTO scans (id, url, domain, title, carbon_grams, grade, page_size_bytes, requests_count, load_time_ms, is_green_host)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [testId, 'https://example.org', 'example.org', 'Example Test Page', 0.12, 'A', 250000, 10, 650, 1]);

  const row = await dbAsync.get(`SELECT * FROM scans WHERE id = ?`, [testId]);
  console.log('✅ Database Record Verified:', row.domain, '| Grade:', row.grade);

  // 4. Test Green Web Foundation API
  const greenRes = await checkGreenHosting('google.com');
  console.log('✅ Green Hosting Check for google.com:', greenRes.green, greenRes.hosted_by);

  console.log('🎉 All Core Engine Tests Passed Successfully!');
  process.exit(0);
}

testEngine().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
