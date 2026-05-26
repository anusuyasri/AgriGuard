# 🌿 AgriGuard — Intelligent Crop Monitoring & Disease Detection

A full-stack IoT + AI web application for real-time farm monitoring and crop disease detection.

---

## 🗂️ Project Structure

```
AgriGuard/
├── frontend/          → React + Vite + Tailwind CSS dashboard
├── backend/           → Node.js + Express + Socket.IO REST API
├── ml-service/        → Python FastAPI disease detection service
├── iot-simulator/     → Python IoT sensor data simulator
├── start-windows.bat  → One-click startup for Windows
└── start-mac-linux.sh → One-click startup for Mac/Linux
```

---

## ✅ Prerequisites

Make sure these are installed before you begin:

| Tool | Version | Download |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.9+ | https://python.org |
| npm | included with Node | — |

---

## 🚀 How to Run (Step by Step)

### Option A — One-Click Start (Recommended)

**Windows:**
```
Double-click start-windows.bat
```

**Mac / Linux:**
```bash
chmod +x start-mac-linux.sh
./start-mac-linux.sh
```

---

### Option B — Manual Start (4 Terminals)

Open **4 separate terminal windows** in the `AgriGuard/` folder.

---

#### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:5000

---

#### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:5173  ← **Open this in your browser**

---

#### Terminal 3 — ML Service (Python)
```bash
cd ml-service

# Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Mac / Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Runs on: http://localhost:8000

---

#### Terminal 4 — IoT Simulator (Python)
```bash
cd iot-simulator

# Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python simulator.py

# Mac / Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python simulator.py
```

---

## 🌐 Using the App

Once all 4 services are running, open **http://localhost:5173**

### Dashboard Page
- Live sensor cards: Temperature, Humidity, Soil Moisture, Light, Nitrogen, pH
- Real-time line chart with toggleable metrics
- Smart alert system (auto-warns on critical values)
- Farm zone risk heatmap (25 zones, color-coded)

### Disease Detection Page
- Drag and drop OR click to upload a crop leaf photo
- AI analyzes the image and returns:
  - Disease name
  - Confidence percentage
  - Severity (Low / Medium / High)
  - Actionable recommendation

### Analytics Page
- Session statistics (min, max, average per metric)
- Area charts for temperature and soil moisture trends
- Bar chart of session averages
- Radar chart of current reading profile

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/sensor/latest` | Latest sensor reading |
| GET | `/api/sensor/history?limit=100` | Historical readings |
| POST | `/api/detect-disease` | Upload image for disease detection |

---

## 🤖 ML Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status |
| POST | `/predict` | Analyze uploaded image |
| GET | `/diseases` | List all supported diseases |

---

## 🐛 Troubleshooting

**Dashboard shows "—" for all sensors:**
→ IoT simulator is not running. Start Terminal 4.

**Disease detection returns "ML service unavailable":**
→ ML service is not running. Start Terminal 3.

**Frontend can't connect to backend:**
→ Make sure backend is running on port 5000. Check Terminal 1.

**Python venv command fails:**
→ Try `python` instead of `python3` on Windows.

**Port already in use:**
→ Kill the process on that port, or change the port in the respective config file.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO, Multer, Axios |
| ML Service | Python, FastAPI, Pillow |
| IoT Simulator | Python, python-socketio |

---

## 📈 Upgrading the ML Model

The current ML service uses image color analysis as a placeholder. To use a real trained model:

1. Download PlantVillage dataset from Kaggle
2. Fine-tune a ViT or MobileNetV2 model
3. Replace the `analyze_image()` function in `ml-service/main.py` with your model inference

---

Built by Anusuya Srivastava · AgriGuard v1.0
