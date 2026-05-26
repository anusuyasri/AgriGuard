export default function SensorCard({ label, value, unit, icon, min, max, prev }) {
  const ratio = min !== undefined && max !== undefined && value !== undefined
    ? Math.min(1, Math.max(0, (value - min) / (max - min)))
    : null;

  const getStatusColor = (r) => {
    if (r === null) return '#4ade80';
    if (r < 0.25 || r > 0.85) return '#ef4444';
    if (r < 0.35 || r > 0.75) return '#eab308';
    return '#22c55e';
  };

  const statusColor = getStatusColor(ratio);

  const trend = prev !== undefined && value !== undefined
    ? value > prev ? '↑' : value < prev ? '↓' : '→'
    : null;

  return (
    <div className="sensor-card fade-in" style={{
      background: 'linear-gradient(145deg, #0c1a0e, #111f13)',
      border: '1px solid #1a3d1e',
      borderRadius: '12px',
      padding: '1.2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'all 0.3s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        {trend && (
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.75rem',
            color: trend === '↑' ? '#22c55e' : trend === '↓' ? '#ef4444' : '#eab308',
            fontWeight: 700
          }}>{trend}</span>
        )}
      </div>

      <div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#4ade80', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: statusColor, lineHeight: 1.1, marginTop: '4px' }}>
          {value !== undefined && value !== null ? (
            <>{typeof value === 'number' ? value.toFixed(1) : value}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#86efac', marginLeft: '2px' }}>{unit}</span></>
          ) : (
            <span style={{ color: '#1a3d1e' }}>— —</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {ratio !== null && (
        <div style={{ height: '3px', background: '#1a3d1e', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${ratio * 100}%`,
            background: statusColor,
            borderRadius: '2px',
            transition: 'width 0.5s ease, background 0.3s'
          }} />
        </div>
      )}
    </div>
  );
}
