export interface Voice {
  id: string;
  name: string;
  description: string;
  lang: string;
  gender: "male" | "female";
}

export interface VoiceGroup {
  language: string;
  prefix: string;
  color: string;
  voices: Voice[];
}

export const voiceGroups: VoiceGroup[] = [
  {
    language: "American English",
    prefix: "a",
    color: "#60a5fa",
    voices: [
      { id: "af_heart", name: "Heart", description: "Warm & expressive", lang: "en-us", gender: "female" },
      { id: "af_sarah", name: "Sarah", description: "Clear & professional", lang: "en-us", gender: "female" },
      { id: "af_bella", name: "Bella", description: "Bright & energetic", lang: "en-us", gender: "female" },
      { id: "af_sky", name: "Sky", description: "Calm & soothing", lang: "en-us", gender: "female" },
      { id: "af_nicole", name: "Nicole", description: "Natural conversational", lang: "en-us", gender: "female" },
      { id: "af_nova", name: "Nova", description: "Smooth & confident", lang: "en-us", gender: "female" },
      { id: "am_adam", name: "Adam", description: "Deep & authoritative", lang: "en-us", gender: "male" },
      { id: "am_michael", name: "Michael", description: "Friendly & clear", lang: "en-us", gender: "male" },
      { id: "am_echo", name: "Echo", description: "Resonant", lang: "en-us", gender: "male" },
      { id: "am_liam", name: "Liam", description: "Casual & relaxed", lang: "en-us", gender: "male" },
    ],
  },
  {
    language: "British English",
    prefix: "b",
    color: "#a78bfa",
    voices: [
      { id: "bf_emma", name: "Emma", description: "Elegant & precise", lang: "en-gb", gender: "female" },
      { id: "bf_isabella", name: "Isabella", description: "Warm & refined", lang: "en-gb", gender: "female" },
      { id: "bm_george", name: "George", description: "Classic & distinguished", lang: "en-gb", gender: "male" },
      { id: "bm_lewis", name: "Lewis", description: "Calm & measured", lang: "en-gb", gender: "male" },
      { id: "bm_daniel", name: "Daniel", description: "Formal newsreader", lang: "en-gb", gender: "male" },
    ],
  },
  {
    language: "Mandarin Chinese",
    prefix: "z",
    color: "#f87171",
    voices: [
      { id: "zf_xiaobei", name: "小北", description: "Lively & youthful", lang: "zh", gender: "female" },
      { id: "zf_xiaoni", name: "小妮", description: "Gentle & warm", lang: "zh", gender: "female" },
      { id: "zm_yunjian", name: "云健", description: "Deep broadcast voice", lang: "zh", gender: "male" },
      { id: "zm_yunxi", name: "云希", description: "Natural & conversational", lang: "zh", gender: "male" },
    ],
  },
  {
    language: "Japanese",
    prefix: "j",
    color: "#4ade80",
    voices: [
      { id: "jf_alpha", name: "Alpha", description: "Clear & expressive", lang: "ja", gender: "female" },
      { id: "jf_gongitsune", name: "Gongitsune", description: "Storyteller style", lang: "ja", gender: "female" },
      { id: "jm_kumo", name: "Kumo", description: "Calm & measured", lang: "ja", gender: "male" },
    ],
  },
];
