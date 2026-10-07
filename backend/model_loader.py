"""EfficientNet-B0 inference wrapper for the trained poultry model."""
from __future__ import annotations

import json
import logging
import os
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import random
from PIL import Image

try:
    import torch
    from torchvision import models, transforms
    import timm
    TORCH_AVAILABLE = True
except (ImportError, OSError) as e:
    TORCH_AVAILABLE = False
    torch = None
    models = None
    transforms = None
    timm = None
    logger_init = logging.getLogger(__name__)
    logger_init.warning(f"PyTorch not available: {e}. Running in DEMO mode.")

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

# Standard COCO category names (used by torchvision detection models)
COCO_INSTANCE_CATEGORY_NAMES = [
    '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep',
    'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
    'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
    'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
    'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
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


def _validate_chicken_feces_image(image: Image.Image) -> Tuple[bool, str]:
    """
    Validate if the uploaded image appears to be chicken feces.
    STRICT validation - only accepts actual chicken droppings images.
    Returns (is_valid, error_message)
    """
    import numpy as np
    
    # Convert image to numpy array
    img_array = np.array(image)
    
    # Get image dimensions
    height, width = img_array.shape[:2]
    
    # Check minimum image size (should be at least 50x50 for meaningful analysis)
    if height < 50 or width < 50:
        return False, "Image too small. Please upload a larger image of chicken droppings (at least 50x50 pixels)."
    
    # Check maximum dimension to reject panorama-style images
    max_dim = max(height, width)
    if max_dim > 4000:
        return False, "Image resolution too high. Please resize before uploading."
    
    # Check if image has reasonable aspect ratio (not too stretched)
    aspect_ratio = max(height, width) / min(height, width)
    if aspect_ratio > 4:
        return False, "Invalid image aspect ratio. Please upload a proper close-up photo of chicken droppings."
    
    # Analyze color distribution for chicken feces characteristics
    # Chicken feces typically have brownish, yellowish, or greenish tones
    if len(img_array.shape) == 3 and img_array.shape[2] == 3:
        r = img_array[:, :, 0].astype(float)
        g = img_array[:, :, 1].astype(float)
        b = img_array[:, :, 2].astype(float)
        
        # Calculate color averages
        avg_r = np.mean(r)
        avg_g = np.mean(g)
        avg_b = np.mean(b)
        
        # Calculate brightness
        brightness = (avg_r + avg_g + avg_b) / 3
        
        # STRICT: Check if image is too bright (likely white object, paper, sky, building)
        if brightness > 180:
            return False, "Image is too bright (likely not droppings). Please upload a clear photo of chicken droppings."
        
        # STRICT: Check if image is too dark (likely a dark object or poor lighting)
        if brightness < 40:
            return False, "Image is too dark. Please provide a clearer photo with better lighting."
        
        # STRICT: Check for blue-dominant images (sky, water, blue objects)
        # Chicken feces are NEVER blue-dominant
        if avg_b > avg_r and avg_b > avg_g:
            return False, "Image appears to be blue (sky/water). Please upload a photo of chicken droppings, not sky or blue objects."
        
        # STRICT: Check for red-dominant images (red brick, red objects)
        # This is NOT typical for chicken feces
        if avg_r > avg_b + 60 and avg_r > avg_g:
            return False, "Image appears to be reddominant. Please upload a photo of chicken droppings."
        
        # STRICT: Check grayscale images (no color info - likely not feces)
        color_intensity = abs(avg_r - avg_g) + abs(avg_g - avg_b) + abs(avg_r - avg_b)
        if color_intensity < 15:
            return False, "Image appears to be grayscale. Please upload a color photo of chicken droppings."
        
        # Calculate color variances
        r_variance = np.std(r)
        g_variance = np.std(g)
        b_variance = np.std(b)
        total_variance = r_variance + g_variance + b_variance
        
        # STRICT: Check if image has sufficient texture
        if total_variance < 20:
            return False, "Image appears too uniform/smooth. Please upload a clear photo of chicken droppings."
        
        # STRICT: Check color channel differences for unusual patterns
        max_channel = max(avg_r, avg_g, avg_b)
        min_channel = min(avg_r, avg_g, avg_b)
        channel_diff = max_channel - min_channel
        
        # If one color is extremely dominant, it's likely not feces
        if channel_diff > 100:
            return False, "Image has unusual color pattern. Please upload a clear photo of chicken droppings."
        
        # STRICT: Chicken feces should have brownish/yellowish/greenish tones
        # Check that R and G are both reasonably high (brown/yellow requires R and G)
        # and B is not too high
        if avg_r < 60 and avg_g < 60:
            return False, "Image doesn't have typical droppings colors. Please upload a clear photo of chicken droppings."
        
        # Additional check: B channel should not be dominant
        # Feces are never blue
        if avg_b > avg_r and avg_b > avg_g:
            return False, "Image appears blue. Please upload a photo of chicken droppings."
        
        # Check if image is too saturated with one color
        if avg_r > 200 or avg_g > 200 or avg_b > 200:
            return False, "Image has oversaturated colors. Please upload a proper photo of chicken droppings."
    
    return True, ""


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


def _recommendations_for(disease_label: str, age_weeks: Optional[int], flock_size: Optional[int]) -> List[Dict[str, Any]]:
    """Get medicine recommendations for a specific disease."""
    suggestions = {
        "Coccidiosis": [
            {
                "medicine": "Amprolium",
                "dosage": _format_dosage(10, age_weeks, flock_size),
                "admin": "Mix in drinking water for 5-7 days; ensure hydration",
            },
            {
                "medicine": "Toltrazuril",
                "dosage": _format_dosage(7, age_weeks, flock_size),
                "admin": "Single dose in feed or water; alternative to Amprolium",
            },
        ],
        "New Castle Disease": [
            {
                "medicine": "Supportive care",
                "dosage": "Electrolytes + multivitamins; isolation of sick birds",
                "admin": "Provide in water; consult vet for vaccination status",
            },
            {
                "medicine": "Vitamin A & E supplementation",
                "dosage": "As per label for boosting immunity",
                "admin": "In feed or water depending on product",
            },
        ],
        "Salmonella": [
            {
                "medicine": "Enrofloxacin",
                "dosage": _format_dosage(10, age_weeks, flock_size),
                "admin": "Oral for 3-5 days; keep waterers clean",
            },
            {
                "medicine": "Sulfonamides",
                "dosage": _format_dosage(20, age_weeks, flock_size),
                "admin": "Oral for 5-7 days; ensure adequate water intake",
            },
        ],
        "Healthy": [
            {
                "medicine": "Probiotics",
                "dosage": "As per label; focus on hygiene and clean litter",
                "admin": "In water/feeding per manufacturer guidance",
            },
            {
                "medicine": "Vitamin & Mineral supplements",
                "dosage": "Maintenance dose per label",
                "admin": "In water or feed for optimal health",
            }
        ],
    }
    return suggestions.get(disease_label, [])


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

        # Detection and threshold configuration
        self.detector = None
        self.detector_transform = transforms.Compose([transforms.ToTensor()])
        # Confidence thresholds (environment overrides)
        self.poultry_detect_thresh = float(os.getenv("POULTRY_DETECT_CONF", "0.5"))
        self.disease_conf_thresh = float(os.getenv("DISEASE_CONF_THRESH", "0.8"))

        # Try to load a pretrained COCO detector to validate presence of birds in the image
        try:
            from torchvision.models.detection import fasterrcnn_resnet50_fpn

            det = fasterrcnn_resnet50_fpn(pretrained=True)
            det.eval()
            det.to(self.device)
            self.detector = det
            logger.info("Loaded COCO bird detector for poultry validation")
        except Exception as exc:  # pragma: no cover - optional feature
            logger.info("COCO detector not available or failed to load (%s). Continuing without detector.", exc)

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
        # Always validate the image first (both in demo and real mode)
        image = _prepare_image(image_bytes)
        
        # Validate using the feces image validation function
        valid, reason = _validate_chicken_feces_image(image)
        if not valid:
            return {"status": "invalid", "message": "Invalid input: Please upload a poultry image.", "detail": reason}

        if self.model is None or not TORCH_AVAILABLE:
            # Demo mode: Generate varied predictions based on image content
            # Use image hash to generate deterministic but varied predictions
            image_hash = hash(image_bytes) % 100
            
            # Define disease scenarios with realistic confidence distributions
            scenarios = [
                # Scenario 1: Healthy bird (good conditions)
                [
                    {"disease": "Healthy", "confidence": 0.82},
                    {"disease": "Coccidiosis", "confidence": 0.18},
                ],
                # Scenario 2: Coccidiosis (whitish droppings, lethargy)
                [
                    {"disease": "Coccidiosis", "confidence": 0.88},
                    {"disease": "Healthy", "confidence": 0.12},
                ],
                # Scenario 3: Salmonella (ruffled feathers, pale comb)
                [
                    {"disease": "Salmonella", "confidence": 0.75},
                    {"disease": "Healthy", "confidence": 0.25},
                ],
                # Scenario 4: Newcastle Disease (neurological signs)
                [
                    {"disease": "New Castle Disease", "confidence": 0.81},
                    {"disease": "Healthy", "confidence": 0.19},
                ],
                # Scenario 5: Mixed - Hard to diagnose
                [
                    {"disease": "Coccidiosis", "confidence": 0.45},
                    {"disease": "Salmonella", "confidence": 0.55},
                ],
            ]
            
            # Select scenario based on image
            scenario_idx = image_hash % len(scenarios)
            demo_predictions = scenarios[scenario_idx]
            
            demo_recommendations = []
            for pred in demo_predictions:
                # Only add recommendations for diseases with meaningful confidence (>30%)
                if pred["confidence"] >= 0.30:
                    recs = _recommendations_for(pred["disease"], age_weeks=age_weeks, flock_size=flock_size)
                    demo_recommendations.extend(recs)
            
            return {
                "predictions": demo_predictions,
                "recommendations": demo_recommendations,
                "note": "⚠️ DEMO MODE: Model file not found. Using sample predictions. Install real model for accurate results.",
            }

        image = _prepare_image(image_bytes)

        # Tier 1: Poultry validation using detector when available
        poultry_present = False
        if self.detector is not None:
            try:
                det_tensor = self.detector_transform(image).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    det_out = self.detector(det_tensor)[0]

                labels = det_out.get('labels').cpu().numpy() if 'labels' in det_out else det_out["labels"].cpu().numpy()
                scores = det_out.get('scores').cpu().numpy() if 'scores' in det_out else det_out["scores"].cpu().numpy()

                for lab, score in zip(labels.tolist(), scores.tolist()):
                    name = COCO_INSTANCE_CATEGORY_NAMES[int(lab)] if int(lab) < len(COCO_INSTANCE_CATEGORY_NAMES) else None
                    if name == 'bird' and score >= self.poultry_detect_thresh:
                        poultry_present = True
                        break
            except Exception:
                # Detector failed; fall back to simple image heuristics below
                poultry_present = False

        # If detector not available or failed, fall back to simple feces image heuristics
        if not poultry_present:
            valid, reason = _validate_chicken_feces_image(image)
            if not valid:
                return {"status": "invalid", "message": "Invalid input: Please upload a poultry image.", "detail": reason}

        # Tier 2: Disease classification and confidence thresholding
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0].cpu()

        # Max probability check
        max_prob, max_idx = float(probs.max().item()), int(torch.argmax(probs).item())
        if max_prob < self.disease_conf_thresh:
            return {"status": "unclear", "message": "The image is unclear. Please upload a clearer poultry image.", "confidence": max_prob}

        # Prepare final predictions (top 2)
        topk = min(2, len(self.classes))  # Top 2 predictions only
        values, indices = torch.topk(probs, k=topk)
        predictions = [
            {"disease": self.classes[idx], "confidence": float(score)} for idx, score in zip(indices.tolist(), values)
        ]

        # Generate recommendations only for diseases with high enough confidence (30%+)
        recommendations = []
        confidence_threshold = 0.30
        for pred in predictions:
            if pred["confidence"] >= confidence_threshold:
                disease_recs = _recommendations_for(pred["disease"], age_weeks=age_weeks, flock_size=flock_size)
                recommendations.extend(disease_recs)

        return {"status": "ok", "predictions": predictions, "recommendations": recommendations}


model_loader = ModelLoader()

__all__ = ["model_loader", "ModelLoader", "ModelNotFoundError"]


