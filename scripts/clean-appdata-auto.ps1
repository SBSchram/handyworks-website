# Clean AppData Cache Script (Auto Mode)
Write-Host "=== AppData Cleanup Script (Auto Mode) ===" -ForegroundColor Cyan
Write-Host "Cleaning safe-to-delete cache files automatically..." -ForegroundColor Yellow
Write-Host ""

$totalFreed = 0

function Remove-DirectoryContents {
    param([string]$Path, [string]$Description)
    if (Test-Path $Path) {
        try {
            $sizeBefore = (Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            $sizeGB = [math]::Round($sizeBefore / 1GB, 2)
            if ($sizeGB -gt 0.01) {
                Write-Host "Cleaning: $Description ($sizeGB GB)" -ForegroundColor Green
                Remove-Item "$Path\*" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  Cleaned: $Description" -ForegroundColor Green
                return $sizeGB
            }
        } catch {
            Write-Host "  Error cleaning $Description : $_" -ForegroundColor Red
        }
    }
    return 0
}

Write-Host "=== Browser Caches ===" -ForegroundColor Cyan
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache" -Description "Edge Browser Cache"
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache" -Description "Edge Code Cache"
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache" -Description "Chrome Browser Cache"
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache" -Description "Chrome Code Cache"
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\OptGuideOnDeviceModel" -Description "Chrome ML Optimization Models"

Write-Host ""
Write-Host "=== Application Caches ===" -ForegroundColor Cyan
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\WebEx\wbxcache" -Description "WebEx Cache"
$totalFreed += Remove-DirectoryContents -Path "$env:LOCALAPPDATA\EpicGamesLauncher\Saved" -Description "Epic Games Launcher Cache"

Write-Host ""
Write-Host "=== Temporary Files ===" -ForegroundColor Cyan
$tempPath = "$env:LOCALAPPDATA\Temp"
if (Test-Path $tempPath) {
    try {
        $tempFiles = Get-ChildItem $tempPath -File -ErrorAction SilentlyContinue
        $tempSize = ($tempFiles | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        $tempSizeGB = [math]::Round($tempSize / 1GB, 2)
        if ($tempSizeGB -gt 0.01) {
            Write-Host "Cleaning: Temporary Files ($tempSizeGB GB)" -ForegroundColor Green
            $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
            Write-Host "  Cleaned: Temporary Files" -ForegroundColor Green
            $totalFreed += $tempSizeGB
        }
    } catch {
        Write-Host "  Error cleaning temp files: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Total space freed: $totalFreed GB" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Browser caches will rebuild as you browse." -ForegroundColor Yellow
Write-Host "Note: WebEx cache will rebuild when you use WebEx." -ForegroundColor Yellow
