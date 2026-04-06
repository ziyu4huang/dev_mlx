#!/opt/homebrew/bin/python3.11
"""
Stable HF model downloader for mflux models.
Uses snapshot_download with resume support — safe to kill and re-run.

Usage:
    /opt/homebrew/bin/python3.11 scripts/download_flux_model.py
    /opt/homebrew/bin/python3.11 scripts/download_flux_model.py flux-schnell
    /opt/homebrew/bin/python3.11 scripts/download_flux_model.py flux-dev
"""

import os
import sys
import time

# ── env tuning ────────────────────────────────────────────────────────────────
os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "60")   # seconds per chunk
os.environ.setdefault("HF_XET_HIGH_PERFORMANCE", "1")     # maximize bandwidth

from huggingface_hub import snapshot_download

# ── model map ─────────────────────────────────────────────────────────────────
MODELS = {
    "klein-4b":     "AITRADER/FLUX2-klein-4B-mlx-4bit",      # ~4.3GB — smallest, best for 8GB M1
    "flux-lite":    "mlx-community/Flux-1.lite-8B-MLX-Q4",   # ~7.0GB
    "flux-schnell": "mlx-community/FLUX.1-schnell-4bit",     # ~5.5GB
    "flux-dev":     "mlx-community/FLUX.1-dev-4bit",         # ~6.5GB
}

def human_size(path: str) -> str:
    total = sum(
        os.path.getsize(os.path.join(dp, f))
        for dp, _, files in os.walk(path)
        for f in files
    )
    for unit in ("B", "KB", "MB", "GB"):
        if total < 1024:
            return f"{total:.1f} {unit}"
        total /= 1024
    return f"{total:.1f} TB"

def download(repo_id: str) -> None:
    print(f"\n{'='*60}")
    print(f"  Model : {repo_id}")
    print(f"  Cache : ~/.cache/huggingface/hub/")
    print(f"  Resume: automatic (re-run safe)")
    print(f"{'='*60}\n")

    t0 = time.time()
    try:
        local = snapshot_download(
            repo_id=repo_id,
            max_workers=4,          # conservative — stable on slow connections
            local_files_only=False,
        )
    except KeyboardInterrupt:
        print("\n\nInterrupted — progress saved. Re-run to resume.")
        sys.exit(0)

    elapsed = time.time() - t0
    size = human_size(local)
    print(f"\nDone in {elapsed/60:.1f} min  ({size})")
    print(f"Path: {local}\n")

def main():
    alias = sys.argv[1] if len(sys.argv) > 1 else "klein-4b"
    if alias not in MODELS:
        print(f"Unknown model '{alias}'. Choose from: {', '.join(MODELS)}")
        sys.exit(1)
    download(MODELS[alias])

if __name__ == "__main__":
    main()
