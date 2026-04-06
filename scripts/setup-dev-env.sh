#!/bin/bash
# Development Environment Setup Script
# This script sets up the development environment on any machine
# Run: ./scripts/setup-dev-env.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_ROOT/dist/tools"

echo "======================================"
echo "Development Environment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect OS and Architecture
detect_platform() {
    OS_TYPE=$(uname -s)
    ARCH_TYPE=$(uname -m)

    case "$OS_TYPE" in
        Linux*)
            case "$ARCH_TYPE" in
                x86_64|amd64) echo "linux-amd64" ;;
                aarch64|arm64) echo "linux-arm64" ;;
                *) echo "linux-amd64" ;;
            esac
            ;;
        Darwin*)
            case "$ARCH_TYPE" in
                x86_64|amd64) echo "darwin-amd64" ;;
                arm64|aarch64) echo "darwin-arm64" ;;
                *) echo "darwin-amd64" ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "windows-amd64"
            ;;
        *)
            error "Unsupported OS: $OS_TYPE"
            exit 1
            ;;
    esac
}

# Check if SurrealDB exists
check_surreal() {
    if [ -f "$DIST_DIR/surreal" ] || [ -f "$DIST_DIR/surreal.exe" ]; then
        local bin="$DIST_DIR/surreal"
        [ -f "$DIST_DIR/surreal.exe" ] && bin="$DIST_DIR/surreal.exe"
        info "SurrealDB found at $bin"
        "$bin" --version 2>/dev/null && return 0
        warn "SurrealDB binary exists but may be corrupted"
        return 1
    fi
    return 1
}

# Get platform-specific download info
get_download_info() {
    SURREAL_VERSION="${SURREAL_VERSION:-v3.0.4}"
    PLATFORM=$(detect_platform)
    FILE_NAME="surreal-${SURREAL_VERSION}.${PLATFORM}.tgz"
    SURREAL_URL="https://github.com/surrealdb/surrealdb/releases/download/${SURREAL_VERSION}/${FILE_NAME}"
    echo "$FILE_NAME|$SURREAL_URL"
}

# Download SurrealDB
download_surreal() {
    info "Downloading SurrealDB..."

    DOWNLOAD_INFO=$(get_download_info)
    FILE_NAME=$(echo "$DOWNLOAD_INFO" | cut -d'|' -f1)
    SURREAL_URL=$(echo "$DOWNLOAD_INFO" | cut -d'|' -f2)

    info "Platform: $(detect_platform)"
    info "File: $FILE_NAME"
    info "URL: $SURREAL_URL"

    # Create temp directory for download
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    # Download archive
    if command -v curl &> /dev/null; then
        curl -L "$SURREAL_URL" -o "$FILE_NAME" || {
            error "Failed to download SurrealDB"
            error "Please check: https://github.com/surrealdb/surrealdb/releases"
            rm -rf "$TEMP_DIR"
            exit 1
        }
    elif command -v wget &> /dev/null; then
        wget -O "$FILE_NAME" "$SURREAL_URL" || {
            error "Failed to download SurrealDB"
            rm -rf "$TEMP_DIR"
            exit 1
        }
    else
        error "Neither curl nor wget found. Please install one of them."
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # Extract archive
    info "Extracting..."
    tar xzf "$FILE_NAME"

    # Find and move the surreal binary
    if [ -f "surreal" ]; then
        mkdir -p "$DIST_DIR"
        mv surreal "$DIST_DIR/surreal"
        chmod +x "$DIST_DIR/surreal"
    else
        error "Could not find surreal binary in archive"
        ls -la
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # Cleanup
    cd "$PROJECT_ROOT"
    rm -rf "$TEMP_DIR"

    info "Downloaded and made executable"
}

# Verify installation
verify_surreal() {
    info "Verifying SurrealDB installation..."
    if "$DIST_DIR/surreal" --version; then
        info "SurrealDB installed successfully!"
        return 0
    else
        error "SurrealDB verification failed"
        return 1
    fi
}

# Main setup flow
main() {
    info "Setting up development environment..."
    info "Platform: $(detect_platform)"
    info "Tools directory: $DIST_DIR"
    echo ""

    # Check existing installation
    if check_surreal; then
        info "SurrealDB already installed and working!"
        echo ""
        read -p "Reinstall anyway? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            download_surreal
            verify_surreal
        fi
    else
        warn "SurrealDB not found or not working"
        download_surreal
        verify_surreal
    fi

    echo ""
    info "======================================"
    info "Setup complete!"
    info "======================================"
    echo ""
    info "You can now:"
    echo "  - Start SurrealDB: ./scripts/run_surreal.sh"
    echo "  - With custom port: ./scripts/run_surreal.sh -b 127.0.0.1:8001"
    echo "  - With debug logging: ./scripts/run_surreal.sh --debug"
    echo ""
}

# Run main
main "$@"
