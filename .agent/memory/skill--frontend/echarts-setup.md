# ECharts Frontend — stock_ai

## Library

- Package: `echarts` 5.x (replaced lightweight-charts)
- Used in `webui/src/app.tsx`
- Bun bundles TSX → IIFE → embedded in Rust binary

## UI Layout

- Fixed toolbar at top (48px) — brand, search input, Go button, period buttons (1M/3M/6M/1Y)
- Main area: chart (flex:1) + stats sidebar (280px, right side)
- Stock tabs below toolbar for multi-symbol switching
- Dark theme: background `#0d0e11`, panels `#13151a`, accent `#5b8def`

## Chart Features

- Candlestick + volume subplot + dataZoom slider
- Red for up (Chinese convention), green for down
- HMM Backtest button → calls `/api/backtest/:symbol`
- HTML Report button → opens `/api/report/:symbol` in new tab
- Sidebar: price, change, volume, high/low, RSI(14), MACD

## Data Flow

```
User enters ticker → loadStock()
  → fetch /api/history/{symbol}?days=N
  → fetch /api/quote/{symbol}
  → fetch /api/indicators/{symbol}
  → ECharts candlestick + volume update
  → sidebar stats update
```

## Auto-load

- Default stock: 2330.TW on startup
