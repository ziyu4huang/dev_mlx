#!/bin/bash
# Upload agent_builder to labb public share
#
# Prerequisites:
#   SMB3 must be enabled in smb config
#   Mount command:
#   sudo mount -t cifs -o username=mtk15364,rw,domain=mediatek.inc,vers=2.0,uid=$(id -u),gid=$(id -g) //mtklfs00/labbpub /mnt/labbpublic/
#
# Usage:
#   ./upload_labb.sh              # Default: include .git, auto-copy
#   ./upload_labb.sh --no-git     # Exclude .git folder
#   ./upload_labb.sh --no-copy    # Skip auto-copy, just create archive
#   ./upload_labb.sh --no-git --no-copy

set -e

# Default options
EXCLUDE_GIT=false
AUTO_COPY=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-git)
            EXCLUDE_GIT=true
            shift
            ;;
        --no-copy)
            AUTO_COPY=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-git    Exclude .git folder from archive"
            echo "  --no-copy   Skip auto-copy, create archive only"
            echo "  -h, --help  Show this help message"
            echo ""
            echo "Default: Includes .git folder, auto-copies to destination"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage"
            exit 1
            ;;
    esac
done

# Configuration
TAR_FILE="/tmp/agent_builder.tgz"
DEST_DIR="/mnt/labbpublic/Public/mtk15364/"
# Get repository root relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Creating tar archive: $TAR_FILE"
echo "    Source: $SOURCE_DIR"

# Create tar with comprehensive exclusions for:
# - Rust build artifacts (target, *.rlib, *.rmeta, Cargo.lock generated)
# - Node.js (node_modules, .next, .turbo)
# - IDE/Editor files (.idea, .vscode, *.swp)
# - Generated files (docs generated, coverage)
# - Backup directories
# - Large binary files (*.wasm, *.pdf, *.zip, *.tar.gz)
# - Cache directories
# Build tar exclude arguments
TAR_EXCLUDES=(
    --exclude='target'
    --exclude='*.rlib'
    --exclude='*.rmeta'
    --exclude='*.pdb'
    --exclude='node_modules'
    --exclude='.next'
    --exclude='.turbo'
    --exclude='.idea'
    --exclude='.vscode'
    --exclude='*.swp'
    --exclude='*.swo'
    --exclude='*~'
    --exclude='.claude-backup'
    --exclude='*.wasm'
    --exclude='*.pdf'
    --exclude='*.zip'
    --exclude='*.tar.gz'
    --exclude='*.tgz'
    --exclude='*.vcd'
    --exclude='coverage'
    --exclude='.coverage'
    --exclude='*.profraw'
    --exclude='*.profdata'
    --exclude='.env'
    --exclude='.env.local'
    --exclude='*.log'
    --exclude='tmp'
    --exclude='*.tmp'
    --exclude='.DS_Store'
    --exclude='Thumbs.db'
)

# Conditionally exclude .git
if [ "$EXCLUDE_GIT" = true ]; then
    TAR_EXCLUDES+=(--exclude='.git')
    echo "==> Note: Excluding .git folder"
fi

tar czf "$TAR_FILE" \
    "${TAR_EXCLUDES[@]}" \
    -C "$(dirname "$SOURCE_DIR")" \
    "$(basename "$SOURCE_DIR")"

if [ $? -eq 0 ]; then
    # Get file count and size
    FILE_COUNT=$(tar -tzf "$TAR_FILE" | wc -l)
    FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)

    echo "==> Archive created successfully!"
    echo "    Files archived: $FILE_COUNT"
    echo "    Archive size:   $FILE_SIZE"
    echo ""
    echo "==> Tar file location: $TAR_FILE"
    echo ""

    if [ "$AUTO_COPY" = true ]; then
        echo "==> Copying to destination..."
        if [ -d "$DEST_DIR" ]; then
            cp "$TAR_FILE" "$DEST_DIR"
            echo "==> Copy complete: $DEST_DIR"
        else
            echo "==> ERROR: Destination not mounted: $DEST_DIR"
            echo "    Mount with:"
            echo "    sudo mount -t cifs -o username=mtk15364,rw,domain=mediatek.inc,vers=2.0,uid=\$(id -u),gid=\$(id -g) //mtklfs00/labbpub /mnt/labbpublic/"
            exit 1
        fi
    else
        echo "==> To copy to destination:"
        echo "    cp $TAR_FILE $DEST_DIR"
        echo ""
        echo "==> Or copy with rsync (if mounted):"
        echo "    rsync -avz --progress $TAR_FILE $DEST_DIR"
    fi
    echo ""
else
    echo "==> ERROR: Failed to create tar archive"
    exit 1
fi
