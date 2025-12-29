# Clean AppData Cache Script
# Safely cleans browser caches, WebEx cache, and other temporary files
# Run this script to free up space in AppData folders

Write-Host "=== AppData Cleanup Script ===" -ForegroundColor Cyan
Write-Host "This script will clean safe-to-delete cache files" -ForegroundColor Yellow
Write-Host ""

# Function to safely delete directory contents
function Remove-DirectoryContents {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            $sizeBefore = (Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue | 
                          Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            $sizeGB = [math]::Round($sizeBefore / 1GB, 2)
            
            if ($sizeGB -gt 0.01) {
                Write-Host "Found: $Description ($sizeGB GB)" -ForegroundColor Green
                
                # Ask for confirmation
                $response = Read-Host "Delete this? (y/n)"
                if ($response -eq 'y' -or $response -eq 'Y') {
                    Remove-Item "$Path\*" -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Host "✓ Cleaned: $Description" -ForegroundColor Green
                    return $sizeGB
                } else {
                    Write-Host "Skipped: $Description" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "✗ Error cleaning $Description : $_" -ForegroundColor Red
        }
    }
    return 0
}

$totalFreed = 0

Write-Host "=== Browser Caches ===" -ForegroundColor Cyan

# Edge Cache
$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache" `
    -Description "Edge Browser Cache"

$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache" `
    -Description "Edge Code Cache"

# Chrome Cache
$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache" `
    -Description "Chrome Browser Cache"

$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache" `
    -Description "Chrome Code Cache"

# Chrome Optimization Guide Model (ML models - safe to delete, will rebuild)
$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\OptGuideOnDeviceModel" `
    -Description "Chrome ML Optimization Models"

Write-Host ""
Write-Host "=== Application Caches ===" -ForegroundColor Cyan

# WebEx Cache
$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\WebEx\wbxcache" `
    -Description "WebEx Cache"

# Epic Games Launcher Cache (if not using Epic Games)
$totalFreed += Remove-DirectoryContents `
    -Path "$env:LOCALAPPDATA\EpicGamesLauncher\Saved" `
    -Description "Epic Games Launcher Cache"

# Temp folder cleanup
Write-Host ""
Write-Host "=== Temporary Files ===" -ForegroundColor Cyan
$tempPath = "$env:LOCALAPPDATA\Temp"
if (Test-Path $tempPath) {
    try {
        $tempFiles = Get-ChildItem $tempPath -File -ErrorAction SilentlyContinue
        $tempSize = ($tempFiles | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        $tempSizeGB = [math]::Round($tempSize / 1GB, 2)
        
        if ($tempSizeGB -gt 0.01) {
            $sizeText = "$tempSizeGB GB"
            Write-Host "Found: Temporary Files ($sizeText)" -ForegroundColor Green
            $response = Read-Host "Clean temp files? (y/n)"
            if ($response -eq 'y' -or $response -eq 'Y') {
                $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
                Write-Host "✓ Cleaned: Temporary Files" -ForegroundColor Green
                $totalFreed += $tempSizeGB
            }
        }
    } catch {
        Write-Host "✗ Error cleaning temp files: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Total space freed: $totalFreed GB" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Browser caches will rebuild as you browse." -ForegroundColor Yellow
Write-Host "Note: WebEx cache will rebuild when you use WebEx." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Programs Folder Breakdown ===" -ForegroundColor Cyan
Write-Host "The Programs folder ($env:LOCALAPPDATA\Programs) contains:" -ForegroundColor White
Write-Host "  - Python: 0.61 GB (keep if using Python)" -ForegroundColor Yellow
Write-Host "  - Cursor: 0.56 GB (keep if using Cursor IDE)" -ForegroundColor Yellow
Write-Host "  - Anki: 0.49 GB (keep if using Anki)" -ForegroundColor Yellow
Write-Host "  - Cisco Spark: 0.46 GB (can remove if not using)" -ForegroundColor Yellow
Write-Host "  - Trezor Suite: 0.37 GB (keep if using Trezor)" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Packages Folder Breakdown ===" -ForegroundColor Cyan
Write-Host "The Packages folder ($env:LOCALAPPDATA\Packages) contains Windows Store apps:" -ForegroundColor White
Write-Host "  - Microsoft Teams: 0.6 GB" -ForegroundColor Yellow
Write-Host "  - Windows Client apps: ~0.8 GB" -ForegroundColor Yellow
Write-Host "  - Other Microsoft Store apps: ~0.6 GB" -ForegroundColor Yellow
Write-Host ""
Write-Host "These are installed Windows Store apps. Only remove if you uninstall the apps from Windows Settings." -ForegroundColor Yellow

