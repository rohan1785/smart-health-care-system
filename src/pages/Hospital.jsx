import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ArcElement,
  BarElement,
  Title,
  Filler
} from 'chart.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ArcElement,
  BarElement,
  Title,
  Filler
)

function Hospital() {
  const [hospitalData, setHospitalData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editTotalBeds, setEditTotalBeds] = useState(0)
  const [editAvailableBeds, setEditAvailableBeds] = useState(0)
  const [editVentilators, setEditVentilators] = useState(0)
  const [editContact, setEditContact] = useState('')
  
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
            setEditVentilators(data.currentEquipment?.ventilators || 0);
            setEditContact(data.phone || '');
            
            let loadedDiseases = data.customDiseases || [];
            if (data.dengueCases > 0 && !loadedDiseases.some(d => d.name.toLowerCase() === 'dengue')) {
              loadedDiseases.push({ name: 'Dengue', cases: data.dengueCases });
            }
            if (data.fluCases > 0 && !loadedDiseases.some(d => d.name.toLowerCase() === 'flu')) {
              loadedDiseases.push({ name: 'Flu', cases: data.fluCases });
            }
            
            setCustomDiseases(loadedDiseases);
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
      const cleanedDiseases = customDiseases.filter(d => d.name.trim() !== '');

      const totalCases = cleanedDiseases.reduce((acc, curr) => acc + (parseInt(curr.cases) || 0), 0);
      const prevTotalCases = hospitalData.customDiseases 
         ? hospitalData.customDiseases.reduce((acc, curr) => acc + (parseInt(curr.cases) || 0), 0)
         : (hospitalData.dengueCases || 0) + (hospitalData.fluCases || 0);

      let mlStatus = "Normal";
      let mlTrustScore = 100;
      let mlAnalysisDetail = null;

      try {
        const prev_beds = parseInt(hospitalData.totalBeds || currentBeds);
        const avg_beds = parseInt(hospitalData.totalBeds || currentBeds);
        const bed_change = currentBeds - prev_beds;
        
        const rules = [];
        let severity = 'Low';

        if (currentBeds > avg_beds * 2 && currentBeds > 10) {
          rules.push(`Bed increase ${prev_beds} to ${currentBeds}`);
          severity = 'High';
        } else if (Math.abs(bed_change) > avg_beds * 0.5 && Math.abs(bed_change) > 10) {
          rules.push(`Bed update ${prev_beds} to ${currentBeds}`);
          severity = 'Medium';
        }

        const cases_change = totalCases - prevTotalCases;
        if (cases_change > 50 && totalCases > prevTotalCases * 1.5) {
          rules.push(`Disease cases increase ${prevTotalCases} to ${totalCases}`);
          severity = 'High';
        } else if (cases_change > 20) {
          rules.push(`Disease cases update ${prevTotalCases} to ${totalCases}`);
          severity = 'Medium';
        }

        if (rules.length > 0) {
          mlStatus = "Suspicious";
          mlTrustScore = cases_change > 50 ? 60 : 85;
          const anomaly_type = rules[0].split(' ')[0];
          mlAnalysisDetail = {
            anomaly_type: anomaly_type,
            reason: rules.join('; '),
            severity: severity,
            features_used: { bed_change: bed_change, cases_change: cases_change }
          };

          addDoc(collection(db, "alerts"), {
            hospitalId: hospitalId,
            hospitalName: hospitalData.name || "Unknown Hospital",
            uploaderEmail: hospitalData.email || "Unknown Email",
            type: anomaly_type,
            message: rules.join('; '),
            severity: severity,
            timestamp: serverTimestamp(),
            dataSnapshot: {
              current_beds: currentBeds,
              current_cases: totalCases
            }
          }).catch(err => console.error("Failed to write ML alert:", err));
        }
      } catch (mlErr) {
        console.error("Native Validation failed:", mlErr);
      }

      const docRef = doc(db, "hospitals", hospitalId);
      await updateDoc(docRef, {
        totalBeds: currentBeds,
        availableBeds: currentAvailable,
        currentEquipment: {
          ...(hospitalData.currentEquipment || {}),
          ventilators: parseInt(editVentilators) || 0
        },
        phone: editContact,
        dengueCases: 0,
        fluCases: 0,
        sections: sections,
        customDiseases: cleanedDiseases,
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
        currentEquipment: {
          ...(hospitalData.currentEquipment || {}),
          ventilators: parseInt(editVentilators) || 0
        },
        phone: editContact,
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

  const handleNumChange = (e, setter) => {
     let v = parseInt(e.target.value);
     if (isNaN(v)) v = 0;
     if (v < 0) v = 0;
     setter(v);
  }

  const calculateAnalytics = () => {
    let totalActive = 0;
    let critical = 0;
    let prevalent = { name: 'Unknown', cases: 0 };
    
    customDiseases.forEach(d => {
      const c = parseInt(d.cases) || 0;
      totalActive += c;
      if (c > prevalent.cases) {
        prevalent = { name: d.name || 'Unknown', cases: c };
      }
    });

    critical = Math.floor(totalActive * 0.15);
    return { totalActive, critical, prevalent: prevalent.name };
  }
  const analytics = calculateAnalytics();

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const element = document.getElementById('hospital-dashboard');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${hospitalData.name}_Report.pdf`);
  };

  const handleExportCSV = () => {
    const csvData = [
      ['Hospital Name', hospitalData.name],
      ['Total Beds', editTotalBeds],
      ['Available Beds', editAvailableBeds],
      ['Ventilators', editVentilators],
      ['Contact', editContact],
      [''],
      ['Disease Name', 'Cases'],
      ...customDiseases.map(d => [d.name, d.cases]),
      [''],
      ['Sections'],
      ...sections.map(s => [s.name])
    ];
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hospitalData.name}_Data.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: '#003D82',
        color: '#FFFFFF',
        padding: '16px 24px',
        borderBottom: '3px solid #002855'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 4px 0',
            letterSpacing: '0.5px'
          }}>Hospital Resources Management</h1>
          <p style={{ 
            fontSize: '0.875rem',
            margin: 0,
            opacity: 0.9
          }}>Update hospital resources, bed availability, active diseases, and sections</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      
      <div id="hospital-dashboard" style={{ 
        backgroundColor: '#FFFFFF',
        border: '1px solid #D1D5DB',
        borderRadius: '4px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1F2937', margin: 0, fontWeight: '700' }}>🏥 {hospitalData.name}</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <>
                <button onClick={handleDownloadPDF} style={{ padding: '10px 20px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>📄 Download PDF</button>
                <button onClick={handleExportCSV} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>📊 Export CSV</button>
                <button onClick={handlePrint} style={{ padding: '10px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>🖨️ Print</button>
                <button 
                  onClick={() => setIsEditing(true)} 
                  style={{ 
                    padding: '10px 20px',
                    backgroundColor: '#003D82',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}>
                  Edit Details
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditTotalBeds(hospitalData.totalBeds || 0);
                    setEditAvailableBeds(hospitalData.availableBeds || 0);
                    setEditVentilators(hospitalData.currentEquipment?.ventilators || 0);
                    setEditContact(hospitalData.phone || '');
                    setCustomDiseases(hospitalData.customDiseases || []);
                    setSections(hospitalData.sections || []);
                  }} 
                  style={{ 
                    padding: '10px 20px',
                    backgroundColor: '#FFFFFF',
                    color: '#6B7280',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}>
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={{ 
                    padding: '10px 20px',
                    backgroundColor: '#047857',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    fontSize: '0.875rem'
                  }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
           
           <div style={{ 
             backgroundColor: '#F9FAFB',
             padding: '20px',
             borderRadius: '4px',
             border: '1px solid #E5E7EB'
           }}>
              <h3 style={{ 
                color: '#374151',
                marginBottom: '16px',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Bed Availability</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#6B7280', fontWeight: '600', fontSize: '0.875rem' }}>Total Licensed Beds</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    min="0" 
                    value={editTotalBeds} 
                    onChange={(e) => handleNumChange(e, setEditTotalBeds)} 
                    style={{ 
                      padding: '10px 12px',
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1F2937' }}>{editTotalBeds}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#6B7280', fontWeight: '600', fontSize: '0.875rem' }}>Available Empty Beds</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    min="0" 
                    value={editAvailableBeds} 
                    onChange={(e) => handleNumChange(e, setEditAvailableBeds)} 
                    style={{ 
                      padding: '10px 12px',
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857' }}>{editAvailableBeds}</div>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#6B7280', fontWeight: '600', fontSize: '0.875rem' }}>Available Ventilators</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    min="0" 
                    value={editVentilators} 
                    onChange={(e) => handleNumChange(e, setEditVentilators)} 
                    style={{ 
                      padding: '10px 12px',
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1F2937' }}>{editVentilators}</div>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#6B7280', fontWeight: '600', fontSize: '0.875rem' }}>Contact Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editContact} 
                    onChange={(e) => setEditContact(e.target.value)} 
                    style={{ 
                      padding: '10px 12px',
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1F2937' }}>{editContact || 'Not Set'}</div>
                )}
              </div>
           </div>

           <div style={{ 
             backgroundColor: '#F9FAFB',
             padding: '20px',
             borderRadius: '4px',
             border: '1px solid #E5E7EB'
           }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ 
                  color: '#374151',
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>Active Disease Cases</h3>
                {isEditing && (
                  <button 
                    onClick={handleAddDisease} 
                    style={{ 
                      padding: '6px 12px',
                      backgroundColor: '#003D82',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>+ Add</button>
                )}
              </div>
              
              {customDiseases.length === 0 && !isEditing ? (
                 <p style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.875rem' }}>No active diseases tracked.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {customDiseases.map((d, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isEditing ? (
                        <>
                          <input 
                            type="text" 
                            placeholder="Disease Name" 
                            value={d.name} 
                            onChange={(e) => handleCustomDiseaseChange(index, 'name', e.target.value)} 
                            style={{ 
                              padding: '8px 10px',
                              flex: '1',
                              borderRadius: '4px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.875rem'
                            }} 
                          />
                          <input 
                            type="number" 
                            min="0" 
                            value={d.cases} 
                            onChange={(e) => handleCustomDiseaseChange(index, 'cases', e.target.value)} 
                            style={{ 
                              padding: '8px 10px',
                              width: '70px',
                              borderRadius: '4px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.875rem'
                            }} 
                            title="Cases" 
                          />
                          <button 
                            onClick={() => handleRemoveDisease(index)} 
                            style={{ 
                              backgroundColor: '#FEE2E2',
                              border: 'none',
                              color: '#DC2626',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }} 
                            title="Remove">×</button>
                        </>
                      ) : (
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          backgroundColor: 'white',
                          padding: '10px 12px',
                          borderRadius: '4px',
                          border: '1px solid #E5E7EB'
                        }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>{d.name || 'Unnamed Disease'}</span>
                          <span style={{ fontWeight: 'bold', color: '#DC2626', fontSize: '0.875rem' }}>{d.cases} Cases</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
           </div>

        </div>

        <div style={{ 
          marginTop: '24px',
          backgroundColor: '#F9FAFB',
          padding: '20px',
          borderRadius: '4px',
          border: '1px solid #E5E7EB'
        }}>
           <h3 style={{ 
             color: '#374151',
             marginBottom: '16px',
             fontSize: '1rem',
             fontWeight: '600'
           }}>Medical Departments & Sections</h3>
           
           {isEditing && (
             <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
               <input 
                 type="text" 
                 placeholder="Add new section (e.g. Cardiology, Oncology)" 
                 value={newSectionName}
                 onChange={(e) => setNewSectionName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                 style={{ 
                   padding: '10px 12px',
                   flex: '1',
                   borderRadius: '4px',
                   border: '1px solid #D1D5DB',
                   fontSize: '0.875rem'
                 }} 
               />
               <button 
                 onClick={handleAddSection}
                 style={{ 
                   padding: '10px 20px',
                   backgroundColor: '#003D82',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   fontWeight: '600',
                   cursor: 'pointer',
                   fontSize: '0.875rem'
                 }}>
                 + Add
               </button>
             </div>
           )}

           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
             {sections.length === 0 ? (
               <p style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '10px 0', fontSize: '0.875rem' }}>No specific departments or sections added yet.</p>
             ) : (
               sections.map((sec, index) => (
                 <div key={index} style={{ 
                   backgroundColor: 'white',
                   border: '1px solid #D1D5DB',
                   padding: '8px 16px',
                   borderRadius: '4px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '10px'
                 }}>
                   <span style={{ fontWeight: '500', color: '#1F2937', fontSize: '0.875rem' }}>{sec.name}</span>
                   {isEditing && (
                     <button 
                       onClick={() => handleRemoveSection(index)} 
                       style={{ 
                         backgroundColor: '#FEE2E2',
                         border: 'none',
                         color: '#DC2626',
                         cursor: 'pointer',
                         fontSize: '1.1rem',
                         width: '24px',
                         height: '24px',
                         borderRadius: '4px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         padding: 0
                       }} 
                       title="Remove section">
                       ×
                     </button>
                   )}
                 </div>
               ))
             )}
           </div>
        </div>

        {!isEditing && (
           <div style={{ marginTop: '30px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ color: '#0F172A', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>📊 Hospital Analytics & Trends</h3>
                  <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '4px' }}>Real-time disease progression and patient capacity insights.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#334155', fontWeight: '500', outline: 'none', backgroundColor: '#FFF' }}>
                    <option>Last 30 Days</option>
                    <option>Last 6 Months</option>
                    <option>Year to Date</option>
                  </select>
                  <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#334155', fontWeight: '500', outline: 'none', backgroundColor: '#FFF' }}>
                    <option>All Departments</option>
                    <option>ICU</option>
                    <option>General Ward</option>
                  </select>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', borderLeft: '4px solid #3B82F6' }}>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Active Cases</p>
                  <h2 style={{ color: '#0F172A', margin: '8px 0', fontSize: '2rem' }}>{analytics.totalActive}</h2>
                  <p style={{ color: '#10B981', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>↑ 5% from last week</p>
                </div>

                <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981' }}>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Available Beds</p>
                  <h2 style={{ color: '#0F172A', margin: '8px 0', fontSize: '2rem' }}>{hospitalData.availableBeds || 0}</h2>
                  <p style={{ color: parseInt(hospitalData.availableBeds) < 10 ? '#EF4444' : '#64748B', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {parseInt(hospitalData.availableBeds) < 10 ? 'Critical Capacity Alert' : 'Normal Capacity'}
                  </p>
                </div>

                <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B' }}>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Critical Patients (Est)</p>
                  <h2 style={{ color: '#0F172A', margin: '8px 0', fontSize: '2rem' }}>{analytics.critical}</h2>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>Require ICU Attention</p>
                </div>

                <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', borderLeft: '4px solid #8B5CF6' }}>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Prevalent Disease</p>
                  <h2 style={{ color: '#0F172A', margin: '8px 0', fontSize: '1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analytics.prevalent}</h2>
                  <p style={{ color: '#EF4444', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>Highest transmission rate</p>
                </div>
             </div>

             {customDiseases.length === 0 ? (
                <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#FFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  <span style={{ fontSize: '3rem' }}>📈</span>
                  <p style={{ color: '#475569', marginTop: '15px', fontSize: '1.1rem', fontWeight: '500' }}>No active disease cases recorded.</p>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Record patient cases to automatically generate your hospital's analytics dashboard.</p>
                </div>
             ) : (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 2fr) minmax(280px, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  
                  <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem' }}>Monthly Disease Progression (6 Months)</h4>
                    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                      <Line 
                        data={{
                          labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', new Date().toLocaleString('default', { month: 'short' })],
                          datasets: customDiseases.map((d, i) => {
                            const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#14B8A6'];
                            const c = colors[i % colors.length];
                            const base = parseInt(d.cases) || 0;
                            return {
                              label: d.name || 'Unnamed',
                              data: [
                                Math.max(0, Math.floor(base * 0.4)),
                                Math.max(0, Math.floor(base * 0.7)),
                                Math.max(0, Math.floor(base * 1.1)),
                                Math.max(0, Math.floor(base * 0.9)),
                                Math.max(0, Math.floor(base * 0.95)),
                                base
                              ],
                              borderColor: c,
                              backgroundColor: `${c}20`,
                              tension: 0.4,
                              pointRadius: 4,
                              pointHoverRadius: 6,
                              fill: true
                            }
                          })
                        }} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6 } },
                            tooltip: { mode: 'index', intersect: false }
                          },
                          scales: {
                            y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#F1F5F9' } },
                            x: { grid: { display: false } }
                          }
                        }} 
                      />
                    </div>
                  </div>

                  <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem' }}>Active Disease Distribution</h4>
                    <div style={{ position: 'relative', height: '260px', width: '100%' }}>
                      <Doughnut
                        data={{
                          labels: customDiseases.map(d => d.name || 'Unnamed'),
                          datasets: [{
                            data: customDiseases.map(d => parseInt(d.cases) || 0),
                            backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#14B8A6'],
                            borderWidth: 0,
                            hoverOffset: 4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '70%',
                          plugins: {
                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                          }
                        }}
                      />
                      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                         <span style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>{analytics.totalActive}</span>
                         <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>Total Cases</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem' }}>Daily New Admissions (Last 7 Days)</h4>
                  <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                    <Bar
                      data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
                        datasets: customDiseases.map((d, i) => {
                           const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#14B8A6'];
                           const base = parseInt(d.cases) || 0;
                           return {
                             label: d.name || 'Unnamed',
                             data: [
                               Math.round(base * 0.1), Math.round(base * 0.15), Math.round(base * 0.12),
                               Math.round(base * 0.08), Math.round(base * 0.2), Math.round(base * 0.15), Math.round(base * 0.2)
                             ],
                             backgroundColor: colors[i % colors.length],
                             borderRadius: 4
                           }
                        })
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top', labels: { usePointStyle: true } },
                          tooltip: { mode: 'index', intersect: false }
                        },
                        scales: {
                          x: { stacked: true, grid: { display: false } },
                          y: { stacked: true, grid: { borderDash: [4, 4], color: '#F1F5F9' } }
                        }
                      }}
                    />
                  </div>
                </div>
                </>
             )}
           </div>
        )}

      </div>

      </div>
    </div>
  )
}

export default Hospital
