# Disease Monitoring System with GIS - Implementation Guide

## Overview

This document describes the complete GIS-based disease monitoring system with real-time zone classification and updates.

## Architecture Implemented

### Core Components

#### 1. **Zone Classification Engine** (`src/utils/zoneCalculator.js`)
- Automatic zone color assignment (RED/YELLOW/GREEN)
- Dynamic threshold adjustment based on:
  - Hospital size (bed count)
  - Season (monsoon vs normal)
  - Region type (urban vs rural)
  - Historical disease patterns

**Zone Levels:**
- **RED**: Risk Score ≥ 70 (High Risk)
- **YELLOW**: 35 ≤ Risk Score < 70 (Medium Risk)
- **GREEN**: Risk Score < 35 (Low Risk)

**Composite Risk Formula:**
```
Risk = (Dengue × 0.35) + (Flu × 0.25) + (Custom × 0.15) + (Bed×0.15) + (Occupancy×0.1)
```

#### 2. **Geographic Utilities** (`src/utils/geoUtils.js`)
- Haversine distance calculation
- Bounding box generation
- Hospital proximity search
- GeoHash encoding
- Zone overlap detection

#### 3. **Services**

**Disease Service** (`src/services/diseaseService.js`)
- Report disease cases (hospital users)
- Verify disease reports (authority)
- Detect anomalies (spike detection)
- Track disease trends

**Zone Service** (`src/services/zoneService.js`)
- Calculate/update zones in real-time
- Maintain zone change history
- Generate zone change alerts
- Provide zone statistics

### 4. **Custom Hooks**

**useZoneData** (`src/hooks/useZoneData.js`)
```jsx
const {
  zones,           // All zones with updated status
  selectedZone,    // Currently selected zone
  zoneStats,       // Statistics (critical count, color distribution, etc.)
  loading,
  error,
  getZonesByColor,
  getCriticalZones,
  getZoneByHospitalId,
  findNearbyZones
} = useZoneData(hospitalId?, autoCalculate?);
```

**useGeolocation** (`src/hooks/useGeolocation.js`)
```jsx
const {
  location,        // { latitude, longitude, accuracy, timestamp }
  loading,
  error,
  getCurrentLocation,
  getNearbyHospitals,
  watchLocation
} = useGeolocation();
```

**useAlerts** (`src/hooks/useAlerts.js`)
```jsx
const {
  alerts,
  unreadCount,
  loading,
  error,
  handleMarkAsRead,
  handleMarkAllAsRead,
  getCriticalAlerts,
  getUnreadAlerts,
  showNotification,
  requestNotificationPermission
} = useAlerts(hospitalId?, userId?, hoursBack?);
```

## Implementation Examples

### 1. Citizen Module - View Nearby Hospitals on Map

```jsx
import useGeolocation from '../hooks/useGeolocation';
import useZoneData from '../hooks/useZoneData';
import { formatZoneColor, formatDistance } from '../utils/formatters';

function CitizenMap() {
  const { location, getNearbyHospitals } = useGeolocation();
  const { zones } = useZoneData();

  const nearbyHospitals = location ? getNearbyHospitals(zones, 5) : [];

  return (
    <div>
      <h2>Hospitals Near You</h2>
      {location && <p>Your location: {location.latitude}, {location.longitude}</p>}
      
      <div style={{ height: '500px' }}>
        {/* Leaflet Map here */}
      </div>

      <ul>
        {nearbyHospitals.map(hospital => {
          const zoneColor = formatZoneColor(hospital.zoneStatus?.color);
          return (
            <li key={hospital.id}>
              <strong>{hospital.name}</strong>
              <p className={zoneColor.class}>{zoneColor.text}</p>
              <p>Distance: {formatDistance(hospital.distanceKm)}</p>
              <p>Contact: {hospital.contactNumber}</p>
              <button onClick={() => openGoogleMaps(hospital.latitude, hospital.longitude)}>
                Get Directions
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

### 2. Authority Module - Monitor Critical Zones

```jsx
import useZoneData from '../hooks/useZoneData';
import { getZoneStatistics } from '../services/zoneService';

function AuthorityDashboard() {
  const { zones, zoneStats, getCriticalZones } = useZoneData();
  
  const criticalZones = getCriticalZones();

  return (
    <div>
      <h2>Zone Overview</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Hospitals</h3>
          <p>{zoneStats?.totalHospitals}</p>
        </div>
        <div className="stat-card alert">
          <h3>🔴 Critical Zones (RED)</h3>
          <p>{zoneStats?.byColor?.RED}</p>
        </div>
        <div className="stat-card warning">
          <h3>🟡 Medium Risk (YELLOW)</h3>
          <p>{zoneStats?.byColor?.YELLOW}</p>
        </div>
        <div className="stat-card safe">
          <h3>🟢 Safe (GREEN)</h3>
          <p>{zoneStats?.byColor?.GREEN}</p>
        </div>
      </div>

      <div className="critical-zones">
        <h3>⚠️ Critical Zones Requiring Action</h3>
        {criticalZones.map(zone => (
          <div key={zone.id} className="alert-card">
            <h4>{zone.name}</h4>
            <p><strong>Risk Score:</strong> {zone.zoneStatus.riskScore.toFixed(2)}</p>
            <p><strong>Reason:</strong> {zone.zoneStatus.reason}</p>
            <p><strong>Dengue Cases:</strong> {zone.dengueCases}</p>
            <p><strong>Available Beds:</strong> {zone.availableBeds}/{zone.totalBeds}</p>
            <button onClick={() => verifyAndAct(zone.id)}>Take Action</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Hospital Module - Update Disease Data

```jsx
import { useState } from 'react';
import { reportDiseaseCase, detectAnomalies } from '../services/diseaseService';
import { updateHospitalZone } from '../services/zoneService';

function HospitalDiseaseForm({ hospitalId, hospitalName }) {
  const [dengue, setDengue] = useState('');
  const [flu, setFlu] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Report cases
      const result = await reportDiseaseCase(hospitalId, {
        diseaseId: 'dengue',
        newCases: parseInt(dengue),
        recoveredCases: 0,
        fatalCases: 0,
      });

      // Fetch hospital data and update zone
      const hospitalData = {
        id: hospitalId,
        name: hospitalName,
        dengueCases: parseInt(dengue),
        fluCases: parseInt(flu),
        totalBeds: 100, // Fetch from DB
        availableBeds: 45, // Fetch from DB
      };

      const zoneUpdate = await updateHospitalZone(hospitalId, hospitalData);

      if (zoneUpdate.zoneChanged) {
        setMessage(`✅ Data submitted. Zone updated: ${zoneUpdate.oldColor} → ${zoneUpdate.newColor}`);
      } else {
        setMessage('✅ Data submitted for verification');
      }

      setDengue('');
      setFlu('');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Report Disease Cases - {hospitalName}</h3>
      
      <div className="form-group">
        <label>Dengue Cases:</label>
        <input
          type="number"
          value={dengue}
          onChange={(e) => setDengue(e.target.value)}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label>Flu Cases:</label>
        <input
          type="number"
          value={flu}
          onChange={(e) => setFlu(e.target.value)}
          min="0"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
```

## Database Schema Integration

### Hospital Document
```javascript
{
  id: "hospital_001",
  name: "City Hospital",
  latitude: 17.6805,
  longitude: 74.0183,
  address: "Main Street",
  city: "Satara",
  ward: "Ward 5",
  region: "urban",
  
  // Operational
  totalBeds: 100,
  availableBeds: 45,
  occupancyRate: 55,
  
  // Disease data
  dengueCases: 12,
  fluCases: 8,
  customDiseases: [
    { name: "Typhoid", cases: 3, severity: 1 }
  ],
  
  // Contact
  contactNumber: "+91-9876543210",
  email: "hospital@example.com",
  operatingHours: {
    open: "06:00",
    close: "22:00",
    emergency24h: true
  },
  
  // Zone status (auto-calculated)
  zoneStatus: {
    color: "YELLOW",
    riskScore: 45.8,
    reason: "Medium risk: Composite score 45.80",
    affectedArea: {
      type: "circle",
      radius: 2300,
      coordinates: [17.6805, 74.0183]
    },
    lastCalculated: Timestamp
  }
}
```

## Real-Time Update Flow

```
1. Hospital User Updates Disease Data
   └─ PUT /api/hospital/:id/diseases
   
2. Backend Validates & Stores
   ├─ Check data quality
   ├─ Detect anomalies
   └─ Recalculate zone
   
3. Zone Classification Engine
   ├─ Calculate risk score
   ├─ Apply dynamic thresholds
   └─ Determine color
   
4. Change Detection
   ├─ Compare with previous zone
   └─ If changed → Trigger alert
   
5. Broadcast to All Clients (WebSocket)
   ├─ Authority: Update dashboard
   ├─ Citizens: Map color change
   └─ Hospital: Confirmation
   
6. Store Change History
   └─ zoneHistory collection
   
7. If Zone = RED
   ├─ Generate SMS alerts
   ├─ Notify affected citizens
   └─ Log incident
```

## Key Features

### ✅ Implemented
- [x] Zone classification with dynamic thresholds
- [x] Real-time zone calculations
- [x] Geographic utilities (distance, overlap, nearby hospitals)
- [x] Disease data validation & anomaly detection
- [x] Zone change tracking & history
- [x] User geolocation & nearby hospital search
- [x] Alert system with notifications
- [x] Data formatters for UI display
- [x] Custom React hooks for data management

### 🔜 To Implement
- [ ] WebSocket server for real-time broadcasts
- [ ] SMS gateway integration (Twilio/AWS SNS)
- [ ] Daily cron job for zone recalculation
- [ ] Data verification workflow (Authority approval)
- [ ] Enhanced DiseaseMap component with live zones
- [ ] Zone analytics & trend charts
- [ ] PDF report generation
- [ ] Multi-language support

## Integration Checklist

### For Citizen Module
- [ ] Import `useGeolocation` and `useZoneData` hooks
- [ ] Display map with zone overlays
- [ ] Show nearby hospitals with distance
- [ ] Add "Get Directions" button (Google Maps)
- [ ] Display zone color and risk level

### For Authority Module
- [ ] Display zone statistics dashboard
- [ ] List critical (RED) zones
- [ ] Show zone change history
- [ ] Implement data verification workflow
- [ ] Add manual alert creation

### For Hospital Module
- [ ] Create disease reporting forms
- [ ] Add bed availability updates
- [ ] Display real-time zone status
- [ ] Show alerts affecting this hospital
- [ ] Implement data editing & corrections

## Performance Considerations

1. **Zone Calculation**: Pre-calculate at app load, update on data change
2. **Caching**: Use localStorage for recent zones (5-min TTL)
3. **Real-Time**: Use Firebase onSnapshot for automatic updates
4. **Geolocation**: Cache location, watch only when needed
5. **Maps**: Use marker clustering for >100 hospitals

## Error Handling

All services include try-catch blocks and return error states:
```javascript
const { zones, loading, error } = useZoneData();

if (error) {
  return <div className="error-message">{error}</div>;
}
```

## Testing

```javascript
// Test zone calculator
import { classifyZone } from '../utils/zoneCalculator';

const hospital = {
  dengueCases: 25,
  fluCases: 5,
  totalBeds: 100,
  availableBeds: 20,
  occupancyRate: 80,
};

const zone = classifyZone(hospital);
console.assert(zone.color === 'RED', 'Should be RED');
console.log(zone.riskScore); // 72.5
```

## Next Steps

1. Integrate WebSocket for real-time updates
2. Implement SMS alerting on zone changes
3. Add data verification workflow
4. Deploy cron jobs for daily recalculation
5. Enhance DiseaseMap with live overlays
6. Add analytics dashboard
7. Implement PDF reports

---

**System Status**: ✅ Core architecture implemented, ready for UI integration
