"""
AgriGuard IoT Sensor Simulator
Emits realistic farm sensor readings to the backend via WebSocket every 3 seconds.
Install: pip install "python-socketio[client]" requests
Run:     python simulator.py
"""

import socketio
import time
import math
import random
import sys

BACKEND_URL = "http://localhost:5000"

sio = socketio.Client(logger=False, engineio_logger=False)

# Simulate gradual drifting values (more realistic than pure random)
class SensorState:
    def __init__(self):
        self.temperature = 28.0
        self.humidity = 62.0
        self.soil_moisture = 52.0
        self.light_intensity = 650.0
        self.nitrogen = 35.0
        self.ph = 6.5
        self.tick = 0

    def step(self):
        self.tick += 1
        t = self.tick

        # Smooth sinusoidal drift with small noise
        def drift(val, center, amplitude, speed, noise=1.0):
            sine_component = amplitude * math.sin(t * speed)
            noise_component = random.gauss(0, noise)
            return val + (center - val) * 0.05 + sine_component * 0.1 + noise_component * 0.2

        self.temperature     = round(drift(self.temperature,     28.0, 6.0,  0.05, 0.5), 2)
        self.humidity        = round(drift(self.humidity,        62.0, 15.0, 0.03, 0.8), 2)
        self.soil_moisture   = round(drift(self.soil_moisture,   52.0, 20.0, 0.02, 0.6), 2)
        self.light_intensity = round(drift(self.light_intensity, 650.0, 400.0, 0.04, 10), 2)
        self.nitrogen        = round(drift(self.nitrogen,        35.0, 15.0, 0.02, 0.5), 2)
        self.ph              = round(drift(self.ph,              6.5,  0.8,  0.01, 0.05), 2)

        # Clamp values to realistic ranges
        self.temperature     = max(10.0, min(45.0, self.temperature))
        self.humidity        = max(20.0, min(100.0, self.humidity))
        self.soil_moisture   = max(5.0,  min(95.0, self.soil_moisture))
        self.light_intensity = max(50.0, min(1500.0, self.light_intensity))
        self.nitrogen        = max(5.0,  min(80.0, self.nitrogen))
        self.ph              = max(4.5,  min(8.5, self.ph))

        return {
            "farm_id": "FARM_001",
            "timestamp": time.time(),
            "temperature": self.temperature,
            "humidity": self.humidity,
            "soil_moisture": self.soil_moisture,
            "light_intensity": self.light_intensity,
            "nitrogen": self.nitrogen,
            "ph": self.ph,
        }


state = SensorState()


@sio.event
def connect():
    print(f"✅ Connected to AgriGuard backend at {BACKEND_URL}")
    print("   Streaming sensor data every 3 seconds... (Ctrl+C to stop)\n")


@sio.event
def disconnect():
    print("❌ Disconnected from backend")


@sio.event
def connect_error(data):
    print(f"❌ Connection failed: {data}")
    print("   Make sure the backend is running: cd backend && npm run dev")
    sys.exit(1)


def main():
    print("🌿 AgriGuard IoT Simulator")
    print(f"   Connecting to {BACKEND_URL}...\n")

    try:
        sio.connect(BACKEND_URL, transports=["websocket", "polling"])
    except Exception as e:
        print(f"❌ Could not connect: {e}")
        print("   Start the backend first: cd backend && npm run dev")
        sys.exit(1)

    try:
        while True:
            data = state.step()
            sio.emit("sensor_data", data)
            print(
                f"📡 T={data['temperature']}°C  "
                f"H={data['humidity']}%  "
                f"SM={data['soil_moisture']}%  "
                f"L={data['light_intensity']}lx  "
                f"N={data['nitrogen']}ppm  "
                f"pH={data['ph']}"
            )
            time.sleep(3)
    except KeyboardInterrupt:
        print("\n\n🛑 Simulator stopped.")
        sio.disconnect()


if __name__ == "__main__":
    main()
