import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen scan-bg">
        {/* Navbar */}
        <nav style={{
          background: 'linear-gradient(135deg, #050a06 0%, #0c1a0e 100%)',
          borderBottom: '1px solid #1a3d1e',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          gap: '2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '1rem' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #22c55e, #84cc16)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>🌿</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0fdf4', letterSpacing: '-0.5px' }}>
              Agri<span style={{ color: '#22c55e' }}>Guard</span>
            </span>
          </div>

          {[
            { to: '/', label: '⬡ Dashboard' },
            { to: '/detect', label: '🔬 Detection' },
            { to: '/analytics', label: '📊 Analytics' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              style={({ isActive }) => ({
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.78rem',
                color: isActive ? '#22c55e' : '#4ade80',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                border: isActive ? '1px solid #22c55e' : '1px solid transparent',
                background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              })}
            >
              {label}
            </NavLink>
          ))}

          {/* Live indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-live" style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }} />
            <span className="mono" style={{ fontSize: '0.7rem', color: '#4ade80' }}>LIVE</span>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detect" element={<Detection />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
