import React from 'react';
import { RESEARCH_EXPERIMENTS } from '../services/mockData';
import { FlaskConical, CircleDot, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Experiments() {
  
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Running':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'Pending':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'Demo':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-white/5 text-slate-400 border-white/5';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={12} />;
      case 'Running':
        return <CircleDot size={12} className="animate-spin" />;
      case 'Pending':
        return <Play size={10} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-white tracking-tight">Research Experiments</h2>
        <p className="text-slate-400 text-sm mt-1">
          Detailed log of research iterations, training parameters, and cross-validation performance.
        </p>
      </div>

      {/* Overview stats */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-950/20 flex flex-wrap gap-6 items-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-indigo-400" />
          <span className="font-bold text-slate-200">Experiment Log:</span>
        </div>
        <div>
          <span>Total Iterations: <strong className="text-white">7</strong></span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div>
          <span>Completed: <strong className="text-emerald-400">5</strong></span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div>
          <span>Running: <strong className="text-amber-400">1</strong></span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <div>
          <span>Simulated/Demo: <strong className="text-indigo-400">1</strong></span>
        </div>
      </div>

      {/* Grid Layout of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESEARCH_EXPERIMENTS.map((exp, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/10 flex flex-col justify-between space-y-4 hover:border-indigo-500/25 transition-all duration-300"
          >
            {/* Top row ID + status */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">{exp.id}</span>
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getBadgeStyle(exp.status)}`}>
                {getStatusIcon(exp.status)}
                {exp.status}
              </span>
            </div>

            {/* Experiment Name / Model */}
            <div>
              <h3 className="text-sm font-bold text-slate-200">{exp.name}</h3>
              <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">{exp.model}</p>
              
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed min-h-[48px]">
                {exp.objective}
              </p>
            </div>

            {/* Parameters */}
            <div className="py-2 px-3 rounded bg-slate-950/70 border border-white/5">
              <span className="text-[8px] text-slate-500 font-bold uppercase block tracking-wider">Parameters</span>
              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{exp.parameters}</p>
            </div>

            {/* Performance outcomes */}
            <div className="pt-3.5 border-t border-white/5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">R² score</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">{exp.r2}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">RMSE margin</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">{exp.rmse}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
