"""
Generate a clean summary report for commissioners showing evidence present, gaps, and recommendations.
This is a partner tool - provides analysis, not decisions.

NOTE: This script requires evidence_analysis_framework.py to be in the same directory.
"""
import sys
from pathlib import Path

# Import from evidence_analysis_framework module
# Ensure both files are in the same directory
try:
    from evidence_analysis_framework import (
        COMMISSION_FINDINGS,
        PDF_DIR,
        extract_text_from_pdf,
        analyze_standard_evidence
    )
except ImportError as e:
    print("ERROR: Could not import evidence_analysis_framework module.")
    print("Please ensure evidence_analysis_framework.py is in the same directory.")
    print(f"Import error: {e}")
    sys.exit(1)

def generate_commissioner_summary():
    """Generate clean, actionable summary for commissioners."""
    
    # Collect all PDF files
    pdf_files = set()
    for f in PDF_DIR.glob('*.pdf'):
        pdf_files.add(f)
    for f in PDF_DIR.glob('*.PDF'):
        pdf_files.add(f)
    pdf_files = sorted(pdf_files)
    
    # Import the flexible document finder
    from evidence_analysis_framework import find_documents_for_standard
    
    print("="*80)
    print("EVIDENCE ANALYSIS SUMMARY FOR COMMISSION REVIEW")
    print("Vitality University - Supplemental Report")
    print("="*80)
    print("\nPurpose: Identify evidence present and gaps to assist commission decision-making.\n")
    print("This analysis does not make compliance determinations.\n")
    
    all_summaries = {}
    
    for standard_num in COMMISSION_FINDINGS.keys():
        # Find documents using flexible pattern matching
        relevant_docs = find_documents_for_standard(standard_num, pdf_files)
        
        if not relevant_docs:
            print(f"\nSTANDARD {standard_num}: NO DOCUMENTS PROVIDED")
            print(f"  GAP: All required evidence appears to be missing.\n")
            all_summaries[standard_num] = {"status": "NO_DOCUMENTS"}
            continue
        
        # Analyze
        analysis = analyze_standard_evidence(standard_num, relevant_docs)
        all_summaries[standard_num] = analysis
        
        finding_info = COMMISSION_FINDINGS[standard_num]
        
        print(f"\n{'='*80}")
        print(f"STANDARD {standard_num}")
        print(f"{'='*80}")
        print(f"Finding: {finding_info['finding']}\n")
        print(f"Documents Provided: {len(relevant_docs)}")
        for doc in relevant_docs:
            print(f"  - {doc.name}")
        
        # Evidence summary
        print(f"\nEVIDENCE PRESENT: {len(analysis['summary']['evidence_present'])} of {len(analysis['evidence_by_requirement'])} required items")
        if analysis['summary']['evidence_present']:
            for req_key in analysis['summary']['evidence_present']:
                req_info = analysis['evidence_by_requirement'][req_key]
                docs_list = [d['document'] for d in req_info['supporting_documents']]
                print(f"  [PRESENT] {req_info['description'][:70]}")
                if docs_list:
                    print(f"    Document(s): {', '.join(docs_list[:2])}{'...' if len(docs_list) > 2 else ''}")
        
        # Gaps
        print(f"\nGAPS IDENTIFIED: {len(analysis['summary']['gaps'])}")
        if analysis['summary']['gaps']:
            for gap in analysis['summary']['gaps']:
                print(f"  [MISSING] {gap['description'][:70]}")
        else:
            print("  None identified - all required evidence appears present in provided documents")
        
        # Unreadable documents
        unreadable = [d for d in analysis['document_analyses'] if not d['readable']]
        if unreadable:
            print(f"\nDOCUMENTS REQUIRING PHYSICAL REVIEW: {len(unreadable)}")
            for doc in unreadable:
                print(f"  - {doc['filename']} (unreadable)")
        
        print()
    
    print("="*80)
    print("ANALYSIS NOTES FOR COMMISSIONERS")
    print("="*80)
    print("""
1. This analysis is based on automated text extraction and keyword matching.
2. Commissioners should review actual documents to verify all findings.
3. Confidence levels indicate strength of automated match:
   - HIGH: Strong match based on filename and content
   - MEDIUM: Good match with supporting content
   - LOW: Partial match - manual review recommended
4. Documents marked 'unreadable' require physical review.
5. Gaps indicate missing evidence - may require additional documentation from institution.
""")
    
    return all_summaries

if __name__ == "__main__":
    results = generate_commissioner_summary()
