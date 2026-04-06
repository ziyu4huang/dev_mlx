# CLAUDE.md - Project Knowledge Index

Knowledge base is organized in `.agent/memory/` by category. Read relevant files before working.

## Quick Reference

- **Project:** Stock AI — Cargo workspace Rust binary + Python stock data & quant analysis CLI
- **Rust stack:** Axum + reqwest + serde + chrono + rusqlite (backend), Bun + ECharts (frontend)
- **Python stack:** yfinance + hmmlearn + pandas + numpy (stock data, analysis, reporting)
- **Workspace:** `crates/stock-core` + `crates/stock-server` + `crates/quant_trade_signal_tui` + `crates/quant_trade_signal_webui` + `crates/shioaji-mock` + `crates/quant_trade_cli`
- **Build:** `cargo build` / `cargo run` (build.rs handles bun install + bundle automatically)
- **Bun path (macOS):** `~/.bun/bin/bun` — auto-detected in build.rs via `$HOME`
- **Bun path (Windows):** `C:/Users/ziyu4/.bun/bin/bun.exe`
- **Ports:** stock-server :3003, whale radar TUI :3004, whale radar WebUI :3005
- **Env:** `AV_API_KEY` required (Alpha Vantage API key, in zshrc)
- **Python:** Use `python3` (macOS has no `python` alias, system Python 3.9)
- **APIs:** TWSE OpenAPI (Taiwan stocks, .TW/.TWO), Alpha Vantage (US/global), Yahoo Finance (fallback)
- **JS runtime:** Always use Bun (not npm). `bun install`, `bun run`
- **API routes (Rust — stock-server :3003):**
  - `GET /` — serve embedded webui.html
  - `GET /api/history/{symbol}?days=N` — OHLCV bars (cached)
  - `GET /api/quote/{symbol}` — latest quote
  - `GET /api/indicators/{symbol}` — RSI(14), MACD, Bollinger Bands
  - `GET /api/kline/{symbol}?period=&from=&to=` — filtered kline
  - `GET /api/backtest/{symbol}` — spawns quant_analysis_cli analyze
  - `GET /api/report/{symbol}` — spawns quant_analysis_cli report (HTML)
  - `GET|POST|DELETE /api/watchlist` — watchlist CRUD
  - `GET|POST|DELETE /api/strategies` — strategy CRUD
  - `GET /api/signals/{symbol}` — latest signals from SQLite
  - `POST /api/scan` — parallel scan all watchlist stocks
- **Whale Radar WebUI routes (:3005):**
  - `GET /` — serve embedded webui.html
  - `GET /api/state` — JSON state snapshot
  - `POST /api/command` — execute command (switch_tab, toggle_*, clear_alerts, quit)
  - `WS /ws` — WebSocket real-time push (100ms)
- **CLI commands (stock_api_cli):**
  - Python: `PYTHONPATH=stock_api_cli/python python3 -m stock_api_cli fetch SYMBOL [--source yfinance|av] [--period 1y]`
  - Python: `PYTHONPATH=stock_api_cli/python python3 -m stock_api_cli quote SYMBOL [--source yfinance|av]`
  - Bun: `bun run stock_api_cli/bun/src/cli.ts fetch SYMBOL [--source yfinance|av] [--period 1y]`
  - Bun: `bun run stock_api_cli/bun/src/cli.ts quote SYMBOL [--source yfinance|av]`
- **stock_api_cli structure:** `stock_api_cli/{python/stock_api_cli, bun/src, rust/}`
- **CLI commands (quant_analysis_cli):**
  - Python: `PYTHONPATH=quant_analysis_cli/python python3 -m quant_analysis_cli analyze SYMBOL [--input data.json] [--save]`
  - Python: `PYTHONPATH=quant_analysis_cli/python python3 -m quant_analysis_cli train SYMBOL [--save model.pkl]`
  - Python: `PYTHONPATH=quant_analysis_cli/python python3 -m quant_analysis_cli backtest SYMBOL [--model model.pkl | --model-id ID]`
  - Python: `PYTHONPATH=quant_analysis_cli/python python3 -m quant_analysis_cli report SYMBOL [-o report.html]`
  - Python: `PYTHONPATH=quant_analysis_cli/python python3 -m quant_analysis_cli signals SYMBOL [--save]`
- **quant_analysis_cli structure:** `quant_analysis_cli/{python/quant_analysis_cli, bun/src, rust/}`
- **Data pipeline:** `stock_api_cli fetch --store` → SQLite → `quant_analysis_cli analyze` (or `--input data.json` for file-based)
- **SQLite:** `~/.stock_ai/data.db` — tables: kline_daily, watchlist, strategies, signal_log, hmm_models, analysis_results

## Knowledge Files

### develop/ - Project & Development
- [project-architecture](.agent/memory/develop/project-architecture.md) - Workspace structure, build pipeline, API routes, data sources

### rust/ - Rust Language & Patterns
_(empty - add notes here as patterns emerge)_

### skill--tooling/ - Tools & Build Pipeline
- [bun-build-pipeline](.agent/memory/skill--tooling/bun-build-pipeline.md) - Bun setup, build.rs integration, `--format iife` requirement, Bun vs npm
- [slidev-presentations](.agent/memory/skill--tooling/slidev-presentations.md) - Slidev setup with Bun, slide QA with Playwright, formatting tips

### skill--frontend/ - Frontend Skills
- [echarts-setup](.agent/memory/skill--frontend/echarts-setup.md) - ECharts candlestick + volume, dark theme, data flow

### quant/ - Quantitative Analysis
- [stock-api-cli-architecture](.agent/memory/develop/stock-api-cli-architecture.md) - stock_api_cli package structure, providers, analysis, CLI commands

### Phase 1 — Finish
- [phase1-finish](docs/phase1-finish.md) - What was actually built: crates, architecture, detection pipeline, run commands

### Archive — Legacy Plans & Design Docs
- [plan-phase1-planning/](docs/archive/plan-phase1-planning/) - Original Phase 1 planning docs (superseded by phase1-finish.md)
- [ai-day-trading-tw-kb/](docs/archive/ai-day-trading-tw-kb/) - Taiwan day trading knowledge base (10 docs)

### presentations/
- [phase1-goal-set](docs/presentation/phase1-goal-set/slides.md) - Slidev deck: architecture, goals, roadmap (14 slides)

## Convention

- Each note: self-contained, category in folder name
- New categories: `.agent/memory/<category>/<kebab-case-name>.md`
- Update this index when adding new files
