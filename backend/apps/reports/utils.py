from __future__ import annotations

from io import BytesIO
from typing import Any, Dict

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def generate_report_pdf(analysis_result: Dict[str, Any]) -> bytes:
    """Simple PDF renderer; replace with richer template if needed."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 750, "Poultry Disease Analysis Report")
    c.setFont("Helvetica", 10)

    y = 700
    c.drawString(72, y, f"Analysis ID: {analysis_result.get('id')}")
    y -= 20
    c.drawString(72, y, "Predictions:")
    for pred in analysis_result.get("predicted_diseases", []):
        y -= 15
        c.drawString(90, y, f"- {pred.get('name')} (confidence: {pred.get('confidence')})")
    y -= 20
    c.drawString(72, y, "Medicines:")
    for med in analysis_result.get("medicines_recommended", []):
        y -= 15
        c.drawString(90, y, f"- {med.get('name')} | Dosage: {med.get('dosage')} | Admin: {med.get('administration')}")

    c.showPage()
    c.save()
    return buffer.getvalue()
