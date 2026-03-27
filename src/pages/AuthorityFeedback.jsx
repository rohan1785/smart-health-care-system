import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function AuthorityFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterHospital, setFilterHospital] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'hospitalFeedback'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFeedbacks(data)
    })
    return () => unsubscribe()
  }, [])

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'hospitalFeedback', id), {
        status: newStatus
      })
    } catch(err) {
      console.error(err);
      alert("Failed to update status");
    }
  }

  const deleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to remove this feedback?")) {
      try {
        await deleteDoc(doc(db, 'hospitalFeedback', id));
        alert("Feedback removed successfully.");
      } catch (err) {
        console.error("Error removing feedback:", err);
        alert("Failed to remove feedback");
      }
    }
  }

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchStatus = filterStatus === 'All' || fb.status === filterStatus.toLowerCase();
    const matchHospital = filterHospital === '' || (fb.hospitalName || '').toLowerCase().includes(filterHospital.toLowerCase());
    return matchStatus && matchHospital;
  });

  const getBadgeColor = (type) => {
    if(type === 'Positive Experience') return '#10b981'; // Green
    return '#ef4444'; // Red for everything else
  }

  const getStatusColor = (status) => {
    if(status === 'resolved') return '#10b981';
    if(status === 'verified') return '#f59e0b';
    return '#64748b'; // pending
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#0f172a' }}>Hospital Feedback Dashboard</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Monitor and resolve citizen feedback regarding city hospitals.</p>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Filter by Hospital Name..."
          value={filterHospital}
          onChange={(e) => setFilterHospital(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '250px' }}
        />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {filteredFeedbacks.length === 0 ? (
          <p style={{ color: '#64748b' }}>No feedback found.</p>
        ) : filteredFeedbacks.map(fb => (
          <div key={fb.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{fb.hospitalName}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0 0' }}>By {fb.citizenName}</p>
              </div>
              <span style={{ backgroundColor: getStatusColor(fb.status), color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {fb.status || 'pending'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ color: '#fbbf24', fontSize: '1.2rem', letterSpacing: '2px' }}>
                {'★'.repeat(fb.rating || 0)}{'☆'.repeat(5 - (fb.rating || 0))}
              </div>
              <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', backgroundColor: getBadgeColor(fb.feedbackType) + '20', color: getBadgeColor(fb.feedbackType), fontWeight: '600' }}>
                {fb.feedbackType}
              </span>
            </div>

            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              "{fb.description}"
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              {fb.status !== 'verified' && fb.status !== 'resolved' && (
                <button 
                  onClick={() => updateStatus(fb.id, 'verified')}
                  style={{ padding: '6px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  ✓ Verify
                </button>
              )}
              {fb.status !== 'resolved' && (
                <button 
                  onClick={() => updateStatus(fb.id, 'resolved')}
                  style={{ padding: '6px 14px', backgroundColor: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  ✓ Resolve
                </button>
              )}
              {fb.status !== 'pending' && (!fb.status || fb.status !== 'pending') && (
                <button 
                  onClick={() => updateStatus(fb.id, 'pending')}
                  style={{ padding: '6px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  ↻ Undo
                </button>
              )}
              <button 
                onClick={() => deleteFeedback(fb.id)}
                style={{ padding: '6px 14px', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', color: '#e11d48', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', marginLeft: 'auto' }}
              >
                Delete
              </button>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '15px', textAlign: 'right' }}>
              {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : 'Just now'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
