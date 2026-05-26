import { useMemo } from 'react';

const FIELDS = [
  { key: 'temperature', label: 'Temperature', min: 22, max: 38, unit: '°C' },
  { key: 'humidity', label: 'Humidity', min: 40, max: 90, unit: '%' },
  { key: 'soil_moisture', label: 'Soil Moisture', min: 20, max: 80, unit: '%' },
];

function getColor(ratio) {
  if (ratio < 0.3) return { bg: '#14532d', border: '#22c55e', label: 'Optimal' };
  if (ratio < 0.6) return { bg: '#713f12', border: '#eab308', label: 'Moderate' };
  return { bg: '#7f1d1d', border: '#ef4444', label: 'Critical' };
}

export default function HeatmapGrid({ data }) {
  // Generate stable farm zones with slight variance
  const zones = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      variance: (Math.sin(i * 2.5) * 8) + (Math.cos(i * 1.7) * 5)
    }));
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0c1a0e, #111f13)',
      border: '1px solid #1a3d1e',
      borderRadius: '14px',
      padding: '1.5rem',
    }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', marginBottom: '1.2rem', marginTop: 0 }}>
        🗺️ Farm Zone Risk Heatmap
      </h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {FIELDS.map(f => (
          <div key={f.key}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: '#4ade80', marginBottom: '8px', letterSpacing: '1px' }}>
              {f.label.toUpperCase()}
              {data && <span style={{ color: '#22c55e', marginLeft: '8px' }}>{data[f.key]?.toFixed(1)}{f.unit}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {zones.map(zone => {
                const baseVal = data ? data[f.key] : (f.min + f.max) / 2;
                const val = Math.min(f.max, Math.max(f.min, baseVal + zone.variance * 0.6));
                const ratio = (val - f.min) / (f.max - f.min);
                const c = getColor(ratio);
                return (
                  <div
                    key={zone.id}
                    title={`Zone ${zone.id}: ${val.toFixed(1)}${f.unit}`}
                    style={{
                      width: '32px', height: '32px',
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.55rem',
                      color: c.border,
                      fontFamily: 'Space Mono, monospace',
                      fontWeight: 700
                    }}
                    onMouseEnter={e => { e.target.style.transform = 'scale(1.2)'; e.target.style.zIndex = 10; }}
                    onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.zIndex = 1; }}
                  >
                    {zone.id}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              {[
                { color: '#22c55e', label: 'Optimal' },
                { color: '#eab308', label: 'Moderate' },
                { color: '#ef4444', label: 'Critical' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', color: '#4ade80' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
