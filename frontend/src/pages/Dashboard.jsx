import { useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import SensorCard from '../components/SensorCard';
import SensorChart from '../components/SensorChart';
import AlertBanner from '../components/AlertBanner';
import HeatmapGrid from '../components/HeatmapGrid';

function checkAlerts(data) {
  if (!data) return [];
  const alerts = [];
  if (data.temperature > 35) alerts.push({ type: 'danger', msg: `High temperature detected: ${data.temperature}°C — Risk of heat stress` });
  if (data.temperature < 15) alerts.push({ type: 'warning', msg: `Low temperature: ${data.temperature}°C — Monitor for frost damage` });
  if (data.soil_moisture < 25) alerts.push({ type: 'danger', msg: `Critical soil moisture: ${data.soil_moisture}% — Irrigate immediately` });
  if (data.soil_moisture > 75) alerts.push({ type: 'warning', msg: `Excess soil moisture: ${data.soil_moisture}% — Risk of root rot` });
  if (data.humidity > 85) alerts.push({ type: 'warning', msg: `High humidity: ${data.humidity}% — Elevated fungal disease risk` });
  if (data.ph < 5.5) alerts.push({ type: 'warning', msg: `Acidic soil pH: ${data.ph} — Consider lime application` });
  if (data.ph > 7.5) alerts.push({ type: 'warning', msg: `Alkaline soil pH: ${data.ph} — Nutrient availability may be limited` });
  if (data.nitrogen < 15) alerts.push({ type: 'warning', msg: `Low nitrogen: ${data.nitrogen}ppm — Apply nitrogen fertilizer` });
  if (alerts.length === 0) alerts.push({ type: 'info', msg: 'All sensor readings are within optimal ranges ✓' });
  return alerts;
}

const SENSORS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️', min: 22, max: 38 },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧', min: 40, max: 90 },
  { key: 'soil_moisture', label: 'Soil Moisture', unit: '%', icon: '🌱', min: 20, max: 80 },
  { key: 'light_intensity', label: 'Light', unit: ' lux', icon: '☀️', min: 200, max: 1200 },
  { key: 'nitrogen', label: 'Nitrogen', unit: ' ppm', icon: '🧪', min: 10, max: 60 },
  { key: 'ph', label: 'Soil pH', unit: '', icon: '⚗️', min: 5.5, max: 7.5 },
];

export default function Dashboard() {
  const { latest, history, connected } = useSocket();
  const prevRef = useRef({});

  const alerts = checkAlerts(latest);

  const prev = prevRef.current;
  if (latest) prevRef.current = { ...latest };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#f0fdf4', margin: 0 }}>
            Farm Monitor
          </h1>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', color: '#4ade80', marginTop: '4px' }}>
            FARM_001 · {connected ? '● CONNECTED' : '○ CONNECTING...'}
          </div>
        </div>
        <div style={{
          background: '#0c1a0e',
          border: '1px solid #1a3d1e',
          borderRadius: '10px',
          padding: '10px 16px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.72rem',
          color: '#4ade80'
        }}>
          <div>Last Update: {latest ? new Date(latest.timestamp * 1000).toLocaleTimeString() : '—'}</div>
          <div style={{ marginTop: '2px', color: '#22c55e' }}>Readings every 3s via IoT</div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AlertBanner alerts={alerts} />
      </div>

      {/* Sensor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {SENSORS.map(s => (
          <SensorCard
            key={s.key}
            label={s.label}
            value={latest?.[s.key]}
            unit={s.unit}
            icon={s.icon}
            min={s.min}
            max={s.max}
            prev={prev?.[s.key]}
          />
        ))}
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SensorChart data={history} />
      </div>

      {/* Heatmap */}
      <HeatmapGrid data={latest} />
    </div>
  );
}
