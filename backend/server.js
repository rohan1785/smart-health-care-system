import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // Frontend la allow kar
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Backend chalto ahe!" });
});

app.post('/api/predict', (req, res) => {
  try {
    const symptomsStr = (req.body.symptoms || '').toLowerCase();
    
    let disease = "Undiagnosed Condition";
    let precautions = [
      "Consult a verified doctor immediately.", 
      "Keep track of your symptoms.", 
      "Drink plenty of water and rest."
    ];
    
    if (symptomsStr.includes('fever') && symptomsStr.includes('cough')) {
      disease = "Viral Infection / Flu";
      precautions = ["Rest and drink plenty of fluids", "Take paracetamol for fever", "Isolate if symptoms worsen"];
    } else if (symptomsStr.includes('headache') && symptomsStr.includes('nausea')) {
      disease = "Migraine / Gastric Issue";
      precautions = ["Rest in a dark, quiet room", "Stay hydrated", "Avoid heavy meals"];
    } else if (symptomsStr.includes('shortness of breath')) {
      disease = "Respiratory Issue (Urgent)";
      precautions = ["Seek emergency medical help immediately", "Sit upright", "Use inhaler if prescribed"];
    } else if (symptomsStr.includes('body ache') && symptomsStr.includes('fatigue')) {
      disease = "Viral Fever / Fatigue";
      precautions = ["Get adequate rest", "Take body ache medication", "Stay hydrated"];
    } else if (symptomsStr.includes('throat')) {
      disease = "Strep Throat / Tonsillitis";
      precautions = ["Gargle with warm salt water", "Drink soothing liquids", "Consult doctor for antibiotics if severe"];
    }
    
    res.json({ disease, precautions });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: 'error', reason: error.message });
  }
});

app.post('/api/detect', (req, res) => {
  try {
    const data = req.body || {};
    
    const current_beds = parseInt(data.current_beds || 0);
    const prev_beds = parseInt(data.previous_beds || current_beds);
    const avg_beds = parseInt(data.average_beds || current_beds);
    const bed_change = current_beds - prev_beds;
    const bed_dev = Math.abs(current_beds - avg_beds);
    
    const current_cases = parseInt(data.current_cases || 0);
    const prev_cases = parseInt(data.previous_cases || current_cases);
    const cases_change = current_cases - prev_cases;

    const rules = [];
    let severity = 'Low';

    // Bed rules
    if (current_beds > avg_beds * 2 && current_beds > 10) {
      rules.push('Sudden Bed Spike (>2x average)');
      severity = 'High';
    } else if (Math.abs(bed_change) > avg_beds * 0.5 && Math.abs(bed_change) > 10) {
      rules.push('Abnormal Bed Change (>50%)');
      severity = 'Medium';
    }

    // Disease outbreak rules
    if (cases_change > 50 && current_cases > prev_cases * 1.5) {
      rules.push('Sudden Severe Disease Spike (>50 cases)');
      severity = 'High';
    } else if (cases_change > 20) {
      rules.push('Abnormal Disease Spike');
      severity = 'Medium';
    }

    const anomaly_type = rules.length > 0 ? rules[0].split(' ')[0] : 'Normal';
    const confidence = rules.length > 0 ? 90 : 100;

    const result = {
      status: rules.length > 0 ? 'Suspicious' : 'Normal',
      anomaly_type: anomaly_type,
      reason: rules.join('; ') || 'No anomalies detected',
      confidence_score: confidence,
      severity: severity
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: 'error', reason: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} var ahe`));
