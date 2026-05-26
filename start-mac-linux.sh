#!/bin/bash

echo ""
echo "===================================="
echo "  AgriGuard - Starting All Services "
echo "===================================="
echo ""

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 not found. Install from https://python.org"; exit 1; }

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "🐍 Setting up ML service..."
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
cd ..

echo "🐍 Setting up IoT simulator..."
cd iot-simulator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
cd ..

echo ""
echo "✅ Setup complete! Starting all services..."
echo ""

# Detect OS for terminal command
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS - use Terminal app
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/backend\" && npm run dev"'
  sleep 2
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/frontend\" && npm run dev"'
  sleep 2
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/ml-service\" && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"'
  sleep 4
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/iot-simulator\" && source venv/bin/activate && python simulator.py"'
else
  # Linux - use gnome-terminal or xterm
  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal -- bash -c "cd backend && npm run dev; bash"
    sleep 2
    gnome-terminal -- bash -c "cd frontend && npm run dev; bash"
    sleep 2
    gnome-terminal -- bash -c "cd ml-service && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload; bash"
    sleep 4
    gnome-terminal -- bash -c "cd iot-simulator && source venv/bin/activate && python simulator.py; bash"
  else
    echo "Please open 4 terminals and run:"
    echo ""
    echo "  Terminal 1:  cd backend && npm run dev"
    echo "  Terminal 2:  cd frontend && npm run dev"
    echo "  Terminal 3:  cd ml-service && source venv/bin/activate && uvicorn main:app --port 8000 --reload"
    echo "  Terminal 4:  cd iot-simulator && source venv/bin/activate && python simulator.py"
  fi
fi

echo ""
echo "🌿 AgriGuard is starting up!"
echo "   Open: http://localhost:5173"
echo ""
