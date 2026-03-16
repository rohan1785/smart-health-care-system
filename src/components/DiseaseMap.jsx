import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function DiseaseMap() {
  const zones = [
    { name: 'Ward A', lat: 18.5204, lng: 73.8567, cases: 40, risk: 'High' },
    { name: 'Ward B', lat: 18.5300, lng: 73.8650, cases: 25, risk: 'Medium' },
    { name: 'Ward C', lat: 18.5100, lng: 73.8500, cases: 15, risk: 'Low' },
    { name: 'Ward D', lat: 18.5250, lng: 73.8400, cases: 8, risk: 'Low' },
    { name: 'Ward E', lat: 18.5350, lng: 73.8700, cases: 32, risk: 'High' },
  ]

  const getColor = (risk) => {
    switch (risk) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#10b981'
      default: return '#64748b'
    }
  }

  const getRadius = (cases) => {
    return Math.min(Math.max(cases / 2, 15), 40)
  }

  return (
    <MapContainer
      center={[18.5204, 73.8567]}
      zoom={13}
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
          radius={getRadius(zone.cases)}
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
              <p style={{ margin: '5px 0' }}><strong>Cases:</strong> {zone.cases}</p>
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

