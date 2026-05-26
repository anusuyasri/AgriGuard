import { useState, useCallback } from 'react';
import axios from 'axios';

const SEVERITY_COLORS = {
  Low: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: '#22c55e' },
  Medium: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: '#eab308' },
  High: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: '#ef4444' },
};

const SAMPLE_DISEASES = [
  { name: 'Early Blight', icon: '🍂', desc: 'Dark spots with concentric rings on leaves' },
  { name: 'Late Blight', icon: '💀', desc: 'Water-soaked lesions, rapid spread in humid conditions' },
  { name: 'Powdery Mildew', icon: '🌫️', desc: 'White powdery coating on leaves and stems' },
  { name: 'Leaf Rust', icon: '🟠', desc: 'Orange-brown pustules on leaf surfaces' },
  { name: 'Bacterial Spot', icon: '🔴', desc: 'Small, dark, water-soaked spots on foliage' },
];

export default function Detection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    const form = new FormData();
    form.append('image', image);
    try {
      const res = await axios.post('https://agriguard-y257.onrender.com/api/detect-disease', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: 'ML service unavailable. Make sure the Python service is running on port 8000.' });
    }
    setLoading(false);
  };

  const sc = result && !result.error ? SEVERITY_COLORS[result.severity] : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#f0fdf4', margin: 0 }}>
          Disease Detection
        </h1>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', color: '#4ade80', marginTop: '6px' }}>
          Upload a crop leaf image for AI-powered disease analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            style={{
              background: dragging ? 'rgba(34,197,94,0.08)' : 'linear-gradient(145deg, #0c1a0e, #111f13)',
              border: `2px dashed ${dragging ? '#22c55e' : '#1a3d1e'}`,
              borderRadius: '14px',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              minHeight: '180px',
            }}
          >
            <div style={{ fontSize: '3rem' }}>🌿</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0fdf4', textAlign: 'center' }}>
              Drop crop image here
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: '#4ade80', textAlign: 'center' }}>
              or click to browse · JPG, PNG, WEBP
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={e => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>

          {/* Preview */}
          {preview && (
            <div style={{
              background: '#0c1a0e',
              border: '1px solid #1a3d1e',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <img src={preview} alt="Crop preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }} />
            </div>
          )}

          {/* Detect button */}
          <button
            onClick={handleDetect}
            disabled={!image || loading}
            style={{
              background: !image || loading ? '#1a3d1e' : 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              color: !image || loading ? '#4ade80' : '#050a06',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: !image || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? '🔄 Analyzing with Vision Transformer...' : '🔍 Detect Disease'}
          </button>
        </div>

        {/* Right: Result or info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result && !result.error && sc && (
            <div className="fade-in" style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              borderRadius: '14px',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: `${sc.color}22`,
                  border: `2px solid ${sc.color}`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {result.severity === 'High' ? '🚨' : result.severity === 'Medium' ? '⚠️' : '✅'}
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#f0fdf4' }}>
                    {result.disease}
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: sc.color }}>
                    {result.severity} Severity · {result.confidence}% confidence
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#4ade80', marginBottom: '6px' }}>CONFIDENCE SCORE</div>
                <div style={{ height: '6px', background: '#1a3d1e', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${result.confidence}%`,
                    background: `linear-gradient(90deg, ${sc.color}88, ${sc.color})`,
                    borderRadius: '3px',
                    transition: 'width 1s ease'
                  }} />
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: sc.color, marginTop: '4px' }}>
                  {result.confidence}%
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                background: '#0c1a0e',
                border: '1px solid #1a3d1e',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#4ade80', marginBottom: '6px', letterSpacing: '1px' }}>
                  💡 RECOMMENDATION
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', color: '#f0fdf4', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {result.recommendation}
                </div>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="fade-in" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '1.2rem',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.78rem',
              color: '#fca5a5'
            }}>
              ❌ {result.error}
            </div>
          )}

          {/* Disease reference guide */}
          <div style={{
            background: 'linear-gradient(145deg, #0c1a0e, #111f13)',
            border: '1px solid #1a3d1e',
            borderRadius: '14px',
            padding: '1.2rem',
          }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#4ade80', letterSpacing: '1px', marginBottom: '12px' }}>
              COMMON DISEASES DETECTED
            </div>
            {SAMPLE_DISEASES.map(d => (
              <div key={d.name} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid #1a3d1e'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{d.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#f0fdf4', fontSize: '0.85rem' }}>{d.name}</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#4ade80', marginTop: '2px' }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
