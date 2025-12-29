"""EfficientNet-B0 inference wrapper for the trained poultry model."""
from __future__ import annotations

import json
import logging
import os
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from PIL import Image

try:
    import torch
    from torchvision import models, transforms
    import timm
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    models = None
    transforms = None
    timm = None

logger = logging.getLogger(__name__)

DEFAULT_CLASSES = ["Coccidiosis", "Healthy", "New Castle Disease", "Salmonella"]
DEFAULT_INPUT_SIZE = 224
SUPPORTED_MODEL_FILENAMES = [
    "efficientnet_b0_best.pth",
    "model.pth",
    "model.pt",
    "model.h5",
    "model.onnx",
]


class ModelNotFoundError(FileNotFoundError):
    """Raised when a real model is required but missing."""


def _load_metadata(model_dir: Path) -> Tuple[List[str], int, Optional[str]]:
    meta_path = model_dir / "metadata.json"
    if not meta_path.exists():
        return DEFAULT_CLASSES, DEFAULT_INPUT_SIZE, None
    try:
        with meta_path.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("Failed to read metadata.json: %s", exc)
        return DEFAULT_CLASSES, DEFAULT_INPUT_SIZE, None
    classes = payload.get("classes") or DEFAULT_CLASSES
    input_size = int(payload.get("input_size", DEFAULT_INPUT_SIZE))
    model_file = payload.get("model_file")
    return classes, input_size, model_file


def _discover_model_path(model_dir: Path, preferred: Optional[str]) -> Optional[Path]:
    if preferred:
        candidate = model_dir / preferred
        if candidate.exists():
            return candidate
    for name in SUPPORTED_MODEL_FILENAMES:
        candidate = model_dir / name
        if candidate.exists():
            return candidate
    return None


def _load_model(path: Path, num_classes: int, device: Any) -> Any:
    if not TORCH_AVAILABLE:
        raise ModelNotFoundError("torch not installed; cannot load model")
    
    checkpoint = torch.load(path, map_location=device)
    
    # Extract model state dict and metadata
    if isinstance(checkpoint, dict):
        state_dict = checkpoint.get("model_state_dict", checkpoint.get("state_dict", checkpoint))
    else:
        raise ModelNotFoundError(f"Unsupported checkpoint format at {path}")
    
    # Create EfficientNet-B0 model using timm (matches the training checkpoint)
    model = timm.create_model('efficientnet_b0', num_classes=num_classes, pretrained=False)
    
    # Load state dict directly - timm keys should match the checkpoint
    if state_dict:
        cleaned = {}
        
        for k, v in state_dict.items():
            # Skip metadata keys
            if k in ['classes', 'input_size', 'mean', 'std', 'timm_model']:
                continue
            
            k_clean = k.replace("model.", "").replace("module.", "")
            cleaned[k_clean] = v
        
        # Load the state dict
        try:
            missing, unexpected = model.load_state_dict(cleaned, strict=False)
            logger.info("Model loaded: %d missing keys, %d unexpected keys", len(missing) if missing else 0, len(unexpected) if unexpected else 0)
        except RuntimeError as e:
            logger.warning("Failed to load state dict with mapping, trying direct load: %s", e)
            # Fallback: load what we can
            missing, unexpected = model.load_state_dict(state_dict, strict=False)
    
    model.eval()
    model.to(device)
    return model


def _prepare_image(image_bytes: bytes) -> Image.Image:
    with Image.open(BytesIO(image_bytes)) as img:
        return img.convert("RGB")


def _estimate_weight_kg(age_weeks: Optional[int]) -> float:
    if not age_weeks:
        return 1.0
    curve = {
        1: 0.18,
        2: 0.35,
        3: 0.60,
        4: 0.90,
        5: 1.30,
        6: 1.70,
        7: 2.10,
        8: 2.50,
    }
    clamped = max(1, min(age_weeks, 8))
    return curve.get(clamped, 1.0)


def _format_dosage(base_mg_per_kg: float, age_weeks: Optional[int], flock_size: Optional[int]) -> str:
    weight = _estimate_weight_kg(age_weeks)
    per_bird_mg = base_mg_per_kg * weight
    total = per_bird_mg * flock_size if flock_size else None
    age_part = f"age ~{age_weeks}w" if age_weeks else "age unknown"
    if total:
        return (
            f"{base_mg_per_kg:g} mg/kg ({per_bird_mg:.1f} mg/bird at {age_part}); "
            f"approx {total:.0f} mg total for flock of {flock_size}"
        )
    return f"{base_mg_per_kg:g} mg/kg ({per_bird_mg:.1f} mg/bird at {age_part})"


def _recommendations_for(top_label: str, age_weeks: Optional[int], flock_size: Optional[int]) -> List[Dict[str, Any]]:
    suggestions = {
        "Coccidiosis": [
            {
                "medicine": "Amprolium",
                "dosage": _format_dosage(10, age_weeks, flock_size),
                "admin": "Mix in drinking water for 5-7 days; ensure hydration",
            },
        ],
        "New Castle Disease": [
            {
                "medicine": "Supportive care",
                "dosage": "Electrolytes + multivitamins; isolation of sick birds",
                "admin": "Provide in water; consult vet for vaccination status",
            },
        ],
        "Salmonella": [
            {
                "medicine": "Enrofloxacin",
                "dosage": _format_dosage(10, age_weeks, flock_size),
                "admin": "Oral for 3-5 days; keep waterers clean",
            },
        ],
        "Healthy": [
            {
                "medicine": "Probiotics",
                "dosage": "As per label; focus on hygiene and clean litter",
                "admin": "In water/feeding per manufacturer guidance",
            }
        ],
    }
    return suggestions.get(top_label, [])


class ModelLoader:
    def __init__(self, model_dir: Optional[str] = None, device: Optional[str] = None) -> None:
        self.model_dir = Path(model_dir or os.getenv("MODEL_DIR", "./model")).resolve()
        self.classes, self.input_size, preferred_file = _load_metadata(self.model_dir)
        self.device = None
        self.model_path = _discover_model_path(self.model_dir, preferred_file)
        self.model = None
        self.transform = None

        if not TORCH_AVAILABLE:
            logger.warning("torch/torchvision not installed. Using mock predictions. Install with: pip install torch torchvision")
            return

        self.device = torch.device(device or os.getenv("MODEL_DEVICE", "cpu"))
        self.transform = transforms.Compose(
            [
                transforms.Resize((self.input_size, self.input_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )

        if self.model_path:
            try:
                self.model = _load_model(self.model_path, len(self.classes), self.device)
                logger.info("Loaded model from %s on %s", self.model_path, self.device)
            except Exception as exc:  # pragma: no cover - logged for operator visibility
                logger.warning("Model load failed: %s", exc)
        else:
            logger.warning("No model artifacts found in %s. Using deterministic mock predictions.", self.model_dir)

    def predict(
        self, image_bytes: bytes, age_weeks: Optional[int] = None, flock_size: Optional[int] = None
    ) -> Dict[str, Any]:
        if self.model is None or not TORCH_AVAILABLE:
            return {
                "predictions": [
                    {"disease": label, "confidence": 1 / len(self.classes)} for label in self.classes[:2]
                ],
                "recommendations": [],
                "note": "Mock inference used because torch is not installed or model files were not found.",
            }

        image = _prepare_image(image_bytes)
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0].cpu()

        topk = min(3, len(self.classes))
        values, indices = torch.topk(probs, k=topk)
        predictions = [
            {"disease": self.classes[idx], "confidence": float(score)} for idx, score in zip(indices.tolist(), values)
        ]

        recommendations = _recommendations_for(
            predictions[0]["disease"], age_weeks=age_weeks, flock_size=flock_size
        ) if predictions else []
        return {"predictions": predictions, "recommendations": recommendations}


model_loader = ModelLoader()

__all__ = ["model_loader", "ModelLoader", "ModelNotFoundError"]
