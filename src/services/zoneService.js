/**
 * Zone Service
 * Manages disease zone calculations, updates, and zone-related operations
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { classifyZone, hasZoneChanged, calculateZoneRadius } from '../utils/zoneCalculator';
import { calculateDistance } from '../utils/geoUtils';

/**
 * Calculate and update zones for all hospitals
 */
const calculateAllZones = async (hospitals, season = 'normal') => {
  try {
    const updatedHospitals = hospitals.map((hospital) => {
      const zoneStatus = classifyZone(hospital, season);
      const radius = calculateZoneRadius(zoneStatus.riskScore, hospital.totalBeds);

      return {
        ...hospital,
        zoneStatus: {
          ...zoneStatus,
          affectedArea: {
            type: 'circle',
            radius: radius,
            coordinates: [hospital.latitude, hospital.longitude],
          },
        },
      };
    });

    return updatedHospitals;
  } catch (error) {
    console.error('Error calculating zones:', error);
    return hospitals;
  }
};

/**
 * Update zone for a single hospital and track changes
 */
const updateHospitalZone = async (hospitalId, hospital) => {
  try {
    // Get old zone
    const docRef = doc(db, 'hospitals', hospitalId);
    const hospitalDoc = await getDocs(query(collection(db, 'hospitals'), where('id', '==', hospitalId)));
    const oldZone = hospitalDoc.docs[0]?.data()?.zoneStatus;

    // Calculate new zone
    const newZoneStatus = classifyZone(hospital);
    const radius = calculateZoneRadius(newZoneStatus.riskScore, hospital.totalBeds);
    const newZone = {
      ...newZoneStatus,
      affectedArea: {
        type: 'circle',
        radius: radius,
        coordinates: [hospital.latitude, hospital.longitude],
      },
      lastCalculated: new Date(),
    };

    // Update hospital
    await updateDoc(docRef, { zoneStatus: newZone });

    // Track zone change if color changed
    if (oldZone && hasZoneChanged(oldZone, newZone)) {
      await recordZoneChange(hospitalId, oldZone.color, newZone.color, 'automatic_update');
      return { zoneChanged: true, oldColor: oldZone.color, newColor: newZone.color };
    }

    return { zoneChanged: false, currentZone: newZone };
  } catch (error) {
    console.error('Error updating hospital zone:', error);
    throw error;
  }
};

/**
 * Record zone change in history
 */
const recordZoneChange = async (hospitalId, previousColor, currentColor, trigger, userId = 'system') => {
  try {
    const changeRecord = {
      hospitalId,
      previousColor,
      currentColor,
      trigger, // 'daily_recalculation' | 'disease_update' | 'bed_update' | 'manual_verification'
      changedAt: serverTimestamp(),
      changedBy: userId,
    };

    const docRef = await addDoc(collection(db, 'zoneHistory'), changeRecord);
    return { id: docRef.id, ...changeRecord };
  } catch (error) {
    console.error('Error recording zone change:', error);
    throw error;
  }
};

/**
 * Get zone change history for a hospital
 */
const getZoneHistory = async (hospitalId, daysBack = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const q = query(
      collection(db, 'zoneHistory'),
      where('hospitalId', '==', hospitalId),
      where('changedAt', '>=', cutoffDate),
      orderBy('changedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching zone history:', error);
    return [];
  }
};

/**
 * Find all hospitals in a specific zone color
 */
const getHospitalsByZoneColor = async (color) => {
  try {
    const q = query(
      collection(db, 'hospitals'),
      where('zoneStatus.color', '==', color)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching hospitals by zone color:', error);
    return [];
  }
};

/**
 * Find zones overlapping with a given location
 */
const findOverlappingZones = (zones, userLat, userLng) => {
  const overlappingZones = [];

  zones.forEach((zone) => {
    if (!zone.zoneStatus) return;

    const distance = calculateDistance(userLat, userLng, zone.latitude, zone.longitude);
    const radiusKm = (zone.zoneStatus.affectedArea?.radius || 2000) / 1000;

    if (distance <= radiusKm) {
      overlappingZones.push({
        hospital: zone,
        distance: distance.toFixed(2),
        zone: zone.zoneStatus,
      });
    }
  });

  return overlappingZones.sort((a, b) => a.distance - b.distance);
};

/**
 * Get zone statistics for authority dashboard
 */
const getZoneStatistics = async (hospitals) => {
  try {
    const stats = {
      totalHospitals: hospitals.length,
      byColor: {
        RED: 0,
        YELLOW: 0,
        GREEN: 0,
        GRAY: 0,
      },
      averageRiskScore: 0,
      criticalZones: [],
      highRiskHospitals: [],
    };

    let totalRisk = 0;

    hospitals.forEach((hospital) => {
      const color = hospital.zoneStatus?.color || 'GRAY';
      stats.byColor[color]++;
      totalRisk += hospital.zoneStatus?.riskScore || 0;

      if (color === 'RED') {
        stats.criticalZones.push({
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          reason: hospital.zoneStatus?.reason,
          riskScore: hospital.zoneStatus?.riskScore,
        });
      }

      if ((hospital.zoneStatus?.riskScore || 0) > 60) {
        stats.highRiskHospitals.push({
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          riskScore: hospital.zoneStatus?.riskScore,
        });
      }
    });

    stats.averageRiskScore = parseFloat((totalRisk / hospitals.length).toFixed(2));
    stats.criticalZoneCount = stats.byColor.RED;
    stats.mediumRiskCount = stats.byColor.YELLOW;

    return stats;
  } catch (error) {
    console.error('Error calculating zone statistics:', error);
    return null;
  }
};

/**
 * Generate zone alert when color changes to RED
 */
const generateZoneAlert = async (hospitalId, hospitalName, previousColor, currentColor, reason, targetAudience = ['citizens', 'authorities']) => {
  try {
    if (currentColor !== 'RED') {
      return null; // Only create alert for RED zones
    }

    const alert = {
      hospitalId,
      type: 'zone_change',
      severity: 'high',
      message: `${hospitalName} is now in HIGH RISK zone. ${reason}`,
      targetAudience,
      sentAt: serverTimestamp(),
      readBy: [],
    };

    const docRef = await addDoc(collection(db, 'alerts'), alert);
    return { id: docRef.id, ...alert };
  } catch (error) {
    console.error('Error generating zone alert:', error);
    throw error;
  }
};

/**
 * Get active alerts for a zone/hospital
 */
const getActiveAlerts = async (hospitalId = null, hoursBack = 24) => {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

    let q;
    if (hospitalId) {
      q = query(
        collection(db, 'alerts'),
        where('hospitalId', '==', hospitalId),
        where('sentAt', '>=', cutoffTime),
        orderBy('sentAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'alerts'),
        where('sentAt', '>=', cutoffTime),
        orderBy('sentAt', 'desc'),
        limit(100)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

/**
 * Mark alert as read by a user
 */
const markAlertAsRead = async (alertId, userId) => {
  try {
    const docRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDocs(query(collection(db, 'alerts'), where('id', '==', alertId)));
    const alert = alertDoc.docs[0]?.data();

    if (alert && !alert.readBy?.includes(userId)) {
      await updateDoc(docRef, {
        readBy: [...(alert.readBy || []), userId],
      });
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

export {
  calculateAllZones,
  updateHospitalZone,
  recordZoneChange,
  getZoneHistory,
  getHospitalsByZoneColor,
  findOverlappingZones,
  getZoneStatistics,
  generateZoneAlert,
  getActiveAlerts,
  markAlertAsRead,
};
