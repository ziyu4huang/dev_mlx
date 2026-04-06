#!/usr/bin/env python3
"""
MNIST MLX benchmark — runs training + forward-pass sweep and writes an HTML report.
"""

import base64, gzip, io, struct, time, urllib.request, platform, subprocess
from pathlib import Path
from datetime import datetime

import mlx.core as mx
import mlx.nn as nn
import mlx.optimizers as optim
import numpy as np
from PIL import Image

# ── data ─────────────────────────────────────────────────────────────────────

CACHE = Path.home() / ".cache/mnist"
BASE  = "https://storage.googleapis.com/cvdf-datasets/mnist"
FILES = {
    "train-images": "train-images-idx3-ubyte.gz",
    "train-labels": "train-labels-idx1-ubyte.gz",
    "test-images":  "t10k-images-idx3-ubyte.gz",
    "test-labels":  "t10k-labels-idx1-ubyte.gz",
}

def _download(name):
    path = CACHE / FILES[name]
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"  Downloading {FILES[name]} …")
        urllib.request.urlretrieve(f"{BASE}/{FILES[name]}", path)
    with gzip.open(path) as f:
        return f.read()

def load_images(name):
    raw = _download(name)
    n, r, c = struct.unpack_from(">iii", raw, 4)
    px = np.frombuffer(raw, dtype=np.uint8, offset=16).reshape(n, r * c)
    return mx.array(px.astype(np.float32) / 255.0)

def load_labels(name):
    raw = _download(name)
    (n,) = struct.unpack_from(">i", raw, 4)
    return mx.array(np.frombuffer(raw, dtype=np.uint8, offset=8).astype(np.int32))

# ── model ─────────────────────────────────────────────────────────────────────

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.l1 = nn.Linear(784, 256)
        self.l2 = nn.Linear(256, 128)
        self.l3 = nn.Linear(128, 10)

    def __call__(self, x):
        return self.l3(nn.relu(self.l2(nn.relu(self.l1(x)))))

def loss_fn(model, x, y):
    return mx.mean(nn.losses.cross_entropy(model(x), y))

def accuracy_val(model, images, labels):
    return mx.mean(mx.argmax(model(images), axis=1) == labels).item()

# ── training ──────────────────────────────────────────────────────────────────

def train_epoch(model, optimizer, images, labels, batch_size):
    n    = images.shape[0]
    perm = np.random.permutation(n)
    loss_and_grad = nn.value_and_grad(model, loss_fn)
    total, count  = 0.0, 0
    t0 = time.perf_counter()
    for i in range(0, n - batch_size + 1, batch_size):
        idx = mx.array(perm[i : i + batch_size])
        loss, grads = loss_and_grad(model, images[idx], labels[idx])
        optimizer.update(model, grads)
        mx.eval(model.parameters(), loss)
        total += loss.item(); count += 1
    elapsed = time.perf_counter() - t0
    return total / count, (count * batch_size) / elapsed

# ── batch configs ─────────────────────────────────────────────────────────────

CONFIGS = [
    {"lr": 1e-3, "batch": 64,  "epochs": 10, "label": "LR=1e-3, B=64"},
    {"lr": 1e-3, "batch": 256, "epochs": 10, "label": "LR=1e-3, B=256"},
    {"lr": 1e-3, "batch": 512, "epochs": 10, "label": "LR=1e-3, B=512"},
    {"lr": 5e-4, "batch": 256, "epochs": 10, "label": "LR=5e-4, B=256"},
    {"lr": 3e-3, "batch": 256, "epochs": 10, "label": "LR=3e-3, B=256"},
]

# ── forward-pass benchmark ────────────────────────────────────────────────────

def fwd_benchmark(model, test_images, runs=100):
    for _ in range(3): mx.eval(model(test_images))   # warmup
    t0 = time.perf_counter()
    for _ in range(runs): mx.eval(model(test_images))
    elapsed = time.perf_counter() - t0
    return elapsed / runs * 1000, runs * test_images.shape[0] / elapsed

# ── system info ───────────────────────────────────────────────────────────────

def sys_info():
    chip = subprocess.run(
        ["sysctl", "-n", "machdep.cpu.brand_string"],
        capture_output=True, text=True).stdout.strip() or platform.processor()
    mem_gb = int(subprocess.run(
        ["sysctl", "-n", "hw.memsize"],
        capture_output=True, text=True).stdout.strip()) // (1024**3)
    return chip, mem_gb

# ── HTML ──────────────────────────────────────────────────────────────────────

HTML_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MNIST MLX Benchmark Report</title>
<style>
  :root {{
    --bg:#0f1117; --card:#1a1d27; --border:#2a2d3a;
    --accent:#5e81f4; --green:#4ade80; --yellow:#facc15;
    --text:#e2e8f0; --muted:#64748b;
  }}
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ background:var(--bg); color:var(--text); font-family:'SF Pro Display',system-ui,sans-serif;
          font-size:14px; line-height:1.6; padding:32px; }}
  h1   {{ font-size:24px; font-weight:700; margin-bottom:4px; }}
  .sub {{ color:var(--muted); font-size:13px; margin-bottom:32px; }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:32px; }}
  .kpi  {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; }}
  .kpi .label {{ color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.05em; }}
  .kpi .value {{ font-size:26px; font-weight:700; margin-top:4px; }}
  .kpi .value.green  {{ color:var(--green); }}
  .kpi .value.accent {{ color:var(--accent); }}
  .kpi .value.yellow {{ color:var(--yellow); }}
  section {{ margin-bottom:40px; }}
  h2 {{ font-size:16px; font-weight:600; margin-bottom:12px; border-left:3px solid var(--accent);
         padding-left:10px; }}
  table {{ width:100%; border-collapse:collapse; background:var(--card);
            border:1px solid var(--border); border-radius:10px; overflow:hidden; }}
  th,td {{ padding:10px 14px; text-align:right; border-bottom:1px solid var(--border); }}
  th    {{ text-align:right; color:var(--muted); font-weight:500; font-size:12px;
            text-transform:uppercase; letter-spacing:.04em; background:#13161f; }}
  th:first-child, td:first-child {{ text-align:left; }}
  tr:last-child td {{ border-bottom:none; }}
  tr:hover td {{ background:#20243a; }}
  .badge {{ display:inline-block; padding:2px 8px; border-radius:20px; font-size:11px;
             font-weight:600; }}
  .badge.best   {{ background:#14532d; color:var(--green); }}
  .badge.good   {{ background:#1e3a5f; color:#93c5fd; }}
  .bar-wrap {{ background:#1e2130; border-radius:4px; height:8px; margin-top:4px; }}
  .bar      {{ height:8px; border-radius:4px; background:var(--accent); }}
  .img-grid {{ display:flex; flex-wrap:wrap; gap:10px; }}
  .img-card {{ background:var(--card); border:1px solid var(--border); border-radius:8px;
                padding:8px; display:flex; align-items:center; gap:10px; width:200px; }}
  .img-info {{ flex:1; font-size:12px; }}
  .chart-row {{ display:flex; gap:16px; }}
  .chart-box {{ flex:1; background:var(--card); border:1px solid var(--border);
                 border-radius:12px; padding:16px; }}
  canvas {{ width:100% !important; max-height:280px; }}
  footer {{ color:var(--muted); font-size:12px; margin-top:48px; text-align:center; }}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
</head>
<body>
<h1>MNIST · MLX Benchmark Report</h1>
<p class="sub">Generated {ts} &nbsp;|&nbsp; {chip} · {mem_gb} GB unified memory &nbsp;|&nbsp;
   MLX {mlx_ver} · Python {py_ver} · Device: {device}</p>

<div class="grid">
  <div class="kpi"><div class="label">Best Test Accuracy</div>
    <div class="value green">{best_acc:.2f}%</div></div>
  <div class="kpi"><div class="label">Peak Train Throughput</div>
    <div class="value accent">{peak_tp:,.0f} smp/s</div></div>
  <div class="kpi"><div class="label">Fwd-Pass Latency</div>
    <div class="value yellow">{fwd_lat:.2f} ms</div></div>
  <div class="kpi"><div class="label">Fwd-Pass Throughput</div>
    <div class="value accent">{fwd_tp:,.0f} smp/s</div></div>
  <div class="kpi"><div class="label">Total Benchmark Time</div>
    <div class="value">{total_sec:.1f} s</div></div>
  <div class="kpi"><div class="label">Configs Evaluated</div>
    <div class="value">{n_configs}</div></div>
</div>

<section>
<h2>Training Curves</h2>
<div class="chart-row">
  <div class="chart-box"><canvas id="lossChart"></canvas></div>
  <div class="chart-box"><canvas id="accChart"></canvas></div>
</div>
</section>

<section>
<h2>Config Results</h2>
<table>
<thead><tr>
  <th>Config</th><th>Batch</th><th>LR</th>
  <th>Final Loss</th><th>Final Acc</th><th>Best Acc</th>
  <th>Avg Throughput</th><th>Train Time</th><th></th>
</tr></thead>
<tbody>
{config_rows}
</tbody>
</table>
</section>

<section>
<h2>Per-Epoch Detail</h2>
{epoch_tables}
</section>

{gallery_html}

<section>
<h2>Forward-Pass Benchmark (best model · 10k test set · 100 runs)</h2>
<table>
<thead><tr>
  <th>Metric</th><th>Value</th>
</tr></thead>
<tbody>
  <tr><td>Avg latency per forward pass</td><td>{fwd_lat:.3f} ms</td></tr>
  <tr><td>Throughput</td><td>{fwd_tp:,.0f} samples/sec</td></tr>
  <tr><td>Test samples</td><td>10,000</td></tr>
  <tr><td>Runs</td><td>100</td></tr>
</tbody>
</table>
</section>

<footer>Apple MLX MNIST Benchmark · {ts}</footer>

<script>
const COLORS = ['#5e81f4','#4ade80','#facc15','#f87171','#a78bfa'];
const epochs = {epochs_js};

{chart_data_js}

new Chart(document.getElementById('lossChart'), {{
  type:'line',
  data: {{
    labels: epochs,
    datasets: lossDatasets
  }},
  options:{{
    responsive:true, maintainAspectRatio:true,
    plugins:{{ legend:{{ labels:{{ color:'#e2e8f0', boxWidth:12 }} }},
               title:{{ display:true, text:'Training Loss', color:'#e2e8f0' }} }},
    scales:{{
      x:{{ ticks:{{ color:'#64748b' }}, grid:{{ color:'#2a2d3a' }} }},
      y:{{ ticks:{{ color:'#64748b' }}, grid:{{ color:'#2a2d3a' }} }}
    }}
  }}
}});

new Chart(document.getElementById('accChart'), {{
  type:'line',
  data: {{
    labels: epochs,
    datasets: accDatasets
  }},
  options:{{
    responsive:true, maintainAspectRatio:true,
    plugins:{{ legend:{{ labels:{{ color:'#e2e8f0', boxWidth:12 }} }},
               title:{{ display:true, text:'Test Accuracy (%)', color:'#e2e8f0' }} }},
    scales:{{
      x:{{ ticks:{{ color:'#64748b' }}, grid:{{ color:'#2a2d3a' }} }},
      y:{{ min:90, ticks:{{ color:'#64748b' }}, grid:{{ color:'#2a2d3a' }} }}
    }}
  }}
}});
</script>
</body>
</html>"""

# ── image gallery ────────────────────────────────────────────────────────────

def pixel_to_b64png(flat_pixels: np.ndarray, size: int = 56) -> str:
    """Convert a 28×28 float32 array to an upscaled base-64 PNG (white digits on black)."""
    arr = (flat_pixels.reshape(28, 28) * 255).astype(np.uint8)
    img = Image.fromarray(arr, mode="L").resize((size, size), Image.NEAREST)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def build_gallery(model, test_images_np: np.ndarray, test_labels_np: np.ndarray,
                  n_correct: int = 30, n_wrong: int = 30) -> str:
    """
    Run inference on the full test set, pick representative correct & wrong samples,
    return an HTML string with two grids of annotated digit images.
    """
    test_mx  = mx.array(test_images_np)
    logits   = model(test_mx)
    mx.eval(logits)
    probs_np = np.array(softmax_np(np.array(logits)))   # [10000, 10]
    preds_np = probs_np.argmax(axis=1)                  # [10000]

    correct_idx = np.where(preds_np == test_labels_np)[0]
    wrong_idx   = np.where(preds_np != test_labels_np)[0]

    # pick varied digits for correct (3 per class)
    rng = np.random.default_rng(0)
    chosen_correct = []
    for digit in range(10):
        pool = correct_idx[test_labels_np[correct_idx] == digit]
        chosen_correct.extend(rng.choice(pool, size=min(3, len(pool)), replace=False).tolist())
    chosen_correct = chosen_correct[:n_correct]

    # wrong samples sorted by highest confidence (most "confident mistakes")
    chosen_wrong = sorted(wrong_idx.tolist(),
                          key=lambda i: -probs_np[i, preds_np[i]])[:n_wrong]

    def card(idx, highlight_color):
        img_b64   = pixel_to_b64png(test_images_np[idx])
        true_lbl  = int(test_labels_np[idx])
        pred_lbl  = int(preds_np[idx])
        conf      = float(probs_np[idx, pred_lbl]) * 100
        bar_width = int(conf)
        is_correct = true_lbl == pred_lbl
        result_tag = (
            f'<span style="color:#4ade80;font-weight:700">✓</span>'
            if is_correct else
            f'<span style="color:#f87171;font-weight:700">✗</span>'
        )
        return f"""
<div class="img-card">
  <img src="data:image/png;base64,{img_b64}" width="56" height="56" style="image-rendering:pixelated;border-radius:4px;">
  <div class="img-info">
    <div>{result_tag} Pred: <b style="color:{highlight_color}">{pred_lbl}</b>
         &nbsp;True: <b>{true_lbl}</b></div>
    <div style="color:#94a3b8;font-size:11px">{conf:.1f}% conf</div>
    <div class="bar-wrap"><div class="bar" style="width:{bar_width}%;background:{highlight_color}"></div></div>
  </div>
</div>"""

    correct_cards = "".join(card(i, "#4ade80") for i in chosen_correct)
    wrong_cards   = "".join(card(i, "#f87171") for i in chosen_wrong)

    accuracy = len(correct_idx) / len(test_labels_np) * 100
    n_wrong_total = len(wrong_idx)

    return f"""
<section>
<h2>Digit Recognition Samples — Correct ({len(correct_idx):,} / 10,000 &nbsp;=&nbsp; {accuracy:.2f}%)</h2>
<p style="color:#64748b;font-size:12px;margin-bottom:12px">
  3 random correct samples per digit class (0–9)</p>
<div class="img-grid">{correct_cards}</div>
</section>

<section>
<h2>Digit Recognition Samples — Wrong ({n_wrong_total} mistakes &nbsp;·&nbsp; sorted by confidence)</h2>
<p style="color:#64748b;font-size:12px;margin-bottom:12px">
  Most confident wrong predictions — model was sure but incorrect</p>
<div class="img-grid">{wrong_cards}</div>
</section>"""


def softmax_np(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== MNIST MLX Batch Benchmark — generating HTML report ===\n")

    print("Loading MNIST …")
    train_images = load_images("train-images");  train_labels = load_labels("train-labels")
    test_images  = load_images("test-images");   test_labels  = load_labels("test-labels")
    mx.eval(train_images, train_labels, test_images, test_labels)
    print(f"  Train: {train_images.shape[0]}  Test: {test_images.shape[0]}\n")

    chip, mem_gb = sys_info()
    run_start = time.perf_counter()
    results = []

    for cfg in CONFIGS:
        print(f"▶  {cfg['label']}")
        mx.random.seed(42)
        np.random.seed(42)
        model = MLP()
        opt   = optim.Adam(learning_rate=cfg["lr"])
        epochs_data = []   # list of (loss, acc, tp)

        for ep in range(1, cfg["epochs"] + 1):
            loss, tp = train_epoch(model, opt, train_images, train_labels, cfg["batch"])
            acc = accuracy_val(model, test_images, test_labels)
            epochs_data.append((loss, acc * 100, tp))
            print(f"   ep{ep:>2}  loss={loss:.4f}  acc={acc*100:.2f}%  {tp:>8,.0f} smp/s")

        results.append({"cfg": cfg, "epochs": epochs_data, "model": model})
        print()

    total_sec = time.perf_counter() - run_start

    # forward-pass benchmark on best config (highest final acc)
    best_idx   = max(range(len(results)), key=lambda i: results[i]["epochs"][-1][1])
    best_model = results[best_idx]["model"]
    fwd_lat, fwd_tp = fwd_benchmark(best_model, test_images)
    print(f"Forward-pass benchmark: {fwd_lat:.3f} ms/pass  |  {fwd_tp:,.0f} smp/s\n")

    # image gallery from best model
    print("Building image gallery …")
    test_images_np = np.array(test_images)
    test_labels_np = np.array(test_labels)
    gallery_html = build_gallery(best_model, test_images_np, test_labels_np)

    # ── build HTML ────────────────────────────────────────────────────────────
    best_acc  = max(max(e[1] for e in r["epochs"]) for r in results)
    peak_tp   = max(max(e[2] for e in r["epochs"]) for r in results)
    n_epochs  = CONFIGS[0]["epochs"]

    # config summary table rows
    def badge(val, best):
        if abs(val - best) < 0.01: return f'<span class="badge best">best</span>'
        if val >= best - 0.5:      return f'<span class="badge good">good</span>'
        return ""

    config_rows = []
    best_final  = max(r["epochs"][-1][1] for r in results)
    for r in results:
        cfg  = r["cfg"]
        eps  = r["epochs"]
        facc = eps[-1][1]
        bacc = max(e[1] for e in eps)
        floss= eps[-1][0]
        avg_tp = np.mean([e[2] for e in eps])
        train_time = sum(cfg["batch"] / e[2] for e in eps) * (train_images.shape[0] // cfg["batch"])
        b = badge(facc, best_final)
        config_rows.append(
            f"<tr><td>{cfg['label']}</td><td>{cfg['batch']}</td><td>{cfg['lr']}</td>"
            f"<td>{floss:.4f}</td><td>{facc:.2f}%</td><td>{bacc:.2f}% {b}</td>"
            f"<td>{avg_tp:,.0f} smp/s</td><td>{train_time:.2f} s</td><td></td></tr>"
        )

    # per-epoch detail tables
    epoch_tables_html = []
    for r in results:
        cfg = r["cfg"]
        rows = "".join(
            f"<tr><td>{i+1}</td><td>{e[0]:.4f}</td><td>{e[1]:.2f}%</td><td>{e[2]:,.0f}</td></tr>"
            for i, e in enumerate(r["epochs"])
        )
        epoch_tables_html.append(f"""
<h3 style="font-size:13px;color:#94a3b8;margin:16px 0 8px">{cfg['label']}</h3>
<table>
<thead><tr><th>Epoch</th><th>Loss</th><th>Test Acc</th><th>Throughput (smp/s)</th></tr></thead>
<tbody>{rows}</tbody>
</table>""")

    # Chart.js data
    labels_js = [str(i) for i in range(1, n_epochs + 1)]
    loss_ds, acc_ds = [], []
    for ri, r in enumerate(results):
        col = f"COLORS[{ri}]"
        losses = [round(e[0], 5) for e in r["epochs"]]
        accs   = [round(e[1], 3) for e in r["epochs"]]
        lbl    = r["cfg"]["label"]
        loss_ds.append(f"{{label:'{lbl}',data:{losses},borderColor:{col},backgroundColor:'transparent',tension:.3,pointRadius:3}}")
        acc_ds.append( f"{{label:'{lbl}',data:{accs},borderColor:{col},backgroundColor:'transparent',tension:.3,pointRadius:3}}")

    chart_data_js = (
        f"const lossDatasets=[{','.join(loss_ds)}];\n"
        f"const accDatasets=[{','.join(acc_ds)}];"
    )

    html = HTML_TMPL.format(
        ts          = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        chip        = chip,
        mem_gb      = mem_gb,
        mlx_ver     = mx.__version__,
        py_ver      = platform.python_version(),
        device      = str(mx.default_device()),
        best_acc    = best_acc,
        peak_tp     = peak_tp,
        fwd_lat     = fwd_lat,
        fwd_tp      = fwd_tp,
        total_sec   = total_sec,
        n_configs   = len(CONFIGS),
        config_rows = "\n".join(config_rows),
        epoch_tables= "\n".join(epoch_tables_html),
        epochs_js   = labels_js,
        chart_data_js = chart_data_js,
        gallery_html  = gallery_html,
    )

    out = Path(__file__).parent / "mnist_report.html"
    out.write_text(html)
    print(f"Report written → {out}")
    subprocess.run(["open", str(out)])


if __name__ == "__main__":
    main()
