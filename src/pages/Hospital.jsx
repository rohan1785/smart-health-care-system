import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

function Hospital() {
  const [hospitals, setHospitals] = useState([])
  const [name, setName] = useState('')
  const [totalBeds, setTotalBeds] = useState('')
  const [currentBeds, setCurrentBeds] = useState('')
  const [ventilators, setVentilators] = useState('')
  const [icuBeds, setIcuBeds] = useState('')
  const [ambulances, setAmbulances] = useState('')
  const [trustScore, setTrustScore] = useState('100')

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "hospitals"));
        const fetchedHospitals = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedHospitals.push({
            id: doc.id,
            name: data.name || 'Unnamed',
            totalBeds: data.totalBeds || 0,
            currentBeds: data.currentBeds || data.availableBeds || 0,
            currentEquipment: data.currentEquipment || {ventilators: 0, icuBeds: 0, ambulances: 0},
            fraudStatus: data.fraudStatus || 'Normal',
            fraudReason: data.fraudReason || '',
            trustScore: data.trustScore || 100,
            lastUpdated: data.lastUpdated || null
          });
        });
        // We initialize with the firebase data plus hardcoded ones, or we can just set it to fetched
        // Since we want the data directly from Firebase, we will set it here
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals: ", error);
      }
    };

    fetchHospitals();
  }, []);

  const addHospital = async () => {
    if (!name || !totalBeds || !currentBeds || !ventilators || !icuBeds || !ambulances) return

    try {
      // Connect to Firebase
      await addDoc(collection(db, "hospitals"), {
        name: name,
        totalBeds: parseInt(totalBeds),
        currentBeds: parseInt(currentBeds),
        currentEquipment: {
          ventilators: parseInt(ventilators),
          icuBeds: parseInt(icuBeds),
          ambulances: parseInt(ambulances)
        },
        fraudStatus: "Normal",
        fraudReason: "",
        trustScore: parseInt(trustScore),
        lastUpdated: new Date(),
        location: "Not Specified"
      });

      const newHospital = {
        name,
        totalBeds,
        currentBeds,
        currentEquipment: {
          ventilators,
          icuBeds, 
          ambulances
        },
        trustScore,
        fraudStatus: "Normal"
      }

      setHospitals([...hospitals, newHospital])
      setName('')
      setTotalBeds('')
      setCurrentBeds('')
      setVentilators('')
      setIcuBeds('')
      setAmbulances('')
      setTrustScore('100')
      
      alert("Hospital added successfully to Firebase!");
    } catch (error) {
      console.error("Error adding hospital: ", error);
      alert("Failed to add hospital to Firebase");
    }
  }

  return (
    <div>

      <div className="page-header">
        <h1 className="page-title">Hospital Resource Dashboard</h1>
        <p className="page-subtitle">Manage hospital resources and ML-powered fraud detection for beds & equipment</p>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Add Hospital</h3>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Hospital Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="Total Beds"
                value={totalBeds}
                onChange={(e) => setTotalBeds(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="Current Beds (Available)"
                value={currentBeds}
                onChange={(e) => setCurrentBeds(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '120px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="Ventilators"
                value={ventilators}
                onChange={(e) => setVentilators(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '120px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="ICU Beds"
                value={icuBeds}
                onChange={(e) => setIcuBeds(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '120px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="Ambulances"
                value={ambulances}
                onChange={(e) => setAmbulances(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '120px', marginBottom: 0 }}>
              <input
                type="number"
                placeholder="Trust Score (0-100)"
                value={trustScore}
                onChange={(e) => setTrustScore(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button onClick={addHospital} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Add Hospital with Fraud Detection
          </button>

        </div>
      </div>


      <div className="hospital-grid">

        {hospitals.map((h) => (
          <div key={h.id} className="hospital-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>🏥 {h.name}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`fraud-badge ${h.fraudStatus.toLowerCase()}`}>
                  {h.fraudStatus === 'Normal' ? '🟢 Normal' : '🔴 Suspicious'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Trust: {h.trustScore}%</span>
              </div>
            </div>
            {h.fraudReason && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 10px', marginBottom: '12px', fontSize: '0.8rem', color: '#dc2626' }}>
                ⚠️ {h.fraudReason}
              </div>
            )}
            <div className="hospital-info">
              <span>Total Beds</span>
              <span>{h.totalBeds}</span>
            </div>
            <div className="hospital-info">
              <span>Current Beds</span>
              <span style={{ color: h.currentBeds > h.totalBeds * 0.8 ? '#10b981' : '#f59e0b' }}>{h.currentBeds}</span>
            </div>
            <div className="hospital-info">
              <span>Ventilators</span>
              <span>{h.currentEquipment.ventilators}</span>
            </div>
            <div className="hospital-info">
              <span>ICU Beds</span>
              <span>{h.currentEquipment.icuBeds}</span>
            </div>
            <div className="hospital-info">
              <span>Ambulances</span>
              <span>{h.currentEquipment.ambulances}</span>
            </div>
            <div className="hospital-info">
              <span>Occupancy</span>
              <span style={{ fontWeight: 'bold' }}>
                {h.totalBeds > 0 ? Math.round((h.currentBeds / h.totalBeds) * 100) + '%' : 'N/A'}
              </span>
            </div>
            {h.lastUpdated && (
              <div className="hospital-info">
                <span>Last Updated</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {h.lastUpdated.toDate ? h.lastUpdated.toDate().toLocaleDateString() : new Date(h.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))}




      </div>

    </div>
  )
}

export default Hospital