# Guide: Creating Firebase Auth Users

**Date:** 2025-11-17  
**Purpose:** Create Firebase Authentication accounts for all HandyWorks users

---

## Option 1: Manual Creation (For Testing)

**Best for:** Testing with a few users

1. Go to Firebase Console: https://console.firebase.google.com/project/handyworks-billing
2. Click **"Authentication"** → **"Users"** tab
3. Click **"Add user"**
4. Enter:
   - **Email:** Must match EMAIL field in Firestore
   - **Password:** Temporary password (user will reset)
5. Click **"Add user"**

**Repeat for each test user.**

---

## Option 2: Bulk Import Script (Recommended)

**Best for:** Creating all 66 user accounts at once

### Step 1: Install Firebase Admin SDK

```bash
cd C:\Users\Steve\Documents\GitHub\handyworks-website
npm install firebase-admin
```

### Step 2: Download Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/project/handyworks-billing
2. Click **Project Settings** (gear icon)
3. Click **"Service Accounts"** tab
4. Click **"Generate New Private Key"**
5. Click **"Generate Key"** (downloads JSON file)
6. Save file as: `scripts/serviceAccountKey.json`
7. **IMPORTANT:** Add to `.gitignore` (already done)

### Step 3: Run Import Script

```bash
node scripts/create_firebase_users.js
```

The script will:
- Read all users from Firestore `handyworks_users` collection
- Create Firebase Auth accounts for each user
- Generate temporary passwords
- Show summary of created/skipped users

### Step 4: Send Password Reset Emails

After creating accounts, you can:
- Use Firebase Console to send password reset emails manually
- Or users can use "Forgot Password" link on login page

---

## Option 3: User Self-Registration (Future Enhancement)

**Best for:** Letting users create their own accounts

We can add a "First-time login" flow where:
1. User enters their email
2. System checks if email exists in Firestore
3. If found, sends verification email
4. User sets password and logs in

**Would you like me to implement this?**

---

## Important Notes

- **Email Matching:** Firebase Auth email MUST match `EMAIL` field in Firestore
- **Password Reset:** Users can reset passwords via "Forgot Password" link
- **Security:** Service account key is sensitive - never commit to Git
- **Rate Limits:** Firebase has rate limits - script includes delays

---

## Troubleshooting

**Error: "User already exists"**
- User already has Firebase Auth account
- They can log in with existing password or use "Forgot Password"

**Error: "Invalid email"**
- Email address is missing or invalid in Firestore
- Check `EMAIL` field in Firestore

**Error: "Permission denied"**
- Service account key doesn't have proper permissions
- Make sure you downloaded the key from correct Firebase project

---

## Next Steps After Creating Users

1. ✅ Users created in Firebase Auth
2. ⏳ Test login with one user
3. ⏳ Verify dashboard loads correctly
4. ⏳ Test payment flow (test mode)
5. ⏳ Proceed with Phase 2 (Payment Integration)

