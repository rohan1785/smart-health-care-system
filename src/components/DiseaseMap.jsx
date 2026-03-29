import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import 'leaflet/dist/leaflet.css'

function DiseaseMap() {
  const [selectedZone, setSelectedZone] = useState(null)
  const [zones, setZones] = useState([])

  // Hospital locations (add actual coordinates for each hospital)
  const hospitalLocations = {
    'Government Medical College And Hospital Miraj': { lat: 16.8302, lng: 74.6077 },
    'Savitribai Phule Hospital kolhapur': { lat: 16.7050, lng: 74.2433 },
    'CPR Hospital Kolhapur': { lat: 16.6952, lng: 74.2430 },
    'Sangli District General Hospital': { lat: 16.8524, lng: 74.5815 },
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      const hospitalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Convert hospital data to zones
      const newZones = hospitalsData.map((hospital, index) => {
        // Get hospital location
        const fallbackLat = 16.7 + (index * 0.1);
        const fallbackLng = 74.2 + (index * 0.1);
        
        const location = {
          lat: hospital.lat || (hospitalLocations[hospital.name] ? hospitalLocations[hospital.name].lat : fallbackLat),
          lng: hospital.lng || (hospitalLocations[hospital.name] ? hospitalLocations[hospital.name].lng : fallbackLng)
        };
        
        // Calculate total disease cases from customDiseases array
        let totalCases = 0
        let diseaseBreakdown = {}
        
        if (hospital.customDiseases && Array.isArray(hospital.customDiseases)) {
          hospital.customDiseases.forEach(disease => {
            const cases = parseInt(disease.cases) || 0
            totalCases += cases
            if (disease.name && cases > 0) {
              diseaseBreakdown[disease.name] = cases
            }
          })
        }
        
        // Also check old format fields for backward compatibility
        const Dengue = parseInt(hospital.Dengue) || 0
        const Flu = parseInt(hospital.Flu) || 0
        const aids = parseInt(hospital.aids) || 0
        const corona = parseInt(hospital.corona) || 0
        const dengu = parseInt(hospital.dengu) || 0
        const flu = parseInt(hospital.flu) || 0
        const hiv_virus = parseInt(hospital.hiv_virus) || 0
        const lung_cancer = parseInt(hospital.lung_cancer) || 0
        
        // Add old format to total if customDiseases is empty
        if (totalCases === 0) {
          totalCases = Dengue + Flu + aids + corona + dengu + flu + hiv_virus + lung_cancer
          if (Dengue > 0) diseaseBreakdown['Dengue'] = Dengue
          if (Flu > 0 || flu > 0) diseaseBreakdown['Flu'] = Flu + flu
          if (aids > 0) diseaseBreakdown['AIDS'] = aids
          if (corona > 0) diseaseBreakdown['Corona'] = corona
          if (dengu > 0) diseaseBreakdown['Dengu'] = dengu
          if (hiv_virus > 0) diseaseBreakdown['HIV Virus'] = hiv_virus
          if (lung_cancer > 0) diseaseBreakdown['Lung Cancer'] = lung_cancer
        }
        
        console.log(`${hospital.name}:`, { totalCases, diseaseBreakdown, customDiseases: hospital.customDiseases })
        
        const availableBeds = parseInt(hospital.availableBeds) || parseInt(hospital.currentBeds) || 0
        const totalBeds = parseInt(hospital.totalBeds) || 100
        const occupancyRate = totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0

        // Determine risk level based on BOTH diseases AND bed availability
        let riskColor = 'GREEN'
        let riskScore = 0
        
        // Calculate disease severity (cases per available bed)
        const casesPerBed = availableBeds > 0 ? totalCases / availableBeds : totalCases
        
        // RED ZONE: High disease count OR high occupancy OR high cases-per-bed ratio
        if (totalCases >= 80 || occupancyRate >= 85 || casesPerBed >= 3) {
          riskColor = 'RED'
          riskScore = 85 + Math.min(15, Math.floor(totalCases / 20))
        } 
        // ORANGE ZONE: Medium-high disease count OR medium-high occupancy
        else if (totalCases >= 50 || occupancyRate >= 70 || casesPerBed >= 2) {
          riskColor = 'ORANGE'
          riskScore = 65 + Math.min(20, Math.floor(totalCases / 10))
        } 
        // YELLOW ZONE: Medium disease count OR medium occupancy
        else if (totalCases >= 25 || occupancyRate >= 50 || casesPerBed >= 1) {
          riskColor = 'YELLOW'
          riskScore = 45 + Math.min(20, Math.floor(totalCases / 5))
        } 
        // GREEN ZONE: Low disease count AND low occupancy
        else {
          riskColor = 'GREEN'
          riskScore = 20 + Math.min(25, Math.floor(totalCases + occupancyRate / 4))
        }

        // Find highest disease
        const diseases = Object.entries(diseaseBreakdown).map(([name, count]) => ({ name, count }))
        const topDisease = diseases.length > 0 
          ? diseases.reduce((max, d) => d.count > max.count ? d : max) 
          : { name: 'No Active Cases', count: 0 }

        return {
          id: hospital.id,
          hospitalName: hospital.name,
          lat: location.lat,
          lng: location.lng,
          totalCases: totalCases,
          availableBeds: availableBeds,
          totalBeds: totalBeds,
          occupancyRate: occupancyRate.toFixed(1),
          topDisease: topDisease.name,
          topDiseaseCount: topDisease.count,
          diseases: diseaseBreakdown,
          zoneStatus: { color: riskColor, riskScore: riskScore },
          radius: 20 + Math.min(30, totalCases / 2)
        }
      })

      setZones(newZones)
    })

    return () => unsubscribe()
  }, [])

  const getColorByZone = (color) => {
    const colorMap = {
      RED: '#dc2626',
      ORANGE: '#f97316',
      YELLOW: '#fbbf24',
      GREEN: '#10b981',
      GRAY: '#9ca3af',
    }
    return colorMap[color] || '#9ca3af'
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer center={[17.2, 74.1]} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {zones.map((zone) => {
          const color = getColorByZone(zone.zoneStatus?.color)

          return (
            <CircleMarker
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              fillColor={color}
              color={color}
              weight={2}
              opacity={1}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{zone.hospitalName}</strong>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Top Disease:</strong> {zone.topDisease} ({zone.topDiseaseCount} cases)
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Total Cases:</strong> {zone.totalCases}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Available Beds:</strong> {zone.availableBeds} / {zone.totalBeds}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Occupancy:</strong> {zone.occupancyRate}%
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Risk Level:</strong> <span style={{ color: color, fontWeight: 'bold' }}>{zone.zoneStatus?.color}</span>
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                    <strong>Risk Score:</strong> {zone.zoneStatus?.riskScore}/100
                  </p>
                  
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Disease Breakdown:</strong>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#475569' }}>
                      {Object.entries(zone.diseases).map(([name, count]) => (
                        <div key={name}>• {name}: {count}</div>
                      ))}
                      {Object.keys(zone.diseases).length === 0 && <div style={{ fontStyle: 'italic', color: '#9ca3af' }}>No active diseases</div>}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default DiseaseMap
