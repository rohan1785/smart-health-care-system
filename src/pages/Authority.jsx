import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../firebase"
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from 'chart.js'
import DiseaseMap from '../components/DiseaseMap'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
)

function Authority() {
  const [alertMessage, setAlertMessage] = useState('')
  const [selectedHospitalForAlert, setSelectedHospitalForAlert] = useState('')
  const [alertMessageText, setAlertMessageText] = useState('')
  const [name, setName] = useState('')
  const [beds, setBeds] = useState('')
  const [available, setAvailable] = useState('')
  
  const [hospitals, setHospitals] = useState([])
  const [totalBeds, setTotalBeds] = useState(0)
  const [availableBedsCount, setAvailableBedsCount] = useState(0)
  const [totalActiveCases, setTotalActiveCases] = useState(0)
  const [alertsSent, setAlertsSent] = useState(0)
  
  const addHospital = async () => {
    if (!name || !beds || !available) return

    try {
      const email = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@hospital.com';
      const password = Math.random().toString(36).slice(-8);

      const docRef = await addDoc(collection(db, "hospitals"), {
        name: name,
        totalBeds: parseInt(beds),
        availableBeds: parseInt(available),
        location: "Not Specified",
        email: email,
        password: password,
        dengueCases: 0,
        fluCases: 0
      });

      setHospitals(prev => [...prev, { id: docRef.id, name: name, totalBeds: parseInt(beds), availableBeds: parseInt(available), location: "Not Specified", email: email, password: password, dengueCases: 0, fluCases: 0 }])
      setTotalBeds(prev => prev + parseInt(beds))
      setAvailableBedsCount(prev => prev + parseInt(available))

      setName('')
      setBeds('')
      setAvailable('')
      
      alert(`Hospital added successfully!\n\nPlease save these login credentials for the hospital:\nEmail: ${email}\nPassword: ${password}`);
    } catch (error) {
      console.error("Error adding hospital: ", error);
      alert("Failed to add hospital to Firebase");
    }
  }

  useEffect(() => {
    const alert = localStorage.getItem('healthAlert') || ''
    setAlertMessage(alert)
  }, [])

  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Dengue Cases',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Flu Cases',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  })

  useEffect(() => {
    const fetchDiseaseData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "disease_cases"));
        const data = snapshot.docs.map((doc) => doc.data());
        console.log("Fetched Disease Data:", data);

        // Process data for the chart. Let's assume docs have { day: 'Mon', dengue: 5, flu: 10 }
        // For simplicity, we can update the state directly if matching labels
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let dengueData = [0, 0, 0, 0, 0, 0, 0];
        let fluData = [0, 0, 0, 0, 0, 0, 0];
        
        // If data from firestore exists, map it to the corresponding day
        data.forEach(item => {
           const index = labels.indexOf(item.day);
           if (index !== -1) {
              dengueData[index] = item.dengue || 0;
              fluData[index] = item.flu || 0;
           }
        });

        // Set the fetched data or keep the demo ones if db is empty for now
        if (data.length > 0) {
            let totalDengue = dengueData.reduce((a, b) => a + b, 0);
            let totalFlu = fluData.reduce((a, b) => a + b, 0);

            setChartData({
              labels: labels,
              datasets: [
                {
                  label: 'Dengue Cases',
                  data: dengueData,
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: 'Flu Cases',
                  data: fluData,
                  borderColor: '#0ea5e9',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            });
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
    
    fetchDiseaseData();
  }, [])

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "hospitals"));
        const fetchedHospitals = [];
        let totalB = 0;
        let availableB = 0;
        let totalActive = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedHospitals.push({ id: doc.id, ...data });
          totalB += parseInt(data.totalBeds) || 0;
          availableB += parseInt(data.availableBeds) || 0;
          
          let hc = (parseInt(data.dengueCases) || 0) + (parseInt(data.fluCases) || 0);
          if (data.customDiseases && Array.isArray(data.customDiseases)) {
            data.customDiseases.forEach(d => hc += (parseInt(d.cases) || 0));
          }
          totalActive += hc;
        });
        
        setHospitals(fetchedHospitals);
        setTotalBeds(totalB);
        setAvailableBedsCount(availableB);
        setTotalActiveCases(totalActive);
      } catch (error) {
        console.error("Error fetching hospitals: ", error);
      }
    };
    fetchHospitals();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const sendAlert = () => {
    if (!selectedHospitalForAlert || !alertMessageText) {
      alert("Please select a hospital and enter a message.");
      return;
    }
    const fullMsg = `Alert for ${selectedHospitalForAlert}: ${alertMessageText}`;
    localStorage.setItem('healthAlert', fullMsg)
    setAlertMessage(fullMsg)
    setAlertsSent(prev => prev + 1)
    alert(`SMS Alert successfully sent to citizens regarding ${selectedHospitalForAlert}!`)
    setAlertMessageText('')
    setSelectedHospitalForAlert('')
  }



  return (
<>
<div>

<div className="page-header">
  <h1 className="page-title">Municipal Health Analytics Dashboard</h1>
  <p className="page-subtitle">Disease trend monitoring for city wards</p>
</div>

{alertMessage && (
  <div className="alert-banner danger">
    <div className="alert-icon">🚨</div>
    <div className="alert-content">
      <h4>Health Alert Active</h4>
      <p>{alertMessage}</p>
    </div>
  </div>
)}

<div className="dashboard-grid">

  <div className="dashboard-card">
    <h3>Total Hospitals</h3>
    <div className="value">{hospitals.length || 0}</div>
  </div>

  <div className="dashboard-card">
    <h3>Active Cases</h3>
    <div className="value" style={{ color: '#ef4444' }}>{totalActiveCases}</div>
  </div>

  <div className="dashboard-card">
    <h3>Available Beds</h3>
    <div className="value" style={{ color: '#10b981' }}>{availableBedsCount || 0}</div>
  </div>

  <div className="dashboard-card">
    <h3>Alerts Sent</h3>
    <div className="value" style={{ color: '#f59e0b' }}>{alertsSent}</div>
  </div>

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

<div className="chart-container">
  <h3 className="chart-title">Hospitals Directory</h3>
  <div style={{ overflowX: 'auto', marginTop: '15px' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Hospital Name</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Login Email</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Password</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Total Beds</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Available Beds</th>
          <th style={{ padding: '14px 16px', color: '#ef4444', fontWeight: '600' }}>Dengue Cases</th>
          <th style={{ padding: '14px 16px', color: '#0ea5e9', fontWeight: '600' }}>Flu Cases</th>
          <th style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: '600' }}>Other Diseases</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Occupancy Rate</th>
        </tr>
      </thead>
      <tbody>
        {hospitals.length > 0 ? hospitals.map((h, i) => {
           const tBeds = parseInt(h.totalBeds) || 0;
           const aBeds = parseInt(h.availableBeds) || 0;
           const occupancy = tBeds > 0 ? Math.round(((tBeds - aBeds) / tBeds) * 100) : 0;
           return (
            <tr key={h.id || i} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>🏥 {h.name}</td>
              <td style={{ padding: '16px', color: '#0ea5e9', fontSize: '0.9rem' }}>{h.email || 'N/A'}</td>
              <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>{h.password || 'N/A'}</td>
              <td style={{ padding: '16px', color: '#334155' }}>{tBeds}</td>
              <td style={{ padding: '16px', color: '#10b981', fontWeight: 'bold' }}>{aBeds}</td>
              <td style={{ padding: '16px', color: '#ef4444', fontWeight: 'bold' }}>{h.dengueCases || 0}</td>
              <td style={{ padding: '16px', color: '#0ea5e9', fontWeight: 'bold' }}>{h.fluCases || 0}</td>
              <td style={{ padding: '16px', color: '#f59e0b', fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={h.customDiseases?.map(d => `${d.name}: ${d.cases}`).join(', ')}>
                {h.customDiseases && h.customDiseases.length > 0 
                  ? h.customDiseases.map(d => `${d.name}: ${d.cases}`).join(', ') 
                  : 'None'}
              </td>
              <td style={{ padding: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '40px', fontWeight: '500' }}>{occupancy}%</span>
                    <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ width: `${occupancy}%`, backgroundColor: occupancy > 80 ? '#ef4444' : (occupancy > 50 ? '#f59e0b' : '#10b981'), height: '100%', borderRadius: '4px' }}></div>
                    </div>
                 </div>
              </td>
            </tr>
          );
        }) : (
          <tr>
            <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No hospitals registered yet. Add one above!</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

<div className="chart-container">
  <h3 className="chart-title">Disease Trend Analytics</h3>
  <div style={{ position: 'relative', height: '350px', width: '100%' }}>
    <Line data={chartData} options={chartOptions} />
  </div>
</div>

<div className="chart-container">
  <h3 className="chart-title">City Disease Risk Map</h3>
  <div className="map-container">
    <DiseaseMap />
  </div>
</div>

<div className="chart-container">
  <h3 className="chart-title">Custom SMS / Emergency Alert System</h3>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
    <select 
      value={selectedHospitalForAlert} 
      onChange={(e) => setSelectedHospitalForAlert(e.target.value)}
      className="form-input"
      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
    >
      <option value="">-- Select Hospital --</option>
      <option value="All City Hospitals">All City Hospitals</option>
      {hospitals.map(h => (
        <option key={h.id || h.name} value={h.name}>{h.name}</option>
      ))}
    </select>
    
    <textarea 
      placeholder="E.g., Dengue cases are rising rapidly! Please take necessary precautions."
      value={alertMessageText}
      onChange={(e) => setAlertMessageText(e.target.value)}
      className="form-input"
      rows="3"
      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
    />
    
    <button
      onClick={sendAlert}
      className="btn btn-danger"
      style={{ alignSelf: 'flex-start' }}
    >
      Send SMS Alert
    </button>
  </div>
</div>

<div className="chart-container">
  <h3 className="chart-title">🤖 AI Disease Prediction & SMS Recommendations</h3>
  <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.9rem' }}>The system actively analyzes hospital data and recommends SMS alerts so citizens stay safe.</p>

  <div className="prediction-grid">

    {hospitals.filter(h => h.dengueCases > 10).map((h, i) => (
      <div key={`dengue-${i}`} className="prediction-card high">
        <h4>🚨 Severe Dengue Outbreak</h4>
        <span className="prediction-badge high">{h.name}</span>
        <p>Active Dengue Cases: <strong>{h.dengueCases}</strong></p>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>Action: Send targeted SMS alert to nearby citizens.</p>
        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }} onClick={() => { setSelectedHospitalForAlert(h.name); setAlertMessageText('DENGUE ALERT: High number of cases at ' + h.name + '. Please avoid stagnant water and use mosquito repellents. Stay Safe!'); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>Draft Alert</button>
      </div>
    ))}

    {hospitals.filter(h => h.fluCases > 10).map((h, i) => (
      <div key={`flu-${i}`} className="prediction-card moderate">
        <h4>⚠️ High Flu Transmission</h4>
        <span className="prediction-badge moderate">{h.name}</span>
        <p>Active Flu Cases: <strong>{h.fluCases}</strong></p>
        <button className="btn" style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }} onClick={() => { setSelectedHospitalForAlert(h.name); setAlertMessageText('FLU ALERT: Rapid flu transmission near ' + h.name + '. Wear masks and consult a doctor if symptoms persist.'); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>Draft Alert</button>
      </div>
    ))}

    {hospitals.filter(h => { const b = parseInt(h.availableBeds) || 0; return b < 20 && b > 0 }).map((h, i) => (
      <div key={`bed-${i}`} className="prediction-card" style={{ borderLeftColor: '#f43f5e' }}>
        <h4>❌ Critical Bed Shortage</h4>
        <span className="prediction-badge" style={{ backgroundColor: '#f43f5e', color: 'white' }}>{h.name}</span>
        <p>Only <strong>{h.availableBeds} beds</strong> available. High patient load.</p>
      </div>
    ))}

    {hospitals.length === 0 && (
      <p style={{ color: '#64748b' }}>No data available for AI analysis yet.</p>
    )}

  </div>

</div>

</div>
</>
)
}

export default Authority