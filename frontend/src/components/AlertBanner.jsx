export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  const typeStyles = {
    danger: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#fca5a5', icon: '🚨' },
    warning: { bg: 'rgba(234,179,8,0.1)', border: '#eab308', color: '#fde047', icon: '⚠️' },
    info: { bg: 'rgba(34,197,94,0.1)', border: '#22c55e', color: '#86efac', icon: 'ℹ️' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {alerts.map((a, i) => {
        const s = typeStyles[a.type] || typeStyles.info;
        return (
          <div key={i} className="fade-in" style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderLeft: `4px solid ${s.border}`,
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.78rem',
            color: s.color
          }}>
            <span>{s.icon}</span>
            <span>{a.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
