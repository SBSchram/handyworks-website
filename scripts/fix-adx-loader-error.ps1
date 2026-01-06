# Fix ADX Loader Access Denied Error
# This script helps identify and disable problematic Office add-ins

Write-Host "=== ADX Loader Access Denied - Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check for Office COM Add-ins
Write-Host "Checking for COM Add-ins..." -ForegroundColor Yellow

$officeVersions = @("16.0", "15.0", "14.0")
$addinsFound = @()

foreach ($version in $officeVersions) {
    $wordAddinsPath = "HKCU:\Software\Microsoft\Office\$version\Word\Add-in Manager"
    $excelAddinsPath = "HKCU:\Software\Microsoft\Office\$version\Excel\Add-in Manager"
    
    if (Test-Path $wordAddinsPath) {
        $addins = Get-ItemProperty "$wordAddinsPath\*" -ErrorAction SilentlyContinue
        foreach ($addin in $addins) {
            if ($addin.PSChildName -like "*ADX*" -or $addin.'(default)' -like "*ADX*") {
                $addinsFound += [PSCustomObject]@{
                    Office = "Word $version"
                    Name = $addin.PSChildName
                    Path = $addin.'(default)'
                    Type = "Add-in Manager"
                }
            }
        }
    }
    
    if (Test-Path $excelAddinsPath) {
        $addins = Get-ItemProperty "$excelAddinsPath\*" -ErrorAction SilentlyContinue
        foreach ($addin in $addins) {
            if ($addin.PSChildName -like "*ADX*" -or $addin.'(default)' -like "*ADX*") {
                $addinsFound += [PSCustomObject]@{
                    Office = "Excel $version"
                    Name = $addin.PSChildName
                    Path = $addin.'(default)'
                    Type = "Add-in Manager"
                }
            }
        }
    }
}

# Check for COM Add-ins in registry
$comAddinsPath = "HKCU:\Software\Microsoft\Office\*\*\Addins"
Get-ChildItem $comAddinsPath -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $addinProps = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($addinProps -and ($addinProps.PSChildName -like "*ADX*" -or $addinProps.FriendlyName -like "*ADX*")) {
        $addinsFound += [PSCustomObject]@{
            Office = $_.PSPath.Split('\')[5]
            Name = $addinProps.PSChildName
            Path = $addinProps.FriendlyName
            Type = "COM Add-in"
        }
    }
}

if ($addinsFound.Count -gt 0) {
    Write-Host "Found ADX-related add-ins:" -ForegroundColor Yellow
    $addinsFound | Format-Table -AutoSize
    Write-Host ""
    Write-Host "RECOMMENDED FIXES:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Disable add-ins manually:" -ForegroundColor White
    Write-Host "   - Open Word/Excel" -ForegroundColor Yellow
    Write-Host "   - Go to File > Options > Add-ins" -ForegroundColor Yellow
    Write-Host "   - Select 'COM Add-ins' and click 'Go'" -ForegroundColor Yellow
    Write-Host "   - Uncheck any ADX-related add-ins" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Or run Office in Safe Mode (disables all add-ins):" -ForegroundColor White
    Write-Host "   - Hold CTRL key while opening Word/Excel" -ForegroundColor Yellow
    Write-Host "   - If error disappears, it's an add-in issue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. To disable via registry (advanced):" -ForegroundColor White
    Write-Host "   The script can disable found add-ins. Continue? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'y' -or $response -eq 'Y') {
        foreach ($addin in $addinsFound) {
            Write-Host "Disabling: $($addin.Name)" -ForegroundColor Green
            # Add registry disable logic here if needed
        }
    }
} else {
    Write-Host "No ADX add-ins found in registry." -ForegroundColor Green
    Write-Host ""
    Write-Host "The error might be from:" -ForegroundColor Yellow
    Write-Host "1. A third-party add-in trying to load ADX components" -ForegroundColor White
    Write-Host "2. Corrupted Office installation" -ForegroundColor White
    Write-Host "3. File permission issues" -ForegroundColor White
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Start Office in Safe Mode (CTRL + double-click Word/Excel)" -ForegroundColor Yellow
    Write-Host "2. Disable all add-ins in File > Options > Add-ins" -ForegroundColor Yellow
    Write-Host "3. Repair Office: Settings > Apps > Microsoft Office > Modify > Quick Repair" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Additional Checks ===" -ForegroundColor Cyan

# Check for common ADX file locations
$adxPaths = @(
    "$env:APPDATA\Microsoft\AddIns",
    "$env:PROGRAMFILES\Common Files\Microsoft Shared\Addins",
    "$env:PROGRAMFILES(X86)\Common Files\Microsoft Shared\Addins"
)

Write-Host "Checking for ADX files in common locations..." -ForegroundColor Yellow
foreach ($path in $adxPaths) {
    if (Test-Path $path) {
        $adxFiles = Get-ChildItem $path -Recurse -Filter "*ADX*" -ErrorAction SilentlyContinue
        if ($adxFiles) {
            Write-Host "Found ADX files in: $path" -ForegroundColor Yellow
            $adxFiles | Select-Object FullName | Format-Table -AutoSize
        }
    }
}

Write-Host ""
Write-Host "=== Manual Steps to Fix ===" -ForegroundColor Cyan
Write-Host "1. Open Word or Excel" -ForegroundColor White
Write-Host "2. Press CTRL while double-clicking to start in Safe Mode" -ForegroundColor Yellow
Write-Host "3. If Safe Mode works, go to File > Options > Add-ins" -ForegroundColor Yellow
Write-Host "4. Select 'COM Add-ins' > 'Go'" -ForegroundColor Yellow
Write-Host "5. Uncheck all add-ins, restart, then re-enable one by one" -ForegroundColor Yellow
Write-Host "6. Identify which add-in causes the error" -ForegroundColor Yellow
Write-Host ""
Write-Host "If problem persists, repair Office installation." -ForegroundColor Yellow



