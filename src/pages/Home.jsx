import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
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
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedHospitalForFeedback, setSelectedHospitalForFeedback] = useState('')
  const [feedbackCitizenName, setFeedbackCitizenName] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackType, setFeedbackType] = useState('Positive Experience')
  // AI Symptom Checker State
  const [symptoms, setSymptoms] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomError, setSymptomError] = useState('');

  const commonSymptomsList = [
    "Fever", "Dry Cough", "Headache", "Sore Throat", 
    "Fatigue", "Nausea", "Body Ache", "Shortness of Breath", 
    "Loss of Taste/Smell", "Chills"
  ];

  const handleAddSymptom = (symp) => {
    if (symptoms.toLowerCase().includes(symp.toLowerCase())) return;
    setSymptoms(prev => prev ? `${prev}, ${symp}` : symp);
  };

  const handleOpenFeedback = (hospitalName) => {
    setSelectedHospitalForFeedback(hospitalName)
    setFeedbackCitizenName('')
    setFeedbackRating(0)
    setFeedbackType('Positive Experience')
    setFeedbackDesc('')
    setShowFeedbackModal(true)
  }

  const submitFeedback = async () => {
    if(!feedbackCitizenName.trim() || feedbackRating === 0 || feedbackDesc.trim().length < 20) {
      alert("Please fill all fields. Description must be at least 20 characters and rating > 0.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "hospitalFeedback"), {
        hospitalName: selectedHospitalForFeedback,
        citizenName: feedbackCitizenName,
        rating: feedbackRating,
        feedbackType: feedbackType,
        description: feedbackDesc,
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("Feedback submitted successfully! Thank you.");
      setShowFeedbackModal(false);
    } catch(err) {
      console.error(err);
      alert("Error submitting feedback. Try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) {
      setSymptomError("Please enter your symptoms before checking.");
      return;
    }
    setSymptomError('');
    setSymptomLoading(true);
    setSymptomResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
      });
      
      const data = await response.json();
      
      setSymptomResult({
        disease: data.disease || data.prediction || data.result || "Undiagnosed Condition",
        precautions: data.precautions || [
          "Consult a verified doctor immediately.",
          "Keep track of your symptoms.",
          "Drink plenty of water and rest."
        ]
      });
    } catch(err) {
      console.error(err);
      setSymptomError("Arogya360 AI is currently unavailable (Failed to connect to ML Backend /api/predict). Please ensure the ML backend is running.");
    } finally {
      setSymptomLoading(false);
    }
  };

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
      
      // Show all hospitals added via Authority dashboard
      if (hospitalsData.length > 0) {
        setHospitals(hospitalsData);
      } else {
        setHospitals([]);
      }
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
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          try {
            // Fetch real-world hospitals using OpenStreetMap Overpass API (radius: 10km)
            const query = `[out:json];(node["amenity"="hospital"](around:10000, ${userLat}, ${userLng});way["amenity"="hospital"](around:10000, ${userLat}, ${userLng}););out center;`;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            const realHospitals = data.elements.map(el => {
              const hLat = el.lat || el.center?.lat;
              const hLng = el.lon || el.center?.lon;
              const dist = calculateDistance(userLat, userLng, hLat, hLng);
              return {
                 name: el.tags?.name || "Local Health Center",
                 phone: el.tags?.phone || 'N/A',
                 rawDistance: dist,
                 distance: dist === 9999 ? 'Location unknown' : dist.toFixed(1) + ' km'
              };
            })
            // Filter out unnamed generic ones
            .filter(h => h.name !== "Local Health Center" && h.rawDistance !== 9999)
            .sort((a, b) => a.rawDistance - b.rawDistance)
            .slice(0, 15); // Show top 15 closest
            
            setNearbyHospitals(realHospitals);
            setLocationEnabled(true);
          } catch(error) {
            console.error("Error fetching external hospital data: ", error);
            alert("Could not load external hospitals at this time.");
          } finally {
            setLoadingLocation(false);
          }
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

          {/* Arogya360 AI Symptom Checker */}
          <div className="chart-container" style={{ marginTop: '40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <h3 className="chart-title" style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#0f172a' }}>🤖 Arogya360 AI Symptom Checker</h3>
            <p style={{ color: '#475569', marginBottom: '20px', fontSize: '1.05rem' }}>Enter your symptoms or select common symptoms below to get instant health guidance.</p>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '10px', fontWeight: 'bold' }}>Common Symptoms:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {commonSymptomsList.map((symp, idx) => (
                  <span 
                    key={idx} 
                    onClick={() => handleAddSymptom(symp)}
                    style={{ 
                      padding: '6px 14px', 
                      background: symptoms.toLowerCase().includes(symp.toLowerCase()) ? '#10b981' : '#e2e8f0', 
                      color: symptoms.toLowerCase().includes(symp.toLowerCase()) ? 'white' : '#475569', 
                      borderRadius: '20px', 
                      fontSize: '0.9rem', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: '500',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => { if(!symptoms.toLowerCase().includes(symp.toLowerCase())) e.target.style.background = '#cbd5e1' }}
                    onMouseLeave={(e) => { if(!symptoms.toLowerCase().includes(symp.toLowerCase())) e.target.style.background = '#e2e8f0' }}
                  >
                    {symptoms.toLowerCase().includes(symp.toLowerCase()) ? `✓ ${symp}` : `+ ${symp}`}
                  </span>
                ))}
              </div>
            </div>

            <textarea 
              value={symptoms} 
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., I have a severe headache, mild fever, and dry cough..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '120px', marginBottom: '16px', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical' }}
            />
            
            <button 
              onClick={handleCheckSymptoms} 
              disabled={symptomLoading}
              className="btn btn-primary"
              style={{ padding: '14px 28px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: symptomLoading ? 'not-allowed' : 'pointer', opacity: symptomLoading ? 0.7 : 1, transition: 'all 0.3s', fontSize: '1.05rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
            >
              {symptomLoading ? '⏳ Analyzing symptoms...' : '🔍 Check Symptoms'}
            </button>

            {symptomError && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '12px' }}>
                <span style={{fontWeight: 'bold'}}>⚠️ Error: </span> {symptomError}
              </div>
            )}

            {symptomResult && (
              <div style={{ marginTop: '30px', padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                <h4 style={{ color: '#0f172a', fontSize: '1.3rem', marginBottom: '15px' }}>
                  🩺 Possible Condition: <span style={{ color: '#dc2626', fontWeight: '800' }}>{symptomResult.disease}</span>
                </h4>
                
                <h5 style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '12px', fontWeight: '700' }}>📌 Recommended Precautions:</h5>
                <ul style={{ paddingLeft: '24px', color: '#334155', marginBottom: '30px', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  {symptomResult.precautions?.map((p, idx) => (
                    <li key={idx} style={{marginBottom: '6px'}}>{p}</li>
                  ))}
                  {(!symptomResult.precautions || symptomResult.precautions.length === 0) && (
                    <li style={{marginBottom: '6px'}}>Please consult a doctor immediately for proper guidance.</li>
                  )}
                </ul>

                <h5 style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '20px', fontWeight: '700' }}>🏥 Recommended Hospitals Nearby:</h5>
                <div className="hospital-grid">
                  {hospitals.slice(0, 2).map((hospital, index) => (
                    <div key={index} className="hospital-card" style={{ borderTop: '4px solid #10b981', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, paddingRight: '25px', color: '#1e293b' }}>{hospital.name}</h3>
                        <div title="Verified Facility" style={{ color: '#10b981', fontSize: '1.1rem', position: 'absolute', right: '20px', top: '20px', background: '#d1fae5', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✓</div>
                      </div>
                      <div className="hospital-info">
                        <span>Available Beds</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{hospital.availableBeds || hospital.available || 0}</span>
                      </div>
                      <div className="hospital-info">
                        <span>Contact</span>
                        <span>{hospital.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`, '_blank')}
                        >
                          Get Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="chart-container" style={{ marginTop: '40px', background: locationEnabled ? '#f8fafc' : 'white', border: locationEnabled ? '1px solid #e2e8f0' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                📍 Nearby Hospitals
                {locationEnabled && <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="shcb-dot" style={{width:'6px', height:'6px', display:'inline-block'}}></span> Using your location</span>}
              </h3>
              {!locationEnabled && (
                <button 
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                  style={{ padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loadingLocation ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingLocation ? 0.7 : 1, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                >
                  {loadingLocation ? '⏳ Locating...' : '📍 Find Nearby Hospitals'}
                </button>
              )}
            </div>

            {!locationEnabled ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#94a3b8' }}>🗺️</div>
                <h4 style={{ color: '#475569', fontSize: '1.2rem', marginBottom: '8px', fontWeight: '600' }}>Enable location to see nearby hospitals</h4>
                <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>Allow location access to find the fastest route to verified healthcare facilities around you.</p>
              </div>
            ) : nearbyHospitals.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                <p style={{ color: '#b91c1c', fontWeight: '500' }}>No verified hospitals found near your location.</p>
              </div>
            ) : (
              <div className="hospital-grid">
                {nearbyHospitals.map((hospital, index) => (
                  <div key={index} className="hospital-card" style={{ borderTop: '4px solid #64748b', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, paddingRight: '25px', color: '#1e293b' }}>{hospital.name}</h3>
                      <div title="External Source" style={{ color: '#64748b', fontSize: '1.1rem', position: 'absolute', right: '20px', top: '20px', background: '#f1f5f9', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🌐</div>
                    </div>
                    <div className="hospital-info">
                      <span>Distance</span>
                      <span style={{ fontWeight: 'bold', color: '#2563EB', fontSize: '0.9rem' }}>{hospital.distance}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Verification</span>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>External Map Data</span>
                    </div>
                    <div className="hospital-info">
                      <span>Contact</span>
                      <span>{hospital.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`, '_blank')}
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-container" style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="chart-title" style={{ margin: 0 }}>🏛️ Government & Municipal Hospitals</h3>
            </div>
            
            {hospitals.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                <h4 style={{ color: '#991b1b', fontSize: '1.1rem' }}>No Govt. Hospitals Found</h4>
                <p style={{ color: '#b91c1c' }}>Currently, no government or municipal hospital is registered in the database.</p>
              </div>
            ) : (
              <div className="hospital-grid">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="hospital-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3>{hospital.name}</h3>
                      {hospital.fraudStatus === 'Suspicious' ? (
                        <span className="fraud-badge suspicious" style={{ fontSize: '0.8rem' }}>🔴 Suspicious</span>
                      ) : (
                        <span className="fraud-badge normal" style={{ fontSize: '0.8rem' }}>🟢 Verified</span>
                      )}
                    </div>
                    <div className="hospital-info">
                      <span>Distance</span>
                      <span style={{ fontWeight: 'bold', color: '#2563EB', fontSize: '0.9rem' }}>{locationEnabled ? hospital.distance : 'N/A (Click Sort)'}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Current Beds</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{hospital.currentBeds || hospital.availableBeds || hospital.available || 0}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Trust Score</span>
                      <span style={{ color: hospital.trustScore < 70 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{hospital.trustScore || 100}%</span>
                    </div>
                    <div className="hospital-info">
                      <span>Ventilators</span>
                      <span>{hospital.currentEquipment?.ventilators || 0}</span>
                    </div>
                    <div className="hospital-info">
                      <span>Contact</span>
                      <span style={{ fontSize: '0.9rem' }}>{hospital.phone}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`, '_blank')}
                      >
                        Get Directions
                      </button>
                      <button
                        className="btn"
                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white' }}
                        onClick={() => handleOpenFeedback(hospital.name)}
                      >
                        Give Feedback
                      </button>
                    </div>
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
      
      {showFeedbackModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', width: '90%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Hospital Feedback</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Hospital</label>
              <input type="text" value={selectedHospitalForFeedback} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Your Name</label>
              <input type="text" placeholder="Enter your name" value={feedbackCitizenName} onChange={(e) => setFeedbackCitizenName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Rating</label>
              <div style={{ display: 'flex', gap: '10px', fontSize: '24px', cursor: 'pointer' }}>
                {[1,2,3,4,5].map(star => (
                   <span key={star} onClick={() => setFeedbackRating(star)} style={{ color: star <= feedbackRating ? '#fbbf24' : '#e2e8f0' }}>★</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Feedback Type</label>
              <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                 <option>Positive Experience</option>
                 <option>Long Waiting Time</option>
                 <option>Staff Behavior Issue</option>
                 <option>Cleanliness Problem</option>
                 <option>Medicine Unavailability</option>
                 <option>Other Issue</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Description (min 20 chars)</label>
              <textarea placeholder="Describe your experience..." value={feedbackDesc} onChange={(e) => setFeedbackDesc(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
               <button onClick={() => setShowFeedbackModal(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
               <button onClick={submitFeedback} disabled={isSubmittingFeedback} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: isSubmittingFeedback ? 'not-allowed' : 'pointer' }}>
                 {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Home
