# Testing Firestore Security Rules

**Date:** 2025-01-09  
**Status:** Rules deployed - Testing required

---

## Quick Test Checklist

### ✅ Test 1: Admin Access (Should Work)

1. **Login as Admin**:
   - Go to: `https://handyworks.com/billing/admin-login.html`
   - Login with: `steve@handyworks.com` (or your admin email)
   - Should redirect to admin dashboard

2. **Verify Admin Dashboard Loads**:
   - Should see all users in the table
   - Should be able to search/filter users
   - Should see user statistics

3. **Expected Result**: ✅ **SUCCESS** - Admin can access all data

---

### ✅ Test 2: Regular User Access (Should Work - Own Data Only)

1. **Login as Regular User**:
   - Go to: `https://handyworks.com/billing/admin-login.html`
   - Login with a regular user email (must match EMAIL in Firestore)
   - Should redirect to admin dashboard (currently same page)

2. **Verify User Can See Own Data**:
   - User should only see their own user record
   - User should only see their own billing records
   - User should only see their own transactions

3. **Expected Result**: ✅ **SUCCESS** - User can access own data only

**Note**: The current admin dashboard shows all users. You may need to create a separate user dashboard page that filters by the logged-in user's email.

---

### ✅ Test 3: Unauthenticated Access (Should Fail)

1. **Try to Access Without Login**:
   - Open browser in incognito/private mode
   - Go to: `https://handyworks.com/billing/admin.html`
   - Should redirect to login page

2. **Try Direct Firestore Access** (if you have test code):
   - Attempt to read from Firestore without authentication
   - Should get "Missing or insufficient permissions" error

3. **Expected Result**: ✅ **SUCCESS** - All unauthenticated requests denied

---

### ✅ Test 4: Cross-User Access (Should Fail)

1. **Login as User A**:
   - Login with email: `userA@example.com`

2. **Try to Access User B's Data**:
   - Attempt to read a document where `EMAIL` field doesn't match logged-in user
   - Should get "Missing or insufficient permissions" error

3. **Expected Result**: ✅ **SUCCESS** - Users cannot access other users' data

---

## Testing via Firebase Console

### Rules Playground

1. **Open Rules Playground**:
   - Go to: https://console.firebase.google.com/project/handyworks-billing/firestore/rules
   - Click **"Rules Playground"** tab

2. **Test Scenarios**:

   **Scenario 1: Authenticated Admin Read**
   - Location: `handyworks_users/1573`
   - Authenticated: Yes
   - Provider: `password`
   - UID: `test-admin-uid`
   - Custom Claims: `{admin: true}`
   - Expected: ✅ Allow read

   **Scenario 2: Authenticated User Read Own Data**
   - Location: `handyworks_users/1573`
   - Authenticated: Yes
   - Provider: `password`
   - UID: `test-user-uid`
   - Email: `user@example.com` (must match EMAIL field in document)
   - Expected: ✅ Allow read

   **Scenario 3: Authenticated User Read Other User's Data**
   - Location: `handyworks_users/1573`
   - Authenticated: Yes
   - Provider: `password`
   - UID: `test-user-uid`
   - Email: `different@example.com` (doesn't match EMAIL field)
   - Expected: ❌ Deny read

   **Scenario 4: Unauthenticated Read**
   - Location: `handyworks_users/1573`
   - Authenticated: No
   - Expected: ❌ Deny read

---

## Common Issues and Solutions

### Issue: "Missing or insufficient permissions"

**Possible Causes**:
1. User not authenticated
2. User email doesn't match document EMAIL field
3. User not marked as admin
4. Rules not properly deployed

**Solutions**:
- Check Firebase Auth - user must be logged in
- Verify email matches exactly (case-sensitive)
- For admin access, verify custom claim or email whitelist
- Re-deploy rules if needed

### Issue: Admin can't access data

**Possible Causes**:
1. Email not in admin whitelist
2. Custom claim not set
3. User needs to sign out and back in

**Solutions**:
- Add email to whitelist in `firestore.rules`
- Set custom claim using `set_admin_claim.js`
- User must sign out and sign back in for claims to refresh

### Issue: User can't access own data

**Possible Causes**:
1. Email mismatch between Auth and Firestore
2. EMAIL field missing in Firestore document
3. Document ID doesn't match acct_num

**Solutions**:
- Verify `EMAIL` field in Firestore matches Auth email exactly
- Check that document has `EMAIL` field populated
- For billing/transactions, verify `acct_num` matches user document

---

## Verification Checklist

- [ ] Admin can login and access admin dashboard
- [ ] Admin can see all users
- [ ] Regular user can login
- [ ] Regular user can only see own data (if user dashboard exists)
- [ ] Unauthenticated access is denied
- [ ] Cross-user access is denied
- [ ] Test Mode warning disappeared from Firebase Console
- [ ] No "Missing or insufficient permissions" errors for valid access

---

## Next Steps After Testing

1. ✅ Rules deployed
2. ⏳ Admin access tested
3. ⏳ User access tested
4. ⏳ Create user dashboard (if needed - separate from admin dashboard)
5. ⏳ Set admin custom claims for all admin users
6. ⏳ Document any issues found during testing

---

## Notes

- **User Dashboard**: Currently, both admin and regular users go to the same admin dashboard. You may want to create a separate user dashboard that only shows the logged-in user's data.
- **Custom Claims**: For better security, use custom claims instead of email whitelist for admin access.
- **Email Matching**: The rules match emails exactly (case-sensitive). Make sure Firestore EMAIL field matches Auth email exactly.

