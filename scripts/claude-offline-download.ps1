<#
.SYNOPSIS
    Downloads Claude CLI binaries for offline installation.

.DESCRIPTION
    This script downloads all necessary files for offline Claude CLI installation:
    - Version info
    - Manifest with checksums
    - Binaries for both win32-x64 and win32-arm64 platforms

    Files are saved to ./dist/ folder for later offline installation.

.PARAMETER OutputDir
    Directory to save downloaded files. Default: ./dist/

.PARAMETER Platform
    Platform to download: 'x64', 'arm64', or 'all'. Default: 'all'

.EXAMPLE
    ./claude-offline-download.ps1
    Downloads all platforms to ./dist/

.EXAMPLE
    ./claude-offline-download.ps1 -Platform x64
    Downloads only win32-x64 platform

.EXAMPLE
    ./claude-offline-download.ps1 -OutputDir D:\offline\claude
    Downloads to specified directory
#>

param(
    [string]$OutputDir = "./dist",
    [ValidateSet('x64', 'arm64', 'all')]
    [string]$Platform = "x64"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

$GCS_BUCKET = "https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases"

# Create output directory
$OutputDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputDir)
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Claude CLI Offline Download Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get latest version
Write-Host "[1/4] Fetching latest version..." -ForegroundColor Yellow
try {
    $version = Invoke-RestMethod -Uri "$GCS_BUCKET/latest" -ErrorAction Stop
    Write-Host "  Version: $version" -ForegroundColor Green
}
catch {
    Write-Error "Failed to get latest version: $_"
    exit 1
}

# Save version info
$version | Out-File -FilePath "$OutputDir/version.txt" -Encoding utf8 -NoNewline

# Step 2: Download manifest
Write-Host "[2/4] Downloading manifest..." -ForegroundColor Yellow
$manifestPath = "$OutputDir/manifest.json"
try {
    Invoke-WebRequest -Uri "$GCS_BUCKET/$version/manifest.json" -OutFile $manifestPath -ErrorAction Stop
    $manifest = Get-Content $manifestPath | ConvertFrom-Json
    Write-Host "  Manifest saved: $manifestPath" -ForegroundColor Green
}
catch {
    Write-Error "Failed to download manifest: $_"
    exit 1
}

# Step 3: Determine platforms to download
$platforms = @()
if ($Platform -eq 'all') {
    $platforms = @('win32-x64', 'win32-arm64')
} elseif ($Platform -eq 'x64') {
    $platforms = @('win32-x64')
} else {
    $platforms = @('win32-arm64')
}

# Step 4: Download binaries
Write-Host "[3/4] Downloading binaries..." -ForegroundColor Yellow

foreach ($plat in $platforms) {
    Write-Host "  Processing $plat..." -ForegroundColor Cyan

    # Get checksum from manifest
    $checksum = $manifest.platforms.$plat.checksum
    if (-not $checksum) {
        Write-Warning "  Platform $plat not found in manifest, skipping..."
        continue
    }
    Write-Host "    Expected checksum: $checksum" -ForegroundColor Gray

    # Create platform directory
    $platDir = "$OutputDir/$plat"
    New-Item -ItemType Directory -Force -Path $platDir | Out-Null

    # Download binary
    $binaryPath = "$platDir/claude.exe"
    try {
        Invoke-WebRequest -Uri "$GCS_BUCKET/$version/$plat/claude.exe" -OutFile $binaryPath -ErrorAction Stop
        Write-Host "    Downloaded: $binaryPath" -ForegroundColor Green
    }
    catch {
        Write-Error "    Failed to download binary: $_"
        continue
    }

    # Verify checksum
    $actualChecksum = (Get-FileHash -Path $binaryPath -Algorithm SHA256).Hash.ToLower()
    if ($actualChecksum -ne $checksum) {
        Write-Error "    Checksum verification failed!"
        Write-Host "      Expected: $checksum" -ForegroundColor Red
        Write-Host "      Actual:   $actualChecksum" -ForegroundColor Red
        Remove-Item -Force $binaryPath -ErrorAction SilentlyContinue
        continue
    }
    Write-Host "    Checksum verified OK" -ForegroundColor Green

    # Save checksum for offline verification
    $checksum | Out-File -FilePath "$platDir/checksum.txt" -Encoding utf8 -NoNewline
}

# Step 5: Create offline install info
Write-Host "[4/4] Creating offline installation metadata..." -ForegroundColor Yellow

$offlineInfo = @{
    version = $version
    downloadDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    platforms = $platforms
    gcsBucket = $GCS_BUCKET
}

$offlineInfo | ConvertTo-Json | Out-File -FilePath "$OutputDir/offline-info.json" -Encoding utf8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Download Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files saved to: $OutputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Get-ChildItem -Path $OutputDir -Recurse -File | ForEach-Object {
    $size = "{0:N2} MB" -f ($_.Length / 1MB)
    $relativePath = $_.FullName.Substring($OutputDir.Length + 1)
    Write-Host "  $relativePath ($size)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "To install offline, copy the '$OutputDir' folder to the target machine" -ForegroundColor Yellow
Write-Host "and run: ./claude-offline-install.ps1 -OfflineDir `"$OutputDir`"" -ForegroundColor Yellow
Write-Host ""
