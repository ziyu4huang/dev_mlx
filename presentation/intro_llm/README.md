# 大語言模型入門 — Remotion 影片簡報

Introduction to Large Language Models，一段 4 分 22 秒的繁體中文語音簡報影片。

## 快速開始

```bash
# 安裝依賴
bun install

# 預覽（Remotion Studio）
bun run dev

# 輸出影片
bun run build
```

輸出至 `out/video.mp4`。

## 重新生成語音

音檔（`public/audio/*.flac`）由 `story-to-voice` TTS 引擎從 `public/audio/*.story.json` 生成，不入 Git。

```bash
bash generate_audio.sh
```

前置條件：`mlx_tts` 專案已設置 `.venv` 與 Kokoro 模型。

若要編輯旁白內容，修改對應的 `public/audio/intro_llm_0N.story.json` 後重新執行 `generate_audio.sh`。

## 場景結構

| # | 場景 | 時長 | 元件 |
|---|------|------|------|
| 1 | 開場 | 18s | 標題卡 |
| 2 | 什麼是大語言模型 | 33s | FeatureCards + 字幕 |
| 3 | Transformer 架構 | 33s | FlowDiagram + 字幕 |
| 4 | 訓練過程 | 33s | FlowDiagram + 字幕 |
| 5 | 關鍵概念 | 30s | FeatureCards + 字幕 |
| 6 | 實際應用 | 34s | FeatureCards + 字幕 |
| 7 | 提示工程 | 35s | CodeBlock + 字幕 |
| 8 | 未來展望 | 27s | FeatureCards + 字幕 |
| 9 | 結尾 | 19s | 概念標籤淡出 |

總長 262 秒（7860 frames @ 30fps），1920×1080。
