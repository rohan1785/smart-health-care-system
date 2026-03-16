import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

function Hospital() {
  const [hospitals, setHospitals] = useState([])
  const [name, setName] = useState('')
  const [beds, setBeds] = useState('')
  const [available, setAvailable] = useState('')

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "hospitals"));
        const fetchedHospitals = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedHospitals.push({
            name: data.name,
            beds: data.totalBeds,
            available: data.availableBeds,
            id: doc.id
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
    if (!name || !beds || !available) return

    try {
      // Connect to Firebase
      await addDoc(collection(db, "hospitals"), {
        name: name,
        totalBeds: parseInt(beds),
        availableBeds: parseInt(available),
        location: "Not Specified"
      });

      const newHospital = {
        name,
        beds,
        available
      }

      setHospitals([...hospitals, newHospital])
      setName('')
      setBeds('')
      setAvailable('')
      
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
        <p className="page-subtitle">Manage hospital resources and bed availability</p>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Add Hospital</h3>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>

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
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
            <input
              type="number"
              placeholder="Available Beds"
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
              className="form-input"
            />
          </div>

          <button onClick={addHospital} className="btn btn-primary">
            Add Hospital
          </button>

        </div>
      </div>


      <div className="hospital-grid">

        {hospitals.map((h, i) => (
          <div key={i} className="hospital-card">

            <h3>🏥 {h.name}</h3>

            <div className="hospital-info">
              <span>Total Beds</span>
              <span>{h.beds}</span>
            </div>

            <div className="hospital-info">
              <span>Available Beds</span>
              <span style={{ color: '#10b981' }}>{h.available}</span>
            </div>

            <div className="hospital-info">
              <span>Occupancy</span>
              <span>
                {Math.round(((parseInt(h.beds) - parseInt(h.available)) / parseInt(h.beds)) * 100)}%
              </span>
            </div>

          </div>
        ))}


        <div className="hospital-card">
          <h3>🏥 City General Hospital</h3>

          <div className="hospital-info">
            <span>Total Beds</span>
            <span>150</span>
          </div>

          <div className="hospital-info">
            <span>Available Beds</span>
            <span style={{ color: '#10b981' }}>45</span>
          </div>

          <div className="hospital-info">
            <span>Occupancy</span>
            <span>70%</span>
          </div>
        </div>


        <div className="hospital-card">
          <h3>🏥 Municipal Medical Center</h3>

          <div className="hospital-info">
            <span>Total Beds</span>
            <span>100</span>
          </div>

          <div className="hospital-info">
            <span>Available Beds</span>
            <span style={{ color: '#10b981' }}>30</span>
          </div>

          <div className="hospital-info">
            <span>Occupancy</span>
            <span>70%</span>
          </div>
        </div>


        <div className="hospital-card">
          <h3>🏥 Community Health Center</h3>

          <div className="hospital-info">
            <span>Total Beds</span>
            <span>50</span>
          </div>

          <div className="hospital-info">
            <span>Available Beds</span>
            <span style={{ color: '#10b981' }}>20</span>
          </div>

          <div className="hospital-info">
            <span>Occupancy</span>
            <span>60%</span>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Hospital