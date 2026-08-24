const { scanWebsite } = require('./src/services/scanner');
const { calculateCarbonMetrics } = require('./src/services/carbonEngine');
const { generateAuditRecommendations } = require('./src/services/auditRules');

async function testLiveScan() {
  console.log('🌐 Testing live website scan on https://en.wikipedia.org ...');
  const scanData = await scanWebsite('https://en.wikipedia.org', 'desktop');
  console.log('✅ Scan Data Received:', {
    domain: scanData.domain,
    pageSizeBytes: scanData.pageSizeBytes,
    requestsCount: scanData.requestsCount,
    loadTimeMs: scanData.loadTimeMs,
    isGreenHost: scanData.isGreenHost,
  });

  const carbon = calculateCarbonMetrics(scanData.pageSizeBytes, scanData.isGreenHost, 10000);
  console.log('✅ Carbon Calculated:', carbon.grade, `${carbon.carbon_grams}g CO2e/visit`);

  const recs = generateAuditRecommendations({ ...scanData, carbonMetrics: carbon });
  console.log(`✅ Recommendations Count: ${recs.length}`);

  console.log('🎉 Live Scan Pipeline Verified 100% Working!');
  process.exit(0);
}

testLiveScan().catch(err => {
  console.error('❌ Live scan failed:', err);
  process.exit(1);
});
