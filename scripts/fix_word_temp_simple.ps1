# Simple PowerShell script to fix Word temp file issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Word Temp File Diagnostic Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check TEMP environment variable
$tempPath = $env:TEMP
$tmpPath = $env:TMP

Write-Host "TEMP Directory: $tempPath" -ForegroundColor Yellow
Write-Host "TMP Directory: $tmpPath" -ForegroundColor Yellow
Write-Host ""

# Test if temp directory exists and is writable
if (Test-Path $tempPath) {
    Write-Host "[OK] Temp directory exists" -ForegroundColor Green
    
    # Test write permissions
    try {
        $testFile = Join-Path $tempPath "word_test_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -ErrorAction Stop
        Write-Host "[OK] Temp directory is writable" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Temp directory is NOT writable: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUTION: Right-click the temp folder, go to Properties > Security" -ForegroundColor Yellow
        Write-Host "         Ensure your user has Full Control permissions" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Temp directory does not exist: $tempPath" -ForegroundColor Red
    Write-Host "Creating temp directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $tempPath -Force | Out-Null
        Write-Host "[OK] Created temp directory" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Could not create temp directory: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Check for Word lock files
Write-Host "Checking for Word lock files..." -ForegroundColor Cyan
$lockFiles = Get-ChildItem -Path $tempPath -Filter "~$*" -ErrorAction SilentlyContinue
if ($lockFiles) {
    Write-Host "Found $($lockFiles.Count) lock file(s)" -ForegroundColor Yellow
    Write-Host "These are safe to delete if Word is closed" -ForegroundColor Yellow
} else {
    Write-Host "[OK] No lock files found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECOMMENDED FIXES:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Close ALL Word windows completely" -ForegroundColor White
Write-Host "2. Check Task Manager - ensure WINWORD.EXE is not running" -ForegroundColor White
Write-Host "3. Clear temp files: Remove-Item '$tempPath\~$*' -Force" -ForegroundColor White
Write-Host "4. Try opening Word as Administrator" -ForegroundColor White
Write-Host "5. If still failing, set TEMP to C:\Temp (see FIX_WORD_TEMP_ERROR.md)" -ForegroundColor White
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
