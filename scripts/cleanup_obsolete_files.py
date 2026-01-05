#!/usr/bin/env python3
"""
Cleanup obsolete files from scripts directory
Moves ACAHM-related files to subdirectory, removes one-time use scripts and temporary files
"""

import os
import shutil
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = ROOT_DIR / 'scripts'
ACAHM_DIR = SCRIPTS_DIR / 'acahm'  # Subdirectory for ACAHM files

# Files to MOVE to acahm/ subdirectory (ACAHM-related)
FILES_TO_MOVE = [
    # ACAHM School Evaluation Scripts (proprietary, in .gitignore)
    'scripts/run_all_schools_analysis.py',
    'scripts/run_analysis_for_school.py',
    'scripts/run_analysis_all_schools.py',
    'scripts/extract_school_findings.py',
    'scripts/extract_findings_from_reports.py',
    'scripts/generate_commissioner_summary.py',
    'scripts/generate_commissioner_summary_docx.py',
    'scripts/evidence_analysis_framework.py',
    'scripts/evaluate_compliance_evidence.py',
    'scripts/read_reviewer_spreadsheet.py',
    'scripts/analyze_financial_plan.py',
    'scripts/create_standard_reviews.py',
    'scripts/extract_compliance_details.py',
    'scripts/search_compliance_content.py',
    'scripts/analyze_pdfs.py',
    'scripts/extract_resume.py',
    'scripts/verify_framework.py',
    'scripts/convert_framework_docs_to_docx.py',
    
    # ACAHM Findings Data (proprietary, in .gitignore)
    'scripts/AAHW_findings_extracted.json',
    'scripts/NUHS_findings_extracted.json',
    'scripts/NUHS_findings_structured.json',
    'scripts/NUHS_findings_extraction.txt',
    
    # ACAHM Documentation (proprietary)
    'scripts/README.md',  # ACAHM framework README
    'scripts/README.docx',
    'scripts/COMMISSIONER_INSTRUCTIONS.md',
    'scripts/COMMISSIONER_INSTRUCTIONS.docx',
    'scripts/DISTRIBUTION_CHECKLIST.md',
    'scripts/DISTRIBUTION_CHECKLIST.docx',
    'scripts/FILES_CHECKLIST.md',
    'scripts/FILES_CHECKLIST.docx',
    'scripts/FRAMEWORK_OVERVIEW.md',
    'scripts/FRAMEWORK_OVERVIEW.docx',
    'scripts/FRAMEWORK_IMPROVEMENTS.md',
    'scripts/HOW_THIS_WORKED.md',
    'scripts/HOW_THIS_WORKED.docx',
    'scripts/FILES_READY_FOR_DISTRIBUTION.txt',
    'scripts/SETUP_SCRIPT.ps1',  # ACAHM setup script
]

# Files to REMOVE - One-time use and temporary files
FILES_TO_REMOVE = [
    
    # One-time conversion scripts (no longer needed)
    'scripts/md_to_docx.py',
    'scripts/md_to_docx_improved.py',
    'scripts/md_to_docx_clean.py',
    'scripts/regenerate_word_doc.py',
    'scripts/generate_correction_doc.py',
    
    # Temporary/output files
    'scripts/All_Invoice_Corrections_PERMANENT.docx',
    'scripts/All_Invoice_Corrections.docx',
    'scripts/dmarc-policy-comparison.txt',
    'scripts/dmarc-record-info.txt',
    'scripts/dmarc-record-updated.txt',
    'scripts/dmarc-verification-success.txt',
    
    # Windows system cleanup scripts (not website-related)
    'scripts/clean-appdata.ps1',
    'scripts/clean-appdata-auto.ps1',
    'scripts/fix_word_temp_issue.ps1',
    'scripts/fix_word_temp_simple.ps1',
    'scripts/fix-adx-loader-error.ps1',
    
    # Python cache
    'scripts/__pycache__',
]

# Files to KEEP - Website maintenance scripts
FILES_TO_KEEP = [
    'scripts/add_favicon.py',
    'scripts/add_meta_tags.py',
    'scripts/clean_wordpress_content.py',
    'scripts/regenerate_blog_index.py',
    'scripts/test_site.py',
    'scripts/final_cleanup.py',
    'scripts/cleanup_obsolete_files.py',  # This script
    
    # Firebase/billing scripts (website functionality)
    'scripts/create_firebase_users.js',
    'scripts/create_permanent_payment_links.py',
    'scripts/export_invoice_payment_links.py',
    'scripts/set_admin_claim.js',
    'scripts/add_test_user.js',
    'scripts/import_handyworks_data.js',
    'scripts/import_hwsales_csv.js',
    
    # Security cleanup scripts (useful for future)
    'scripts/remove_sensitive_files_from_history.ps1',
    'scripts/REMOVE_SENSITIVE_FILES_INSTRUCTIONS.md',
    'scripts/sensitive-files-list.txt',
    
    # Config files (needed locally, in .gitignore)
    'scripts/serviceAccountKey.json',
    'scripts/tsv_account_numbers.txt',
]

def move_item(item_path, dest_dir):
    """Move a file to destination directory"""
    try:
        if item_path.is_file():
            dest_path = dest_dir / item_path.name
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(item_path), str(dest_path))
            print(f"✓ Moved: {item_path.relative_to(ROOT_DIR)} → {dest_path.relative_to(ROOT_DIR)}")
            return True
        else:
            print(f"✗ Not found: {item_path.relative_to(ROOT_DIR)}")
            return False
    except Exception as e:
        print(f"✗ Error moving {item_path.relative_to(ROOT_DIR)}: {e}")
        return False

def remove_item(item_path):
    """Remove a file or directory"""
    try:
        if item_path.is_file():
            item_path.unlink()
            print(f"✓ Removed file: {item_path.relative_to(ROOT_DIR)}")
            return True
        elif item_path.is_dir():
            shutil.rmtree(item_path)
            print(f"✓ Removed directory: {item_path.relative_to(ROOT_DIR)}")
            return True
        else:
            print(f"✗ Not found: {item_path.relative_to(ROOT_DIR)}")
            return False
    except Exception as e:
        print(f"✗ Error removing {item_path.relative_to(ROOT_DIR)}: {e}")
        return False

def main():
    """Move ACAHM files to subdirectory and remove obsolete files"""
    print("HandyWorks Website - Cleanup and Organize Scripts")
    print("=" * 60)
    
    # Create acahm subdirectory (with parents=True to create parent dirs if needed)
    ACAHM_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nCreated directory: {ACAHM_DIR.relative_to(ROOT_DIR)}")
    
    # Move ACAHM files
    print("\nMoving ACAHM-related files to scripts/acahm/...\n")
    moved_count = 0
    moved_not_found = 0
    moved_error = 0
    
    for item in FILES_TO_MOVE:
        item_path = ROOT_DIR / item
        if item_path.exists():
            if move_item(item_path, ACAHM_DIR):
                moved_count += 1
            else:
                moved_error += 1
        else:
            moved_not_found += 1
    
    # Remove obsolete files
    print("\nRemoving one-time use scripts and temporary files...\n")
    removed_count = 0
    removed_not_found = 0
    removed_error = 0
    
    for item in FILES_TO_REMOVE:
        item_path = ROOT_DIR / item
        if item_path.exists():
            if remove_item(item_path):
                removed_count += 1
            else:
                removed_error += 1
        else:
            removed_not_found += 1
    
    print("\n" + "=" * 60)
    print(f"Moved to scripts/acahm/: {moved_count} items")
    if moved_not_found > 0:
        print(f"  (Not found: {moved_not_found} items)")
    if moved_error > 0:
        print(f"  (Errors: {moved_error} items)")
    
    print(f"\nRemoved: {removed_count} items")
    if removed_not_found > 0:
        print(f"  (Not found: {removed_not_found} items)")
    if removed_error > 0:
        print(f"  (Errors: {removed_error} items)")
    
    print("\nScripts kept for website maintenance:")
    for script in FILES_TO_KEEP:
        script_path = ROOT_DIR / script
        if script_path.exists():
            print(f"  ✓ {script}")
        else:
            print(f"  - {script} (not found)")
    
    print("\nCleanup complete!")
    print(f"\nACAHM files moved to: {ACAHM_DIR.relative_to(ROOT_DIR)}")
    print("Note: ACAHM files are in .gitignore and were already removed from git history.")

if __name__ == '__main__':
    main()

