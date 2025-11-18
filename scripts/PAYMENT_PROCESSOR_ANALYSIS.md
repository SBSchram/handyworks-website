# Payment Processor Analysis for HandyWorks Billing System

**Date:** 2025-11-17  
**Focus:** Minimize credit card processing fees  
**Transaction Volume:** ~100 users × $555/year = ~$55,500/year (~$4,625/month)

---

## Executive Summary

**Recommended Approach:** **Check Discount Strategy + Low-Cost Payment Processor**

- **Primary:** Encourage check payments with $15 discount ($540 vs $555)
- **Secondary:** Use low-cost payment processor for credit card payments
- **Goal:** Minimize overall processing fees while maintaining user choice

---

## Payment Processor Comparison

### 1. **Helcim** ⭐ **RECOMMENDED FOR LOW FEES**

**Pricing:**
- Online transactions: **2.38% + $0.25** per transaction
- No monthly fees
- No setup fees
- No long-term contracts

**Features:**
- ✅ Excellent web API integration
- ✅ PCI-DSS compliant
- ✅ Supports recurring payments
- ✅ Hosted payment pages
- ✅ Webhook support for payment confirmations
- ✅ Good developer documentation

**Cost Analysis (for $555 transaction):**
- Fee: $555 × 2.38% + $0.25 = **$13.46 per transaction**
- Annual cost (if all 100 users pay by card): $1,346
- **If 50% pay by check (with discount):** $673/year in fees

**Pros:**
- ✅ Lowest fees among modern processors
- ✅ Transparent interchange-plus pricing
- ✅ No hidden fees or monthly charges
- ✅ Excellent API for web integration

**Cons:**
- ⚠️ Less well-known than Stripe/Square
- ⚠️ May require setup/approval process

---

### 2. **Stripe** (Industry Standard)

**Pricing:**
- Online transactions: **2.9% + $0.30** per transaction
- No monthly fees (unless using advanced features)

**Features:**
- ✅ Excellent API and documentation
- ✅ PCI-DSS compliant
- ✅ Supports ACH (bank transfers) - **0.8% fee, max $5**
- ✅ Recurring payments
- ✅ Webhook support
- ✅ Widely trusted

**Cost Analysis (for $555 transaction):**
- Credit card: $555 × 2.9% + $0.30 = **$16.40 per transaction**
- ACH (bank transfer): $555 × 0.8% = **$4.44 per transaction** (much cheaper!)
- Annual cost (if all 100 users pay by card): $1,640
- **If 50% pay by check, 50% by card:** $820/year

**Pros:**
- ✅ Most developer-friendly API
- ✅ ACH option significantly cheaper
- ✅ Excellent documentation
- ✅ Widely used and trusted

**Cons:**
- ❌ Higher credit card fees than Helcim
- ❌ ACH requires bank account setup (more friction)

---

### 3. **Square**

**Pricing:**
- Online transactions: **2.9% + $0.30** per transaction
- No monthly fees

**Features:**
- ✅ Simple integration
- ✅ PCI-DSS compliant
- ✅ Good for small businesses
- ✅ Free fraud protection

**Cost Analysis (for $555 transaction):**
- Fee: $555 × 2.9% + $0.30 = **$16.40 per transaction**
- Annual cost (if all 100 users pay by card): $1,640

**Pros:**
- ✅ Simple, user-friendly
- ✅ No monthly fees
- ✅ Good customer support

**Cons:**
- ❌ Higher fees than Helcim
- ❌ Less flexible API than Stripe
- ❌ No ACH option

---

### 4. **Payment Depot** (High Volume)

**Pricing:**
- Monthly fee: **$79/month** ($948/year)
- Interchange rates (typically 1.5-2.0%) + $0.08-0.15 per transaction
- No markups on interchange rates

**Features:**
- ✅ Wholesale interchange rates
- ✅ Good for high-volume businesses

**Cost Analysis:**
- Monthly fee: $79
- Transaction fee: ~$555 × 1.8% + $0.10 = ~$10.09 per transaction
- Annual cost: $948 (fees) + $1,009 (transactions) = **$1,957/year**
- **Only cost-effective if processing >$10,000/month**

**Pros:**
- ✅ Lowest per-transaction rates (for high volume)

**Cons:**
- ❌ Monthly fee makes it expensive for low volume
- ❌ Not cost-effective for ~$4,625/month

---

### 5. **Stax** (Subscription Model)

**Pricing:**
- Monthly fee: **$99/month** ($1,188/year)
- Interchange + $0.08 per transaction

**Cost Analysis:**
- Monthly fee: $99
- Transaction fee: ~$555 × 1.8% + $0.08 = ~$10.07 per transaction
- Annual cost: $1,188 (fees) + $1,007 (transactions) = **$2,195/year**

**Pros:**
- ✅ Low per-transaction rates

**Cons:**
- ❌ High monthly fee
- ❌ Not cost-effective for this volume

---

### 6. **Gravity Payments (ChargeItPro)** (Current Provider) ⚠️

**Status:** **ACTUAL FEE DATA AVAILABLE** - Web integration still needs investigation

**Current Usage:**
- Manual entry via web portal
- PCI-DSS compliant
- EMV-capable
- Merchant Number: 5179245100183930
- Customer Service: 1-800-989-2135

**ACTUAL FEE STRUCTURE (from January 2025 statement):**
- **Total Sales:** $4,995.00 (9 transactions, mostly $555 each)
- **Total Fees:** $173.59
- **Effective Rate:** **3.48%** ($173.59 / $4,995.00)
- **Amount Funded:** $4,821.41

**Fee Breakdown:**
- **Interchange Fees (varies by card type):**
  - AMEX: ~2.35% + $0.10 per transaction
  - Mastercard: ~2.65% + $0.10 per transaction
  - Visa: ~2.50-2.80% + $0.10 per transaction
- **Fixed Fees per Transaction:** $0.10-$0.21
- **Monthly Fees (Active Months):**
  - Statement Fee: $12.00/month
  - Regulatory Fee: $4.95/month
  - Association Compliance Fee: $0.50/month
  - Location Fee: $1.00/month
  - Other miscellaneous fees: ~$1.60/month
  - **Total Active Monthly Fees:** ~$20.05/month
- **Monthly Fees (Inactive Months):**
  - **Inactive Fee: $16.00/month** ⚠️ **CHARGED EVEN WHEN NO TRANSACTIONS**
  - This is critical: Since billing is annual (Jan-Mar), you pay $16/month × 9 months = **$144/year** for inactive months

**Cost Analysis (for $555 transaction):**
- Average fee per $555 transaction: ~$19.29 ($173.59 / 9 transactions)
- **Effective rate: 3.48%** (higher than alternatives)
- **Annual Transaction Fees:** ~$1,929 (if all 100 users pay by card)
- **Active Month Fees:** ~$20.05 × 3 months (Jan-Mar) = $60.15
- **Inactive Month Fees:** $16.00 × 9 months (Apr-Dec) = **$144.00** ⚠️
- **Total Annual Cost:** $1,929 + $60.15 + $144.00 = **$2,133.15/year**

**Web Integration Status:** ⚠️ **NEEDS INVESTIGATION**
- ❓ Web API availability
- ❓ Payment gateway integration
- ❓ Hosted payment page options
- ❓ Developer documentation

**Action Required:**
1. **Contact Gravity Payments support (1-800-989-2135)** to ask about:
   - Web API or payment gateway integration
   - Hosted payment page options
   - Developer documentation
   - Whether online payments have different fee structure

**If Gravity Payments has web integration:**
- ✅ Maintain existing relationship
- ✅ Familiar system
- ⚠️ **Higher fees than alternatives** (3.48% vs 2.38-2.9%)
- ⚠️ Monthly fixed fees ($20/month)

**If Gravity Payments lacks web integration:**
- ❌ Cannot use for automated billing system
- ❌ Would need to switch providers
- 💰 **Cost savings opportunity:** Switching could save $1,000-1,500/year

---

## Cost Comparison Summary

**Assumptions:**
- 100 users × $555/year = $55,500 annual revenue
- Scenario A: 50% pay by check (with $15 discount), 50% pay by credit card
- Scenario B: 30% pay by check, 70% pay by credit card

| Processor | Fee Structure | Scenario A Cost | Scenario B Cost | Notes |
|-----------|--------------|-----------------|-----------------|-------|
| **Stripe (ACH)** | 0.8% (max $5) | **$222/year** | **$311/year** | ⭐⭐ Cheapest if users accept |
| **Helcim** | 2.38% + $0.25 | **$673/year** | **$942/year** | ⭐ Lowest card fees |
| **Stripe (Card)** | 2.9% + $0.30 | $820/year | $1,148/year | Industry standard |
| **Square** | 2.9% + $0.30 | $820/year | $1,148/year | Simple but higher fees |
| **Gravity Payments** | 3.48% + fees | **$1,930/year** | **$2,133/year** | ⚠️ Current provider, higher fees + $144/year inactive fees |
| **Payment Depot** | $79/mo + ~1.8% | $1,957/year | $1,957/year | Too expensive for volume |
| **Stax** | $99/mo + ~1.8% | $2,195/year | $2,195/year | Too expensive for volume |

---

## Recommendations

### **Option 1: Helcim + Check Discount** ⭐ **RECOMMENDED**

**Strategy:**
- Offer $15 discount for check payments ($540 vs $555)
- Use Helcim for credit card payments (lowest fees)
- Encourage check payments to minimize fees

**Annual Cost:**
- If 50% pay by check: **$673/year** in processing fees
- If 70% pay by check: **$404/year** in processing fees

**Pros:**
- ✅ Lowest credit card processing fees
- ✅ Check discount incentivizes lower-cost payment method
- ✅ Excellent API for integration
- ✅ No monthly fees

**Cons:**
- ⚠️ Less well-known than Stripe (but reputable)

---

### **Option 2: Stripe ACH + Check Discount** ⭐⭐ **BEST VALUE**

**Strategy:**
- Offer $15 discount for check payments ($540 vs $555)
- Offer Stripe ACH (bank transfer) as alternative to credit cards
- ACH fees: 0.8% (max $5) = **$4.44 per $555 transaction**

**Annual Cost:**
- If 50% pay by check, 50% by ACH: **$222/year** in processing fees
- If 30% pay by check, 70% by ACH: **$311/year** in processing fees

**Pros:**
- ✅ **Lowest overall fees** (even cheaper than checks if considering processing time)
- ✅ Excellent API and documentation
- ✅ Widely trusted
- ✅ Automated (no manual check processing)

**Cons:**
- ⚠️ Requires users to provide bank account info (may reduce adoption)
- ⚠️ ACH takes 3-5 business days to process

---

### **Option 3: Gravity Payments (If Web Integration Available)** ⚠️

**Strategy:**
- Investigate Gravity Payments web integration capabilities
- If available, maintain existing relationship
- **However:** Higher fees than alternatives (3.48% vs 2.38-2.9%)

**Current Fee Structure:**
- Effective rate: **3.48%** (from actual statement)
- **Active month fees:** ~$20/month (Jan-Mar when processing)
- **Inactive month fees:** **$16/month** (Apr-Dec when no transactions) ⚠️
- **Total fixed fees:** ~$60 (active) + $144 (inactive) = **$204/year**
- Annual cost: ~$1,930-2,133/year (depending on payment mix)

**Cost Comparison:**
- **More expensive than Helcim:** ~$1,250-1,500/year more
- **More expensive than Stripe:** ~$1,100-1,350/year more
- **More expensive than Stripe ACH:** ~$1,700-1,900/year more
- **Key Issue:** Paying $144/year for 9 months of inactivity (no value received)

**Action Required:**
- Contact Gravity Payments support (1-800-989-2135) immediately
- Ask about web API, hosted payment pages, integration options
- **Consider:** Even if web integration available, switching could save $1,000-1,500/year

**Recommendation:** Only use Gravity Payments if:
1. They offer web integration AND
2. You prioritize maintaining existing relationship over cost savings
3. Otherwise, switching to Helcim or Stripe ACH would save significant money

---

## Implementation Considerations

### **Check Discount Strategy**

**Recommended Discount:** $15 (2.7% off)
- **Rationale:** Covers typical credit card processing fees (~2.7-2.9%)
- **User Benefit:** Clear savings incentive
- **Business Benefit:** Eliminates processing fees for check payments

**Display Example:**
```
Annual Maintenance Fee: $555/year

Payment Options:
✓ Pay Online (Credit Card): $555/year
✓ Pay by Check: $540/year (Save $15)
```

### **User Communication**

**Key Messages:**
1. "Save $15 by paying by check"
2. "Online payment available for convenience"
3. "Both options are secure and easy"

---

## Next Steps

1. **Immediate:** Contact Gravity Payments (1-800-989-2135) to investigate web integration
   - Ask about web API or hosted payment pages
   - Ask about developer documentation
   - Verify if online payments have different fee structure

2. **Cost-Benefit Analysis:**
   - **If Gravity Payments has web integration:** 
     - Cost: ~$1,930-2,133/year
     - **Inactive fees:** $144/year (9 months × $16/month) ⚠️
     - Benefit: Maintain existing relationship
     - **Trade-off:** Pay $1,000-1,500/year more than alternatives + $144/year for inactivity
   
   - **If switching to Helcim:**
     - Cost: ~$673-942/year
     - Savings: ~$1,000-1,500/year
     - Benefit: Lower fees, excellent API
   
   - **If switching to Stripe ACH:**
     - Cost: ~$222-311/year
     - Savings: ~$1,700-1,900/year
     - Benefit: Lowest fees, excellent API

3. **Decision:** Choose processor based on:
   - API availability (required for automation)
   - Fee structure (cost savings opportunity)
   - Integration ease
   - User experience
   - **Cost-benefit of maintaining vs switching**

4. **Implementation:** 
   - Set up chosen payment processor
   - Implement check discount logic
   - Build payment integration
   - Test thoroughly

---

## Questions to Answer

1. **Gravity Payments:** Do they offer web API or hosted payment pages? (Contact: 1-800-989-2135)
2. **Cost-Benefit:** Is maintaining Gravity Payments relationship worth $1,000-1,500/year extra cost?
3. **User Preference:** Will users accept ACH (bank transfer) as payment option?
4. **Check Processing:** How much time/effort does manual check processing cost?
5. **Timeline:** When do we need this live? (Target: Before next January 1st billing?)

---

## Conclusion

### **RECOMMENDED: Stripe + Check Discount** ⭐⭐

**Why Stripe:**
1. **Easiest to Use:**
   - Best API documentation and developer support
   - Extensive code examples and tutorials
   - Large developer community (easy troubleshooting)
   - Pre-built UI components (Stripe Elements)
   - Excellent debugging tools

2. **Cost-Effective:**
   - **Stripe Card:** $820-1,148/year (vs Gravity $1,930-2,170/year)
   - **Stripe ACH:** $222-311/year (vs Gravity $1,930-2,170/year) ⭐⭐
   - **Savings: $1,100-1,900/year** compared to Gravity Payments

3. **Best Integration:**
   - Works seamlessly with Firebase
   - Webhook support for payment confirmations
   - Hosted payment pages (no PCI compliance needed)
   - Recurring payment support

**Implementation Approach:**
- **Phase 1:** Start with Stripe Card (2.9% + $0.30) - familiar to users
- **Phase 2:** Add Stripe ACH option (0.8%, max $5) - offer as "save even more" option
- **Always:** Offer $15 check discount ($540 vs $555)

**Alternative: Helcim** (if prioritizing absolute lowest fees)
- Lower fees than Stripe ($673-942/year vs $820-1,148/year)
- But slightly more complex to integrate
- Smaller developer community

**Current Provider (Gravity Payments):** ❌ **NOT RECOMMENDED**
- **Higher fees:** 3.48% effective rate vs 2.9% (Stripe) or 2.38% (Helcim)
- **Annual cost:** ~$1,930-2,133/year
- **Inactive month fees:** **$16/month × 9 months = $144/year** ⚠️ **PAYING FOR NOTHING**
- **Web integration:** Status unknown
- **Recommendation:** **Switch to Stripe** - easier to use AND saves $1,100-1,900/year

**Key Insight:** 
- **Stripe is the clear winner** for "easiest + least expensive"
- **Gravity Payments charges $144/year for 9 months of inactivity** (no transactions = no value)
- **Stripe has ZERO monthly fees** - only pay when processing payments
- Switching from Gravity Payments saves $1,100-1,900/year
- Stripe's ease of use outweighs small fee difference vs Helcim
- **For annual billing cycle, Stripe's pay-per-transaction model is MUCH better than Gravity's monthly fees**

