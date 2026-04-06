#!/usr/bin/env python3
"""
MNIST benchmark with Apple MLX on Apple M1.
MLP: 784 → 256 → 128 → 10  |  Adam lr=1e-3  |  batch=256  |  10 epochs
"""

import gzip, struct, time, urllib.request
from pathlib import Path

import mlx.core as mx
import mlx.nn as nn
import mlx.optimizers as optim
import numpy as np

# ── data ────────────────────────────────────────────────────────────────────

CACHE = Path.home() / ".cache/mnist"
BASE  = "https://storage.googleapis.com/cvdf-datasets/mnist"
FILES = {
    "train-images": "train-images-idx3-ubyte.gz",
    "train-labels": "train-labels-idx1-ubyte.gz",
    "test-images":  "t10k-images-idx3-ubyte.gz",
    "test-labels":  "t10k-labels-idx1-ubyte.gz",
}


def _download(name: str) -> bytes:
    path = CACHE / FILES[name]
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"  Downloading {FILES[name]} …")
        urllib.request.urlretrieve(f"{BASE}/{FILES[name]}", path)
    with gzip.open(path) as f:
        return f.read()


def load_images(name: str) -> mx.array:
    raw = _download(name)
    n, r, c = struct.unpack_from(">iii", raw, 4)
    pixels = np.frombuffer(raw, dtype=np.uint8, offset=16).reshape(n, r * c)
    return mx.array(pixels.astype(np.float32) / 255.0)


def load_labels(name: str) -> mx.array:
    raw = _download(name)
    (n,) = struct.unpack_from(">i", raw, 4)
    labels = np.frombuffer(raw, dtype=np.uint8, offset=8)
    return mx.array(labels.astype(np.int32))


# ── model ────────────────────────────────────────────────────────────────────

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.l1 = nn.Linear(784, 256)
        self.l2 = nn.Linear(256, 128)
        self.l3 = nn.Linear(128, 10)

    def __call__(self, x):
        x = nn.relu(self.l1(x))
        x = nn.relu(self.l2(x))
        return self.l3(x)


# ── training ─────────────────────────────────────────────────────────────────

def loss_fn(model, x, y):
    logits = model(x)
    return mx.mean(nn.losses.cross_entropy(logits, y))


def accuracy(model, images, labels):
    logits = model(images)
    preds  = mx.argmax(logits, axis=1)
    return mx.mean(preds == labels).item()


def train_epoch(model, optimizer, images, labels, batch_size=256):
    n = images.shape[0]
    perm = np.random.permutation(n)
    total_loss, batches = 0.0, 0
    t0 = time.perf_counter()

    loss_and_grad = nn.value_and_grad(model, loss_fn)

    for i in range(0, n - batch_size + 1, batch_size):
        idx  = mx.array(perm[i : i + batch_size])
        xb, yb = images[idx], labels[idx]
        loss, grads = loss_and_grad(model, xb, yb)
        optimizer.update(model, grads)
        mx.eval(model.parameters(), loss)
        total_loss += loss.item()
        batches += 1

    elapsed = time.perf_counter() - t0
    throughput = (batches * batch_size) / elapsed
    return total_loss / batches, throughput


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print("=== MNIST MLX Python — Apple M1 Benchmark ===\n")

    print("Loading MNIST …")
    train_images = load_images("train-images")
    train_labels = load_labels("train-labels")
    test_images  = load_images("test-images")
    test_labels  = load_labels("test-labels")
    mx.eval(train_images, train_labels, test_images, test_labels)
    print(f"  Train: {train_images.shape[0]}  |  Test: {test_images.shape[0]}\n")

    model     = MLP()
    optimizer = optim.Adam(learning_rate=1e-3)

    EPOCHS     = 10
    BATCH_SIZE = 256

    print(f"{'Epoch':<6}  {'Loss':<10}  {'Test Acc':<10}  Throughput")
    print("-" * 52)

    total_train_sec = 0.0

    for epoch in range(1, EPOCHS + 1):
        loss, tp = train_epoch(model, optimizer, train_images, train_labels, BATCH_SIZE)
        total_train_sec += train_images.shape[0] / tp
        acc = accuracy(model, test_images, test_labels)
        print(f"{epoch:<6}  {loss:<10.4f}  {acc*100:<9.2f}%  {tp:>8.0f} smp/s")

    print("-" * 52)
    print(f"\nTotal training time : {total_train_sec:.2f} s  ({EPOCHS} epochs × 60 k samples)\n")

    # ── forward-pass benchmark ──────────────────────────────────────────────
    print("--- Forward-pass throughput (full 10 k test set, 100 runs) ---")
    # warmup
    for _ in range(3):
        mx.eval(model(test_images))

    RUNS = 100
    t0 = time.perf_counter()
    for _ in range(RUNS):
        mx.eval(model(test_images))
    elapsed = time.perf_counter() - t0

    lat_ms  = elapsed / RUNS * 1000
    fps     = RUNS * test_images.shape[0] / elapsed
    print(f"Avg latency  : {lat_ms:.3f} ms / forward pass")
    print(f"Throughput   : {fps:,.0f} samples/sec")

    # ── device info ────────────────────────────────────────────────────────
    print(f"\nMLX version  : {mx.__version__}")
    print(f"Default device: {mx.default_device()}")


if __name__ == "__main__":
    main()
