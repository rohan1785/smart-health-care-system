import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function DiseaseMap() {
  const zones = [
    // Kolhapur
    { name: 'Kolhapur - Viral Fever / ARI', lat: 16.7050, lng: 74.2433, casesStr: '1800–2500 Per Month', risk: 'High', radius: 40 },
    { name: 'Kolhapur - Dengue / Malaria', lat: 16.7350, lng: 74.2633, casesStr: '250–600 Per Month', risk: 'Med-High', radius: 30 },
    { name: 'Kolhapur - Gastro Diseases', lat: 16.6850, lng: 74.2233, casesStr: '400–900 Per Month', risk: 'Medium', radius: 25 },
    { name: 'Kolhapur - Cardiac Issues', lat: 16.7150, lng: 74.2133, casesStr: '300–700 Per Month', risk: 'Medium', radius: 25 },
    
    // Satara
    { name: 'Satara - Dengue / Malaria', lat: 17.6805, lng: 74.0183, casesStr: '400–900 Per Month', risk: 'High', radius: 35 },
    { name: 'Satara - Viral Fever / ARI', lat: 17.7105, lng: 74.0383, casesStr: '1500–2200 Per Month', risk: 'High', radius: 40 },
    { name: 'Satara - Swine Flu (H1N1)', lat: 17.6505, lng: 73.9983, casesStr: '50–150 Per Month', risk: 'Low-Med', radius: 15 },
    { name: 'Satara - Gastro Diseases', lat: 17.6950, lng: 73.9883, casesStr: '500–1000 Per Month', risk: 'Medium', radius: 28 },
  ]

  const getColor = (risk) => {
    switch (risk) {
      case 'High': return '#ef4444' // Red
      case 'Med-High': return '#f97316' // Orange
      case 'Medium': return '#f59e0b' // Amber/Yellow-Orange
      case 'Low-Med': return '#eab308' // Yellow
      case 'Low': return '#10b981' // Green
      default: return '#64748b'
    }
  }

  return (
    <MapContainer
      center={[17.2, 74.1]} // Centered between Kolhapur and Satara
      zoom={9}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((zone, i) => (
        <CircleMarker
          key={i}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          pathOptions={{
            color: getColor(zone.risk),
            fillColor: getColor(zone.risk),
            fillOpacity: 0.6,
            weight: 2
          }}
        >
          <Popup>
            <div style={{ padding: '5px' }}>
              <strong style={{ fontSize: '1.1rem' }}>{zone.name}</strong>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
              <p style={{ margin: '5px 0' }}><strong>Approx Cases:</strong> {zone.casesStr}</p>
              <p style={{ margin: '5px 0' }}><strong>Risk Level:</strong> <span style={{
                color: getColor(zone.risk),
                fontWeight: 'bold'
              }}>{zone.risk}</span></p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export default DiseaseMap
