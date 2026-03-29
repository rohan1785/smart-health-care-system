/**
 * Data Formatter Utilities
 * Formats data for display in UI components
 */

/**
 * Format date to readable string
 */
const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';

  const d = date instanceof Date ? date : date.toDate?.() || new Date(date);

  if (format === 'short') {
    return d.toLocaleDateString();
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  if (format === 'datetime') {
    return d.toLocaleString();
  }
  if (format === 'time') {
    return d.toLocaleTimeString();
  }
  return d.toLocaleDateString();
};

/**
 * Format time ago (e.g., "2 hours ago")
 */
const formatTimeAgo = (date) => {
  if (!date) return 'N/A';

  const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;

  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;

  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;

  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;

  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;

  return 'just now';
};

/**
 * Format number with commas
 */
const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  return parseFloat(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format percentage
 */
const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return parseFloat(value).toFixed(decimals) + '%';
};

/**
 * Format zone color to display text
 */
const formatZoneColor = (color) => {
  const colorMap = {
    RED: { text: 'High Risk', class: 'text-red-600', bg: 'bg-red-50' },
    YELLOW: { text: 'Medium Risk', class: 'text-amber-600', bg: 'bg-amber-50' },
    GREEN: { text: 'Low Risk', class: 'text-green-600', bg: 'bg-green-50' },
    ORANGE: { text: 'Medium-High Risk', class: 'text-orange-600', bg: 'bg-orange-50' },
    GRAY: { text: 'No Data', class: 'text-gray-600', bg: 'bg-gray-50' },
  };
  return colorMap[color] || colorMap.GRAY;
};

/**
 * Format risk score
 */
const formatRiskScore = (score) => {
  return parseFloat(score).toFixed(2);
};

/**
 * Format hospital occupancy status
 */
const formatOccupancy = (availableBeds, totalBeds) => {
  if (totalBeds === 0) return { percentage: 0, status: 'Unknown' };

  const occupancy = ((totalBeds - availableBeds) / totalBeds) * 100;
  const status =
    occupancy > 85 ? 'Critical' : occupancy > 70 ? 'High' : occupancy > 50 ? 'Moderate' : 'Low';

  return { percentage: occupancy.toFixed(1), status };
};

/**
 * Format bed availability
 */
const formatBedAvailability = (available, total) => {
  const percentage = ((available / total) * 100).toFixed(1);
  return {
    available,
    total,
    percentage,
    status: available < 5 ? 'Critical' : available < 10 ? 'Low' : available < 20 ? 'Moderate' : 'Good',
  };
};

/**
 * Format distance
 */
const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Format address
 */
const formatAddress = (hospital) => {
  const parts = [hospital.address, hospital.ward, hospital.city].filter(Boolean);
  return parts.join(', ') || 'Address not provided';
};

/**
 * Format hospital contact
 */
const formatContact = (hospital) => {
  return {
    phone: hospital.contactNumber || 'N/A',
    email: hospital.email || 'N/A',
    emergency24h: hospital.operatingHours?.emergency24h ? 'Yes' : 'No',
  };
};

/**
 * Format case statistics
 */
const formatCaseStats = (hospital) => {
  return {
    dengue: hospital.dengueCases || 0,
    flu: hospital.fluCases || 0,
    customDiseases: hospital.customDiseases?.length || 0,
    total: (hospital.dengueCases || 0) + (hospital.fluCases || 0),
  };
};

/**
 * Format severity level
 */
const formatSeverity = (level) => {
  const severityMap = {
    low: { text: 'Low', class: 'text-green-600', badge: 'badge-green' },
    medium: { text: 'Medium', class: 'text-amber-600', badge: 'badge-amber' },
    high: { text: 'High', class: 'text-red-600', badge: 'badge-red' },
  };
  return severityMap[level] || severityMap.medium;
};

/**
 * Format season
 */
const formatSeason = () => {
  const month = new Date().getMonth();
  if (month >= 5 && month <= 9) return 'monsoon'; // June-October
  return 'normal';
};

/**
 * Format hospital for display card
 */
const formatHospitalCard = (hospital) => {
  return {
    id: hospital.id,
    name: hospital.name,
    address: formatAddress(hospital),
    contact: formatContact(hospital),
    beds: formatBedAvailability(hospital.availableBeds || 0, hospital.totalBeds),
    cases: formatCaseStats(hospital),
    zone: formatZoneColor(hospital.zoneStatus?.color),
    riskScore: formatRiskScore(hospital.zoneStatus?.riskScore || 0),
    distanceKm: hospital.distanceKm,
  };
};

export {
  formatDate,
  formatTimeAgo,
  formatNumber,
  formatPercentage,
  formatZoneColor,
  formatRiskScore,
  formatOccupancy,
  formatBedAvailability,
  formatDistance,
  formatAddress,
  formatContact,
  formatCaseStats,
  formatSeverity,
  formatSeason,
  formatHospitalCard,
};
