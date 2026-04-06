---
name: story-to-voice
description: Decompose a story file (text/markdown) into a structured .story.json for the MLX TTS Voice Story Studio. Analyzes characters, dialogue, and emotions to assign voices, languages, and emotions automatically.
---

# Story-to-Voice Skill

Convert a plain story file into a structured `.story.json` file that can be imported into the MLX TTS Story Studio (http://localhost:7861).

## Instructions

When the user provides a story file path, follow these steps:

### 1. Read the Story

Read the story file completely. Identify:
- **Language**: English, Chinese, Japanese, Spanish, French, etc.
- **Characters**: Extract names from dialogue attributions (e.g., `"Daniel said"`, `林書瑤`, ` captain`)
- **Structure**: Narration paragraphs vs. dialogue lines

### 2. Decompose into Segments

Split the story into segments. Each segment should be a natural speech unit (1-3 sentences).

Rules:
- **Narration** → character: `"Narrator"`, emotion: `"storytelling"`
- **Dialogue** (text in quotes or after "Name said:") → character: extracted name, emotion based on context
- **Questions** (`?`) → emotion: `"neutral"` or `"serious"`
- **Exclamations / action** (`!` or action verbs) → emotion: `"excited"`
- **Sad words** (cried, sorrow, lost, tears, 淚, 傷心, 悲) → emotion: `"sad"`
- **Quiet/intimate** (whisper, softly, gently, 輕聲, 低語) → emotion: `"whispery"`
- **Formal/authoritative** (must, shall, 應該) → emotion: `"serious"`
- **Final resolution/ending** → emotion: `"calm"`

### 3. Assign Voices

Use the voice catalog below. Assign distinct voices to each character:

**English (American) voices:**
- Female: `af_heart` (warm), `af_sarah` (professional), `af_bella` (bright), `af_sky` (calm), `af_nicole` (conversational), `af_nova` (confident)
- Male: `am_adam` (deep), `am_michael` (friendly), `am_echo` (resonant), `am_liam` (casual)

**English (British) voices:**
- Female: `bf_emma` (elegant), `bf_isabella` (warm)
- Male: `bm_george` (classic), `bm_lewis` (calm), `bm_daniel` (formal)

**Chinese (Mandarin) voices:**
- Female: `zf_xiaobei` (lively), `zf_xiaoni` (gentle)
- Male: `zm_yunjian` (deep/broadcast), `zm_yunxi` (natural)

**Japanese voices:**
- Female: `jf_alpha` (expressive), `jf_gongitsune` (storyteller)
- Male: `jm_kumo` (calm)

**Voice assignment strategy:**
1. Narrator: `bm_george` (EN-GB), `zm_yunjian` (ZH), `jf_gongitsune` (JA)
2. First male character: `am_adam` (EN), `zm_yunxi` (ZH)
3. First female character: `af_heart` (EN), `zf_xiaobei` (ZH)
4. Subsequent characters: alternate from remaining same-gender pool
5. Default for unknown languages: `af_heart`

### 4. Determine Language Code

- English (US): `"en-us"`
- English (UK): `"en-gb"`
- Mandarin Chinese: `"zh"`
- Japanese: `"ja"`
- Spanish: `"es"`
- French: `"fr"`

### 5. Output .story.json

Write the file to `mlx_tts/stories/<slug>.story.json` where `<slug>` is the story title lowercased with spaces replaced by underscores (max 40 chars).

### JSON Format

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
    "language": "en"
  },
  "segments": [
    {
      "id": "seg_1",
      "character": "Narrator",
      "text": "Once upon a time...",
      "voice": "bm_george",
      "lang": "en-gb",
      "emotion": "storytelling",
      "speed": 1.0
    }
  ]
}
```

### 6. Confirm

After writing the file, tell the user:
- How many segments were created
- Which characters were detected and their assigned voices
- The file path for import
- How to use it: open Story Studio → click Import → select the `.story.json` file

## Available Emotions

| Key | Label | Speed Mult | Use For |
|-----|-------|-----------|---------|
| `neutral` | Neutral | 1.0× | Default dialogue |
| `happy` | Happy | 1.08× | Joyful, warm moments |
| `excited` | Excited | 1.18× | Action, surprise, energy |
| `sad` | Sad | 0.85× | Loss, sorrow, melancholy |
| `calm` | Calm | 0.92× | Peaceful, endings, reflection |
| `serious` | Serious | 0.95× | Authority, tension, danger |
| `whispery` | Whispery | 0.88× | Intimate, secrets, close |
| `storytelling` | Storytelling | 0.97× | Narration, reading aloud |
