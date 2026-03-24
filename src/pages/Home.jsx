import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import DiseaseMap from '../components/DiseaseMap'
import Slideshow from '../components/Slideshow'
import Footer from '../components/Footer'

function Home() {
  const navigate = useNavigate()

  const [healthAlert, setHealthAlert] = useState('')
  const [alerts, setAlerts] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } })
  }

  useEffect(() => {
    const alert = localStorage.getItem('healthAlert') || ''
    setHealthAlert(alert)

    const q = query(collection(db, 'alerts'), orderBy('date', 'desc'))
    const unsubscribeAlerts = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAlerts(alertsData)
    })

    const unsubscribeHospitals = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      let hospitalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Fallback with Pune and Kolhapur Municipal/Government Hospitals
      if (hospitalsData.length === 0) {
        hospitalsData = [
          // Pune Hospitals
          { name: 'Sassoon General Hospital (Govt)', availableBeds: 150, phone: '020 2612 8000', lat: 18.5238, lng: 73.8744 },
          { name: 'Kamla Nehru General Hospital (PMC)', availableBeds: 60, phone: '020 2555 4500', lat: 18.5284, lng: 73.8569 },
          { name: 'Rajiv Gandhi Hospital (PMC)', availableBeds: 110, phone: '020 2112 3000', lat: 18.4550, lng: 73.8568 },
          
          // Kolhapur Hospitals (Added so Kolhapur users see results!)
          { name: 'CPR Government Hospital (Govt, Kolhapur)', availableBeds: 250, phone: '0231 264 4251', lat: 16.6994, lng: 74.2238 },
          { name: 'Savitribai Phule Hospital (KMC, Kolhapur)', availableBeds: 45, phone: '0231 254 0000', lat: 16.7050, lng: 74.2433 },
          { name: 'Panchganga Hospital (KMC, Kolhapur)', availableBeds: 25, phone: '0231 222 1234', lat: 16.6850, lng: 74.2300 }
        ];
      } else {
        // Filter municipal and government hospitals if they exist in firestore
        const targetHospitals = hospitalsData.filter(h => {
          if (!h.name) return false;
          const nameLower = h.name.toLowerCase();
          return nameLower.includes('municipal') || nameLower.includes('pmc') || nameLower.includes('corporation') || 
                 nameLower.includes('gov') || nameLower.includes('civil') || nameLower.includes('district') || 
                 h.isMunicipal || h.isGovernment;
        });
        if (targetHospitals.length > 0) {
          hospitalsData = targetHospitals;
        }
      }
      setHospitals(hospitalsData)
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeHospitals()
    }
  }, [])

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  const handleGetLocation = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          const hospitalsWithDistances = hospitals.map(h => {
             const dist = calculateDistance(userLat, userLng, h.lat, h.lng);
             return {
               ...h,
               rawDistance: dist,
               distance: dist === 9999 ? 'N/A' : dist.toFixed(1) + ' km'
             };
          }).filter(h => h.rawDistance <= 100) // Only show within 100 km
            .sort((a, b) => a.rawDistance - b.rawDistance);
          
          setHospitals(hospitalsWithDistances);
          setLocationEnabled(true);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Please enable location access to find nearby hospitals.");
          setLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
    }
  };

  return (
    <>
      <Navbar />
      {/* Landing Page Hero Section */}
      <div className="landing-page">
        {/* New Hero Section */}
        <div style={{ backgroundColor: '#ffffff', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FEF3C7', color: '#D97706', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '24px' }}>
                <span style={{color: '#D97706'}}>✔</span> #1 Health & Wellness Platform in City
              </div>
              
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', margin: '0 0 20px 0' }}>
                City's Most Trusted <br/>Health Management System
              </h1>
              
              <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '20px', lineHeight: '1.6' }}>
                Professional Healthcare Services That Drive Real Results | 4.9★ Rating | 12+ Top Hospitals
              </p>
              
              <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
                Get direct access to real-time hospital bed availability and disease tracking with zero delay. Stay safe and informed.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <button 
                  onClick={() => document.getElementById('citizen-section').scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '14px 28px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{fontSize: '1.2rem'}}>📄</span> Find Hospitals
                </button>
              </div>
            </div>
            
            {/* Right Column (Map) */}
            <div style={{ flex: '1 1 500px', position: 'relative' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', height: '480px', position: 'relative', background: '#f8fafc' }}>
                <DiseaseMap />
              </div>
            </div>
            
          </div>
        </div>

        {/* Global Schemes Slideshow */}
        <Slideshow />

        {/* Citizen Portal Section merged from Citizen.jsx */}
        <div id="citizen-section" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>

          {healthAlert && (
            <div className="alert-banner danger" style={{ marginBottom: '15px' }}>
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h4>Health Alert</h4>
                <p>{healthAlert}</p>
              </div>
            </div>
          )}

          {alerts.map(alert => (
            <div key={alert.id} className="alert-banner danger" style={{ marginBottom: '15px' }}>
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h4>Health Alert</h4>
                <p>{alert.message}</p>
                {alert.date && (
                  <small style={{ marginTop: '5px', display: 'block', opacity: 0.8 }}>
                    {alert.date?.toDate ? alert.date.toDate().toLocaleString() : new Date(alert.date).toLocaleString()}
                  </small>
                )}
              </div>
            </div>
          ))}

          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ cursor: 'pointer' }}>
              <div className="stat-icon">🏥</div>
              <h3 style={{ marginTop: '10px' }}>Find Hospital</h3>
              <p style={{ color: '#64748b', marginTop: '5px' }}>Locate nearby medical facilities</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer' }}>
              <div className="stat-icon">🩺</div>
              <h3 style={{ marginTop: '10px' }}>Health Tips</h3>
              <p style={{ color: '#64748b', marginTop: '5px' }}>Daily health recommendations</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📋</div>
              <h3 style={{ marginTop: '10px' }}>Medical History</h3>
              <p style={{ color: '#64748b', marginTop: '5px' }}>View your health records</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📞</div>
              <h3 style={{ marginTop: '10px' }}>Emergency</h3>
              <p style={{ color: '#64748b', marginTop: '5px' }}>Call emergency services</p>
            </div>
          </div>

          <div className="chart-container" style={{ marginTop: '40px' }}>
            <h3 className="chart-title">🏥 Nearby Government & Municipal Hospitals</h3>
            
            {!locationEnabled ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📍</div>
                <h4 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '10px' }}>Find Hospitals Near You</h4>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Turn on your location to instantly find nearby Government and Municipal hospitals within 30 km.</p>
                <button 
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                  style={{ padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loadingLocation ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingLocation ? 0.7 : 1 }}
                >
                  {loadingLocation ? '📍 Locating...' : '📍 Use My Current Location'}
                </button>
              </div>
            ) : hospitals.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                <h4 style={{ color: '#991b1b', fontSize: '1.1rem' }}>No Govt. Hospitals Found</h4>
                <p style={{ color: '#b91c1c' }}>सध्या तुमच्या 100 किमी परिसरात कोणतेही सरकारी किंवा म्युनिसिपल हॉस्पिटल उपलब्ध नाही किंवा नोंदणीकृत नाही.</p>
              </div>
            ) : (
              <div className="hospital-grid">
                {hospitals.map((hospital, index) => (
                  <div key={index} className="hospital-card">
                    <h3>{hospital.name}</h3>
                    <div className="hospital-info">
                      <span>Distance</span>
                      <span style={{ fontWeight: 'bold', color: '#2563EB' }}>{hospital.distance || 'N/A'}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Available Beds</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{hospital.availableBeds || hospital.available || 0}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Contact</span>
                      <span>{hospital.phone}</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '15px' }}
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`, '_blank')}
                    >
                      Get Directions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-container" style={{ marginTop: '40px' }}>
            <h3 className="chart-title">💡 Health Tips</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💧</div>
                <h3>Stay Hydrated</h3>
                <p>Drink at least 8 glasses of water daily to maintain optimal health.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">😴</div>
                <h3>Get Enough Sleep</h3>
                <p>Aim for 7-9 hours of quality sleep each night for better immunity.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏃</div>
                <h3>Regular Exercise</h3>
                <p>Stay active with at least 30 minutes of moderate exercise daily.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}

export default Home
