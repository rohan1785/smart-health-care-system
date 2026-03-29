/**
 * Data Verification Workflow Component
 * Authority users review, verify, and approve/reject disease data reports
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import wsService from '../services/websocketService';
import { formatDate, formatNumber } from '../utils/formatters';

function DataVerificationWorkflow() {
  const [pendingReports, setPendingReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending | verified | rejected | all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  /**
   * Listen to disease reports
   */
  useEffect(() => {
    let q;

    if (filter === 'all') {
      q = query(collection(db, 'diseaseRecords'));
    } else {
      q = query(
        collection(db, 'diseaseRecords'),
        where('verificationStatus', '==', filter)
      );
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingReports(reports);
      setLoading(false);

      // Calculate stats
      if (filter === 'all') {
        const pending = reports.filter((r) => r.verificationStatus === 'pending').length;
        const verified = reports.filter((r) => r.verificationStatus === 'verified').length;
        const rejected = reports.filter((r) => r.verificationStatus === 'rejected').length;

        setStats({ pending, verified, rejected });
      }
    });

    return () => unsubscribe();
  }, [filter]);

  /**
   * Verify (approve) a report
   */
  const handleVerifyReport = useCallback(
    async (reportId, hospitalId) => {
      setVerifying(true);
      try {
        const reportRef = doc(db, 'diseaseRecords', reportId);
        const userId = localStorage.getItem('userId') || 'authority_' + Date.now();

        await updateDoc(reportRef, {
          verificationStatus: 'verified',
          verifiedBy: userId,
          verifiedAt: new Date(),
        });

        // Notify via WebSocket
        wsService.verifyData(reportId, 'verified', userId);

        // Notify hospital
        wsService.send('data:verification_complete', {
          recordId: reportId,
          status: 'verified',
        });

        setSelectedReport(null);
        alert('✅ Report verified successfully');
      } catch (err) {
        setError(err.message);
        alert('❌ Error verifying report: ' + err.message);
      } finally {
        setVerifying(false);
      }
    },
    []
  );

  /**
   * Reject a report
   */
  const handleRejectReport = useCallback(
    async (reportId, reason) => {
      if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }

      setVerifying(true);
      try {
        const reportRef = doc(db, 'diseaseRecords', reportId);
        const userId = localStorage.getItem('userId') || 'authority_' + Date.now();

        await updateDoc(reportRef, {
          verificationStatus: 'rejected',
          rejectionReason: reason,
          rejectedBy: userId,
          rejectedAt: new Date(),
        });

        // Notify via WebSocket
        wsService.verifyData(reportId, 'rejected', userId);

        setSelectedReport(null);
        alert('❌ Report rejected');
      } catch (err) {
        setError(err.message);
        alert('Error rejecting report: ' + err.message);
      } finally {
        setVerifying(false);
      }
    },
    []
  );

  /**
   * Get hospital name (fetch from hospital document)
   */
  const getHospitalName = useCallback(async (hospitalId) => {
    try {
      const hospitalRef = doc(db, 'hospitals', hospitalId);
      const hospitalDoc = await getDocs(query(collection(db, 'hospitals'), where('id', '==', hospitalId)));
      return hospitalDoc.docs[0]?.data()?.name || 'Unknown Hospital';
    } catch (error) {
      console.error('Error fetching hospital:', error);
      return 'Unknown Hospital';
    }
  }, []);

  const stats_summary = filter === 'all' ? stats : {};

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Data Verification Workflow</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Review and approve/reject disease case reports from hospitals
        </p>

        {/* Stats Cards */}
        {filter === 'all' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #fbbf24',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>Pending</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {stats.pending}
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #10b981',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>Verified</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {stats.verified}
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #ef4444',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>Rejected</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {stats.rejected}
              </p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['pending', 'verified', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === status ? '#0ea5e9' : '#e2e8f0',
                color: filter === status ? 'white' : '#475569',
                fontWeight: filter === status ? 'bold' : 'normal',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Two-Column Layout: List and Detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Reports List */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>
                {filter === 'pending' ? 'Pending Reviews' : 'Reports'}
              </h3>
              <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading reports...
              </div>
            ) : pendingReports.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                }}
              >
                No reports found
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {pendingReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      backgroundColor: selectedReport?.id === report.id ? '#f0f9ff' : 'white',
                      borderLeft: selectedReport?.id === report.id ? '4px solid #0ea5e9' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#0f172a' }}>
                          Hospital {report.hospitalId.slice(0, 8)}
                        </p>
                        <p style={{ margin: '0 0 3px 0', color: '#475569', fontSize: '0.85rem' }}>
                          Disease: {report.diseaseId}
                        </p>
                        <p style={{ margin: '0', color: '#64748b', fontSize: '0.8rem' }}>
                          {formatDate(report.reportedAt, 'datetime')}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor:
                            report.verificationStatus === 'verified'
                              ? '#d1fae5'
                              : report.verificationStatus === 'rejected'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            report.verificationStatus === 'verified'
                              ? '#047857'
                              : report.verificationStatus === 'rejected'
                              ? '#991b1b'
                              : '#d97706',
                        }}
                      >
                        {report.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Detail & Actions */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '20px',
            }}
          >
            {selectedReport ? (
              <>
                <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Report Details</h3>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.9rem' }}>Hospital</h4>
                  <p style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>
                    {selectedReport.hospitalId}
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.9rem' }}>Disease</h4>
                  <p style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>
                    {selectedReport.diseaseId}
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.9rem' }}>Cases</h4>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {formatNumber(selectedReport.newCases)} new
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Recovered: {formatNumber(selectedReport.recoveredCases)} | Fatal:{' '}
                    {formatNumber(selectedReport.fatalCases)}
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.9rem' }}>
                    Data Quality Score
                  </h4>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${selectedReport.dataQualityScore || 75}%`,
                        backgroundColor:
                          (selectedReport.dataQualityScore || 75) > 80
                            ? '#10b981'
                            : (selectedReport.dataQualityScore || 75) > 60
                            ? '#fbbf24'
                            : '#ef4444',
                      }}
                    />
                  </div>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    {(selectedReport.dataQualityScore || 75).toFixed(0)}%
                  </p>
                </div>

                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '0.9rem' }}>
                    Reported At
                  </h4>
                  <p style={{ margin: 0, color: '#0f172a' }}>
                    {formatDate(selectedReport.reportedAt, 'datetime')}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    By: {selectedReport.reportedBy}
                  </p>
                </div>

                {/* Action Buttons - Only for pending */}
                {selectedReport.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerifyReport(selectedReport.id, selectedReport.hospitalId)}
                      disabled={verifying}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: verifying ? 'not-allowed' : 'pointer',
                        marginBottom: '10px',
                      }}
                    >
                      {verifying ? 'Processing...' : '✓ Verify Report'}
                    </button>

                    <RejectReportForm
                      reportId={selectedReport.id}
                      onReject={handleRejectReport}
                      disabled={verifying}
                    />
                  </>
                )}

                {/* Show status if already verified/rejected */}
                {selectedReport.verificationStatus === 'verified' && (
                  <div style={{ padding: '12px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#047857', fontWeight: 'bold' }}>
                      ✓ Verified by {selectedReport.verifiedBy}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#047857', fontSize: '0.85rem' }}>
                      {formatDate(selectedReport.verifiedAt, 'datetime')}
                    </p>
                  </div>
                )}

                {selectedReport.verificationStatus === 'rejected' && (
                  <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#991b1b', fontWeight: 'bold' }}>
                      ✗ Rejected by {selectedReport.rejectedBy}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#991b1b', fontSize: '0.85rem' }}>
                      Reason: {selectedReport.rejectionReason}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#991b1b', fontSize: '0.8rem' }}>
                      {formatDate(selectedReport.rejectedAt, 'datetime')}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px' }}>
                <p>Select a report to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reject Report Form Component
 */
function RejectReportForm({ reportId, onReject, disabled }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onReject(reportId, reason);
    setReason('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        disabled={disabled}
      >
        ✗ Reject Report
      </button>
    );
  }

  return (
    <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px' }}>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason for rejection..."
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #fecaca',
          marginBottom: '10px',
          fontFamily: 'Arial, sans-serif',
          minHeight: '80px',
        }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSubmit}
          disabled={!reason.trim() || disabled}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: !reason.trim() || disabled ? 'not-allowed' : 'pointer',
            opacity: !reason.trim() ? 0.5 : 1,
          }}
        >
          Confirm Rejection
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setReason('');
          }}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#d1d5db',
            color: '#374151',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DataVerificationWorkflow;
