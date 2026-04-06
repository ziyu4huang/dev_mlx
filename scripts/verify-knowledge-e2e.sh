#!/bin/bash
# E2E Verification for /develop-knowledge commands against SurrealDB v3
# Run this against a live SurrealDB v3 server

set -e

echo "=== /develop-knowledge E2E Verification ==="
echo ""

# Resolve binary: prefer release, fall back to debug
BINARY=""
if [ -f "./target/release/develop-knowledge" ]; then
    BINARY="./target/release/develop-knowledge"
elif [ -f "./target/debug/develop-knowledge" ]; then
    BINARY="./target/debug/develop-knowledge"
else
    echo "ERROR: develop-knowledge binary not found."
    echo "       Run 'cargo build' or 'cargo build --release' first."
    exit 1
fi
echo "Using binary: $BINARY"
echo ""

# 1. Init
echo "1. Testing schema init..."
$BINARY init || { echo "FAIL: Init"; exit 1; }
echo "   PASS"
echo ""

# 2. Add note
echo "2. Testing add..."
NOTE_OUTPUT=$($BINARY add --title "E2E Test" --content "Content for testing" --tags e2e --jsonl 2>&1)
NOTE_ID=$(echo "$NOTE_OUTPUT" | grep -oP '"id"\s*:\s*"\K[^"]+' | head -1)
if [ -z "$NOTE_ID" ]; then
    echo "FAIL: Could not extract note ID from: $NOTE_OUTPUT"
    exit 1
fi
echo "   Created note: $NOTE_ID"
echo "   PASS"
echo ""

# 3. Get note
echo "3. Testing get..."
$BINARY get "$NOTE_ID" > /dev/null || { echo "FAIL: Get note"; exit 1; }
echo "   PASS"
echo ""

# 4. Update note
echo "4. Testing update..."
$BINARY update "$NOTE_ID" --title "Updated E2E Test" > /dev/null || { echo "FAIL: Update note"; exit 1; }
echo "   PASS"
echo ""

# 5. Search
echo "5. Testing search..."
$BINARY search "E2E" --limit 5 | grep -q "E2E" || { echo "FAIL: Search"; exit 1; }
echo "   PASS"
echo ""

# 6. Health
echo "6. Testing health..."
HEALTH_OUTPUT=$($BINARY health)
echo "$HEALTH_OUTPUT" | grep -q "score" || { echo "FAIL: Health check (no 'score' in output)"; exit 1; }
echo "   PASS"
echo ""

# 7. Create a second note for link test
echo "7. Testing link (creating second note)..."
NOTE2_OUTPUT=$($BINARY add --title "E2E Test 2" --content "Second note for link" --tags e2e --jsonl 2>&1)
NOTE2_ID=$(echo "$NOTE2_OUTPUT" | grep -oP '"id"\s*:\s*"\K[^"]+' | head -1)
echo "   Created note: $NOTE2_ID"
echo "   PASS"
echo ""

# 8. Link notes
echo "8. Testing link..."
$BINARY link "$NOTE_ID" "$NOTE2_ID" --relation "test_link" > /dev/null || { echo "FAIL: Link"; exit 1; }
echo "   PASS"
echo ""

# 9. Orphans (replaces cluster stub)
echo "9. Testing orphans..."
$BINARY orphans > /dev/null || { echo "FAIL: Orphans"; exit 1; }
echo "   PASS"
echo ""

# 10. Cleanup
echo "10. Testing delete..."
$BINARY delete "$NOTE_ID" > /dev/null || { echo "FAIL: Delete note 1"; exit 1; }
$BINARY delete "$NOTE2_ID" > /dev/null || { echo "FAIL: Delete note 2"; exit 1; }
echo "   PASS"
echo ""

echo "=== All E2E tests passed ==="
