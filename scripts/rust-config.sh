#!/bin/bash
# Rust Build Configuration Switcher for agent_builder
#
# Usage:
#   ./scripts/rust-config.sh <profile>     # Switch to a profile
#   ./scripts/rust-config.sh --show        # Show current config
#   ./scripts/rust-config.sh --list        # List available profiles
#   ./scripts/rust-config.sh --benchmark   # Switch and benchmark
#
# Profiles:
#   fast-build    - Fast compilation, acceptable runtime (default)
#   balanced      - Moderate optimization for mixed dev/test
#   release-like  - Near release performance for testing
#   debug-full    - Full debug symbols for debugging
#   lld           - Use lld linker (comparison)
#   bfd           - Use bfd linker (baseline)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CARGO_DIR="$PROJECT_ROOT/.cargo"
PROFILES_DIR="$CARGO_DIR/profiles"
CONFIG_FILE="$CARGO_DIR/config.toml"

# Color output (disabled if not a terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

show_help() {
    echo "Rust Build Configuration Switcher"
    echo ""
    echo "Usage: $0 <profile> [OPTIONS]"
    echo ""
    echo "Profiles:"
    echo "  fast-build    Fast compilation, acceptable runtime (mold, opt-1, cu-256)"
    echo "  balanced      Moderate optimization (mold, opt-2, cu-16)"
    echo "  release-like  Near release performance (mold, opt-3, cu-1)"
    echo "  debug-full    Full debug symbols (mold, opt-0, debug-full)"
    echo "  lld           Use lld linker for comparison"
    echo "  bfd           Use bfd linker (baseline)"
    echo ""
    echo "Options:"
    echo "  --show        Show current configuration"
    echo "  --list        List available profiles"
    echo "  --benchmark   Switch profile and run clean build benchmark"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 fast-build           # Switch to fast-build profile"
    echo "  $0 --show               # Show current config"
    echo "  $0 lld --benchmark      # Switch to lld and time clean build"
}

list_profiles() {
    echo "Available profiles in $PROFILES_DIR:"
    echo ""
    printf "  %-15s %s\n" "Profile" "Description"
    printf "  %-15s %s\n" "-------" "-----------"
    printf "  %-15s %s\n" "fast-build" "Fast compilation (mold, opt-1, cu-256) [DEFAULT]"
    printf "  %-15s %s\n" "balanced" "Moderate optimization (mold, opt-2, cu-16)"
    printf "  %-15s %s\n" "release-like" "Near release performance (mold, opt-3, cu-1)"
    printf "  %-15s %s\n" "debug-full" "Full debug symbols (mold, opt-0, debug-full)"
    printf "  %-15s %s\n" "lld" "LLD linker comparison (lld, opt-1, cu-256)"
    printf "  %-15s %s\n" "bfd" "Baseline (bfd, opt-1, cu-256)"
    echo ""

    if [ -d "$PROFILES_DIR" ]; then
        echo "Profile files:"
        ls -la "$PROFILES_DIR"/*.toml 2>/dev/null || echo "  (no profile files found)"
    fi
}

show_current_config() {
    echo "Current configuration ($CONFIG_FILE):"
    echo ""
    if [ -f "$CONFIG_FILE" ]; then
        # Extract key settings
        local linker=$(grep -A1 '\[target.x86_64' "$CONFIG_FILE" 2>/dev/null | grep 'linker' | cut -d'"' -f2 || echo "unknown")
        local linker_flag=$(grep 'fuse-ld=' "$CONFIG_FILE" 2>/dev/null | sed 's/.*fuse-ld=\([^"]*\).*/\1/' || echo "default")
        local opt_level=$(grep -A5 '\[profile.dev\]' "$CONFIG_FILE" 2>/dev/null | grep 'opt-level' | head -1 | awk '{print $3}' || echo "unknown")
        local codegen_units=$(grep -A5 '\[profile.dev\]' "$CONFIG_FILE" 2>/dev/null | grep 'codegen-units' | awk '{print $3}' || echo "unknown")
        local debug=$(grep -A5 '\[profile.dev\]' "$CONFIG_FILE" 2>/dev/null | grep 'debug' | head -1 | awk -F'"' '{print $2}' || echo "unknown")

        echo "  Linker:        ${linker} (${linker_flag:-default})"
        echo "  opt-level:     ${opt_level}"
        echo "  codegen-units: ${codegen_units}"
        echo "  debug:         ${debug}"
        echo ""
        echo "--- Full config ---"
        cat "$CONFIG_FILE"
    else
        error "Config file not found: $CONFIG_FILE"
    fi
}

switch_profile() {
    local profile="$1"

    if [ ! -f "$PROFILES_DIR/${profile}.toml" ]; then
        error "Profile not found: $profile. Available profiles: fast-build, balanced, release-like, debug-full, lld, bfd"
    fi

    info "Switching to profile: $profile"
    cp "$PROFILES_DIR/${profile}.toml" "$CONFIG_FILE"
    success "Profile switched to: $profile"
    echo ""

    # Show key settings
    local linker=$(grep 'fuse-ld=' "$CONFIG_FILE" 2>/dev/null | sed 's/.*fuse-ld=\([^"]*\).*/\1/' || echo "default")
    local opt_level=$(grep -A5 '\[profile.dev\]' "$CONFIG_FILE" 2>/dev/null | grep 'opt-level' | head -1 | awk '{print $3}')
    local codegen_units=$(grep -A5 '\[profile.dev\]' "$CONFIG_FILE" 2>/dev/null | grep 'codegen-units' | awk '{print $3}')

    echo "Active settings:"
    echo "  Linker:        ${linker:-bfd (default)}"
    echo "  opt-level:     ${opt_level}"
    echo "  codegen-units: ${codegen_units}"
}

run_benchmark() {
    local profile="$1"

    info "Running clean build benchmark for profile: $profile"
    echo ""

    # Clean build
    info "Cleaning target directory..."
    cargo clean

    # Time the build
    info "Starting timed build..."
    local start_time=$(date +%s.%N)

    cargo build 2>&1 | tee /tmp/rust-build.log

    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    echo ""
    echo "========================================"
    success "Build completed!"
    echo "  Profile:    $profile"
    echo "  Duration:   ${duration}s"
    echo "========================================"

    # Save benchmark result
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local result_dir="$PROJECT_ROOT/.metrics/build-benchmarks"
    mkdir -p "$result_dir"

    echo "{\"timestamp\": \"$timestamp\", \"profile\": \"$profile\", \"duration_seconds\": $duration, \"type\": \"clean_build\"}" >> "$result_dir/${timestamp}.jsonl"
    info "Result saved to: $result_dir/${timestamp}.jsonl"
}

# Main argument parsing
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

MODE="switch"
PROFILE=""
RUN_BENCHMARK=0

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --list)
            list_profiles
            exit 0
            ;;
        --show)
            show_current_config
            exit 0
            ;;
        --benchmark)
            RUN_BENCHMARK=1
            shift
            ;;
        fast-build|balanced|release-like|debug-full|lld|bfd)
            PROFILE="$1"
            shift
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

if [ -z "$PROFILE" ]; then
    error "No profile specified. Use --list to see available profiles."
fi

switch_profile "$PROFILE"

if [ $RUN_BENCHMARK -eq 1 ]; then
    run_benchmark "$PROFILE"
fi
