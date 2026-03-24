import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3ei6PchbpDRkF4mQ3L6m-O1vNwf7SZFo",
  authDomain: "smart-health-system-e3411.firebaseapp.com",
  projectId: "smart-health-system-e3411"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateTestData() {
  const testHospitals = [
    // Normal
    { name: 'City General Hospital', totalBeds: 200, currentBeds: 120, currentEquipment: {ventilators: 15, icuBeds: 30, ambulances: 5}, trustScore: 95, fraudStatus: 'Normal' },
    
    // Bed spike fraud
    { name: 'Fraud Hospital A', totalBeds: 100, currentBeds: 250, currentEquipment: {ventilators: 8, icuBeds: 20, ambulances: 3}, trustScore: 75, fraudStatus: 'Suspicious' },
    
    // Equipment fraud
    { name: 'Fraud Hospital B', totalBeds: 150, currentBeds: 80, currentEquipment: {ventilators: 50, icuBeds: 60, ambulances: 20}, trustScore: 60, fraudStatus: 'Suspicious' },
    
    // Static fraud
    { name: 'Static Data Hospital', totalBeds: 80, currentBeds: 40, currentEquipment: {ventilators: 0, icuBeds: 0, ambulances: 0}, trustScore: 85, fraudStatus: 'Normal' }
  ];

  console.log('Generating test data...');
  
  for (const hospital of testHospitals) {
    await addDoc(collection(db, 'hospitals'), {
      ...hospital,
      lastUpdated: serverTimestamp(),
      location: 'Test Location'
    });
    console.log(`Added: ${hospital.name}`);
  }
  
  // Generate history
  const historyPoints = [
    { beds: 120, equipment: {ventilators: 15, icuBeds: 30, ambulances: 5} },
    { beds: 115, equipment: {ventilators: 14, icuBeds: 28, ambulances: 5} }
  ];
  
  // Add history for first hospital
  for (let i = 0; i < 10; i++) {
    await addDoc(collection(db, 'history'), {
      hospitalId: 'test-hospital-1',
      ...historyPoints[Math.floor(Math.random() * historyPoints.length)],
      timestamp: serverTimestamp()
    });
  }
  
  console.log('✅ Test data generated! Add 4 hospitals + history.');
  console.log('Next: Update beds/equipment in Hospital dashboard → watch fraud detection!');
}

generateTestData().catch(console.error);

