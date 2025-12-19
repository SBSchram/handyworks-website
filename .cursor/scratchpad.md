# HandyWorks Website Development Scratchpad

## 📌 IMPORTANT: Documentation Location Policy

**Date**: 2025-12-12  
**Policy**: ALL `.md` documentation files MUST be saved to `.cursor/` directory

**Reason:**
- Files in `scripts/` directory are committed to GitHub repo and deployed to public website
- Documentation contains sensitive information (architecture, database schemas, setup guides)
- `.cursor/` directory is in `.gitignore` and remains private

**✅ Completed Actions:**
1. Added `.cursor/` to `.gitignore`
2. Added `scripts/*.md` to `.gitignore` (prevents future mistakes)
3. Moved all 23 existing `.md` files from `scripts/` to `.cursor/`

**📁 All Documentation Now in `.cursor/`:**
- `PHASE1_SETUP_TESTING.md` - Setup and testing guide
- `STRIPE_PAYMENT_LINKS_SETUP.md` - Stripe setup instructions
- `FIRESTORE_INVOICES_SCHEMA.md` - Database schema
- `DEPLOY_FIRESTORE_RULES.md` - Deployment guide
- `BILLING_SYSTEM_ARCHITECTURE.md` - System architecture
- `FIREBASE_API_KEY_FIX.md` - Firebase troubleshooting
- Plus 17 other guides...

**🔒 What Stays in `scripts/`:**
- `set_admin_claim.js` - Actual executable script (not documentation)
- Any future `.js` or `.py` scripts that are meant to be version controlled

---

## ✅ PLANNER (2025-12-18): Gmail Invoice Formatting via HTML Clipboard + Paste

### Background and Motivation
The current "Send via Gmail" approach uses a Gmail compose URL with a **plain-text** body. Gmail URLs do not reliably support rich formatting, so invoices look messy.

Goal: generate a **formatted HTML invoice**, copy it to clipboard as rich text, open Gmail compose (To/Subject filled), then you paste the invoice into Gmail with correct formatting.

### Key Constraints
- **We cannot auto-paste into Gmail** (browser security). You must paste manually.
- **Clipboard HTML isn't supported everywhere**. We need a fallback to plain text copy.

### High-level Task Breakdown (Plan)
#### Task A: Build HTML invoice generator
Add a function alongside `generateEmailTemplate` that produces:
- `subject` (string)
- `html` (string) – formatted invoice HTML
- `text` (string) – plain text fallback

**Success criteria:**
- Uses the same invoice data you already generate (customer, year, amount, payment link, address/support/fax text).
- Escapes user-provided fields to avoid accidental HTML injection.

#### Task B: Copy "rich text" to clipboard (with fallback)
Add `copyInvoiceToClipboard({ html, text })` using:
- `navigator.clipboard.write([new ClipboardItem({ 'text/html': ..., 'text/plain': ... })])`
- fallback to `navigator.clipboard.writeText(text)` when rich copy fails.

**Success criteria:**
- On Chrome/Edge desktop: paste into Gmail renders formatted invoice.
- If rich copy fails: plain text still copies successfully.

#### Task C: Open Gmail compose cleanly for paste
For the formatted flow, open Gmail compose with **To + Subject only** (empty body) so you paste into a blank message body.

**Success criteria:**
- After clicking the new button: clipboard is ready, Gmail opens, paste works.
- Existing "Send via Gmail" and "Copy Email Template" remain unchanged as fallback.

#### Task D: Small UX guidance
After copy succeeds, show: "Copied. Gmail opened—click in the body and paste (Ctrl+V)."

### Review Notes (current code reality)
- Current code already has `buildGmailComposeUrl()` + `sendViaGmailButton` in `js/admin-dashboard.js`.
- Current email template is plain text (`generateEmailTemplate`), which is why formatting is limited.

---

## 🎯 PLANNER (2025-12-18): HTML Template-Based Invoice with Editor

### Background and Motivation
**Current State**: After generating an invoice, the HTML template is created via `generateEmailHTMLTemplate()` programmatically. This requires code changes to modify the invoice structure/styling.

**User Request**: "Here's my workflow. The basic invoice exists in a persistent html format with the replacable elements like [Lastname}, etc. I can save this locally. we don't need to involve FB at all. Using that template, we now revert to your workflow using the basic template."

**Goal**: 
1. Use a local HTML template file with placeholders (e.g., `[Lastname]`, `[Year]`, `[Amount]`, `[PaymentLink]`)
2. Load template, replace placeholders with actual invoice data
3. Open in HTML editor (Quill) for final customization
4. Copy to clipboard and open Gmail

**Benefits**:
- ✅ User can edit template HTML directly (no code changes needed)
- ✅ Template is version-controlled (in git)
- ✅ No Firebase storage needed
- ✅ More flexible - full control over HTML structure/styling

### Key Constraints
- **Must work with existing workflow**: Editor should integrate with current "Copy Formatted Invoice (HTML)" flow
- **Browser compatibility**: Must work in Chrome/Edge (primary browsers)
- **Lightweight**: Don't want to slow down the admin dashboard
- **No backend required**: All editing happens client-side
- **Preserve HTML structure**: Editor should maintain the invoice's HTML structure and styling

### HTML Editor Options Analysis

#### Option 1: **Quill** (Recommended)
- **License**: BSD (completely free, no restrictions)
- **Size**: ~45KB minified
- **Pros**:
  - Modern, clean API
  - Excellent WYSIWYG experience
  - Good documentation
  - Active development
  - Easy CDN integration
  - Supports HTML source editing
- **Cons**:
  - Slightly larger than minimal editors
  - May need custom toolbar configuration
- **CDN**: `https://cdn.quilljs.com/1.3.7/quill.min.js` + CSS

#### Option 2: **Trix** (Alternative)
- **License**: MIT (free, no restrictions)
- **Size**: ~30KB minified
- **Pros**:
  - From Basecamp (well-maintained)
  - Simple, focused editor
  - Good for email HTML
  - Lightweight
- **Cons**:
  - Less feature-rich than Quill
  - May need more customization for complex HTML
- **CDN**: `https://unpkg.com/trix@2.0.0/dist/trix.js` + CSS

#### Option 3: **TinyMCE Community**
- **License**: GPL (free for community use)
- **Size**: ~200KB+ (larger)
- **Pros**:
  - Very feature-rich
  - Excellent HTML editing
  - Professional appearance
- **Cons**:
  - Larger file size (may slow page load)
  - More complex setup
  - May be overkill for this use case
- **CDN**: `https://cdn.tiny.cloud/1/[api-key]/tinymce/6/tinymce.min.js`

#### Option 4: **Summernote**
- **License**: MIT (free)
- **Size**: ~100KB+ (with Bootstrap dependency)
- **Pros**:
  - Bootstrap-based (if already using Bootstrap)
  - Good feature set
- **Cons**:
  - Requires Bootstrap (adds dependency)
  - Larger than needed
- **CDN**: Requires Bootstrap + Summernote

#### Option 5: **Pell**
- **License**: MIT (free)
- **Size**: ~5KB (extremely minimal)
- **Pros**:
  - Tiny file size
  - No dependencies
- **Cons**:
  - Very basic features
  - May not handle complex HTML well
  - Less polished UI

### Recommendation: **Quill**

**Rationale**:
1. **Best balance**: Good features without being bloated
2. **Email-friendly**: Handles HTML well, which is important for Gmail pasting
3. **Source editing**: Can toggle between WYSIWYG and HTML source view
4. **Professional**: Clean, modern interface
5. **Well-documented**: Easy to integrate and customize
6. **No dependencies**: Works standalone via CDN

### Integration Approach

#### Workflow Design

**Current Flow:**
```
Generate Invoice → Copy HTML → Gmail Opens → Paste
```

**New Flow with Editor:**
```
Generate Invoice → [Edit Invoice] → Copy HTML → Gmail Opens → Paste
```

#### UI/UX Design

**Option A: Modal Editor (Recommended)**
- Add "Edit Invoice" button next to "Copy Formatted Invoice (HTML)"
- Clicking opens a modal with:
  - Quill editor (WYSIWYG view)
  - Toggle button for HTML source view
  - "Preview" button (shows how it will look in email)
  - "Copy & Open Gmail" button (replaces current copy button when editing)
  - "Cancel" button (discards changes, returns to original)
- Editor is pre-populated with generated HTML
- Edited HTML is stored in memory (session-only, not persisted)
- After editing, clicking "Copy & Open Gmail" uses edited version

**Option B: Inline Editor**
- Replace the invoice success panel with an inline editor
- More compact but less flexible
- May clutter the UI

**Recommendation**: **Option A (Modal Editor)** - Keeps UI clean and provides focused editing experience.

### Technical Implementation Plan

#### Task 1: Add Quill Editor Library
- **Action**: Add Quill CDN links to `billing/admin.html`
  - CSS: `<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">`
  - JS: `<script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>`
- **Success criteria**: Quill library loads without errors

#### Task 2: Create Invoice Editor Modal
- **Action**: Add new modal HTML to `billing/admin.html`
  - Modal container with ID `invoiceEditorModal`
  - Quill editor container (`<div id="invoiceEditor"></div>`)
  - Toolbar buttons: "HTML Source", "Preview", "Copy & Open Gmail", "Cancel"
  - Styling to match existing modals
- **Success criteria**: Modal appears/disappears correctly, matches existing modal styling

#### Task 3: Initialize Quill Editor
- **Action**: Add JavaScript in `js/admin-dashboard.js` to:
  - Initialize Quill editor when modal opens
  - Configure toolbar (basic formatting: bold, italic, lists, links, etc.)
  - Set editor content to generated HTML
  - Handle HTML source toggle (switch between WYSIWYG and raw HTML)
- **Success criteria**: Editor loads with invoice HTML, can edit content, toggle works

#### Task 4: Integrate with Copy Workflow
- **Action**: Modify `copyHTMLInvoiceButton` event listener to:
  - Check if editor has been used (store edited HTML in variable)
  - If edited, use edited HTML; otherwise use generated HTML
  - Update "Copy Formatted Invoice (HTML)" button to open editor instead of direct copy
  - Add new "Copy & Open Gmail" button inside editor modal
- **Success criteria**: 
  - Clicking "Copy Formatted Invoice (HTML)" opens editor
  - Editing works and changes are preserved
  - "Copy & Open Gmail" uses edited HTML
  - Original "Copy Email Template" still works as fallback

#### Task 5: HTML Source View Toggle
- **Action**: Add toggle button to switch between:
  - WYSIWYG view (Quill editor)
  - HTML source view (textarea with raw HTML)
- **Success criteria**: Can switch between views, edits in source view update WYSIWYG, and vice versa

#### Task 6: Preview Functionality (Optional Enhancement)
- **Action**: Add "Preview" button that shows:
  - How the email will look when pasted into Gmail
  - Rendered HTML in an iframe or styled div
- **Success criteria**: Preview accurately shows final email appearance

#### Task 7: Session Storage (Optional)
- **Action**: Store edited HTML in `sessionStorage` so:
  - If user accidentally closes modal, edited version is preserved
  - Edited version persists until invoice is regenerated or page is closed
- **Success criteria**: Edited HTML persists across modal open/close within same session

### Revised Data Flow (Template-Based)

```
1. User generates invoice
   → Invoice data prepared (customer name, year, amount, payment link, etc.)
   → Load HTML template from `templates/invoice-template.html` (via fetch)
   → Replace placeholders: [Lastname], [Year], [Amount], [PaymentLink], [Greeting], etc.
   → Store populated HTML in `currentInvoiceData.htmlContent`

2. User clicks "Edit Invoice (HTML)"
   → Modal opens
   → Quill editor initialized with populated HTML
   → User edits content (WYSIWYG or HTML source)

3. User clicks "Copy & Open Gmail"
   → Get HTML from Quill editor
   → Store in `currentInvoiceData.editedHtmlContent`
   → Copy to clipboard (same as current flow)
   → Open Gmail
   → Close modal

4. If user clicks "Edit Invoice (HTML)" again
   → Check if `currentInvoiceData.editedHtmlContent` exists
   → If yes, use edited version; if no, reload from template and replace placeholders
```

### Template File Structure

**Location**: `templates/invoice-template.html` (or `billing/templates/invoice-template.html`)

**Placeholder Format**: Use square brackets, e.g.:
- `[Lastname]` - Customer's last name
- `[Firstname]` - Customer's first name
- `[Fullname]` - Customer's full name
- `[Greeting]` - Formatted greeting (e.g., "Hi Dr. Smith,")
- `[Year]` - Invoice year (e.g., "2026")
- `[CardAmount]` - Card payment amount (e.g., "$555")
- `[CheckAmount]` - Check payment amount (e.g., "$540")
- `[CheckDiscount]` - Discount amount (e.g., "$15")
- `[PaymentLink]` - Stripe payment link URL
- `[PaymentLinkText]` - Payment link display text (e.g., "Pay Online via Stripe")
- `[Address]` - Mailing address for checks
- `[SupportPhone]` - Support phone number
- `[FaxNumber]` - Fax number
- `[Signature]` - Signature line (e.g., "Dr. Steve")

**Example Template Structure**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Inline styles (Gmail-compatible) */
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .greeting { font-weight: normal; margin-bottom: 20px; }
        .amount-section { background-color: #f8f9fa; border-left: 4px solid #008080; padding: 15px; }
        /* ... more styles ... */
    </style>
</head>
<body>
    <div class="greeting">[Greeting]</div>
    
    <div class="intro">
        <p>We are doing our billing differently this year!</p>
        <!-- ... more content ... -->
    </div>
    
    <div class="amount-section">
        <p><strong>Your annual HandyWorks maintenance fee for [Year] is coming due.</strong></p>
    </div>
    
    <div class="options">
        <p><strong>Options:</strong></p>
        <p><strong>Pay [CardAmount] via Stripe:</strong></p>
        <a href="[PaymentLink]" class="payment-link">[PaymentLinkText]</a>
        <!-- ... more content ... -->
    </div>
    
    <div class="signature">[Signature]</div>
</body>
</html>
```

### Key Challenges and Analysis

#### Challenge 1: HTML Structure Preservation
- **Issue**: WYSIWYG editors sometimes modify HTML structure (add/remove tags, change formatting)
- **Solution**: 
  - Use Quill's `getHTML()` method to get clean HTML
  - Test that pasted HTML in Gmail renders correctly
  - May need to sanitize/clean HTML before copying

#### Challenge 2: Email Client Compatibility
- **Issue**: HTML that looks good in editor may not render correctly in Gmail
- **Solution**:
  - Keep existing inline styles (Gmail strips `<style>` tags)
  - Test with actual Gmail paste
  - Provide preview functionality

#### Challenge 3: Editor Size/Performance
- **Issue**: Adding editor library may slow page load
- **Solution**:
  - Load Quill only when editor modal is opened (lazy load)
  - Use CDN for fast delivery
  - Quill is relatively lightweight (~45KB)

#### Challenge 4: User Workflow Confusion
- **Issue**: Two buttons ("Copy Formatted Invoice" vs "Edit Invoice") may be confusing
- **Solution**:
  - Rename "Copy Formatted Invoice (HTML)" to "Edit Invoice (HTML)"
  - Keep "Copy Email Template" as plain text fallback
  - Make workflow clear: Edit → Copy → Paste

### Success Criteria

1. ✅ User can click "Edit Invoice" button after generating invoice
2. ✅ Modal opens with WYSIWYG editor showing invoice HTML
3. ✅ User can edit text, formatting, links in the editor
4. ✅ User can toggle to HTML source view and edit raw HTML
5. ✅ User can preview how email will look
6. ✅ User can copy edited HTML to clipboard
7. ✅ Gmail opens with To/Subject filled
8. ✅ Pasted HTML in Gmail renders correctly with formatting
9. ✅ Edited HTML persists in session (until invoice regenerated)
10. ✅ Original "Copy Email Template" (plain text) still works as fallback

### Risks / Regressions to Watch

- **HTML structure changes**: Editor may modify HTML in ways that break Gmail rendering
- **Performance**: Adding editor library may slow page load (mitigate with lazy loading)
- **User confusion**: New workflow may be unclear (mitigate with clear button labels and instructions)
- **Browser compatibility**: Quill should work in Chrome/Edge, but test in other browsers if needed

### High-level Task Breakdown (Revised - Template-Based)

#### Phase 1: Template File Setup (15 minutes)
- [ ] Create `templates/` directory (or `billing/templates/`)
- [ ] Create `invoice-template.html` with placeholders
- [ ] Document all available placeholders
- [ ] Test template loads correctly (can be done manually first)

#### Phase 2: Template Loading & Replacement (1 hour)
- [ ] Create `loadInvoiceTemplate()` function in `js/admin-dashboard.js`
- [ ] Fetch template HTML via `fetch('templates/invoice-template.html')`
- [ ] Create `replaceTemplatePlaceholders(template, invoiceData)` function
- [ ] Map invoice data to placeholders:
  - `[Lastname]` → Extract from customer name
  - `[Firstname]` → Extract from customer name
  - `[Fullname]` → Full customer name
  - `[Greeting]` → Generate greeting (use existing logic)
  - `[Year]` → Invoice year
  - `[CardAmount]` → Settings card amount
  - `[CheckAmount]` → Settings check amount
  - `[CheckDiscount]` → Calculated discount
  - `[PaymentLink]` → Stripe payment link URL
  - `[PaymentLinkText]` → "Pay Online via Stripe"
  - `[Address]` → Mailing address (multi-line)
  - `[SupportPhone]` → Support phone
  - `[FaxNumber]` → Fax number
  - `[Signature]` → "Dr. Steve"
- [ ] Test placeholder replacement works correctly
- [ ] Handle missing placeholders gracefully

#### Phase 3: Editor Setup (30 minutes)
- [ ] Add Quill CDN links to `billing/admin.html` (lazy load)
- [ ] Create invoice editor modal HTML structure
- [ ] Add basic modal styling (match existing modals)
- [ ] Test modal open/close functionality

#### Phase 4: Editor Integration (1-2 hours)
- [ ] Initialize Quill editor in modal (lazy load when modal opens)
- [ ] Configure toolbar (basic formatting: bold, italic, lists, links, etc.)
- [ ] Load populated HTML (from template replacement) into editor
- [ ] Test editing functionality
- [ ] Add HTML source toggle button
- [ ] Implement switch between WYSIWYG and source view
- [ ] Sync content between views

#### Phase 5: Workflow Integration (1 hour)
- [ ] Update "Copy Formatted Invoice (HTML)" button to:
  - Load template (if not already loaded)
  - Replace placeholders
  - Open editor modal with populated HTML
- [ ] Add "Copy & Open Gmail" button in editor modal
- [ ] Implement copy logic using edited HTML from Quill
- [ ] Test full workflow: Generate → Load Template → Replace → Edit → Copy → Gmail

#### Phase 6: Error Handling & Polish (30 minutes)
- [ ] Handle template file not found (fallback to programmatic generation)
- [ ] Handle fetch errors gracefully
- [ ] Add helpful instructions/UX guidance
- [ ] Test edge cases (missing placeholders, invalid HTML, etc.)
- [ ] Test Gmail paste rendering

#### Phase 7: Session Persistence (Optional, 15 minutes)
- [ ] Store edited HTML in sessionStorage
- [ ] Restore edited HTML when reopening editor
- [ ] Clear on invoice regeneration

**Total Estimated Time**: 4-5 hours

### Template Placeholder Reference

**Required Placeholders** (must be in template):
- `[Greeting]` - Formatted greeting
- `[Year]` - Invoice year
- `[CardAmount]` - Card payment amount
- `[CheckAmount]` - Check payment amount
- `[PaymentLink]` - Stripe payment link URL
- `[PaymentLinkText]` - Payment link button text

**Optional Placeholders** (can be used if needed):
- `[Lastname]` - Customer last name
- `[Firstname]` - Customer first name
- `[Fullname]` - Customer full name
- `[CheckDiscount]` - Discount amount
- `[Address]` - Mailing address (formatted)
- `[SupportPhone]` - Support phone number
- `[FaxNumber]` - Fax number
- `[Signature]` - Signature line

### Questions for Discussion

1. **Template Location**: Where should the template file be stored?
   - Option A: `templates/invoice-template.html` (root level)
   - Option B: `billing/templates/invoice-template.html` (with billing files)
   - **Recommendation**: Option B (keeps billing-related files together)

2. **Template Format**: What placeholders do you want to use?
   - I've suggested: `[Lastname]`, `[Year]`, `[Amount]`, `[PaymentLink]`, etc.
   - Do you have a preferred format? (e.g., `{{Lastname}}`, `{Lastname}`, `[Lastname]`)

3. **Editor Choice**: Do you agree with Quill, or prefer Trix/TinyMCE?
   - **Recommendation**: Quill (best balance of features and size)

4. **Workflow**: Should "Copy Formatted Invoice" open editor, or should there be a separate "Edit Invoice" button?
   - **Recommendation**: "Copy Formatted Invoice (HTML)" opens editor, then "Copy & Open Gmail" button inside editor

5. **Template Updates**: How do you want to handle template updates?
   - Template file is in git, so you can edit it directly
   - Changes take effect after page refresh (or we can add cache-busting)

6. **Fallback**: If template file fails to load, should we:
   - Fall back to programmatic generation (`generateEmailHTMLTemplate()`)?
   - Show error message?
   - **Recommendation**: Fall back to programmatic generation

### Next Steps

**Waiting for user confirmation** on:
- Template file location preference
- Placeholder format preference
- Editor choice (Quill recommended)
- Any specific requirements or preferences

**Once confirmed, proceed to implementation as Executor.**

### Recent Changes Review (Planner Summary)
- **Stripe Checkout Sessions**: Client (`js/admin-dashboard.js`) calls Vercel function `api/createCheckoutSession.js` which uses `price_data.unit_amount` so **custom amounts should work** and `receipt_email` is set for Stripe receipts.
- **Webhooks → Firestore sync**: `api/stripeWebhook.js` creates a payment record in `handyworks_payments` on `checkout.session.completed`, then recalculates totals and marks invoice paid when fully covered.
- **Dashboard UX**: `billing/admin.html` + `js/admin-dashboard.js` support invoice rows + payment rows, manual payment recording modal, and “Mark as Paid” on the invoice modal result panel.

### Risks / Regressions to Watch
- **“Mark as Paid” vs payments ledger mismatch**: invoice modal “Mark as Paid” updates `handyworks_invoices` but does **not** create a `handyworks_payments` record; totals in the table are derived from payments, so this can look inconsistent. (We should converge on one source of truth.)
- **Git tooling in this shell**: current PowerShell environment reports `git` not found; repo review needs to be done via file inspection unless PATH is fixed.

## ✅ PHASE 1 COMPLETE: Stripe Invoice Generation with Payment Links

**Date**: 2025-12-12  
**Status**: ✅ Implementation Complete - Ready for Setup & Testing

### What Was Built

**Core Functionality:**
1. ✅ Firestore schema for `handyworks_invoices` collection
2. ✅ Updated security rules for admin-only invoice access
3. ✅ Invoice generation modal in admin dashboard
4. ✅ Stripe Payment Links API integration
5. ✅ Automatic email template generation
6. ✅ Copy-paste functionality for payment links and emails

**User Workflow:**
1. Admin logs into billing dashboard
2. Clicks "Generate Invoice" for a customer
3. Modal opens with pre-filled customer data
4. Admin reviews/adjusts amount, year, due date
5. Clicks "Generate Invoice & Payment Link"
6. System creates Stripe Payment Link and saves invoice to Firestore
7. Admin copies payment link and email template
8. Admin sends invoice to customer via email
9. Customer can pay via Stripe (card), check, or phone

**Files Created/Modified:**
- ✅ `scripts/FIRESTORE_INVOICES_SCHEMA.md` - Database schema
- ✅ `scripts/STRIPE_PAYMENT_LINKS_SETUP.md` - Stripe setup guide
- ✅ `scripts/DEPLOY_FIRESTORE_RULES.md` - Deployment instructions
- ✅ `scripts/PHASE1_SETUP_TESTING.md` - Complete testing guide
- ✅ `firestore.rules` - Added invoices collection rules
- ✅ `js/config.js` - Added Stripe configuration placeholders
- ✅ `billing/admin.html` - Added invoice modal UI (500+ lines)
- ✅ `js/admin-dashboard.js` - Added invoice generation logic (400+ lines)

### Next Steps for User

**Before Testing:**
1. Deploy Firestore security rules (see `scripts/DEPLOY_FIRESTORE_RULES.md`)
2. Create Stripe product ($555) in Stripe Dashboard (Test Mode)
3. Get Stripe API keys (secret key, product ID, price ID)
4. Update `js/config.js` with actual Stripe keys
5. Push changes to GitHub
6. Wait for GitHub Pages deployment (1-2 minutes)

**Testing:**
1. Login to admin dashboard
2. Click "Generate Invoice" for any customer
3. Generate test invoice
4. Copy payment link
5. Test payment with Stripe test card: `4242 4242 4242 4242`
6. Verify invoice in Firestore
7. Verify payment in Stripe Dashboard

**Full guide:** `scripts/PHASE1_SETUP_TESTING.md`

---

## ✅ COMPLETED: Admin Dashboard - Invoice History & Payment Recording

**Date Completed**: 2025-12-17  
**Status**: ✅ **IMPLEMENTATION COMPLETE** - Ready for Deployment  
**Mode**: Executor → User Testing Required

### Requirements Summary

**Current Issues:**
1. "Amount Owed" column shows static `user.owed` field, doesn't update from invoices
2. "Generate Bill" button always opens invoice generation modal, even when invoice exists
3. No way to record manual payments (check, phone CC, etc.) outside of Stripe
4. No invoice history view - can't see past invoices or partial payments
5. No way to delete invoices

**New Features Required:**
1. **Invoice History Column**: Show all invoices per user (compact pills: "2026: $555 | $200 paid | $355 owed [×]")
2. **Separate Payments Collection**: Create `handyworks_payments` collection to track individual payments (array in doc)
3. **Smart Actions Button**: Context-aware button (Generate Invoice / Record Payment based on invoice status)
4. **Payment Recording Modal**: New modal to record manual payments with method, amount, reference
5. **Invoice Deletion**: Red [×] button on each invoice with confirmation (block if payments exist)
6. **Auto-calculate Totals**: Automatically calculate paid/owed amounts from payments collection
7. **Auto-update Status**: Mark invoice as 'paid' when total payments >= billed amount
8. **Stripe Webhook Integration**: Auto-create payment record when Stripe webhook fires

**Architecture Decisions:**
- ✅ Use separate `handyworks_payments` collection (not array in invoice)
- ✅ Store payments as immutable records with audit trail
- ✅ Soft delete invoices (mark as 'cancelled', not hard delete) 
- ✅ Block invoice deletion if payments exist
- ✅ Use today's date for manual payments
- ✅ Allow replacing unpaid invoices (no payments yet)
- ✅ One invoice per year per customer (2026, 2025, etc.)

### Background and Motivation (Original Requirements)

The billing section is admin-only (no customer-facing login). The original goal was to integrate Stripe payment processing to allow Steve to:
1. ✅ Generate payment links for annual maintenance billing ($555/year)
2. ✅ Send payment links to customers via email
3. ⏳ Track payment status in Firebase Firestore (automatic via webhooks)
4. ⏳ Optionally offer check payment discount ($540 vs $555)

**Key Requirements:**
- ✅ Admin-only access (no customer accounts needed)
- ✅ Simple workflow: Generate payment link → Send to customer → Track payment
- ✅ Integration with existing Firebase Firestore database (`handyworks_users` collection)
- ✅ Minimal manual intervention once set up
- ✅ Professional payment experience for customers

### Key Challenges and Analysis

Before we proceed with implementation, we need to discuss and decide on several critical architectural choices:

#### 1. **Payment Link Generation Strategy**

**Option A: Stripe Payment Links (Simplest)**
- ✅ **Pros:**
  - No backend code required (pure Stripe dashboard setup)
  - Stripe hosts the payment page
  - Simple URL generation
  - Automatic email receipts from Stripe
  - No PCI compliance concerns
- ❌ **Cons:**
  - Less customization of payment page
  - Can't dynamically pass customer data (name, account #) to prefill form
  - Harder to track which customer paid (must rely on email matching)
  - Manual webhook setup for payment tracking

**Option B: Stripe Checkout Sessions (Recommended for B2B)**
- ✅ **Pros:**
  - Can prefill customer data (name, email, account number)
  - Custom success/cancel URLs
  - Can pass metadata (account number) to track payments
  - More professional B2B experience
  - Better for automated billing
- ❌ **Cons:**
  - Requires Firebase Cloud Function to create sessions
  - More complex setup (but more powerful)
  - Need to deploy backend code

**Option C: Stripe Payment Intents + Custom Form (Most Control)**
- ✅ **Pros:**
  - Full UI customization
  - Embedded payment form on your website
  - Complete control over user experience
- ❌ **Cons:**
  - Most complex implementation
  - Need to handle PCI compliance considerations
  - More frontend JavaScript code
  - Overkill for simple annual billing

**My Recommendation:** Start with **Option A (Payment Links)** for immediate functionality, then migrate to **Option B (Checkout Sessions)** if you need better automation.

---

#### 2. **Backend Architecture Decision**

Since the website is static (GitHub Pages), we need a backend for:
- Creating payment sessions/links
- Processing webhooks from Stripe
- Updating Firestore when payments succeed

**Options:**

**Option A: Firebase Cloud Functions (Recommended)**
- ✅ Integrated with existing Firebase setup
- ✅ Serverless (no server management)
- ✅ Pay-per-use (low cost for ~100 transactions/year)
- ✅ Easy Firestore access
- ❌ Requires Firebase CLI setup
- ❌ Requires Node.js development

**Option B: Manual Process (No Backend)**
- ✅ No code required
- ✅ Use Stripe dashboard only
- ❌ Manual payment tracking
- ❌ Must manually update Firestore
- ❌ No automation

**My Recommendation:** **Firebase Cloud Functions** for automation. The initial setup cost is worth the long-term time savings.

---

#### 3. **Payment Workflow Design**

**Workflow A: Simple Payment Links (No Customer Accounts)**
```
1. Admin logs into admin dashboard
2. Admin clicks "Generate Payment Link" for a customer
3. System creates Stripe Payment Link with amount ($555)
4. Admin copies link and emails it to customer manually
5. Customer clicks link → pays on Stripe-hosted page
6. Stripe webhook notifies system → Updates Firestore
7. Admin sees payment status updated in dashboard
```

**Workflow B: Automated Email + Payment Tracking**
```
1. Admin logs into admin dashboard
2. Admin selects customers and clicks "Send Annual Bills"
3. System generates Stripe Checkout Sessions for each customer
4. System sends automated emails with payment links via SendGrid/EmailJS
5. Customer clicks link → pays on Stripe-hosted page
6. Stripe webhook notifies system → Updates Firestore automatically
7. Admin sees payment status updated in real-time
```

**My Recommendation:** Start with **Workflow A** for simplicity, then add **Workflow B** features incrementally.

---

#### 4. **Check Payment Discount Strategy**

**Question:** How do you want to handle the $540 check payment option?

**Option A: Two Separate Payment Links**
- Generate two links: "$555 - Pay by Card" and "$540 - Pay by Check"
- Check payment link has instructions to mail check
- Mark as "pending" until check arrives
- Admin manually marks as "paid" when check received

**Option B: Single Payment Link + Manual Check Tracking**
- Only offer card payment online ($555)
- Handle check payments completely manually (outside Stripe)
- Admin manually enters check payments in Firestore

**Option C: Stripe ACH (Bank Transfer) Instead of Check**
- Offer ACH payment at $545 (Stripe fee: 0.8% = ~$4.40)
- Customer links bank account directly
- Automatic payment processing (no manual check handling)
- Lower fees than credit card

**My Recommendation:** **Option C (ACH)** is most modern, but **Option A (Two Links)** is simplest if customers prefer physical checks.

---

#### 5. **Data Architecture Questions**

**Current State:**
- `handyworks_users` collection exists with customer data
- No billing/payment tracking collections yet

**Proposed New Collections:**

**A. `handyworks_billing` Collection**
```javascript
{
  acct_num: 1696,
  year: 2026,
  amount: 555,
  payment_method: "credit_card", // or "check", "ach"
  payment_status: "pending", // or "paid", "overdue"
  bill_date: timestamp,
  due_date: timestamp,
  paid_date: timestamp,
  stripe_payment_link_id: "plink_xyz123",
  stripe_payment_intent_id: "pi_xyz123", // set when payment succeeds
  created_at: timestamp,
  updated_at: timestamp
}
```

**B. `handyworks_transactions` Collection**
```javascript
{
  acct_num: 1696,
  transaction_date: timestamp,
  amount: 555,
  type: "payment", // or "refund", "adjustment"
  payment_method: "credit_card",
  stripe_payment_intent_id: "pi_xyz123",
  status: "succeeded",
  description: "2026 Annual Maintenance",
  created_at: timestamp
}
```

**Questions for You:**
1. Do you need transaction history, or just current year billing status?
2. Do you want to track multi-year history, or just current year?
3. Should we store billing records even before payment (as "invoices")?

---

### High-level Task Breakdown

**Phase 1: Stripe Account Setup** (User Action Required)
- [ ] Create/verify Stripe account
- [ ] Get test mode API keys (publishable + secret)
- [ ] Add keys to Firebase environment
- [ ] Verify Stripe dashboard access

**Phase 2: Database Schema Setup**
- [ ] Design and document Firestore collections (`handyworks_billing`, `handyworks_transactions`)
- [ ] Create Firestore indexes if needed
- [ ] Update security rules to allow admin read/write

**Phase 3: Simple Payment Link Generation (MVP)**
- [ ] Add "Generate Payment Link" button to admin dashboard
- [ ] Implement Stripe Payment Link creation (manual or via API)
- [ ] Display payment link in admin UI for copy/paste
- [ ] Test payment flow with Stripe test cards

**Phase 4: Webhook Integration**
- [ ] Create Firebase Cloud Function for Stripe webhooks
- [ ] Register webhook endpoint in Stripe dashboard
- [ ] Update Firestore when payment succeeds
- [ ] Test webhook with Stripe CLI

**Phase 5: Payment Status Tracking**
- [ ] Display payment status in admin dashboard
- [ ] Add filters (paid/pending/overdue)
- [ ] Add visual indicators (colors, icons)
- [ ] Add payment history view

**Phase 6: Optional Enhancements**
- [ ] Automated email sending
- [ ] Checkout Session generation (vs Payment Links)
- [ ] ACH payment option
- [ ] Refund handling
- [ ] Annual billing automation

---

### Questions for Discussion

Before I proceed with implementation, please provide your input on:

1. **Payment Link Strategy:**
   - Do you want to start with simple Stripe Payment Links (no backend), or invest in Firebase Cloud Functions for better automation?

2. **Check Payment Handling:**
   - How do you currently handle check payments? Do you want to keep offering $15 discount for checks?
   - Would you consider ACH (bank transfer) instead at a smaller discount (e.g., $545)?

3. **Email Sending:**
   - Do you want to manually email payment links, or automate it?
   - If automated, are you okay setting up an email service (SendGrid, EmailJS, etc.)?

4. **Data Tracking:**
   - Do you need full transaction history, or just "paid/pending" status?
   - Do you want to generate "invoices" before payment (with due dates), or just track when payment happens?

5. **Timeline:**
   - Are you looking for a quick MVP (simple payment links, manual email), or a fully automated system?

6. **Stripe Account:**
   - Do you already have a Stripe account, or do I need to guide you through setup?
   - Do you have test mode API keys available?

Please answer these questions so I can refine the implementation plan and create a prioritized task breakdown.

---

### ✅ DECISION: User Requirements Confirmed

**Date**: 2025-12-12  
**User Input:** "I want to send users an invoice. They can respond and pay via Stripe or send me a check. They may also want to send me their CC info so I can enter it."

**Confirmed Workflow:**
1. **Invoice Generation:** Admin generates invoice with amount ($555 or $540 for check)
2. **Invoice Delivery:** Admin sends invoice to customer (email/mail)
3. **Payment Options for Customer:**
   - Option A: Click Stripe payment link in invoice → Pay online with card
   - Option B: Mail a check to HandyWorks
   - Option C: Call/email CC info → Admin enters it manually via Stripe Virtual Terminal
4. **Payment Tracking:** System tracks payment status automatically (for Stripe) or manually (for checks)

**Architecture Implications:**
- ✅ Need invoice generation (PDF or email template with payment link)
- ✅ Need Stripe Payment Links (one per customer, one-time use)
- ✅ Need Stripe Virtual Terminal access (for manual CC entry)
- ✅ Need webhook to track Stripe payments automatically
- ✅ Need manual "Mark as Paid" for check payments
- ✅ Need invoice/billing record in Firestore

---

### High-Level Task Breakdown

#### Phase 1: Database Schema Updates (30 min)
- [ ] Create `handyworks_payments` collection structure
- [ ] Update invoice documents to include payment tracking fields
- [ ] Document payment data structure

#### Phase 2: Backend Logic - Load Invoice History (1 hour)
- [ ] Update `loadUsers()` to fetch ALL invoices per user (not just 2026)
- [ ] For each invoice, query and sum payments from `handyworks_payments`
- [ ] Calculate: `amount_paid`, `amount_owed` per invoice
- [ ] Auto-update invoice status based on payments

#### Phase 3: UI - Invoice History Column (2 hours)
- [ ] Replace "Amount Owed" column with "Invoice History" column
- [ ] Display compact invoice pills (Option A format)
- [ ] Color-code by status (green=paid, yellow=pending, red=overdue, gray=cancelled)
- [ ] Add delete [×] button per invoice with confirmation
- [ ] Show year, billed, paid, owed amounts

#### Phase 4: Smart Actions Button (1 hour)
- [ ] Update table actions to show context-aware button
- [ ] "Generate Invoice" when no active invoice for year
- [ ] "Record Payment" when unpaid invoice exists
- [ ] Disable/hide when invoice is paid

#### Phase 5: Payment Recording Modal (2-3 hours)
- [ ] Create new modal HTML in `admin.html`
- [ ] Show invoice details (read-only)
- [ ] Payment form: amount, method dropdown, reference field
- [ ] Validation and error handling
- [ ] Create payment record in `handyworks_payments`
- [ ] Refresh dashboard after payment recorded

#### Phase 6: Invoice Deletion (1 hour)
- [ ] Implement delete invoice function
- [ ] Check for existing payments (block if any exist)
- [ ] Soft delete (mark as 'cancelled')
- [ ] Confirmation dialog with details
- [ ] Refresh dashboard after deletion

#### Phase 7: Stripe Webhook Enhancement (1 hour)
- [ ] Update webhook to create payment record in `handyworks_payments`
- [ ] Link payment to invoice via invoice_id
- [ ] Auto-update invoice status
- [ ] Test with Stripe test payments

#### Phase 8: Invoice Generation Enhancement (1 hour)
- [ ] Check for existing invoices before generation
- [ ] Block if invoice paid for year
- [ ] Block if partial payments exist
- [ ] Allow replacing unpaid invoices (no payments)
- [ ] Update confirmation dialogs

#### Phase 9: Testing & Refinement (1-2 hours)
- [ ] Test full payment workflow
- [ ] Test invoice deletion
- [ ] Test partial payments
- [ ] Test invoice replacement
- [ ] Test Stripe webhook integration
- [ ] Fix any bugs discovered

**Total Estimated Time**: 10-13 hours

### Implementation Summary

**Date Completed**: 2025-12-17  
**Status**: ✅ **IMPLEMENTATION COMPLETE** - Ready for Testing

#### What Was Built

**Core Features:**
1. ✅ New `handyworks_payments` collection for tracking individual payments
2. ✅ Invoice history column showing all invoices per user (compact pill format)
3. ✅ Smart action buttons (Generate Invoice / Record Payment based on context)
4. ✅ Payment recording modal for manual payments (check, phone, fax, cash)
5. ✅ Invoice deletion with payment check (blocks if payments exist)
6. ✅ Auto-calculate totals (billed, paid, owed) from payments
7. ✅ Auto-update invoice status when fully paid
8. ✅ Stripe webhook integration creates payment records
9. ✅ Enhanced invoice generation with duplicate/payment checks

**User Workflow Changes:**

**Before:**
- Single "Amount Owed" column (static)
- "Generate Bill" button always visible
- No way to record manual payments
- No invoice history
- No payment tracking

**After:**
- "Invoice History" column showing all invoices with status
- Smart buttons: "Generate Invoice" OR "Record Payment" OR "Paid ✓"
- Payment recording modal for manual payments
- Invoice pills show: Year, Billed, Paid, Owed
- Delete button [×] on each invoice
- Partial payment support
- Full audit trail

**Files Modified:**
1. ✅ `.cursor/PAYMENTS_COLLECTION_SCHEMA.md` - New collection documentation
2. ✅ `js/admin-dashboard.js` - Enhanced with payment tracking logic (~300 lines added)
3. ✅ `billing/admin.html` - Added payment recording modal, updated table headers
4. ✅ `api/stripeWebhook.js` - Creates payment records when Stripe webhook fires
5. ✅ `js/config.js` - Updated cache-busting version

**Database Collections:**
1. `handyworks_invoices` - Existing, enhanced with payment status tracking
2. `handyworks_payments` - NEW collection for individual payment records

**Key Functions Added:**
- `formatInvoicePill()` - Display compact invoice pills
- `recordPaymentForInvoice()` - Open payment modal
- `deleteInvoice()` - Soft delete with payment check
- `openPaymentModal()` - Payment recording interface
- `submitPayment()` - Create payment record in Firestore
- Enhanced `loadUsers()` - Load all invoices and payments
- Enhanced `generateInvoice()` - Check for duplicates and partial payments

### Project Status Board

#### Current Status / Progress Tracking

**Status:** ✅ **READY FOR TESTING** - Implementation Complete

#### Testing Instructions

**Prerequisites:**
1. Deploy updated Firestore security rules for `handyworks_payments` collection
2. Push code to GitHub
3. Wait for deployment to GitHub Pages (1-2 minutes)

**Test Scenarios:**

**Test 1: View Invoice History**
1. Login to admin dashboard
2. Verify "Invoice History" column shows existing invoices
3. Verify invoices show as compact pills with year, amounts, delete [×] button
4. Verify color coding (green=paid, yellow=pending, red=overdue)

**Test 2: Record Manual Payment**
1. Find user with unpaid invoice
2. Click "Record Payment" button
3. Verify payment modal opens with invoice details
4. Enter payment amount (try partial payment)
5. Select payment method (check, credit card, etc.)
6. Add reference and notes
7. Click "Record Payment"
8. Verify payment recorded and dashboard updates

**Test 3: Partial Payments**
1. Record first partial payment ($100 of $555)
2. Verify invoice shows updated amounts
3. Record second partial payment ($455)
4. Verify invoice marked as "Paid" when total reaches billed amount

**Test 4: Invoice Deletion**
1. Find invoice with NO payments
2. Click red [×] button
3. Confirm deletion
4. Verify invoice marked as cancelled (disappears from display)
5. Try to delete invoice WITH payments - should be blocked

**Test 5: Generate New Invoice**
1. Try to generate invoice for year that already has paid invoice
2. Should be blocked with message
3. Try to generate invoice for year with partial payments
4. Should be blocked with message
5. Try to generate invoice for year with unpaid invoice (no payments)
6. Should offer to replace - accept
7. Verify old invoice cancelled, new invoice created

**Test 6: Stripe Payment Integration**
1. Generate new invoice for test customer
2. Copy payment link
3. Test payment with Stripe test card: 4242 4242 4242 4242
4. Wait for webhook to fire
5. Verify payment record created in `handyworks_payments`
6. Verify invoice marked as paid
7. Verify payment shows in dashboard

**Test 7: Smart Action Buttons**
1. User with no invoice → Should show "Generate Invoice"
2. User with unpaid invoice → Should show "Record Payment"
3. User with paid invoice → Should show "Paid ✓" badge

**Expected Behaviors:**
- ✅ Invoice history displays all invoices per user
- ✅ Payments tracked in separate collection
- ✅ Totals auto-calculated from payments
- ✅ Invoice status auto-updated when fully paid
- ✅ Cannot delete invoice with payments
- ✅ Cannot generate duplicate invoice for paid year
- ✅ Cannot generate invoice if partial payments exist
- ✅ Can replace unpaid invoice (no payments)
- ✅ Stripe webhook creates payment records

**Completed:**
- ✅ Firebase Authentication working (admin login functional)
- ✅ Firestore security rules deployed
- ✅ Admin dashboard with user list and basic UI
- ✅ Stripe test API keys added to config.js
- ✅ User requirements clarified (invoice-based workflow)

**Ready to Implement:**
- 📝 Design invoice/billing data structure in Firestore
- 📝 Create invoice generation UI in admin dashboard
- 📝 Generate Stripe Payment Links per invoice
- 📝 Create invoice email template with payment options
- 📝 Add webhook handler for automatic payment tracking
- 📝 Add "Mark as Paid" button for check payments
- 📝 Add manual CC entry instructions (Stripe Virtual Terminal)

**Next Steps:**
1. Design Firestore schema for invoices/billing
2. Create invoice generation UI
3. Integrate Stripe Payment Link creation
4. Set up webhook for payment tracking
5. Add manual payment recording

---

### Refined Implementation Plan

Based on your requirements, here's the implementation approach:

#### **Phase 1: Database Schema (30 minutes)**

Create `handyworks_invoices` collection:

```javascript
{
  invoice_id: "INV-2026-1696", // Format: INV-{year}-{acct_num}
  acct_num: 1696,
  customer_name: "Dr. Smith",
  customer_email: "drsmith@clinic.com",
  year: 2026,
  amount: 555, // or 540 for check
  payment_method_preference: null, // Set when customer pays: "stripe", "check", "manual_card"
  payment_status: "pending", // "pending", "paid", "overdue"
  
  // Invoice details
  invoice_date: timestamp,
  due_date: timestamp,
  description: "Annual Maintenance 2026",
  notes: "Pay online via Stripe, mail check to HandyWorks, or call with CC info",
  
  // Stripe integration
  stripe_payment_link_id: "plink_xyz123", // For online payments
  stripe_payment_link_url: "https://buy.stripe.com/...", // URL to include in invoice
  stripe_payment_intent_id: null, // Set when payment succeeds
  
  // Payment tracking
  paid_date: null,
  paid_amount: null,
  transaction_ref: null, // Check number or Stripe transaction ID
  
  // Metadata
  created_at: timestamp,
  updated_at: timestamp,
  created_by: "admin@handyworks.com"
}
```

#### **Phase 2: Admin Dashboard - Invoice Generation (2-3 hours)**

**Add to `billing/admin.html`:**

1. **"Generate Invoice" Button** next to each user
   - Opens modal with invoice details
   - Shows amount ($555 default, option to change to $540 for check)
   - Shows customer info (name, email, account #)
   - Previews invoice text

2. **Invoice Generation Process:**
   - Creates record in `handyworks_invoices` collection
   - Calls Stripe API to create Payment Link
   - Stores Payment Link URL in invoice record
   - Displays invoice summary with:
     - Payment Link URL (for copy/paste into email)
     - Invoice text template
     - Email template with payment instructions

3. **Invoice List View:**
   - Show all invoices with status (Pending, Paid, Overdue)
   - Filter by status, year, customer
   - Sortable columns

#### **Phase 3: Stripe Payment Link Creation (1-2 hours)**

**Option A: Use Stripe Dashboard to Create Product (Simpler)**
- Create a $555 product in Stripe Dashboard
- Use Stripe Payment Links API to generate unique link per customer
- Pass customer metadata (acct_num, name) in link

**Option B: Use Firebase Cloud Function (More Automated)**
- Create Cloud Function that generates Payment Link
- Call from admin dashboard
- Automatically embeds customer metadata

**Recommendation:** Start with **Option A** (Dashboard product + API link generation) - simpler setup.

#### **Phase 4: Invoice Email Template (30 minutes)**

Create template text that admin can copy/paste:

```
Subject: HandyWorks Annual Maintenance Invoice - 2026

Dear [Customer Name],

Your annual HandyWorks maintenance fee for 2026 is due.

INVOICE #: INV-2026-[Account #]
AMOUNT DUE: $555.00
DUE DATE: [Date]

PAYMENT OPTIONS:

1. PAY ONLINE (Credit Card via Stripe):
   Click here: [Stripe Payment Link]
   
2. PAY BY CHECK ($15 discount - $540):
   Mail check to:
   HandyWorks Software
   [Your Address]
   [City, State ZIP]
   
   Please include invoice # on check memo line.

3. PAY BY PHONE (Credit Card):
   Call us at [Phone] with your credit card information
   and we'll process it securely.

Questions? Reply to this email or call [Phone].

Thank you for your business!

HandyWorks Software
```

#### **Phase 5: Payment Tracking - Webhook (2-3 hours)**

**Automatic Payment Tracking (Stripe Webhook):**

1. Create Firebase Cloud Function: `stripeWebhook`
2. Register webhook endpoint in Stripe Dashboard
3. Listen for `payment_intent.succeeded` event
4. Update invoice in Firestore:
   - Set `payment_status` to "paid"
   - Set `paid_date` to current timestamp
   - Set `stripe_payment_intent_id`
   - Set `payment_method_preference` to "stripe"

**Manual Payment Tracking (Check/Manual CC):**

1. Add "Mark as Paid" button in admin dashboard
2. Opens modal to enter:
   - Payment method (check/manual_card)
   - Payment date
   - Check number or transaction reference
   - Amount paid (if different from invoice amount)
3. Updates invoice record in Firestore

#### **Phase 6: Stripe Virtual Terminal Setup (15 minutes)**

**For Manual CC Entry:**
- Enable Virtual Terminal in Stripe Dashboard
- Document process for admin:
  1. Customer calls with CC info
  2. Admin logs into Stripe Dashboard
  3. Go to Payments → Virtual Terminal
  4. Enter amount, CC details, customer name
  5. Add invoice # in description
  6. Process payment
  7. Copy transaction ID
  8. Mark invoice as paid in admin dashboard (paste transaction ID)

---

### Executor's Feedback or Assistance Requests

**From Planner to User:**

The workflow is now clear! This is a very practical approach that:
- ✅ Gives customers flexibility (online, check, or phone)
- ✅ Minimizes manual work (Stripe payments auto-tracked)
- ✅ Keeps it simple (no customer login required)
- ✅ Professional (proper invoicing and payment tracking)

**Key Decision Points Remaining:**

1. **Stripe Payment Links Generation:**
   - Should I create a Firebase Cloud Function for this, or use simpler dashboard approach?
   - Cloud Function = more automated, Dashboard approach = simpler setup
   - **Recommendation:** Start with dashboard approach, add Cloud Function later if needed

2. **Email Sending:**
   - Manual copy/paste email template, or integrate email service (SendGrid/EmailJS)?
   - Manual = simpler, Automated = saves time for 100+ customers
   - **Recommendation:** Start manual, add automation if billing 100+ customers at once is tedious

3. **Check Discount:**
   - Keep $15 discount for checks ($540 vs $555)?
   - **Assuming yes** based on your existing documentation

**Ready to proceed with implementation?** I'll start with Phase 1 (Database Schema) and Phase 2 (Invoice Generation UI) unless you want to discuss anything else first.

---

## ✅ RESOLVED: Firebase Authentication Referrer Policy Problem

**Solution Found**: The issue was API key HTTP referrer restrictions, not the Referer header itself.

**Fix Applied**: Remove HTTP referrer restrictions from Firebase API key in Google Cloud Console. Firebase can validate domains using Origin header (which we ARE sending) instead of requiring Referer header.

**Reference**: Same approach used in jetlagpro-website.

**Documentation**: See `scripts/FIREBASE_API_KEY_FIX.md` for detailed steps.

---

## 🎯 PLANNER: Firebase Authentication Referrer Policy Problem - Detailed Analysis (ARCHIVED)

### Problem Statement for External Consultation

**Date**: 2025-12-12  
**Project**: HandyWorks Website Billing System  
**Issue**: Firebase Authentication blocking requests due to missing Referer header

---

## Context and Setup

### Project Architecture
- **Website**: Static HTML site hosted on GitHub Pages
- **Domain**: `https://handyworks.com` (custom domain via GitHub Pages)
- **Firebase Project**: `handyworks-billing`
- **Firebase Auth**: Email/password authentication
- **Firebase Firestore**: Database with security rules deployed
- **Authentication Flow**: Users login at `https://handyworks.com/billing/admin-login.html`

### Firebase Configuration
- **Project ID**: `handyworks-billing`
- **Auth Domain**: `handyworks-billing.firebaseapp.com`
- **Authorized Domains**: `handyworks.com` is correctly added to Firebase Console → Authentication → Settings → Authorized Domains
- **Security Rules**: Deployed and working (requires authentication)

---

## The Problem

### Error Message
```
Firebase: Error (auth/requests-from-referer-https://handyworks.com-are-blocked)
```

### When It Occurs
- When user attempts to login via `auth.signInWithEmailAndPassword(email, password)`
- POST request to `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword` returns **403 Forbidden**
- Error occurs even though domain is in authorized domains list

### Network Request Details
- **Request URL**: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...`
- **Status**: 403 Forbidden
- **Request Headers**:
  - `origin: https://handyworks.com` ✅ (correct)
  - `referer`: **MISSING** ❌ (not being sent)
- **Response Headers**:
  - `access-control-allow-origin: https://handyworks.com` ✅ (Firebase recognizes origin)
  - `vary: Referer` (Firebase is checking for Referer header)

### Browser Console Observations
- `document.referrerPolicy`: Shows "not set"
- Meta tag: `<meta name="referrer" content="unsafe-url">` is present in HTML
- Console log shows: `Meta Referrer: unsafe-url` (meta tag is read correctly)
- But: `Referrer Policy: not set` (browser not applying it)

---

## What We've Tried

### Attempt 1: Meta Tag
- Added `<meta name="referrer" content="unsafe-url">` to HTML `<head>`
- **Result**: Meta tag is present and readable, but browser shows "not set"

### Attempt 2: JavaScript Setting
- Tried `document.referrerPolicy = 'unsafe-url'`
- Tried setting meta tag dynamically via JavaScript
- **Result**: Still shows "not set"

### Attempt 3: Different Referrer Policies
- Tried `origin-when-cross-origin`
- Tried `unsafe-url`
- Tried `origin`
- **Result**: None work - policy remains "not set"

### Attempt 4: Cache Busting
- Updated all CSS/JS cache-busting parameters
- Added cache-control meta tags
- **Result**: Files load fresh, but referrer policy issue persists

### Attempt 5: Domain Verification
- Verified `handyworks.com` is in Firebase authorized domains
- Removed and re-added domain
- Waited for propagation (5+ minutes)
- **Result**: Domain is correctly configured, but still blocked

---

## Key Observations

### What Works
- ✅ Domain is in Firebase authorized domains list
- ✅ Origin header is sent correctly (`origin: https://handyworks.com`)
- ✅ Firebase recognizes the origin (`access-control-allow-origin` response)
- ✅ Meta tag is present and readable
- ✅ Security rules are deployed and working

### What Doesn't Work
- ❌ Referer header is NOT being sent in authentication requests
- ❌ Browser shows `document.referrerPolicy: "not set"`
- ❌ Meta tag is ignored/overridden
- ❌ JavaScript cannot set referrer policy

### Suspected Root Cause
**GitHub Pages is likely setting a `Referrer-Policy` HTTP header** that overrides:
- Meta tags
- JavaScript attempts to set policy
- Browser default behavior

**Evidence**:
- Meta tag exists but browser shows "not set"
- This typically happens when HTTP header overrides HTML meta tag
- GitHub Pages may set security headers by default

---

## Constraints

### Technical Constraints
1. **Static Site**: Must remain static HTML (no server-side code)
2. **GitHub Pages**: Currently hosted on GitHub Pages (may not allow custom headers)
3. **Firebase Requirement**: Firebase requires Referer header to match authorized domain
4. **Browser Security**: Modern browsers respect HTTP headers over meta tags

### Business Constraints
1. **Domain**: Must use `handyworks.com` (custom domain)
2. **Hosting**: Prefer to stay on GitHub Pages if possible
3. **Cost**: Prefer free/low-cost solutions
4. **Complexity**: Prefer simple solutions over complex workarounds

---

## What We Need

### Primary Question
**How can we make the browser send the Referer header when making Firebase authentication requests from a GitHub Pages-hosted site?**

### Specific Questions
1. **Is GitHub Pages setting a Referrer-Policy HTTP header?** (Need to verify in Response Headers)
2. **If yes, can we override it?** (GitHub Pages may not allow custom headers)
3. **If no override possible, what are the alternatives?**
   - Move to Firebase Hosting? (Can we control headers there?)
   - Use a different hosting solution?
   - Contact Firebase for alternative domain validation?
4. **Are there other ways to make Firebase accept the domain without Referer header?**
   - API key + Origin validation?
   - Different Firebase configuration?
   - Custom domain setup in Firebase?

### Success Criteria
- User can successfully login via Firebase Authentication
- Referer header is sent with authentication requests
- OR Firebase accepts requests without Referer header
- Solution works with GitHub Pages (or minimal migration effort)

---

## Additional Context

### Files Involved
- `billing/admin-login.html` - Login page with Firebase Auth
- `billing/admin.html` - Dashboard (also has Firebase)
- `js/config.js` - Firebase configuration
- `firestore.rules` - Security rules (deployed and working)

### Firebase SDK Version
- Using: `firebasejs/10.7.1` (compat version)

### Browser Testing
- Tested in: Microsoft Edge, Chrome
- Both show same behavior: Referrer Policy "not set"

---

## Next Steps for External Consultation

**Please ask the working Cursor instance**:
1. How do you handle Firebase Authentication with custom domains?
2. Do you use GitHub Pages or different hosting?
3. How do you ensure Referer header is sent?
4. Are there Firebase configuration options we're missing?
5. What's the best practice for Firebase Auth with static sites on GitHub Pages?

---

## Background and Motivation

**PROJECT OVERVIEW - 2025-01-09**

**Repository**: https://github.com/SBSchram/handyworks-website  
**Local Path**: `C:\Users\sbsch\Documents\handyworks-website`  
**Live Site**: https://handyworks.com/

### Project Description

HandyWorks Website is a static HTML website for HandyWorks Chiropractic Office Management Software. The site was migrated from WordPress in January 2025 and is now hosted on GitHub Pages.

### Key Features

- **Blog Homepage**: 61 blog posts (2015-2025) with expandable entries
- **Newsletter Archive**: 43 newsletters (1992-2017) in PDF format
- **Software Downloads**: Upgrade files and installation packages in `public/` directory
- **Desktop Software Integration**: `LatestVersion.txt` for automatic update checking
- **Billing System**: Firebase-based billing system with admin dashboard
- **SEO Optimized**: Meta tags, sitemap.xml, robots.txt
- **Email Forwarding**: steve@handyworks.com via Namecheap

### Technology Stack

- **Hosting**: GitHub Pages
- **DNS**: Namecheap
- **SSL**: Automatic via GitHub Pages
- **Email**: Namecheap email forwarding
- **Contact Form**: Formspree
- **Backend**: Firebase (for billing system)
- **Payment Processing**: Stripe (test mode configured)
- **Analytics**: None (privacy-focused)

### Project Structure

```
handyworks-website/
├── index.html              # Blog homepage
├── about.html              # About HandyWorks
├── contact.html            # Contact form (Formspree)
├── downloads.html          # Software downloads
├── faq.html                # FAQ page
├── features.html           # Features page
├── legacy.html             # Legacy information
├── newsletters.html        # Newsletter archive
├── partners.html           # Partners page
├── story.html              # The HandyWorks Story
├── billing/                # Billing system pages
│   ├── admin-login.html
│   └── admin.html
├── blog/                   # Blog posts (organized by year/month)
├── css/                    # Stylesheets
├── js/                     # JavaScript (config, header/footer, blog, sidebar)
├── images/                 # Images and logos
├── newsletters/            # Newsletter PDFs
├── public/                 # Download files (accessible via https://handyworks.com/public/)
├── scripts/                # Maintenance scripts
├── CNAME                   # Custom domain configuration
├── robots.txt              # Search engine directives
└── sitemap.xml             # Site map for SEO
```

### DNS Configuration

- **A Records** (apex domain):
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- **CNAME Record** (www subdomain):
  - www → sbschram.github.io

## Key Challenges and Analysis

### Current System Architecture

**Static Site Generation**:
- All pages are static HTML files
- JavaScript handles dynamic content injection (header/footer, blog expansion)
- No build process required - direct HTML/CSS/JS

**Billing System Integration**:
- Firebase authentication and Firestore database
- Admin dashboard for billing management
- Stripe integration for payment processing (currently in test mode)
- Documentation available in `scripts/` directory:
  - `FIREBASE_SETUP_GUIDE.md`
  - `STRIPE_SETUP_GUIDE.md`
  - `BILLING_SYSTEM_ARCHITECTURE.md`
  - `FIRESTORE_STRUCTURE.md`

**Firebase User Repository**:
- **Firebase Console**: https://console.firebase.google.com/u/0/project/handyworks-billing/firestore/databases/-default-/data/~2Fhandyworks_users
- **Collection**: `handyworks_users` in Firestore database
- **Document Structure**: Each user document uses `acct_num` as the document ID (e.g., "1573", "1696", "110")
- **User Fields**:
  - `acct_num` (number) - Account number (used as document ID)
  - `fname`, `lname` (string) - User name
  - `clinic` (string) - Clinic name
  - `EMAIL` (string) - Email address (for Firebase Auth login)
  - `HomePhone`, `tele1`, `CellPhone` (string) - Phone numbers
  - `addr1`, `addr2`, `city`, `state`, `zip` (string) - Address
  - `status` (string) - Account status (A=Active, etc.)
  - `maint_billed`, `maint_paid`, `owed` (number) - Current billing amounts
  - `maintbilldt`, `maintpddt` (timestamp) - Billing dates
  - `imported_at` (timestamp) - Import metadata
  - `source` (string) - Data source
- **Management Scripts**:
  - `import_handyworks_data.js` - Import users from TSV file
  - `import_hwsales_csv.js` - Import from CSV format
  - `create_firebase_users.js` - Create Firebase Auth accounts from Firestore users

**Content Management**:
- Blog posts are individual HTML files organized by year/month
- Blog index is regenerated using `scripts/regenerate_blog_index.py`
- Newsletters are PDF files in `newsletters/` directory

**Maintenance Scripts**:
- `add_favicon.py`: Add favicon to HTML pages
- `add_meta_tags.py`: Add SEO meta tags to pages
- `clean_wordpress_content.py`: Clean WordPress HTML (for future blog posts)
- `regenerate_blog_index.py`: Regenerate blog homepage
- `test_site.py`: Test all links and downloads
- `final_cleanup.py`: Remove outdated files

## High-level Task Breakdown

### Current Status

**Project Status**: ✅ **REPOSITORY CLONED AND READY FOR DEVELOPMENT**

- Repository successfully cloned to local machine
- Project structure verified
- Configuration files reviewed
- Ready for development tasks

## Project Status Board

### ✅ **COMPLETED TASKS**

#### **Project Setup** ✅ **COMPLETE**
- [x] Repository cloned from GitHub
- [x] Project structure verified
- [x] Configuration files reviewed
- [x] Scratchpad created for project tracking
- [x] Firebase user repository verified and documented

#### **Firestore Security Rules** ✅ **COMPLETE**
- [x] Security rules file created (`firestore.rules`)
- [x] Deployment guide created (`scripts/FIRESTORE_SECURITY_RULES.md`)
- [x] Admin claim script created (`scripts/set_admin_claim.js`)
- [x] Security rules deployed to Firebase
- [x] Firebase authorized domains configured (`handyworks.com`)
- [x] API key HTTP referrer restrictions fixed
- [x] API key API restrictions fixed (Identity Toolkit API enabled)
- [x] Admin access tested and working
- [x] Test Mode warning resolved (security rules deployed)

### 🎯 **CURRENT TASK**

**🔴 URGENT: Firestore Security Rules Deployment** ⏳ **IN PROGRESS**
- **Deadline**: 4 days until Test Mode expires
- **Status**: Security rules created, ready for deployment
- **Files Created**:
  - `firestore.rules` - Security rules file
  - `scripts/FIRESTORE_SECURITY_RULES.md` - Deployment guide
  - `scripts/set_admin_claim.js` - Admin user setup script
- **Next Steps**:
  1. Deploy security rules via Firebase Console
  2. Test admin and user access
  3. Set admin custom claims for admin users
  4. Verify Test Mode warning disappears

### 📋 **FUTURE ENHANCEMENTS** (Optional)

#### **Potential Improvements** (Future Development)
- [ ] Enhanced blog post management system
- [ ] Automated newsletter archive organization
- [ ] Enhanced SEO optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness improvements
- [ ] Analytics integration (if desired)
- [ ] Automated testing for links and downloads

## Executor's Feedback or Assistance Requests

### ✅ **RESOLVED: File Write Permission Issue**

**Problem**: Attempted to write to `scratchpad.md` but encountered "EBADF: bad file descriptor" error.

**Root Cause**: Protected folder permissions preventing file writes.

**Resolution**: User granted write permissions to the protected folder.

**Status**: ✅ **RESOLVED** - File writes now working correctly.

### 🔴 **URGENT: Firestore Security Rules Deployment**

**Problem**: Firebase Firestore database is in Test Mode and will expire in 4 days, blocking all client requests.

**Root Cause**: Database was created in Test Mode (open access) which automatically expires after 30 days for security.

**Solution Implemented**:
- Created comprehensive security rules file (`firestore.rules`)
- Created deployment guide (`scripts/FIRESTORE_SECURITY_RULES.md`)
- Created admin claim setup script (`scripts/set_admin_claim.js`)

**Security Rules Features**:
- Requires authentication for all access
- Users can read their own data (email matching)
- Admins can read/write all data
- Protects all collections: `handyworks_users`, `handyworks_billing`, `handyworks_transactions`

**Status**: ✅ **DEPLOYED** - Rules deployed to Firebase

---

### 🔴 **URGENT: Firebase Authorized Domains**

**Problem**: Firebase Authentication blocking requests from `https://handyworks.com` with error: `auth/requests-from-referer-https://handyworks.com-are-blocked`

**Root Cause**: Domain `handyworks.com` not added to Firebase Authorized Domains list.

**Solution Required**:
1. Go to Firebase Console → Authentication → Settings
2. Add `handyworks.com` to Authorized Domains list
3. Clear browser cache and test login

**Documentation Created**:
- `scripts/FIRESTORE_AUTHORIZED_DOMAINS.md` - Step-by-step guide

**Status**: ✅ **RESOLVED** - Firebase Authentication Working
- **Root Cause**: Firebase API key had two restrictions blocking authentication:
  1. HTTP referrer restrictions (missing `handyworks.com/*`)
  2. API restrictions (Identity Toolkit API not enabled)
- **Solution Applied**:
  1. ✅ Added `handyworks.com/*` to HTTP referrer restrictions
  2. ✅ Enabled Identity Toolkit API in API key restrictions
- **Result**: ✅ Authentication now working - user successfully logged in
- **Documentation**: 
  - `scripts/FIREBASE_API_KEY_FIX.md` - HTTP referrer restrictions
  - `scripts/FIREBASE_API_RESTRICTIONS_FIX.md` - API restrictions
- Domain `handyworks.com` is correctly in authorized domains list

## Lessons

### 🏗️ **Architecture Lessons**

*Lessons will be documented here as development progresses.*

### 🔧 **Technical Lessons**

**File Write Permissions** ✅ **LEARNED**
- **Problem**: "EBADF: bad file descriptor" error when writing to files in protected folders
- **Solution**: Ensure write permissions are granted to the folder/directory
- **Lesson**: Protected folders (like Documents) may require explicit permission grants for file operations
- **Application**: Always verify folder permissions before attempting file writes

**Firebase API Key Restrictions** ✅ **LEARNED**
- **Problem**: Firebase Authentication blocked with referrer and API restriction errors
- **Root Cause**: API key had two restrictions:
  1. HTTP referrer restrictions - needed `handyworks.com/*` added
  2. API restrictions - needed Identity Toolkit API enabled
- **Solution**: Configure both restrictions in Google Cloud Console → APIs & Services → Credentials
- **Lesson**: Firebase API keys need both domain authorization AND API access configured
- **Application**: When setting up Firebase Auth, always check:
  1. Domain is in Firebase authorized domains
  2. Domain is in API key HTTP referrer restrictions
  3. Identity Toolkit API is enabled in API key restrictions
- **Reference**: Same configuration needed as in jetlagpro-website project

### 📱 **Development Lessons**

*Lessons will be documented here as development progresses.*

## Operating Guidelines

### Core Philosophy

- **Static Site Simplicity**: Keep the site simple and maintainable
- **Direct HTML/CSS/JS**: No unnecessary build processes
- **GitHub Pages Deployment**: Automatic deployment on push to main
- **Content-First**: Focus on content and user experience

### Project-Specific Defaults

- **Static HTML**: All pages are static HTML files
- **JavaScript Injection**: Use JS for header/footer and dynamic content
- **Cache Busting**: Use version query parameters in config.js
- **SEO Optimization**: Meta tags and sitemap for search engines
- **Privacy-Focused**: No analytics tracking

### Development Workflow

1. **Local Testing**: Use `python3 -m http.server 8000` for local testing
2. **Content Updates**: Edit HTML files directly
3. **Blog Posts**: Create in `blog/YYYY/MM/` and regenerate index
4. **Deployment**: Push to main branch for automatic GitHub Pages deployment

## Documentation Updates

### ✅ **COMPLETED: Initial Project Setup**

**Project Documentation** ✅ **COMPLETE**
- Repository cloned and verified
- Project structure documented
- Configuration files reviewed
- Scratchpad created for development tracking
