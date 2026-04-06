#!/bin/bash
# Rust Build Benchmark Runner for agent_builder
#
# Usage:
#   ./scripts/rust-benchmark.sh              # Run all profiles (clean + incremental)
#   ./scripts/rust-benchmark.sh --full       # Full benchmark (clean builds only)
#   ./scripts/rust-benchmark.sh --incremental # Incremental builds only
#   ./scripts/rust-benchmark.sh --profile <name> # Benchmark specific profile
#   ./scripts/rust-benchmark.sh --compare    # Compare results
#
# Output: .metrics/build-benchmarks/<timestamp>.jsonl

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CARGO_DIR="$PROJECT_ROOT/.cargo"
PROFILES_DIR="$CARGO_DIR/profiles"
RESULT_DIR="$PROJECT_ROOT/.metrics/build-benchmarks"
CONFIG_FILE="$CARGO_DIR/config.toml"

# Color output (disabled if not a terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    NC=''
fi

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
header() { echo -e "${CYAN}========================================${NC}"; }

# All available profiles
PROFILES=("fast-build" "balanced" "release-like" "debug-full" "lld" "bfd")

# Results storage
declare -A CLEAN_TIMES
declare -A INCREMENTAL_TIMES

show_help() {
    echo "Rust Build Benchmark Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --full              Run full benchmark (clean builds for all profiles)"
    echo "  --incremental       Run incremental build benchmark only"
    echo "  --all               Run both clean and incremental (default)"
    echo "  --profile <name>    Benchmark specific profile only"
    echo "  --compare           Show comparison of recent benchmark results"
    echo "  --quick             Quick test (fast-build and bfd only)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Profiles: ${PROFILES[*]}"
    echo ""
    echo "Examples:"
    echo "  $0                           # Full benchmark suite"
    echo "  $0 --quick                   # Quick comparison (fast-build vs bfd)"
    echo "  $0 --profile mold            # Benchmark only mold profile"
    echo "  $0 --compare                 # Show recent results"
}

run_clean_build() {
    local profile="$1"

    info "Testing profile: $profile"

    # Copy profile config
    cp "$PROFILES_DIR/${profile}.toml" "$CONFIG_FILE"

    # Clean
    cargo clean

    # Time the build
    local start_time=$(date +%s.%N)
    cargo build 2>&1 | tail -5
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    CLEAN_TIMES[$profile]=$duration
    success "Clean build ($profile): ${duration}s"

    # Save result
    echo "{\"timestamp\": \"$TIMESTAMP\", \"profile\": \"$profile\", \"type\": \"clean_build\", \"duration_seconds\": $duration}" >> "$RESULT_FILE"
}

run_incremental_build() {
    local profile="$1"

    info "Testing incremental build for: $profile"

    # Ensure we have a built state
    cp "$PROFILES_DIR/${profile}.toml" "$CONFIG_FILE"

    # Touch a common file to trigger incremental
    touch "$PROJECT_ROOT/src/main.rs" 2>/dev/null || touch "$PROJECT_ROOT/agent-cli/src/main.rs" 2>/dev/null || {
        warn "Could not find main.rs for incremental test, skipping"
        return
    }

    # Time the incremental build
    local start_time=$(date +%s.%N)
    cargo build 2>&1 | tail -5
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    INCREMENTAL_TIMES[$profile]=$duration
    success "Incremental build ($profile): ${duration}s"

    # Save result
    echo "{\"timestamp\": \"$TIMESTAMP\", \"profile\": \"$profile\", \"type\": \"incremental_build\", \"duration_seconds\": $duration}" >> "$RESULT_FILE"
}

show_results() {
    header
    echo "Benchmark Results Summary"
    header
    echo ""

    if [ ${#CLEAN_TIMES[@]} -gt 0 ]; then
        echo "Clean Builds:"
        printf "  %-15s %10s\n" "Profile" "Time"
        printf "  %-15s %10s\n" "-------" "----"

        # Sort by time
        for profile in "${!CLEAN_TIMES[@]}"; do
            echo "${CLEAN_TIMES[$profile]} $profile"
        done | sort -n | while read time profile; do
            printf "  %-15s %10ss\n" "$profile" "$time"
        done
        echo ""
    fi

    if [ ${#INCREMENTAL_TIMES[@]} -gt 0 ]; then
        echo "Incremental Builds:"
        printf "  %-15s %10s\n" "Profile" "Time"
        printf "  %-15s %10s\n" "-------" "----"

        for profile in "${!INCREMENTAL_TIMES[@]}"; do
            echo "${INCREMENTAL_TIMES[$profile]} $profile"
        done | sort -n | while read time profile; do
            printf "  %-15s %10ss\n" "$profile" "$time"
        done
        echo ""
    fi
}

compare_results() {
    info "Recent benchmark results:"
    echo ""

    if [ -d "$RESULT_DIR" ]; then
        # Find recent result files
        local recent_files=$(ls -t "$RESULT_DIR"/*.jsonl 2>/dev/null | head -5)

        if [ -z "$recent_files" ]; then
            warn "No benchmark results found in $RESULT_DIR"
            return
        fi

        echo "Latest results:"
        for f in $recent_files; do
            echo ""
            echo "--- $(basename $f) ---"
            cat "$f" | python3 -c '
import sys, json
from collections import defaultdict
results = defaultdict(list)
for line in sys.stdin:
    try:
        data = json.loads(line.strip())
        results[data["type"]].append((data["profile"], data["duration_seconds"]))
    except: pass

for build_type, profiles in results.items():
    print(f"\n{build_type.replace("_", " ").title()}:")
    profiles.sort(key=lambda x: x[1])
    for profile, duration in profiles:
        print(f"  {profile:15} {duration:.2f}s")
' 2>/dev/null || cat "$f"
        done
    else
        warn "Result directory not found: $RESULT_DIR"
    fi
}

# Main argument parsing
MODE="all"
TEST_PROFILES=()

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --full)
            MODE="full"
            shift
            ;;
        --incremental)
            MODE="incremental"
            shift
            ;;
        --all)
            MODE="all"
            shift
            ;;
        --quick)
            MODE="quick"
            TEST_PROFILES=("fast-build" "bfd")
            shift
            ;;
        --profile)
            TEST_PROFILES+=("$2")
            shift 2
            ;;
        --compare)
            compare_results
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Set profiles to test
if [ ${#TEST_PROFILES[@]} -eq 0 ]; then
    TEST_PROFILES=("${PROFILES[@]}")
fi

# Prepare result directory
mkdir -p "$RESULT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_FILE="$RESULT_DIR/${TIMESTAMP}.jsonl"

header
echo "Rust Build Benchmark Suite"
echo "Timestamp: $TIMESTAMP"
echo "Mode: $MODE"
echo "Profiles: ${TEST_PROFILES[*]}"
header
echo ""

# Save backup of current config
BACKUP_CONFIG=$(mktemp)
cp "$CONFIG_FILE" "$BACKUP_CONFIG"

# Cleanup on exit
cleanup() {
    cp "$BACKUP_CONFIG" "$CONFIG_FILE"
    rm -f "$BACKUP_CONFIG"
    info "Restored original config"
}
trap cleanup EXIT

# Run benchmarks
case $MODE in
    full|all|quick)
        info "Running clean build benchmarks..."
        for profile in "${TEST_PROFILES[@]}"; do
            run_clean_build "$profile"
            echo ""
        done
        ;&  # Fall through
esac

case $MODE in
    incremental|all)
        if [ "$MODE" != "full" ]; then
            info "Running incremental build benchmarks..."
            for profile in "${TEST_PROFILES[@]}"; do
                run_incremental_build "$profile"
                echo ""
            done
        fi
        ;;
esac

# Show summary
show_results

info "Full results saved to: $RESULT_FILE"
