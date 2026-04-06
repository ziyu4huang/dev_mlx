export const sampleStoryJson = {
  version: "1.0",
  title: "煙火人間 — 第一章",
  silence_ms: 500,
  output_format: "flac",
  metadata: {
    source: "chapter-001.txt",
    language: "zh",
  },
  segments: [
    {
      id: "seg_1",
      character: "Narrator",
      text: "清晨五點半，基隆港的霧還沒散盡，全叔已經推開了鐵捲門。",
      voice: "zm_yunjian",
      lang: "zh",
      emotion: "calm",
      speed: 0.95,
    },
    {
      id: "seg_2",
      character: "全叔",
      text: "今天魚一定多，我昨晚做夢都夢到大網。",
      voice: "zm_yunxi",
      lang: "zh",
      emotion: "happy",
      speed: 1.0,
    },
    {
      id: "seg_3",
      character: "Narrator",
      text: "阿娥從後頭探出頭來，手裡還拿著鍋鏟。",
      voice: "zm_yunjian",
      lang: "zh",
      emotion: "neutral",
      speed: 0.95,
    },
    {
      id: "seg_4",
      character: "阿娥",
      text: "你呀，每次都說大網，結果都是小魚！",
      voice: "zf_xiaobei",
      lang: "zh",
      emotion: "excited",
      speed: 1.05,
    },
  ],
};

export const sampleBookJson = {
  title: "煙火人間",
  author: "AI Generated",
  language: "zh",
  characters: [
    { name: "Narrator", voice: "zm_yunjian", gender: "male", role: "narrator" },
    { name: "全叔", voice: "zm_yunxi", gender: "male", role: "protagonist" },
    { name: "阿娥", voice: "zf_xiaobei", gender: "female", role: "supporting" },
    { name: "林秀蓮", voice: "zf_xiaoni", gender: "female", role: "supporting" },
  ],
  chapters: [
    { id: "chapter-001", title: "第一章 漁港的早晨", status: "produced" },
    { id: "chapter-002", title: "第二章 蛋行的秘密", status: "produced" },
    { id: "chapter-003", title: "第三章 市場人生", status: "produced" },
    { id: "chapter-004", title: "第四章 計程車的故事", status: "produced" },
    { id: "chapter-005", title: "第五章 煙火綻放", status: "produced" },
  ],
};
