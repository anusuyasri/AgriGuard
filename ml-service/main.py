from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import random

app = FastAPI(title="AgriGuard ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Disease knowledge base ────────────────────────────────────────────
DISEASES = {
    "Healthy": {
        "recommendation": "No action needed. Continue regular monitoring and maintain current irrigation schedule.",
        "icon": "✅"
    },
    "Early Blight": {
        "recommendation": "Apply copper-based fungicide immediately. Remove and destroy infected leaves. Avoid overhead irrigation. Rotate crops next season.",
        "icon": "🍂"
    },
    "Late Blight": {
        "recommendation": "URGENT: Apply mancozeb or chlorothalonil fungicide. Isolate affected plants. Destroy heavily infected plants to prevent spread.",
        "icon": "💀"
    },
    "Leaf Mold": {
        "recommendation": "Improve air circulation by spacing plants. Apply copper-based or chlorothalonil fungicide. Reduce humidity in the growing area.",
        "icon": "🌫️"
    },
    "Bacterial Spot": {
        "recommendation": "Apply copper bactericide spray. Avoid overhead irrigation and working with wet plants. Remove infected plant debris.",
        "icon": "🔴"
    },
    "Powdery Mildew": {
        "recommendation": "Apply sulfur-based or potassium bicarbonate fungicide. Improve air circulation. Avoid excessive nitrogen fertilization.",
        "icon": "⬜"
    },
    "Leaf Rust": {
        "recommendation": "Apply triazole or strobilurin fungicide. Remove heavily infected plant parts. Ensure good drainage around plants.",
        "icon": "🟠"
    },
    "Leaf Scorch": {
        "recommendation": "Check irrigation schedule — may be water stress. Apply potassium fertilizer. Ensure adequate soil moisture and avoid salt buildup.",
        "icon": "🔥"
    },
    "Septoria Leaf Spot": {
        "recommendation": "Apply chlorothalonil fungicide. Remove lower infected leaves. Avoid wetting foliage when watering. Mulch soil to reduce splash.",
        "icon": "🟡"
    },
    "Spider Mite Damage": {
        "recommendation": "Apply miticide or insecticidal soap. Increase humidity around plants. Introduce predatory mites as biological control.",
        "icon": "🕷️"
    },
}

DISEASE_NAMES = list(DISEASES.keys())

# ── Image analysis using basic color/texture heuristics ──────────────
# (Replace this section with a real trained model for production)

def analyze_image(image: Image.Image) -> dict:
    """
    Lightweight image analysis using color statistics.
    For a real deployment, replace with:
      - torchvision ViT fine-tuned on PlantVillage dataset
      - or HuggingFace transformers ViTForImageClassification
    """
    img_rgb = image.convert("RGB").resize((224, 224))
    pixels = list(img_rgb.getdata())

    # Compute channel averages
    r_avg = sum(p[0] for p in pixels) / len(pixels)
    g_avg = sum(p[1] for p in pixels) / len(pixels)
    b_avg = sum(p[2] for p in pixels) / len(pixels)

    # Compute brown/yellow/white ratios as disease indicators
    brown_count = sum(1 for p in pixels if p[0] > 120 and p[1] < 90 and p[2] < 70)
    yellow_count = sum(1 for p in pixels if p[0] > 150 and p[1] > 130 and p[2] < 80)
    white_count = sum(1 for p in pixels if p[0] > 200 and p[1] > 200 and p[2] > 200)
    orange_count = sum(1 for p in pixels if p[0] > 180 and 80 < p[1] < 140 and p[2] < 60)
    green_count = sum(1 for p in pixels if p[1] > p[0] + 20 and p[1] > p[2] + 20 and p[1] > 60)

    total = len(pixels)
    brown_r = brown_count / total
    yellow_r = yellow_count / total
    white_r = white_count / total
    orange_r = orange_count / total
    green_r = green_count / total

    # Simple rule-based classification
    if green_r > 0.45:
        disease = "Healthy"
        confidence = round(min(95, 60 + green_r * 60), 1)
    elif brown_r > 0.15 and yellow_r > 0.05:
        disease = "Early Blight"
        confidence = round(min(92, 50 + brown_r * 200), 1)
    elif white_r > 0.12:
        disease = "Powdery Mildew"
        confidence = round(min(90, 55 + white_r * 150), 1)
    elif orange_r > 0.08:
        disease = "Leaf Rust"
        confidence = round(min(88, 50 + orange_r * 200), 1)
    elif yellow_r > 0.15:
        disease = "Leaf Scorch"
        confidence = round(min(87, 50 + yellow_r * 150), 1)
    elif brown_r > 0.08:
        disease = "Septoria Leaf Spot"
        confidence = round(min(85, 45 + brown_r * 200), 1)
    elif green_r < 0.1:
        disease = "Late Blight"
        confidence = round(min(89, 55 + (0.1 - green_r) * 300), 1)
    else:
        # Fallback: small confidence detection
        disease = random.choice(["Bacterial Spot", "Leaf Mold", "Spider Mite Damage"])
        confidence = round(random.uniform(42, 65), 1)

    return disease, confidence


def get_severity(confidence: float) -> str:
    if confidence >= 75:
        return "High"
    elif confidence >= 50:
        return "Medium"
    return "Low"


# ── Routes ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "AgriGuard ML Service", "status": "running", "diseases_supported": len(DISEASES)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not open image. Make sure it is a valid image file.")

    disease, confidence = analyze_image(image)
    severity = get_severity(confidence)
    info = DISEASES.get(disease, DISEASES["Healthy"])

    return {
        "disease": disease,
        "confidence": confidence,
        "severity": severity,
        "recommendation": info["recommendation"],
        "icon": info["icon"],
    }


@app.get("/diseases")
def list_diseases():
    return {"diseases": [{"name": k, **v} for k, v in DISEASES.items()]}
