/**
 * Disease Service
 * Manages disease data, case tracking, and disease-related operations
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch all disease definitions
 */
const getAllDiseases = async () => {
  try {
    const q = query(collection(db, 'diseases'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return [];
  }
};

/**
 * Get disease details by ID
 */
const getDiseaseById = async (diseaseId) => {
  try {
    const docRef = doc(db, 'diseases', diseaseId);
    const snapshot = await getDocs(query(collection(db, 'diseases'), where('id', '==', diseaseId)));
    return snapshot.docs[0]?.data() || null;
  } catch (error) {
    console.error('Error fetching disease:', error);
    return null;
  }
};

/**
 * Get active disease cases for a hospital
 */
const getHospitalDiseases = async (hospitalId) => {
  try {
    const q = query(
      collection(db, 'diseaseRecords'),
      where('hospitalId', '==', hospitalId),
      where('verificationStatus', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching hospital diseases:', error);
    return [];
  }
};

/**
 * Get disease trends for a hospital (last N days)
 */
const getDiseaseTrend = async (hospitalId, daysBack = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const q = query(
      collection(db, 'diseaseRecords'),
      where('hospitalId', '==', hospitalId),
      where('reportedAt', '>=', cutoffDate),
      orderBy('reportedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Group by disease and date
    const trend = {};
    records.forEach((record) => {
      const date = record.reportedAt?.toDate?.()?.toLocaleDateString() || 'Unknown';
      if (!trend[record.diseaseId]) {
        trend[record.diseaseId] = [];
      }
      trend[record.diseaseId].push({ date, cases: record.newCases });
    });

    return trend;
  } catch (error) {
    console.error('Error fetching disease trend:', error);
    return {};
  }
};

/**
 * Report new disease cases (by hospital)
 */
const reportDiseaseCase = async (hospitalId, diseaseData) => {
  // diseaseData: { diseaseId, newCases, recoveredCases, fatalCases }
  try {
    const validated = validateDiseaseData(diseaseData);

    const docRef = await addDoc(collection(db, 'diseaseRecords'), {
      hospitalId,
      ...validated,
      reportedAt: serverTimestamp(),
      verificationStatus: 'pending',
      dataQualityScore: calculateDataQuality(diseaseData),
    });

    return { id: docRef.id, status: 'pending', message: 'Report submitted for verification' };
  } catch (error) {
    console.error('Error reporting disease case:', error);
    throw error;
  }
};

/**
 * Verify disease report (by authority)
 */
const verifyDiseaseReport = async (recordId, verificationStatus, authorityId) => {
  // verificationStatus: 'verified' | 'rejected'
  try {
    const recordRef = doc(db, 'diseaseRecords', recordId);
    await updateDoc(recordRef, {
      verificationStatus,
      verifiedBy: authorityId,
      verifiedAt: serverTimestamp(),
    });

    return { status: 'success', message: `Report ${verificationStatus}` };
  } catch (error) {
    console.error('Error verifying report:', error);
    throw error;
  }
};

/**
 * Get unverified disease reports (for authority dashboard)
 */
const getUnverifiedReports = async (limit_ = 50) => {
  try {
    const q = query(
      collection(db, 'diseaseRecords'),
      where('verificationStatus', '==', 'pending'),
      orderBy('reportedAt', 'desc'),
      limit(limit_)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching unverified reports:', error);
    return [];
  }
};

/**
 * Detect anomalies in disease data
 */
const detectAnomalies = (currentData, historicalData) => {
  const anomalies = [];

  if (historicalData.length === 0) {
    return anomalies;
  }

  const lastRecord = historicalData[0];
  const percentIncrease = ((currentData.newCases - lastRecord.newCases) / lastRecord.newCases) * 100;

  // Spike detection: > 200% increase
  if (percentIncrease > 200) {
    anomalies.push({
      type: 'spike',
      severity: 'high',
      message: `Cases spiked by ${percentIncrease.toFixed(1)}%`,
    });
  } else if (percentIncrease > 100) {
    anomalies.push({
      type: 'spike',
      severity: 'medium',
      message: `Cases increased by ${percentIncrease.toFixed(1)}%`,
    });
  }

  // Negative cases detection
  if (currentData.newCases < 0 || currentData.recoveredCases < 0) {
    anomalies.push({
      type: 'negative_values',
      severity: 'high',
      message: 'Negative case counts detected',
    });
  }

  return anomalies;
};

/**
 * Validate disease data
 */
const validateDiseaseData = (data) => {
  const validated = {
    diseaseId: data.diseaseId || '',
    newCases: Math.max(0, parseInt(data.newCases) || 0),
    recoveredCases: Math.max(0, parseInt(data.recoveredCases) || 0),
    fatalCases: Math.max(0, parseInt(data.fatalCases) || 0),
  };

  // Recovered + Fatal shouldn't exceed new cases
  if (validated.recoveredCases + validated.fatalCases > validated.newCases) {
    validated.recoveredCases = Math.max(0, validated.newCases - validated.fatalCases);
  }

  return validated;
};

/**
 * Calculate data quality score (0-100)
 */
const calculateDataQuality = (data) => {
  let score = 100;

  // Deduct points for missing fields
  if (!data.diseaseId) score -= 20;
  if (data.newCases === undefined) score -= 20;

  // Deduct for incomplete severity info
  if (data.recoveredCases === undefined && data.fatalCases === undefined) score -= 15;

  // Deduct for anomalies
  if (data.newCases < 0) score -= 30;

  return Math.max(0, score);
};

/**
 * Get top diseases by case count (city-wide)
 */
const getTopDiseases = async (city, limit_ = 10) => {
  try {
    const q = query(
      collection(db, 'diseaseRecords'),
      orderBy('newCases', 'desc'),
      limit(limit_)
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => doc.data());

    // Aggregate by disease
    const diseaseMap = {};
    records.forEach((record) => {
      if (!diseaseMap[record.diseaseId]) {
        diseaseMap[record.diseaseId] = 0;
      }
      diseaseMap[record.diseaseId] += record.newCases;
    });

    return Object.entries(diseaseMap)
      .map(([diseaseId, totalCases]) => ({ diseaseId, totalCases }))
      .sort((a, b) => b.totalCases - a.totalCases);
  } catch (error) {
    console.error('Error getting top diseases:', error);
    return [];
  }
};

export {
  getAllDiseases,
  getDiseaseById,
  getHospitalDiseases,
  getDiseaseTrend,
  reportDiseaseCase,
  verifyDiseaseReport,
  getUnverifiedReports,
  detectAnomalies,
  validateDiseaseData,
  calculateDataQuality,
  getTopDiseases,
};
