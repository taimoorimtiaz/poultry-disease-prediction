"""Pick disease confidence threshold from ID and OOD validation sets.

Usage:
  python pick_threshold.py --model-dir ./model --id-dir ../data/val_id --ood-dir ../data/val_ood --device cpu --fpr 0.05

The script computes max-softmax probabilities for ID and OOD images and selects
the threshold where false positive rate on OOD is <= --fpr (default 0.05) while
maximizing true positive rate.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import List

import numpy as np
import torch
from sklearn.metrics import roc_curve
from PIL import Image

from model_loader import ModelLoader


def compute_max_probs(model_loader: ModelLoader, img_dir: Path, device: torch.device, batch_size: int = 32):
    # img_dir may be ImageFolder-style (subfolders) or flat. We'll walk files.
    paths = []
    for root, _, files in os.walk(img_dir):
        for fname in files:
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".bmp")):
                paths.append(Path(root) / fname)

    transform = model_loader.transform
    model = model_loader.model
    model.eval()

    probs = []
    with torch.no_grad():
        for i in range(0, len(paths), batch_size):
            batch_paths = paths[i : i + batch_size]
            imgs = []
            for p in batch_paths:
                img = Image.open(p).convert('RGB')
                imgs.append(transform(img))
            if not imgs:
                continue
            x = torch.stack(imgs).to(device)
            logits = model(x)
            if (hasattr(model, 'temperature')):
                logits = logits / model.temperature
            soft = torch.softmax(logits, dim=1).cpu().numpy()
            maxp = soft.max(axis=1)
            probs.extend(maxp.tolist())

    return np.array(probs)


def pick_threshold(id_probs: np.ndarray, ood_probs: np.ndarray, max_fpr: float = 0.05):
    # Higher score -> more likely ID. Build labels: 1 for ID, 0 for OOD
    y_true = np.concatenate([np.ones_like(id_probs), np.zeros_like(ood_probs)])
    scores = np.concatenate([id_probs, ood_probs])
    fpr, tpr, thr = roc_curve(y_true, scores)
    # Find thresholds where fpr <= max_fpr
    valid_idx = np.where(fpr <= max_fpr)[0]
    if len(valid_idx) == 0:
        # fallback to conservative threshold
        return float(np.percentile(id_probs, 25))
    # choose index with maximum tpr among valid
    best = valid_idx[np.argmax(tpr[valid_idx])]
    return float(thr[best])


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--model-dir", required=False, default=os.getenv("MODEL_DIR", "./model"))
    p.add_argument("--id-dir", required=True, help="In-distribution (poultry) validation images")
    p.add_argument("--ood-dir", required=True, help="Out-of-distribution (non-poultry) validation images")
    p.add_argument("--device", default=os.getenv("MODEL_DEVICE", "cpu"))
    p.add_argument("--fpr", type=float, default=0.05, help="Allowed false positive rate on OOD set")
    p.add_argument("--out", default=None, help="Output JSON to write chosen threshold")
    args = p.parse_args()

    model_loader = ModelLoader(model_dir=args.model_dir, device=args.device)
    if model_loader.model is None:
        raise SystemExit("Model not loaded. Ensure model artifacts exist in MODEL_DIR and torch is installed.")

    device = torch.device(args.device)
    id_dir = Path(args.id_dir)
    ood_dir = Path(args.ood_dir)
    if not id_dir.exists() or not ood_dir.exists():
        raise SystemExit("ID or OOD directories not found")

    print("Computing max probabilities for ID set...")
    id_probs = compute_max_probs(model_loader, id_dir, device)
    print(f"Collected {len(id_probs)} ID samples")

    print("Computing max probabilities for OOD set...")
    ood_probs = compute_max_probs(model_loader, ood_dir, device)
    print(f"Collected {len(ood_probs)} OOD samples")

    threshold = pick_threshold(id_probs, ood_probs, max_fpr=args.fpr)
    print(f"Chosen disease confidence threshold: {threshold:.4f}")

    out_path = Path(args.out) if args.out else Path(model_loader.model_dir) / "disease_threshold.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        json.dump({"disease_conf_thresh": threshold}, fh)
    print(f"Saved threshold to {out_path}")


if __name__ == "__main__":
    main()
