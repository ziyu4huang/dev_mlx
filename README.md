# dev_mlx

Apple MLX framework 實驗專案集合。

## 子專案

| 專案 | 說明 |
|------|------|
| [mlx_tts/](mlx_tts/) | 文字故事轉多角色有聲書 — Kokoro-82M 語音合成，支援多角色配音、情緒語氣、書籍管理 |
| [mnist-mlx/](mnist-mlx/) | MNIST 基準測試 — MLX 訓練與推論效能評估，產生 HTML 報告 |
| [scripts/](scripts/) | 工具腳本 — AI 模型包裝器、下載工具等 |
| [archive/](archive/) | 封存 — FLUX 圖像生成 WebUI 等舊專案 |

## 簡報影片 (Remotion)

`presentation/` 目錄包含 Remotion 影片簡報專案（需要 Bun）。

```bash
# git clone 後安裝所有簡報的依賴
cd presentation && bash setup.sh
```

| 簡報 | 說明 |
|------|------|
| [intro_llm/](presentation/intro_llm/) | 大語言模型入門 — LLM 基礎概念、Transformer、訓練過程、應用介紹 |
| [mlx_tts/](presentation/mlx_tts/) | MLX TTS 功能展示 — 語音系統、Story JSON、WebUI 功能介紹 |
| [mlx_tts_demo/](presentation/mlx_tts_demo/) | MLX TTS 有聲書展示 — 音書章節即時播放 Demo |
