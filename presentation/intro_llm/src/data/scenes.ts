import { NarrationSegment } from "../components/SubtitleOverlay";

export interface SceneData {
  title: string;
  subtitle: string;
  segments: NarrationSegment[];
}

export const scenes: Record<number, SceneData> = {
  2: {
    title: "什麼是大語言模型",
    subtitle: "What is a Large Language Model",
    segments: [
      {
        id: "seg_1",
        text: "大語言模型，簡稱 LLM，是一種能夠理解和生成人類語言的人工智慧系統。它透過閱讀大量的文字資料來學習語言的規律。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "你可以把它想像成一個讀過整座圖書館的學生，它能根據學到的知識來回答問題、寫文章、甚至寫程式。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "近年來，從 ChatGPT 到 Claude，從 Gemini 到 Llama，大語言模型已經成為人工智慧領域最引人注目的技術。",
        emotion: "serious",
        speed: 0.95,
      },
    ],
  },
  3: {
    title: "Transformer 架構",
    subtitle: "The Architecture Behind LLMs",
    segments: [
      {
        id: "seg_1",
        text: "二零一七年，Google 發表了一篇名為「Attention is All You Need」的論文，提出了 Transformer 架構。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "它的核心創新是注意力機制，讓模型能夠同時關注輸入中的所有詞，理解詞與詞之間的關係。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "這就像是閱讀時，你能同時看到整頁的內容，而不是逐字逐句地看。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_4",
        text: "Transformer 是 GPT、BERT、以及所有現代大語言模型的基礎。",
        emotion: "serious",
        speed: 0.95,
      },
    ],
  },
  4: {
    title: "訓練過程",
    subtitle: "How LLMs are Trained",
    segments: [
      {
        id: "seg_1",
        text: "大語言模型的訓練分為三個階段。第一是預訓練，模型閱讀大量文字，學習語言的基本規律。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "第二是微調，用高品質的對話資料讓模型學會更自然的互動方式。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "第三是 RLHF，也就是人類回饋強化學習，讓模型的回答更符合人類的期望和價值觀。",
        emotion: "serious",
        speed: 0.95,
      },
      {
        id: "seg_4",
        text: "每一個階段都讓模型變得更加強大和可靠。",
        emotion: "storytelling",
        speed: 0.97,
      },
    ],
  },
  5: {
    title: "關鍵概念",
    subtitle: "Key Concepts: Token, Embedding, Context",
    segments: [
      {
        id: "seg_1",
        text: "Token 是模型處理文字的基本單位，大約對應一個詞或半個詞。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "Embedding 是把文字轉換成數字向量的過程，讓模型能夠進行數學運算，理解詞語之間的語意關係。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "Context Window 是模型一次能處理的最大文字長度。GPT-4 的上下文視窗可以達到十二萬八千個 Token，相當於一本三百頁的書。",
        emotion: "serious",
        speed: 0.95,
      },
    ],
  },
  6: {
    title: "實際應用",
    subtitle: "Real-World Applications",
    segments: [
      {
        id: "seg_1",
        text: "大語言模型已經深入我們的日常生活。在寫作方面，它能幫助起草文章、翻譯文件、總結重點。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "在程式開發方面，它能自動完成程式碼、解釋錯誤訊息、協助除錯。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "在教育和醫療領域，它能提供個人化的學習建議和初步的健康諮詢。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_4",
        text: "在客服和商業領域，它能二十四小時提供即時回應和資料分析。",
        emotion: "storytelling",
        speed: 0.97,
      },
    ],
  },
  7: {
    title: "提示工程",
    subtitle: "The Art of Prompt Engineering",
    segments: [
      {
        id: "seg_1",
        text: "如何有效地使用大語言模型？關鍵在於提示工程。好的提示要具體明確，提供足夠的上下文。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "你可以用角色設定，例如告訴模型「你是一位經驗豐富的 Python 工程師」。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "你也可以用逐步思考的方式，要求模型一步一步地推理。少樣本學習是指提供幾個範例讓模型參考。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_4",
        text: "掌握這些技巧，就能大幅提升模型的輸出品質。",
        emotion: "serious",
        speed: 0.95,
      },
    ],
  },
  8: {
    title: "未來展望",
    subtitle: "The Future of Large Language Models",
    segments: [
      {
        id: "seg_1",
        text: "大語言模型的發展才剛剛開始。未來我們會看到更小的模型在手機和筆電上本地運行，更加個人化和隱私友善。",
        emotion: "storytelling",
        speed: 0.97,
      },
      {
        id: "seg_2",
        text: "多模態模型能夠同時理解文字、圖片、聲音和影片。",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_3",
        text: "AI Agent 能夠自主完成複雜的多步驟任務。開源社群也在快速進步，讓更多人能參與和貢獻。",
        emotion: "excited",
        speed: 1.0,
      },
    ],
  },
};

// Scene durations in frames (30fps) — matched to actual audio durations
export const SCENE_FRAMES = {
  1: 540,    // 18s - Intro (audio 15.75s + buffer)
  2: 990,    // 33s - What is LLM (audio 29.80s + buffer)
  3: 990,    // 33s - Transformer (audio 30.33s + buffer)
  4: 990,    // 33s - Training (audio 30.28s + buffer)
  5: 900,    // 30s - Key Concepts (audio 27.65s + buffer)
  6: 1020,   // 34s - Applications (audio 31.63s + buffer)
  7: 1050,   // 35s - Prompt Engineering (audio 32.45s + buffer)
  8: 810,    // 27s - Future (audio 24.68s + buffer)
  9: 570,    // 19s - Outro (audio 16.80s + buffer)
} as const;

export const TOTAL_FRAMES = Object.values(SCENE_FRAMES).reduce(
  (sum, f) => sum + f,
  0
);
