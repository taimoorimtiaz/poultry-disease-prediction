"""Compute temperature scaling for a trained PyTorch classifier.

Usage:
  python calibrate_temperature.py --model-dir ./model --val-dir ../data/val --device cpu --out temperature.json

The validation directory should contain subfolders per class (ImageFolder format).
This script writes a JSON with the temperature value to the provided output path.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import List

import torch
import torch.nn.functional as F
from torch.optim import LBFGS
from torchvision.datasets import ImageFolder
from torchvision.transforms import Compose
from PIL import Image

from model_loader import ModelLoader


class TemperatureScaler(torch.nn.Module):
    def __init__(self, init_temp: float = 1.0):
        super().__init__()
        self.temperature = torch.nn.Parameter(torch.tensor([init_temp], dtype=torch.float))

    def forward(self, logits: torch.Tensor) -> torch.Tensor:
        return logits / self.temperature


def gather_logits_labels(model_loader: ModelLoader, val_dir: Path, device: torch.device, batch_size: int = 32):
    # Use torchvision ImageFolder to read images and labels
    dataset = ImageFolder(root=str(val_dir), transform=None)
    transform = model_loader.transform

    logits_list = []
    labels_list = []
    model = model_loader.model
    model.eval()
    with torch.no_grad():
        for i in range(0, len(dataset), batch_size):
            batch = dataset.imgs[i : i + batch_size]
            imgs = []
            labs = []
            for path, label in batch:
                img = Image.open(path).convert('RGB')
                imgs.append(transform(img))
                labs.append(label)
            if not imgs:
                continue
            x = torch.stack(imgs).to(device)
            logits = model(x)
            logits_list.append(logits.cpu())
            labels_list.append(torch.tensor(labs))

    logits = torch.cat(logits_list)
    labels = torch.cat(labels_list)
    return logits, labels


def set_temperature(logits: torch.Tensor, labels: torch.Tensor, device: torch.device) -> float:
    logits = logits.to(device)
    labels = labels.to(device)
    nll_criterion = torch.nn.CrossEntropyLoss().to(device)
    temp_module = TemperatureScaler().to(device)

    optimizer = LBFGS([temp_module.temperature], lr=0.1, max_iter=50)

    def eval():
        optimizer.zero_grad()
        loss = nll_criterion(temp_module(logits), labels)
        loss.backward()
        return loss

    optimizer.step(eval)
    return float(temp_module.temperature.item())


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--model-dir", required=False, default=os.getenv("MODEL_DIR", "./model"))
    p.add_argument("--val-dir", required=True, help="Validation directory in ImageFolder layout")
    p.add_argument("--device", default=os.getenv("MODEL_DEVICE", "cpu"))
    p.add_argument("--out", default=None, help="Output JSON file to write temperature")
    args = p.parse_args()

    model_loader = ModelLoader(model_dir=args.model_dir, device=args.device)
    if model_loader.model is None:
        raise SystemExit("Model not loaded. Ensure model artifacts exist in MODEL_DIR and torch is installed.")

    device = torch.device(args.device)
    val_dir = Path(args.val_dir)
    if not val_dir.exists():
        raise SystemExit(f"Validation directory not found: {val_dir}")

    print("Gathering logits and labels from validation set...")
    logits, labels = gather_logits_labels(model_loader, val_dir, device)

    print(f"Collected {len(labels)} validation samples. Fitting temperature...")
    temperature = set_temperature(logits, labels, device)
    print(f"Fitted temperature: {temperature:.4f}")

    out_path = Path(args.out) if args.out else Path(model_loader.model_dir) / "temperature.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        json.dump({"temperature": temperature}, fh)
    print(f"Saved temperature to {out_path}")


if __name__ == "__main__":
    main()
