# Bun Build Pipeline — stock_ai

## Setup

- Bun is the JS/TS bundler for the web UI
- **macOS path:** `~/.bun/bin/bun` (detected via `$HOME` env var)
- **Windows path:** `C:/Users/ziyu4/.bun/bin/bun.exe` (hardcoded in build.rs)

## build.rs Flow (in stock-server crate)

```rust
// 1. Install deps
bun install           // in webui/

// 2. Bundle TSX → single IIFE JS
bun build webui/src/app.tsx \
  --outfile $OUT_DIR/bundle.js \
  --target browser \
  --format iife \
  --minify

// 3. Inline into HTML template
// bundle.js is read, </script> escaped, injected into HTML string
// Written to $OUT_DIR/webui.html
```

## Key Requirements

- **`--format iife`** is mandatory — not ESM, not CJS. The bundle is inlined into a `<script>` tag.
- **`</script>` escaping** — `bundle.js` content has `</script>` replaced with `<\/script>` to avoid premature tag close.
- **Cargo rerun triggers** — only `webui/src/app.tsx` and `webui/package.json` are watched. Add more `rerun-if-changed` lines if new files are added.

## Adding NPM Dependencies

1. Edit `webui/package.json` to add the dep
2. Run `bun install` in `webui/` (or let build.rs do it)
3. Import in `webui/src/app.tsx`
4. `cargo build` will re-bundle automatically

## Bun vs npm

- User prefers Bun everywhere — faster install and runtime
- For Slidev presentations: Bun handles install/scripts, Slidev runs on Node internally
- Always use `bun install` / `bun run`, never `npm install` / `npm run`
