"""
Run evidence analysis for all schools with automatic findings extraction.
This is the master script that coordinates analysis for all schools.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from run_analysis_for_school import run_analysis_for_school
from evidence_analysis_framework import COMMISSION_FINDINGS as VU_FINDINGS

# School configurations
SCHOOL_CONFIGS = {
    "VU": {
        "pdf_dir": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments",
        "school_name": "Vitality University",
        "findings": VU_FINDINGS  # Pre-filled
    },
    "NUHS": {
        "pdf_dir": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\attachments",
        "excel_path": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260226 NUHS SVR Rev Tbl.xlsx",
        "pdf_report_path": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\260223 NUHS SSR, SVR, FIR.pdf",
        "school_name": "National University of Health Sciences"
    },
    "AAHW": {
        "pdf_dir": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\251201 AAHW Inst-MAc-MAcCHM-DAOM PR1\attachments",
        "excel_path": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\260226 AAHW PR1 INST-MAc-MAcCHM-DAOM REV TBL.xlsx",
        "pdf_report_path": None,  # Need to locate
        "school_name": "Academy of Acupuncture and Herbal Medicine"
    },
    "AIMC": {
        "pdf_dir": r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AIMC\260223 AIMC Chg 1.01\attachments",
        "excel_path": None,  # No Excel file found
        "pdf_report_path": None,  # Need to locate
        "school_name": "Academy of Integrative Medicine and Health Sciences"
    }
}

def main():
    """Run analysis for all configured schools."""
    print("="*80)
    print("EVIDENCE ANALYSIS FRAMEWORK - ALL SCHOOLS")
    print("="*80)
    print()
    
    results = {}
    
    for school_code, config in SCHOOL_CONFIGS.items():
        print(f"\n{'='*80}")
        print(f"PROCESSING: {school_code}")
        print(f"{'='*80}\n")
        
        # Check if we can run analysis
        can_run = True
        
        if config.get("findings"):
            # Use pre-filled findings
            success = run_analysis_for_school(
                school_code=school_code,
                pdf_dir=config["pdf_dir"],
                findings=config["findings"],
                school_name=config["school_name"]
            )
        elif config.get("excel_path") and config.get("pdf_report_path"):
            # Extract findings from Excel and PDF
            success = run_analysis_for_school(
                school_code=school_code,
                pdf_dir=config["pdf_dir"],
                excel_path=config["excel_path"],
                pdf_report_path=config["pdf_report_path"],
                school_name=config["school_name"]
            )
        else:
            print(f"SKIPPED: {school_code}")
            print(f"  Reason: Missing required files for findings extraction")
            if not config.get("excel_path"):
                print(f"    - Excel file not found")
            if not config.get("pdf_report_path"):
                print(f"    - PDF report file not found")
            success = None
        
        results[school_code] = success
    
    # Summary
    print("\n" + "="*80)
    print("ANALYSIS SUMMARY")
    print("="*80)
    for school_code, result in results.items():
        if result is True:
            print(f"  {school_code}: ✓ SUCCESS")
        elif result is False:
            print(f"  {school_code}: ✗ FAILED")
        else:
            print(f"  {school_code}: ⊘ SKIPPED (missing files)")
    
    successful = sum(1 for r in results.values() if r is True)
    total = len(results)
    print(f"\nCompleted: {successful} of {total} schools")

if __name__ == "__main__":
    main()
