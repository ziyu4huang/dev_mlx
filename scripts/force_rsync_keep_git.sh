#!/bin/bash
# Force rsync: destroy dest except .git, .env, tmp/, test-*/; sync from src except .git
# Usage: force_rsync_keep_git.sh <from-dir> <to-dir>

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <from-dir> <to-dir>"
    echo "  Syncs <from-dir> to <to-dir>, destroying dest except .git/"
    exit 1
fi

FROM_DIR="${1%/}"
TO_DIR="${2%/}"

if [ ! -d "$FROM_DIR" ]; then
    echo "Error: Source directory '$FROM_DIR' does not exist"
    exit 1
fi

if [ ! -d "$TO_DIR" ]; then
    echo "Error: Destination directory '$TO_DIR' does not exist"
    exit 1
fi

# Get absolute paths
FROM_DIR=$(cd "$FROM_DIR" && pwd)
TO_DIR=$(cd "$TO_DIR" && pwd)

if [ "$FROM_DIR" = "$TO_DIR" ]; then
    echo "Error: Source and destination are the same directory"
    exit 1
fi

echo "Source: $FROM_DIR"
echo "Dest:   $TO_DIR"
echo ""

# Find and delete everything in TO_DIR except .git, .env, tmp, test-*
echo "Removing all files in destination (except .git/, .env, tmp/, test-*/)..."
find "$TO_DIR" -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name '.env' \
  ! -name 'tmp' \
  ! -name 'test-*' \
  -exec rm -rf {} +

# Rsync everything from FROM_DIR to TO_DIR except .git, .env, tmp, test-*
echo "Syncing from source (excluding .git/, .env, tmp/, test-*/)..."
rsync -a --delete \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'tmp' \
  --exclude 'test-*' \
  "$FROM_DIR/" "$TO_DIR/"

echo ""
echo "Done. Synced '$FROM_DIR' -> '$TO_DIR' (preserved dest .git/, .env, tmp/, test-*/)"
