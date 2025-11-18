# HandyWorks Firebase Setup Guide

## Project Created ✅

- **Project Name:** Handyworks-Billing
- **Project ID:** handyworks-billing
- **Project Number:** 326712635528

## Next Steps to Complete Setup

### Step 1: Enable Firestore Database

1. Go to Firebase Console: https://console.firebase.google.com/project/handyworks-billing
2. Click **Firestore Database** in left menu
3. Click **Create database**
4. Choose **Start in test mode** (we'll add security rules later)
5. Select location: **us-east1** (or your preferred region)
6. Click **Enable**

### Step 2: Create Web App and Get Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → Select **Web** (</> icon)
4. Register app:
   - **App nickname:** HandyWorks Web
   - **Firebase Hosting:** (optional, can enable later)
5. Click **Register app**
6. Copy the `firebaseConfig` object that appears

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "handyworks-billing.firebaseapp.com",
  projectId: "handyworks-billing",
  storageBucket: "handyworks-billing.firebasestorage.app",
  messagingSenderId: "326712635528",
  appId: "1:326712635528:web:..."
};
```

### Step 3: Update Import Script

Once you have the `firebaseConfig`, update `scripts/import_handyworks_data.js` with the actual values.

### Step 4: Run Data Import

After Firestore is enabled and config is updated:
```bash
node scripts/import_handyworks_data.js <your_data_file.tsv>
```

## Security Rules (To Be Added Later)

We'll create Firestore security rules to:
- Restrict access to authenticated users only
- Allow users to read their own billing data
- Allow admins to read/write all data
- Prevent unauthorized access

## Notes

- **Firebase Free Tier:** Should be sufficient for ~100 users
- **Cost Monitoring:** Set up billing alerts in Google Cloud Console
- **Data Isolation:** Complete separation from JetLagPro research data ✅


