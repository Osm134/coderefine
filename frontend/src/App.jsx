import React, { useState } from 'react';

export default function App() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [copyText, setCopyText] = useState('📋 COPY OPTIMIZED CODE');

  const calculateTimeSaved = (bugs) => {
    const totalMinutes = (bugs * 15) + 10;
    return totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)} Hours` : `${totalMinutes} Minutes`;
  };

  // ✅ RESTORED: Download Report Function
  const handleExport = () => {
    if (!results) return;
    const reportText = `
CODEREFINE AI - AUDIT REPORT
------------------------------------------
TIMESTAMP: ${new Date().toLocaleString()}
BUGS FOUND: ${results.bug_count}
SECURITY SCORE: ${results.security_score}%
TIME SAVED: ${calculateTimeSaved(results.bug_count)}
------------------------------------------
FIX ROADMAP:
${results.how_to_fix}

OPTIMIZED CODE:
${results.rewritten_code}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CodeRefine_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAudit = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setCopyText('📋 COPY OPTIMIZED CODE');
    try {
      const response = await fetch('http://127.0.0.1:8000/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setResults(data);

      const newEntry = {
        id: Date.now(),
        fullData: data,
        originalCode: code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
    } catch (err) {
      alert("Backend Offline! Ensure main.py is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const s = {
    body: { backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' },
    glass: { background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '25px' },
    btn: { width: '100%', marginTop: '15px', padding: '15px', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    exportBtn: { background: '#1e293b', color: '#60a5fa', border: '1px solid #3b82f6', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
  };

  return (
    <div style={s.body}>
      {/* HEADER WITH DOWNLOAD BUTTON */}
      <header style={{ maxWidth: '1400px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ background: 'linear-gradient(to right, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, fontSize: '2rem', fontWeight: '900' }}>CODEREFINE AI</h1>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>Enterprise Neural Auditor v2.6.5</div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {results && <button onClick={handleExport} style={s.exportBtn}>📥 DOWNLOAD REPORT</button>}
          <div style={{ color: '#34d399', border: '1px solid #34d399', padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>● LIVE_ENGINE</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 1.2fr', gap: '25px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* LOGS */}
        <div style={s.glass}>
          <h4 style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>AUDIT LOGS</h4>
          {history.length === 0 ? <p style={{ fontSize: '11px', color: '#334155' }}>Waiting for scan...</p> : history.map((item) => (
            <div key={item.id} onClick={() => { setResults(item.fullData); setCode(item.originalCode); }} 
                 style={{ padding: '12px', background: '#0f172a', borderRadius: '12px', marginBottom: '10px', border: '1px solid #1e293b', cursor: 'pointer' }}>
              <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 'bold' }}>{item.timestamp}</div>
              <div style={{ color: '#10b981', fontSize: '10px' }}>Complexity: {item.fullData.complexity_score}%</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={s.glass}>
          <textarea 
            style={{ width: '100%', height: '520px', backgroundColor: '#000', color: '#10b981', border: '1px solid #1e293b', borderRadius: '15px', padding: '20px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', lineHeight: '1.5' }} 
            value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Paste code for neural optimization..." 
          />
          <button style={s.btn} onClick={handleAudit}>{isAnalyzing ? "⚙️ NEURAL SCANNING..." : "🚀 START AUDIT SEQUENCE"}</button>
        </div>

        {/* OUTPUT */}
        <div style={s.glass}>
          {results ? (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, padding: '15px', background: '#0f172a', borderRadius: '12px', textAlign: 'center', border: results.bug_count > 0 ? '1px solid #ef4444' : '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>BUGS</div>
                  <div style={{ color: results.bug_count > 0 ? '#ef4444' : '#34d399', fontWeight: 'bold', fontSize: '1.2rem' }}>{results.bug_count}</div>
                </div>
                <div style={{ flex: 1, padding: '15px', background: '#0f172a', borderRadius: '12px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>TIME SAVED</div>
                  <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1rem' }}>{calculateTimeSaved(results.bug_count)}</div>
                </div>
              </div>

              <h4 style={{ color: '#34d399', fontSize: '11px', marginBottom: '10px' }}>✨ OPTIMIZED NEURAL OUTPUT:</h4>
              <div style={{ background: '#000', padding: '20px', borderRadius: '15px', color: '#60a5fa', fontSize: '13px', overflow: 'auto', maxHeight: '280px', borderLeft: '4px solid #7c3aed', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {results.rewritten_code}
              </div>
              
              <button 
                onClick={() => { navigator.clipboard.writeText(results.rewritten_code); setCopyText('✅ COPIED!'); setTimeout(() => setCopyText('📋 COPY OPTIMIZED CODE'), 2000); }} 
                style={{ ...s.btn, background: '#1e293b', marginTop: '10px', fontSize: '12px' }}>
                {copyText}
              </button>

              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '12px', borderLeft: '4px solid #7c3aed' }}>
                <h4 style={{ color: '#7c3aed', fontSize: '11px', margin: '0 0 5px 0' }}>💡 REASONING:</h4>
                <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>{results.how_to_fix}</p>
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.15, textAlign: 'center', marginTop: '220px' }}>
              <h2 style={{ letterSpacing: '5px' }}>READY_FOR_DATA</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}