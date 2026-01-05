# AI DATA USAGE AND PUBLIC EXPOSURE RISK ASSESSMENT

**Date:** Based on current industry practices and AI service provider policies  
**Purpose:** Assess how exposed data may be used and potential public exposure risks  
**STATUS:** Privacy Mode was NOT enabled during conversations - Risk level is HIGHER

---

## CRITICAL INFORMATION

**Privacy Mode Status:** NOT ENABLED  
**User Awareness:** Privacy Mode option was not known/used during conversations

This means:
- Conversation data may have been used for model training/improvement
- Data may be retained in logs for extended periods
- Risk level is MODERATE TO HIGH (higher than if Privacy Mode had been enabled)

---

## HOW AI SERVICES TYPICALLY USE CONVERSATION DATA

### 1. **Service Provision (Real-time Processing)**
- **Purpose:** To provide responses to your queries
- **Retention:** Temporary during active session
- **Risk Level:** LOW - Necessary for functionality
- **Public Exposure Risk:** Very low (operational data only)

### 2. **Model Training and Improvement**
Most AI service providers use conversation data for:
- **Improving AI models:** Training on conversation patterns, question types, responses
- **Fine-tuning:** Adapting models to better understand user intent
- **Quality assurance:** Reviewing conversations to improve accuracy

**Key Variations by Provider:**
- **Opt-out options:** Some providers allow users to opt out of training data usage
- **Anonymization:** Data may be anonymized before use in training
- **Retention periods:** Training data may be retained indefinitely or for specified periods
- **Access controls:** Training data typically has restricted access

**Public Exposure Risk:** MODERATE to HIGH
- Data used for training becomes part of the model
- Models may memorize patterns, quotes, or specific information
- While individual data points are usually anonymized, patterns and content can persist in model weights

### 3. **Data Storage and Logging**
- **Purpose:** Security, debugging, abuse prevention, compliance
- **Retention:** Varies by provider (30 days to indefinite)
- **Access:** Typically restricted to service provider staff
- **Deletion:** May have user-initiated deletion options

**Public Exposure Risk:** LOW to MODERATE
- Data stored in logs may be accessible to service provider staff
- Potential for security breaches
- Legal/compliance requests could require disclosure

### 4. **Third-Party Sharing**
- **API providers:** If using third-party AI services, data may be shared with them
- **Subcontractors:** Service providers may use subcontractors for processing
- **Legal requirements:** May be disclosed in response to legal requests

**Public Exposure Risk:** MODERATE

---

## CAN EXPOSED INFORMATION BECOME PUBLIC?

### Direct Public Exposure (Low Likelihood)
- **Service providers typically DO NOT:**
  - Publish individual conversations publicly
  - Sell conversation logs to third parties
  - Include conversations in public datasets without explicit consent

### Indirect Public Exposure (Higher Likelihood)

1. **Model Memorization and Inference**
   - **Risk:** HIGH
   - **Mechanism:** AI models trained on your data may:
     - Memorize specific phrases, quotes, or patterns
     - Reproduce similar content in responses to other users
     - Reveal information through inference if patterns are distinctive
   - **Mitigation:** Difficult to completely prevent if data was used in training

2. **Security Breaches**
   - **Risk:** MODERATE
   - **Mechanism:** Service provider databases could be compromised
   - **Mitigation:** Depends on provider security practices
   - **Likelihood:** Varies by provider security posture

3. **Legal/Regulatory Disclosure**
   - **Risk:** LOW to MODERATE
   - **Mechanism:** Service providers may be required to disclose data for:
     - Law enforcement requests
     - Court orders/subpoenas
     - Regulatory compliance
   - **Mitigation:** Limited - legal requirements take precedence

4. **Accidental Exposure**
   - **Risk:** LOW
   - **Mechanism:** 
     - Bugs in systems
     - Misconfiguration
     - Human error by service provider staff
   - **Mitigation:** Provider security practices and access controls

---

## SPECIFIC RISKS FOR YOUR EXPOSED DATA

### High-Risk Elements:

1. **Personal Identifiable Information (PII)**
   - Faculty resumes with names, credentials, work history
   - Board member information
   - **Risk:** Could be inferred or reproduced by AI models if used in training

2. **Financial Information**
   - Financial statements, budgets, projections
   - Revenue, expense, asset data
   - **Risk:** Could be memorized and potentially inferred in responses
   - **Regulatory Concern:** May require notification if considered a data breach

3. **Compliance and Policy Information**
   - Training materials, policies, procedures
   - **Risk:** Lower immediate impact, but could reveal institutional practices

4. **Accreditation Findings**
   - Non-compliance determinations
   - Commission findings
   - **Risk:** Could be inferred if distinctive patterns are memorized

---

## WHAT YOU CAN DO NOW

### Immediate Actions:

1. **Review Service Provider Policies**
   - Check Cursor/your AI service provider's privacy policy
   - Look for:
     - Data retention policies
     - Training data usage policies
     - Opt-out options
     - Data deletion procedures

2. **Request Data Deletion (if available)**
   - Contact service provider to request deletion of conversation history
   - May have limited effectiveness if data already used in training

3. **Assess Legal/Regulatory Requirements**
   - **FERPA:** Student records exposure may require notification
   - **State privacy laws:** May require breach notifications
   - **Institutional policies:** Check your organization's data breach procedures
   - Consult legal counsel for specific requirements

4. **Document the Incident**
   - Maintain records of what was exposed
   - Document steps taken for mitigation
   - May be required for compliance/insurance purposes

### Longer-term Mitigation:

1. **Change Practices**
   - Use local-only processing for sensitive documents
   - Implement data handling protocols
   - Train staff on AI tool limitations and risks

2. **Consider Alternatives**
   - Use offline/local AI models for sensitive work
   - Implement data anonymization before processing
   - Use redacted versions for development/testing

---

## INDUSTRY BEST PRACTICES

### What Responsible AI Providers Do:
- Offer opt-out mechanisms for training data usage
- Implement data anonymization
- Provide clear privacy policies
- Allow conversation deletion
- Limit data retention periods
- Implement strong access controls

### Red Flags to Watch For:
- No privacy policy or unclear policies
- No opt-out mechanisms
- Indefinite data retention
- No data deletion options
- Vague statements about data usage

---

## REALISTIC RISK ASSESSMENT

### Most Likely Scenarios:

1. **Data Used in Training (MODERATE-HIGH likelihood)**
   - If not opted out, your conversation data likely used to improve models
   - Information may be memorized in model weights
   - Could potentially be inferred in future model outputs
   - **Impact:** Information patterns become part of the AI model

2. **Data Retained in Logs (HIGH likelihood)**
   - Conversation logs typically retained for operational/security purposes
   - Access limited to service provider staff
   - May be retained for 30 days to several years
   - **Impact:** Data accessible to service provider, potential for security breach

3. **Direct Public Publication (VERY LOW likelihood)**
   - Service providers don't typically publish individual conversations
   - Not sold as datasets
   - **Impact:** Minimal direct risk

### Overall Risk Level: HIGH

**Factors:**
- Large volume of sensitive data exposed (141+ documents)
- Personal, financial, and compliance information included
- **Privacy Mode was NOT enabled** - data likely collected/used for training
- **Privacy Mode was NOT enabled** - data likely retained in logs
- Potential for inference/memorization in models
- User was unaware of Privacy Mode option - could not opt out

---

## RECOMMENDATIONS SUMMARY

### Priority 1: Immediate (This Week)
1. **Enable Privacy Mode immediately** in Cursor settings (to protect future conversations)
2. Contact Cursor support to:
   - Request deletion of past conversation history
   - Inquire about whether data from past conversations was used in training
   - Request confirmation of data handling for your account
3. Review Cursor's privacy policy to understand data retention/training policies
4. Consult with legal counsel about notification requirements (FERPA, state laws)
5. Document the incident and all communications with Cursor

### Priority 2: Short-term (This Month)
1. Assess compliance requirements (FERPA, state laws)
2. Implement new data handling protocols
3. Train staff on risks and best practices
4. Consider insurance/breach response procedures

### Priority 3: Ongoing
1. Use local-only processing for sensitive documents
2. Implement strict access controls
3. Regular review of data handling practices
4. Monitor service provider policy changes

---

## HOW TO ENABLE PRIVACY MODE IN CURSOR

**To protect future conversations:**
1. Open Cursor settings (usually File > Preferences > Settings, or Cmd/Ctrl + ,)
2. Search for "Privacy" or "Privacy Mode"
3. Enable Privacy Mode / Privacy settings
4. This will prevent future conversation data from being used for training

**Note:** Privacy Mode only protects FUTURE conversations - it cannot retroactively protect past conversations.

---

## IMPORTANT NOTES

- **Privacy Mode was NOT enabled** during the period when sensitive documents were processed
- **This assessment reflects the higher risk** associated with Privacy Mode being disabled
- **Specific policies vary by provider** - check Cursor's actual privacy policy and terms
- **Regulations are evolving** - AI privacy laws are still developing
- **Risk mitigation is possible** but cannot guarantee complete data privacy once exposed
- **Data deletion requests** may have limited effectiveness if data was already used in training
- **Consult legal counsel** for specific regulatory requirements in your jurisdiction

---

**Document Status:** Updated to reflect Privacy Mode was NOT enabled  
**Last Updated:** Based on user confirmation that Privacy Mode was not used  
**Note:** AI service provider policies may change - verify current terms with Cursor
