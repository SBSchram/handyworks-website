# HandyWorks Billing System Architecture & Implementation Plan

**Date:** 2025-11-17  
**Status:** Planning Phase  
**Payment Processor:** Stripe (Recommended)  
**Database:** Firebase Firestore (`handyworks-billing` project)

---

## Current Website Structure Analysis

### **Technology Stack:**
- **Hosting:** GitHub Pages (static site)
- **Frontend:** Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend:** None (static site)
- **Forms:** Formspree (contact form)
- **Structure:** Modular JavaScript (config.js, header-footer.js)

### **Current Pages:**
- `index.html` - Blog/homepage
- `contact.html` - Contact form (uses Formspree)
- `about.html` - About page
- `downloads.html` - Software downloads
- `faq.html` - FAQ page
- `features.html` - Features page
- `legacy.html` - Legacy information

### **Key Files:**
- `js/config.js` - Configuration and settings
- `js/header-footer.js` - Shared header/footer components
- `css/style.css` - Main stylesheet
- `images/logos/` - Logo assets

### **Integration Points:**
- ✅ Can add new pages easily
- ✅ Can add new JavaScript modules
- ✅ Can integrate Firebase SDK
- ✅ Can integrate Stripe SDK
- ⚠️ No backend server (will use Firebase Cloud Functions for server-side logic)

---

## Proposed Architecture

### **System Components:**

```
┌─────────────────────────────────────────────────────────────┐
│                    HandyWorks Website                        │
│                  (GitHub Pages - Static)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │   Billing    │  │   Payment    │     │
│  │   Page       │  │   Dashboard  │  │   Page       │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firebase    │  │  Firestore   │  │   Cloud      │     │
│  │  Auth        │  │  Database    │  │   Functions  │     │
│  │              │  │              │  │              │     │
│  │  - Email/    │  │  - Users     │  │  - Generate  │     │
│  │    Password  │  │  - Billing   │  │    Bills     │     │
│  │  - Password  │  │  - Payments  │  │  - Process   │     │
│  │    Reset     │  │  - History   │  │    Webhooks  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Stripe Payment Processing                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  - Payment Intents API                                      │
│  - Webhooks (payment confirmations)                        │
│  - Hosted Payment Pages (optional)                          │
│  - Recurring Payments (for annual billing)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Structure (Firebase Firestore)

### **Collection: `handyworks_users`** ✅ (Already Created)
- **Document ID:** `acct_num` (e.g., "1696", "110")
- **Fields:**
  - `acct_num` (number) - Account number
  - `fname`, `lname` (string) - Name
  - `clinic` (string) - Clinic name
  - `EMAIL` (string) - Email address (for login)
  - `HomePhone`, `tele1`, `CellPhone` (string) - Phone numbers
  - `addr1`, `addr2`, `city`, `state`, `zip` (string) - Address
  - `status` (string) - Account status (A=Active, etc.)
  - `maint_billed`, `maint_paid`, `owed` (number) - Current billing
  - `maintbilldt`, `maintpddt` (timestamp) - Dates
  - `imported_at` (timestamp) - Import metadata
  - `source` (string) - Data source

### **Collection: `handyworks_billing`** (To Be Created)
- **Document ID:** Auto-generated
- **Fields:**
  - `acct_num` (number) - Reference to user
  - `year` (number) - Billing year (e.g., 2026)
  - `amount` (number) - Amount billed ($555 or $540 for check)
  - `payment_method` (string) - "credit_card", "ach", "check"
  - `payment_status` (string) - "pending", "paid", "overdue"
  - `bill_date` (timestamp) - When bill was generated
  - `due_date` (timestamp) - Payment due date
  - `paid_date` (timestamp) - When payment received
  - `discount_applied` (number) - Discount amount if check payment
  - `stripe_payment_intent_id` (string) - Stripe payment reference
  - `created_at` (timestamp) - Document creation time

### **Collection: `handyworks_transactions`** (To Be Created)
- **Document ID:** Auto-generated
- **Fields:**
  - `acct_num` (number) - Reference to user
  - `transaction_date` (timestamp) - Transaction date
  - `amount` (number) - Transaction amount
  - `type` (string) - "payment", "refund", "adjustment"
  - `payment_method` (string) - "credit_card", "ach", "check"
  - `stripe_payment_intent_id` (string) - Stripe reference
  - `status` (string) - "succeeded", "failed", "pending"
  - `description` (string) - Transaction description
  - `created_at` (timestamp) - Document creation time

---

## New Pages to Create

### **1. `/billing/login.html`** - User Login Page
**Purpose:** Users log in with email/password to access their billing dashboard

**Features:**
- Email/password login form
- "Forgot password" link
- Firebase Authentication integration
- Redirect to dashboard on success
- Error handling

**UI Elements:**
- Email input field
- Password input field
- Login button
- "Forgot Password" link
- Error message display

---

### **2. `/billing/dashboard.html`** - User Billing Dashboard
**Purpose:** Users view their billing status, payment history, and make payments

**Features:**
- Display current billing status
- Show amount owed
- Payment history table
- "Pay Now" button
- Download invoice/statement
- Account information display

**UI Elements:**
- Account summary card (name, account number, status)
- Current balance display
- Payment history table
- "Pay Now" button
- "Download Statement" button
- Navigation menu

---

### **3. `/billing/payment.html`** - Payment Processing Page
**Purpose:** Secure payment processing using Stripe

**Features:**
- Stripe Elements integration (card input)
- Payment method selection (Card vs ACH)
- Amount display ($555 for card, $540 for check)
- Check payment option (mail-in instructions)
- Payment confirmation
- Receipt generation

**UI Elements:**
- Payment amount display
- Payment method selector (Card/ACH/Check)
- Stripe card input element
- "Pay $555" button (for card)
- "Pay $540 by Check" option
- Payment confirmation message
- Receipt download

---

### **4. `/billing/admin.html`** - Admin Dashboard (Optional)
**Purpose:** Admin view of all users, billing status, and payment processing

**Features:**
- List all users
- Filter by payment status
- Generate annual bills (January 1st)
- View payment reports
- Export data

**UI Elements:**
- User list/table
- Filter controls
- "Generate Bills" button
- Payment statistics
- Export buttons

---

## Firebase Cloud Functions (Backend Logic)

### **Function 1: `generateAnnualBills`**
**Trigger:** Scheduled (January 1st) or Manual (admin action)

**Purpose:** Generate annual maintenance bills for all active users

**Logic:**
1. Query all active users (`status = 'A'`)
2. For each user:
   - Create billing document in `handyworks_billing` collection
   - Set amount to $555 (default)
   - Set status to "pending"
   - Set due date (e.g., 30 days from bill date)
   - Update user's `maint_billed` field
3. Send email notifications to users (optional)

**Input:** Year (e.g., 2026)

**Output:** Number of bills generated

---

### **Function 2: `processStripeWebhook`**
**Trigger:** Stripe webhook (payment events)

**Purpose:** Handle Stripe payment confirmations

**Logic:**
1. Verify webhook signature (security)
2. Handle different event types:
   - `payment_intent.succeeded` → Update billing status to "paid"
   - `payment_intent.failed` → Log failure, notify user
   - `payment_intent.payment_failed` → Handle retry logic
3. Update `handyworks_billing` collection
4. Create transaction record in `handyworks_transactions`
5. Update user's `maint_paid` and `owed` fields
6. Send confirmation email (optional)

**Input:** Stripe webhook event

**Output:** Success/failure status

---

### **Function 3: `createPaymentIntent`**
**Trigger:** HTTP call from frontend

**Purpose:** Create Stripe payment intent for user payment

**Logic:**
1. Verify user authentication
2. Get billing record for user
3. Create Stripe PaymentIntent
4. Return client secret to frontend

**Input:** User ID, billing ID, payment method

**Output:** PaymentIntent client secret

---

## Implementation Phases

### **Phase 1: Foundation** (Week 1-2)
- [ ] Set up Firebase Authentication
- [ ] Create login page (`/billing/login.html`)
- [ ] Implement email/password authentication
- [ ] Create user dashboard page (`/billing/dashboard.html`)
- [ ] Display user billing information from Firestore
- [ ] Test authentication flow

**Success Criteria:**
- Users can log in with email/password
- Users can view their billing status
- Data displays correctly from Firestore

---

### **Phase 2: Payment Integration** (Week 2-3)
- [ ] Set up Stripe account and get API keys
- [ ] Integrate Stripe SDK into website
- [ ] Create payment page (`/billing/payment.html`)
- [ ] Implement Stripe Elements (card input)
- [ ] Create Cloud Function for payment intent
- [ ] Test payment flow (test mode)

**Success Criteria:**
- Users can enter payment information
- Payment intents created successfully
- Test payments process correctly

---

### **Phase 3: Webhook Processing** (Week 3-4)
- [ ] Create Cloud Function for Stripe webhooks
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Implement payment confirmation logic
- [ ] Update Firestore on payment success
- [ ] Create transaction records
- [ ] Test webhook processing

**Success Criteria:**
- Webhooks received and verified
- Payments update Firestore correctly
- Transaction records created

---

### **Phase 4: Billing Generation** (Week 4-5)
- [ ] Create Cloud Function for annual bill generation
- [ ] Implement scheduled trigger (January 1st)
- [ ] Create billing documents in Firestore
- [ ] Update user records
- [ ] Test bill generation

**Success Criteria:**
- Bills generated for all active users
- Billing documents created correctly
- User records updated

---

### **Phase 5: Polish & Testing** (Week 5-6)
- [ ] Add check payment option
- [ ] Implement discount logic ($15 for checks)
- [ ] Add email notifications (optional)
- [ ] Create admin dashboard (optional)
- [ ] Comprehensive testing
- [ ] User acceptance testing

**Success Criteria:**
- All features working correctly
- Check payment option available
- Discounts applied correctly
- System ready for production

---

## Technical Implementation Details

### **Frontend Technologies:**
- **Firebase SDK:** Authentication and Firestore
- **Stripe.js:** Payment processing
- **Vanilla JavaScript:** No frameworks (matches current site)
- **CSS:** Extend existing `style.css`

### **Backend Technologies:**
- **Firebase Cloud Functions:** Server-side logic
- **Stripe API:** Payment processing
- **Node.js:** Function runtime

### **Security Considerations:**
- ✅ Firebase Authentication (secure user login)
- ✅ Firestore Security Rules (restrict data access)
- ✅ Stripe webhook signature verification
- ✅ HTTPS only (GitHub Pages + Firebase)
- ✅ No credit card data stored (PCI-DSS compliant)

---

## File Structure

```
handyworks-website/
├── billing/
│   ├── login.html          (New - User login)
│   ├── dashboard.html      (New - User dashboard)
│   ├── payment.html         (New - Payment processing)
│   └── admin.html          (New - Admin dashboard, optional)
├── js/
│   ├── config.js           (Existing - Update with Firebase config)
│   ├── header-footer.js    (Existing)
│   ├── billing-auth.js     (New - Authentication logic)
│   ├── billing-dashboard.js (New - Dashboard logic)
│   └── billing-payment.js  (New - Payment processing)
├── css/
│   └── style.css           (Existing - Add billing styles)
└── functions/              (New - Firebase Cloud Functions)
    ├── index.js            (Cloud Functions)
    ├── package.json        (Dependencies)
    └── .env                (Environment variables)
```

---

## Next Steps

1. **Set up Stripe Account:**
   - Create account at stripe.com
   - Get API keys (test and live)
   - Set up webhook endpoint

2. **Configure Firebase:**
   - Enable Authentication (Email/Password)
   - Set up Firestore Security Rules
   - Create Cloud Functions project

3. **Begin Implementation:**
   - Start with Phase 1 (Foundation)
   - Create login page
   - Test authentication flow

4. **Testing:**
   - Test in Stripe test mode
   - Test with real user data (Firestore)
   - User acceptance testing

---

## Questions to Resolve

1. **Email Notifications:** Do you want automated email notifications for:
   - Bill generation (January 1st)?
   - Payment confirmations?
   - Payment reminders?

2. **Admin Access:** Who needs admin access? How should admin authentication work?

3. **Check Processing:** How should check payments be handled?
   - Manual entry after check received?
   - Automatic status update?
   - Notification system?

4. **Timeline:** When do you want this live? (Target: Before next January 1st billing?)

5. **Domain:** Will billing be on same domain (handyworks.com/billing) or subdomain (billing.handyworks.com)?

---

## Cost Estimates

**Stripe Fees (Annual):**
- If 50% pay by card: ~$820/year
- If 50% pay by check, 50% by ACH: ~$222/year
- **NO monthly fees** - only pay per transaction ✅
- **Savings vs Gravity Payments: $1,100-1,900/year**

**Gravity Payments Costs (Current):**
- Transaction fees: ~$1,930/year (3.48% effective rate)
- Active month fees: ~$60/year (Jan-Mar)
- **Inactive month fees: $144/year (Apr-Dec)** ⚠️ **PAYING FOR NOTHING**
- **Total: ~$2,133/year**

**Firebase Costs (Annual):**
- Authentication: Free (up to 50K MAU)
- Firestore: Free tier (1GB storage, 50K reads/day)
- Cloud Functions: Free tier (2M invocations/month)
- **Estimated: $0-50/year** (well within free tier for ~100 users)

**Total Annual Cost:**
- **Stripe:** $222-820/year (NO monthly fees)
- **Firebase:** $0-50/year
- **Total:** $222-870/year
- **Savings vs Gravity Payments: $1,263-1,911/year**
- **Key Benefit:** No fees during inactive months (Apr-Dec) - Stripe only charges when processing payments

---

## Success Metrics

- ✅ Users can log in and view billing status
- ✅ Users can pay online securely
- ✅ Payments process automatically
- ✅ Bills generate automatically on January 1st
- ✅ Check discount ($15) applies correctly
- ✅ System saves $1,000+ per year vs current process
- ✅ Reduces manual work significantly

