# Firebase Domain Authorization - Final Fix Steps

**Issue**: Domain `handyworks.com` is in authorized list but still getting blocked  
**Error**: `auth/requests-from-referer-https://handyworks.com-are-blocked`

---

## Immediate Actions

### Step 1: Remove and Re-add Domain

Sometimes Firebase needs the domain to be removed and re-added:

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/project/handyworks-billing/authentication/settings

2. **Remove Domain**:
   - Find `handyworks.com` in authorized domains
   - Click the trash/delete icon next to it
   - Confirm deletion

3. **Wait 1 minute**

4. **Re-add Domain**:
   - Click "Add domain"
   - Enter: `handyworks.com`
   - Click "Add"

5. **Wait 3-5 minutes** for propagation

6. **Test in new incognito window**

---

### Step 2: Check Browser Console

After adding debug code to `admin-login.html`:

1. **Open the login page**: https://handyworks.com/billing/admin-login.html
2. **Open browser console** (F12)
3. **Check the console output** - you should see:
   - Current URL
   - Origin
   - Hostname
   - Protocol

4. **Try to login** and check for:
   - Any auth state errors
   - Error codes
   - Error messages

**Share these console logs** to help identify the exact issue.

---

### Step 3: Check Network Tab

1. **Open browser console** (F12) → **Network tab**
2. **Navigate to login page**
3. **Try to login**
4. **Look for Firebase requests**:
   - Filter by "Firebase" or "googleapis"
   - Look for requests to `identitytoolkit.googleapis.com` or `securetoken.googleapis.com`

5. **Click on the failed request**:
   - **Headers tab** → Check "Referer" header
   - **Response tab** → Check error message
   - **Preview tab** → Check error details

**What does the Referer header show?**
- Should be: `https://handyworks.com/billing/admin-login.html`
- If different, that's the issue

---

### Step 4: Verify Firebase Project

Double-check you're in the correct project:

1. **Firebase Console URL should be**:
   - `https://console.firebase.google.com/project/handyworks-billing/...`

2. **Project ID should be**: `handyworks-billing`

3. **Check project name** in top-left of Firebase Console

---

### Step 5: Check for CNAME/DNS Issues

If using GitHub Pages with custom domain:

1. **Check CNAME file**:
   - Should contain: `handyworks.com` (or `www.handyworks.com` if using www)

2. **Check DNS settings**:
   - Verify A records point to GitHub Pages IPs
   - Verify CNAME for www (if used)

3. **Check GitHub Pages settings**:
   - Custom domain should be set to `handyworks.com`

---

## Alternative: Test on Firebase Hosting

To verify if it's a domain-specific issue:

1. **Deploy to Firebase Hosting** (if not already):
   ```bash
   firebase init hosting
   firebase deploy --only hosting
   ```

2. **Test on Firebase domain**:
   - `https://handyworks-billing.web.app/billing/admin-login.html`
   - Or: `https://handyworks-billing.firebaseapp.com/billing/admin-login.html`

3. **If this works**, the issue is with custom domain configuration
4. **If this also fails**, the issue is with Firebase Auth setup

---

## Possible Root Causes

### 1. Propagation Delay
- **Solution**: Wait 5-10 minutes after adding domain
- **Test**: Try in new incognito window

### 2. Domain Format Issue
- **Check**: No trailing slash, no protocol, exact match
- **Solution**: Remove and re-add with exact format

### 3. Multiple Firebase Projects
- **Check**: Make sure you're adding to correct project
- **Solution**: Verify project ID matches

### 4. CORS/Referer Policy
- **Check**: Browser might be blocking referer
- **Solution**: Check browser console for CORS errors

### 5. Firebase SDK Version
- **Check**: Using compatible Firebase SDK version
- **Current**: `firebasejs/10.7.1` (should be fine)

---

## Next Steps

1. ✅ Remove and re-add domain
2. ✅ Check browser console logs (after adding debug code)
3. ✅ Check Network tab for actual referer
4. ✅ Test on Firebase Hosting domain
5. ⏳ Share console/network logs if issue persists

---

## If Still Not Working

After trying all above steps:

1. **Contact Firebase Support**:
   - Project: `handyworks-billing`
   - Issue: Domain authorized but still blocked
   - Error: `auth/requests-from-referer-https://handyworks.com-are-blocked`
   - Screenshot of authorized domains list

2. **Check Firebase Status**:
   - https://status.firebase.google.com/
   - Look for any ongoing issues

3. **Temporary Workaround**:
   - Use Firebase Hosting domain until custom domain is fixed
   - Or use a subdomain that works

