"""
Run evidence analysis for all schools (AAHW, AIMC, NUHS, VU).
This script configures the framework for each school and generates summaries.
"""
import sys
from pathlib import Path

# Import framework functions
sys.path.insert(0, str(Path(__file__).parent))
from evidence_analysis_framework import (
    extract_text_from_pdf, find_documents_for_standard, 
    check_evidence_item, analyze_standard_evidence
)
from generate_commissioner_summary_docx import generate_commissioner_summary_docx

# School configurations
SCHOOLS = {
    "VU": {
        "name": "Vitality University",
        "pdf_dir": Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments"),
        "output_file": Path(r"C:\Users\sbsch\Documents\handyworks-website\VU_Evidence_Analysis_Summary.docx"),
        "findings": {
            # VU findings are already in evidence_analysis_framework.py
            # This will use the default COMMISSION_FINDINGS
        }
    },
    "AAHW": {
        "name": "Academy of Acupuncture and Herbal Medicine",
        "pdf_dir": Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\251201 AAHW Inst-MAc-MAcCHM-DAOM PR1\attachments"),
        "output_file": Path(r"C:\Users\sbsch\Documents\handyworks-website\AAHW_Evidence_Analysis_Summary.docx"),
        "findings": {
            # TODO: Add AAHW findings when available
            # For now, use empty dict - framework will need to handle this
        }
    },
    "AIMC": {
        "name": "Academy of Integrative Medicine and Health Sciences",
        "pdf_dir": Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AIMC\260223 AIMC Chg 1.01\attachments"),
        "output_file": Path(r"C:\Users\sbsch\Documents\handyworks-website\AIMC_Evidence_Analysis_Summary.docx"),
        "findings": {
            # TODO: Add AIMC findings when available
        }
    },
    "NUHS": {
        "name": "National University of Health Sciences",
        "pdf_dir": Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\attachments"),
        "output_file": Path(r"C:\Users\sbsch\Documents\handyworks-website\NUHS_Evidence_Analysis_Summary.docx"),
        "findings": {
            # TODO: Add NUHS findings when available
        }
    }
}

def run_analysis_for_school(school_code, config):
    """Run evidence analysis for a specific school."""
    print("="*80)
    print(f"Running Analysis for {config['name']} ({school_code})")
    print("="*80)
    print(f"PDF Directory: {config['pdf_dir']}")
    print(f"Output File: {config['output_file']}")
    
    # Check if PDF directory exists
    if not config['pdf_dir'].exists():
        print(f"[ERROR] PDF directory does not exist: {config['pdf_dir']}")
        return False
    
    # Check if findings are configured
    if not config.get('findings'):
        print(f"[WARNING] No findings configured for {school_code}")
        print(f"  The framework currently only has VU findings hardcoded.")
        print(f"  Please configure findings for {school_code} before running analysis.")
        return False
    
    # Temporarily update PDF_DIR in the framework
    # Note: This is a workaround - ideally the framework should accept PDF_DIR as parameter
    from evidence_analysis_framework import PDF_DIR, COMMISSION_FINDINGS
    original_pdf_dir = PDF_DIR
    
    try:
        # Update PDF_DIR for this school
        import evidence_analysis_framework
        evidence_analysis_framework.PDF_DIR = config['pdf_dir']
        
        # Generate summary
        generate_commissioner_summary_docx(config['output_file'])
        print(f"[SUCCESS] Analysis complete: {config['output_file']}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to generate analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Restore original PDF_DIR
        evidence_analysis_framework.PDF_DIR = original_pdf_dir

def main():
    """Run analysis for all schools."""
    print("\n" + "="*80)
    print("EVIDENCE ANALYSIS FRAMEWORK - MULTI-SCHOOL ANALYSIS")
    print("="*80 + "\n")
    
    results = {}
    for school_code, config in SCHOOLS.items():
        if school_code == "VU":
            # VU is already configured
            success = run_analysis_for_school(school_code, config)
            results[school_code] = success
        else:
            # Other schools need findings configured first
            print(f"\n[SKIPPING] {school_code} - Findings not yet configured")
            print(f"  To configure {school_code}, you need to:")
            print(f"  1. Extract commission findings from site visit report/Excel file")
            print(f"  2. Add findings to SCHOOLS configuration in this script")
            results[school_code] = None
    
    # Summary
    print("\n" + "="*80)
    print("ANALYSIS SUMMARY")
    print("="*80)
    for school_code, result in results.items():
        if result is True:
            print(f"  {school_code}: SUCCESS")
        elif result is False:
            print(f"  {school_code}: FAILED")
        else:
            print(f"  {school_code}: SKIPPED (not configured)")

if __name__ == "__main__":
    main()
