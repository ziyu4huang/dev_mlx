<#
.SYNOPSIS
    Installs Claude CLI from offline downloaded files.

.DESCRIPTION
    This script installs Claude CLI from previously downloaded offline files.
    Run claude-offline-download.sh on Linux first to download the files,
    then copy the dist folder to Windows and run this script.

.PARAMETER OfflineDir
    Directory containing the offline files (version.txt, manifest.json, platform folders).
    Default: ./dist/

.PARAMETER Target
    Version target: 'stable', 'latest', or specific version like '1.2.3'.
    Default: Uses the version from offline files

.PARAMETER Platform
    Force specific platform: 'x64' or 'arm64'. Auto-detected if not specified.

.EXAMPLE
    ./claude-offline-install.ps1
    Installs using files in ./dist/

.EXAMPLE
    ./claude-offline-install.ps1 -OfflineDir D:\offline\claude
    Installs from specified directory

.EXAMPLE
    ./claude-offline-install.ps1 -KeepBinary
    Installs and keeps the downloaded binary (useful for reinstall)
#>

param(
    [string]$OfflineDir = "./dist",
    [string]$Target,
    [ValidateSet('x64', 'arm64')]
    [string]$Platform,
    [switch]$KeepBinary
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Resolve offline directory path
# If default value used, try script directory first, then current directory
if ($OfflineDir -eq "./dist") {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    if ($scriptDir -and (Test-Path "$scriptDir/../dist/version.txt")) {
        $OfflineDir = "$scriptDir/../dist"
    } elseif (Test-Path "./dist/version.txt") {
        $OfflineDir = "./dist"
    }
}
$OfflineDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OfflineDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Claude CLI Offline Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for 32-bit Windows
if (-not [Environment]::Is64BitProcess) {
    Write-Error "Claude Code does not support 32-bit Windows. Please use a 64-bit version of Windows."
    exit 1
}

# Validate offline directory
if (-not (Test-Path $OfflineDir)) {
    Write-Error "Offline directory not found: $OfflineDir"
    Write-Host ""
    Write-Host "Please run the download script first:" -ForegroundColor Yellow
    Write-Host "  On Linux: ./claude-offline-download.sh -o ./dist" -ForegroundColor Yellow
    Write-Host "  Then copy the 'dist' folder to this machine" -ForegroundColor Yellow
    exit 1
}

# Check required files
$requiredFiles = @("version.txt", "manifest.json")
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path "$OfflineDir/$file")) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error "Missing required files in offline directory: $($missingFiles -join ', ')"
    exit 1
}

# Read version
$version = Get-Content "$OfflineDir/version.txt" -Raw
Write-Host "Offline version: $version" -ForegroundColor Cyan

# Read offline info if available
if (Test-Path "$OfflineDir/offline-info.json") {
    $offlineInfo = Get-Content "$OfflineDir/offline-info.json" | ConvertFrom-Json
    Write-Host "Download date: $($offlineInfo.downloadDate)" -ForegroundColor Gray
}

# Determine platform
if ($Platform) {
    $platformName = "win32-$Platform"
} else {
    # Auto-detect platform
    if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
        $platformName = "win32-arm64"
    } else {
        $platformName = "win32-x64"
    }
}
Write-Host "Target platform: $platformName" -ForegroundColor Cyan

# Check platform directory
$platformDir = "$OfflineDir/$platformName"
if (-not (Test-Path $platformDir)) {
    Write-Error "Platform '$platformName' not found in offline directory"
    Write-Host ""
    Write-Host "Available platforms:" -ForegroundColor Yellow
    Get-ChildItem -Path $OfflineDir -Directory | Where-Object { $_.Name -like "win32-*" } | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "To download this platform, run on Linux:" -ForegroundColor Yellow
    Write-Host "  ./claude-offline-download.sh -p $($platformName -replace 'win32-', '')" -ForegroundColor Yellow
    exit 1
}

# Check binary
$binaryPath = "$platformDir/claude.exe"
if (-not (Test-Path $binaryPath)) {
    Write-Error "Binary not found: $binaryPath"
    exit 1
}

# Verify checksum if available
$checksumFile = "$platformDir/checksum.txt"
if (Test-Path $checksumFile) {
    Write-Host ""
    Write-Host "Verifying checksum..." -ForegroundColor Yellow

    $expectedChecksum = Get-Content $checksumFile -Raw
    $actualChecksum = (Get-FileHash -Path $binaryPath -Algorithm SHA256).Hash.ToLower()

    if ($actualChecksum -ne $expectedChecksum) {
        Write-Error "Checksum verification failed!"
        Write-Host "  Expected: $expectedChecksum" -ForegroundColor Red
        Write-Host "  Actual:   $actualChecksum" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Checksum verified OK" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Warning: No checksum file found, skipping verification" -ForegroundColor Yellow
}

# Run installation
Write-Host ""
Write-Host "Installing Claude Code..." -ForegroundColor Yellow

try {
    if ($Target) {
        & $binaryPath install $Target
    } else {
        & $binaryPath install
    }
}
catch {
    Write-Error "Installation failed: $_"
    exit 1
}

Write-Host ""
Write-Host "$([char]0x2705) Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Run 'claude' to start!" -ForegroundColor Cyan
Write-Host ""

# Cleanup (unless KeepBinary is specified)
if (-not $KeepBinary) {
    Write-Host "Note: Offline files are preserved. To clean up, delete: $OfflineDir" -ForegroundColor Gray
}
