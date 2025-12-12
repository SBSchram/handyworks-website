# Debugging Firebase Referer Error

**Issue**: Domain is in authorized list but still getting blocked  
**Domain Status**: ✅ `handyworks.com` is in authorized domains

---

## Debug Steps

### Step 1: Check Actual Referer

The error says requests from `https://handyworks.com` are blocked. Let's verify what referer is actually being sent:

1. **Open browser console** (F12)
2. **Go to Network tab**
3. **Try to login**
4. **Look for Firebase requests** (usually to `identitytoolkit.googleapis.com` or `securetoken.googleapis.com`)
5. **Click on the request** → **Headers tab**
6. **Check "Referer" header** - what does it say?

**Possible issues**:
- Referer might be `www.handyworks.com` (need to add www version)
- Referer might be a subdomain like `billing.handyworks.com`
- Referer might be missing or different format

---

### Step 2: Check for Redirects

1. **Open browser console** (F12) → **Network tab**
2. **Navigate to**: `https://handyworks.com/billing/admin-login.html`
3. **Check if there are redirects**:
   - Look for 301/302 status codes
   - Check if it redirects to `www.handyworks.com`
   - Check if it redirects to `https://` from `http://`

**If there's a redirect**:
- Add the redirect target domain to authorized domains
- Or fix the redirect to stay on `handyworks.com`

---

### Step 3: Check Actual URL

When you access the login page, check the browser address bar:

1. **What URL shows?**
   - `https://handyworks.com/billing/admin-login.html` ✓
   - `https://www.handyworks.com/billing/admin-login.html` (need to add www)
   - `http://handyworks.com/...` (should redirect to https)

2. **If it shows www**, add `www.handyworks.com` to authorized domains

---

### Step 4: Test with Browser Console

Add this to the login page temporarily to see what referer Firebase sees:

```javascript
// Add this to admin-login.html temporarily
console.log('Current URL:', window.location.href);
console.log('Origin:', window.location.origin);
console.log('Hostname:', window.location.hostname);

// Check what Firebase sees
firebase.auth().onAuthStateChanged((user) => {
    console.log('Auth state changed');
}, (error) => {
    console.error('Auth error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
});
```

---

### Step 5: Check DNS/SSL

1. **Verify SSL certificate**:
   - Check that `https://handyworks.com` has a valid SSL certificate
   - Check that it's not expired
   - Check that it covers the correct domain

2. **Check for CDN/Proxy**:
   - If using Cloudflare, GitHub Pages, or other CDN
   - The referer might be coming from the CDN domain
   - May need to add CDN domain or configure CDN properly

---

## Common Solutions

### Solution 1: Add www Version

If your site redirects to or uses `www.handyworks.com`:

1. Go to Firebase Console → Authentication → Settings
2. Add domain: `www.handyworks.com`
3. Wait 2-5 minutes
4. Test again

### Solution 2: Check GitHub Pages Configuration

If your site is hosted on GitHub Pages:

1. Check `CNAME` file - what domain does it point to?
2. Check GitHub Pages settings - what custom domain is configured?
3. Verify DNS settings match

### Solution 3: Disable Redirects Temporarily

If you have redirects configured:

1. Temporarily disable www redirect
2. Test login
3. If it works, the issue is the redirect
4. Add both domains: `handyworks.com` and `www.handyworks.com`

---

## Quick Test

Try accessing the login page and check:

1. **Browser address bar** - what URL shows?
2. **Browser console** (F12) → **Console tab** - any errors?
3. **Network tab** → **Look for Firebase requests** → **Check Referer header**

Share these details and we can pinpoint the exact issue.

---

## Alternative: Test on Firebase Hosting

To verify if it's a domain-specific issue:

1. Deploy to Firebase Hosting (if not already)
2. Test login on: `https://handyworks-billing.web.app/billing/admin-login.html`
3. If this works, the issue is specifically with `handyworks.com` configuration
4. If this also fails, the issue is with Firebase Auth setup, not domain

---

## Next Steps

1. ✅ Domain is in authorized list
2. ⏳ Check actual referer being sent (Network tab)
3. ⏳ Check for redirects (www vs non-www)
4. ⏳ Check browser address bar URL
5. ⏳ Test on Firebase Hosting domain

