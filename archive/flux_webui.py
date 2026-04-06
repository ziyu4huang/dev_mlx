#!/usr/bin/env python3
"""
flux_webui.py — Minimal FLUX image generation web UI for M1/8GB Mac.
Requires Python 3.11+  (mflux 0.17.x uses union-type syntax)

Usage:
    /opt/homebrew/bin/python3.11 flux_webui.py
    # → Open http://127.0.0.1:7860
"""

import base64
import io
import os
import queue
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from flask import Flask, Response, jsonify, request

# ── model cache ───────────────────────────────────────────────────────────────
_model = None
_model_key: Optional[tuple] = None     # (model_name, quantize) tuple
_model_lock = threading.Lock()
_model_loading = False

# ── job store ─────────────────────────────────────────────────────────────────
@dataclass
class Job:
    job_id: str
    status: str          # queued | running | done | error
    prompt: str
    model_name: str
    quantize: int | None
    steps: int
    width: int
    height: int
    guidance: float
    seed: int
    created_at: float = field(default_factory=time.time)
    started_at: float | None = None
    finished_at: float | None = None
    error: str | None = None
    image_b64: str | None = None

_jobs: dict[str, Job] = {}
_jobs_lock = threading.Lock()
_work_queue: queue.Queue = queue.Queue(maxsize=1)

# ── model loader ──────────────────────────────────────────────────────────────
KLEIN_4B = "AITRADER/FLUX2-klein-4B-mlx-4bit"
LITE_MODEL = "mlx-community/Flux-1.lite-8B-MLX-Q4"

def _load_model(model_name: str, quantize: int | None):
    """Load (or reuse cached) Flux1 model. Call inside _model_lock."""
    global _model, _model_key
    from mflux.models.common.config.model_config import ModelConfig
    from mflux.models.flux.variants.txt2img.flux import Flux1

    if model_name == LITE_MODEL:
        cfg = ModelConfig.from_name(LITE_MODEL, base_model="dev")
        return Flux1(model_config=cfg, quantize=4)   # pre-quantized Q4 — still pass 4 so mflux loads weights correctly
    elif model_name == KLEIN_4B:
        cfg = ModelConfig.from_name(KLEIN_4B, base_model="flux2-klein-4b")
        return Flux1(model_config=cfg, quantize=4)
    else:
        cfg = ModelConfig.from_name(model_name)
        return Flux1(model_config=cfg, quantize=quantize)

# ── worker thread ─────────────────────────────────────────────────────────────
def _worker():
    global _model, _model_key, _model_loading
    while True:
        job: Job = _work_queue.get()
        with _jobs_lock:
            job.status = "running"
            job.started_at = time.time()
        try:
            key = (job.model_name, job.quantize)
            with _model_lock:
                if _model is None or _model_key != key:
                    _model_loading = True
                    _model = _load_model(job.model_name, job.quantize)
                    _model_key = key
                    _model_loading = False

            result = _model.generate_image(
                seed=job.seed,
                prompt=job.prompt,
                num_inference_steps=job.steps,
                height=job.height,
                width=job.width,
                guidance=job.guidance,
            )
            buf = io.BytesIO()
            result.image.save(buf, format="PNG")
            with _jobs_lock:
                job.image_b64 = base64.b64encode(buf.getvalue()).decode()
                job.status = "done"
        except Exception as exc:
            _model_loading = False
            with _jobs_lock:
                job.status = "error"
                job.error = str(exc)
        finally:
            with _jobs_lock:
                job.finished_at = time.time()
            _work_queue.task_done()

threading.Thread(target=_worker, daemon=True, name="flux-worker").start()

# ── embedded HTML/CSS/JS ──────────────────────────────────────────────────────
_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FLUX Image Generator</title>
<style>
  :root {
    --bg:#0f1117; --card:#1a1d27; --border:#2a2d3a;
    --accent:#5e81f4; --green:#4ade80; --yellow:#facc15;
    --red:#f87171; --text:#e2e8f0; --muted:#64748b;
    --r:8px; --font:system-ui,-apple-system,sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;padding:16px}
  .app{max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
  header{display:flex;justify-content:space-between;align-items:center;
    padding:12px 16px;background:var(--card);border-radius:var(--r);border:1px solid var(--border)}
  h1{font-size:1.05rem;font-weight:600;letter-spacing:-.3px}
  .badge{font-size:.7rem;padding:3px 9px;border-radius:20px;font-weight:500;
    background:#1e2535;color:var(--muted);border:1px solid var(--border)}
  .badge.ready{color:var(--green);border-color:#166534;background:#052e16}
  .badge.loading{color:var(--yellow);border-color:#854d0e;background:#1c1002}
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);
    padding:16px;display:flex;flex-direction:column;gap:12px}
  label{font-size:.76rem;color:var(--muted);display:block;margin-bottom:3px}
  textarea{width:100%;min-height:76px;resize:vertical;background:#0f1117;color:var(--text);
    border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;
    font-size:.88rem;font-family:var(--font);outline:none;transition:border-color .15s}
  textarea:focus{border-color:var(--accent)}
  .row{display:flex;gap:9px;flex-wrap:wrap}
  select,input[type=number],input[type=text]{background:#0f1117;color:var(--text);
    border:1px solid var(--border);border-radius:var(--r);padding:6px 9px;
    font-size:.84rem;outline:none;transition:border-color .15s}
  select:focus,input:focus{border-color:var(--accent)}
  .field{display:flex;flex-direction:column}
  .field.grow{flex:1;min-width:110px}
  .presets{display:flex;gap:5px;flex-wrap:wrap}
  .pb{background:#1a1d27;color:var(--muted);border:1px solid var(--border);
    border-radius:6px;padding:3px 9px;font-size:.76rem;cursor:pointer;transition:all .15s}
  .pb:hover,.pb.active{background:var(--accent);color:#fff;border-color:var(--accent)}
  #btn-gen{width:100%;padding:10px;background:var(--accent);color:#fff;border:none;
    border-radius:var(--r);font-size:.93rem;font-weight:600;cursor:pointer;
    transition:opacity .15s;letter-spacing:-.2px}
  #btn-gen:disabled{opacity:.42;cursor:not-allowed}
  #btn-gen:not(:disabled):hover{opacity:.88}
  .prog{background:var(--card);border:1px solid var(--border);border-radius:var(--r);
    padding:13px 16px;display:none}
  .prog.on{display:block}
  .track{height:5px;background:#1e2535;border-radius:3px;overflow:hidden;margin-bottom:9px}
  .fill{height:100%;background:var(--accent);border-radius:3px;transition:width .9s linear;width:0%}
  .stxt{font-size:.81rem;color:var(--muted)}
  .stxt.err{color:var(--red)} .stxt.ok{color:var(--green)}
  .result{background:var(--card);border:1px solid var(--border);border-radius:var(--r);
    padding:16px;display:none;text-align:center}
  .result.on{display:block}
  #rimg{max-width:100%;border-radius:6px;display:block;margin:0 auto 12px;border:1px solid var(--border)}
  .acts{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}
  .abtn{background:#1e2535;color:var(--text);border:1px solid var(--border);border-radius:6px;
    padding:5px 13px;font-size:.8rem;cursor:pointer;text-decoration:none;transition:background .15s}
  .abtn:hover{background:#2a2d3a}
  .warn{color:var(--yellow);font-size:.73rem;margin-top:2px}
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>FLUX Image Generator</h1>
    <span class="badge" id="mbadge">unloaded</span>
  </header>

  <div class="card">
    <div class="field">
      <label>Prompt</label>
      <textarea id="prompt" placeholder="A futuristic neon city, cyberpunk style, highly detailed"></textarea>
    </div>
    <div class="row">
      <div class="field grow">
        <label>Model</label>
        <select id="model" onchange="onModel()">
          <option value="mlx-community/Flux-1.lite-8B-MLX-Q4">lite-8B Q4 (MLX) — ~7GB ✅ Best for 8GB</option>
          <option value="AITRADER/FLUX2-klein-4B-mlx-4bit">klein-4B Q4 — ~4.3GB (experimental)</option>
          <option value="flux-schnell">schnell 4-bit — ~5.5GB (4 steps)</option>
          <option value="flux-dev">dev 4-bit — ~6.5GB (quality)</option>
        </select>
        <span class="warn" id="mwarn"></span>
      </div>
      <div class="field">
        <label>Steps</label>
        <input type="number" id="steps" value="20" min="1" max="80" style="width:65px">
      </div>
      <div class="field">
        <label>Guidance</label>
        <input type="number" id="guidance" value="4.0" min="1" max="20" step="0.5" style="width:70px">
      </div>
      <div class="field">
        <label>Seed</label>
        <input type="text" id="seed" placeholder="random" style="width:90px">
      </div>
    </div>
    <div class="field">
      <label>Resolution</label>
      <div class="presets">
        <button class="pb active" onclick="setRes(256,256,this)">256×256</button>
        <button class="pb" onclick="setRes(512,512,this)">512×512</button>
        <button class="pb" onclick="setRes(768,512,this)">768×512</button>
        <button class="pb" onclick="setRes(1024,1024,this)">1024×1024 ⚠</button>
      </div>
      <div class="row" style="margin-top:7px">
        <div class="field"><label>W</label><input type="number" id="w" value="256" min="64" max="2048" step="64" style="width:75px"></div>
        <div class="field"><label>H</label><input type="number" id="h" value="256" min="64" max="2048" step="64" style="width:75px"></div>
      </div>
    </div>
    <button id="btn-gen" onclick="generate()">Generate</button>
  </div>

  <div class="prog" id="prog">
    <div class="track"><div class="fill" id="fill"></div></div>
    <div class="stxt" id="stxt">Waiting...</div>
  </div>

  <div class="result" id="result">
    <img id="rimg" alt="Generated image">
    <div class="acts">
      <a id="dl" class="abtn" download="flux_output.png">Download PNG</a>
      <button class="abtn" id="btn-upscale" onclick="upscale()" style="display:none">Regenerate at 512×512</button>
      <button class="abtn" onclick="document.getElementById('prompt').focus()">Edit Prompt</button>
      <span id="elapsed" class="abtn" style="cursor:default;color:var(--muted)"></span>
    </div>
  </div>
</div>

<script>
const MODELS = [
  {name:'mlx-community/Flux-1.lite-8B-MLX-Q4', q:0, steps:20, guidance:4.0, typical:55, warn:''},
  {name:'AITRADER/FLUX2-klein-4B-mlx-4bit', q:4, steps:20, guidance:4.0, typical:40, warn:'experimental — may fail with text_encoder_2 error'},
  {name:'flux-schnell', q:4, steps:4, guidance:0, typical:25, warn:''},
  {name:'flux-dev',     q:4, steps:20, guidance:4.0, typical:120, warn:'~6.5GB RAM — close other apps first'},
];

function onModel() {
  const m = MODELS[document.getElementById('model').selectedIndex];
  document.getElementById('steps').value = m.steps;
  document.getElementById('guidance').value = m.guidance;
  document.getElementById('mwarn').textContent = m.warn;
}
onModel();

function setRes(w,h,btn) {
  document.getElementById('w').value = w;
  document.getElementById('h').value = h;
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

let _poll = null;

async function generate() {
  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) { alert('Enter a prompt first.'); return; }

  const idx = document.getElementById('model').selectedIndex;
  const m = MODELS[idx];
  const steps    = parseInt(document.getElementById('steps').value)    || m.steps;
  const guidance = parseFloat(document.getElementById('guidance').value) || m.guidance;
  const w = Math.round(parseInt(document.getElementById('w').value)/64)*64 || 512;
  const h = Math.round(parseInt(document.getElementById('h').value)/64)*64 || 512;
  const seedRaw = document.getElementById('seed').value.trim();

  // estimate time
  const pixRatio = (w*h)/(512*512);
  const stepRatio = steps/m.steps;
  const typical = Math.round(m.typical * pixRatio * stepRatio);

  document.getElementById('btn-gen').disabled = true;
  document.getElementById('result').classList.remove('on');
  document.getElementById('prog').classList.add('on');
  document.getElementById('fill').style.width = '0%';
  setStatus('', 'Submitting...');

  let res;
  try {
    res = await fetch('/generate', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({prompt, model:m.name, quantize:m.q,
                            steps, guidance, width:w, height:h,
                            seed: seedRaw ? parseInt(seedRaw) : null}),
    });
  } catch(e) {
    setStatus('err','Network error: '+e.message);
    document.getElementById('btn-gen').disabled=false; return;
  }

  if (res.status===503) {
    setStatus('err','Server busy — wait for current generation to finish.');
    document.getElementById('btn-gen').disabled=false; return;
  }
  if (!res.ok) {
    const d = await res.json().catch(()=>({}));
    setStatus('err','Error: '+(d.error||res.status));
    document.getElementById('btn-gen').disabled=false; return;
  }

  const {job_id} = await res.json();
  const start = Date.now();
  setStatus('','Queued — first run downloads model (~1-3GB)...');

  clearInterval(_poll);
  _poll = setInterval(async () => {
    let d;
    try { d = await (await fetch('/status/'+job_id)).json(); } catch { return; }
    if (d.status==='queued') {
      setStatus('','Queued...');
    } else if (d.status==='running') {
      const secs = ((Date.now()-start)/1000).toFixed(0);
      const pct  = Math.min(93, (secs/typical)*100);
      document.getElementById('fill').style.width = pct+'%';
      setStatus('','Generating... '+secs+'s / ~'+typical+'s estimated');
    } else if (d.status==='done') {
      clearInterval(_poll);
      document.getElementById('fill').style.width = '100%';
      setStatus('ok','Done in '+d.elapsed.toFixed(1)+'s');
      showImage('/image/'+job_id, d.elapsed, w, h);
      document.getElementById('btn-gen').disabled=false;
    } else if (d.status==='error') {
      clearInterval(_poll);
      setStatus('err','Error: '+d.error);
      document.getElementById('btn-gen').disabled=false;
    }
  }, 900);
}

function setStatus(cls, msg) {
  const el = document.getElementById('stxt');
  el.className = 'stxt '+cls;
  el.textContent = msg;
}

function showImage(url, elapsed, curW, curH) {
  const img = document.getElementById('rimg');
  img.src = url+'?t='+Date.now();
  document.getElementById('dl').href = url;
  document.getElementById('elapsed').textContent = elapsed.toFixed(1)+'s';
  document.getElementById('result').classList.add('on');
  // show upscale button if current res < 512
  const btn = document.getElementById('btn-upscale');
  if (curW < 512 || curH < 512) {
    btn.style.display = '';
    btn.textContent = 'Regenerate at 512×512';
    btn.dataset.w = Math.min(512, curW * 2);
    btn.dataset.h = Math.min(512, curH * 2);
  } else {
    btn.style.display = 'none';
  }
}

function upscale() {
  const btn = document.getElementById('btn-upscale');
  const nw = parseInt(btn.dataset.w) || 512;
  const nh = parseInt(btn.dataset.h) || 512;
  document.getElementById('w').value = nw;
  document.getElementById('h').value = nh;
  generate();
}

// model status badge — poll every 3s
async function pollBadge() {
  try {
    const d = await (await fetch('/model_status')).json();
    const b = document.getElementById('mbadge');
    if (d.loading) { b.className='badge loading'; b.textContent='loading…'; }
    else if (d.loaded) { b.className='badge ready'; b.textContent=d.short_name+' ready'; }
    else { b.className='badge'; b.textContent='unloaded'; }
  } catch {}
  setTimeout(pollBadge, 3000);
}
pollBadge();

// On page load: restore last completed result OR resume in-progress job
(async () => {
  try {
    const d = await (await fetch('/latest')).json();
    if (d.status === 'done') {
      document.getElementById('prog').classList.add('on');
      document.getElementById('fill').style.width = '100%';
      setStatus('ok', 'Last result: done in ' + d.elapsed.toFixed(1) + 's');
      showImage('/image/' + d.job_id, d.elapsed, parseInt(document.getElementById('w').value), parseInt(document.getElementById('h').value));
      if (d.prompt) document.getElementById('prompt').value = d.prompt;
    } else if (d.status === 'running' || d.status === 'queued') {
      // resume polling for in-progress job
      document.getElementById('prog').classList.add('on');
      document.getElementById('btn-gen').disabled = true;
      setStatus('', 'Resuming job ' + d.job_id.slice(0,8) + '…');
      const start = Date.now();
      clearInterval(_poll);
      _poll = setInterval(async () => {
        let s;
        try { s = await (await fetch('/status/' + d.job_id)).json(); } catch { return; }
        if (s.status === 'running') {
          const secs = ((Date.now()-start)/1000).toFixed(0);
          setStatus('', 'Generating... ' + secs + 's elapsed');
        } else if (s.status === 'done') {
          clearInterval(_poll);
          document.getElementById('fill').style.width = '100%';
          setStatus('ok', 'Done in ' + s.elapsed.toFixed(1) + 's');
          showImage('/image/' + d.job_id, s.elapsed);
          document.getElementById('btn-gen').disabled = false;
        } else if (s.status === 'error') {
          clearInterval(_poll);
          setStatus('err', 'Error: ' + s.error);
          document.getElementById('btn-gen').disabled = false;
        }
      }, 900);
    }
  } catch {}
})();
</script>
</body>
</html>
"""

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

@app.get("/")
def index():
    return Response(_HTML, mimetype="text/html")

@app.get("/model_status")
def model_status():
    with _model_lock:
        loaded = _model is not None
        key = _model_key
    short = key[0].split("/")[-1] if key else None
    return jsonify(loaded=loaded, loading=_model_loading,
                   model_name=key[0] if key else None,
                   short_name=short)

@app.post("/generate")
def generate():
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify(error="prompt is required"), 400

    VALID = (KLEIN_4B, LITE_MODEL, "flux-schnell", "flux-dev")
    model_name = data.get("model", LITE_MODEL)
    if model_name not in VALID:
        return jsonify(error="unknown model"), 400

    quantize = data.get("quantize")
    quantize = int(quantize) if quantize else None

    steps    = max(1,   min(int(data.get("steps",    20)),  100))
    guidance = max(0.0, min(float(data.get("guidance", 4.0)), 20.0))
    width    = (max(64, min(int(data.get("width",  256)), 2048)) // 64) * 64
    height   = (max(64, min(int(data.get("height", 256)), 2048)) // 64) * 64
    seed_raw = data.get("seed")
    seed = int(seed_raw) if seed_raw is not None else int(time.time_ns() % (2**31))

    job = Job(job_id=uuid.uuid4().hex, status="queued",
              prompt=prompt, model_name=model_name, quantize=quantize,
              steps=steps, guidance=guidance, width=width, height=height, seed=seed)
    try:
        _work_queue.put_nowait(job)
    except queue.Full:
        return jsonify(error="A generation is already in progress"), 503

    with _jobs_lock:
        _jobs[job.job_id] = job
    return jsonify(job_id=job.job_id), 202

@app.get("/status/<job_id>")
def status(job_id):
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job:
        return jsonify(error="not found"), 404
    now = time.time()
    resp = dict(
        job_id=job.job_id, status=job.status,
        elapsed=(job.finished_at or now) - (job.started_at or job.created_at),
        error=job.error,
    )
    if job.status == "done":
        resp["image_url"] = f"/image/{job_id}"
    return jsonify(resp)

@app.get("/latest")
def latest():
    """Return the most recent job (any status) — used by the UI on page load."""
    with _jobs_lock:
        if not _jobs:
            return jsonify(status="none"), 200
        job = max(_jobs.values(), key=lambda j: j.created_at)
    now = time.time()
    return jsonify(
        job_id=job.job_id,
        status=job.status,
        prompt=job.prompt,
        elapsed=(job.finished_at or now) - (job.started_at or job.created_at),
        error=job.error,
    )

@app.get("/image/<job_id>")
def get_image(job_id):
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job or not job.image_b64:
        return jsonify(error="not found"), 404
    img_bytes = base64.b64decode(job.image_b64)
    return Response(img_bytes, mimetype="image/png",
                    headers={"Content-Disposition":
                             f"inline; filename=flux_{job_id[:8]}.png"})

# ── entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    Path("outputs").mkdir(exist_ok=True)
    port = int(os.environ.get("PORT", 7860))
    print(f"\n  FLUX WebUI → http://127.0.0.1:{port}\n")
    print("  Model: lite-8B Q4 MLX (~7GB) — best for 8GB M1")
    print("  Close Chrome/VS Code before generating for best results\n")
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
