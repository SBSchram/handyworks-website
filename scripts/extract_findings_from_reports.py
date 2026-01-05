"""
Extract non-compliance findings from Excel review tables and PDF reports.
This script helps identify which standards are NC and extracts the findings from PDFs.
"""
import openpyxl
import PyPDF2
from pathlib import Path
import re

def extract_nc_standards_from_excel(excel_path):
    """Extract standards marked as NC (Non-Compliance) from Excel file."""
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active
    
    nc_standards = []
    
    # Look for rows with "NC" in them
    for row in ws.iter_rows(values_only=True):
        row_str = ' '.join([str(cell) if cell else '' for cell in row])
        # Check if this row contains a standard number and NC
        if 'NC' in row_str:
            # Try to find standard number pattern (e.g., "1.03", "5.02")
            std_match = re.search(r'(\d+\.\d+)\s+', row_str)
            if std_match:
                std_num = std_match.group(1)
                # Get the criterion name
                criterion_match = re.search(r'Criterion\s+' + re.escape(std_num) + r'\s*[–-]?\s*(.+?)(?:\s+NC|\s*$)', row_str, re.IGNORECASE)
                criterion_name = criterion_match.group(1).strip() if criterion_match else ''
                nc_standards.append({
                    'standard': std_num,
                    'criterion': criterion_name,
                    'row_data': row
                })
    
    return nc_standards

def extract_finding_from_pdf(pdf_path, standard_num):
    """Extract finding details for a specific standard from PDF."""
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            full_text = ""
            for page in pdf_reader.pages:
                full_text += page.extract_text() + "\n"
    except Exception as e:
        return {"error": f"Could not read PDF: {str(e)}"}
    
    # Find the section for this standard - look more carefully
    # Try different patterns to find where this standard starts
    std_pattern = re.escape(standard_num)
    
    # Pattern 1: Look for "Criterion 1.03" or similar at start of line/section
    pattern1 = rf'(?:Criterion|Standard|^)\s*{std_pattern}\s*[–-]?\s*[^\n]*'
    
    # Pattern 2: Look for rating line near the standard number
    pattern2 = rf'{std_pattern}.*?(?:Rating:\s*Non-Compliance|Rating:\s*Non Compliance|Non-Compliance)'
    
    finding_text = None
    match = None
    
    # Try pattern 2 first (more specific - looks for NC rating)
    match = re.search(pattern2, full_text, re.IGNORECASE | re.DOTALL | re.MULTILINE)
    if match:
        # Extract from start of match to next standard or end
        start = match.start()
        # Find next standard pattern or end of document
        next_std = re.search(rf'(?:Criterion|Standard)\s*\d+\.\d+', full_text[start+100:], re.IGNORECASE)
        end = start + 100 + next_std.start() if next_std else len(full_text)
        finding_text = full_text[start:end]
    else:
        # Try pattern 1 (less specific but should find the section)
        match = re.search(pattern1, full_text, re.IGNORECASE | re.MULTILINE)
        if match:
            start = match.start()
            # Extract more text - look for the next standard or a reasonable chunk
            # Find next standard pattern
            next_std = re.search(rf'(?:Criterion|Standard)\s*\d+\.\d+', full_text[start+500:], re.IGNORECASE)
            end = start + 500 + (next_std.start() if next_std else 4000)
            finding_text = full_text[start:min(end, len(full_text))]
    
    if not finding_text:
        return {"error": f"Standard {standard_num} not found in PDF"}
    
    # Extract key sections
    result = {
        "standard": standard_num,
        "raw_text": finding_text
    }
    
    # Try to extract "Rating" section
    rating_match = re.search(r'Rating:\s*(.+?)(?:\n|Team Findings)', finding_text, re.IGNORECASE | re.DOTALL)
    if rating_match:
        result["rating"] = rating_match.group(1).strip()
    
    # Try to extract "Team Findings" section
    team_findings_match = re.search(r'Team Findings\s*(.+?)(?:Commission Findings|No supporting documents|$)', finding_text, re.IGNORECASE | re.DOTALL)
    if team_findings_match:
        result["team_findings"] = team_findings_match.group(1).strip()
    
    # Try to extract "Commission Findings" section
    commission_findings_match = re.search(r'Commission Findings\s*(.+?)(?:Standard \d+\.\d+|Criterion \d+\.\d+|$)', finding_text, re.IGNORECASE | re.DOTALL)
    if commission_findings_match:
        result["commission_findings"] = commission_findings_match.group(1).strip()
    
    # Check for "No supporting documents"
    if re.search(r'No supporting documents', finding_text, re.IGNORECASE):
        result["no_supporting_docs"] = True
    
    return result

def safe_print(text, encoding='utf-8', errors='replace'):
    """Safely print text, handling Unicode issues."""
    try:
        print(text)
    except UnicodeEncodeError:
        # Try to encode and decode to handle special characters
        encoded = text.encode(encoding, errors=errors).decode(encoding)
        print(encoded)

def main():
    """Main function to extract findings for NUHS."""
    base_dir = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS")
    excel_path = base_dir / "260226 NUHS SVR Rev Tbl.xlsx"
    pdf_path = base_dir / "260223 NUHS SSR, SVR, FIR" / "260223 NUHS SSR, SVR, FIR.pdf"
    output_file = Path(__file__).parent / "NUHS_findings_extraction.txt"
    
    output_lines = []
    output_lines.append("="*80)
    output_lines.append("EXTRACTING NON-COMPLIANCE FINDINGS FOR NUHS")
    output_lines.append("="*80)
    output_lines.append("")
    
    # Extract NC standards from Excel
    output_lines.append("Reading Excel file...")
    nc_standards = extract_nc_standards_from_excel(excel_path)
    output_lines.append(f"Found {len(nc_standards)} non-compliant standards:")
    for nc in nc_standards:
        output_lines.append(f"  - {nc['standard']}: {nc['criterion']}")
    output_lines.append("")
    
    # Extract findings from PDF for each standard
    output_lines.append("Extracting findings from PDF...")
    output_lines.append("="*80)
    
    all_findings = {}
    for nc in nc_standards:
        std_num = nc['standard']
        output_lines.append("")
        output_lines.append("="*80)
        output_lines.append(f"STANDARD {std_num}: {nc['criterion']}")
        output_lines.append("="*80)
        
        finding = extract_finding_from_pdf(pdf_path, std_num)
        all_findings[std_num] = finding
        
        if "error" in finding:
            output_lines.append(f"ERROR: {finding['error']}")
        else:
            if "rating" in finding:
                output_lines.append(f"\nRating: {finding['rating']}")
            if "team_findings" in finding:
                output_lines.append(f"\nTeam Findings:")
                team_text = finding['team_findings']
                # Truncate if too long, but keep complete sentences
                if len(team_text) > 1000:
                    # Find last sentence within limit
                    trunc_point = team_text[:1000].rfind('.')
                    if trunc_point > 500:
                        team_text = team_text[:trunc_point+1] + "\n... [truncated]"
                output_lines.append(team_text)
            if "commission_findings" in finding:
                output_lines.append(f"\nCommission Findings:")
                comm_text = finding['commission_findings']
                if len(comm_text) > 1000:
                    trunc_point = comm_text[:1000].rfind('.')
                    if trunc_point > 500:
                        comm_text = comm_text[:trunc_point+1] + "\n... [truncated]"
                output_lines.append(comm_text)
            if finding.get("no_supporting_docs"):
                output_lines.append(f"\nNote: No supporting documents mentioned")
    
    # Write to file
    try:
        with open(output_file, 'w', encoding='utf-8', errors='replace') as f:
            for line in output_lines:
                f.write(str(line) + '\n')
        print(f"\nFindings extracted and saved to: {output_file}")
    except Exception as e:
        print(f"Error saving file: {e}")
        # Print to console as fallback
        for line in output_lines[:50]:  # Print first 50 lines
            safe_print(line)
    
    return all_findings

if __name__ == "__main__":
    findings = main()
