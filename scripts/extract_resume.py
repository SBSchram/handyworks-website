import PyPDF2
from pathlib import Path
import sys

pdf_path = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\Background Materials\250813 VU INST-DAcCHM SSR, SVR, FIR Comp Review\attachments\1. Jeffery Mah's Resume.pdf")

with open(pdf_path, 'rb') as file:
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"

# Write to file with UTF-8 encoding
output_file = Path(r"C:\Users\sbsch\Documents\handyworks-website\jeffery_mah_resume_text.txt")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Resume text extracted to: {output_file}")
