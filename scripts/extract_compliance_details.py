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

# Key documents that might contain EX2.05 content
key_files = [
    'EX1.01.3 Staff Minutes.pdf',
    'EX1.01.4 Student Minutes.pdf',
    'EX2.08 OSHA Hazardous.pdf',
    'GA1.04 Employee Handbook.pdf',
    'GA1.02 Student Handbook.pdf',
    'GA1.03 Clinical Manual.pdf',
    'EX4.01 Policies for Student Records.pdf'
]

print("="*80)
print("SEARCHING FOR EX2.05 CONTENT (Federal Compliance Training Materials)")
print("="*80)
print()

for filename in key_files:
    file_path = PDF_DIR / filename
    if not file_path.exists():
        continue
    
    print(f"\n{'='*80}")
    print(f"FILE: {filename}")
    print(f"{'='*80}\n")
    
    text = extract_text_from_pdf(file_path)
    text_lower = text.lower()
    
    # Check for Title IX
    if 'title ix' in text_lower or 'title 9' in text_lower or 'sexual harassment' in text_lower:
        print("TITLE IX CONTENT FOUND:")
        # Find Title IX sections
        title_ix_pattern = re.compile(r'.{0,200}(title\s+ix|title\s+9|sexual\s+harassment).{0,500}', re.IGNORECASE | re.DOTALL)
        matches = title_ix_pattern.findall(text)
        unique_matches = list(set(matches))[:3]
        for i, match in enumerate(unique_matches, 1):
            clean_match = re.sub(r'\s+', ' ', match).strip()[:400]
            print(f"  {i}. {clean_match}...")
        print()
    
    # Check for HIPAA
    if 'hipaa' in text_lower:
        print("HIPAA CONTENT FOUND:")
        hipaa_pattern = re.compile(r'.{0,200}(hipaa|health\s+insurance\s+portability|protected\s+health\s+information|phi).{0,500}', re.IGNORECASE | re.DOTALL)
        matches = hipaa_pattern.findall(text)
        unique_matches = list(set(matches))[:3]
        for i, match in enumerate(unique_matches, 1):
            clean_match = re.sub(r'\s+', ' ', match).strip()[:400]
            print(f"  {i}. {clean_match}...")
        print()
    
    # Check for FERPA
    if 'ferpa' in text_lower:
        print("FERPA CONTENT FOUND:")
        ferpa_pattern = re.compile(r'.{0,200}(ferpa|family\s+educational\s+rights|student\s+records\s+privacy).{0,500}', re.IGNORECASE | re.DOTALL)
        matches = ferpa_pattern.findall(text)
        unique_matches = list(set(matches))[:3]
        for i, match in enumerate(unique_matches, 1):
            clean_match = re.sub(r'\s+', ' ', match).strip()[:400]
            print(f"  {i}. {clean_match}...")
        print()
    
    # Check for OSHA
    if 'osha' in text_lower:
        print("OSHA CONTENT FOUND:")
        osha_pattern = re.compile(r'.{0,200}(osha|occupational\s+safety).{0,500}', re.IGNORECASE | re.DOTALL)
        matches = osha_pattern.findall(text)
        unique_matches = list(set(matches))[:3]
        for i, match in enumerate(unique_matches, 1):
            clean_match = re.sub(r'\s+', ' ', match).strip()[:400]
            print(f"  {i}. {clean_match}...")
        print()
    
    # Check for training completion evidence
    if 'training' in text_lower and ('completion' in text_lower or 'certificate' in text_lower or 'completed' in text_lower or 'record' in text_lower):
        print("TRAINING COMPLETION EVIDENCE FOUND:")
        training_pattern = re.compile(r'.{0,200}(training\s+(completion|record|certificate|completed)).{0,500}', re.IGNORECASE | re.DOTALL)
        matches = training_pattern.findall(text)
        unique_matches = list(set(matches))[:3]
        for i, match in enumerate(unique_matches, 1):
            if isinstance(match, tuple):
                match = ' '.join(match)
            clean_match = re.sub(r'\s+', ' ', match).strip()[:400]
            print(f"  {i}. {clean_match}...")
        print()
