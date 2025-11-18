# How to Delete the handyworks_users Collection in Firebase

## Method 1: Delete via Firebase Console (Easiest)

1. **Go to Firestore Database:**
   - Navigate to: https://console.firebase.google.com/project/handyworks-billing/firestore

2. **Select the Collection:**
   - Click on `handyworks_users` in the left sidebar

3. **Delete All Documents:**
   - Click the **three dots (⋮)** menu next to the collection name
   - Select **"Delete collection"**
   - Type `handyworks_users` to confirm
   - Click **"Delete"**

   **OR** delete documents individually:
   - Select all documents (checkboxes)
   - Click **"Delete"** button at the top
   - Confirm deletion

4. **Verify Deletion:**
   - The collection should disappear or show 0 documents
   - You're ready to re-import with corrected data

## Method 2: Delete via Command Line (Advanced)

If you prefer using the Firebase CLI:

```powershell
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Delete collection (requires Firestore rules to allow deletion)
# Note: This requires setting up Firebase CLI and may need admin SDK
```

**Recommendation:** Use Method 1 (Firebase Console) - it's simpler and safer.

## After Deletion

Once the collection is deleted, you can:
1. Provide the corrected TSV data
2. We'll fix the import script field mapping
3. Re-run the import with the corrected data

