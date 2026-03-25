import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

function Hospital() {
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

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      setSections([...sections, { name: newSectionName.trim(), available: true }]);
      setNewSectionName('');
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
      const currentBeds = parseInt(editTotalBeds) || 0;
      const currentAvailable = parseInt(editAvailableBeds) || 0;
      const dengueCasesVal = parseInt(dengueCases) || 0;
      const fluCasesVal = parseInt(fluCases) || 0;
      const cleanedDiseases = customDiseases.filter(d => d.name.trim() !== '');

      // 1. Validation via Python ML API
      let mlStatus = "Normal";
      let mlTrustScore = 100;
      let mlAnalysisDetail = null;

      try {
        const mlResponse = await fetch('/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospital_id: hospitalId,
            current_beds: currentBeds,
            previous_beds: hospitalData.totalBeds || currentBeds,
            average_beds: hospitalData.totalBeds || currentBeds
          })
        });

        if (mlResponse.ok) {
          const mlResult = await mlResponse.json();
          mlStatus = mlResult.status || "Normal";
          mlTrustScore = mlResult.confidence_score !== undefined ? mlResult.confidence_score : 100;
          mlAnalysisDetail = mlResult;

          // 2. Alert the Authority Dashboard if Data is Suspicious
          if (mlStatus === "Suspicious" || mlResult.anomaly_type) {
            import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
              addDoc(collection(db, "alerts"), {
                hospitalId: hospitalId,
                hospitalName: hospitalData.name || "Unknown Hospital",
                uploaderEmail: hospitalData.email || "Unknown Email",
                type: mlResult.anomaly_type || "fake_entry",
                message: mlResult.reason || "Suspicious data detected by ML Model. High variance from average operations.",
                severity: mlResult.severity || "High",
                timestamp: serverTimestamp(),
                dataSnapshot: {
                  current_beds: currentBeds,
                  previous_beds: hospitalData.totalBeds || currentBeds
                }
              }).catch(err => console.error("Failed to write ML alert:", err));
            });
          }
        }
      } catch (mlErr) {
        console.error("ML Validation skipped or failed:", mlErr);
      }

      // 3. Finalize Update to Firestore
      const docRef = doc(db, "hospitals", hospitalId);
      await updateDoc(docRef, {
        totalBeds: currentBeds,
        availableBeds: currentAvailable,
        dengueCases: dengueCasesVal,
        fluCases: fluCasesVal,
        sections: sections,
        customDiseases: cleanedDiseases,
        
        // ML Metadata fields
        fraudStatus: mlStatus,
        trustScore: mlTrustScore,
        lastMLAnalysis: mlAnalysisDetail,
        lastUpdatedByDash: new Date().toISOString()
      });
      
      alert('Hospital data validated and updated successfully!');
      setIsEditing(false);
      setCustomDiseases(cleanedDiseases);
      setHospitalData({
        ...hospitalData,
        totalBeds: currentBeds,
        availableBeds: currentAvailable,
        dengueCases: dengueCasesVal,
        fluCases: fluCasesVal,
        sections: sections,
        customDiseases: cleanedDiseases,
        fraudStatus: mlStatus,
        trustScore: mlTrustScore
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

      </div>

    </div>
  )
}

export default Hospital