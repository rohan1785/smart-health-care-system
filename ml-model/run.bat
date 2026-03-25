@echo off
echo Starting ML Fraud Detection API...
echo Install dependencies first: pip install -r requirements.txt
echo.
echo Run with: python app.py
echo Test with: curl -X POST http://localhost:5000/detect -H "Content-Type: application/json" -d "{\"current_beds\":150,\"previous_beds\":50,\"average_beds\":60,\"history\":[]}"
echo.
pause
