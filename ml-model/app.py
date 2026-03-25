from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
from datetime import datetime
import os
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Firebase (optional for production - for local dev comment out)
# cred = credentials.Certificate("firebase-key.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# Load or initialize model
MODEL_FILE = 'isolation_forest_model.pkl'
if os.path.exists(MODEL_FILE):
    with open(MODEL_FILE, 'rb') as f:
        model = pickle.load(f)
else:
    # Train initial model on synthetic data
    print("Training initial model...")
    np.random.seed(42)
    normal_data = np.random.normal(50, 10, (1000, 6))  # beds, change, dev, vent, icu, amb
    fraud_data = np.array([
        [150, 100, 80, 20, 50, 10],  # massive spike
        [5, 0, 45, 0, 0, 0],         # static fraud
    ])
    training_data = np.vstack([normal_data, fraud_data])
    model = IsolationForest(contamination=0.02, random_state=42)
    model.fit(training_data)
    with open(MODEL_FILE, 'wb') as f:
        pickle.dump(model, f)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "Isolation Forest v1.0"})

@app.route('/detect', methods=['POST'])
def detect_fraud():
    try:
        data = request.json
        
        # Extract features for ML
        current_beds = data.get('current_beds', 0)
        prev_beds = data.get('previous_beds', current_beds)
        avg_beds = data.get('average_beds', current_beds)
        bed_change = current_beds - prev_beds
        bed_dev = abs(current_beds - avg_beds)
        
        current_vent = data.get('current_equipment', {}).get('ventilators', 0)
        prev_vent = data.get('previous_equipment', {}).get('ventilators', current_vent)
        avg_vent = data.get('avg_equipment', {}).get('ventilators', current_vent)
        vent_change = current_vent - prev_vent
        vent_dev = abs(current_vent - avg_vent)
        
        icu_beds = data.get('current_equipment', {}).get('icuBeds', 0)
        amb = data.get('current_equipment', {}).get('ambulances', 0)
        
        features = np.array([[current_beds, bed_change, bed_dev, current_vent, vent_change, vent_dev]])
        
        # ML Prediction
        anomaly_score = model.decision_function(features)[0]
        is_anomaly = model.predict(features)[0] == -1
        
        # Rule-based (explainable)
        rules = []
        severity = 'Low'
        
        # Bed rules
        if current_beds > avg_beds * 2:
            rules.append('Sudden Bed Spike (>2x average)')
            severity = 'High'
        elif abs(bed_change) > avg_beds * 0.5:
            rules.append('Abnormal Bed Change (>50%)')
            severity = 'Medium'
        
        # Equipment rules
        if current_vent > avg_vent * 2:
            rules.append('Ventilator Spike')
            severity = 'High'
        
        anomaly_type = 'Outlier' if is_anomaly else 'Normal'
        if rules:
            anomaly_type = rules[0].split(' ')[0]
        
        confidence = max(50, min(100, 85 - anomaly_score * 20))
        
        result = {
            'status': 'Suspicious' if is_anomaly or rules else 'Normal',
            'anomaly_type': anomaly_type,
            'reason': '; '.join(rules) or 'No anomalies detected',
            'confidence_score': confidence,
            'severity': severity,
            'anomaly_score': float(anomaly_score),
            'features_used': {
                'bed_change': float(bed_change),
                'bed_deviation': float(bed_dev),
                'ventilator_change': float(vent_change)
            }
        }
        
        # Save prediction (optional)
        # db.collection('predictions').add({
        #     'hospital_id': data['hospital_id'],
        #     'result': result,
        #     'timestamp': firestore.SERVER_TIMESTAMP
        # })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'status': 'error', 'reason': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

