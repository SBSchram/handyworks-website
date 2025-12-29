"""
Quick verification script to ensure framework is working correctly.
Run this before distributing to commissioners.
"""
import sys
from pathlib import Path

print("="*60)
print("Evidence Analysis Framework - Verification")
print("="*60)
print()

# Test 1: Check Python version
print("1. Checking Python version...")
version_info = sys.version_info
if version_info.major >= 3 and version_info.minor >= 8:
    print(f"   [OK] Python {version_info.major}.{version_info.minor}.{version_info.micro}")
else:
    print(f"   [ERROR] Python 3.8+ required, found {version_info.major}.{version_info.minor}")
    sys.exit(1)

# Test 2: Check required libraries
print("\n2. Checking required libraries...")
try:
    import PyPDF2
    print(f"   [OK] PyPDF2 {PyPDF2.__version__}")
except ImportError:
    print("   [ERROR] PyPDF2 not installed. Run: python -m pip install PyPDF2")
    sys.exit(1)

# Test 3: Check framework files exist
print("\n3. Checking framework files...")
current_dir = Path(__file__).parent
required_files = [
    "evidence_analysis_framework.py",
    "generate_commissioner_summary.py"
]

all_present = True
for file in required_files:
    file_path = current_dir / file
    if file_path.exists():
        print(f"   [OK] {file}")
    else:
        print(f"   [ERROR] {file} not found")
        all_present = False

if not all_present:
    sys.exit(1)

# Test 4: Test framework imports
print("\n4. Testing framework imports...")
try:
    from evidence_analysis_framework import (
        COMMISSION_FINDINGS,
        PDF_DIR,
        extract_text_from_pdf,
        analyze_standard_evidence
    )
    print(f"   [OK] Framework imports successful")
    print(f"   [OK] {len(COMMISSION_FINDINGS)} standards configured")
except ImportError as e:
    print(f"   [ERROR] Import failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"   [ERROR] Unexpected error: {e}")
    sys.exit(1)

# Test 5: Check PDF_DIR configuration
print("\n5. Checking PDF_DIR configuration...")
if PDF_DIR.exists():
    print(f"   [OK] PDF_DIR exists: {PDF_DIR}")
    pdf_count = len(list(PDF_DIR.glob('*.pdf'))) + len(list(PDF_DIR.glob('*.PDF')))
    print(f"   [OK] Found {pdf_count} PDF files")
else:
    print(f"   [WARNING] PDF_DIR does not exist: {PDF_DIR}")
    print(f"   [INFO] Commissioners must update PDF_DIR in evidence_analysis_framework.py")

# Test 6: Verify summary script imports
print("\n6. Testing summary script imports...")
try:
    # Try to import what the summary script needs
    import generate_commissioner_summary
    print("   [OK] Summary script can be imported")
except Exception as e:
    print(f"   [ERROR] Summary script import failed: {e}")
    sys.exit(1)

print("\n" + "="*60)
print("VERIFICATION COMPLETE")
print("="*60)
print("\nAll core components verified successfully!")
print("\nNext steps:")
print("1. Review COMMISSIONER_INSTRUCTIONS.md for distribution")
print("2. Ensure PDF_DIR path is configured (or instruct commissioners to update it)")
print("3. Package framework files for distribution")
print("\nRequired files for distribution:")
print("  - evidence_analysis_framework.py")
print("  - generate_commissioner_summary.py")
print("  - COMMISSIONER_INSTRUCTIONS.md (recommended)")
print("  - README.md (recommended)")
print("  - SETUP_SCRIPT.ps1 (optional)")
