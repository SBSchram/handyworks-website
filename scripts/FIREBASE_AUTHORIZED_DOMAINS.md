# Firebase Authorized Domains Setup

**Date:** 2025-01-09  
**Issue:** `auth/requests-from-referer-https://handyworks.com-are-blocked`  
**Status:** 🔴 **URGENT** - Blocks authentication from website

---

## Problem

Firebase Authentication is blocking requests from `https://handyworks.com` because the domain is not in the authorized domains list. This prevents users from logging in to the billing system.

---

## Solution: Add Domain to Authorized Domains

### Step 1: Open Firebase Console

1. Go to Firebase Console:
   - https://console.firebase.google.com/project/handyworks-billing/authentication/settings

### Step 2: Add Authorized Domain

1. **Scroll to "Authorized domains" section**
   - You should see a list of domains like:
     - `localhost` (for local development)
     - `handyworks-billing.firebaseapp.com` (Firebase hosting)
     - `handyworks-billing.web.app` (Firebase hosting)

2. **Click "Add domain" button**

3. **Enter your domain**:
   - Domain: `handyworks.com`
   - Click "Add"

4. **Verify domain added**:
   - `handyworks.com` should now appear in the authorized domains list

### Step 3: Test Authentication

1. **Clear browser cache** (important - Firebase caches domain settings)
   - Or use incognito/private browsing mode

2. **Try logging in again**:
   - Go to: `https://handyworks.com/billing/admin-login.html`
   - Login should now work without the referer error

---

## Additional Domains to Consider

You may also want to add:

- `www.handyworks.com` (if you use www subdomain)
- `localhost` (should already be there for local development)
- Any other domains where you host the billing system

---

## Verification

After adding the domain:

1. ✅ Domain appears in authorized domains list
2. ✅ Login page loads without errors
3. ✅ Authentication works (can login successfully)
4. ✅ No "requests-from-referer-are-blocked" errors in console

---

## Troubleshooting

### Error Still Appears After Adding Domain

**Possible Causes**:
1. Browser cache - Clear cache or use incognito mode
2. Domain not saved - Verify it appears in the list
3. Wrong domain format - Should be just `handyworks.com` (no `https://` or trailing slash)

**Solutions**:
- Clear browser cache completely
- Try incognito/private browsing
- Verify domain is exactly `handyworks.com` in Firebase Console
- Wait a few minutes for changes to propagate

### Multiple Domains

If you have multiple domains (e.g., `handyworks.com` and `www.handyworks.com`), add both:
- `handyworks.com`
- `www.handyworks.com`

---

## Security Note

Authorized domains prevent unauthorized sites from using your Firebase Authentication. Only domains you explicitly add can use your Firebase Auth, which is a security feature.

---

## Next Steps

1. ✅ Add `handyworks.com` to authorized domains
2. ⏳ Test login functionality
3. ⏳ Verify admin dashboard loads correctly
4. ⏳ Test with regular users
5. ⏳ Document any additional domains needed

---

## Reference

- [Firebase Authorized Domains Documentation](https://firebase.google.com/docs/auth/web/domain-restriction)

