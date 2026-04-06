#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export AV_API_KEY="${AV_API_KEY:-WLEN3SIHR5ZGWSKI}"
export DATA_DIR="${DATA_DIR:-$HOME/.stock_ai}"

echo "==> Building..."
cargo build --release 2>&1 | tail -3

echo "==> Starting Stock AI on http://localhost:3003"
exec ./target/release/stock_ai
