const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// ML API endpoint (local dev) - deploy with env vars for prod
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000/detect';

exports.detectFraud = onDocumentUpdated({
  document: 'hospitals/{hospitalId}'
}, async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  const hospitalId = event.params.hospitalId;
  
  functions.logger.info(`Fraud check triggered for ${hospitalId}`, { before, after });
  
  // Skip if no bed/equipment change or fraud already set
  if (before.currentBeds === after.currentBeds && 
      JSON.stringify(before.currentEquipment) === JSON.stringify(after.currentEquipment)) {
    return null;
  }
  
  try {
    // Fetch history (last 30 days)
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysAgo = new admin.firestore.Timestamp(
      now.seconds - 30*24*60*60, 
      now.nanoseconds
    );
    
    const historySnap = await admin.firestore()
      .collection('history')
      .where('hospitalId', '==', hospitalId)
      .where('timestamp', '>=', thirtyDaysAgo)
      .orderBy('timestamp')
      .limit(30)
      .get();
    
    const history = historySnap.docs.map(doc => doc.data());
    
    // Calculate averages
    const bedHistory = history.map(h => h.beds).filter(b => b);
    const avgBeds = bedHistory.length ? bedHistory.reduce((a,b)=>a+b,0)/bedHistory.length : after.currentBeds;
    
    const prevData = history.length ? history[history.length-1] : before;
    
    const payload = {
      hospital_id: hospitalId,
      current_beds: after.currentBeds,
      previous_beds: prevData?.beds || before?.currentBeds || 0,
      average_beds: avgBeds,
      current_equipment: after.currentEquipment || {},
      previous_equipment: prevData?.equipment || before?.currentEquipment || {},
      avg_equipment: {
        ventilators: history.map(h => h.equipment?.ventilators || 0).filter(v => v).reduce((a,b)=>a+b,0)/Math.max(1, history.filter(h=>h.equipment?.ventilators).length),
        icuBeds: history.map(h => h.equipment?.icuBeds || 0).filter(i => i).reduce((a,b)=>a+b,0)/Math.max(1, history.filter(h=>h.equipment?.icuBeds).length),
        ambulances: history.map(h => h.equipment?.ambulances || 0).filter(a => a).reduce((a,b)=>a+b,0)/Math.max(1, history.filter(h=>h.equipment?.ambulances).length)
      },
      history: history
    };
    
    // Call ML API
    const mlResponse = await axios.post(ML_API_URL, payload, { timeout: 10000 });
    const result = mlResponse.data;
    
    functions.logger.info(`ML Result: ${JSON.stringify(result)}`);
    
    if (result.status === 'Suspicious') {
      // Update hospital
      await admin.firestore().collection('hospitals').doc(hospitalId).update({
        fraudStatus: 'Suspicious',
        fraudReason: result.reason,
        lastFraudCheck: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Reduce trust score
      const currentTrust = after.trustScore || 100;
      const newTrust = Math.max(0, currentTrust - 25);
      
      await admin.firestore().collection('hospitals').doc(hospitalId).update({
        trustScore: newTrust
      });
      
      // Create alert
      await admin.firestore().collection('alerts').add({
        hospitalId: hospitalId,
        hospitalName: after.name,
        reason: `Fraud Detected: ${result.reason}`,
        status: 'Pending',
        severity: result.severity,
        confidence: result.confidence_score,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        anomalyType: result.anomaly_type
      });
      
      functions.logger.info(`Fraud alert created for ${hospitalId}`);
    }
    
    return { result, hospitalId };
    
  } catch (error) {
    functions.logger.error('Fraud detection failed:', error);
    // Always update lastChecked
    await admin.firestore().collection('hospitals').doc(hospitalId).update({
      lastFraudCheck: admin.firestore.FieldValue.serverTimestamp()
    });
    return null;
  }
});

exports.healthCheck = onRequest((req, res) => {
  res.json({status: 'healthy', timestamp: new Date().toISOString()});
});
