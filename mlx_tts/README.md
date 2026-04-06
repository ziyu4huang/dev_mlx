# MLX TTS — Novel to Voice Story

Convert novel text files into high-quality audiobooks with multi-character voices, emotions, and pacing — powered by Kokoro-82M running on Apple Silicon via MLX.

> **Platform:** This project requires a Mac with Apple Silicon (M-series CPU). Currently verified on M1 8GB MacBook Air. It uses MLX for Apple GPU acceleration and will not work on Intel Macs or other platforms.

## What It Does

```
Novel .txt file  ──►  Character detection + emotion analysis  ──►  .story.json  ──►  FLAC/WAV audio
```

The pipeline breaks a plain text story into segments, identifies speakers, assigns emotions and speaking speeds, casts appropriate voices for each character, then synthesizes speech using Kokoro-82M.

## Features

- **Multi-character voice casting** — each character gets a unique, gender-appropriate voice
- **Emotion-aware synthesis** — 8 emotion presets (neutral, happy, excited, sad, calm, serious, whispery, storytelling) with speed modifiers
- **Multi-language** — English (US/UK), Mandarin Chinese, Japanese, Spanish, French, Hindi, Italian, Portuguese
- **Book mode** — manage multi-chapter novels with consistent character voices across all chapters
- **Two WebUIs** — simple TTS studio and advanced story producer with real-time progress
- **CLI pipeline** — parse, produce, and batch-process from the command line

## Quick Start

### Setup

```bash
cd mlx_tts
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### Single Story

```bash
# 1. Parse text into structured story JSON
.venv/bin/python story_to_voice.py parse story.txt --lang zh

# 2. Generate audio
.venv/bin/python story_to_voice.py produce story.story.json
```

### Multi-Chapter Book

```bash
# 1. Initialize book project
.venv/bin/python story_to_voice.py init-book my_novel --lang zh --title "我的小說"

# 2. Place chapter files in books/my_novel/chapters/
#    chapter-001.txt, chapter-002.txt, ...

# 3. Parse all chapters
.venv/bin/python story_to_voice.py parse-chapter books/my_novel/

# 4. Produce audio for all chapters
.venv/bin/python story_to_voice.py produce-book books/my_novel/
```

### WebUI

```bash
# TTS Studio — simple generation + book browser (port 7860)
.venv/bin/python webui.py

# Story Studio — advanced segment editor + SSE production (port 7861)
.venv/bin/python story_studio.py
```

Open http://localhost:7860 for the TTS Studio, or http://localhost:7860/books for the book browser.

## Story JSON Format

Each story is represented as a `.story.json` file with typed segments:

```json
{
  "version": "1.0",
  "title": "The Last Light",
  "silence_ms": 500,
  "output_format": "flac",
  "metadata": {
    "source": "story.txt",
    "created": "2026-04-06T12:00:00",
    "language": "zh"
  },
  "segments": [
    {
      "id": "seg_1",
      "character": "Narrator",
      "text": "那是冬天的上海，街道像一條冰封的河。",
      "voice": "zm_yunjian",
      "lang": "zh",
      "emotion": "storytelling",
      "speed": 0.97
    },
    {
      "id": "seg_2",
      "character": "陳懷遠",
      "text": "我明天就要走了。",
      "voice": "zm_yunxi",
      "lang": "zh",
      "emotion": "sad",
      "speed": 0.85
    }
  ]
}
```

## Available Voices

### Chinese (Mandarin)
| Voice | Gender | Style |
|-------|--------|-------|
| `zm_yunjian` | Male | Deep, broadcast — great for narrator |
| `zm_yunxi` | Male | Natural, warm — male leads |
| `zf_xiaobei` | Female | Lively, bright — female leads |
| `zf_xiaoni` | Female | Gentle, soft — motherly characters |

### English (American)
| Voice | Gender | Style |
|-------|--------|-------|
| `af_heart` | Female | Warm, emotional |
| `af_sarah` | Female | Professional |
| `af_bella` | Female | Bright, energetic |
| `am_adam` | Male | Deep, resonant |
| `am_michael` | Male | Friendly |
| `am_echo` | Male | Dramatic |

### English (British)
| Voice | Gender | Style |
|-------|--------|-------|
| `bm_george` | Male | Classic, rich — default narrator |
| `bm_lewis` | Male | Calm, steady |
| `bf_emma` | Female | Elegant |

### Japanese
| Voice | Gender | Style |
|-------|--------|-------|
| `jm_kumo` | Male | Calm — narrator |
| `jf_alpha` | Female | Expressive |
| `jf_gongitsune` | Female | Storyteller |

## Emotion Presets

| Emotion | Speed | Use For |
|---------|-------|---------|
| `neutral` | 1.0x | Default dialogue |
| `happy` | 1.08x | Joyful moments |
| `excited` | 1.18x | Action, surprise |
| `sad` | 0.85x | Loss, sorrow |
| `calm` | 0.92x | Peaceful, endings |
| `serious` | 0.95x | Tension, danger |
| `whispery` | 0.88x | Intimate, secrets |
| `storytelling` | 0.97x | Narration |

## Book Project Structure

```
books/my_novel/
├── book.json                    # Book metadata + character→voice registry
└── chapters/
    ├── chapter-001.txt          # Raw chapter text
    ├── chapter-001.story.json   # Parsed segments
    └── chapter-001.flac         # Generated audio
```

The `book.json` maintains a character voice registry so voices stay consistent across all chapters.

## Architecture

- **TTS Engine**: Kokoro-82M model running on Apple MLX framework
- **Backend**: FastAPI (Python) with async audio generation
- **Frontend**: Embedded HTML/JS single-page apps
- **Audio**: FLAC (lossless, default) or WAV output at 24kHz
- **LLM Integration**: Optional AI content generation via Claude API (for drafting text)

## CLI Reference

```bash
# Parse a story text file
python story_to_voice.py parse <file.txt> --lang zh -o output.story.json

# Generate audio from a story JSON
python story_to_voice.py produce <file.story.json> -o output.flac

# Book management
python story_to_voice.py init-book <name> --lang zh --title "Title"
python story_to_voice.py parse-chapter books/<name>/ [--chapter NNN]
python story_to_voice.py produce-book books/<name>/ [--chapter NNN] [--force]
```
