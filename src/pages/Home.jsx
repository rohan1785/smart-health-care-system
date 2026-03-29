import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore'
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
  const [feedbackDesc, setFeedbackDesc] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  
  // Sorting State
  const [sortBy, setSortBy] = useState('default')
  
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
    const sympLower = symp.toLowerCase();
    if (symptoms.toLowerCase().includes(sympLower)) {
      const parts = symptoms.split(',').map(s => s.trim()).filter(s => s.toLowerCase() !== sympLower && s !== '');
      setSymptoms(parts.join(', '));
    } else {
      setSymptoms(prev => prev ? `${prev}, ${symp}` : symp);
    }
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
      const apiUrl = import.meta.env.VITE_API_URL || 'https://smart-health-care-system-1.onrender.com';
      const response = await fetch(`${apiUrl}/api/predict`, {
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
      unsubscribeGlobalAlert()
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
        <div style={{ backgroundColor: '#ffffff', paddingTop: '100px', paddingBottom: '60px', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 450px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.3', margin: '0 0 20px 0', fontFamily: 'Arial, sans-serif' }}>
                City's Most Trusted Health Management System
              </h1>
              
              <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
                Professional Healthcare Services That Drive Real Results | 4.9★ Rating | 12+ Top Hospitals
              </p>
              
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '30px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
                Get direct access to real-time hospital bed availability and disease tracking with zero delay. Stay safe and informed.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => document.getElementById('citizen-section').scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0', fontWeight: '500', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
                >
                  Find Hospitals
                </button>
              </div>
            </div>
            
            {/* Right Column (Map) */}
            <div style={{ flex: '1 1 450px', position: 'relative' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0', overflow: 'hidden', height: '400px', position: 'relative', background: 'white' }}>
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

          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="dashboard-card" style={{ cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '20px', textAlign: 'center' }}>
              <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏥</div>
              <h3 style={{ marginTop: '10px', fontSize: '1.1rem', color: '#1e293b', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Find Hospital</h3>
              <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Locate nearby medical facilities</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '20px', textAlign: 'center' }}>
              <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🩺</div>
              <h3 style={{ marginTop: '10px', fontSize: '1.1rem', color: '#1e293b', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Health Tips</h3>
              <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Daily health recommendations</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '20px', textAlign: 'center' }}>
              <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
              <h3 style={{ marginTop: '10px', fontSize: '1.1rem', color: '#1e293b', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Medical History</h3>
              <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>View your health records</p>
            </div>

            <div className="dashboard-card" style={{ cursor: 'pointer', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '20px', textAlign: 'center' }}>
              <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📞</div>
              <h3 style={{ marginTop: '10px', fontSize: '1.1rem', color: '#1e293b', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Emergency</h3>
              <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Call emergency services</p>
            </div>
          </div>

          {/* Arogya360 AI Symptom Checker */}
          <div style={{ marginTop: '30px', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '25px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1e293b', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>🤖 Arogya360 AI Symptom Checker</h3>
            <p style={{ color: '#64748b', marginBottom: '18px', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>Enter your symptoms or select common symptoms below to get instant health guidance.</p>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>Common Symptoms:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {commonSymptomsList.map((symp, idx) => (
                  <span 
                    key={idx} 
                    onClick={() => handleAddSymptom(symp)}
                    style={{ 
                      padding: '6px 12px', 
                      background: symptoms.toLowerCase().includes(symp.toLowerCase()) ? '#10b981' : '#ffffff', 
                      color: symptoms.toLowerCase().includes(symp.toLowerCase()) ? 'white' : '#64748b', 
                      borderRadius: '0', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      fontWeight: '400',
                      border: '1px solid #cbd5e1',
                      fontFamily: 'Arial, sans-serif'
                    }}
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
              style={{ width: '100%', padding: '10px', borderRadius: '0', border: '1px solid #cbd5e1', minHeight: '100px', marginBottom: '14px', fontFamily: 'Arial, sans-serif', fontSize: '0.95rem', resize: 'vertical', background: 'white' }}
            />
            
            <button 
              onClick={handleCheckSymptoms} 
              disabled={symptomLoading}
              className="btn btn-primary"
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '0', fontWeight: '500', cursor: symptomLoading ? 'not-allowed' : 'pointer', opacity: symptomLoading ? 0.7 : 1, fontSize: '0.95rem', fontFamily: 'Arial, sans-serif' }}
            >
              {symptomLoading ? '⏳ Analyzing symptoms...' : '🔍 Check Symptoms'}
            </button>

            {symptomError && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '0', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }}>
                <span style={{fontWeight: '600'}}>⚠️ Error: </span> {symptomError}
              </div>
            )}

            {symptomResult && (
              <div style={{ marginTop: '20px', padding: '18px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '0' }}>
                <h4 style={{ color: '#1e293b', fontSize: '1.05rem', marginBottom: '12px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                  🩺 Possible Condition: <span style={{ color: '#dc2626', fontWeight: '600' }}>{symptomResult.disease}</span>
                </h4>
                
                <h5 style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '10px', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>📌 Recommended Precautions:</h5>
                <ul style={{ paddingLeft: '20px', color: '#475569', marginBottom: '20px', lineHeight: '1.7', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>
                  {symptomResult.precautions?.map((p, idx) => (
                    <li key={idx} style={{marginBottom: '6px'}}>{p}</li>
                  ))}
                  {(!symptomResult.precautions || symptomResult.precautions.length === 0) && (
                    <li style={{marginBottom: '6px'}}>Please consult a doctor immediately for proper guidance.</li>
                  )}
                </ul>

                <h5 style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '15px', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>🏥 Recommended Hospitals Nearby:</h5>
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

          <div style={{ marginTop: '30px', background: 'white', border: '1px solid #d1d5db', borderRadius: '0', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Arial, sans-serif', fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>
                📍 Nearby Hospitals
                {locationEnabled && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Arial, sans-serif', border: '1px solid #bbf7d0' }}><span className="shcb-dot" style={{width:'6px', height:'6px', display:'inline-block'}}></span> Using your location</span>}
              </h3>
              {!locationEnabled && (
                <button 
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                  style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0', fontWeight: '500', cursor: loadingLocation ? 'not-allowed' : 'pointer', opacity: loadingLocation ? 0.7 : 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}
                >
                  {loadingLocation ? '⏳ Locating...' : '📍 Find Nearby Hospitals'}
                </button>
              )}
            </div>

            {!locationEnabled ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', background: '#f9fafb', borderRadius: '0', border: '1px solid #d1d5db' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px', color: '#94a3b8' }}>🗺️</div>
                <h4 style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '6px', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>Enable location to see nearby hospitals</h4>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5', fontFamily: 'Arial, sans-serif', fontSize: '0.85rem' }}>Allow location access to find the fastest route to verified healthcare facilities around you.</p>
              </div>
            ) : nearbyHospitals.length === 0 ? (
              <div style={{ padding: '25px', textAlign: 'center', background: '#fef2f2', borderRadius: '0', border: '1px solid #fca5a5' }}>
                <p style={{ color: '#b91c1c', fontWeight: '500', fontFamily: 'Arial, sans-serif', fontSize: '0.85rem' }}>No verified hospitals found near your location.</p>
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

          <div style={{ marginTop: '30px', background: '#ffffff', borderRadius: '20px', padding: '35px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '12px', fontSize: '1.2rem' }}>🏛️</span>
                Government & Municipal Hospitals
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{color: '#64748b', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Inter', sans-serif"}}>Sort by:</span>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '8px 36px 8px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', cursor: 'pointer', background: '#f8fafc', color: '#334155', fontWeight: '600', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', appearance: 'none', transition: 'all 0.2s ease' }}
                  >
                    <option value="default">Default View</option>
                    <option value="beds">Most Available Beds</option>
                    <option value="trust">Highest Trust Score</option>
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem', color: '#64748b' }}>▼</div>
                </div>
              </div>
            </div>
            
            {hospitals.length === 0 ? (
              <div style={{ padding: '25px', textAlign: 'center', background: '#fef2f2', borderRadius: '0', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⚠️</div>
                <h4 style={{ color: '#991b1b', fontSize: '0.95rem', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>No Govt. Hospitals Found</h4>
                <p style={{ color: '#b91c1c', fontFamily: 'Arial, sans-serif', fontSize: '0.85rem' }}>Currently, no government or municipal hospital is registered in the database.</p>
              </div>
            ) : (
              <div className="hospital-grid">
                {[...hospitals].sort((a, b) => {
                  if (sortBy === 'beds') {
                    const bedsA = a.currentBeds || a.availableBeds || a.available || 0;
                    const bedsB = b.currentBeds || b.availableBeds || b.available || 0;
                    return bedsB - bedsA;
                  }
                  if (sortBy === 'trust') {
                    const trustA = a.trustScore || 100;
                    const trustB = b.trustScore || 100;
                    return trustB - trustA;
                  }
                  return 0;
                }).map((hospital) => (
                  <div key={hospital.id} className="hospital-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', padding: 0 }}>
                    {/* Card Header */}
                    <div style={{ padding: '20px', background: 'linear-gradient(to bottom, #f8fafc, #ffffff)', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', fontFamily: "'Inter', sans-serif" }}>
                          {hospital.name}
                        </h3>
                        {hospital.fraudStatus === 'Suspicious' ? (
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                            <span style={{width:'6px', height:'6px', background:'#dc2626', borderRadius:'50%'}}></span> Suspicious
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                            <span style={{width:'6px', height:'6px', background:'#16a34a', borderRadius:'50%'}}></span> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Available Beds</span>
                        <span style={{ color: '#059669', fontSize: '1.1rem', fontWeight: '800' }}>
                          {hospital.currentBeds || hospital.availableBeds || hospital.available || 0}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', margin: '4px 0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Trust Score</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${hospital.trustScore || 100}%`, height: '100%', background: (hospital.trustScore || 100) < 70 ? '#ef4444' : '#10b981' }}></div>
                          </div>
                          <span style={{ color: (hospital.trustScore || 100) < 70 ? '#ef4444' : '#10b981', fontSize: '0.9rem', fontWeight: '700' }}>
                            {hospital.trustScore || 100}%
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>🫁 Ventilators</span>
                        <span style={{ color: '#334155', fontSize: '0.95rem', fontWeight: '600' }}>
                          {hospital.currentEquipment?.ventilators || 0}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>📞 Contact</span>
                        <span style={{ color: '#334155', fontSize: '0.9rem', fontWeight: '500' }}>
                          {hospital.phone || 'Not Available'}
                        </span>
                      </div>
                      
                      {/* Sections / Departments */}
                      {hospital.sections && hospital.sections.length > 0 && (
                        <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Departments:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {hospital.sections.map((sec, idx) => (
                              <span key={idx} style={{ 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                color: '#475569', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600' 
                              }}>
                                {sec.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Footer */}
                    <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
                      <button
                        style={{ flex: 1, backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor='#0284c7'; e.currentTarget.style.transform='translateY(-2px)'}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor='#0ea5e9'; e.currentTarget.style.transform='translateY(0)'}}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`, '_blank')}
                      >
                        Got to Map ↗
                      </button>
                      <button
                        style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor='#e2e8f0'; e.currentTarget.style.transform='translateY(-2px)'}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor='#f1f5f9'; e.currentTarget.style.transform='translateY(0)'}}
                        onClick={() => handleOpenFeedback(hospital.name)}
                      >
                        Feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', background: 'linear-gradient(135deg, #f8fafc, #ffffff)', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '35px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#fef9c3', padding: '6px 10px', borderRadius: '10px', fontSize: '1.2rem' }}>💡</span> 
              Health Tips
            </h3>
            <div className="features-grid">
              <div className="feature-card" style={{ padding: '30px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', background: 'white' }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px', background: '#e0f2fe', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>💧</div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' }}>Stay Hydrated</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>Drink at least 8 glasses of water daily to maintain optimal bodily functions.</p>
              </div>
              <div className="feature-card" style={{ padding: '30px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', background: 'white' }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px', background: '#e0e7ff', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>😴</div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' }}>Get Enough Sleep</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>Aim for 7-9 hours of quality sleep each night for a stronger immune system.</p>
              </div>
              <div className="feature-card" style={{ padding: '30px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', background: 'white' }}>
                <div style={{ fontSize: '2rem', marginBottom: '15px', background: '#dcfce7', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>🏃</div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' }}>Regular Exercise</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>Stay active with at least 30 minutes of moderate exercise on a daily basis.</p>
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
