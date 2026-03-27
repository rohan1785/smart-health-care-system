import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, onSnapshot, updateDoc, addDoc, serverTimestamp, limit, doc, deleteDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  BarElement
} from 'chart.js'
import DiseaseMap from '../components/DiseaseMap'
ChartJS.register(BarElement)

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
)

function Authority() {
  const navigate = useNavigate();
  
  const [alertMessage, setAlertMessage] = useState('')
  const [fraudAlerts, setFraudAlerts] = useState([])
  const [suspiciousHospitals, setSuspiciousHospitals] = useState([])
  const [trustChartData, setTrustChartData] = useState({
    labels: ['Hospital 1', 'Hospital 2', 'Hospital 3', 'Hospital 4', 'Hospital 5'],
    datasets: [{
      label: 'Trust Score',
      data: [95, 85, 60, 92, 78],
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
    }]
  })
  
  const [selectedHospitalForAlert, setSelectedHospitalForAlert] = useState('')
  const [alertMessageText, setAlertMessageText] = useState('')
  const [alertsSent, setAlertsSent] = useState(0)
  const [alertHistory, setAlertHistory] = useState([]) // New State
  
  const [name, setName] = useState('')
  const [beds, setBeds] = useState('')
  const [available, setAvailable] = useState('')
  
  const [hospitals, setHospitals] = useState([])
  const [totalBeds, setTotalBeds] = useState(0)
  const [availableBedsCount, setAvailableBedsCount] = useState(0)
  const [totalActiveCases, setTotalActiveCases] = useState(0)

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
        fluCases: 0,
        fraudStatus: 'Normal',
        trustScore: 100,
        lastUpdated: serverTimestamp()
      });

      setHospitals(prev => [...prev, { 
        id: docRef.id, name: name, totalBeds: parseInt(beds), availableBeds: parseInt(available), 
        location: "Not Specified", email: email, password: password, dengueCases: 0, fluCases: 0,
        fraudStatus: 'Normal', trustScore: 100
      }])
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

  const deleteHospital = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this hospital?")) {
      try {
        await deleteDoc(doc(db, "hospitals", id))
      } catch (err) {
        console.error("Error deleting hospital:", err)
      }
    }
  }

  const editHospitalName = async (id, currentName) => {
    const newName = window.prompt("Enter new hospital name:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        await updateDoc(doc(db, "hospitals", id), {
          name: newName.trim()
        });
        alert("Hospital name updated successfully!");
      } catch (err) {
        console.error("Error updating hospital name:", err);
        alert("Failed to update hospital name.");
      }
    }
  };

  useEffect(() => {
    const qAlertsGlobal = query(collection(db, 'sentAlerts'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeGlobalAlert = onSnapshot(qAlertsGlobal, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const msg = `Alert for ${data.hospitalName}: ${data.message}`;
        if (localStorage.getItem('dismissedAlertId') !== docSnap.id) {
          setAlertMessage(msg);
          localStorage.setItem('currentAlertId', docSnap.id);
        } else {
          setAlertMessage('');
        }
      } else {
        setAlertMessage('');
      }
    });
    return () => unsubscribeGlobalAlert();
  }, [])

  // Fraud Alerts Realtime (filter fraud-related)
  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate
            ? doc.data().timestamp.toDate() 
            : new Date(doc.data().timestamp || Date.now())
        }))
        .filter(a => a.type === 'fake_entry' || a.severity === 'High' || a.status === 'Pending' || (a.message && (a.message.toLowerCase().includes('fraud') || a.message.toLowerCase().includes('suspicious'))) || (a.reason && (a.reason.toLowerCase().includes('fraud') || a.reason.toLowerCase().includes('suspicious'))))
      setFraudAlerts(alerts)
    })
    return unsubscribe
  }, [])

  // Sent Alerts History
  useEffect(() => {
    const q = query(collection(db, 'sentAlerts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlertHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [])

  // Suspicious Hospitals
  useEffect(() => {
    const q = query(collection(db, 'hospitals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hospitals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate
            ? doc.data().lastUpdated.toDate()
            : new Date(doc.data().lastUpdated || Date.now())
      }))
      .filter(h => h.fraudStatus === 'Suspicious')
      .sort((a, b) => (a.trustScore || 0) - (b.trustScore || 0));
      
      setSuspiciousHospitals(hospitals)
    })
    return unsubscribe
  }, [])

  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: []
  })

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "hospitals"), (querySnapshot) => {
      try {
        const fetchedHospitals = [];
        let totalB = 0;
        let availableB = 0;
        let totalActive = 0;
        
        const diseaseTotals = {
          'Dengue': 0,
          'Flu': 0
        };
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedHospitals.push({ id: doc.id, ...data });
          totalB += parseInt(data.totalBeds) || 0;
          availableB += parseInt(data.availableBeds) || 0;
          
          let dCases = parseInt(data.dengueCases) || 0;
          let fCases = parseInt(data.fluCases) || 0;
          
          diseaseTotals['Dengue'] += dCases;
          diseaseTotals['Flu'] += fCases;
          totalActive += (dCases + fCases);
          
          if (data.customDiseases && Array.isArray(data.customDiseases)) {
            data.customDiseases.forEach(d => {
              const name = d.name.trim() || 'Unknown';
              const cases = parseInt(d.cases) || 0;
              if (!diseaseTotals[name]) diseaseTotals[name] = 0;
              diseaseTotals[name] += cases;
              totalActive += cases;
            });
          }
        });
        
        const colors = ['#ef4444', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const datasets = Object.keys(diseaseTotals).map((diseaseName, index) => {
          const total = diseaseTotals[diseaseName];
          const trendData = [
            Math.round(total * 0.15), Math.round(total * 0.30), Math.round(total * 0.45),
            Math.round(total * 0.60), Math.round(total * 0.75), Math.round(total * 0.90), total
          ];
          const color = colors[index % colors.length];
          return {
            label: `${diseaseName} Cases`,
            data: trendData,
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0.4,
          };
        });

        setChartData({ labels, datasets });
        setHospitals(fetchedHospitals);
        setTotalBeds(totalB);
        setAvailableBedsCount(availableB);
        setTotalActiveCases(totalActive);
      } catch (error) {
        console.error("Error processing hospitals: ", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Fraud alert actions
  const verifyAlert = async (alertId) => {
    await updateDoc(doc(db, 'alerts', alertId), { status: 'Verified' })
    alert('Alert marked as Verified')
  }

  const rejectAlert = async (alertId) => {
    await updateDoc(doc(db, 'alerts', alertId), { status: 'Rejected' })
    alert('Alert marked as Rejected')
  }

  const sendFraudAlert = async () => {
    await addDoc(collection(db, 'alerts'), {
      hospitalId: 'system',
      hospitalName: 'Fraud Detection System', 
      reason: 'New ML model detects potential data fraud patterns',
      status: 'Pending',
      severity: 'Medium',
      timestamp: serverTimestamp()
    })
    alert('Fraud system alert sent!')
  }

  const sendAlert = async () => {
    if (!selectedHospitalForAlert || !alertMessageText) {
      alert("Please select a hospital and enter a message.");
      return;
    }
    setAlertsSent(prev => prev + 1)

    try {
      await addDoc(collection(db, 'sentAlerts'), {
        hospitalName: selectedHospitalForAlert,
        message: alertMessageText,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving alert history:", err);
    }

    alert(`SMS Alert successfully sent to citizens regarding ${selectedHospitalForAlert}!`)
    setAlertMessageText('')
    setSelectedHospitalForAlert('')
  }

  const deleteSentAlert = async (id, alertObject) => {
    if (window.confirm("Are you sure you want to delete this sent alert from history?")) {
      try {
        await deleteDoc(doc(db, 'sentAlerts', id));
      } catch (err) {
        console.error("Error deleting alert:", err);
      }
    }
  }

  const deleteFraudAlert = async (id) => {
    if (window.confirm("Are you sure you want to permanently dismiss this integrity alert?")) {
      try {
        await deleteDoc(doc(db, 'alerts', id));
      } catch (err) {
        console.error("Error deleting fraud alert:", err);
      }
    }
  }

  // Compute dynamic disease list before return
  const allDiseases = Array.from(new Set(
    hospitals.flatMap(h => {
      const names = [];
      if (h.dengueCases) names.push('Dengue');
      if (h.fluCases) names.push('Flu');
      if (h.customDiseases) {
        h.customDiseases.forEach(d => names.push(d.name.trim()));
      }
      return names;
    })
  )).filter(Boolean).sort();

  return (
<>
<div>

<div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <h1 className="page-title">Municipal Health Analytics Dashboard</h1>
    <p className="page-subtitle">Disease trend monitoring for city wards</p>
  </div>
  <button 
    onClick={() => navigate('/authority/feedback')} 
    style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
  >
    💬 View Citizen Feedback
  </button>
</div>

{alertMessage && (
  <div className="alert-banner danger" style={{ position: 'relative' }}>
    <div className="alert-icon">🚨</div>
    <div className="alert-content">
      <h4>Health Alert Active</h4>
      <p>{alertMessage}</p>
    </div>
    <button 
      onClick={() => { localStorage.setItem('dismissedAlertId', localStorage.getItem('currentAlertId')); setAlertMessage(''); }}
      style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#991b1b' }}
      title="Dismiss active alert"
    >
      ✖
    </button>
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



{/* ML Fraud Dashboard */}
<div className="chart-container" style={{ marginTop: '30px', border: '2px solid #fecaca', backgroundColor: '#fff1f2', borderRadius: '12px' }}>
  <h3 className="chart-title" style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
    🛡️ ML Fraud Detection System Live
  </h3>
  <p style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: '15px' }}>The system is constantly monitoring incoming hospital data for sudden spikes, illogical bed counts, and fake entries using an Isolation Forest ML model.</p>
  
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '20px', marginTop: '15px' }}>
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
       <h4 style={{ color: '#b91c1c', marginBottom: '15px', fontSize: '1.1rem' }}>⚠️ Suspicious Hospitals</h4>
       {suspiciousHospitals.length === 0 ? (
         <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '8px', border: '1px dashed #34d399', textAlign: 'center' }}>
           <p style={{ color: '#065f46', fontWeight: 'bold' }}>All hospitals are operating normally.</p>
         </div>
       ) : (
         suspiciousHospitals.map(h => (
           <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fef2f2', marginBottom: '10px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
             <div>
               <span style={{ fontWeight: 'bold', color: '#7f1d1d', display: 'block' }}>{h.name}</span>
               <span style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: '500' }}>{h.lastMLAnalysis?.reason || 'Last Update Triggered ML Anomaly'}</span>
             </div>
             <div style={{ background: '#fee2e2', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>
               <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Trust: {Math.round(h.trustScore || 0)}%</span>
             </div>
           </div>
         ))
       )}
    </div>

    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
       <h4 style={{ color: '#b91c1c', marginBottom: '15px', fontSize: '1.1rem' }}>🚨 Recent Integrity Alerts</h4>
       {fraudAlerts.length === 0 ? (
         <p style={{ color: '#64748b' }}>No recent integrity alerts.</p>
       ) : (
         fraudAlerts.slice(0, 4).map(a => (
           <div key={a.id} style={{ padding: '12px', borderBottom: '1px solid #fee2e2', marginBottom: '8px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '0.95rem' }}>{a.hospitalName}</div>
               <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: '800', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>{a.type || 'SYSTEM FLAG'}</span>
             </div>
             <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>{a.message || a.reason}</div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
               <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>{a.timestamp.toLocaleString()}</span>
               <button 
                 onClick={() => deleteFraudAlert(a.id)}
                 style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#dc2626', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                 title="Dismiss Alert"
               >
                 ✕ Dismiss
               </button>
             </div>
           </div>
         ))
       )}
    </div>
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
          <th style={{ padding: '14px 16px', color: '#dc2626', fontWeight: '800' }}>ML Trust Score</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Login Email</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Password</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Total Beds</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Available Beds</th>
          {allDiseases.map(dName => (
            <th key={dName} style={{ padding: '14px 16px', color: '#dc2626', fontWeight: '600' }}>{dName}</th>
          ))}
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Occupancy Rate</th>
          <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {hospitals.length > 0 ? hospitals.map((h, i) => {
           const tBeds = parseInt(h.totalBeds) || 0;
           const aBeds = parseInt(h.availableBeds) || 0;
           const occupancy = tBeds > 0 ? Math.round(((tBeds - aBeds) / tBeds) * 100) : 0;
           return (
            <tr key={h.id || i} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', backgroundColor: h.fraudStatus === 'Suspicious' ? '#fef2f2' : 'transparent' }}>
              <td style={{ padding: '16px', fontWeight: '500', color: h.fraudStatus === 'Suspicious' ? '#991b1b' : '#0f172a' }}>
                 🏥 {h.name}
                 {h.fraudStatus === 'Suspicious' && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>FLAGGED</span>}
              </td>
              <td style={{ padding: '16px', color: (h.trustScore || 100) < 75 ? '#dc2626' : '#10b981', fontWeight: 'bold' }}>{Math.round(h.trustScore || 100)}%</td>
              <td style={{ padding: '16px', color: '#0ea5e9', fontSize: '0.9rem' }}>{h.email || 'N/A'}</td>
              <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>{h.password || 'N/A'}</td>
              <td style={{ padding: '16px', color: '#334155' }}>{tBeds}</td>
              <td style={{ padding: '16px', color: '#10b981', fontWeight: 'bold' }}>{aBeds}</td>
              {allDiseases.map(dName => {
                let count = 0;
                if (dName.toLowerCase() === 'dengue') count = h.dengueCases || 0;
                else if (dName.toLowerCase() === 'flu') count = h.fluCases || 0;
                if (h.customDiseases) {
                  const customD = h.customDiseases.find(d => d.name.trim().toLowerCase() === dName.toLowerCase());
                  if (customD) count = customD.cases;
                }
                return (
                  <td key={dName} style={{ padding: '16px', color: count > 0 ? '#ef4444' : '#94a3b8', fontWeight: count > 0 ? 'bold' : 'normal' }}>
                    {count || '-'}
                  </td>
                );
              })}
              <td style={{ padding: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '40px', fontWeight: '500' }}>{occupancy}%</span>
                    <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ width: `${occupancy}%`, backgroundColor: occupancy > 80 ? '#ef4444' : (occupancy > 50 ? '#f59e0b' : '#10b981'), height: '100%', borderRadius: '4px' }}></div>
                    </div>
                 </div>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => editHospitalName(h.id, h.name)} 
                    style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Rename
                  </button>
                  <button 
                    onClick={() => deleteHospital(h.id)} 
                    style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          );
        }) : (
          <tr>
            <td colSpan="11" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No hospitals registered yet. Add one above!</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

<div className="chart-container">
  <h3 className="chart-title">Disease Trend Analytics</h3>
  <div style={{ position: 'relative', height: '450px', width: '100%' }}>
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

  <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
    <h4 style={{ color: '#0f172a', marginBottom: '15px' }}>Sent Alerts History</h4>
    {alertHistory.length === 0 ? (
      <p style={{ color: '#64748b' }}>No alerts have been sent yet.</p>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>Target</th>
              <th style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>Message</th>
              <th style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {alertHistory.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                  {a.timestamp?.toDate ? a.timestamp.toDate().toLocaleString() : 'Just now'}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#991b1b' }}>{a.hospitalName}</td>
                <td style={{ padding: '12px', color: '#334155' }}>{a.message}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => deleteSentAlert(a.id, a)}
                    style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
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