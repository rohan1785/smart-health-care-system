import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

function Citizen() {
  const [healthAlert, setHealthAlert] = useState('')
  const [alerts, setAlerts] = useState([])
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    const qAlertsGlobal = query(collection(db, 'sentAlerts'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeGlobalAlert = onSnapshot(qAlertsGlobal, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const msg = `Alert for ${data.hospitalName}: ${data.message}`;
        if (localStorage.getItem('dismissedAlertId') !== doc.id) {
          setHealthAlert(msg);
          localStorage.setItem('currentAlertId', doc.id);
        } else {
          setHealthAlert('');
        }
      } else {
        setHealthAlert('');
      }
    });

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
      
      // Provide fallback data if firestore collection is empty
      if (hospitalsData.length === 0) {
        hospitalsData = [
          { name: 'City Central Hospital', distance: '2.4 km', availableBeds: 45, phone: '+1 234 567 8900' },
          { name: 'Metro Health Care', distance: '3.8 km', availableBeds: 12, phone: '+1 234 567 8901' },
          { name: 'Sunrise Medical Center', distance: '5.1 km', availableBeds: 110, phone: '+1 234 567 8902' }
        ];
      }
      setHospitals(hospitalsData)
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeHospitals()
      unsubscribeGlobalAlert()
    }
  }, [])

  return (
    <div>

      <div className="page-header">
        <h1 className="page-title">Citizen Health Portal</h1>
        <p className="page-subtitle">Check health alerts and find nearby hospitals</p>
      </div>

      {healthAlert && (
        <div className="alert-banner danger" style={{ marginBottom: '15px', position: 'relative' }}>
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <h4>Health Alert Active</h4>
            <p>{healthAlert}</p>
          </div>
          <button 
            onClick={() => { localStorage.setItem('dismissedAlertId', localStorage.getItem('currentAlertId')); setHealthAlert(''); }}
            style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#991b1b' }}
            title="Dismiss active alert"
          >
            ✖
          </button>
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

      <div className="chart-container">
        <h3 className="chart-title">🏥 Nearby Hospitals</h3>

        <div className="hospital-grid">
          {hospitals.map((hospital, index) => (
            <div key={index} className="hospital-card">

              <h3>{hospital.name}</h3>

              <div className="hospital-info">
                <span>Distance</span>
                <span>{hospital.distance}</span>
              </div>

              <div className="hospital-info">
                <span>Available Beds</span>
                <span style={{ color: '#10b981' }}>{hospital.availableBeds || hospital.available || 0}</span>
              </div>

              <div className="hospital-info">
                <span>Contact</span>
                <span>{hospital.phone}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '15px' }}
              >
                Get Directions
              </button>

            </div>
          ))}
        </div>

      </div>

      <div className="chart-container">
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
  )
}

export default Citizen