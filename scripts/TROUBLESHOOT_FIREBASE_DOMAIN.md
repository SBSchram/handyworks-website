# Troubleshooting Firebase Domain Authorization

**Error**: `auth/requests-from-referer-https://handyworks.com-are-blocked`  
**Status**: Persists even after adding domain

---

## Step-by-Step Verification

### Step 1: Verify Domain is Added

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/project/handyworks-billing/authentication/settings

2. **Check Authorized Domains Section**:
   - Scroll to "Authorized domains"
   - Verify `handyworks.com` is in the list
   - **Important**: Check for typos (e.g., `handywork.com` vs `handyworks.com`)

3. **If Domain is Missing**:
   - Click "Add domain"
   - Enter: `handyworks.com` (exactly, no https://, no trailing slash)
   - Click "Add"
   - Wait 1-2 minutes for changes to propagate

---

### Step 2: Check Domain Format

**Common Mistakes**:
- ❌ `https://handyworks.com` (includes protocol)
- ❌ `handyworks.com/` (trailing slash)
- ❌ `www.handyworks.com` (if you don't use www)
- ✅ `handyworks.com` (correct format)

**If you use both www and non-www**:
- Add both: `handyworks.com` AND `www.handyworks.com`

---

### Step 3: Verify Firebase Config

Check that your Firebase config is correct:

1. **Open**: `js/config.js`
2. **Verify** `authDomain`:
   ```javascript
   authDomain: "handyworks-billing.firebaseapp.com"
   ```
   - This should be your Firebase project's auth domain
   - NOT your custom domain

3. **The `authDomain` in config is different from authorized domains**:
   - `authDomain` in config = Firebase's auth domain (handyworks-billing.firebaseapp.com)
   - Authorized domains = Where your app is hosted (handyworks.com)

---

### Step 4: Check for Redirect Issues

If `handyworks.com` redirects to `www.handyworks.com` (or vice versa):

1. **Check your DNS/CNAME settings**
2. **Add both domains** to authorized domains:
   - `handyworks.com`
   - `www.handyworks.com`

---

### Step 5: Verify Firebase Project

Make sure you're adding the domain to the **correct Firebase project**:

1. **Project ID should be**: `handyworks-billing`
2. **Check URL**: https://console.firebase.google.com/project/handyworks-billing/authentication/settings
3. **Verify project name** in top-left corner of Firebase Console

---

### Step 6: Check for Subdomain Issues

If your billing system is on a subdomain:

- Example: `billing.handyworks.com`
- Add the subdomain: `billing.handyworks.com`
- Or add parent domain: `handyworks.com` (should cover subdomains)

**Note**: Firebase authorized domains are exact matches, so:
- `handyworks.com` does NOT automatically cover `billing.handyworks.com`
- You need to add each subdomain separately

---

### Step 7: Wait for Propagation

After adding a domain:

1. **Wait 2-5 minutes** for Firebase to update
2. **Try again** in a new browser/incognito window
3. **Check Firebase Console** to confirm domain is still there

---

### Step 8: Check Browser Console

Open browser console (F12) and check:

1. **Network tab**: Look for Firebase requests
2. **Console tab**: Look for additional error messages
3. **Application tab** → **Cookies**: Check if Firebase cookies are being set

---

## Alternative: Use Firebase Hosting Domain

If the custom domain continues to have issues, you can temporarily test with Firebase's hosting domain:

1. **Firebase Hosting domain**: `handyworks-billing.web.app` or `handyworks-billing.firebaseapp.com`
2. **Add to authorized domains** (should already be there)
3. **Test login** on Firebase hosting domain
4. **If it works**, the issue is specifically with `handyworks.com` configuration

---

## Debugging Steps

### Check Current Authorized Domains

1. Go to: https://console.firebase.google.com/project/handyworks-billing/authentication/settings
2. Scroll to "Authorized domains"
3. **Take a screenshot** or list all domains
4. Verify `handyworks.com` is exactly as shown

### Test with Firebase Hosting

1. Deploy to Firebase Hosting (if not already)
2. Test login on: `https://handyworks-billing.web.app/billing/admin-login.html`
3. If this works, the issue is with custom domain configuration

### Check DNS/SSL

1. **Verify SSL certificate** is valid for `handyworks.com`
2. **Check DNS** - make sure domain resolves correctly
3. **Check for redirects** - ensure no redirects are interfering

---

## Common Issues and Solutions

### Issue: Domain Added But Still Blocked

**Possible Causes**:
1. Typo in domain name
2. Wrong Firebase project
3. Propagation delay (wait 5 minutes)
4. Subdomain issue (need to add subdomain separately)

**Solution**:
- Double-check domain spelling
- Verify correct Firebase project
- Wait and try again
- Add all subdomains if needed

### Issue: Works on Firebase Hosting But Not Custom Domain

**Possible Causes**:
1. Custom domain not properly configured
2. DNS/SSL issues
3. Redirect interfering

**Solution**:
- Verify custom domain setup
- Check DNS records
- Disable redirects temporarily

---

## Next Steps

1. ✅ Verify domain is in authorized domains list
2. ✅ Check for typos or format issues
3. ✅ Verify correct Firebase project
4. ✅ Wait for propagation (2-5 minutes)
5. ✅ Test in new browser/incognito
6. ⏳ If still fails, check DNS/SSL configuration
7. ⏳ Consider testing on Firebase Hosting domain first

---

## Still Not Working?

If none of the above works:

1. **Remove and re-add** the domain in Firebase Console
2. **Check Firebase status**: https://status.firebase.google.com/
3. **Contact Firebase Support** with:
   - Project ID: `handyworks-billing`
   - Domain: `handyworks.com`
   - Error message: `auth/requests-from-referer-https://handyworks.com-are-blocked`
   - Screenshot of authorized domains list

