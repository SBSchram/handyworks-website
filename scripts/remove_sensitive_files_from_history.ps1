# Script to remove sensitive ACAHM files from entire git history
# WARNING: This rewrites git history. Make a backup first!

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "REMOVE SENSITIVE FILES FROM GIT HISTORY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Red
Write-Host "Make sure you have a backup of your repository." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Have you created a backup? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Please create a backup first. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Removing sensitive files from git history..." -ForegroundColor Green
Write-Host ""

# List of all sensitive files to remove
$sensitiveFiles = @(
    "INFORMATION_EXPOSED_EVEN_WITH_PRIVACY_MODE.md",
    "INFORMATION_EXPOSED_EVEN_WITH_PRIVACY_MODE.docx",
    "AI_DATA_USAGE_RISK_ASSESSMENT.md",
    "AI_DATA_USAGE_RISK_ASSESSMENT.docx",
    "DATA_EXPOSURE_REPORT.md",
    "DATA_EXPOSURE_REPORT.docx",
    "CURSOR_SUPPORT_REQUEST.md",
    "CURSOR_SUPPORT_REQUEST.docx",
    "AAHW_Evidence_Analysis_Summary.docx",
    "NUHS_Evidence_Analysis_Summary.docx",
    "VU_Evidence_Analysis_Summary.docx",
    "scripts/run_all_schools_analysis.py",
    "scripts/run_analysis_for_school.py",
    "scripts/run_analysis_all_schools.py",
    "scripts/extract_school_findings.py",
    "scripts/extract_findings_from_reports.py",
    "scripts/generate_commissioner_summary.py",
    "scripts/generate_commissioner_summary_docx.py",
    "scripts/evidence_analysis_framework.py",
    "scripts/evaluate_compliance_evidence.py",
    "scripts/read_reviewer_spreadsheet.py",
    "scripts/analyze_financial_plan.py",
    "scripts/create_standard_reviews.py",
    "scripts/extract_compliance_details.py",
    "scripts/search_compliance_content.py",
    "scripts/analyze_pdfs.py",
    "scripts/extract_resume.py",
    "scripts/AAHW_findings_extracted.json",
    "scripts/NUHS_findings_extracted.json",
    "scripts/NUHS_findings_structured.json",
    "scripts/NUHS_findings_extraction.txt"
)

# Build the filter-branch command using the file list
$fileListFile = Join-Path $PSScriptRoot "sensitive-files-list.txt"
if (Test-Path $fileListFile) {
    Write-Host "Using file list from: $fileListFile" -ForegroundColor Cyan
    $files = Get-Content $fileListFile | Where-Object { $_.Trim() -ne "" }
    $fileList = $files -join " "
} else {
    $fileList = $sensitiveFiles -join " "
}

$command = "git filter-branch --force --index-filter `"git rm --cached --ignore-unmatch $fileList`" --prune-empty --tag-name-filter cat -- --all"

Write-Host "Running git filter-branch..." -ForegroundColor Cyan
Write-Host "This may take several minutes depending on repository size..." -ForegroundColor Yellow
Write-Host ""

# Execute the command
Invoke-Expression $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS: Files removed from git history" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Verify the files are gone: git log --all --full-history -- <filename>" -ForegroundColor White
    Write-Host "2. Force push to remote: git push origin --force --all" -ForegroundColor White
    Write-Host "3. Force push tags: git push origin --force --tags" -ForegroundColor White
    Write-Host ""
    Write-Host "WARNING: Force pushing rewrites remote history!" -ForegroundColor Red
    Write-Host "Make sure all collaborators are aware and have pulled the cleaned history." -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "ERROR: Command failed. Check the output above." -ForegroundColor Red
    Write-Host "You may need to restore from backup: git reset --hard refs/original/refs/heads/main" -ForegroundColor Yellow
}

