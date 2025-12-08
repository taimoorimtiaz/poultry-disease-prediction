"""Lightweight placeholder model loader.

Reads MODEL_DIR env var and looks for known model filenames. If missing, predict returns a
mock deterministic response that keeps development unblocked while surfacing a clear
warning. When a real model is added, implement _load_model and adjust predict logic.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

from io import BytesIO

from PIL import Image

logger = logging.getLogger(__name__)

SUPPORTED_MODEL_FILENAMES = ["model.pth", "model.h5", "model.onnx"]


class ModelNotFoundError(FileNotFoundError):
    """Raised when a real model is required but missing."""


def _discover_model_path(model_dir: Path) -> Optional[Path]:
    for name in SUPPORTED_MODEL_FILENAMES:
        candidate = model_dir / name
        if candidate.exists():
            return candidate
    return None


def _load_model(path: Path) -> Any:
    """
    TODO: Replace with actual model loading (e.g., torch.load, tf.keras.models.load_model).
    """
    raise ModelNotFoundError(f"Real model loading not implemented. Missing file at {path}.")


def _prepare_image(image_bytes: bytes) -> Image.Image:
    with Image.open(BytesIO(image_bytes)) as img:
        return img.convert("RGB")


class ModelLoader:
    def __init__(self, model_dir: Optional[str] = None) -> None:
        self.model_dir = Path(model_dir or os.getenv("MODEL_DIR", "./model")).resolve()
        self.model_path = _discover_model_path(self.model_dir)
        self.model = None
        if self.model_path:
            try:
                self.model = _load_model(self.model_path)
            except ModelNotFoundError as exc:
                logger.warning("Model loading placeholder triggered: %s", exc)
        else:
            logger.warning("No model artifacts found in %s. Using deterministic mock predictions.", self.model_dir)

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """Run prediction; if no model loaded, return deterministic mock output."""
        if self.model is None:
            return {
                "predictions": [
                    {"disease": "Coccidiosis", "confidence": 0.87},
                    {"disease": "Salmonellosis", "confidence": 0.32},
                ],
                "recommendations": [
                    {"medicine": "Amprolium", "dosage": "5 mg/kg", "admin": "Oral for 5 days"},
                    {"medicine": "Enrofloxacin", "dosage": "10 mg/kg", "admin": "Oral for 3 days"},
                ],
                "note": "Mock inference used because no model files were found in MODEL_DIR.",
            }

        # Real model inference goes here.
        _ = _prepare_image(image_bytes)  # noqa: F841 - parsed image ready for real inference
        raise ModelNotFoundError("Model object is not loaded. Implement real inference in model_loader.py")


model_loader = ModelLoader()

__all__ = ["model_loader", "ModelLoader", "ModelNotFoundError"]
