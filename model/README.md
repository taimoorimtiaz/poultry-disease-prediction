# Model Integration Guide

This directory (`model/`) is where your **trained poultry disease prediction model** should be placed.

## Supported Model Formats

The backend's `model_loader.py` automatically scans this directory for one of these files:

1. **PyTorch**: `model.pth` or `model.pt`
2. **TensorFlow/Keras**: `model.h5` or `saved_model/`
3. **ONNX**: `model.onnx`

## Expected Input Format

- **Type**: PIL Image object (RGB mode)
- **Size**: Variable (the loader will handle resizing if needed)
- **Format**: JPEG or PNG images uploaded by users

The `model_loader.py` converts the Django `ImageField` to a PIL Image:
```python
from PIL import Image
from io import BytesIO

image_bytes = sample_image.image.read()
pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
```

## Expected Output Format

Your model's prediction function should return a dictionary with this structure:

```python
{
    "predictions": [
        {
            "disease_name": "Coccidiosis",
            "confidence": 0.87,
            "disease_id": 1  # Optional: ID from Disease model
        },
        {
            "disease_name": "Salmonellosis",
            "confidence": 0.32,
            "disease_id": 2
        }
    ],
    "recommendations": [
        {
            "medicine_name": "Amprolium",
            "dosage": "10 mg/kg body weight",
            "administration": "Mix in drinking water for 5-7 days",
            "medicine_id": 1  # Optional: ID from Medicine model
        },
        {
            "medicine_name": "Enrofloxacin",
            "dosage": "5 mg/kg body weight",
            "administration": "Oral or injectable, twice daily for 3-5 days",
            "medicine_id": 2
        }
    ]
}
```

### Field Descriptions

**predictions** (list):
- `disease_name` (str): Human-readable disease name
- `confidence` (float): Prediction confidence between 0.0 and 1.0
- `disease_id` (int, optional): Foreign key to `Disease` model in database

**recommendations** (list):
- `medicine_name` (str): Human-readable medicine name
- `dosage` (str): Recommended dosage information
- `administration` (str): How to administer the medicine
- `medicine_id` (int, optional): Foreign key to `Medicine` model in database

## Exporting from Your Training Pipeline

### For PyTorch

```python
import torch

# After training your model
model = YourPoultryDiseaseModel()
model.load_state_dict(torch.load('checkpoint.pth'))
model.eval()

# Save the entire model
torch.save(model, 'model.pth')

# Or save just the state dict (recommended)
torch.save(model.state_dict(), 'model.pth')
```

### For TensorFlow/Keras

```python
import tensorflow as tf

# After training
model = tf.keras.models.Sequential([...])
model.fit(...)

# Save the model
model.save('model.h5')
```

### For ONNX

```python
import torch
import torch.onnx

model = YourPoultryDiseaseModel()
dummy_input = torch.randn(1, 3, 224, 224)  # Adjust input shape

torch.onnx.export(
    model,
    dummy_input,
    'model.onnx',
    export_params=True,
    opset_version=11,
    input_names=['input'],
    output_names=['output']
)
```

## Integrating Your Model with model_loader.py

Once you've placed your model file here, update `backend/model_loader.py`:

1. **Import your model class** (if using PyTorch/TensorFlow):
   ```python
   from your_training_repo import PoultryDiseaseClassifier
   ```

2. **Update `_load_model()` method**:
   ```python
   def _load_model(self):
       if self.model_path.endswith('.pth'):
           model = PoultryDiseaseClassifier()
           model.load_state_dict(torch.load(self.model_path))
           model.eval()
           return model
       # ... handle other formats
   ```

3. **Update `predict()` method**:
   ```python
   def predict(self, image_path_or_bytes):
       pil_image = self._prepare_image(image_path_or_bytes)
       
       # Your preprocessing (resize, normalize, etc.)
       input_tensor = preprocess(pil_image)
       
       # Run inference
       with torch.no_grad():
           output = self.model(input_tensor)
       
       # Convert output to expected format
       predictions = self._parse_predictions(output)
       recommendations = self._get_recommendations(predictions)
       
       return {
           'predictions': predictions,
           'recommendations': recommendations
       }
   ```

4. **Map predictions to database records** (optional but recommended):
   ```python
   from apps.diseases.models import Disease
   from apps.medicines.models import Medicine
   
   def _parse_predictions(self, output):
       # Example: output is a tensor of class probabilities
       class_probs = torch.softmax(output, dim=1)[0]
       
       predictions = []
       for class_idx, confidence in enumerate(class_probs):
           if confidence > 0.1:  # Threshold
               disease = Disease.objects.filter(name__icontains=CLASS_NAMES[class_idx]).first()
               predictions.append({
                   'disease_name': CLASS_NAMES[class_idx],
                   'confidence': float(confidence),
                   'disease_id': disease.id if disease else None
               })
       
       return sorted(predictions, key=lambda x: x['confidence'], reverse=True)
   ```

## Environment Configuration

Set the `MODEL_DIR` environment variable in your `.env` file:

```bash
MODEL_DIR=u:/Abdul_Haseeb(BAI)/FYP/saim/poultry-disease-prediction-full-stack-/model
```

The `model_loader.py` will automatically find your model in this directory.

## Testing Your Integration

1. **Place your model file** in this directory
2. **Run Django migrations** if you've added new diseases/medicines:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. **Test the model loader**:
   ```bash
   python manage.py shell
   ```
   ```python
   from model_loader import ModelLoader
   from apps.analysis.models import SampleImage
   
   loader = ModelLoader()
   sample = SampleImage.objects.first()
   result = loader.predict(sample.image)
   print(result)
   ```
4. **Upload a test image** via the frontend and verify predictions

## Fallback Behavior

If no model file is found, `model_loader.py` returns **mock predictions** for testing:

```python
{
    "predictions": [
        {"disease_name": "Coccidiosis", "confidence": 0.87, "disease_id": 1},
        {"disease_name": "Salmonellosis", "confidence": 0.32, "disease_id": 2}
    ],
    "recommendations": [
        {"medicine_name": "Amprolium", ...},
        {"medicine_name": "Enrofloxacin", ...}
    ]
}
```

This allows the full-stack system to function during development even without a trained model.

## Troubleshooting

**Issue**: `ModelNotFoundError` even though model file exists
- Check `MODEL_DIR` in `.env` points to this directory
- Ensure file name matches supported formats (model.pth, model.h5, model.onnx)
- Verify file permissions allow Django to read the file

**Issue**: Predictions always return mock data
- Check Django logs for "Model not found" warnings
- Verify `_load_model()` successfully loads your model
- Add debug print statements in `predict()` method

**Issue**: CUDA/GPU errors
- Install GPU-compatible versions: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118`
- Or force CPU mode in `_load_model()`: `torch.load(path, map_location='cpu')`

## Contact

For questions about model integration, refer to:
- `backend/model_loader.py` - Core integration code
- `backend/apps/analysis/views.py` - How predictions are used
- Root `README.md` - Full project setup guide
