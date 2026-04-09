# 🚀 DEPLOYMENT COMMANDS - Quick Reference

## ONE-LINE DEPLOYMENT (Copy & Paste)

### Windows (PowerShell/CMD):
git add . && git commit -m "Removed hospital comparison tool" && git push origin main && npm run build && firebase deploy

### Mac/Linux (Terminal):
git add . && git commit -m "Removed hospital comparison tool" && git push origin main && npm run build && firebase deploy

---

## STEP-BY-STEP COMMANDS

### 1️⃣ Push to GitHub
git add .
git commit -m "Removed hospital comparison tool"
git push origin main

### 2️⃣ Build Application
npm run build

### 3️⃣ Deploy to Firebase
firebase deploy

---

## FIRST TIME SETUP (Only Once)

### Install Firebase CLI
npm install -g firebase-tools

### Login to Firebase
firebase login

### Initialize Firebase (if not done)
firebase init

---

## VERIFY DEPLOYMENT

### Check Git Status
git status

### Check Firebase Project
firebase projects:list

### View Deployment URL
firebase hosting:channel:list

---

## TROUBLESHOOTING

### If build fails:
npm install
npm run build

### If Firebase login fails:
firebase logout
firebase login

### If Git push fails:
git pull origin main
git push origin main

---

## YOUR GITHUB REPOSITORY
https://github.com/rohan1785/Smart-Health-Care-System

## FIREBASE CONSOLE
https://console.firebase.google.com/

---

✅ After deployment, your app will be live at:
   https://[your-project-id].web.app
