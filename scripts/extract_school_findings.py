"""
General-purpose findings extraction system for any school.
Extracts non-compliance findings from Excel review tables and PDF reports.
This is the "preliminary work" that makes the analysis engine work.
"""
import openpyxl
import PyPDF2
from pathlib import Path
import re
import json

def extract_nc_standards_from_excel(excel_path):
    """Extract standards marked as NC (Non-Compliance) from Excel file."""
    try:
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
                    # Avoid duplicates
                    if any(nc['standard'] == std_num for nc in nc_standards):
                        continue
                    # Get the criterion name
                    criterion_match = re.search(r'Criterion\s+' + re.escape(std_num) + r'\s*[–-]?\s*(.+?)(?:\s+NC|\s*$)', row_str, re.IGNORECASE)
                    criterion_name = criterion_match.group(1).strip() if criterion_match else ''
                    nc_standards.append({
                        'standard': std_num,
                        'criterion': criterion_name
                    })
        
        return nc_standards
    except Exception as e:
        print(f"Error reading Excel file {excel_path}: {e}")
        return []

def extract_finding_details_from_pdf(pdf_path, standard_num):
    """Extract detailed finding information from PDF for a specific standard."""
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            full_text = ""
            for page in pdf_reader.pages:
                full_text += page.extract_text() + "\n"
    except Exception as e:
        return {"error": f"Could not read PDF: {str(e)}"}
    
    # Find the section for this standard
    # Look for "Criterion 1.03" or "Standard 1.03" or just "1.03" at beginning of section
    std_pattern = re.escape(standard_num)
    
    # Pattern to find the standard section
    # Look for "Criterion X.XX" followed by text until next criterion or standard
    pattern = rf'Criterion\s+{std_pattern}[^\n]*(?:\n|$).*?(?=Criterion\s+\d+\.\d+|Standard\s+\d+\.\d+|$)'
    
    match = re.search(pattern, full_text, re.IGNORECASE | re.DOTALL)
    if not match:
        # Try without "Criterion" prefix
        pattern = rf'\b{std_pattern}\b[^\n]*(?:\n|$).*?(?=\b\d+\.\d+\b|$)'
        match = re.search(pattern, full_text, re.IGNORECASE | re.DOTALL)
    
    if not match:
        return {"error": f"Standard {standard_num} section not found in PDF"}
    
    section_text = match.group(0)
    
    # Extract key information
    result = {
        "standard": standard_num,
        "raw_section": section_text[:2000]  # Keep first 2000 chars for reference
    }
    
    # Extract Rating
    rating_match = re.search(r'Rating:\s*([^\n]+)', section_text, re.IGNORECASE)
    if rating_match:
        result["rating"] = rating_match.group(1).strip()
    
    # Extract Team Findings (the main explanation)
    team_pattern = r'Team Findings\s+(.+?)(?=Commission Findings|Suggested Documentation|No supporting documents|Rating:|Criterion|Standard|$)'
    team_match = re.search(team_pattern, section_text, re.IGNORECASE | re.DOTALL)
    if team_match:
        result["team_findings"] = team_match.group(1).strip()
    
    # Extract Commission Findings (what the commission decided)
    comm_pattern = r'Commission Findings\s+(.+?)(?=Suggested Documentation|No supporting documents|Institution Response|Criterion|Standard|$)'
    comm_match = re.search(comm_pattern, section_text, re.IGNORECASE | re.DOTALL)
    if comm_match:
        result["commission_findings"] = comm_match.group(1).strip()
    
    # Extract Suggested Documentation (what evidence is needed)
    doc_pattern = r'Suggested Documentation\s+(.+?)(?=Institution Response|No supporting documents|Criterion|Standard|$)'
    doc_match = re.search(doc_pattern, section_text, re.IGNORECASE | re.DOTALL)
    if doc_match:
        result["suggested_documentation"] = doc_match.group(1).strip()
    
    # Check for "No supporting documents"
    if re.search(r'No supporting documents', section_text, re.IGNORECASE):
        result["no_supporting_docs"] = True
    
    return result

def structure_findings_for_framework(extracted_findings):
    """
    Convert extracted findings into the framework's expected format.
    Returns a dict in the format of COMMISSION_FINDINGS.
    """
    findings_dict = {}
    
    for std_num, finding_data in extracted_findings.items():
        if "error" in finding_data:
            # Skip if extraction failed
            continue
        
        # Build the finding description
        finding_desc = ""
        if finding_data.get("commission_findings"):
            # Use commission findings if available
            finding_desc = finding_data["commission_findings"]
            # Clean it up - remove "none" or empty indicators
            if finding_desc.lower().strip() in ["(none)", "none", ""]:
                finding_desc = ""
        elif finding_data.get("team_findings"):
            # Fall back to team findings
            finding_desc = finding_data["team_findings"][:500]  # Truncate if too long
        
        if not finding_desc:
            # Default format if nothing extracted
            finding_desc = f"non-compliant for standard {std_num}"
        
        # Build required evidence structure
        # Start with basic structure - will be refined based on suggested documentation
        required_evidence = {}
        
        if finding_data.get("suggested_documentation"):
            # Parse suggested documentation to identify evidence requirements
            doc_text = finding_data["suggested_documentation"].lower()
            
            # Common evidence patterns to look for
            if "training" in doc_text:
                required_evidence["Training Materials"] = "Training materials as specified in commission findings"
            if "policy" in doc_text or "policies" in doc_text:
                required_evidence["Policy Documents"] = "Policy documents as specified in commission findings"
            if "financial" in doc_text or "audit" in doc_text or "budget" in doc_text:
                required_evidence["Financial Documentation"] = "Financial documentation as specified in commission findings"
            if "qualification" in doc_text or "credential" in doc_text or "resume" in doc_text:
                required_evidence["Staff Qualifications"] = "Evidence of staff qualifications as specified in commission findings"
            if "audit" in doc_text or "verification" in doc_text:
                required_evidence["Verification Evidence"] = "Audit or verification evidence as specified in commission findings"
            
            # If no patterns matched, use a generic structure
            if not required_evidence:
                required_evidence["Evidence Required"] = finding_data["suggested_documentation"]
        else:
            # No suggested documentation - use generic structure
            required_evidence["Evidence Required"] = "Evidence as specified in commission findings"
        
        findings_dict[std_num] = {
            "finding": finding_desc,
            "required_evidence": required_evidence,
            "extraction_metadata": {
                "rating": finding_data.get("rating", ""),
                "has_team_findings": bool(finding_data.get("team_findings")),
                "has_commission_findings": bool(finding_data.get("commission_findings")),
                "has_suggested_docs": bool(finding_data.get("suggested_documentation")),
                "no_supporting_docs": finding_data.get("no_supporting_docs", False)
            }
        }
    
    return findings_dict

def extract_school_findings(school_code, excel_path, pdf_path):
    """
    Main function to extract findings for a school.
    Returns findings in framework format.
    """
    print(f"\n{'='*80}")
    print(f"EXTRACTING FINDINGS FOR {school_code}")
    print(f"{'='*80}")
    
    # Step 1: Extract NC standards from Excel
    print(f"\nStep 1: Reading Excel file...")
    print(f"  Path: {excel_path}")
    nc_standards = extract_nc_standards_from_excel(excel_path)
    print(f"  Found {len(nc_standards)} non-compliant standards:")
    for nc in nc_standards:
        print(f"    - {nc['standard']}: {nc['criterion']}")
    
    if not nc_standards:
        print("  WARNING: No NC standards found in Excel file")
        return {}
    
    # Step 2: Extract detailed findings from PDF
    print(f"\nStep 2: Extracting details from PDF...")
    print(f"  Path: {pdf_path}")
    extracted_findings = {}
    
    for nc in nc_standards:
        std_num = nc['standard']
        print(f"  Extracting Standard {std_num}...")
        finding = extract_finding_details_from_pdf(pdf_path, std_num)
        extracted_findings[std_num] = finding
        
        if "error" in finding:
            print(f"    ERROR: {finding['error']}")
        else:
            status = []
            if finding.get("rating"):
                status.append(f"Rating: {finding['rating']}")
            if finding.get("team_findings"):
                status.append("Team Findings: Yes")
            if finding.get("commission_findings"):
                status.append("Commission Findings: Yes")
            if finding.get("suggested_documentation"):
                status.append("Suggested Docs: Yes")
            print(f"    {' | '.join(status) if status else 'Limited information extracted'}")
    
    # Step 3: Structure for framework
    print(f"\nStep 3: Structuring findings for framework...")
    structured_findings = structure_findings_for_framework(extracted_findings)
    print(f"  Structured {len(structured_findings)} standards")
    
    return structured_findings

if __name__ == "__main__":
    # Example usage
    base_dir = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\NUHS\NUHS")
    excel_path = base_dir / "260226 NUHS SVR Rev Tbl.xlsx"
    pdf_path = base_dir / "260223 NUHS SSR, SVR, FIR" / "260223 NUHS SSR, SVR, FIR.pdf"
    
    findings = extract_school_findings("NUHS", excel_path, pdf_path)
    
    # Save to JSON for inspection
    output_file = Path(__file__).parent / "NUHS_findings_structured.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(findings, f, indent=2, ensure_ascii=False)
    print(f"\nStructured findings saved to: {output_file}")
