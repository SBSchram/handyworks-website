import PyPDF2
from pathlib import Path
import re

PDF_DIR = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\Background Materials\250813 VU INST-DAcCHM SSR, SVR, FIR Comp Review\attachments")

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def search_for_compliance_content():
    """Search all PDFs for federal compliance content."""
    pdf_files = sorted(PDF_DIR.glob('*.pdf')) + sorted(PDF_DIR.glob('*.PDF'))
    
    # Search terms
    search_terms = {
        'Title IX': ['title ix', 'title 9', 'sex-based discrimination', 'sexual harassment'],
        'HIPAA': ['hipaa', 'health insurance portability', 'patient privacy', 'protected health information', 'phi'],
        'FERPA': ['ferpa', 'family educational rights', 'student records privacy', 'educational records'],
        'OSHA': ['osha', 'occupational safety', 'hazardous communication'],
        'Training': ['compliance training', 'training completion', 'training certificate', 'training record'],
        'Staff Qualifications': ['compliance officer', 'compliance staff', 'qualified staff', 'compliance oversight']
    }
    
    results = {}
    
    print("Searching PDF contents for federal compliance information...\n")
    
    for pdf_file in pdf_files:
        print(f"Checking: {pdf_file.name}")
        text = extract_text_from_pdf(pdf_file)
        text_lower = text.lower()
        
        file_matches = {}
        
        for category, terms in search_terms.items():
            matches = []
            for term in terms:
                if term in text_lower:
                    # Find context around the match
                    pattern = re.compile(r'.{0,100}' + re.escape(term) + r'.{0,100}', re.IGNORECASE)
                    contexts = pattern.findall(text)
                    if contexts:
                        matches.extend(contexts[:2])  # Get first 2 contexts
            
            if matches:
                file_matches[category] = list(set(matches))[:3]  # Unique matches, max 3
        
        if file_matches:
            results[pdf_file.name] = file_matches
    
    return results

def main():
    results = search_for_compliance_content()
    
    print("\n" + "="*80)
    print("FILES CONTAINING FEDERAL COMPLIANCE INFORMATION")
    print("="*80 + "\n")
    
    if not results:
        print("No files found containing federal compliance information.")
        return
    
    for filename, matches in results.items():
        print(f"\n{'='*80}")
        print(f"FILE: {filename}")
        print(f"{'='*80}")
        
        for category, contexts in matches.items():
            print(f"\n{category}:")
            for i, context in enumerate(contexts, 1):
                # Clean up context
                context = re.sub(r'\s+', ' ', context).strip()
                if len(context) > 200:
                    context = context[:200] + "..."
                # Clean up context and handle encoding
                context_clean = context.encode('ascii', 'ignore').decode('ascii')
                if len(context_clean) > 200:
                    context_clean = context_clean[:200] + "..."
                print(f"  {i}. {context_clean}")
        
        print()

if __name__ == "__main__":
    main()
