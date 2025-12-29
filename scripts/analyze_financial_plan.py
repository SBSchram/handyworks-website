import PyPDF2
from pathlib import Path
import re

PDF_DIR = Path(r"C:\Users\sbsch\Dropbox\My Documents\ACAHM\Feb 2026 Meeting\VU\251201 VU Inst-DAcCHM Pre Accred Sup Rpt\attachments")
FINANCIAL_PLAN = PDF_DIR / "EX9.01.1 Financial Plan.pdf"

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"Total pages: {len(pdf_reader.pages)}\n")
            for i, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                print(f"{'='*80}")
                print(f"PAGE {i}")
                print(f"{'='*80}\n")
                print(page_text)
                print("\n")
                text += page_text + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def analyze_for_9_02_requirements(text):
    """Analyze the document for Standard 9.02 requirements."""
    text_lower = text.lower()
    
    print("\n" + "="*80)
    print("ANALYSIS FOR STANDARD 9.02 REQUIREMENTS")
    print("="*80 + "\n")
    
    # Required elements for 9.02:
    # 1. Quarterly financial reports for 2025 Q2 and Q3 with narrative interpretations of:
    #    - Budget vs. Actual
    #    - Balance Sheet
    #    - Income Statement
    #    - Cash Flow Statement
    # 2. Financial plan approved by governing board addressing:
    #    - Related party transactions
    #    - Illiquid assets (receivables from shareholder)
    #    - Negative shareholder's equity
    #    - Low cash balances due to shareholder distributions
    
    print("1. QUARTERLY FINANCIAL REPORTS (2025 Q2 and Q3):")
    print("-" * 80)
    q2_found = 'q2' in text_lower or 'second quarter' in text_lower or 'quarter 2' in text_lower
    q3_found = 'q3' in text_lower or 'third quarter' in text_lower or 'quarter 3' in text_lower
    year_2025 = '2025' in text
    
    if q2_found:
        print("[FOUND] Q2 2025 mentioned")
        q2_context = re.search(r'.{0,200}(q2|second quarter|quarter 2).{0,200}', text_lower)
        if q2_context:
            print(f"  Context: {q2_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Q2 2025 NOT found")
    
    if q3_found:
        print("[FOUND] Q3 2025 mentioned")
        q3_context = re.search(r'.{0,200}(q3|third quarter|quarter 3).{0,200}', text_lower)
        if q3_context:
            print(f"  Context: {q3_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Q3 2025 NOT found")
    
    if not year_2025:
        print("[NOT FOUND] Year 2025 NOT explicitly mentioned")
    
    print("\n2. FINANCIAL STATEMENT COMPONENTS:")
    print("-" * 80)
    
    # Budget vs. Actual
    budget_actual = 'budget' in text_lower and ('actual' in text_lower or 'vs' in text_lower or 'versus' in text_lower)
    if budget_actual:
        print("[FOUND] Budget vs. Actual mentioned")
        budget_context = re.search(r'.{0,200}budget.{0,100}(actual|vs|versus).{0,200}', text_lower)
        if budget_context:
            print(f"  Context: {budget_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Budget vs. Actual NOT found")
    
    # Balance Sheet
    balance_sheet = 'balance sheet' in text_lower or 'statement of financial position' in text_lower
    if balance_sheet:
        print("[FOUND] Balance Sheet mentioned")
        bs_context = re.search(r'.{0,200}(balance sheet|statement of financial position).{0,200}', text_lower)
        if bs_context:
            print(f"  Context: {bs_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Balance Sheet NOT found")
    
    # Income Statement
    income_stmt = 'income statement' in text_lower or 'profit and loss' in text_lower or 'p&l' in text_lower or 'profit & loss' in text_lower
    if income_stmt:
        print("[FOUND] Income Statement mentioned")
        is_context = re.search(r'.{0,200}(income statement|profit and loss|p&l).{0,200}', text_lower)
        if is_context:
            print(f"  Context: {is_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Income Statement NOT found")
    
    # Cash Flow Statement
    cash_flow = 'cash flow' in text_lower
    if cash_flow:
        print("[FOUND] Cash Flow Statement mentioned")
        cf_context = re.search(r'.{0,200}cash flow.{0,200}', text_lower)
        if cf_context:
            print(f"  Context: {cf_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Cash Flow Statement NOT found")
    
    # Narrative interpretations
    print("\n3. NARRATIVE INTERPRETATIONS:")
    print("-" * 80)
    narrative = 'narrative' in text_lower or 'interpretation' in text_lower or 'discussion' in text_lower or 'analysis' in text_lower or 'explanation' in text_lower
    if narrative:
        print("[FOUND] Narrative/interpretation content found")
    else:
        print("[NOT FOUND] Narrative interpretations NOT explicitly found")
    
    print("\n4. FINANCIAL PLAN ELEMENTS:")
    print("-" * 80)
    
    # Governing board approval
    board_approval = 'board' in text_lower and ('approve' in text_lower or 'approval' in text_lower or 'approved' in text_lower)
    if board_approval:
        print("[FOUND] Governing board approval mentioned")
        board_context = re.search(r'.{0,200}board.{0,100}(approve|approval|approved).{0,200}', text_lower)
        if board_context:
            print(f"  Context: {board_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Governing board approval NOT found")
    
    print("\n5. SPECIFIC CONCERNS ADDRESSED:")
    print("-" * 80)
    
    # Related party transactions
    related_party = 'related party' in text_lower or 'related-party' in text_lower
    if related_party:
        print("[FOUND] Related party transactions mentioned")
        rp_context = re.search(r'.{0,200}related.{0,50}party.{0,200}', text_lower)
        if rp_context:
            print(f"  Context: {rp_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Related party transactions NOT found")
    
    # Illiquid assets / receivables from shareholder
    receivables = 'receivable' in text_lower and 'shareholder' in text_lower
    illiquid = 'illiquid' in text_lower
    if receivables or illiquid:
        print("[FOUND] Receivables from shareholder / illiquid assets mentioned")
        if receivables:
            rec_context = re.search(r'.{0,200}receivable.{0,100}shareholder.{0,200}', text_lower)
            if rec_context:
                print(f"  Context: {rec_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Receivables from shareholder / illiquid assets NOT found")
    
    # Negative shareholder's equity
    negative_equity = ('negative' in text_lower or 'deficit' in text_lower) and ('equity' in text_lower or 'shareholder' in text_lower)
    if negative_equity:
        print("[FOUND] Negative shareholder's equity mentioned")
        ne_context = re.search(r'.{0,200}(negative|deficit).{0,100}(equity|shareholder).{0,200}', text_lower)
        if ne_context:
            print(f"  Context: {ne_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Negative shareholder's equity NOT found")
    
    # Low cash balances due to shareholder distributions
    cash_low = 'cash' in text_lower and ('low' in text_lower or 'balance' in text_lower)
    distribution = 'distribution' in text_lower and 'shareholder' in text_lower
    if cash_low or distribution:
        print("[FOUND] Cash balances / shareholder distributions mentioned")
        if distribution:
            dist_context = re.search(r'.{0,200}distribution.{0,100}shareholder.{0,200}', text_lower)
            if dist_context:
                print(f"  Context: {dist_context.group(0)[:300]}...")
    else:
        print("[NOT FOUND] Low cash balances / shareholder distributions NOT found")
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print("\nThis document appears to be a Financial Plan (not quarterly reports).")
    print("The analysis above shows which elements of Standard 9.02 requirements are addressed.")
    print("\nNOTE: Standard 9.02 requires BOTH:")
    print("  1. Quarterly financial reports for 2025 Q2 and Q3 (with narrative interpretations)")
    print("  2. Financial plan approved by governing board (addressing specific concerns)")

if __name__ == "__main__":
    print("Extracting and analyzing EX9.01.1 Financial Plan.pdf...\n")
    text = extract_text_from_pdf(FINANCIAL_PLAN)
    analyze_for_9_02_requirements(text)
