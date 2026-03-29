/**
 * Zone Classification Engine
 * Calculates disease zone levels (RED/YELLOW/GREEN) based on hospital metrics
 */

/**
 * Dynamic threshold adjustment based on hospital characteristics
 */
const getZoneThresholds = (hospital, season = 'normal') => {
  const baseThresholds = {
    dengueCases: 10,
    fluCases: 15,
    occupancyRate: 70, // percentage
    availableBeds: 5,
  };

  // Size multiplier (higher beds = can handle more cases)
  const sizeMultiplier = Math.max(0.5, Math.min(2, hospital.totalBeds / 100));

  // Seasonal adjustment (monsoon increases dengue threshold)
  const seasonalAdjustment = season === 'monsoon' ? 1.3 : 1.0;

  // Region weighting (urban areas have higher tolerance)
  const regionWeighting = hospital.region === 'urban' ? 1.2 : 0.9;

  return {
    dengueHigh: Math.ceil(baseThresholds.dengueCases * sizeMultiplier * seasonalAdjustment),
    dengueMed: Math.ceil(baseThresholds.dengueCases * 0.5 * sizeMultiplier),

    fluHigh: Math.ceil(baseThresholds.fluCases * sizeMultiplier),
    fluMed: Math.ceil(baseThresholds.fluCases * 0.5 * sizeMultiplier),

    occupancyHigh: 85,
    occupancyMed: 70,

    bedShortageThreshold: baseThresholds.availableBeds,
  };
};

/**
 * Calculate individual disease risk score (0-100)
 */
const calculateDiseaseRisk = (activeCases, threshold) => {
  if (activeCases === 0) return 0;
  if (activeCases >= threshold * 2) return 100;
  return Math.min(100, (activeCases / threshold) * 50);
};

/**
 * Calculate bed availability risk (0-100)
 */
const calculateBedRisk = (availableBeds, totalBeds) => {
  const occupancyRate = ((totalBeds - availableBeds) / totalBeds) * 100;
  if (occupancyRate > 90) return 100;
  if (occupancyRate > 80) return 70;
  if (occupancyRate > 70) return 40;
  return 10;
};

/**
 * Main zone classification function
 * Returns: { color, riskScore, reason }
 */
const classifyZone = (hospital, season = 'normal') => {
  if (!hospital || !hospital.totalBeds) {
    return { color: 'GRAY', riskScore: 0, reason: 'Invalid hospital data' };
  }

  const thresholds = getZoneThresholds(hospital, season);

  // Component risks
  const dengueRisk = calculateDiseaseRisk(hospital.dengueCases || 0, thresholds.dengueHigh);
  const fluRisk = calculateDiseaseRisk(hospital.fluCases || 0, thresholds.fluHigh);
  const bedRisk = calculateBedRisk(hospital.availableBeds || 0, hospital.totalBeds);

  // Custom disease risk (average if multiple)
  let customDiseaseRisk = 0;
  if (hospital.customDiseases && hospital.customDiseases.length > 0) {
    const risks = hospital.customDiseases.map(d => {
      const caseThreshold = Math.ceil(10 * (d.severity || 1)); // Scale by severity
      return calculateDiseaseRisk(d.cases || 0, caseThreshold);
    });
    customDiseaseRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
  }

  // Composite risk score (weighted average)
  const compositeRiskScore =
    dengueRisk * 0.35 +
    fluRisk * 0.25 +
    customDiseaseRisk * 0.15 +
    bedRisk * 0.15 +
    (hospital.occupancyRate || 0) * 0.1;

  // Zone classification
  let color, reason;

  if (compositeRiskScore >= 70) {
    color = 'RED';
    reason = `High risk: Composite score ${compositeRiskScore.toFixed(1)}`;
    if (hospital.dengueCases >= thresholds.dengueHigh) {
      reason = `Dengue cases (${hospital.dengueCases}) exceed high threshold (${thresholds.dengueHigh})`;
    }
    if (bedRisk >= 70) {
      reason = `Critical bed shortage: Only ${hospital.availableBeds} beds available`;
    }
  } else if (compositeRiskScore >= 35) {
    color = 'YELLOW';
    reason = `Medium risk: Composite score ${compositeRiskScore.toFixed(1)}`;
  } else {
    color = 'GREEN';
    reason = `Low risk: All metrics under control`;
  }

  return {
    color,
    riskScore: parseFloat(compositeRiskScore.toFixed(2)),
    reason,
    details: {
      dengueRisk: dengueRisk.toFixed(2),
      fluRisk: fluRisk.toFixed(2),
      customDiseaseRisk: customDiseaseRisk.toFixed(2),
      bedRisk: bedRisk.toFixed(2),
      occupancyRate: (hospital.occupancyRate || 0).toFixed(2),
    },
  };
};

/**
 * Batch classify multiple hospitals
 */
const classifyMultipleZones = (hospitals, season = 'normal') => {
  return hospitals.map(hospital => ({
    ...hospital,
    zoneStatus: classifyZone(hospital, season),
  }));
};

/**
 * Get zone color in hex format
 */
const getZoneColorHex = (color) => {
  const colorMap = {
    RED: '#dc2626',
    YELLOW: '#fbbf24',
    GREEN: '#10b981',
    ORANGE: '#f97316',
    GRAY: '#9ca3af',
  };
  return colorMap[color] || colorMap.GRAY;
};

/**
 * Check if zone changed (for notifications)
 */
const hasZoneChanged = (oldZone, newZone) => {
  return oldZone?.color !== newZone?.color;
};

/**
 * Calculate zone radius based on risk and hospital size
 */
const calculateZoneRadius = (riskScore, hospitalBeds) => {
  // Base radius: 1.5 km for low risk, 3 km for high risk
  const baseRadius = 1500 + (riskScore / 100) * 1500; // 1.5km to 3km
  const sizeAdjustment = (hospitalBeds / 100) * 500; // Larger hospitals = larger zone
  return Math.round(baseRadius + sizeAdjustment);
};

export {
  classifyZone,
  classifyMultipleZones,
  getZoneColorHex,
  hasZoneChanged,
  calculateZoneRadius,
  getZoneThresholds,
  calculateDiseaseRisk,
  calculateBedRisk,
};
