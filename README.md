# 🚀 Smart Health Care - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Node.js and npm installed
- ✅ Git installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ GitHub account
- ✅ Firebase project created

---

## 📦 Quick Deployment (Automated)

### For Windows:
```bash
deploy.bat
```

### For Mac/Linux:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔧 Manual Deployment Steps

### Step 1: Push to GitHub

```bash
# Add all changes
git add .

# Commit with a message
git commit -m "Updated hospital comparison feature"

# Push to GitHub
git push origin main
```

### Step 2: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 3: Deploy to Firebase

```bash
# Login to Firebase (first time only)
firebase login

# Deploy to Firebase Hosting
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

---

## 🌐 Your Deployment URLs

After successful deployment, your app will be available at:
- **Primary URL**: `https://your-project-id.web.app`
- **Secondary URL**: `https://your-project-id.firebaseapp.com`

---

## 📋 Common Commands

### Git Commands
```bash
# Check status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

### Firebase Commands
```bash
# View current project
firebase projects:list

# Check deployment status
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback

# View logs
firebase hosting:channel:open
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔐 Environment Variables

Make sure to set up your environment variables in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**⚠️ Never commit `.env` file to GitHub!**

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Deploy Fails
```bash
# Re-login to Firebase
firebase logout
firebase login

# Check if you're in the correct project
firebase use --add
```

### Git Push Rejected
```bash
# Pull latest changes first
git pull origin main --rebase
git push origin main
```

---

## 📊 Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Firebase security rules updated
- [ ] Build completes successfully
- [ ] Code committed to Git
- [ ] README updated with changes
- [ ] Version number updated in package.json

---

## 🔄 Continuous Deployment (Optional)

For automatic deployments on every push to GitHub:

1. Go to Firebase Console → Hosting
2. Click "Set up GitHub integration"
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/rohan1785/Smart-Health-Care-System/issues
- Firebase Documentation: https://firebase.google.com/docs

---

## 📝 Version History

- **v1.0.0** - Initial release with hospital management
- **v1.1.0** - Added ML fraud detection
- **v1.2.0** - Removed hospital comparison tool
- **v1.3.0** - Enhanced SMS alert system

---

**Last Updated**: $(date)
**Deployed By**: Municipal Health Authority
