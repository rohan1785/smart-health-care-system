/**
 * Geographic Utility Functions
 * Haversine distance, geohashing, bounding box calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Convert distance in kilometers to meters
 */
const kmToMeters = (km) => km * 1000;

/**
 * Get bounding box for a location with radius
 */
const getBoundingBox = (lat, lng, radiusKm) => {
  const latChange = (radiusKm / 111); // 1 degree latitude ≈ 111 km
  const lngChange = (radiusKm / (111 * Math.cos(lat * Math.PI / 180))); // Adjust for longitude

  return {
    north: lat + latChange,
    south: lat - latChange,
    east: lng + lngChange,
    west: lng - lngChange,
  };
};

/**
 * Check if a point is within a circular zone
 */
const isPointInZone = (pointLat, pointLng, zoneLat, zoneLng, zoneRadiusKm) => {
  const distance = calculateDistance(pointLat, pointLng, zoneLat, zoneLng);
  return distance <= zoneRadiusKm;
};

/**
 * Simple GeoHash encoding (5-character precision ≈ 1.2km²)
 */
const geoHash = (lat, lng, precision = 5) => {
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90,
    latMax = 90;
  let lngMin = -180,
    lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // longitude
      const mid = (lngMin + lngMax) / 2;
      if (lng > mid) {
        idx = (idx << 1) + 1;
        lngMin = mid;
      } else {
        idx = idx << 1;
        lngMax = mid;
      }
    } else {
      // latitude
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        idx = (idx << 1) + 1;
        latMin = mid;
      } else {
        idx = idx << 1;
        latMax = mid;
      }
    }

    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += chars[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
};

/**
 * Find hospitals near a given location
 */
const findNearbyHospitals = (hospitals, lat, lng, radiusKm = 5) => {
  return hospitals.filter((hospital) => {
    const distance = calculateDistance(
      lat,
      lng,
      hospital.latitude || 0,
      hospital.longitude || 0
    );
    return distance <= radiusKm;
  });
};

/**
 * Find hospital within a city/ward
 */
const findHospitalsByArea = (hospitals, city, ward = null) => {
  let filtered = hospitals.filter((h) => h.city === city);
  if (ward) {
    filtered = filtered.filter((h) => h.ward === ward);
  }
  return filtered;
};

/**
 * Sort hospitals by distance from user location
 */
const sortHospitalsByDistance = (hospitals, userLat, userLng) => {
  return [...hospitals]
    .map((h) => ({
      ...h,
      distanceKm: calculateDistance(
        userLat,
        userLng,
        h.latitude || 0,
        h.longitude || 0
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Generate Voronoi-like zone (simplified - uses farthest hospital as boundary)
 */
const generateSimpleZoneBoundary = (targetHospital, nearbyHospitals) => {
  if (nearbyHospitals.length === 0) {
    // If no nearby hospitals, use circular zone
    return {
      type: 'circle',
      center: { lat: targetHospital.latitude, lng: targetHospital.longitude },
      radius: 2000, // 2km default
    };
  }

  // Find closest neighbor
  const distances = nearbyHospitals.map((h) => ({
    hospital: h,
    distance: calculateDistance(
      targetHospital.latitude,
      targetHospital.longitude,
      h.latitude,
      h.longitude
    ),
  }));

  const closestNeighbor = distances.reduce((min, d) =>
    d.distance < min.distance ? d : min
  );

  // Boundary is halfway between target and closest neighbor
  const boundaryDistance = closestNeighbor.distance / 2;

  return {
    type: 'circle',
    center: {
      lat: targetHospital.latitude,
      lng: targetHospital.longitude,
    },
    radius: kmToMeters(boundaryDistance),
  };
};

/**
 * Check if two zones overlap
 */
const zonesOverlap = (zone1, zone2) => {
  if (zone1.type === 'circle' && zone2.type === 'circle') {
    const distance = calculateDistance(
      zone1.center.lat,
      zone1.center.lng,
      zone2.center.lat,
      zone2.center.lng
    );
    const radiusSum = (zone1.radius + zone2.radius) / 1000; // Convert to km
    return distance <= radiusSum;
  }
  return false;
};

/**
 * Calculate center of multiple locations (centroid)
 */
const calculateCentroid = (locations) => {
  if (locations.length === 0) return { lat: 0, lng: 0 };

  const sumLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
  const sumLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);

  return {
    lat: sumLat / locations.length,
    lng: sumLng / locations.length,
  };
};

export {
  calculateDistance,
  kmToMeters,
  getBoundingBox,
  isPointInZone,
  geoHash,
  findNearbyHospitals,
  findHospitalsByArea,
  sortHospitalsByDistance,
  generateSimpleZoneBoundary,
  zonesOverlap,
  calculateCentroid,
};
