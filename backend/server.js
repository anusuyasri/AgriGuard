const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ── In-memory data store ──────────────────────────────────────────────
let sensorHistory = [];
let latestReading = null;

// ── WebSocket ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Send current latest immediately on connect
  if (latestReading) {
    socket.emit('sensor_update', latestReading);
  }

  // Receive sensor data from IoT simulator
  socket.on('sensor_data', (data) => {
    latestReading = data;
    sensorHistory.push(data);
    if (sensorHistory.length > 500) sensorHistory.shift();

    // Broadcast to all connected frontend clients
    io.emit('sensor_update', data);
    console.log(`[IoT] ${JSON.stringify(data)}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ── REST Routes ───────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', readings: sensorHistory.length });
});

app.get('/api/sensor/latest', (req, res) => {
  res.json(latestReading || { message: 'No data yet. Start the IoT simulator.' });
});

app.get('/api/sensor/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(sensorHistory.slice(-limit));
});

// Disease detection — proxies image to the Python ML service
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/detect-disease', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post('https://agriguard-1-l792.onrender.com/predict', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    res.json(mlResponse.data);
  } catch (err) {
    console.error('[ML] Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service is not running. Start it with: cd ml-service && uvicorn main:app --port 8000' });
    } else {
      res.status(500).json({ error: 'ML service error', detail: err.message });
    }
  }
});

// ── Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🌿 AgriGuard Backend running on http://localhost:${PORT}`);
  console.log(`   WebSocket ready for IoT simulator`);
  console.log(`   REST API: http://localhost:${PORT}/api/health\n`);
});
