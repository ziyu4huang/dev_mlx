"""
Kokoro voice catalog.

Prefix legend:
  a = American, b = British
  f = female,   m = male
"""

KOKORO_VOICES: dict[str, dict] = {
    # ---------- American Female ----------
    "af_heart":    {"lang": "en-us", "gender": "female", "accent": "american", "note": "warm & expressive (default)"},
    "af_sarah":    {"lang": "en-us", "gender": "female", "accent": "american", "note": "clear & professional"},
    "af_bella":    {"lang": "en-us", "gender": "female", "accent": "american", "note": "bright & energetic"},
    "af_sky":      {"lang": "en-us", "gender": "female", "accent": "american", "note": "calm & soothing"},
    "af_nicole":   {"lang": "en-us", "gender": "female", "accent": "american", "note": "natural conversational"},
    "af_nova":     {"lang": "en-us", "gender": "female", "accent": "american", "note": "smooth & confident"},
    # ---------- American Male ------------
    "am_adam":     {"lang": "en-us", "gender": "male",   "accent": "american", "note": "deep & authoritative"},
    "am_michael":  {"lang": "en-us", "gender": "male",   "accent": "american", "note": "friendly & clear"},
    "am_echo":     {"lang": "en-us", "gender": "male",   "accent": "american", "note": "resonant"},
    "am_liam":     {"lang": "en-us", "gender": "male",   "accent": "american", "note": "casual & relaxed"},
    # ---------- British Female -----------
    "bf_emma":     {"lang": "en-gb", "gender": "female", "accent": "british",  "note": "elegant & precise"},
    "bf_isabella": {"lang": "en-gb", "gender": "female", "accent": "british",  "note": "warm & refined"},
    # ---------- British Male -------------
    "bm_george":   {"lang": "en-gb", "gender": "male",   "accent": "british",  "note": "classic & distinguished"},
    "bm_lewis":    {"lang": "en-gb", "gender": "male",   "accent": "british",  "note": "calm & measured"},
    "bm_daniel":   {"lang": "en-gb", "gender": "male",   "accent": "british",  "note": "formal newsreader style"},
}

DEFAULT_VOICE = "af_heart"


def list_voices(gender: str = None, accent: str = None) -> dict[str, dict]:
    """Return filtered voice catalog."""
    result = KOKORO_VOICES
    if gender:
        result = {k: v for k, v in result.items() if v["gender"] == gender.lower()}
    if accent:
        result = {k: v for k, v in result.items() if v["accent"] == accent.lower()}
    return result


def voice_info(voice_id: str) -> dict | None:
    return KOKORO_VOICES.get(voice_id)
