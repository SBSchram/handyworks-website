"""Convert framework documentation MD files to Word documents."""
from pathlib import Path
import sys

# Import the existing conversion function
sys.path.insert(0, str(Path(__file__).parent))
from md_to_docx_clean import markdown_to_docx_clean

# Documentation files to convert
DOCUMENTATION_FILES = [
    "COMMISSIONER_INSTRUCTIONS.md",
    "README.md",
    "FRAMEWORK_OVERVIEW.md",
    "DISTRIBUTION_CHECKLIST.md",
    "FILES_CHECKLIST.md",
    "HOW_THIS_WORKED.md"
]

def convert_framework_docs():
    """Convert all framework documentation MD files to DOCX."""
    script_dir = Path(__file__).parent
    
    print("Converting framework documentation files to Word format...")
    print("="*60)
    
    converted_count = 0
    failed_count = 0
    
    for md_filename in DOCUMENTATION_FILES:
        md_path = script_dir / md_filename
        
        if not md_path.exists():
            print(f"[SKIP] {md_filename} - File not found")
            continue
        
        docx_filename = md_filename.replace('.md', '.docx')
        docx_path = script_dir / docx_filename
        
        print(f"\nConverting: {md_filename} -> {docx_filename}")
        try:
            markdown_to_docx_clean(md_path, docx_path)
            converted_count += 1
            print(f"[OK] Converted: {md_filename} -> {docx_filename} ({docx_path.stat().st_size:,} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed to convert {md_filename}: {str(e)}")
            failed_count += 1
    
    print("\n" + "="*60)
    print(f"Conversion complete: {converted_count} succeeded, {failed_count} failed")
    print("="*60)

if __name__ == "__main__":
    convert_framework_docs()
