"""
Generate a placeholder EfficientNet-B0 model file for development.
This creates a minimal valid PyTorch checkpoint that model_loader.py can load.
"""
import json
import sys
from pathlib import Path

def generate_model():
    """Generate a minimal EfficientNet-B0 model checkpoint."""
    try:
        import torch
        import timm
        print("✓ PyTorch and timm available, generating real model...")
        
        # Create EfficientNet-B0 model
        classes = ["Coccidiosis", "Healthy", "New Castle Disease", "Salmonella"]
        model = timm.create_model('efficientnet_b0', num_classes=len(classes), pretrained=False)
        
        # Save to model/ directory
        model_dir = Path(__file__).parent / "model"
        model_dir.mkdir(exist_ok=True)
        
        model_path = model_dir / "efficientnet_b0_best.pth"
        
        # Save checkpoint with metadata
        checkpoint = {
            "model_state_dict": model.state_dict(),
            "classes": classes,
            "input_size": 224,
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225],
            "timm_model": "efficientnet_b0"
        }
        
        torch.save(checkpoint, model_path)
        print(f"✓ Model saved to {model_path}")
        print(f"  File size: {model_path.stat().st_size / 1024 / 1024:.1f} MB")
        
        # Save metadata
        metadata = {
            "model_file": "efficientnet_b0_best.pth",
            "classes": classes,
            "input_size": 224
        }
        metadata_path = model_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        print(f"✓ Metadata saved to {metadata_path}")
        
        return True
        
    except (ImportError, OSError) as e:
        print(f"⚠ PyTorch not available ({e})")
        print("  Your system is running in DEMO mode")
        print("\nTo fix this:")
        print("1. Download the trained model from Kaggle:")
        print("   - Go to your training notebook output files")
        print("   - Download 'efficientnet_b0_best.pth'")
        print("   - Place it in: model/efficientnet_b0_best.pth")
        print("\n2. OR install PyTorch:")
        print("   pip install torch torchvision torchaudio")
        return False

if __name__ == "__main__":
    success = generate_model()
    sys.exit(0 if success else 1)
