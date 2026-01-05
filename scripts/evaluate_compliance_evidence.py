"""
Comprehensive compliance evidence evaluation for Vitality University accreditation review.
This script evaluates supporting documents against specific commission findings to determine
if earlier non-compliance findings can be modified.
"""
import PyPDF2
from pathlib import Path
import re
from datetime import datetime

# Paths
PDF_DIR = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments")
OUTPUT_DIR = Path(r"C:\Users\sbsch\Documents\handyworks-website\Standard_Review_Documents")

# Commission findings - specific requirements for each standard
COMMISSION_FINDINGS = {
    "2.05": {
        "finding": "non-compliant based on insufficient evidence that the institution fully follows its policies to comply with all relevant federal laws and regulations",
        "required_evidence": [
            "Actual training materials for compliance with federal laws: Title IX, HIPAA, FERPA, OSHA",
            "Evidence that all relevant stakeholders complete required compliance trainings",
            "Evidence that staff members responsible for overseeing compliance are appropriately qualified"
        ]
    },
    "2.06": {
        "finding": "non-compliant based on insufficient evidence that the institution fully follows its policies to comply with all relevant state laws and regulations",
        "required_evidence": [
            "Actual training materials for compliance with state laws: Cal/OSHA",
            "Evidence that all relevant stakeholders complete required compliance trainings",
            "Evidence that staff members responsible for overseeing compliance are appropriately qualified"
        ]
    },
    "2.07": {
        "finding": "non-compliant based on insufficient evidence that the institution has qualified staff to monitor ongoing compliance with all local and municipal laws, ordinances, codes, and regulatory requirements",
        "required_evidence": [
            "Evidence that staff members responsible for overseeing compliance with local regulations are appropriately qualified",
            "Evidence that an ongoing process is followed to ensure continuous compliance"
        ]
    },
    "5.02": {
        "finding": "non-compliant based on insufficient evidence that all students are meeting all program admissions requirements at the time of enrollment, including English language proficiency and undergraduate credit requirements",
        "required_evidence": [
            "Policy, template documents, and results of institutional file audits demonstrating all admitted students met requirements",
            "Evidence of staff training to ensure all admitted students meet requirements"
        ]
    },
    "7.01": {
        "finding": "non-compliant based on insufficient evidence that the program has developed appropriate course prerequisites and that students have completed all prerequisites prior to enrollment",
        "required_evidence": [
            "Evidence that the program has appropriate course prerequisites",
            "Evidence that students have completed all prerequisites prior to enrollment"
        ]
    },
    "8.01": {
        "finding": "non-compliant based on insufficient evidence that the program employs an identifiable core group of qualified faculty members",
        "required_evidence": [
            "Evidence that the program clearly identifies a core group of faculty",
            "Executed job descriptions for core faculty outlining required roles and responsibilities",
            "Meeting minutes demonstrating that core faculty are fulfilling their responsibilities"
        ]
    },
    "9.02": {
        "finding": "non-compliant based on insufficient evidence that the institution is financially stable with resources sufficient to ensure long-term viability, support mission, fund programs, and respond to financial emergencies",
        "required_evidence": [
            "Quarterly financial reports for 2025 Q2 and Q3 with narrative interpretations of: Budget vs. Actual, Balance Sheet, Income Statement, Cash Flow Statement",
            "Financial plan approved by governing board addressing: related party transactions, illiquid assets (receivables from shareholder), negative shareholder's equity, low cash balances due to shareholder distributions"
        ]
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
        return f"ERROR: {str(e)}"

def evaluate_document_against_finding(document_path, standard_num, finding_requirements):
    """
    Evaluate a document against specific commission finding requirements.
    Returns: dict with evaluation results
    """
    filename = document_path.name
    text = extract_text_from_pdf(document_path)
    
    if text.startswith("ERROR"):
        return {
            "filename": filename,
            "status": "ERROR",
            "error": text,
            "evidence_found": [],
            "evaluation": "Document could not be read. Physical review required."
        }
    
    text_lower = text.lower()
    filename_lower = filename.lower()
    
    evidence_found = []
    gaps = []
    
    # Standard-specific evaluation logic
    if standard_num == "2.05":
        # Check for training materials
        training_materials = {
            "Title IX": "title ix" in text_lower or "title 9" in text_lower,
            "HIPAA": "hipaa" in text_lower,
            "FERPA": "ferpa" in text_lower,
            "OSHA": "osha" in text_lower
        }
        
        if "training" in filename_lower and "material" in filename_lower:
            for law, found in training_materials.items():
                if found:
                    evidence_found.append(f"Training materials for {law} present")
                else:
                    gaps.append(f"Training materials for {law} not clearly identifiable")
        
        # Check for training completion evidence
        if "training" in filename_lower and ("faculty" in filename_lower or "student" in filename_lower or "staff" in filename_lower):
            evidence_found.append("Training completion documentation for stakeholders")
        
        # Check for compliance officer qualifications
        if "compliance" in filename_lower and "officer" in filename_lower or "resume" in filename_lower:
            if "qualification" in text_lower or "education" in text_lower or "experience" in text_lower:
                evidence_found.append("Compliance officer qualifications documented")
            else:
                gaps.append("Compliance officer qualifications not clearly documented")
    
    elif standard_num == "9.02":
        # Check for quarterly reports
        if "q2" in filename_lower or "q3" in filename_lower or "quarterly" in filename_lower:
            components = {
                "Budget vs. Actual": "budget" in text_lower and "actual" in text_lower,
                "Balance Sheet": "balance sheet" in text_lower or "statement of financial position" in text_lower,
                "Income Statement": "income statement" in text_lower or "profit and loss" in text_lower,
                "Cash Flow": "cash flow" in text_lower
            }
            for component, found in components.items():
                if found:
                    evidence_found.append(f"{component} present")
                else:
                    gaps.append(f"{component} not found")
            
            if "narrative" in text_lower or "interpretation" in text_lower:
                evidence_found.append("Narrative interpretations included")
            else:
                gaps.append("Narrative interpretations not clearly present")
        
        # Check for financial plan addressing concerns
        if "plan" in filename_lower:
            concerns = {
                "Related party transactions": "related party" in text_lower or "related-party" in text_lower,
                "Illiquid assets/receivables": "receivable" in text_lower and "shareholder" in text_lower,
                "Negative equity": "negative" in text_lower and "equity" in text_lower,
                "Low cash balances": "cash" in text_lower and ("low" in text_lower or "distribution" in text_lower)
            }
            for concern, found in concerns.items():
                if found:
                    evidence_found.append(f"Addresses {concern}")
                else:
                    gaps.append(f"Does not clearly address {concern}")
            
            if "board" in text_lower and "approve" in text_lower:
                evidence_found.append("Governing board approval mentioned")
            else:
                gaps.append("Governing board approval not clearly documented")
    
    # Generic evaluation for other standards
    else:
        if len(text) > 500:
            evidence_found.append("Substantive document content present")
        else:
            gaps.append("Limited document content - may need additional evidence")
    
    # Determine overall status
    if evidence_found and not gaps:
        status = "EVIDENCE_PRESENT"
    elif evidence_found and gaps:
        status = "PARTIAL_EVIDENCE"
    elif not text or len(text) < 100:
        status = "INSUFFICIENT"
    else:
        status = "REVIEW_REQUIRED"
    
    return {
        "filename": filename,
        "status": status,
        "evidence_found": evidence_found,
        "gaps": gaps,
        "text_length": len(text),
        "evaluation": f"Document provides {'complete' if status == 'EVIDENCE_PRESENT' else 'partial' if status == 'PARTIAL_EVIDENCE' else 'insufficient'} evidence for standard {standard_num}"
    }

def generate_evaluation_report():
    """Generate comprehensive evaluation report for all standards."""
    
    # Map standards to their document prefixes
    standard_documents = {
        "2.05": ["EX2.05"],
        "2.06": ["EX2.06"],
        "2.07": ["EX2.07", "2.07"],
        "5.02": ["EX5.02"],
        "7.01": ["EX7.01"],
        "8.01": ["EX8.01"],
        "9.02": ["EX9.01", "EX9.02"]
    }
    
    print("="*80)
    print("COMPREHENSIVE COMPLIANCE EVIDENCE EVALUATION")
    print("Vitality University - Supplemental Report Review")
    print("="*80)
    print(f"\nEvaluation Date: {datetime.now().strftime('%B %d, %Y')}")
    print(f"Source Directory: {PDF_DIR}\n")
    
    all_results = {}
    
    for standard_num, finding_info in COMMISSION_FINDINGS.items():
        print(f"\n{'='*80}")
        print(f"STANDARD {standard_num}: {finding_info['finding']}")
        print(f"{'='*80}\n")
        print("Required Evidence:")
        for i, req in enumerate(finding_info['required_evidence'], 1):
            print(f"  {i}. {req}")
        print()
        
        # Find relevant documents
        prefixes = standard_documents.get(standard_num, [])
        relevant_docs = []
        
        pdf_files = set()
        for f in PDF_DIR.glob('*.pdf'):
            pdf_files.add(f)
        for f in PDF_DIR.glob('*.PDF'):
            pdf_files.add(f)
        
        for pdf_file in sorted(pdf_files):
            filename_lower = pdf_file.name.lower()
            for prefix in prefixes:
                if filename_lower.startswith(prefix.lower()):
                    relevant_docs.append(pdf_file)
                    break
        
        if not relevant_docs:
            print("  [NO DOCUMENTS FOUND]")
            all_results[standard_num] = {"status": "NO_DOCUMENTS", "documents": []}
            continue
        
        print(f"Found {len(relevant_docs)} document(s):")
        standard_results = []
        
        for doc_path in relevant_docs:
            print(f"\n  Document: {doc_path.name}")
            evaluation = evaluate_document_against_finding(doc_path, standard_num, finding_info)
            standard_results.append(evaluation)
            
            print(f"    Status: {evaluation['status']}")
            if evaluation['evidence_found']:
                print(f"    Evidence Found: {', '.join(evaluation['evidence_found'][:3])}")
            if evaluation['gaps']:
                print(f"    Gaps: {', '.join(evaluation['gaps'][:3])}")
        
        all_results[standard_num] = {
            "status": "EVALUATED",
            "documents": standard_results
        }
        
        # Summary for this standard
        complete_docs = sum(1 for r in standard_results if r['status'] == 'EVIDENCE_PRESENT')
        partial_docs = sum(1 for r in standard_results if r['status'] == 'PARTIAL_EVIDENCE')
        insufficient_docs = sum(1 for r in standard_results if r['status'] == 'INSUFFICIENT')
        
        print(f"\n  Standard {standard_num} Summary: {complete_docs} complete, {partial_docs} partial, {insufficient_docs} insufficient")
    
    print("\n" + "="*80)
    print("EVALUATION COMPLETE")
    print("="*80)
    
    return all_results

if __name__ == "__main__":
    results = generate_evaluation_report()
