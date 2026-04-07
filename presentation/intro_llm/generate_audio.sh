#!/usr/bin/env bash
set -euo pipefail

# generate_audio.sh — Regenerate voice audio from story.json files
# Usage: cd presentation/intro_llm && bash generate_audio.sh
#
# Prerequisites:
#   - mlx_tts project with .venv set up (story_to_voice.py + Kokoro model)
#   - Run from this (intro_llm) directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUDIO_DIR="$SCRIPT_DIR/public/audio"
MLX_TTS="$(cd "$SCRIPT_DIR/../.." && pwd)/mlx_tts"
PYTHON="$MLX_TTS/.venv/bin/python"

if [ ! -f "$PYTHON" ]; then
  echo "Error: mlx_tts virtualenv not found at $PYTHON"
  echo "  cd mlx_tts && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

if [ ! -f "$MLX_TTS/story_to_voice.py" ]; then
  echo "Error: story_to_voice.py not found at $MLX_TTS/story_to_voice.py"
  exit 1
fi

cd "$MLX_TTS"

for story in "$AUDIO_DIR"/intro_llm_*.story.json; do
  [ -f "$story" ] || continue
  base="$(basename "$story" .story.json)"
  num="${base##*_}"
  output="$AUDIO_DIR/scene-${num}.flac"

  echo "Producing $base → scene-${num}.flac ..."
  "$PYTHON" story_to_voice.py produce "$story" --output "$output"
done

echo ""
echo "Done. Audio files in public/audio/:"
ls -lh "$AUDIO_DIR"/*.flac
