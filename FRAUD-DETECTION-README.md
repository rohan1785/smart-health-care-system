# Smart Health ML Fraud Detection System 🏥🔍

## 🎯 What It Does
**Real-time anomaly detection** for fake hospital data (beds, ventilators, ambulances).

**Flow**: Hospital updates → ML Isolation Forest → Fraud alert → Authority dashboard

## 🚀 Live Test (localhost:5173)

### **Login**
```
Hospital: hospital / 123
Authority: authority / 123
```

### **Test Fraud**
```
1. /hospital → Edit "Fraud Hospital A" → Beds 120 → **250** → Save
2. /authority → **🔴 Suspicious** alert appears!
3. Trust score drops 100→75
```

### **ML API** 
```
cd ml-model
python app.py
curl -X POST http://localhost:5000/detect -d '{"current_beds":250,"previous_beds":120}'
→ {"status":"Suspicious","reason":"Sudden Bed Spike"}
```

### **Firebase** 
```
console.firebase.google.com/project/smart-health-system-e3411/firestore
→ hospitals: fraudStatus | alerts: new entries
```

## 🛠 Stack
```
React + Tailwind + Firebase (e3411)
Python Flask + scikit-learn (Isolation Forest)
Cloud Functions (auto-trigger)
```

## 📈 ML Logic
```
Features: current_beds, bed_change, bed_dev, ventilator_change
Rules: >2x spike = High, >50% change = Medium
Anomaly Score: Isolation Forest (contamination=0.02)
```

## 🚀 Deploy
```
firebase deploy --only functions (from /functions)
Railway/Render for ml-model/app.py
```

## 🎯 Demo Script
```
"Hospital fake spike detected → ML flags → Authority alerted instantly"
```

**Hackathon Winner**: End-to-end ML → Real-time → Production UI 🏆

**Status**: LIVE & TESTED

