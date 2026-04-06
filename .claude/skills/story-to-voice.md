---
name: story-to-voice
description: Analyze a story file (text/markdown) using LLM understanding to produce a high-quality .story.json with proper character voices, emotions, and pacing. Then generate audio via CLI.
---

# Story-to-Voice Skill

Convert a plain story file into a structured `.story.json` audiobook project, then produce audio — entirely via CLI, no webui needed.

## Pipeline

```
story.txt ──► [LLM Analysis] ──► .story.json ──► [story_to_voice.py produce] ──► .flac
               creative layer                  mechanical layer
```

## Instructions

When the user provides a story file path, follow these steps:

### 1. Read & Analyze the Story

Read the story file completely. Use your language understanding to identify:

- **Language**: English, Chinese, Japanese, Spanish, French, etc.
- **Genre**: romance, literary fiction, thriller, fantasy, historical, sci-fi, etc.
- **Characters**: Extract every named character. For each, determine:
  - Name
  - Gender (for voice casting)
  - Role (protagonist, antagonist, supporting, narrator)
  - Relationships to other characters
- **Emotional Arc**: Map the overall story arc (e.g., nostalgic → tense → bittersweet ending)

### 2. Decompose into Segments

Split the story into segments. Each segment should be a natural speech unit (1-3 sentences).

**Character Attribution Rules:**
- **Narration** → character: `"Narrator"`
- **Dialogue in quotes** (`"..."`, `"..."`, `「...」`) → attribute to the correct character using context
- **Chinese pronouns** (他 → male name, 她 → female name) → resolve to the actual character based on scene context
- **Implied speakers** (e.g., a response after a question) → use conversation turn-taking and scene context

**Emotion Rules (genre-aware):**

| Scene Type | Emotion | Speed | Notes |
|------------|---------|-------|-------|
| Opening narration | `storytelling` | 0.97 | Sets the tone |
| Nostalgic flashback | `calm` | 0.92 | Warm, reflective |
| Dialogue (neutral) | `neutral` | 1.0 | Default for conversation |
| Dialogue (question) | `neutral` | 1.0 | Curious, inquiring |
| Dialogue (tension) | `serious` | 0.95 | Conflict, urgency |
| Dialogue (intimate) | `whispery` | 0.88 | Secrets, closeness |
| Action / climax | `excited` | 1.08 | Fast, energetic |
| Loss / grief | `sad` | 0.85 | Slow, heavy |
| Joy / reunion | `happy` | 1.05 | Warm, bright |
| Resolution / ending | `calm` | 0.90 | Peaceful closure |

**Emotion should follow the narrative arc, not just keywords.** A sentence about rain can be `sad` in a breakup scene or `calm` in a cozy flashback — context matters.

### 3. Cast Voices

Assign distinct voices based on character gender and personality:

**Chinese (Mandarin) voices:**
| Voice | Gender | Personality | Best For |
|-------|--------|-------------|----------|
| `zm_yunjian` | Male | Deep, broadcast | Narrator, authoritative figures |
| `zm_yunxi` | Male | Natural, warm | Male protagonists, love interests |
| `zf_xiaobei` | Female | Lively, bright | Female protagonists, young women |
| `zf_xiaoni` | Female | Gentle, soft | Motherly figures, gentle characters |

**English (American) voices:**
| Voice | Gender | Personality | Best For |
|-------|--------|-------------|----------|
| `af_heart` | Female | Warm, emotional | Female protagonists |
| `af_sarah` | Female | Professional | Authority figures |
| `af_bella` | Female | Bright, energetic | Young characters |
| `af_nova` | Female | Confident | Strong female leads |
| `am_adam` | Male | Deep, resonant | Male protagonists |
| `am_michael` | Male | Friendly | Casual characters |
| `am_echo` | Male | Dramatic | Villains, authority |

**English (British) voices:**
| Voice | Gender | Personality | Best For |
|-------|--------|-------------|----------|
| `bm_george` | Male | Classic, rich | Narrator (default for EN) |
| `bm_lewis` | Male | Calm, steady | Supporting male |
| `bm_daniel` | Male | Formal | Authority figures |
| `bf_emma` | Female | Elegant | Female leads |
| `bf_isabella` | Female | Warm | Supporting female |

**Japanese voices:**
| Voice | Gender | Personality | Best For |
|-------|--------|-------------|----------|
| `jm_kumo` | Male | Calm | Narrator, male leads |
| `jf_alpha` | Female | Expressive | Female leads |
| `jf_gongitsune` | Female | Storyteller | Narrator, older women |

**Voice assignment strategy:**
1. Narrator: `bm_george` (EN), `zm_yunjian` (ZH), `jm_kumo` (JA)
2. Male protagonist: `am_adam` (EN), `zm_yunxi` (ZH)
3. Female protagonist: `af_heart` (EN), `zf_xiaobei` (ZH)
4. Supporting characters: pick from remaining same-gender pool based on personality fit
5. Each named character gets a unique voice

### 4. Determine Language Code

- English (US): `"en-us"`
- English (UK): `"en-gb"`
- Mandarin Chinese: `"zh"`
- Japanese: `"ja"`
- Spanish: `"es"`
- French: `"fr"`

### 5. Write .story.json

Write the file to `mlx_tts/stories/<slug>.story.json` where `<slug>` is the story title lowercased with spaces replaced by underscores (max 40 chars).

#### JSON Format

```json
{
  "version": "1.0",
  "title": "Story Title",
  "silence_ms": 500,
  "output_format": "flac",
  "metadata": {
    "source": "original_file.txt",
    "created": "ISO-8601 timestamp",
    "author": "",
    "language": "zh"
  },
  "segments": [
    {
      "id": "seg_1",
      "character": "Narrator",
      "text": "Once upon a time...",
      "voice": "bm_george",
      "lang": "en-gb",
      "emotion": "storytelling",
      "speed": 0.97
    }
  ]
}
```

### 6. Produce Audio

Run the produce command to generate audio:

```bash
cd mlx_tts && .venv/bin/python story_to_voice.py produce stories/<slug>.story.json
```

### 7. Report Results

Tell the user:
- How many segments were created
- Characters detected and their assigned voices
- Emotional arc summary
- Output file path
- Duration and file size

## Available Emotions (Reference)

| Key | Label | Speed Mult | Use For |
|-----|-------|-----------|---------|
| `neutral` | Neutral | 1.0x | Default dialogue |
| `happy` | Happy | 1.08x | Joyful, warm moments |
| `excited` | Excited | 1.18x | Action, surprise, energy |
| `sad` | Sad | 0.85x | Loss, sorrow, melancholy |
| `calm` | Calm | 0.92x | Peaceful, endings, reflection |
| `serious` | Serious | 0.95x | Authority, tension, danger |
| `whispery` | Whispery | 0.88x | Intimate, secrets, close |
| `storytelling` | Storytelling | 0.97x | Narration, reading aloud |

## Example: Well-Crafted Chinese Story JSON

This is the quality bar. Characters are properly identified, emotions follow the arc, voices match gender:

```json
{
  "version": "1.0",
  "title": "最後一盞燈",
  "silence_ms": 500,
  "output_format": "flac",
  "metadata": {
    "source": "chinese_story.txt",
    "created": "2026-04-06T00:00:00",
    "author": "",
    "language": "zh"
  },
  "segments": [
    {
      "id": "seg_1",
      "character": "Narrator",
      "text": "那是一九四九年的冬天，上海的街道像一條冰封的河。",
      "voice": "zm_yunjian",
      "lang": "zh",
      "emotion": "storytelling",
      "speed": 0.97
    },
    {
      "id": "seg_4",
      "character": "陳懷遠",
      "text": "我明日就要去了，去一個我不知道能不能回來的地方。但在離開之前，我必須讓妳知道：那棟弄堂裡的舊書店，每天下午三點半，當陽光斜照進來的那一刻，我都在想著妳。",
      "voice": "zm_yunxi",
      "lang": "zh",
      "emotion": "sad",
      "speed": 0.85
    },
    {
      "id": "seg_18",
      "character": "林書瑤",
      "text": "就是「帶我走」三個字。",
      "voice": "zf_xiaobei",
      "lang": "zh",
      "emotion": "whispery",
      "speed": 0.85
    }
  ]
}
```
