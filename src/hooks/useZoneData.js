/**
 * useZoneData Hook
 * Fetches and manages zone data with real-time updates
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { calculateAllZones, getZoneStatistics } from '../services/zoneService';

function useZoneData(hospitalId = null, autoCalculate = true) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneStats, setZoneStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to hospital data with real-time updates
  useEffect(() => {
    let unsubscribe;

    try {
      setLoading(true);
      setError(null);

      let q;
      if (hospitalId) {
        q = query(collection(db, 'hospitals'), where('id', '==', hospitalId));
      } else {
        q = query(collection(db, 'hospitals'));
      }

      unsubscribe = onSnapshot(q, async (snapshot) => {
        const hospitalsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Auto-calculate zones when hospital data changes
        if (autoCalculate) {
          const calculatedZones = await calculateAllZones(hospitalsData);
          setZones(calculatedZones);

          // Calculate statistics
          const stats = await getZoneStatistics(calculatedZones);
          setZoneStats(stats);
        } else {
          setZones(hospitalsData);
        }

        setLoading(false);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error setting up zone listener:', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hospitalId, autoCalculate]);

  // Helper function to find zones by color
  const getZonesByColor = useCallback(
    (color) => {
      return zones.filter((z) => z.zoneStatus?.color === color);
    },
    [zones]
  );

  // Helper function to get RED zones (critical)
  const getCriticalZones = useCallback(
    () => getZonesByColor('RED'),
    [getZonesByColor]
  );

  // Helper function to find zone by hospital ID
  const getZoneByHospitalId = useCallback(
    (id) => {
      return zones.find((z) => z.id === id) || null;
    },
    [zones]
  );

  // Helper function to find zones near a location
  const findNearbyZones = useCallback(
    (lat, lng, radiusKm = 5) => {
      return zones.filter((zone) => {
        if (!zone.latitude || !zone.longitude) return false;
        // Simple distance calculation
        const distance = Math.sqrt(
          Math.pow(zone.latitude - lat, 2) +
          Math.pow(zone.longitude - lng, 2)
        );
        // Very rough approximation: 1 degree ≈ 111 km
        return distance * 111 <= radiusKm;
      });
    },
    [zones]
  );

  return {
    zones,
    selectedZone,
    setSelectedZone,
    zoneStats,
    loading,
    error,
    getZonesByColor,
    getCriticalZones,
    getZoneByHospitalId,
    findNearbyZones,
  };
}

export default useZoneData;
