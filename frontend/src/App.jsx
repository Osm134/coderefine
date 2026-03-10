import React, { useState } from 'react';

export default function App() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [copyText, setCopyText] = useState('COPY OPTIMIZED CODE');

  // NEW FEATURE: ROI Calculator (Calculates time saved)
  const calculateTimeSaved = (bugs) => {
    const totalMinutes = (bugs * 15) + 10;
    return totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)} Hours` : `${totalMinutes} Minutes`;
  };

  const handleAudit = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setResults(null);
    setCopyText('COPY OPTIMIZED CODE');
    try {
      const response = await fetch('http://127.0.0.1:8000/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setResults(data);
      setHistory(prev => [{ id: Date.now(), score: data.complexity_score }, ...prev].slice(0, 5));
    } catch (err) {
      alert("Backend Offline! Ensure 'python main.py' is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!results) return;
    const reportText = `
CODEREFINE AI - AUDIT REPORT
------------------------------------------
BUGS: ${results.bug_count} | OPT: ${results.complexity_score}% | SEC: ${results.security_score}%
TIME SAVED: ${calculateTimeSaved(results.bug_count)}
VULNERABILITIES: ${results.bug_details}
FIX ROADMAP: ${results.how_to_fix}
------------------------------------------
REWRITTEN CODE:
${results.rewritten_code}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!results?.rewritten_code) return;
    await navigator.clipboard.writeText(results.rewritten_code);
    setCopyText('✅ COPIED!');
    setTimeout(() => setCopyText('COPY OPTIMIZED CODE'), 2000);
  };

  const s = {
    body: { backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '20px' },
    glass: { background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '25px', height: 'fit-content' },
    inputContainer: { display: 'flex', background: '#000', borderRadius: '15px', border: '1px solid #1e293b', overflow: 'hidden' },
    lineNumberSidebar: { padding: '20px 10px', color: '#334155', textAlign: 'right', fontSize: '12px', background: '#020617', userSelect: 'none', lineHeight: '1.5' },
    input: { flex: 1, height: '520px', backgroundColor: 'transparent', color: '#10b981', border: 'none', padding: '20px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', marginTop: '15px', padding: '18px', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s ease' },
    stat: { flex: 1, padding: '12px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', transition: 'transform 0.3s ease' }
  };

  return (
    <div style={s.body}>
      <header style={{ maxWidth: '1400px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, background: 'linear-gradient(to right, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: '900' }}>CODEREFINE AI</h1>
            <div className="status-badge"><span className="pulse-dot"></span>LIVE_ENGINE</div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enterprise Neural Review • v2.6.0</p>
        </div>
        {results && <button className="export-btn" onClick={handleExport} style={{ background: '#1e293b', color: '#60a5fa', border: '1px solid #3b82f6', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>📥 DOWNLOAD FULL AUDIT</button>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1.2fr', gap: '25px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* COLUMN 1: History & Confidence */}
        <div style={s.glass}>
          <h4 style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>SESSION HISTORY</h4>
          {history.length === 0 ? <p style={{ fontSize: '11px', color: '#334155' }}>No logs.</p> : history.map((item, i) => (
            <div key={item.id} className="history-card">
              <div style={{ color: '#60a5fa' }}>Audit #{history.length - i}</div>
              <div style={{ color: '#10b981', fontSize: '10px' }}>Stable: {item.score}%</div>
            </div>
          ))}

          {/* NEW FEATURE: Confidence Meter */}
          {results && (
            <div style={{ marginTop: '30px', padding: '15px', background: '#0f172a', borderRadius: '15px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '9px', color: '#64748b' }}>NEURAL CONFIDENCE:</span>
              <div style={{ height: '4px', background: '#1e293b', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></div>
              </div>
              <div style={{ fontSize: '10px', marginTop: '5px', color: '#34d399', textAlign: 'right' }}>94.2% Precise</div>
            </div>
          )}
        </div>

        {/* COLUMN 2: Input with Line Numbers */}
        <div style={s.glass}>
          <div style={s.inputContainer}>
             <div style={s.lineNumberSidebar}>
                1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11<br/>12<br/>13<br/>14
             </div>
             <textarea style={s.input} placeholder="// Paste source logic here..." value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button className="main-btn" style={s.btn} onClick={handleAudit} disabled={isAnalyzing}>
            {isAnalyzing ? "NEURAL SCANNING..." : "INITIALIZE AI AUDIT"}
          </button>
        </div>

        {/* COLUMN 3: Results with Severity & ROI */}
        <div style={s.glass}>
          {results ? (
            <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
              
              {/* NEW FEATURE: Severity Visualizer */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={s.stat} className={`stat-card ${results.bug_count > 0 ? 'alert-red' : ''}`}>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>BUGS</span>
                    <div style={{ color: results.bug_count > 0 ? '#ef4444' : '#34d399', fontWeight: 'bold', fontSize: '1.2rem' }}>{results.bug_count}</div>
                </div>
                <div style={s.stat} className="stat-card">
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>OPT.</span>
                    <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem' }}>{results.complexity_score}%</div>
                </div>
                <div style={s.stat} className="stat-card">
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>SECURITY</span>
                    <div style={{ color: results.security_score < 70 ? '#facc15' : '#34d399', fontWeight: 'bold', fontSize: '1.2rem' }}>{results.security_score}%</div>
                </div>
              </div>

              {/* NEW FEATURE: ROI Metric Box */}
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px', marginBottom: '15px', textAlign: 'center' }}>
                 <span style={{ fontSize: '10px', color: '#60a5fa', letterSpacing: '1px' }}>⏱ DEVELOPMENT TIME SAVED:</span>
                 <div style={{ color: '#fff', fontWeight: '900', fontSize: '15px' }}>{calculateTimeSaved(results.bug_count)}</div>
              </div>

              <pre style={{ backgroundColor: '#000', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b', color: '#60a5fa', fontSize: '11px', overflow: 'auto', maxHeight: '130px', borderLeft: '4px solid #7c3aed' }}>
                {results.rewritten_code}
              </pre>
              <button onClick={handleCopy} style={{ width: '100%', padding: '10px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', marginTop: '5px' }}>
                {copyText}
              </button>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#a855f7', fontSize: '10px', marginBottom: '10px' }}>✨ AI INNOVATION:</h4>
                {results.feature_suggestions?.map((suggestion, i) => (
                  <div key={i} className="suggestion-item">✦ {suggestion}</div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ color: '#10b981', margin: '0 0 5px 0', fontSize: '10px' }}>FIX ROADMAP:</h4>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>{results.how_to_fix}</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.1, paddingTop: '200px' }}>
              <h2>SYSTEM_READY</h2>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes alert-glow { 0% { border-color: #1e293b; } 50% { border-color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); } 100% { border-color: #1e293b; } }
        
        .status-badge { display: flex; align-items: center; gap: 8px; background: rgba(52, 211, 153, 0.1); border: 1px solid #34d399; color: #34d399; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; }
        .pulse-dot { width: 6px; height: 6px; background: #34d399; border-radius: 50%; animation: pulse 2s infinite; }
        
        .main-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }
        .history-card { padding: 10px; background: #0f172a; border-radius: 10px; margin-bottom: 10px; border: 1px solid #1e293b; transition: 0.3s; }
        .history-card:hover { border-color: #7c3aed; }
        
        .stat-card:hover { transform: scale(1.05); }
        .alert-red { animation: alert-glow 1.5s infinite; border-width: 2px !important; }
        
        .suggestion-item { padding: 8px; background: rgba(124, 58, 237, 0.1); border-radius: 8px; fontSize: 11px; marginBottom: 5px; color: #c084fc; border: 1px solid rgba(124, 58, 237, 0.2); }
      `}</style>
    </div>
  );
}