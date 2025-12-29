import os
import PyPDF2
from pathlib import Path
import json

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def categorize_file(filename):
    """Categorize files based on their names."""
    filename_lower = filename.lower()
    
    if 'resume' in filename_lower:
        return 'Resumes'
    elif filename.startswith('AC') or filename.startswith('BS') or filename.startswith('CP') or \
         filename.startswith('HM') or filename.startswith('OM') or filename.startswith('PD') or \
         filename.startswith('PM') or filename.startswith('WM'):
        return 'Course Syllabi'
    elif filename.startswith('EX'):
        return 'Exhibits/Supporting Documents'
    elif 'enrollment' in filename_lower or 'agreement' in filename_lower:
        return 'Enrollment Agreements'
    elif 'floor plan' in filename_lower or 'campus' in filename_lower:
        return 'Facility Documents'
    elif 'review' in filename_lower or 'summary' in filename_lower or 'attendee' in filename_lower:
        return 'Review Documents'
    elif 'handbook' in filename_lower:
        return 'Policy Documents'
    elif 'minutes' in filename_lower:
        return 'Meeting Minutes'
    elif 'syllabus' in filename_lower or 'template' in filename_lower:
        return 'Templates'
    else:
        return 'Other Documents'

def analyze_pdfs(directory_path):
    """Analyze all PDFs in the directory and organize them."""
    pdf_dir = Path(directory_path)
    results = {
        'Resumes': [],
        'Course Syllabi': [],
        'Exhibits/Supporting Documents': [],
        'Enrollment Agreements': [],
        'Facility Documents': [],
        'Review Documents': [],
        'Policy Documents': [],
        'Meeting Minutes': [],
        'Templates': [],
        'Other Documents': []
    }
    
    # Get all PDF files, avoiding duplicates (case-insensitive)
    pdf_files = sorted(set(pdf_dir.glob('*.pdf')) | set(pdf_dir.glob('*.PDF')), key=lambda x: x.name.lower())
    
    print(f"Found {len(pdf_files)} PDF files")
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        category = categorize_file(pdf_file.name)
        text = extract_text_from_pdf(pdf_file)
        
        # Create summary (first 500 characters)
        summary = text[:500].replace('\n', ' ') if text else "No text extracted"
        
        file_info = {
            'filename': pdf_file.name,
            'path': str(pdf_file),
            'summary': summary,
            'full_text_length': len(text)
        }
        
        results[category].append(file_info)
    
    return results

def create_summary_report(results, output_file):
    """Create a markdown summary report."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# PDF Document Analysis and Organization\n\n")
        f.write("## Overview\n\n")
        f.write(f"Total categories: {len([k for k, v in results.items() if v])}\n")
        f.write(f"Total documents analyzed: {sum(len(v) for v in results.values())}\n\n")
        
        for category, files in results.items():
            if files:
                f.write(f"## {category}\n\n")
                f.write(f"**Count:** {len(files)}\n\n")
                
                for file_info in sorted(files, key=lambda x: x['filename'].lower()):
                    f.write(f"### {file_info['filename']}\n\n")
                    f.write(f"**Summary:** {file_info['summary']}\n\n")
                    f.write(f"**Text Length:** {file_info['full_text_length']} characters\n\n")
                    f.write("---\n\n")
        
        f.write("\n## Detailed Text Extracts\n\n")
        f.write("*Note: Full text extracts are available in the summary above. Detailed extracts can be generated on demand.*\n\n")

if __name__ == "__main__":
    directory = r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\Background Materials\250813 VU INST-DAcCHM SSR, SVR, FIR Comp Review\attachments"
    output_file = r"C:\Users\sbsch\Documents\handyworks-website\pdf_analysis_summary.md"
    
    # Ensure output directory exists
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print("Starting PDF analysis...")
    results = analyze_pdfs(directory)
    
    print("Creating summary report...")
    create_summary_report(results, output_file)
    
    print(f"Analysis complete! Report saved to: {output_file}")
