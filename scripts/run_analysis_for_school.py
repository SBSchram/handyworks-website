"""
General-purpose script to run evidence analysis for any school.
This script handles both pre-filled and extraction-based workflows.
"""
import sys
from pathlib import Path
import json

# Import framework
sys.path.insert(0, str(Path(__file__).parent))
from evidence_analysis_framework import COMMISSION_FINDINGS as VU_FINDINGS
from generate_commissioner_summary_docx import generate_commissioner_summary_docx
from extract_school_findings import extract_school_findings

def run_analysis_for_school(school_code, pdf_dir, excel_path=None, pdf_report_path=None, 
                           output_file=None, school_name=None, findings=None):
    """
    Run complete evidence analysis for a school.
    
    Args:
        school_code: Short code for the school (e.g., "VU", "NUHS")
        pdf_dir: Path to directory containing PDF attachments
        excel_path: Optional path to Excel review table (for extraction)
        pdf_report_path: Optional path to PDF report (for extraction)
        output_file: Path to save output Word document
        school_name: Full name of the school
        findings: Pre-filled findings dict (if None, will attempt extraction)
    """
    pdf_dir = Path(pdf_dir)
    
    if not pdf_dir.exists():
        print(f"ERROR: PDF directory does not exist: {pdf_dir}")
        return False
    
    # Determine school name
    if school_name is None:
        school_name = school_code
    
    # Determine output file
    if output_file is None:
        output_file = Path(__file__).parent.parent / f"{school_code}_Evidence_Analysis_Summary.docx"
    else:
        output_file = Path(output_file)
    
    print("="*80)
    print(f"EVIDENCE ANALYSIS FOR {school_code.upper()}")
    print("="*80)
    print(f"School: {school_name}")
    print(f"PDF Directory: {pdf_dir}")
    print(f"Output File: {output_file}")
    print()
    
    # Step 1: Get findings (either pre-filled or extract)
    if findings is not None:
        print("Using pre-filled findings...")
        commission_findings = findings
    elif excel_path and pdf_report_path:
        print("Extracting findings from Excel and PDF reports...")
        excel_path = Path(excel_path)
        pdf_report_path = Path(pdf_report_path)
        
        if not excel_path.exists():
            print(f"WARNING: Excel file not found: {excel_path}")
            return False
        if not pdf_report_path.exists():
            print(f"WARNING: PDF report not found: {pdf_report_path}")
            return False
        
        commission_findings = extract_school_findings(school_code, excel_path, pdf_report_path)
        
        if not commission_findings:
            print("ERROR: Could not extract findings. Please provide pre-filled findings or verify file paths.")
            return False
        
        # Save extracted findings for reference
        findings_file = Path(__file__).parent / f"{school_code}_findings_extracted.json"
        with open(findings_file, 'w', encoding='utf-8') as f:
            json.dump(commission_findings, f, indent=2, ensure_ascii=False)
        print(f"Extracted findings saved to: {findings_file}")
    else:
        print("ERROR: No findings provided and extraction paths not specified.")
        print("Please either:")
        print("  1. Provide findings as parameter, OR")
        print("  2. Provide excel_path and pdf_report_path for extraction")
        return False
    
    print(f"\nFound {len(commission_findings)} standards to analyze:")
    for std_num in sorted(commission_findings.keys()):
        print(f"  - Standard {std_num}")
    
    # Step 2: Run analysis
    print(f"\nGenerating analysis document...")
    try:
        generate_commissioner_summary_docx(
            output_path=output_file,
            pdf_dir=pdf_dir,
            commission_findings=commission_findings,
            school_name=school_name
        )
        print(f"\nSUCCESS: Analysis complete!")
        print(f"Output saved to: {output_file}")
        return True
    except Exception as e:
        print(f"\nERROR: Failed to generate analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Example: Run for VU (uses pre-filled findings)
    if len(sys.argv) > 1:
        school_code = sys.argv[1]
    else:
        school_code = "VU"
    
    if school_code == "VU":
        run_analysis_for_school(
            school_code="VU",
            pdf_dir=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments",
            findings=VU_FINDINGS,  # Use pre-filled findings
            school_name="Vitality University"
        )
    elif school_code == "NUHS":
        run_analysis_for_school(
            school_code="NUHS",
            pdf_dir=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\attachments",
            excel_path=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260226 NUHS SVR Rev Tbl.xlsx",
            pdf_report_path=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS\260223 NUHS SSR, SVR, FIR\260223 NUHS SSR, SVR, FIR.pdf",
            school_name="National University of Health Sciences"
        )
    elif school_code == "AAHW":
        run_analysis_for_school(
            school_code="AAHW",
            pdf_dir=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\251201 AAHW Inst-MAc-MAcCHM-DAOM PR1\attachments",
            excel_path=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\260226 AAHW PR1 INST-MAc-MAcCHM-DAOM REV TBL.xlsx",
            pdf_report_path=r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\AAHW\251201 AAHW Inst-MAc-MAcCHM-DAOM PR1\attachments\250212 AAHW INST-MAc-MAcCHM-DAOM SVR Binder.pdf",
            school_name="Academy of Acupuncture and Herbal Medicine"
        )
    else:
        print(f"School {school_code} not configured. Please specify paths.")
        print("\nUsage:")
        print("  python run_analysis_for_school.py VU")
        print("  python run_analysis_for_school.py NUHS")
        print("  python run_analysis_for_school.py AAHW")
        print("\nOr call run_analysis_for_school() function directly with parameters.")
