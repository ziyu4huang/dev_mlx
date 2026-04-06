#!/usr/bin/env bash
set -euo pipefail
echo "==> Stopping Stock AI..."
pkill -f "target/release/stock_ai" 2>/dev/null && echo "Stopped." || echo "Not running."
pkill -f "target/debug/stock_ai" 2>/dev/null && echo "Stopped (debug)." || true
