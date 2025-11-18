# Firebase Authentication Setup Guide

**Date:** 2025-11-17  
**Purpose:** Enable Firebase Authentication for HandyWorks Billing System

---

## Step 1: Enable Firebase Authentication

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/handyworks-billing

2. **Enable Authentication:**
   - Click **"Authentication"** in left sidebar
   - Click **"Get started"** (if not already enabled)
   - Click **"Sign-in method"** tab

3. **Enable Email/Password:**
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

---

## Step 2: Create User Accounts

You have two options for creating user accounts:

### **Option A: Manual Creation (For Testing)**

1. In Firebase Console → Authentication → Users
2. Click **"Add user"**
3. Enter email address (must match EMAIL in Firestore)
4. Enter temporary password
5. User will need to change password on first login

### **Option B: Bulk Import Script (Recommended)**

We can create a script to automatically create Firebase Auth accounts from your Firestore user data. This will:
- Read all users from `handyworks_users` collection
- Create Firebase Auth accounts using their EMAIL addresses
- Set temporary passwords
- Send password reset emails so users can set their own passwords

**Would you like me to create this script?**

---

## Step 3: Test Login

1. Go to: `https://[your-domain]/billing/login.html`
2. Enter email address (must match EMAIL in Firestore)
3. Enter password
4. Should redirect to dashboard

---

## Important Notes

- **Email addresses must match:** The email used for Firebase Auth must match the `EMAIL` field in Firestore `handyworks_users` collection
- **Password reset:** Users can use "Forgot password" link to reset their password
- **First-time users:** May need to verify email (if email verification is enabled)

---

## Next Steps

1. Enable Authentication in Firebase Console ✅
2. Create user accounts (manual or script)
3. Test login flow
4. Proceed with payment integration

