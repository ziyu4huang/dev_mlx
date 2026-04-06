# Slidev Presentations — stock_ai

## Setup

- Presentations stored in `docs/presentation/<topic>/`
- Framework: Slidev with seriph theme
- Use Bun (not npm): `bun install`, `bun run dev`

## Files

```
docs/presentation/<topic>/
├── slides.md       ← Slidev markdown content
└── package.json    ← @slidev/cli + @slidev/theme-seriph
```

## Key Config in package.json

Add `"trustedDependencies"` for Slidev packages to avoid Bun prompts:
```json
"trustedDependencies": ["@slidev/cli", "@slidev/theme-seriph"]
```

## Slidev Formatting Tips

- Use `<div grid="~ cols-2 gap-8">` for two-column layouts
- Mermaid diagrams work but keep them small — tall diagrams overflow 720px slide height
- Use `<v-clicks>` for click animations
- Use `layout: center` for centered text slides
- Use `layout: image-right` with `image:` for side images

## QA with Playwright

- Resize browser to 1280x720 (standard slide aspect ratio)
- Navigate to `http://localhost:3030/<slide-number>` for individual slides
- Check for overflow: compare scrollHeight vs clientHeight on slide elements
- Visually verify dense slides (tables, diagrams, code blocks)

## Known Issues

- Slidev runs on Node internally, Bun just handles install/run scripts
- First `bun install` is slow (~25s) due to many Slidev dependencies
- Chrome singleton lock at `~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock` may need manual cleanup
