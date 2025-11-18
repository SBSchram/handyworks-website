# Stripe Account Setup Guide for HandyWorks Billing

**Date:** 2025-11-17  
**Purpose:** Set up Stripe account for online payment processing

---

## Step 1: Create Stripe Account

1. **Go to Stripe Website:**
   - Visit: https://stripe.com
   - Click **"Start now"** or **"Sign up"** button (top right)

2. **Sign Up:**
   - Enter your **email address**
   - Create a **password**
   - Click **"Create account"**

3. **Verify Email:**
   - Check your email inbox
   - Click the verification link from Stripe
   - This activates your account

---

## Step 2: Complete Business Information

Stripe will ask for business details. Have this information ready:

### **Business Details:**
- **Business name:** HandyWorks (or your business name)
- **Business type:** Select appropriate option (likely "Individual" or "Business")
- **Country:** United States
- **Business address:** Your business address
- **Phone number:** Your business phone number

### **Tax Information:**
- **Tax ID (EIN/SSN):** Your tax identification number
- **Business category:** Select appropriate category (likely "Software" or "Professional Services")

### **Bank Account (for payouts):**
- **Account holder name:** Your name or business name
- **Account type:** Checking or Savings
- **Routing number:** 9-digit bank routing number
- **Account number:** Your bank account number

**Note:** Stripe will make small test deposits (usually $0.01-$0.99) to verify your bank account. This takes 1-2 business days.

---

## Step 3: Get API Keys

Once your account is set up, you'll need API keys for integration:

### **Test Mode Keys (for development):**

1. **Go to Developers Dashboard:**
   - Click **"Developers"** in left sidebar
   - Click **"API keys"**

2. **Find Test Mode Keys:**
   - Make sure **"Test mode"** toggle is ON (top right)
   - You'll see two keys:
     - **Publishable key:** Starts with `pk_test_...`
     - **Secret key:** Starts with `sk_test_...` (click "Reveal" to see it)

3. **Copy Both Keys:**
   - **Publishable key:** Safe to use in frontend code
   - **Secret key:** ⚠️ **KEEP SECRET** - Only use in backend (Cloud Functions)

### **Live Mode Keys (for production):**

1. **Switch to Live Mode:**
   - Toggle **"Test mode"** to OFF (top right)
   - You'll see live keys:
     - **Publishable key:** Starts with `pk_live_...`
     - **Secret key:** Starts with `sk_live_...`

2. **Important:** 
   - Use **test keys** during development
   - Switch to **live keys** only when ready for production
   - Test mode allows you to test without real charges

---

## Step 4: Set Up Webhooks (Later - After Development)

Webhooks allow Stripe to notify your system when payments succeed/fail.

**We'll set this up after we build the Cloud Functions.** For now, just know:
- Webhook endpoint will be: `https://[your-region]-[your-project].cloudfunctions.net/processStripeWebhook`
- We'll configure this in Stripe dashboard later

---

## Step 5: Test Your Account

### **Test Payment (Test Mode):**

1. **Go to Payments:**
   - Click **"Payments"** in left sidebar
   - Click **"Create payment"** (test mode)

2. **Use Test Card Numbers:**
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **3D Secure:** `4000 0025 0000 3155`
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)

3. **Create Test Payment:**
   - Enter test card number
   - Enter amount: $5.55 (to test $555 transaction)
   - Click **"Create payment"**
   - Should show as successful

---

## Step 6: Save Your Keys Securely

**Important:** Keep your API keys secure!

### **For Development:**
- We'll store test keys in Firebase Cloud Functions environment variables
- Never commit keys to Git repository

### **For Production:**
- Use Firebase environment variables for live keys
- Rotate keys if compromised
- Never share secret keys publicly

---

## What You'll Need to Share (For Integration)

Once setup is complete, I'll need:

1. **Test Mode Keys:**
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

2. **Account Status:**
   - Is account verified?
   - Is bank account verified?

3. **Business Information:**
   - Business name (for payment receipts)
   - Business address (for receipts)

---

## Common Issues & Solutions

### **Issue: Bank Account Verification**
- **Problem:** Test deposits not received
- **Solution:** Check bank account details, wait 1-2 business days, contact bank if needed

### **Issue: Account Not Verified**
- **Problem:** Stripe asking for additional documents
- **Solution:** Provide requested documents (business license, tax forms, etc.)

### **Issue: Can't Find API Keys**
- **Problem:** Keys not visible in dashboard
- **Solution:** Make sure you're logged in, check "Developers" → "API keys" section

### **Issue: Test Payments Not Working**
- **Problem:** Payment fails even with test card
- **Solution:** Make sure you're in "Test mode", use correct test card numbers

---

## Next Steps After Setup

1. ✅ **Account Created:** You're here!
2. ⏳ **Share Test Keys:** Send me test mode keys (I'll use them for development)
3. ⏳ **Build Integration:** I'll integrate Stripe into billing system
4. ⏳ **Test Payments:** Test in test mode
5. ⏳ **Switch to Live:** When ready, switch to live mode keys

---

## Security Best Practices

- ✅ **Never share secret keys** publicly
- ✅ **Use test mode** during development
- ✅ **Rotate keys** if compromised
- ✅ **Use environment variables** for keys (not hardcoded)
- ✅ **Enable 2FA** on Stripe account (recommended)

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## Questions?

If you encounter any issues during setup:
1. Check Stripe's help documentation
2. Contact Stripe support
3. Let me know what you're stuck on and I can help!

---

**Once you have your test mode API keys, share them with me and we'll proceed with integration!**

