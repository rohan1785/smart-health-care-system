import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

  const [hospitalData, setHospitalData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit states for live dashboard
  const [editTotalBeds, setEditTotalBeds] = useState(0)
  const [editAvailableBeds, setEditAvailableBeds] = useState(0)
  
  const [dengueCases, setDengueCases] = useState(0)
  const [fluCases, setFluCases] = useState(0)
  const [customDiseases, setCustomDiseases] = useState(

  const [sections, setSections] = useState([])
  const [newSectionName, setNewSectionName] = useState('')

  const userRole = localStorage.getItem("role");
  const hospitalId = localStorage.getItem("hospitalId");
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
<<<<<<< HEAD
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
=======
        if (userRole === "hospital" && hospitalId) {
          const docRef = doc(db, "hospitals", hospitalId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHospitalData({ id: docSnap.id, ...data });
            setEditTotalBeds(data.totalBeds || 0);
            setEditAvailableBeds(data.availableBeds || 0);
            setDengueCases(data.dengueCases || 0);
            setFluCases(data.fluCases || 0);
            setCustomDiseases(data.customDiseases || []);
            setSections(data.sections || []);
          }
        } 
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7
      } catch (error) {
        console.error("Error fetching hospital: ", error);
      }
    };
    fetchHospitalData();
  }, [userRole, hospitalId]);
=======
function Hospital() {
  const [hospitals, setHospitals] = useState([])
  const [name, setName] = useState('')
  const [totalBeds, setTotalBeds] = useState('')
  const [currentBeds, setCurrentBeds] = useState('')
  const [ventilators, setVentilators] = useState('')
  const [icuBeds, setIcuBeds] = useState('')
  const [ambulances, setAmbulances] = useState('')
  const [trustScore, setTrustScore] = useState('100')
  const [hospitalData, setHospitalData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit states for live dashboard
  const [editTotalBeds, setEditTotalBeds] = useState(0)
  const [editAvailableBeds, setEditAvailableBeds] = useState(0)
  
  const [dengueCases, setDengueCases] = useState(0)
  const [fluCases, setFluCases] = useState(0)
  const [customDiseases, setCustomDiseases] = useState([])

  const [sections, setSections] = useState([])
  const [newSectionName, setNewSectionName] = useState('')

  const userRole = localStorage.getItem("role");
  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    const fetchHospitalData = async () => {
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
        if (userRole === "hospital" && hospitalId) {
          const docRef = doc(db, "hospitals", hospitalId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHospitalData({ id: docSnap.id, ...data });
            setEditTotalBeds(data.totalBeds || 0);
            setEditAvailableBeds(data.availableBeds || 0);
            setDengueCases(data.dengueCases || 0);
            setFluCases(data.fluCases || 0);
            setCustomDiseases(data.customDiseases || []);
            setSections(data.sections || []);
          }
        } 
      } catch (error) {
        console.error("Error fetching hospital: ", error);
      }
    };
    fetchHospitalData();
  }, [userRole, hospitalId]);
=======
  const [hospitalData, setHospitalData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit states for live dashboard
  const [editTotalBeds, setEditTotalBeds] = useState(0)
  const [editAvailableBeds, setEditAvailableBeds] = useState(0)
  
  const [dengueCases, setDengueCases] = useState(0)
  const [fluCases, setFluCases] = useState(0)
  const [customDiseases, setCustomDiseases] = useState([])

  const [sections, setSections] = useState([])
  const [newSectionName, setNewSectionName] = useState('')

  const userRole = localStorage.getItem("role");
  const hospitalId = localStorage.getItem("hospitalId");
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
<<<<<<< HEAD
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
=======
        if (userRole === "hospital" && hospitalId) {
          const docRef = doc(db, "hospitals", hospitalId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHospitalData({ id: docSnap.id, ...data });
            setEditTotalBeds(data.totalBeds || 0);
            setEditAvailableBeds(data.availableBeds || 0);
            setDengueCases(data.dengueCases || 0);
            setFluCases(data.fluCases || 0);
            setCustomDiseases(data.customDiseases || []);
            setSections(data.sections || []);
          }
        } 
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7
      } catch (error) {
        console.error("Error fetching hospital: ", error);
      }
    };
    fetchHospitalData();
  }, [userRole, hospitalId]);

<<<<<<< HEAD
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
=======
  const handleAddSection = () => {
    if (newSectionName.trim()) {
      setSections([...sections, { name: newSectionName.trim(), available: true }]);
      setNewSectionName('');
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7
    }
  }

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  }

  const handleAddDisease = () => {
    setCustomDiseases([...customDiseases, { name: '', cases: 0 }]);
  }

  const handleCustomDiseaseChange = (index, field, value) => {
    const updated = [...customDiseases];
    if (field === 'cases') {
      let v = parseInt(value);
      if (isNaN(v) || v < 0) v = 0;
      updated[index][field] = v;
    } else {
      updated[index][field] = value;
    }
    setCustomDiseases(updated);
  }

  const handleRemoveDisease = (index) => {
    setCustomDiseases(customDiseases.filter((_, i) => i !== index));
  }

  const handleSave = async () => {
    if (!hospitalId) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "hospitals", hospitalId);
      const cleanedDiseases = customDiseases.filter(d => d.name.trim() !== '');
      
      await updateDoc(docRef, {
        totalBeds: parseInt(editTotalBeds) || 0,
        availableBeds: parseInt(editAvailableBeds) || 0,
        dengueCases: parseInt(dengueCases) || 0,
        fluCases: parseInt(fluCases) || 0,
        sections: sections,
        customDiseases: cleanedDiseases
      });
      alert('Hospital data updated successfully!');
      setIsEditing(false);
      setCustomDiseases(cleanedDiseases);
      setHospitalData({
        ...hospitalData,
        totalBeds: parseInt(editTotalBeds),
        availableBeds: parseInt(editAvailableBeds),
        dengueCases: parseInt(dengueCases),
        fluCases: parseInt(fluCases),
        sections: sections,
        customDiseases: cleanedDiseases
      });
    } catch (error) {
      console.error("Error updating document: ", error);
      alert('Failed to update hospital data');
    } finally {
      setIsSaving(false);
    }
  }

  if (userRole !== 'hospital' || !hospitalId) {
      return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p style={{ color: '#64748b', marginTop: '10px' }}>You must log in as a registered Hospital to view this management dashboard.</p>
        </div>
      );
  }

  if (!hospitalData) {
     return <div style={{ padding: '80px', textAlign: 'center' }}>Loading hospital dashboard...</div>;
  }

  // Handle number inputs without deleting zero immediately in react
  const handleNumChange = (e, setter) => {
     let v = parseInt(e.target.value);
     if (isNaN(v)) v = 0;
     if (v < 0) v = 0;
     setter(v);
  }

  return (
    <div>
      <div className="page-header">
<<<<<<< HEAD
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



=======
        <h1 className="page-title">Hospital Resources Management</h1>
        <p className="page-subtitle">Update hospital resources, bed availability, active diseases, and sections</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '30px auto', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0 }}>🏥 {hospitalData.name}</h2>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✏️ Edit Details
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to original data
                    setEditTotalBeds(hospitalData.totalBeds);
                    setEditAvailableBeds(hospitalData.availableBeds);
                    setDengueCases(hospitalData.dengueCases);
                    setFluCases(hospitalData.fluCases);
                    setCustomDiseases(hospitalData.customDiseases || []);
                    setSections(hospitalData.sections || []);
                  }} 
                  style={{ padding: '12px 24px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSaving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '30px' }}>
           
           {/* Section 1: Bed Management */}
           <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🛏️ Bed Availability</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '600' }}>Total Licensed Beds</label>
                {isEditing ? (
                  <input type="number" min="0" value={editTotalBeds} onChange={(e) => handleNumChange(e, setEditTotalBeds)} style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.05rem', backgroundColor: 'white' }} />
                ) : (
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>{editTotalBeds}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '600' }}>Available Empty Beds</label>
                {isEditing ? (
                  <input type="number" min="0" value={editAvailableBeds} onChange={(e) => handleNumChange(e, setEditAvailableBeds)} style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '2px solid #10b981', fontSize: '1.05rem', backgroundColor: '#ecfdf5', color: '#065f46' }} />
                ) : (
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#10b981' }}>{editAvailableBeds}</div>
                )}
              </div>
           </div>

           {/* Section 2: Active Diseases */}
           <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <span>🦠 Active Disease Cases</span>
                {isEditing && (
                  <button onClick={handleAddDisease} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>+ Add Disease</button>
                )}
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '600' }}>Dengue Admissions</label>
                {isEditing ? (
                  <input type="number" min="0" value={dengueCases} onChange={(e) => handleNumChange(e, setDengueCases)} style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '2px solid #fca5a5', fontSize: '1.05rem', backgroundColor: '#fef2f2', color: '#991b1b' }} />
                ) : (
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ef4444' }}>{dengueCases} Cases</div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '600' }}>Flu Admissions</label>
                {isEditing ? (
                  <input type="number" min="0" value={fluCases} onChange={(e) => handleNumChange(e, setFluCases)} style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '2px solid #7dd3fc', fontSize: '1.05rem', backgroundColor: '#f0f9ff', color: '#0369a1' }} />
                ) : (
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0ea5e9' }}>{fluCases} Cases</div>
                )}
              </div>

              {customDiseases.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', color: '#475569', fontWeight: '600' }}>Other Diseases</label>
                  {customDiseases.map((d, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      {isEditing ? (
                        <>
                          <input type="text" placeholder="Disease Name" value={d.name} onChange={(e) => handleCustomDiseaseChange(index, 'name', e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <input type="number" min="0" value={d.cases} onChange={(e) => handleCustomDiseaseChange(index, 'cases', e.target.value)} style={{ padding: '10px', width: '80px', borderRadius: '6px', border: '1px solid #cbd5e1' }} title="Cases" />
                          <button onClick={() => handleRemoveDisease(index)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove">×</button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: '500', color: '#334155' }}>{d.name || 'Unnamed Disease'}</span>
                          <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{d.cases} Cases</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
           </div>

        </div>

        {/* Section 3: Hospital Departments/Sections */}
        <div style={{ marginTop: '30px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
           <h3 style={{ color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🩺 Medical Departments & Sections</h3>
           
           {isEditing && (
             <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
               <input 
                 type="text" 
                 placeholder="Add new section (e.g. Cardiology, Oncology, Orthopedics...)" 
                 value={newSectionName}
                 onChange={(e) => setNewSectionName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                 style={{ padding: '14px 16px', flex: '1', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} 
               />
               <button 
                 onClick={handleAddSection}
                 style={{ padding: '0 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                 + Add
               </button>
             </div>
           )}

           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
             {sections.length === 0 ? (
               <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '10px 0' }}>No specific departments or sections added yet.</p>
             ) : (
               sections.map((sec, index) => (
                 <div key={index} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                   <span style={{ fontWeight: '500', color: '#0f172a' }}>{sec.name}</span>
                   {isEditing && (
                     <button onClick={() => handleRemoveSection(index)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', padding: 0 }} title="Remove section">
                       ×
                     </button>
                   )}
                 </div>
               ))
             )}
           </div>
        </div>
>>>>>>> 61f38abd53ceee3cffc96a17506161520b767af7

      </div>

    </div>
  )
}

export default Hospital