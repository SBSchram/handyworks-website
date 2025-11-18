# HandyWorks Data Import Scripts

## Prerequisites

1. **Firebase Project Setup:**
   - ✅ Project created: `handyworks-billing`
   - ⏳ **Enable Firestore Database** (required before import)
   - ⏳ **Set Firestore to test mode** (for initial import)

2. **Node.js Dependencies:**
   ```bash
   npm install firebase
   ```

## Enable Firestore Database

Before running the import, you must enable Firestore:

1. Go to Firebase Console: https://console.firebase.google.com/project/handyworks-billing
2. Click **Firestore Database** in left menu
3. Click **Create database**
4. Choose **Start in test mode** (we'll add security rules later)
5. Select location: **us-east1** (or your preferred region)
6. Click **Enable**

## Running the Import

Once Firestore is enabled:

```bash
node scripts/import_handyworks_data.js scripts/handyworks_data.tsv
```

The script will:
- Parse the TSV file
- Extract only demographic and billing fields (excludes credit card info)
- Import records into `handyworks_users` collection
- Use `acct_num` as document ID

## Expected Output

```
📖 Reading file: scripts/handyworks_data.tsv
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

## Data Fields Imported

The script imports only these fields:
- `acct_num` (document ID)
- `lname`, `fname`, `clinic`
- `EMAIL`, `tele1`, `HomePhone`, `CellPhone`
- `addr1`, `addr2`, `city`, `state`, `zip`
- `status`
- `maint_billed`, `maint_paid`, `maintbilldt`, `maintpddt`, `owed`

**Excluded:** Credit card numbers, expiration dates, and all legacy hardware fields (PCI-DSS compliance)

## Troubleshooting

**Error: "Firestore is not enabled"**
- Enable Firestore Database in Firebase Console (see above)

**Error: "Permission denied"**
- Ensure Firestore is in test mode for initial import
- Check Firebase project configuration

**Error: "Cannot find module 'firebase'"**
- Run `npm install firebase` in the project directory

## Next Steps After Import

1. Verify data in Firebase Console → Firestore Database
2. Set up Firestore security rules (restrict access)
3. Create user authentication system
4. Build billing web interface


