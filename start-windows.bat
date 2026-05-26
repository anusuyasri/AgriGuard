@echo off
echo.
echo  ====================================
echo    AgriGuard - Starting All Services
echo  ====================================
echo.

echo [1/3] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Setting up Python environments...
cd ml-service
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
call venv\Scripts\deactivate
cd ..

cd iot-simulator
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
call venv\Scripts\deactivate
cd ..

echo.
echo  ====================================
echo    Setup Complete! Starting services
echo  ====================================
echo.
echo  Opening 4 terminal windows...
echo  - Backend:       http://localhost:5000
echo  - Frontend:      http://localhost:5173
echo  - ML Service:    http://localhost:8000
echo  - IoT Simulator: streaming data
echo.

start "AgriGuard - Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

start "AgriGuard - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

start "AgriGuard - ML Service" cmd /k "cd ml-service && venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak >nul

start "AgriGuard - IoT Simulator" cmd /k "cd iot-simulator && venv\Scripts\activate && python simulator.py"

echo.
echo  All services started!
echo  Open your browser at: http://localhost:5173
echo.
pause
