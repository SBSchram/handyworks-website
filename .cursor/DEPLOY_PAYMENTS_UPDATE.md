# Deploy Payment Tracking Update

**Date**: 2025-12-17  
**Update**: Enhanced invoice management with payment tracking

## Overview

This update adds comprehensive payment tracking to the admin dashboard. Users can now:
- View invoice history for all years
- Record manual payments (check, phone, fax, cash)
- Track partial payments
- Delete invoices
- Auto-calculate amounts owed from payment records

## Prerequisites

Before deploying, ensure:
- [ ] Firebase project access (handyworks-billing)
- [ ] Admin access to Firestore console
- [ ] Git access to handyworks-website repository

## Deployment Steps

### Step 1: Deploy Firestore Security Rules

The new `handyworks_payments` collection requires security rules.

**Option A: Via Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/handyworks-billing/firestore/rules)
2. Click on "Firestore Database" in left sidebar
3. Click on "Rules" tab
4. Copy the contents of `firestore.rules` from the repository
5. Paste into the rules editor (replacing existing rules)
6. Click "Publish"
7. Verify: "Rules published successfully"

**Option B: Via Firebase CLI**

```bash
cd C:\Users\Steve\Documents\GitHub\handyworks-website
firebase deploy --only firestore:rules
```

**Verify Rules Deployment:**
1. Go to Firestore Rules tab
2. Verify you see `handyworks_payments` collection rules
3. Rules should show:
   - Admins can read/write
   - Regular users cannot access

### Step 2: Push Code to GitHub

```bash
cd C:\Users\Steve\Documents\GitHub\handyworks-website

# Check status
git status

# Add modified files
git add billing/admin.html
git add js/admin-dashboard.js
git add js/config.js
git add api/stripeWebhook.js
git add firestore.rules
git add .cursor/PAYMENTS_COLLECTION_SCHEMA.md
git add .cursor/DEPLOY_PAYMENTS_UPDATE.md

# Commit changes
git commit -m "Add invoice history and payment tracking

- New handyworks_payments collection for tracking individual payments
- Invoice history column showing all invoices per user
- Smart action buttons (Generate Invoice / Record Payment)
- Payment recording modal for manual payments
- Invoice deletion with payment check
- Auto-calculate totals from payments
- Stripe webhook creates payment records
- Enhanced invoice generation with duplicate checks"

# Push to GitHub
git push origin main
```

### Step 3: Verify Deployment

1. **Wait for GitHub Pages Deployment** (1-2 minutes)
   - Go to: https://github.com/SBSchram/handyworks-website/actions
   - Wait for "pages build and deployment" workflow to complete
   - Look for green checkmark

2. **Clear Browser Cache**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"
   - Or use hard refresh: `Ctrl + F5`

3. **Test Admin Dashboard**
   - Go to: https://handyworks.com/billing/admin-login.html
   - Login with admin credentials
   - Verify new UI:
     - ✅ "Invoice History" column displays
     - ✅ Invoice pills show year, amounts, delete button
     - ✅ Smart action buttons appear
     - ✅ Payment modal opens when clicking "Record Payment"

### Step 4: Test Payment Recording

**Test Scenario 1: Record Manual Payment**

1. Find user with unpaid invoice
2. Click "Record Payment" button
3. Payment modal should open with:
   - Invoice details (read-only)
   - Payment form (amount, method, reference, notes)
4. Enter test payment:
   - Amount: $100.00
   - Method: Check
   - Reference: Check #1234
   - Notes: Test payment
5. Click "Record Payment"
6. Verify:
   - Success message appears
   - Dashboard refreshes
   - Invoice pill updates to show partial payment
   - Payment recorded in `handyworks_payments` collection

**Verify in Firestore:**
1. Go to [Firestore Console](https://console.firebase.google.com/u/0/project/handyworks-billing/firestore/databases/-default-/data)
2. Navigate to `handyworks_payments` collection
3. Verify new payment document exists with:
   - `invoice_id`
   - `acct_num`
   - `amount`
   - `payment_method`
   - `payment_date`
   - `recorded_by`

**Test Scenario 2: Invoice Deletion**

1. Find invoice with NO payments
2. Click red [×] button on invoice pill
3. Confirm deletion
4. Verify:
   - Invoice marked as cancelled
   - Invoice disappears from display
5. Try to delete invoice WITH payments
6. Verify: Blocked with error message

**Test Scenario 3: Generate New Invoice**

1. Try to generate invoice for year that already has paid invoice
2. Verify: Blocked with message
3. Try to generate invoice for year with unpaid invoice (no payments)
4. Verify: Offers to replace
5. Accept replacement
6. Verify:
   - Old invoice cancelled
   - New invoice created
   - New Stripe payment link generated

### Step 5: Test Stripe Webhook Integration

**Important**: This requires a Stripe test payment

1. Generate invoice for test customer
2. Copy Stripe payment link
3. Open payment link in new tab
4. Complete payment with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. Wait 5-10 seconds for webhook to process
6. Refresh admin dashboard
7. Verify:
   - Invoice marked as "PAID ✓"
   - Payment record created in `handyworks_payments`
   - Payment shows Stripe payment intent ID

**Verify Webhook in Firestore:**
1. Go to Firestore Console
2. Check `handyworks_payments` collection
3. Find payment with:
   - `payment_method: "stripe"`
   - `recorded_by: "system_webhook"`
   - `stripe_payment_intent_id` populated

## Troubleshooting

### Issue: "Invoice History" column not showing

**Solution:**
1. Hard refresh browser (Ctrl + F5)
2. Check JavaScript console for errors
3. Verify cache-busting version updated: `?v=20251217v1`

### Issue: Payment modal not opening

**Solution:**
1. Check browser console for errors
2. Verify `handyworks_payments` collection has security rules deployed
3. Verify admin user has authentication token

### Issue: Cannot record payment - Permission denied

**Solution:**
1. Verify Firestore security rules deployed for `handyworks_payments`
2. Check admin user has proper permissions
3. Verify Firebase authentication token valid

### Issue: Stripe webhook not creating payment records

**Solution:**
1. Check Vercel function logs:
   - Go to Vercel Dashboard
   - Select handyworks-website project
   - View function logs for stripeWebhook
2. Check Stripe webhook deliveries:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on webhook endpoint
   - View recent deliveries
   - Check for errors
3. Verify webhook secret configured in Vercel environment variables

### Issue: Invoice totals not calculating correctly

**Solution:**
1. Check Firestore data structure
2. Verify payments have correct `invoice_id` reference
3. Verify amounts are numbers (not strings)
4. Check browser console for calculation errors

## Rollback Plan

If issues occur, rollback by:

1. **Revert Firestore Rules:**
   - Go to Firebase Console → Firestore → Rules
   - Click "View History"
   - Select previous version
   - Click "Restore"

2. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Clear Firestore Data (if needed):**
   - Go to Firestore Console
   - Delete `handyworks_payments` collection
   - Note: This will delete all payment records!

## Post-Deployment Checklist

- [ ] Firestore security rules deployed and verified
- [ ] Code pushed to GitHub and deployed to GitHub Pages
- [ ] Admin dashboard loads without errors
- [ ] Invoice history displays correctly
- [ ] Payment recording works
- [ ] Invoice deletion works
- [ ] Invoice generation checks work
- [ ] Stripe webhook creates payment records
- [ ] Test payment completed successfully

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check Firestore Console for data structure issues
3. Check Vercel logs for webhook errors
4. Check Stripe Dashboard for webhook delivery issues

## Next Steps

After successful deployment:
1. Monitor Firestore usage (payments collection will grow over time)
2. Consider implementing payment history export
3. Consider adding payment search/filter functionality
4. Consider adding payment refund functionality (if needed)

## Documentation

Additional documentation:
- `.cursor/PAYMENTS_COLLECTION_SCHEMA.md` - Payment collection structure
- `.cursor/scratchpad.md` - Full implementation details
- `firestore.rules` - Security rules including payments
