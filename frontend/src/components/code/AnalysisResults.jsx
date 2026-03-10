import React from 'react';

export default function AnalysisResults({ result, originalCode }) {
  return (
    <div className="p-6 bg-[#12121a] border border-[#2a2a3a] rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-violet-400">Analysis Report</h2>
        <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full border border-violet-500/20">
          AI Generated
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#2a2a3a]">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Summary</h3>
          <p className="text-gray-200 leading-relaxed">{result.summary}</p>
        </div>
      </div>
    </div>
  );
}