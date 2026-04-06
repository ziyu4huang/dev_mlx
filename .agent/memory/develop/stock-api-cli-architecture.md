# stock_api_cli — Architecture

> Multi-language, multi-provider stock data fetch connector.
> Pure data fetching only — no indicators, no HMM, no analysis (those moved to `quant_analysis/`).

---

## Package Structure

```
stock_api_cli/
├── python/
│   ├── stock_api_cli/          # installable Python package
│   │   ├── __init__.py
│   │   ├── __main__.py         # CLI: fetch, quote
│   │   ├── types.py            # OHLCVBar, Quote dataclasses
│   │   └── providers/
│   │       ├── __init__.py     # registry: get_provider()
│   │       ├── base.py         # DataProvider ABC
│   │       ├── yahoo.py        # Yahoo Finance (yfinance)
│   │       └── alpha_vantage.py
│   └── tests/
│       ├── test_types.py
│       └── test_providers.py
│
├── bun/
│   ├── package.json
│   ├── src/
│   │   ├── types.ts            # OHLCVBar, Quote interfaces
│   │   ├── cli.ts              # CLI entry
│   │   └── providers/
│   │       ├── index.ts        # registry: getProvider()
│   │       ├── base.ts         # DataProvider interface
│   │       ├── yahoo.ts        # Yahoo Finance (HTTP API)
│   │       └── alpha_vantage.ts
│   └── tests/
│       └── providers.test.ts
│
└── rust/                       # placeholder (future)
    └── README.md
```

## CLI Interface

```bash
# Python
PYTHONPATH=stock_api_cli/python python3 -m stock_api_cli fetch SYMBOL [--source yfinance|av] [--period 1y]
PYTHONPATH=stock_api_cli/python python3 -m stock_api_cli quote SYMBOL [--source yfinance|av]

# Bun
bun run stock_api_cli/bun/src/cli.ts fetch SYMBOL [--source yfinance|av] [--period 1y]
bun run stock_api_cli/bun/src/cli.ts quote SYMBOL [--source yfinance|av]
```

## Running Tests

```bash
# Python (from project root)
cd stock_api_cli/python && python3 -m pytest tests/ -v

# Bun
cd stock_api_cli/bun && bun test
```
