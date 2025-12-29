# Automated Setup Script for Evidence Analysis Framework
# Run this script to automate the setup process
# Right-click and select "Run with PowerShell" or run from PowerShell: .\SETUP_SCRIPT.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Evidence Analysis Framework Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  [OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Python not found!" -ForegroundColor Red
    Write-Host "  Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  Ensure 'Add Python to PATH' is checked during installation." -ForegroundColor Yellow
    exit 1
}

# Check if pip is available
Write-Host ""
Write-Host "Step 2: Checking pip (Python package manager)..." -ForegroundColor Yellow
try {
    $pipVersion = python -m pip --version 2>&1
    Write-Host "  [OK] pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] pip not found!" -ForegroundColor Red
    Write-Host "  Please reinstall Python with pip included." -ForegroundColor Yellow
    exit 1
}

# Install required libraries
Write-Host ""
Write-Host "Step 3: Installing required Python libraries..." -ForegroundColor Yellow
try {
    Write-Host "  Installing PyPDF2..." -ForegroundColor White
    python -m pip install PyPDF2 --quiet
    Write-Host "  [OK] PyPDF2 installed successfully" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to install PyPDF2" -ForegroundColor Red
    Write-Host "  Try manually: python -m pip install PyPDF2" -ForegroundColor Yellow
    exit 1
}

# Verify installation
Write-Host ""
Write-Host "Step 4: Verifying installation..." -ForegroundColor Yellow
try {
    $pyPDF2Check = python -m pip show PyPDF2 2>&1
    if ($pyPDF2Check -match "Name: PyPDF2") {
        Write-Host "  [OK] PyPDF2 verification successful" -ForegroundColor Green
    } else {
        throw "Verification failed"
    }
} catch {
    Write-Host "  [WARNING] Could not verify PyPDF2 installation" -ForegroundColor Yellow
}

# Check for framework files
Write-Host ""
Write-Host "Step 5: Checking for framework files..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frameworkFile = Join-Path $scriptDir "evidence_analysis_framework.py"
$summaryFile = Join-Path $scriptDir "generate_commissioner_summary.py"

if (Test-Path $frameworkFile) {
    Write-Host "  [OK] evidence_analysis_framework.py found" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] evidence_analysis_framework.py not found in current directory" -ForegroundColor Yellow
    Write-Host "  Expected location: $frameworkFile" -ForegroundColor Yellow
}

if (Test-Path $summaryFile) {
    Write-Host "  [OK] generate_commissioner_summary.py found" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] generate_commissioner_summary.py not found in current directory" -ForegroundColor Yellow
    Write-Host "  Expected location: $summaryFile" -ForegroundColor Yellow
}

# Configuration reminder
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Before running the analysis:" -ForegroundColor Yellow
Write-Host "1. Open evidence_analysis_framework.py in a text editor" -ForegroundColor White
Write-Host "2. Update PDF_DIR to point to your attachments folder" -ForegroundColor White
Write-Host "3. Save the file" -ForegroundColor White
Write-Host ""
Write-Host "Then run:" -ForegroundColor Yellow
Write-Host "  python generate_commissioner_summary.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see COMMISSIONER_INSTRUCTIONS.md" -ForegroundColor White
Write-Host ""
