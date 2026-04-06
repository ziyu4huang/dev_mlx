# Project Architecture — stock_ai

## Overview

Cargo workspace + multi-language stock data connector + Bun frontend.
Single `cargo build` produces one binary that embeds the web UI.

## Workspace Structure

```
stock_ai/                          ← Cargo workspace root
├── Cargo.toml                     ← workspace config
├── crates/
│   ├── stock-core/                ← types, indicators, SQLite
│   └── stock-server/              ← Axum binary + build.rs + embedded webui/
│       └── webui/                 ← Bun + ECharts frontend (moved inside crate)
│           ├── package.json
│           └── src/app.tsx
├── stock_api_cli/                 ← Multi-language stock data connector
│   ├── python/                    ← Python implementation
│   │   ├── stock_api_cli/         ← installable package
│   │   │   ├── providers/         ← yahoo.py, alpha_vantage.py
│   │   │   └── __main__.py        ← CLI: fetch, quote
│   │   └── tests/
│   ├── bun/                       ← Bun/TypeScript implementation
│   │   ├── src/providers/         ← yahoo.ts, alpha_vantage.ts
│   │   ├── src/cli.ts             ← CLI: fetch, quote
│   │   └── tests/
│   └── rust/                      ← placeholder (future)
├── quant_analysis/                ← HMM analysis (preserved from old quant_cli)
│   ├── analysis/                  ← hmm, features, backtest, indicators
│   ├── report/                    ← html_report.py
│   └── cli/                       ← analyze, train, backtest, report commands
├── output/                        ← generated reports & analysis JSON
└── docs/                          ← planning docs & design docs
```

## Build Pipeline

1. `build.rs` (in stock-server crate) runs before compile
2. `bun install` in `crates/stock-server/webui/`
3. `bun build webui/src/app.tsx --format iife --target browser --minify` → `$OUT_DIR/bundle.js`
4. Inline into HTML template → `$OUT_DIR/webui.html`
5. `include_str!` embeds at compile time

## Data Sources (priority order)

| Ticker pattern | Primary source | Fallback |
|---|---|---|
| `*.TW`, `*.TWO` | TWSE OpenAPI (no key needed) | Yahoo Finance chart API |
| Everything else | Alpha Vantage (`AV_API_KEY`) | Yahoo Finance chart API |

## Runtime

- Binds to `0.0.0.0:3003`
- Graceful shutdown on Ctrl+C
- Shared state: `Arc<AppState>` — av_key, reqwest client, SQLite connection
- CORS: permissive
- SQLite: `~/.stock_ai/data.db`

## Key Env Vars

- `AV_API_KEY` — Alpha Vantage API key (required, in zshrc)
- `DATA_DIR` — defaults to `$HOME/.stock_ai`
