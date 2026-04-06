#!/bin/bash
# Smart Test Runner for agent_builder
#
# Usage:
#   ./scripts/smart-test.sh              # Run fast tests only (30s timeout)
#   ./scripts/smart-test.sh --all        # Run all tests including slow
#   ./scripts/smart-test.sh --e2e        # Run E2E tests
#   ./scripts/smart-test.sh --slow       # Run slow tests only
#   ./scripts/smart-test.sh --timeout 60 # Custom timeout
#
# Environment Variables:
#   TEST_TIMEOUT_SECS     - Default timeout per test (default: 30)
#   TEST_SLOW_TIMEOUT_SECS - Timeout for slow tests (default: 300)
#   RUN_SLOW_TESTS        - Set to "1" to include slow tests

set -e

# Default values
TIMEOUT=${TEST_TIMEOUT_SECS:-30}
SLOW_TIMEOUT=${TEST_SLOW_TIMEOUT_SECS:-300}
RUN_SLOW=${RUN_SLOW_TESTS:-0}
MODE="fast"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            MODE="all"
            RUN_SLOW=1
            shift
            ;;
        --e2e)
            MODE="e2e"
            shift
            ;;
        --slow)
            MODE="slow"
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --ci)
            MODE="ci"
            shift
            ;;
        -h|--help)
            echo "Smart Test Runner for agent_builder"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --all          Run all tests including slow"
            echo "  --e2e          Run E2E tests only"
            echo "  --slow         Run slow tests only"
            echo "  --timeout N    Set timeout to N seconds (default: 30)"
            echo "  --ci           Run in CI mode (stricter, fail-fast)"
            echo "  -h, --help     Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  TEST_TIMEOUT_SECS      Default timeout per test (default: 30)"
            echo "  TEST_SLOW_TIMEOUT_SECS Timeout for slow tests (default: 300)"
            echo "  RUN_SLOW_TESTS         Set to '1' to include slow tests"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if nextest is available
if command -v cargo-nextest &> /dev/null; then
    USE_NEXTEST=1
    echo "Using cargo-nextest for test execution"
else
    USE_NEXTEST=0
    echo "cargo-nextest not found, falling back to cargo test"
    echo "Install with: cargo install cargo-nextest"
fi

# Export environment variables
export TEST_TIMEOUT_SECS=$TIMEOUT
export TEST_SLOW_TIMEOUT_SECS=$SLOW_TIMEOUT
export RUN_SLOW_TESTS=$RUN_SLOW

echo "========================================"
echo "Test Configuration:"
echo "  Mode: $MODE"
echo "  Timeout: ${TIMEOUT}s"
echo "  Slow Timeout: ${SLOW_TIMEOUT}s"
echo "  Run Slow Tests: $RUN_SLOW"
echo "========================================"
echo ""

run_with_nextest() {
    case $MODE in
        fast)
            echo "Running fast tests with ${TIMEOUT}s timeout..."
            cargo nextest run --workspace --profile default --filter-expr "not test(slow)"
            ;;
        all)
            echo "Running all tests with profile slow..."
            cargo nextest run --workspace --profile slow
            ;;
        e2e)
            echo "Running E2E tests..."
            cargo nextest run --workspace --profile slow -E "test(e2e)"
            ;;
        slow)
            echo "Running slow tests only..."
            cargo nextest run --workspace --profile slow -E "test(slow)"
            ;;
        ci)
            echo "Running in CI mode..."
            cargo nextest run --workspace --profile ci
            ;;
    esac
}

run_with_cargo() {
    case $MODE in
        fast)
            echo "Running fast tests with ${TIMEOUT}s timeout..."
            cargo test --workspace --lib
            ;;
        all)
            echo "Running all tests (including ignored)..."
            cargo test --workspace -- --include-ignored
            ;;
        e2e)
            echo "Running E2E tests..."
            cargo test --workspace --test main -E "e2e" -- --ignored
            ;;
        slow)
            echo "Running slow tests only..."
            cargo test --workspace -- --ignored
            ;;
        ci)
            echo "Running in CI mode..."
            cargo test --workspace
            ;;
    esac
}

# Run tests
if [ "$USE_NEXTEST" -eq 1 ]; then
    run_with_nextest
else
    run_with_cargo
fi

echo ""
echo "========================================"
echo "Test run completed!"
echo "========================================"
