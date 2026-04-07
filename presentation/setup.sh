#!/usr/bin/env bash
set -euo pipefail

# presentation/setup.sh — Install dependencies for all Remotion video presentations
# Usage: cd presentation && bash setup.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check for Bun
if ! command -v bun &>/dev/null && [ ! -f ~/.bun/bin/bun ]; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
fi

BUN="${BUN:-$HOME/.bun/bin/bun}"

for dir in */; do
  dir="${dir%/}"
  if [ -f "$dir/package.json" ]; then
    echo "Installing $dir/..."
    (cd "$dir" && "$BUN" install)
    echo "  done"
  fi
done

echo ""
echo "All presentations installed. Usage:"
echo "  cd presentation/<project> && bun run dev    # Preview in Remotion Studio"
echo "  cd presentation/<project> && bun run build   # Render to out/video.mp4"
