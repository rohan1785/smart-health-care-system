/**
 * useGeolocation Hook
 * Gets and manages user's current location
 */

import { useEffect, useState, useCallback } from 'react';
import { findNearbyHospitals, sortHospitalsByDistance } from '../utils/geoUtils';

function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Unable to get location';
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Please enable location access';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Get nearby hospitals
  const getNearbyHospitals = useCallback(
    (hospitals, radiusKm = 5) => {
      if (!location) return [];
      const nearby = findNearbyHospitals(hospitals, location.latitude, location.longitude, radiusKm);
      return sortHospitalsByDistance(nearby, location.latitude, location.longitude);
    },
    [location]
  );

  // Watch location changes (continuous updates)
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
      },
      (err) => {
        console.error('Watch position error:', err);
        setError('Failed to watch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Auto-get location on mount (optional)
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getNearbyHospitals,
    watchLocation,
  };
}

export default useGeolocation;
