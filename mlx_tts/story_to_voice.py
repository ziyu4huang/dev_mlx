"""
story-to-voice: Convert plain text stories into Story Studio JSON projects.

Usage:
    cd mlx_tts
    python story_to_voice.py story.txt
    python story_to_voice.py story.txt -o my_story.story.json --lang en

Pipeline:
    story.txt → .story.json → Import in Story Studio GUI → Produce → FLAC/WAV
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from typing import Optional

# ── Voice assignment tables ────────────────────────────────────────────────────

NARRATOR_VOICE = "bm_george"
NARRATOR_LANG = "en-gb"

# Voices assigned to speaking characters in order of appearance
MALE_VOICES = ["am_adam", "am_michael", "am_echo", "am_liam", "bm_lewis", "bm_daniel"]
FEMALE_VOICES = ["af_heart", "af_sarah", "af_bella", "af_sky", "bf_emma", "bf_isabella"]

# ── Emotion heuristics ─────────────────────────────────────────────────────────

URGENCY_WORDS = {"lost", "emergency", "warning", "danger", "help", "hurry", "quick",
                 "screamed", "burned", "crackled", "storm", "fog"}
CALM_WORDS = {"safe", "calm", "quiet", "peaceful", "silence", "still", "gentle",
              "cup of tea", "sat", "sitting", "relief", "finally"}
SAD_WORDS = {"alone", "shaking", "cold", "dark", "empty", "gone", "lost", "died",
             "never", "last", "final"}


def _guess_emotion(text: str, is_dialogue: bool, is_short: bool) -> str:
    """Heuristic emotion assignment based on text content."""
    lower = text.lower()

    if is_dialogue:
        # Questions → serious
        if "?" in text:
            return "serious"
        # Exclamations → excited or serious
        if text.count("!") >= 2:
            return "excited"
        if "!" in text:
            return "serious"
        # Short dialogue → whispery or calm
        if is_short:
            return "whispery"
        return "calm"

    # Narration
    if any(w in lower for w in URGENCY_WORDS):
        return "serious"
    if any(w in lower for w in SAD_WORDS):
        return "calm"
    if is_short:
        return "serious"
    return "storytelling"


def _guess_speed(emotion: str, is_short: bool) -> float:
    """Speed multiplier based on emotion and segment length."""
    base = {
        "storytelling": 0.97,
        "serious": 0.95,
        "calm": 0.92,
        "whispery": 0.88,
        "excited": 1.05,
        "sad": 0.88,
        "happy": 1.0,
        "neutral": 1.0,
    }
    s = base.get(emotion, 1.0)
    if is_short and emotion in ("serious", "calm", "whispery"):
        s -= 0.05
    return max(0.5, round(s, 2))


# ── Text parsing ───────────────────────────────────────────────────────────────

# Matches quoted dialogue: "text" or 「text」
DIALOGUE_RE = re.compile(r'\u201c([^\u201d]*)\u201d|"([^"]*)"|\u300c([^\u300d]*)\u300d')

SPEECH_VERBS = (
    "said|replied|whispered|shouted|called|asked|answered|murmured|"
    "cried|exclaimed|added|continued|snapped|barked|growled|offered|"
    "remarked|stated|declared|told|noted|observed|called out|yelled|"
    "寫道|說道|笑著說|問道|答道|嘆道|叫道|喊道|說|問|答|嘆|叫|喊"
)

# Chinese attribution: 「text，」他說 / 「text，」她說 / 「text，」Name說
ZH_ATTRIBUTION_RE = re.compile(
    r'^(?:他|她|它)(?:在[^的]*的?(?:信|書|紙|日記)[中裡]?|(?:笑|嘆|輕|低|大|急)著?)?(?:寫道|說道|問道|答道|說|問|答|嘆|喊)'
)
# Chinese name + speech verb: Name + 說/問 (NOT starting with pronouns)
ZH_NAME_ATTRIBUTION_RE = re.compile(
    r'^([^他她它的我你這那][\u4e00-\u9fff]{1,3})(?:笑著|輕聲|低聲|大聲|急著)?(?:寫道|說道|問道|答道|說|問|答)'
)

# Post-dialogue attribution: "text," the Name said / "text," Name said
POST_ATTRIBUTION_RE = re.compile(
    r'^(?:the\s+)?([A-Z][a-zA-Z]+)(?:\s+(?:' + SPEECH_VERBS + r'))',
)
# Pre-dialogue attribution: Name said, "text"
PRE_ATTRIBUTION_RE = re.compile(
    r'([A-Z][a-zA-Z]+)\s+(?:' + SPEECH_VERBS + r')[,:]\s*$'
)

# Words that are NOT character names
NON_NAMES = frozenset({
    "The", "A", "An", "But", "And", "Or", "So", "He", "She", "It", "They",
    "We", "His", "Her", "Its", "Their", "This", "That", "There", "Then",
    "At", "In", "On", "When", "After", "Before", "Every", "His", "What",
    "How", "Why", "Where", "Who", "Which", "No", "Not", "Yes", "Just",
    "Only", "Even", "Still", "Already", "Never", "Always", "Now", "Here",
})


def _is_attribution_only(text: str) -> bool:
    """Check if a narration fragment is just speaker attribution."""
    stripped = text.strip().rstrip(".")

    # English: "the captain said" / "Daniel said softly"
    if re.match(
        rf'^(?:the\s+)?[A-Za-z][a-zA-Z]+\s+(?:{SPEECH_VERBS})(?:\s+(?:softly|loudly|quietly|calmly|gently|slowly|quickly|urgently))?$',
        stripped,
    ):
        return True

    # Chinese: 他說 / 她說 / 陳懷遠說 / 書店老闆笑著說
    if ZH_ATTRIBUTION_RE.match(stripped):
        return True
    if ZH_NAME_ATTRIBUTION_RE.match(stripped):
        return True

    return False


def _extract_name_from_attribution(text: str, last_narration: str = "") -> Optional[str]:
    """Extract a character name from an attribution fragment.

    Handles "Daniel said", "the captain said", and Chinese patterns.
    """
    stripped = text.strip().rstrip(".")

    # English: "the captain said" → return Title-cased name
    m = re.match(rf'^the\s+([a-z][a-zA-Z]+)\s+(?:{SPEECH_VERBS})', stripped)
    if m:
        return m.group(1).capitalize()

    # English: "Daniel said"
    m = re.match(rf'^([A-Z][a-zA-Z]+)', stripped)
    if m and m.group(1) not in NON_NAMES:
        return m.group(1)

    # Chinese: 他說 → look at last narration for male name
    if re.match(r'^他(?:在[^的]*的?(?:信|書)[中裡]?)?(?:寫道|說道|說)', stripped):
        return _find_last_name(last_narration, gender="male")

    # Chinese: 她說 → look at last narration for female name
    if re.match(r'^她(?:輕聲|低聲)?(?:說道|說|問)', stripped):
        return _find_last_name(last_narration, gender="female")

    # Chinese: Name + 說 (e.g., 書店老闆笑著說)
    m = ZH_NAME_ATTRIBUTION_RE.match(stripped)
    if m:
        return m.group(1)

    return None


# Common Chinese surnames for name boundary detection
ZH_SURNAMES = set(
    "陳林王張李劉趙黃周吳徐孫胡朱高何郭馬羅梁宋鄭謝韓唐馮于董蕭程曹袁鄧許"
    "傅沈曾彭呂蘇盧蔣蔡賈丁魏薛葉閻余潘杜戴夏鍾汪田任姜方石姚譚廖鄒熊金"
    "陸郝孔白崔康毛邱秦江史顧侯邵孟龍萬段雷錢湯尹黎易常武喬賀賴龔文"
)


def _extract_zh_names(text: str) -> list[str]:
    """Extract Chinese names from text using surname boundary detection."""
    names = []
    for m in re.finditer(r'[\u4e00-\u9fff]+', text):
        chunk = m.group(0)
        for i, ch in enumerate(chunk):
            if ch in ZH_SURNAMES and i + 1 < len(chunk):
                # Surname found — take 2-3 chars as the name
                for name_len in (2, 3):
                    if i + name_len > len(chunk):
                        continue
                    end = i + name_len
                    after = chunk[end] if end < len(chunk) else ""
                    if not after or after in "的說問答站坐走跑看望握拿蹲修寄去在笑嘆低大急著是了過來到被把讓給也與和及":
                        names.append(chunk[i:end])
                        break
                break
    return names


def _find_last_name(narration: str, gender: str = None):
    """Find the most recently mentioned Chinese name in narration text."""
    if not narration:
        return None
    names = _extract_zh_names(narration)
    if not names:
        return None
    return names[-1]


def _extract_dialogue_segments(paragraph: str) -> list[tuple[str, bool, bool]]:
    """Split a paragraph into (text, is_dialogue, is_attribution) tuples.

    Returns alternating narration and dialogue chunks.
    Third element indicates if this trailing narration is just attribution.
    """
    parts: list[tuple[str, bool, bool]] = []
    last_end = 0

    for m in DIALOGUE_RE.finditer(paragraph):
        # Narration before this dialogue
        narration = paragraph[last_end:m.start()].strip()
        # Strip trailing attribution connector like "Name said:" or "—" or "："
        narration = re.sub(r'[:,：，—–-]\s*$', '', narration).strip()

        if narration:
            # Check if inter-dialogue narration is just attribution
            is_attr = _is_attribution_only(narration)
            parts.append((narration, False, is_attr))

        # The dialogue text (group 1=curly "", group 2=straight "", group 3=「」)
        dialogue = (m.group(1) or m.group(2) or m.group(3) or "").strip()
        # Strip trailing comma/semicolon (from patterns like "text," he said or 「text，」他說)
        dialogue = dialogue.rstrip(",;，；")
        if dialogue:
            parts.append((dialogue, True, False))

        last_end = m.end()

    # Trailing narration — check if it's just attribution
    trailing = paragraph[last_end:].strip()
    if trailing:
        is_attr = _is_attribution_only(trailing)
        parts.append((trailing, False, is_attr))

    return parts


def _detect_speaker(text_before: str, text_after: str, text_after_is_attr: bool,
                    last_speaker: str, last_last_speaker: str,
                    prev_narration: str, known_chars: set[str]) -> str:
    """Identify the speaker for a dialogue segment.

    Uses attribution patterns, context from surrounding narration, and
    conversation turn-taking as fallback.
    """
    # 1. Post-attribution: "text," the Name said / the captain said / 他說
    if text_after:
        name = _extract_name_from_attribution(text_after, prev_narration)
        if name:
            return name

    # 2. Pre-attribution: Name said, "text" or Name grabbed... "text"
    if text_before:
        m = PRE_ATTRIBUTION_RE.search(text_before)
        if m:
            return m.group(1)
        # Name at start of narration before dialogue
        m = re.match(r'^([A-Z][a-zA-Z]+)\s', text_before)
        if m and m.group(1) not in NON_NAMES:
            return m.group(1)
        # Chinese: Name + 說/笑著說 before 「 (exclude pronoun starters)
        m = re.search(r'([^他她它我你這那\n][\u4e00-\u9fff]{1,3})(?:笑著|輕聲|低聲|大聲)?(?:寫道|說道|問道|答道|說|問)[：:]?$', text_before)
        if m:
            return m.group(1)
        # Chinese: look for name at start of narration (「妳不能去，」他說 → 他 in between)
        # Actually this is handled by the attribution check above

    # 3. Check preceding narration for character mention
    #    "Daniel looked up and gave the only reply..." → Daniel is about to speak
    if prev_narration:
        for name in known_chars:
            if name == "Narrator" or name.startswith("Speaker "):
                continue
            if name in prev_narration:
                return name

    # 4. Conversation turn-taking: alternate between last two speakers
    if last_speaker and last_last_speaker and last_speaker != last_last_speaker:
        return last_last_speaker

    return last_speaker


# ── Character voice assignment ─────────────────────────────────────────────────

class VoiceAssigner:
    """Assign unique voices to characters in order of first dialogue."""

    def __init__(self, male_voices: list[str] = None, female_voices: list[str] = None):
        self._char_voice: dict[str, str] = {}
        self._male = male_voices or MALE_VOICES
        self._female = female_voices or FEMALE_VOICES
        self._idx = 0

    def assign(self, character: str) -> str:
        if character in self._char_voice:
            return self._char_voice[character]

        voice = self._male[self._idx % len(self._male)]
        self._idx += 1
        self._char_voice[character] = voice
        return voice


# ── Main parser ────────────────────────────────────────────────────────────────

def parse_story(text: str, lang: str = "en", source_file: str = "") -> dict:
    """Parse plain text story into Story Studio JSON project."""
    lines = text.split("\n")

    # Extract title from first non-empty line
    title = "Untitled Story"
    body_start = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped and not stripped.startswith('"') and not stripped.startswith("\u201c"):
            title = stripped
            body_start = i + 1
            break
        elif stripped:
            # First line is dialogue — no title
            body_start = i
            break

    # Split remaining text into paragraphs (separated by blank lines)
    paragraphs: list[str] = []
    current: list[str] = []
    for line in lines[body_start:]:
        stripped = line.strip()
        if stripped:
            current.append(stripped)
        else:
            if current:
                paragraphs.append(" ".join(current))
                current = []
    if current:
        paragraphs.append(" ".join(current))

    # Parse each paragraph into segments
    # Language-aware voice pools
    if lang == "zh":
        _male = ["zm_yunjian", "zm_yunxi"]
        _female = ["zf_xiaobei", "zf_xiaoni"]
    elif lang == "ja":
        _male = ["jm_kumo"]
        _female = ["jf_alpha", "jf_gongitsune"]
    else:
        _male = MALE_VOICES
        _female = FEMALE_VOICES

    assigner = VoiceAssigner(_male, _female)
    segments: list[dict] = []
    seg_counter = 0
    last_speaker = ""       # most recent dialogue speaker
    prev_speaker = ""       # speaker before last (for turn-taking)
    speaker_counter = 0    # for generating fallback names
    last_narration = ""    # text of most recent narration segment
    known_chars: set[str] = set()

    # Language-aware narrator voice
    narr_voice, narr_lang = _narrator_for_lang(lang)

    for para in paragraphs:
        parts = _extract_dialogue_segments(para)

        # If no dialogue found, it's pure narration
        if not parts:
            last_narration = para
            seg_counter += 1
            is_short = len(para) < 60
            emotion = _guess_emotion(para, False, is_short)
            segments.append(_make_segment(
                seg_counter, "Narrator", para, narr_voice,
                narr_lang, emotion, _guess_speed(emotion, is_short),
            ))
            continue

        # If the paragraph is entirely one dialogue quote
        if len(parts) == 1 and parts[0][1]:
            text, _, _ = parts[0]
            speaker = _detect_speaker("", "", False, last_speaker, prev_speaker, last_narration, known_chars)
            if not speaker:
                speaker_counter += 1
                speaker = f"Speaker {speaker_counter}"
            known_chars.add(speaker)
            seg_counter += 1
            is_short = len(text) < 60
            emotion = _guess_emotion(text, True, is_short)
            prev_speaker, last_speaker = last_speaker, speaker
            segments.append(_make_segment(
                seg_counter, speaker, text, assigner.assign(speaker),
                _char_lang(lang), emotion, _guess_speed(emotion, is_short),
            ))
            last_narration = ""
            continue

        # Mixed paragraph — process each part
        for j, (text, is_dialogue, is_attribution) in enumerate(parts):
            if not text.strip():
                continue

            # Skip attribution-only fragments ("the captain said." / 他說)
            if is_attribution:
                name = _extract_name_from_attribution(text, last_narration)
                if name:
                    if segments and segments[-1]["character"].startswith("Speaker "):
                        segments[-1]["character"] = name
                        assigner.assign(name)
                    known_chars.add(name)
                    last_speaker = name
                continue

            seg_counter += 1

            if is_dialogue:
                # Look backward for narration context, skipping attribution-only parts
                before = ""
                for k in range(j - 1, -1, -1):
                    if not parts[k][2]:  # not attribution-only
                        before = parts[k][0]
                        break
                # Look ahead for attribution (skip attribution-only parts)
                after = ""
                for k in range(j + 1, len(parts)):
                    if not parts[k][1]:  # narration
                        if not parts[k][2]:  # not attribution-only
                            after = parts[k][0]
                        break
                speaker = _detect_speaker(before, after, False, last_speaker, prev_speaker, last_narration, known_chars)
                if not speaker:
                    speaker_counter += 1
                    speaker = f"Speaker {speaker_counter}"
                known_chars.add(speaker)
                is_short = len(text) < 60
                emotion = _guess_emotion(text, True, is_short)
                prev_speaker, last_speaker = last_speaker, speaker
                segments.append(_make_segment(
                    seg_counter, speaker, text, assigner.assign(speaker),
                    _char_lang(lang), emotion, _guess_speed(emotion, is_short),
                ))
                last_narration = ""
            else:
                is_short = len(text) < 60
                emotion = _guess_emotion(text, False, is_short)
                segments.append(_make_segment(
                    seg_counter, "Narrator", text, narr_voice,
                    narr_lang, emotion, _guess_speed(emotion, is_short),
                ))
                last_narration = text

    return {
        "version": "1.0",
        "title": title,
        "silence_ms": 500,
        "output_format": "flac",
        "metadata": {
            "source": source_file,
            "created": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "author": "",
            "language": lang,
        },
        "segments": segments,
    }


def _char_lang(lang: str) -> str:
    """Map language code to Story Studio lang code."""
    mapping = {"en": "en-gb", "zh": "zh", "ja": "ja", "es": "es",
               "fr": "fr", "de": "de"}
    return mapping.get(lang, "en-gb")


def _narrator_for_lang(lang: str) -> tuple[str, str]:
    """Get (voice, lang_code) for narrator based on story language."""
    narrators = {
        "en": ("bm_george", "en-gb"),
        "zh": ("zm_yunjian", "zh"),
        "ja": ("jm_kumo", "ja"),
    }
    return narrators.get(lang, ("bm_george", "en-gb"))


def _make_segment(idx: int, character: str, text: str, voice: str,
                  lang: str, emotion: str, speed: float) -> dict:
    return {
        "id": f"seg_{idx}",
        "character": character,
        "text": text,
        "voice": voice,
        "lang": lang,
        "emotion": emotion,
        "speed": speed,
    }


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Convert plain text story → Story Studio .story.json",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Pipeline:
  python story_to_voice.py story.txt
  → generates story.story.json
  → Import in Story Studio GUI → Produce → FLAC/WAV audiobook
        """,
    )
    parser.add_argument("input", help="Plain text story file")
    parser.add_argument("-o", "--output", help="Output .story.json path (default: <stem>.story.json)")
    parser.add_argument("--lang", default="en", help="Language code (default: en)")
    args = parser.parse_args()

    src = Path(args.input)
    if not src.exists():
        print(f"Error: {src} not found", file=sys.stderr)
        sys.exit(1)

    text = src.read_text()
    project = parse_story(text, lang=args.lang, source_file=src.name)

    out_path = Path(args.output) if args.output else src.with_suffix(".story.json")
    out_path.write_text(json.dumps(project, indent=2, ensure_ascii=False))

    n_segs = len(project["segments"])
    chars = sorted({s["character"] for s in project["segments"]})
    print(f"  {src.name} → {out_path.name}")
    print(f"  {n_segs} segments, {len(chars)} characters: {', '.join(chars)}")
    print(f"  Import in Story Studio: http://localhost:7861")


if __name__ == "__main__":
    main()
