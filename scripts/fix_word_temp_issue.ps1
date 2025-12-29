# PowerShell script to fix Word temp file issues

Write-Host "Checking Word temp file environment..." -ForegroundColor Cyan

# Check TEMP environment variable
$tempPath = $env:TEMP
$tmpPath = $env:TMP

Write-Host "`nTEMP: $tempPath" -ForegroundColor Yellow
Write-Host "TMP: $tmpPath" -ForegroundColor Yellow

# Test if temp directory exists and is writable
if (Test-Path $tempPath) {
    Write-Host "`n✓ Temp directory exists: $tempPath" -ForegroundColor Green
    
    # Test write permissions
    try {
        $testFile = Join-Path $tempPath "word_test_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -ErrorAction Stop
        Write-Host "✓ Temp directory is writable" -ForegroundColor Green
    } catch {
        Write-Host "✗ Temp directory is NOT writable: $_" -ForegroundColor Red
        Write-Host "`nTrying to fix permissions..." -ForegroundColor Yellow
        try {
            $acl = Get-Acl $tempPath
            $permission = "BUILTIN\Users","FullControl","ContainerInherit,ObjectInherit","None","Allow"
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
            $acl.SetAccessRule($accessRule)
            Set-Acl $tempPath $acl
            Write-Host "✓ Permissions updated" -ForegroundColor Green
        } catch {
            Write-Host "✗ Could not fix permissions. You may need to run as Administrator." -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n✗ Temp directory does not exist: $tempPath" -ForegroundColor Red
    Write-Host "Creating temp directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $tempPath -Force | Out-Null
        Write-Host "✓ Created temp directory" -ForegroundColor Green
    } catch {
        Write-Host "✗ Could not create temp directory: $_" -ForegroundColor Red
    }
}

# Check for Word lock files and suggest cleanup
Write-Host "`nChecking for Word lock files (~$*.docx)..." -ForegroundColor Cyan
$lockFiles = Get-ChildItem -Path $tempPath -Filter "~$*.docx" -ErrorAction SilentlyContinue
if ($lockFiles) {
    Write-Host "Found $($lockFiles.Count) Word lock file(s). These can be safely deleted." -ForegroundColor Yellow
    $response = Read-Host "Delete lock files? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        $lockFiles | Remove-Item -Force
        Write-Host "✓ Lock files deleted" -ForegroundColor Green
    }
} else {
    Write-Host "✓ No lock files found" -ForegroundColor Green
}

# Suggest alternative: Save to Documents folder instead
Write-Host "`n" -NoNewline
Write-Host "Alternative Solution:" -ForegroundColor Cyan
Write-Host "If Word still has issues, try saving the documents to a different location" -ForegroundColor Yellow
Write-Host "such as: C:\Users\$env:USERNAME\Documents\Word_Documents" -ForegroundColor Yellow

Write-Host "`nDone!" -ForegroundColor Green
