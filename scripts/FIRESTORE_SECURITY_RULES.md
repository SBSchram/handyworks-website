# Firestore Security Rules Setup Guide

**Date:** 2025-01-09  
**Status:** ✅ **READY TO DEPLOY**  
**Priority:** 🔴 **URGENT** - Test mode expires in 4 days

---

## Overview

Firestore security rules protect your database from unauthorized access. The current database is in Test Mode, which allows unrestricted access for 30 days. After that, all requests will be denied unless proper security rules are deployed.

---

## Security Rules File

The security rules file is located at: `firestore.rules` in the project root.

### Rule Structure

The rules implement the following security model:

1. **Authentication Required**: All access requires Firebase Authentication
2. **User Access**: Users can read their own data (matching email address)
3. **Admin Access**: Admins can read/write all data
4. **Collection Protection**: All collections are protected

### Collections Protected

- `handyworks_users` - User account information
- `handyworks_billing` - Billing records
- `handyworks_transactions` - Payment transactions

---

## Deployment Methods

### Method 1: Firebase Console (Recommended for First Time)

**Best for:** Quick deployment, visual interface

1. **Open Firebase Console**:
   - Go to: https://console.firebase.google.com/project/handyworks-billing/firestore/rules

2. **Copy Rules**:
   - Open `firestore.rules` file from project root
   - Copy all contents

3. **Paste and Deploy**:
   - Paste rules into the Firebase Console editor
   - Click **"Publish"** button
   - Wait for deployment confirmation

4. **Verify**:
   - Check that rules are active (should see "Rules published" message)
   - Test mode warning should disappear after a few minutes

---

### Method 2: Firebase CLI (For Future Updates)

**Best for:** Automated deployments, version control

#### Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in Project** (if not already done):
   ```bash
   cd C:\Users\sbsch\Documents\handyworks-website
   firebase init firestore
   ```
   - Select existing project: `handyworks-billing`
   - Use existing `firestore.rules` file: **Yes**
   - Use existing `firestore.indexes.json`: **No** (or Yes if you have one)

#### Deploy Rules

```bash
firebase deploy --only firestore:rules
```

---

## Admin User Configuration

### Option 1: Custom Claims (Recommended)

Custom claims allow you to mark specific users as admins without hardcoding emails.

1. **Set Custom Claim via Firebase Admin SDK**:
   ```javascript
   // Run this script once to set admin claim
   const admin = require('firebase-admin');
   const serviceAccount = require('./serviceAccountKey.json');
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   
   // Set admin claim for specific user
   admin.auth().setCustomUserClaims('USER_UID_HERE', { admin: true })
     .then(() => {
       console.log('Admin claim set successfully');
     });
   ```

2. **Create Script**: See `scripts/set_admin_claim.js` (to be created)

### Option 2: Email Whitelist (Current Implementation)

The rules currently include an email whitelist. To add more admins:

1. **Edit `firestore.rules`**:
   ```javascript
   function isAdmin() {
     return request.auth != null && (
       request.auth.token.admin == true ||
       request.auth.token.email in [
         'steve@handyworks.com',
         'admin2@handyworks.com'  // Add more emails here
       ]
     );
   }
   ```

2. **Redeploy Rules**: Use Method 1 or 2 above

---

## Testing Security Rules

### Test in Firebase Console

1. Go to: https://console.firebase.google.com/project/handyworks-billing/firestore/rules
2. Click **"Rules Playground"** tab
3. Test different scenarios:
   - Authenticated admin user
   - Authenticated regular user
   - Unauthenticated user

### Test with Application

1. **Test Admin Access**:
   - Login as admin user
   - Verify can read/write all collections
   - Verify admin dashboard loads correctly

2. **Test User Access**:
   - Login as regular user
   - Verify can only read own data
   - Verify cannot access other users' data

3. **Test Unauthenticated Access**:
   - Logout
   - Verify all Firestore requests are denied

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: User doesn't have permission to access the requested data.

**Solutions**:
- Check if user is authenticated
- Verify user's email matches the document's EMAIL field
- Check if user is marked as admin
- Review security rules for the specific collection

### Error: "Rules deployment failed"

**Cause**: Syntax error in rules file.

**Solutions**:
- Check `firestore.rules` for syntax errors
- Use Firebase Console Rules Playground to validate
- Ensure all helper functions are properly defined

### Admin Access Not Working

**Cause**: User not marked as admin.

**Solutions**:
- Verify user email is in admin whitelist (if using email method)
- Set custom claim `admin: true` for user (if using custom claims)
- Check Firebase Auth user token contains admin claim

---

## Security Best Practices

1. **Never expose admin credentials** in client-side code
2. **Use custom claims** for admin roles (more secure than email whitelist)
3. **Regularly review** security rules for any vulnerabilities
4. **Test rules** before deploying to production
5. **Monitor Firebase logs** for unauthorized access attempts

---

## Next Steps After Deployment

1. ✅ Deploy security rules
2. ⏳ Test admin access
3. ⏳ Test user access
4. ⏳ Verify Test Mode warning disappears
5. ⏳ Set up admin custom claims (optional but recommended)
6. ⏳ Document admin user management process

---

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Security Rules Reference](https://firebase.google.com/docs/reference/rules/rules)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)

---

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review security rules syntax
3. Test in Rules Playground
4. Check Firebase documentation

