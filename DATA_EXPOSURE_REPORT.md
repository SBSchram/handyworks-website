# DATA EXPOSURE REPORT
## Documents Whose Content Was Transmitted to AI Servers

**Date:** Analysis of conversation transcript  
**Purpose:** Risk mitigation assessment  
**Status:** Complete enumeration of exposed documents

---

## SUMMARY

**Total Documents Exposed:** Approximately 141+ PDF documents had their content processed and transmitted to AI servers during development and testing.

**Primary Exposure Methods:**
1. Bulk extraction via `analyze_pdfs.py` script (ALL 141 PDFs in initial directory)
2. Direct terminal command extraction (specific PDFs with displayed output)
3. Direct file reading via `read_file` tool (1 PDF)
4. Script-generated reports that contained extracted text (subsequently read)

---

## DIRECTORY 1: Background Materials (Initial Analysis)
**Path:** `C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\Background Materials\250813 VU INST-DAcCHM SSR, SVR, FIR Comp Review\attachments`

**Status:** **ALL 141 PDF FILES IN THIS DIRECTORY WERE PROCESSED**

The `analyze_pdfs.py` script was executed and:
- Extracted FULL TEXT from every PDF file in this directory
- Initially wrote all full text to `pdf_analysis_summary.md`
- Generated summaries containing first 500 characters of each document
- The summary document was later read, exposing the extracted content

**This means ALL documents in this directory were exposed, including:**

### Category: Resumes (12 documents)
1. `1. Jeffery Mah's Resume.pdf` - **FULL TEXT EXPOSED** (also accessed separately via terminal)
2. `Jeffery Mah's Resume.pdf` - Full text extracted
3. `Lixin Zhang's Resume.pdf` - Full text extracted
4. `Min Long's Resume.pdf` - Full text extracted
5. `Gyehyang Cha's Resume.pdf` - Full text extracted
6. `William Dawson's Resume.pdf` - Full text extracted
7. `Guang Jin's Resume.pdf` - Full text extracted
8. `Qinhong Zhang's Resume.pdf` - Full text extracted
9. `Donghong Yan's Resume.pdf` - Full text extracted
10. `Yan Li taiji's Resume.pdf` - Full text extracted
11. `Dongji Zhang's Resume.PDF` - Attempted extraction
12. `Lixin Zhang's Resume.pdf` - Full text extracted

### Category: Course Syllabi (21 documents)
ALL 21 course syllabi had full text extracted, including:
- AC101, AC103 (Acupuncture courses)
- CP101-104 (Clinical Practice courses)
- HM101-102, HM104-105 (Herbology courses)
- OM101-104, OM116 (Oriental Medicine courses)
- WM103-105 (Western Medicine courses)
- BS104, PM101, PD-102 (Other courses)

### Category: Exhibits/Supporting Documents (93 documents)
ALL exhibits EX1.01.1 through EX10.05 had full text extracted, including:
- Standard 1 exhibits (Mission, Goals, Strategic Plans, Meeting Minutes)
- Standard 2 exhibits (Legal Status, BPPE Approval, OSHA Compliance)
- Standard 3 exhibits (Governance, Bylaws, Board Minutes, Job Descriptions)
- Standard 4 exhibits (Records Policies - Student, Faculty, Personnel, Patient)
- Standard 5 exhibits (Admissions, Transfers, Credit for Prior Learning)
- Standard 6 exhibits (Curriculum, Assessment, Evaluation)
- Standard 7 exhibits (Program Length, Credit Hours, Clinical Locations)
- Standard 8 exhibits (Faculty Lists, Contracts, Qualifications)
- Standard 9 exhibits (Financial Statements, Budgets, Facilities, Library)
- Standard 10 exhibits (Public Information, Recruiting Materials)

### Category: Enrollment Agreements (2 documents)
1. `Enrollment Agreement (English).pdf` - Full text extracted
2. `Enrollment Agreement (Chinese).pdf` - Full text extracted

### Category: Facility Documents (2 documents)
1. `Main Campus Floor Plan.pdf` - Full text extracted
2. `Satellite Campus Floor Plan.pdf` - Full text extracted

### Category: Review Documents (3 documents)
1. `250608 VU Attendee List.pdf` - Full text extracted
2. `250608 VU Distance Ed Review.pdf` - Full text extracted
3. `250608 VU SVR Summary Table.pdf` - Full text extracted

### Category: Policy Documents (3 documents)
1. `GA1.02 Student Handbook (English).pdf` - **FULL TEXT EXPOSED** (145,254 characters, also accessed separately)
2. `GA1.02 Student Handbook (Chinese).pdf` - Full text extracted (52,090 characters)
3. `GA1.04 Employee Handbook.pdf` - **FULL TEXT EXPOSED** (130,798 characters, also accessed separately)

### Category: Other Documents (5 documents)
1. `250703 VU Act INST-DAcCHM SVR. FIR REQ 250721.pdf` - Full text extracted
2. `GA1.01 Catalog (English).pdf` - Full text extracted (262,171 characters)
3. `GA1.01 Catalog (Chinese).pdf` - Full text extracted (88,467 characters)
4. `GA1.03 Clinical Manual (English).pdf` - **FULL TEXT EXPOSED** (148,451 characters, also accessed separately)
5. `GA1.03 Clinical Manual (Chinese).pdf` - Full text extracted (50,319 characters)

---

## ADDITIONAL DOCUMENTS - Direct Terminal Access

These documents were accessed via terminal commands that displayed output in the conversation:

### Explicitly Accessed via Terminal Commands:

1. **`1. Jeffery Mah's Resume.pdf`**
   - Location: Background Materials directory
   - Exposure: Full text extracted via terminal command (3000+ characters displayed)
   - Content: Personal resume information including education, work history, credentials

2. **`GA1.04 Employee Handbook.pdf`**
   - Location: Background Materials directory
   - Exposure: 
     - First 10 pages extracted and displayed
     - Compliance-related sections (Title IX, HIPAA, OSHA) extracted with context windows
     - Full document text analyzed for compliance keywords
   - Content: Employee policies, compliance training information, Title IX, HIPAA, FERPA, OSHA policies

3. **`GA1.02 Student Handbook.pdf`**
   - Location: Background Materials directory
   - Exposure: First 5 pages extracted and displayed
   - Content: Student policies, FERPA information

4. **`GA1.03 Clinical Manual.pdf`**
   - Location: Background Materials directory
   - Exposure: First 5 pages extracted and displayed
   - Content: Clinical training procedures, Title IX, HIPAA, OSHA information

5. **`EX1.01.3 Staff Minutes.pdf`**
   - Location: Background Materials directory
   - Exposure: 
     - Full document text searched for FERPA content
     - FERPA training sections extracted with 500-1000 character context windows
   - Content: Staff meeting minutes, FERPA training discussion

6. **`EX2.08 OSHA Hazardous.pdf`**
   - Location: Background Materials directory
   - Exposure: Compliance sections extracted with context windows
   - Content: OSHA compliance information, hazardous materials training

---

## DIRECTORY 2: Pre-Accreditation Supplemental Report
**Path:** `C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments`

### Documents Exposed:

1. **`Supplemental Report.pdf`**
   - **EXPOSURE METHOD:** Direct read via `read_file` tool
   - **AMOUNT EXPOSED:** First 100 lines directly read
   - **ADDITIONAL EXPOSURE:** First 3 pages extracted via terminal command (2000 characters displayed)
   - **Content:** Accreditation review findings, commission determinations, institutional responses

2. **`EX9.01.1 Financial Plan.pdf`**
   - **EXPOSURE METHOD:** Terminal command extraction
   - **AMOUNT EXPOSED:** Full document text extracted and displayed
   - **Content:** Financial plans, budgets, financial statements, cash flow projections

---

## EXPOSURE DETAILS BY METHOD

### Method 1: Bulk Script Processing
- **Script:** `analyze_pdfs.py`
- **Files Processed:** ALL 141 PDFs in Background Materials directory
- **Extraction Level:** FULL TEXT from every PDF
- **Output:** Written to `pdf_analysis_summary.md` which contained extracted text
- **Subsequent Access:** The summary file was read, exposing all extracted content

### Method 2: Terminal Command Extraction
- **Files:** 6+ specific PDFs
- **Extraction Level:** Full text or significant portions (pages, sections)
- **Output:** Displayed directly in conversation (terminal output)
- **Impact:** All displayed output became part of conversation transcript

### Method 3: Direct File Reading
- **Files:** 1 PDF (`Supplemental Report.pdf`)
- **Extraction Level:** First 100 lines
- **Method:** `read_file` tool
- **Impact:** Content directly transmitted to AI service

---

## DATA TYPES EXPOSED

The exposed documents contained:

1. **Personal Information:**
   - Faculty and staff resumes (names, education, work history, credentials)
   - Board member information
   - Student and personnel records policies

2. **Financial Information:**
   - Audited financial statements (2022, 2023)
   - Budget plans and projections
   - Cash flow statements
   - Revenue and expense data
   - Asset information
   - Loan information

3. **Institutional Policies:**
   - Employee handbooks
   - Student handbooks
   - Clinical manuals
   - Compliance policies (Title IX, HIPAA, FERPA, OSHA)

4. **Accreditation Materials:**
   - Site visit reports
   - Commission findings
   - Institutional responses
   - Compliance assessments

5. **Operational Information:**
   - Meeting minutes (Board, Faculty, Staff, Student)
   - Curriculum documentation
   - Faculty qualifications
   - Program structure
   - Facility information

---

## RISK ASSESSMENT

**Severity:** HIGH

**Concerns:**
- Full text extraction from 141+ documents
- Personal information (resumes, credentials)
- Financial data (statements, budgets, projections)
- Compliance information (training materials, policies)
- Accreditation review findings and determinations

**Transmission:**
- All content was transmitted to AI service providers as part of conversation history
- Content may be stored in conversation logs
- Content may be used for AI model training (depending on service provider policies)

---

## RECOMMENDATIONS

1. **Immediate Actions:**
   - Review AI service provider data retention and privacy policies
   - Determine if conversation deletion is possible
   - Assess compliance requirements (FERPA, state privacy laws)

2. **Future Mitigation:**
   - Use local-only processing for sensitive documents
   - Avoid displaying extracted content in terminal output
   - Use anonymized or redacted versions for development
   - Implement strict access controls for sensitive directories

3. **Notification Requirements:**
   - Assess whether notification to affected parties is required
   - Review institutional data breach notification policies
   - Consult with legal counsel regarding regulatory requirements

---

## ADDITIONAL DOCUMENTS - Later Analysis Phase

During the framework development phase, PDFs from other schools' directories were referenced in code configuration but were processed LOCALLY by the Python scripts. However, file paths and document names were visible in the conversation:

### NUHS (National University of Health Sciences)
- Excel file path: `260226 NUHS SVR Rev Tbl.xlsx` (path visible, content processed locally)
- **PDF report: `260223 NUHS SSR, SVR, FIR.pdf`**
  - **EXPOSURE:** First 50 pages extracted via terminal command
  - **CONTENT EXPOSED:** Text content searched for Standard 1.03, with 2000+ character context window displayed showing finding details, team findings, and commission findings
  - **Location:** `C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\260223 NUHS SSR, SVR, FIR.pdf`
- PDFs in attachments directory (processed locally, paths visible only)

### AAHW (Academy of Acupuncture and Herbal Medicine)
- Excel file path: `260226 AAHW PR1 INST-MAc-MAcCHM-DAOM REV TBL.xlsx` (path visible)
- PDF report: `250212 AAHW INST-MAc-MAcCHM-DAOM SVR Binder.pdf` (path visible, processed locally)
- PDFs in attachments directory (processed locally, paths visible)

### AIMC (Academy of Integrative Medicine and Health Sciences)
- **PDF: `250212 AIMC Act Ltr GRANT 1.01 Chg of Loc, Not of Con. REQ SV by 251106.pdf`**
  - **EXPOSURE:** First 5 pages extracted via terminal command (1500 characters displayed)
  - **Content:** Change notification letter (grant of accreditation change, location change notification)
  - **Location:** `C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AIMC\260223 AIMC Chg 1.01\attachments\`

**Note:** 
- For AAHW: The analysis scripts processed PDFs locally. Only file paths and document names were transmitted to AI servers, not the actual PDF content.
- For NUHS: PDF content WAS exposed (first 50 pages of the main report PDF, with specific finding details displayed).
- For AIMC: PDF content WAS exposed (first 5 pages of the change notification letter).

---

**Report Generated:** Based on comprehensive transcript analysis  
**Confidence Level:** High - All exposure events documented from conversation history
