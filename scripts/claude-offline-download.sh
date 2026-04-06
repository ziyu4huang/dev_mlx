#!/bin/bash
#
# Claude CLI Offline Download Tool
#
# Downloads Claude CLI binaries for offline installation on Windows.
# Run this on Linux/WSL to download files, then copy to Windows for installation.
#
# Usage:
#   ./claude-offline-download.sh              # Download all platforms to ./dist/
#   ./claude-offline-download.sh -p x64       # Download only win32-x64
#   ./claude-offline-download.sh -o /path/to  # Download to specific directory
#

set -euo pipefail

# Configuration
GCS_BUCKET="https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases"
OUTPUT_DIR="./dist"
PLATFORM="x64"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Parse arguments
while getopts "o:p:h" opt; do
    case $opt in
        o) OUTPUT_DIR="$OPTARG" ;;
        p) PLATFORM="$OPTARG" ;;
        h)
            echo "Usage: $0 [-o OUTPUT_DIR] [-p PLATFORM]"
            echo ""
            echo "Options:"
            echo "  -o DIR     Output directory (default: ./dist)"
            echo "  -p PLATFORM Platform to download: x64, arm64, or all (default: all)"
            echo "  -h         Show this help"
            exit 0
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# Validate platform
if [[ ! "$PLATFORM" =~ ^(x64|arm64|all)$ ]]; then
    echo -e "${RED}Error: Invalid platform '$PLATFORM'. Must be x64, arm64, or all${NC}"
    exit 1
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Claude CLI Offline Download Tool${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR=$(realpath "$OUTPUT_DIR")

# Step 1: Get latest version
echo -e "${YELLOW}[1/4] Fetching latest version...${NC}"
VERSION=$(curl -sSL "$GCS_BUCKET/latest")
if [[ -z "$VERSION" ]]; then
    echo -e "${RED}Failed to get latest version${NC}"
    exit 1
fi
echo -e "  ${GREEN}Version: $VERSION${NC}"
echo -n "$VERSION" > "$OUTPUT_DIR/version.txt"

# Step 2: Download manifest
echo -e "${YELLOW}[2/4] Downloading manifest...${NC}"
MANIFEST_URL="$GCS_BUCKET/$VERSION/manifest.json"
MANIFEST_PATH="$OUTPUT_DIR/manifest.json"

if ! curl -sSL "$MANIFEST_URL" -o "$MANIFEST_PATH"; then
    echo -e "${RED}Failed to download manifest${NC}"
    exit 1
fi
echo -e "  ${GREEN}Manifest saved: $MANIFEST_PATH${NC}"

# Step 3: Determine platforms
if [[ "$PLATFORM" == "all" ]]; then
    PLATFORMS=("win32-x64" "win32-arm64")
elif [[ "$PLATFORM" == "x64" ]]; then
    PLATFORMS=("win32-x64")
else
    PLATFORMS=("win32-arm64")
fi

# Step 4: Download binaries
echo -e "${YELLOW}[3/4] Downloading binaries...${NC}"

for PLAT in "${PLATFORMS[@]}"; do
    echo -e "  ${CYAN}Processing $PLAT...${NC}"

    # Extract checksum from manifest (no jq dependency)
    # Use tr to flatten JSON to single line, then extract checksum
    CHECKSUM=$(tr -d '\n' < "$MANIFEST_PATH" | \
                grep -o "\"$PLAT\"[^}]*\"checksum\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | \
                sed 's/.*"checksum"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

    if [[ -z "$CHECKSUM" ]]; then
        echo -e "  ${YELLOW}Warning: Platform $PLAT not found in manifest, skipping...${NC}"
        continue
    fi
    echo -e "    ${GRAY}Expected checksum: $CHECKSUM${NC}"

    # Create platform directory
    PLAT_DIR="$OUTPUT_DIR/$PLAT"
    mkdir -p "$PLAT_DIR"

    # Download binary
    BINARY_PATH="$PLAT_DIR/claude.exe"
    BINARY_URL="$GCS_BUCKET/$VERSION/$PLAT/claude.exe"

    echo -e "    ${GRAY}Downloading from: $BINARY_URL${NC}"
    if ! curl -sSL "$BINARY_URL" -o "$BINARY_PATH"; then
        echo -e "    ${RED}Failed to download binary${NC}"
        continue
    fi

    # Get file size
    FILE_SIZE=$(stat -c%s "$BINARY_PATH" 2>/dev/null || stat -f%z "$BINARY_PATH" 2>/dev/null)
    FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1048576" | bc)
    echo -e "    ${GREEN}Downloaded: $BINARY_PATH (${FILE_SIZE_MB} MB)${NC}"

    # Verify checksum
    ACTUAL_CHECKSUM=$(sha256sum "$BINARY_PATH" | cut -d' ' -f1)
    if [[ "$ACTUAL_CHECKSUM" != "$CHECKSUM" ]]; then
        echo -e "    ${RED}Checksum verification failed!${NC}"
        echo -e "      ${RED}Expected: $CHECKSUM${NC}"
        echo -e "      ${RED}Actual:   $ACTUAL_CHECKSUM${NC}"
        rm -f "$BINARY_PATH"
        continue
    fi
    echo -e "    ${GREEN}Checksum verified OK${NC}"

    # Save checksum for offline verification
    echo -n "$CHECKSUM" > "$PLAT_DIR/checksum.txt"
done

# Step 5: Create offline install info
echo -e "${YELLOW}[4/4] Creating offline installation metadata...${NC}"

DOWNLOAD_DATE=$(date '+%Y-%m-%d %H:%M:%S')
cat > "$OUTPUT_DIR/offline-info.json" << EOF
{
  "version": "$VERSION",
  "downloadDate": "$DOWNLOAD_DATE",
  "platforms": [$(printf '"%s"' "${PLATFORMS[@]}" | sed 's/""/", "/g')],
  "gcsBucket": "$GCS_BUCKET"
}
EOF

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Download Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Files saved to: $OUTPUT_DIR${NC}"
echo ""
echo -e "${CYAN}Contents:${NC}"
find "$OUTPUT_DIR" -type f -exec ls -lh {} \; | while read -r line; do
    FILENAME=$(echo "$line" | awk '{print $NF}')
    SIZE=$(echo "$line" | awk '{print $5}')
    RELPATH="${FILENAME#$OUTPUT_DIR/}"
    echo -e "  ${GRAY}$RELPATH ($SIZE)${NC}"
done

echo ""
echo -e "${YELLOW}To install offline:${NC}"
echo -e "  1. Copy the '${OUTPUT_DIR}' folder to Windows"
echo -e "  2. Run: ./claude-offline-install.ps1 -OfflineDir \"./dist\""
echo ""
