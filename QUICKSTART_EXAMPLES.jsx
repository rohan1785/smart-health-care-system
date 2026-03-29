/**
 * QUICK START GUIDE - GIS Disease Monitoring System
 * 
 * This file shows how to quickly integrate the new zone system into any component
 */

// ============================================
// 1. BASIC USAGE - View All Hospital Zones
// ============================================

import useZoneData from '../hooks/useZoneData';

function SimpleZoneViewer() {
  const { zones, zoneStats, loading, error } = useZoneData();

  if (loading) return <p>Loading zones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Hospital Zones</h2>
      <p>Total Hospitals: {zoneStats?.totalHospitals}</p>
      <p>Critical (RED): {zoneStats?.byColor?.RED}</p>
      
      <ul>
        {zones.map(hospital => (
          <li key={hospital.id}>
            {hospital.name} - {hospital.zoneStatus?.color} 
            (Risk: {hospital.zoneStatus?.riskScore.toFixed(1)})
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// 2. WITH GEOLOCATION - Show Nearby Hospitals
// ============================================

import useGeolocation from '../hooks/useGeolocation';
import { formatDistance } from '../utils/formatters';

function NearbyHospitalsView() {
  const { location, getNearbyHospitals } = useGeolocation();
  const { zones } = useZoneData();

  const nearby = location ? getNearbyHospitals(zones, 5) : [];

  return (
    <div>
      <h2>Hospitals Near You</h2>
      {location ? (
        <>
          <p>Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
          <ul>
            {nearby.map(hospital => (
              <li key={hospital.id}>
                <strong>{hospital.name}</strong>
                <p>Distance: {formatDistance(hospital.distanceKm)}</p>
                <p>Zone: {hospital.zoneStatus?.color}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Getting your location...</p>
      )}
    </div>
  );
}

// ============================================
// 3. WITH ALERTS - Monitor Critical Zones
// ============================================

import useAlerts from '../hooks/useAlerts';

function AlertMonitor() {
  const { 
    alerts, 
    unreadCount, 
    getCriticalAlerts, 
    handleMarkAsRead,
    requestNotificationPermission 
  } = useAlerts(null, 'user123');

  const criticalAlerts = getCriticalAlerts();

  return (
    <div>
      <h2>Alerts ({unreadCount} unread)</h2>
      <button onClick={requestNotificationPermission}>
        Enable Notifications
      </button>

      {criticalAlerts.length > 0 && (
        <div className="alert-section">
          <h3>🚨 Critical Alerts</h3>
          {criticalAlerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <p>{alert.message}</p>
              <button onClick={() => handleMarkAsRead(alert.id)}>
                Mark as Read
              </button>
            </div>
          ))}
        </div>
      )}

      <h3>All Alerts</h3>
      {alerts.map(alert => (
        <div key={alert.id}>{alert.message}</div>
      ))}
    </div>
  );
}

// ============================================
// 4. DISEASE REPORTING - Hospital Module
// ============================================

import { useState } from 'react';
import { reportDiseaseCase } from '../services/diseaseService';
import { updateHospitalZone } from '../services/zoneService';

function DiseaseReporter({ hospitalId }) {
  const [cases, setCases] = useState('');
  const [status, setStatus] = useState('');

  const handleReport = async () => {
    try {
      setStatus('Submitting...');
      
      // Step 1: Report disease
      const result = await reportDiseaseCase(hospitalId, {
        diseaseId: 'dengue',
        newCases: parseInt(cases),
        recoveredCases: 0,
        fatalCases: 0,
      });

      // Step 2: Fetch hospital data and update zone
      // (In real app, fetch actual hospital data from Firebase)
      const hospitalData = { /* ... */ };
      const zoneUpdate = await updateHospitalZone(hospitalId, hospitalData);

      setStatus(`✅ Reported! Zone: ${zoneUpdate.currentZone.color}`);
      setCases('');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>Report Dengue Cases</h3>
      <input 
        type="number" 
        value={cases}
        onChange={(e) => setCases(e.target.value)}
        placeholder="Number of new cases"
      />
      <button onClick={handleReport}>Submit</button>
      <p>{status}</p>
    </div>
  );
}

// ============================================
// 5. ADVANCED - Zone Statistics Dashboard
// ============================================

import { getZoneStatistics } from '../services/zoneService';

function ZoneDashboard() {
  const { zones, zoneStats } = useZoneData();

  const getPercentage = (count, total) => {
    return total === 0 ? '0%' : ((count / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="dashboard">
      <div className="stat-card red">
        <h4>🔴 Critical Zones</h4>
        <p className="number">{zoneStats?.byColor?.RED}</p>
        <p className="percent">
          {getPercentage(zoneStats?.byColor?.RED, zoneStats?.totalHospitals)}
        </p>
      </div>

      <div className="stat-card yellow">
        <h4>🟡 Medium Risk</h4>
        <p className="number">{zoneStats?.byColor?.YELLOW}</p>
        <p className="percent">
          {getPercentage(zoneStats?.byColor?.YELLOW, zoneStats?.totalHospitals)}
        </p>
      </div>

      <div className="stat-card green">
        <h4>🟢 Safe Zones</h4>
        <p className="number">{zoneStats?.byColor?.GREEN}</p>
        <p className="percent">
          {getPercentage(zoneStats?.byColor?.GREEN, zoneStats?.totalHospitals)}
        </p>
      </div>

      <div className="stat-card">
        <h4>📊 Average Risk</h4>
        <p className="number">{zoneStats?.averageRiskScore.toFixed(1)}</p>
        <p className="percent">out of 100</p>
      </div>
    </div>
  );
}

// ============================================
// 6. ZONE CLASSIFICATION TESTER
// ============================================

import { classifyZone, getZoneThresholds } from '../utils/zoneCalculator';
import { calculateDistance } from '../utils/geoUtils';

function ZoneClassificationTest() {
  // Test hospital data
  const testHospital = {
    id: 'test_001',
    name: 'Test Hospital',
    totalBeds: 100,
    availableBeds: 20,
    occupancyRate: 80,
    dengueCases: 25,
    fluCases: 8,
    customDiseases: [],
    region: 'urban',
  };

  const zone = classifyZone(testHospital, 'monsoon');
  const thresholds = getZoneThresholds(testHospital, 'monsoon');

  return (
    <pre>
      {JSON.stringify({
        hospital: testHospital.name,
        calculated_zone: zone,
        thresholds: thresholds,
      }, null, 2)}
    </pre>
  );
}

// ============================================
// 7. DISTANCE CALCULATOR
// ============================================

function DistanceCalculator() {
  const { location } = useGeolocation();
  const { zones } = useZoneData();

  return (
    <div>
      {location && zones.map(hospital => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          hospital.latitude,
          hospital.longitude
        );
        return (
          <div key={hospital.id}>
            {hospital.name}: {distance.toFixed(2)} km
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// 8. DATA VALIDATION EXAMPLE
// ============================================

import { validateDiseaseData, calculateDataQuality } from '../services/diseaseService';

function DataValidator() {
  const testData = {
    diseaseId: 'dengue',
    newCases: 25,
    recoveredCases: 10,
    fatalCases: 2,
  };

  const validated = validateDiseaseData(testData);
  const quality = calculateDataQuality(validated);

  return (
    <div>
      <h3>Data Validation</h3>
      <p>Original: {JSON.stringify(testData)}</p>
      <p>Validated: {JSON.stringify(validated)}</p>
      <p>Quality Score: {quality}%</p>
    </div>
  );
}

export {
  SimpleZoneViewer,
  NearbyHospitalsView,
  AlertMonitor,
  DiseaseReporter,
  ZoneDashboard,
  ZoneClassificationTest,
  DistanceCalculator,
  DataValidator,
};
