# Windows Setup Guide for HandyWorks Data Import

## Step 1: Install Node.js

You need Node.js to run the import script. Here are two options:

### Option A: Download and Install (Recommended)

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended for most users)
3. Run the installer (`.msi` file)
4. Follow the installation wizard (accept defaults)
5. **Restart your command prompt/PowerShell** after installation

### Option B: Using Chocolatey (if you have it)

```powershell
choco install nodejs
```

## Step 2: Verify Installation

Open a **new** PowerShell or Command Prompt window and run:

```powershell
node --version
npm --version
```

You should see version numbers (e.g., `v20.10.0` and `10.2.3`)

## Step 3: Install Firebase Package

Navigate to your project directory:

```powershell
cd C:\Users\Steve\Documents\GitHub\jetlagpro-website
```

Install the Firebase package:

```powershell
npm install firebase
```

## Step 4: Enable Firestore Database

Before running the import, you must enable Firestore:

1. Go to: https://console.firebase.google.com/project/handyworks-billing
2. Click **Firestore Database** in left menu
3. Click **Create database**
4. Choose **Start in test mode**
5. Select location: **us-east1** (or your preferred region)
6. Click **Enable**

## Step 5: Run the Import

Once Firestore is enabled, run the import script:

**In PowerShell:**
```powershell
node scripts\import_handyworks_data.js scripts\handyworks_data.tsv
```

**In Command Prompt (cmd):**
```cmd
node scripts\import_handyworks_data.js scripts\handyworks_data.tsv
```

## Expected Output

You should see:
```
📖 Reading file: scripts\handyworks_data.tsv
📝 Parsing TSV data...
   Found 60 records
🔥 Connecting to Firebase...
   Project: handyworks-billing

📊 Starting import of 60 records...

✅ Imported 10 records...
✅ Imported 20 records...
...

✅ Import complete!
   Success: 60 records
   Errors: 0 records

✨ Done!
```

## Troubleshooting

**"node is not recognized"**
- Node.js is not installed or not in PATH
- Restart your command prompt after installing Node.js
- Check installation: `node --version`

**"Cannot find module 'firebase'"**
- Run `npm install firebase` in the project directory
- Make sure you're in the correct directory

**"Firestore is not enabled"**
- Enable Firestore Database in Firebase Console (see Step 4)

**"Permission denied"**
- Ensure Firestore is in test mode for initial import
- Check Firebase project configuration

## Alternative: Use PowerShell Script

If you prefer, I can create a PowerShell script that handles everything automatically. Let me know!


