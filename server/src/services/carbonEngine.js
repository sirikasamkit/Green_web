const { co2: CO2Module } = require('@tgwf/co2');

// Initialize CO2 Calculator with Sustainable Web Design (SWD) model
let swdCalculator;
try {
  swdCalculator = new CO2Module({ model: 'swd' });
} catch (e) {
  console.warn('⚠️ @tgwf/co2 SWD initialization fallback:', e.message);
  // Fallback simplified SWD model if needed
  swdCalculator = {
    perByte: (bytes, green = false) => {
      // SWD v4 standard approximation: ~0.2g CO2e per 1MB for dirty host, ~0.15g for green host
      const kwhPerByte = 0.812 / (1024 * 1024 * 1024);
      const carbonIntensity = green ? 50 : 442; // gCO2/kWh
      return bytes * kwhPerByte * carbonIntensity;
    }
  };
}

/**
 * Determine letter grade based on carbon emissions (g CO2e) per page view
 * Based on Sustainable Web Design grading scale
 */
function calculateGrade(grams) {
  if (grams <= 0.095) return { grade: 'A+', color: '#10B981', label: 'Exceptional', rating: 95 };
  if (grams <= 0.186) return { grade: 'A', color: '#059669', label: 'Great', rating: 85 };
  if (grams <= 0.340) return { grade: 'B', color: '#84CC16', label: 'Good', rating: 70 };
  if (grams <= 0.493) return { grade: 'C', color: '#F59E0B', label: 'Average', rating: 55 };
  if (grams <= 0.656) return { grade: 'D', color: '#F97316', label: 'Poor', rating: 40 };
  if (grams <= 0.846) return { grade: 'E', color: '#EF4444', label: 'Bad', rating: 25 };
  return { grade: 'F', color: '#DC2626', label: 'Critical', rating: 10 };
}

/**
 * Estimate cleaner than percentage compared to global distribution
 */
function calculateCleanerThan(grams) {
  // Global median is ~ 0.50g
  // Scale mapping: 0.05g -> 95%, 0.20g -> 80%, 0.50g -> 50%, 1.0g -> 25%, 2.0g+ -> 5%
  if (grams <= 0.05) return 96;
  if (grams <= 0.10) return 92;
  if (grams <= 0.20) return 85;
  if (grams <= 0.35) return 72;
  if (grams <= 0.50) return 55;
  if (grams <= 0.75) return 38;
  if (grams <= 1.00) return 25;
  if (grams <= 1.50) return 15;
  if (grams <= 2.50) return 8;
  return 3;
}

/**
 * Main Carbon calculation engine
 * @param {number} bytes Total page transfer size in bytes
 * @param {boolean} isGreenHost Whether server runs on renewable energy
 * @param {number} monthlyViews Projected monthly page visits (default 10,000)
 */
function calculateCarbonMetrics(bytes, isGreenHost = false, monthlyViews = 10000) {
  const safeBytes = Math.max(0, Number(bytes) || 0);

  let carbonFirstVisit = 0;
  let carbonReturnVisit = 0;

  try {
    if (swdCalculator && typeof swdCalculator.perByte === 'function') {
      carbonFirstVisit = Number(swdCalculator.perByte(safeBytes, isGreenHost));
      // Return visit assumption (approx 75% cached resources loaded locally)
      carbonReturnVisit = Number(swdCalculator.perByte(safeBytes * 0.25, isGreenHost));
    }
  } catch (err) {
    console.error('Error in swdCalculator:', err);
    carbonFirstVisit = (safeBytes / (1024 * 1024)) * (isGreenHost ? 0.15 : 0.24);
    carbonReturnVisit = carbonFirstVisit * 0.25;
  }

  // Blended average per visit (assuming 75% new, 25% returning)
  const carbonPerVisit = (carbonFirstVisit * 0.75) + (carbonReturnVisit * 0.25);
  const carbonGrams = Number(carbonPerVisit.toFixed(3));

  const gradeInfo = calculateGrade(carbonGrams);
  const cleanerThan = calculateCleanerThan(carbonGrams);

  // Annual projections (12 months)
  const annualViews = monthlyViews * 12;
  const annualGrams = carbonGrams * annualViews;
  const annualKg = Number((annualGrams / 1000).toFixed(2));

  // Real-world environmental equivalencies based on annual metrics
  const equivalencies = {
    annual_kg_co2: annualKg,
    trees_needed: Number((annualGrams / 21770).toFixed(2)), // 1 mature tree absorbs ~21.77 kg CO2/year
    car_km_driven: Number((annualGrams / 120).toFixed(1)), // Standard combustion car ~120g CO2/km
    tea_cups_boiled: Math.round(annualGrams / 7), // Boiling a cup of tea ~7g CO2
    smartphone_charges: Math.round(annualGrams / 8.3), // 1 phone charge ~8.3g CO2
    kwh_electricity: Number((annualGrams / 442).toFixed(2)) // Grid average ~442g CO2/kWh
  };

  return {
    carbon_grams: carbonGrams,
    carbon_first_visit: Number(carbonFirstVisit.toFixed(3)),
    carbon_return_visit: Number(carbonReturnVisit.toFixed(3)),
    grade: gradeInfo.grade,
    grade_label: gradeInfo.label,
    grade_color: gradeInfo.color,
    score_rating: gradeInfo.rating,
    cleaner_than_pct: cleanerThan,
    equivalencies,
    monthly_views_assumed: monthlyViews
  };
}

module.exports = {
  calculateCarbonMetrics,
  calculateGrade,
  calculateCleanerThan
};
