#!/bin/bash
# test_agent_match.sh - Verify agent-cli matches Claude Code behavior
#
# Usage: ./scripts/test_agent_match.sh
#
# Tests:
# - Phase 1: Simple chat, tool calling, skill invocation
# - Phase 2: Agent tool for subagent spawning

set -e

# Build first if needed
if [ ! -f "target/debug/agent-cli" ]; then
    echo "Building..."
    cargo build 2>/dev/null
fi

CLI="target/debug/agent-cli"
PASS=0
FAIL=0

echo "=== Agent-CLI Claude Code Behavior Match Tests ==="
echo ""

# Helper functions
pass() {
    echo "✓ $1"
    ((PASS++))
}

fail() {
    echo "✗ $1"
    echo "  Output: $2"
    ((FAIL++))
}

# Phase 1: Simple Chat
echo "--- Phase 1: Simple Chat ---"

OUTPUT=$($CLI -p "What is 2+2?" 2>/dev/null)
if echo "$OUTPUT" | grep -q "4"; then
    pass "Simple math question"
else
    fail "Simple math question" "$OUTPUT"
fi

OUTPUT=$($CLI -p "Say hello" 2>/dev/null)
if echo "$OUTPUT" | grep -qi "hello\|hi"; then
    pass "Simple greeting"
else
    fail "Simple greeting" "$OUTPUT"
fi

# Phase 1: Tool Calling
echo ""
echo "--- Phase 1: Tool Calling ---"

OUTPUT=$($CLI -p "Read the first 5 lines of CLAUDE.md" 2>/dev/null)
if echo "$OUTPUT" | grep -q "Read\|CLAUDE.md"; then
    pass "Read tool invocation"
else
    fail "Read tool invocation" "$OUTPUT"
fi

OUTPUT=$($CLI -p "List all .rs files in src/tools/built_in/" 2>/dev/null)
if echo "$OUTPUT" | grep -q "Glob\|\.rs"; then
    pass "Glob tool invocation"
else
    fail "Glob tool invocation" "$OUTPUT"
fi

# Phase 1: Skill Invocation
echo ""
echo "--- Phase 1: Skill Invocation ---"

OUTPUT=$($CLI -p "Use the greet skill" 2>/dev/null)
if echo "$OUTPUT" | grep -q "Skill\|greet\|Hello"; then
    pass "Skill tool invocation"
else
    fail "Skill tool invocation" "$OUTPUT"
fi

# Phase 2: Agent Tool (Subagent Spawning)
echo ""
echo "--- Phase 2: Agent Tool (Subagent Spawning) ---"

OUTPUT=$($CLI -p "Use an Agent with subagent_type 'explore' to list Rust files" 2>/dev/null)
if echo "$OUTPUT" | grep -q "Agent\|explore"; then
    pass "Agent tool with explore type"
else
    fail "Agent tool with explore type" "$OUTPUT"
fi

OUTPUT=$($CLI -p "Spawn a plan agent to analyze the codebase structure" 2>/dev/null)
if echo "$OUTPUT" | grep -q "Agent\|plan"; then
    pass "Agent tool with plan type"
else
    fail "Agent tool with plan type" "$OUTPUT"
fi

# Verify Agent tool is registered
echo ""
echo "--- Tool Registration Check ---"

OUTPUT=$($CLI tools list 2>/dev/null)
if echo "$OUTPUT" | grep -q "^Agent"; then
    pass "Agent tool is registered"
else
    fail "Agent tool is registered" "Agent not found in tools list"
fi

# Summary
echo ""
echo "=== Test Summary ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "✓ All tests passed!"
    exit 0
else
    echo ""
    echo "✗ Some tests failed"
    exit 1
fi
