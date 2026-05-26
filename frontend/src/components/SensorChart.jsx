import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { useState } from 'react';

const METRICS = [
  { key: 'temperature', label: 'Temperature (°C)', color: '#f97316' },
  { key: 'humidity', label: 'Humidity (%)', color: '#38bdf8' },
  { key: 'soil_moisture', label: 'Soil Moisture (%)', color: '#22c55e' },
  { key: 'ph', label: 'pH', color: '#a78bfa' },
  { key: 'nitrogen', label: 'Nitrogen (ppm)', color: '#fbbf24' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1a0e',
      border: '1px solid #1a3d1e',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: 'Space Mono, monospace',
      fontSize: '0.72rem',
    }}>
      <div style={{ color: '#4ade80', marginBottom: '6px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: '2px' }}>
          {p.name}: <strong>{p.value?.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function SensorChart({ data }) {
  const [active, setActive] = useState(['temperature', 'humidity', 'soil_moisture']);

  const toggle = (key) => {
    setActive(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0c1a0e, #111f13)',
      border: '1px solid #1a3d1e',
      borderRadius: '14px',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>
          📈 Real-Time Sensor Trends
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.65rem',
                padding: '4px 10px',
                borderRadius: '20px',
                border: `1px solid ${active.includes(m.key) ? m.color : '#1a3d1e'}`,
                background: active.includes(m.key) ? `${m.color}22` : 'transparent',
                color: active.includes(m.key) ? m.color : '#4ade80',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3d1e" />
          <XAxis dataKey="time" tick={{ fill: '#4ade80', fontSize: 10, fontFamily: 'Space Mono' }} />
          <YAxis tick={{ fill: '#4ade80', fontSize: 10, fontFamily: 'Space Mono' }} />
          <Tooltip content={<CustomTooltip />} />
          {METRICS.filter(m => active.includes(m.key)).map(m => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              stroke={m.color}
              dot={false}
              strokeWidth={2}
              name={m.label}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
