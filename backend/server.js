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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} var ahe`));
