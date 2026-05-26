import { useSocket } from '../hooks/useSocket';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1a0e', border: '1px solid #1a3d1e',
      borderRadius: '8px', padding: '10px 14px',
      fontFamily: 'Space Mono, monospace', fontSize: '0.72rem',
    }}>
      <div style={{ color: '#4ade80', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

function StatBox({ label, value, unit, sub, color = '#22c55e' }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #0c1a0e, #111f13)',
      border: '1px solid #1a3d1e',
      borderRadius: '12px',
      padding: '1.2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.62rem', color: '#4ade80', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color, lineHeight: 1.1, marginTop: '6px' }}>
        {value}<span style={{ fontSize: '1rem', color: '#86efac' }}>{unit}</span>
      </div>
      {sub && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.62rem', color: '#4ade80', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const { history, latest } = useSocket();

  const avg = (key) => {
    if (!history.length) return 0;
    return (history.reduce((s, d) => s + (d[key] || 0), 0) / history.length).toFixed(1);
  };
  const maxVal = (key) => history.length ? Math.max(...history.map(d => d[key] || 0)).toFixed(1) : 0;
  const minVal = (key) => history.length ? Math.min(...history.map(d => d[key] || 0)).toFixed(1) : 0;

  // Radar data for current reading
  const radarData = latest ? [
    { metric: 'Temp', value: Math.round(((latest.temperature - 22) / 16) * 100) },
    { metric: 'Humidity', value: Math.round(((latest.humidity - 40) / 50) * 100) },
    { metric: 'Moisture', value: Math.round(((latest.soil_moisture - 20) / 60) * 100) },
    { metric: 'Light', value: Math.round(((latest.light_intensity - 200) / 1000) * 100) },
    { metric: 'Nitrogen', value: Math.round(((latest.nitrogen - 10) / 50) * 100) },
    { metric: 'pH', value: Math.round(((latest.ph - 5.5) / 2) * 100) },
  ] : [];

  // Bar chart: average readings by metric
  const barData = [
    { name: 'Temp (°C)', avg: parseFloat(avg('temperature')), color: '#f97316' },
    { name: 'Humidity (%)', avg: parseFloat(avg('humidity')), color: '#38bdf8' },
    { name: 'Moisture (%)', avg: parseFloat(avg('soil_moisture')), color: '#22c55e' },
    { name: 'Nitrogen', avg: parseFloat(avg('nitrogen')), color: '#fbbf24' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#f0fdf4', margin: 0 }}>
          Analytics
        </h1>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', color: '#4ade80', marginTop: '6px' }}>
          Statistical overview · {history.length} readings collected this session
        </p>
      </div>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatBox label="Avg Temperature" value={avg('temperature')} unit="°C" sub={`Min: ${minVal('temperature')} · Max: ${maxVal('temperature')}`} color="#f97316" />
        <StatBox label="Avg Humidity" value={avg('humidity')} unit="%" sub={`Min: ${minVal('humidity')} · Max: ${maxVal('humidity')}`} color="#38bdf8" />
        <StatBox label="Avg Soil Moisture" value={avg('soil_moisture')} unit="%" sub={`Min: ${minVal('soil_moisture')} · Max: ${maxVal('soil_moisture')}`} color="#22c55e" />
        <StatBox label="Avg Nitrogen" value={avg('nitrogen')} unit=" ppm" sub={`Min: ${minVal('nitrogen')} · Max: ${maxVal('nitrogen')}`} color="#fbbf24" />
        <StatBox label="Avg pH" value={avg('ph')} unit="" sub={`Min: ${minVal('ph')} · Max: ${maxVal('ph')}`} color="#a78bfa" />
        <StatBox label="Readings" value={history.length} unit="" sub="This session" color="#22c55e" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Area chart: temperature over time */}
        <div style={{ background: 'linear-gradient(145deg, #0c1a0e, #111f13)', border: '1px solid #1a3d1e', borderRadius: '14px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', margin: '0 0 1rem 0', fontSize: '1rem' }}>
            🌡️ Temperature Over Time
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3d1e" />
              <XAxis dataKey="time" tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <YAxis tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2} dot={false} name="Temp (°C)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Area chart: soil moisture over time */}
        <div style={{ background: 'linear-gradient(145deg, #0c1a0e, #111f13)', border: '1px solid #1a3d1e', borderRadius: '14px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', margin: '0 0 1rem 0', fontSize: '1rem' }}>
            🌱 Soil Moisture Over Time
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3d1e" />
              <XAxis dataKey="time" tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <YAxis tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="soil_moisture" stroke="#22c55e" fill="url(#moistGrad)" strokeWidth={2} dot={false} name="Moisture (%)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Bar chart */}
        <div style={{ background: 'linear-gradient(145deg, #0c1a0e, #111f13)', border: '1px solid #1a3d1e', borderRadius: '14px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', margin: '0 0 1rem 0', fontSize: '1rem' }}>
            📊 Session Averages
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3d1e" />
              <XAxis dataKey="name" tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <YAxis tick={{ fill: '#4ade80', fontSize: 9, fontFamily: 'Space Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" name="Average" radius={[4, 4, 0, 0]}
                fill="#22c55e"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div style={{ background: 'linear-gradient(145deg, #0c1a0e, #111f13)', border: '1px solid #1a3d1e', borderRadius: '14px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', margin: '0 0 1rem 0', fontSize: '1rem' }}>
            🎯 Current Reading Radar
          </h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a3d1e" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#4ade80', fontSize: 10, fontFamily: 'Space Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4ade80', fontSize: 8 }} />
                <Radar name="Current" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', color: '#4ade80' }}>
              Waiting for sensor data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
