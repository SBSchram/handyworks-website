"""
Evidence Analysis Framework for Accreditation Review
Purpose: Systematically examine documents and identify evidence present, assess sufficiency,
and identify gaps to assist commissioners in decision-making.

Role: Evidence analyst - provides information, does not make decisions
"""
import PyPDF2
from pathlib import Path
import re
from datetime import datetime
from collections import defaultdict

# Paths
PDF_DIR = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments")

# Commission findings - requirements structure
COMMISSION_FINDINGS = {
    "2.05": {
        "finding": "non-compliant based on insufficient evidence that the institution fully follows its policies to comply with all relevant federal laws and regulations",
        "required_evidence": {
            "Training Materials": {
                "Title IX": "Actual training materials for Title IX (sex-based discrimination)",
                "HIPAA": "Actual training materials for HIPAA (privacy protection of patients' health records)",
                "FERPA": "Actual training materials for FERPA (privacy protection of student academic records)",
                "OSHA": "Actual training materials for OSHA (occupational safety and health)"
            },
            "Training Completion": "Evidence that all relevant stakeholders complete required compliance trainings",
            "Staff Qualifications": "Evidence that staff members responsible for overseeing compliance are appropriately qualified"
        }
    },
    "2.06": {
        "finding": "non-compliant based on insufficient evidence that the institution fully follows its policies to comply with all relevant state laws and regulations",
        "required_evidence": {
            "Training Materials": {
                "Cal/OSHA": "Actual training materials for Cal/OSHA (state occupational safety and health)"
            },
            "Training Completion": "Evidence that all relevant stakeholders complete required compliance trainings",
            "Staff Qualifications": "Evidence that staff members responsible for overseeing compliance are appropriately qualified"
        }
    },
    "2.07": {
        "finding": "non-compliant based on insufficient evidence that the institution has qualified staff to monitor ongoing compliance with all local and municipal laws, ordinances, codes, and regulatory requirements",
        "required_evidence": {
            "Staff Qualifications": "Evidence that staff members responsible for overseeing compliance with local regulations are appropriately qualified",
            "Ongoing Process": "Evidence that an ongoing process is followed to ensure continuous compliance"
        }
    },
    "5.02": {
        "finding": "non-compliant based on insufficient evidence that all students are meeting all program admissions requirements at the time of enrollment, including English language proficiency and undergraduate credit requirements",
        "required_evidence": {
            "Policy": "Policy document establishing admissions requirements",
            "Audit Results": "Results of institutional file audits demonstrating all admitted students met requirements",
            "Staff Training": "Evidence of staff training to ensure all admitted students meet requirements"
        }
    },
    "7.01": {
        "finding": "non-compliant based on insufficient evidence that the program has developed appropriate course prerequisites and that students have completed all prerequisites prior to enrollment",
        "required_evidence": {
            "Prerequisites Defined": "Evidence that the program has appropriate course prerequisites",
            "Completion Verified": "Evidence that students have completed all prerequisites prior to enrollment"
        }
    },
    "8.01": {
        "finding": "non-compliant based on insufficient evidence that the program employs an identifiable core group of qualified faculty members",
        "required_evidence": {
            "Core Faculty Identified": "Evidence that the program clearly identifies a core group of faculty",
            "Job Descriptions": "Executed job descriptions for core faculty outlining required roles and responsibilities",
            "Fulfillment Evidence": "Meeting minutes demonstrating that core faculty are fulfilling their responsibilities"
        }
    },
    "9.02": {
        "finding": "non-compliant based on insufficient evidence that the institution is financially stable with resources sufficient to ensure long-term viability, support mission, fund programs, and respond to financial emergencies",
        "required_evidence": {
            "Q2 2025 Report": "Quarterly financial report for 2025 Q2 with narrative interpretations of Budget vs. Actual, Balance Sheet, Income Statement, Cash Flow Statement",
            "Q3 2025 Report": "Quarterly financial report for 2025 Q3 with narrative interpretations of Budget vs. Actual, Balance Sheet, Income Statement, Cash Flow Statement",
            "Financial Plan": {
                "Board Approval": "Financial plan approved by governing board",
                "Related Party": "Addresses related party transactions",
                "Illiquid Assets": "Addresses illiquid assets (receivables from shareholder)",
                "Negative Equity": "Addresses negative shareholder's equity",
                "Low Cash": "Addresses low cash balances due to shareholder distributions"
            }
        }
    }
}

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF."""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        return None

def find_documents_for_standard(standard_num, pdf_files):
    """
    Find documents related to a standard using flexible pattern matching.
    Handles different naming conventions:
    - VU style: EX2.05.1, EX9.01.1
    - AAHW/NUHS style: 2.1, 2.2, 2.05, 2.06
    - AIMC style: 5.2.A, 10.A.1
    - Without prefix: 2.07.1
    """
    import re
    relevant_docs = []
    seen_files = set()  # Track files we've already added to avoid duplicates
    
    # Convert standard number to search patterns
    std_str = str(standard_num)
    patterns = []
    
    # EX prefix pattern (VU style) - most specific, check first
    patterns.append(("EX" + std_str, True))  # (pattern, must_start)
    
    # Special case: Standard 9.02 may have documents labeled EX9.01 or EX9.02 (financial documents)
    if standard_num == "9.02":
        patterns.append(("EX9.01", True))
        patterns.append(("EX9.02", True))
    
    # Direct numeric pattern (AAHW/NUHS style) - can start filename
    patterns.append((std_str, True))
    
    # Pattern without leading zero (2.5 instead of 2.05) - ONLY for standards like 2.05, 2.06, etc.
    # But NOT for 9.02 -> 9.2 (those are different standards)
    # Only apply this for standards where the second part is 0X (e.g., 2.05, 5.02)
    if '.' in std_str:
        parts = std_str.split('.')
        if len(parts) == 2 and parts[1].startswith('0') and len(parts[1]) == 2:
            # Only for 2.05, 5.02 style - not for 9.02 (9.2 is a different standard)
            # Generally, if first part is < 9, it's safe to strip leading zero
            if int(parts[0]) < 9:
                patterns.append((f"{parts[0]}.{parts[1][1:]}", True))  # 2.05 -> 2.5
    
    # Pattern matching in filename
    for pdf_file in pdf_files:
        if pdf_file in seen_files:
            continue
            
        filename = pdf_file.name
        filename_lower = filename.lower()
        matched = False
        
        # Check each pattern
        for pattern, must_start in patterns:
            pattern_lower = pattern.lower()
            
            # Most precise: filename starts with pattern
            if must_start and filename_lower.startswith(pattern_lower):
                relevant_docs.append(pdf_file)
                seen_files.add(pdf_file)
                matched = True
                break
            
            # Less precise: pattern appears at word boundary (but not as part of larger number)
            if not must_start:
                # Match pattern with word boundaries, ensuring it's not part of another number
                # e.g., match "2.05" but not "2.05" within "2.057"
                pattern_escaped = re.escape(pattern_lower)
                # Match at start or after non-digit/non-dot, before non-digit
                if re.search(r'(^|[^0-9.])' + pattern_escaped + r'([^0-9]|\.\d|$)', filename_lower):
                    relevant_docs.append(pdf_file)
                    seen_files.add(pdf_file)
                    matched = True
                    break
        
        # Special keyword-based matching for standards (only if no pattern match)
        # This is a fallback for content-based matching when filename patterns don't work
        if not matched:
            if standard_num == "2.05":
                # Federal compliance: Title IX, HIPAA, FERPA, OSHA
                # Only match if filename contains compliance keywords AND no conflicting standard number
                has_compliance_keywords = any(kw in filename_lower for kw in ['ferpa', 'hipaa', 'title ix', 'title 9', 'osha'])
                # Don't match if filename clearly indicates a different standard (e.g., "2.07 OSHA")
                conflicting_std = re.search(r'\b2\.(0[1-4]|0[6-9]|[1-9][0-9])\b', filename_lower)
                if has_compliance_keywords and not conflicting_std:
                    relevant_docs.append(pdf_file)
                    seen_files.add(pdf_file)
            elif standard_num == "2.06":
                # State compliance: Cal/OSHA (not federal OSHA)
                # Must have Cal/OSHA specifically, not just OSHA
                has_calosha = any(kw in filename_lower for kw in ['calosha', 'cal-osha', 'cal osha'])
                # Don't match if it's clearly for 2.05 (federal OSHA) - check for EX2.05 or 2.05
                is_federal = 'ex2.05' in filename_lower or filename_lower.startswith('2.05')
                conflicting_std = re.search(r'\b2\.(0[1-5]|0[7-9]|[1-9][0-9])\b', filename_lower)
                if has_calosha and not conflicting_std and not is_federal:
                    relevant_docs.append(pdf_file)
                    seen_files.add(pdf_file)
            elif standard_num == "9.02":
                # Financial stability documents - match EX9.01 or EX9.02 (already handled above)
                # Additional content-based matching only for filenames that don't match patterns
                # This is a fallback - primary matching is done via EX9.01/EX9.02 patterns above
                pass
            elif standard_num == "2.06":
                # Look for state compliance keywords
                if any(keyword in filename_lower for keyword in ['calosha', 'cal-osha']) and '2.06' in filename:
                    relevant_docs.append(pdf_file)
                    seen_files.add(pdf_file)
            elif standard_num == "9.02":
                # Look for financial keywords with standard number context
                if (any(keyword in filename_lower for keyword in ['financial', 'budget']) and 
                    ('9.02' in filename or '9.2' in filename or '9.' in filename_lower[:5])):
                    relevant_docs.append(pdf_file)
                    seen_files.add(pdf_file)
    
    return relevant_docs

def check_evidence_item(text, filename, evidence_key, evidence_description):
    """
    Generic evidence checking function - uses both keyword matching and filename context.
    Returns: dict with found status, supporting details, and confidence level
    """
    if not text:
        return {"found": False, "reason": "Document unreadable", "confidence": "NONE"}
    
    text_lower = text.lower()
    filename_lower = filename.lower()
    
    # Build REQUIRED terms that must be present (specific to evidence type)
    required_terms = []
    context_terms = []
    
    # Specific law/regulation matching - must be exact
    if "title ix" in evidence_key.lower() or "title ix" in evidence_description.lower():
        required_terms.extend(["title ix", "title 9"])
        context_terms.append("sexual harassment")
    if "ferpa" in evidence_key.lower() or "ferpa" in evidence_description.lower():
        required_terms.append("ferpa")
        context_terms.extend(["family educational rights", "student records"])
    if "hipaa" in evidence_key.lower() or "hipaa" in evidence_description.lower():
        required_terms.append("hipaa")
        context_terms.extend(["health insurance portability", "patient privacy", "phi"])
    if "osha" in evidence_key.lower() or "osha" in evidence_description.lower() or "calosha" in evidence_key.lower():
        required_terms.extend(["osha", "calosha"])
        context_terms.append("occupational safety")
    
    # Evidence type matching
    if "training material" in evidence_description.lower():
        context_terms.extend(["training", "material", "manual"])
    if "qualification" in evidence_key.lower() or "qualified" in evidence_description.lower():
        context_terms.extend(["qualification", "education", "degree", "experience", "resume", "cv"])
    if "complete" in evidence_key.lower() or "completion" in evidence_description.lower():
        context_terms.extend(["complete", "completed", "certificate"])
    if "audit" in evidence_key.lower() or "audit" in evidence_description.lower():
        required_terms.append("audit")
    if "policy" in evidence_key.lower() or "policy" in evidence_description.lower():
        context_terms.append("policy")
    if "prerequisite" in evidence_key.lower() or "prerequisite" in evidence_description.lower():
        required_terms.append("prerequisite")
    if "financial" in evidence_key.lower() or "financial" in evidence_description.lower():
        context_terms.extend(["financial", "budget", "balance sheet", "income statement", "cash flow"])
    if "q2" in evidence_key.lower():
        required_terms.extend(["q2", "second quarter", "quarter 2"])
    if "q3" in evidence_key.lower():
        required_terms.extend(["q3", "third quarter", "quarter 3"])
    if "board" in evidence_key.lower() or "board" in evidence_description.lower():
        context_terms.extend(["board", "governing", "approved", "approval"])
    if "related party" in evidence_key.lower() or "related party" in evidence_description.lower():
        required_terms.extend(["related party", "related-party"])
    if "receivable" in evidence_key.lower() or "shareholder" in evidence_key.lower():
        context_terms.extend(["receivable", "shareholder"])
    if "equity" in evidence_key.lower() or "equity" in evidence_description.lower():
        context_terms.extend(["equity", "shareholder", "deficit"])
    
    # Check filename first for strong indicators
    filename_match = False
    for term in required_terms:
        if term in filename_lower:
            filename_match = True
            break
    
    # Check text content
    required_found = 0
    if required_terms:
        required_found = sum(1 for term in required_terms if term in text_lower)
        required_present = required_found > 0
    else:
        required_present = True  # If no specific required terms, base on context
    
    context_found = sum(1 for term in context_terms if term in text_lower)
    context_present = context_found > 0 if context_terms else True
    
    # Determine confidence
    if not required_present and not filename_match:
        return {"found": False, "reason": "Required terms not found", "confidence": "NONE"}
    
    if filename_match and required_present:
        confidence = "HIGH"
    elif required_present and context_present:
        confidence = "MEDIUM"
    elif filename_match or required_present:
        confidence = "LOW"
    else:
        confidence = "NONE"
        return {"found": False, "reason": "Insufficient evidence", "confidence": "NONE"}
    
    reason_parts = []
    if filename_match:
        reason_parts.append("filename match")
    if required_found > 0:
        reason_parts.append(f"{required_found} required term(s) found")
    if context_found > 0:
        reason_parts.append(f"{context_found} context term(s) found")
    
    return {
        "found": True,
        "reason": "; ".join(reason_parts) if reason_parts else "Evidence identified",
        "confidence": confidence
    }

def analyze_standard_evidence(standard_num, documents, commission_findings=None):
    """
    Analyze all documents for a standard against required evidence.
    Returns: dict with evidence present, gaps, and document-by-document analysis
    
    Args:
        standard_num: Standard number (e.g., "2.05")
        documents: List of Path objects for PDF documents
        commission_findings: Dict of findings (defaults to COMMISSION_FINDINGS)
    """
    if commission_findings is None:
        commission_findings = COMMISSION_FINDINGS
    
    finding_info = commission_findings.get(standard_num)
    if not finding_info:
        return {"error": f"Standard {standard_num} not found in findings"}
    
    required = finding_info["required_evidence"]
    results = {
        "standard": standard_num,
        "finding": finding_info["finding"],
        "evidence_by_requirement": {},
        "document_analyses": [],
        "summary": {
            "evidence_present": [],
            "evidence_missing": [],
            "gaps": []
        }
    }
    
    # Flatten required evidence structure for systematic checking
    def flatten_requirements(req_dict, prefix=""):
        """Recursively flatten nested requirement dictionaries."""
        flat = {}
        for key, value in req_dict.items():
            new_key = f"{prefix}.{key}" if prefix else key
            if isinstance(value, dict):
                flat.update(flatten_requirements(value, new_key))
            else:
                flat[new_key] = value
        return flat
    
    flat_requirements = flatten_requirements(required)
    
    # Analyze each document
    for doc_path in documents:
        filename = doc_path.name
        text = extract_text_from_pdf(doc_path)
        
        doc_analysis = {
            "filename": filename,
            "readable": text is not None,
            "text_length": len(text) if text else 0,
            "evidence_identified": []
        }
        
        if text:
            # Check each required evidence item
            for req_key, req_description in flat_requirements.items():
                check_result = check_evidence_item(text, filename, req_key, req_description)
                if check_result["found"]:
                    doc_analysis["evidence_identified"].append({
                        "requirement": req_key,
                        "description": req_description,
                        "confidence": check_result["confidence"],
                        "reason": check_result["reason"]
                    })
        
        results["document_analyses"].append(doc_analysis)
    
    # Aggregate evidence across all documents
    for req_key, req_description in flat_requirements.items():
        found_in_docs = []
        for doc_analysis in results["document_analyses"]:
            if not doc_analysis["readable"]:
                continue
            for evidence in doc_analysis["evidence_identified"]:
                if evidence["requirement"] == req_key:
                    found_in_docs.append({
                        "document": doc_analysis["filename"],
                        "confidence": evidence["confidence"]
                    })
        
        if found_in_docs:
            results["evidence_by_requirement"][req_key] = {
                "description": req_description,
                "found": True,
                "supporting_documents": found_in_docs
            }
            results["summary"]["evidence_present"].append(req_key)
        else:
            results["evidence_by_requirement"][req_key] = {
                "description": req_description,
                "found": False,
                "supporting_documents": []
            }
            results["summary"]["evidence_missing"].append(req_key)
    
    # Identify gaps
    for req_key in results["summary"]["evidence_missing"]:
        results["summary"]["gaps"].append({
            "requirement": req_key,
            "description": flat_requirements[req_key],
            "status": "MISSING"
        })
    
    return results

def generate_evidence_report(pdf_dir=None, commission_findings=None, school_name="Institution"):
    """
    Generate comprehensive evidence analysis report for all standards.
    
    Args:
        pdf_dir: Path to directory containing PDFs (defaults to PDF_DIR)
        commission_findings: Dict of findings (defaults to COMMISSION_FINDINGS)
        school_name: Name of the school/institution for the report header
    """
    if pdf_dir is None:
        pdf_dir = PDF_DIR
    
    if commission_findings is None:
        commission_findings = COMMISSION_FINDINGS
    
    print("="*80)
    print("EVIDENCE ANALYSIS REPORT")
    print(f"{school_name} - Supplemental Report Review")
    print("Prepared for Commission Review")
    print("="*80)
    print(f"\nAnalysis Date: {datetime.now().strftime('%B %d, %Y')}")
    print(f"Source Directory: {pdf_dir}\n")
    print("NOTE: This analysis identifies evidence present and gaps.")
    print("Commissioners should review actual documents to verify findings.\n")
    
    all_results = {}
    
    # Collect all PDF files once
    pdf_files = set()
    for f in pdf_dir.glob('*.pdf'):
        pdf_files.add(f)
    for f in pdf_dir.glob('*.PDF'):
        pdf_files.add(f)
    pdf_files = sorted(pdf_files)
    
    for standard_num in commission_findings.keys():
        print(f"\n{'='*80}")
        print(f"STANDARD {standard_num}")
        print(f"{'='*80}\n")
        
        finding_info = commission_findings[standard_num]
        print(f"Commission Finding: {finding_info['finding']}\n")
        print("Required Evidence:")
        # Print requirements in structured way
        def print_requirements(req_dict, indent=0):
            for key, value in req_dict.items():
                prefix = "  " * (indent + 1) + "- "
                if isinstance(value, dict):
                    print(f"{prefix}{key}:")
                    print_requirements(value, indent + 1)
                else:
                    print(f"{prefix}{value}")
        print_requirements(finding_info['required_evidence'])
        
        # Find relevant documents using flexible pattern matching
        relevant_docs = find_documents_for_standard(standard_num, sorted(pdf_files))
        
        if not relevant_docs:
            print(f"\n  [NO DOCUMENTS FOUND]")
            print(f"  STATUS: All required evidence appears to be missing.")
            all_results[standard_num] = {"status": "NO_DOCUMENTS"}
            continue
        
        print(f"\nDocuments Provided ({len(relevant_docs)}):")
        for doc in relevant_docs:
            print(f"  - {doc.name}")
        
        # Analyze evidence (pass findings as parameter)
        analysis = analyze_standard_evidence(standard_num, relevant_docs, commission_findings)
        all_results[standard_num] = analysis
        
        print(f"\n{'-'*80}")
        print("EVIDENCE ANALYSIS")
        print(f"{'-'*80}\n")
        
        # Evidence present
        if analysis["summary"]["evidence_present"]:
            print("Evidence PRESENT:")
            for req_key in analysis["summary"]["evidence_present"]:
                req_info = analysis["evidence_by_requirement"][req_key]
                print(f"  [PRESENT] {req_info['description']}")
                if req_info["supporting_documents"]:
                    docs_list = ", ".join([d["document"] for d in req_info["supporting_documents"][:3]])
                    print(f"    Found in: {docs_list}")
        else:
            print("Evidence PRESENT: None identified")
        
        # Gaps
        print(f"\nGAPS IDENTIFIED:")
        if analysis["summary"]["gaps"]:
            for gap in analysis["summary"]["gaps"]:
                print(f"  [MISSING] {gap['description']}")
                print(f"    Status: {gap['status']}")
        else:
            print("  None - all required evidence appears to be present in provided documents")
        
        # Document details
        print(f"\n{'-'*80}")
        print("DOCUMENT-BY-DOCUMENT SUMMARY")
        print(f"{'-'*80}\n")
        for doc_analysis in analysis["document_analyses"]:
            print(f"Document: {doc_analysis['filename']}")
            if not doc_analysis['readable']:
                print(f"  Status: UNREADABLE - Physical review required")
            elif doc_analysis['evidence_identified']:
                print(f"  Contains evidence for: {len(doc_analysis['evidence_identified'])} requirement(s)")
                for evidence in doc_analysis['evidence_identified'][:3]:
                    print(f"    - {evidence['description'][:60]}... ({evidence['confidence']} confidence)")
            else:
                print(f"  Status: No clear evidence identified (may require manual review)")
            print()
    
    print("="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)
    print("\nThis report identifies evidence and gaps based on automated text analysis.")
    print("Commissioners should review actual documents to verify all findings.")
    print("Confidence levels: HIGH = strong match, MEDIUM = good match, LOW = partial match")
    
    return all_results

if __name__ == "__main__":
    results = generate_evidence_report()
