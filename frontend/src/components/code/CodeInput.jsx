import React, { useState } from 'react';

export default function CodeInput({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }) {
  const [code, setCode] = useState("");

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    
    try {
      // We use 127.0.0.1 to avoid local DNS issues
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code })
      });

      if (!response.ok) throw new Error("Backend responded with an error");

      const data = await response.json();
      onAnalysisComplete(data, code);
    } catch (error) {
      console.error(error);
      onAnalysisComplete({ summary: "Error: Could not connect to Python server. Make sure it is running on port 8000." }, code);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here (Python, JS, etc.)..."
        className="w-full h-64 p-4 bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl text-gray-300 font-mono text-sm focus:border-violet-500 outline-none transition-all"
      />
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white font-bold rounded-xl transition-all shadow-lg"
      >
        {isAnalyzing ? "AI is Analyzing..." : "Analyze Code"}
      </button>
    </div>
  );
}