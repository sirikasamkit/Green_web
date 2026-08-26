const REGIONAL_GRIDS = {
  GLOBAL: { name: 'Global Average', flag: '🌐', intensity: 442 },
  TH: { name: 'Thailand', flag: '🇹🇭', intensity: 456 },
  US: { name: 'United States', flag: '🇺🇸', intensity: 386 },
  FR: { name: 'France (Nuclear & Clean)', flag: '🇫🇷', intensity: 58 },
  DE: { name: 'Germany', flag: '🇩🇪', intensity: 385 },
  JP: { name: 'Japan', flag: '🇯🇵', intensity: 462 },
  GB: { name: 'United Kingdom', flag: '🇬🇧', intensity: 207 },
  SG: { name: 'Singapore', flag: '🇸🇬', intensity: 408 },
  NO: { name: 'Norway (Hydro Clean)', flag: '🇳🇴', intensity: 28 },
};

/**
 * Determine letter grade based on carbon emissions (g CO2e) per page view
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
 * Primary SWD v4 Model (Sustainable Web Design)
 */
function calculateSwdModel(bytes, isGreenHost = false) {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  const dataInGb = safeBytes / (1024 * 1024 * 1024);
  const energyKwh = dataInGb * 0.812;

  const dcIntensity = isGreenHost ? 50 : 442;
  const gridIntensity = 442;

  const firstVisit =
    (energyKwh * 0.15 * dcIntensity) +
    (energyKwh * 0.14 * gridIntensity) +
    (energyKwh * 0.52 * gridIntensity) +
    (energyKwh * 0.19 * gridIntensity);

  const returnVisit = firstVisit * 0.25;
  const blendedGrams = Number(((firstVisit * 0.75) + (returnVisit * 0.25)).toFixed(3));

  return {
    grams: blendedGrams,
    firstVisit: Number(firstVisit.toFixed(3)),
    returnVisit: Number(returnVisit.toFixed(3)),
    modelName: 'Sustainable Web Design (SWD v4)',
    modelCode: 'swd'
  };
}

/**
 * OneByte Model (The Shift Project)
 */
function calculateOneByteModel(bytes, isGreenHost = false) {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  const dataInGb = safeBytes / (1024 * 1024 * 1024);
  const energyKwh = dataInGb * 0.06; // 0.06 kWh/GB direct transfer
  const intensity = isGreenHost ? 50 : 442;
  const grams = Number((energyKwh * intensity).toFixed(3));

  return {
    grams,
    firstVisit: grams,
    returnVisit: Number((grams * 0.25).toFixed(3)),
    modelName: 'OneByte Model (The Shift Project)',
    modelCode: 'onebyte'
  };
}

/**
 * Green Software Foundation SCI Model (ISO/IEC Specification)
 */
function calculateSciModel(bytes, isGreenHost = false) {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  const dataInGb = safeBytes / (1024 * 1024 * 1024);
  const energyKwh = dataInGb * 0.45;
  const intensity = isGreenHost ? 50 : 442;
  const operational = energyKwh * intensity;
  const embodied = dataInGb * 0.08; // hardware embodied depreciation
  const grams = Number((operational + embodied).toFixed(3));

  return {
    grams,
    firstVisit: grams,
    returnVisit: Number((grams * 0.3).toFixed(3)),
    modelName: 'Software Carbon Intensity (GSF SCI)',
    modelCode: 'sci'
  };
}

/**
 * W3C WSG Regional Model
 */
function calculateRegionalModel(bytes, isGreenHost = false, regionCode = 'TH') {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  const dataInGb = safeBytes / (1024 * 1024 * 1024);
  const energyKwh = dataInGb * 0.812;

  const region = REGIONAL_GRIDS[regionCode] || REGIONAL_GRIDS.GLOBAL;
  const dcIntensity = isGreenHost ? 50 : region.intensity;
  const gridIntensity = region.intensity;

  const firstVisit =
    (energyKwh * 0.15 * dcIntensity) +
    (energyKwh * 0.14 * gridIntensity) +
    (energyKwh * 0.52 * gridIntensity) +
    (energyKwh * 0.19 * gridIntensity);

  const returnVisit = firstVisit * 0.25;
  const blendedGrams = Number(((firstVisit * 0.75) + (returnVisit * 0.25)).toFixed(3));

  return {
    grams: blendedGrams,
    firstVisit: Number(firstVisit.toFixed(3)),
    returnVisit: Number(returnVisit.toFixed(3)),
    region: region.name,
    flag: region.flag,
    intensity: region.intensity,
    modelName: `W3C Regional Grid (${region.flag} ${region.name})`,
    modelCode: 'regional'
  };
}

/**
 * Main Carbon Calculation Engine supporting ALL calculation formulas
 */
function calculateCarbonMetrics(bytes, isGreenHost = false, monthlyViews = 10000, modelType = 'swd', regionCode = 'TH') {
  const safeBytes = Math.max(0, Number(bytes) || 0);

  // Calculate primary model
  const swdResult = calculateSwdModel(safeBytes, isGreenHost);
  const oneByteResult = calculateOneByteModel(safeBytes, isGreenHost);
  const sciResult = calculateSciModel(safeBytes, isGreenHost);
  const regionalResult = calculateRegionalModel(safeBytes, isGreenHost, regionCode);

  let activeResult = swdResult;
  if (modelType === 'onebyte') activeResult = oneByteResult;
  if (modelType === 'sci') activeResult = sciResult;
  if (modelType === 'regional') activeResult = regionalResult;

  const carbonGrams = activeResult.grams;
  const gradeInfo = calculateGrade(carbonGrams);
  const cleanerThan = calculateCleanerThan(carbonGrams);

  const annualViews = monthlyViews * 12;
  const annualGrams = carbonGrams * annualViews;
  const annualKg = Number((annualGrams / 1000).toFixed(2));

  const equivalencies = {
    annual_kg_co2: annualKg,
    trees_needed: Number((annualGrams / 21770).toFixed(2)),
    car_km_driven: Number((annualGrams / 120).toFixed(1)),
    tea_cups_boiled: Math.round(annualGrams / 7),
    smartphone_charges: Math.round(annualGrams / 8.3),
    kwh_electricity: Number((annualGrams / 442).toFixed(2))
  };

  return {
    carbon_grams: carbonGrams,
    carbon_first_visit: activeResult.firstVisit,
    carbon_return_visit: activeResult.returnVisit,
    grade: gradeInfo.grade,
    grade_label: gradeInfo.label,
    grade_color: gradeInfo.color,
    score_rating: gradeInfo.rating,
    cleaner_than_pct: cleanerThan,
    equivalencies,
    monthly_views_assumed: monthlyViews,
    active_model: modelType,
    all_models: {
      swd: swdResult,
      onebyte: oneByteResult,
      sci: sciResult,
      regional: regionalResult
    },
    available_regions: REGIONAL_GRIDS
  };
}

module.exports = {
  calculateCarbonMetrics,
  calculateGrade,
  calculateCleanerThan,
  calculateSwdModel,
  calculateOneByteModel,
  calculateSciModel,
  calculateRegionalModel,
  REGIONAL_GRIDS
};
