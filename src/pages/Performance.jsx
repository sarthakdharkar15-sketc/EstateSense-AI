import React from 'react';
import { 
  MODEL_PERFORMANCE_METRICS 
} from '../services/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Award, BarChart3, AlertCircle } from 'lucide-react';

export default function Performance() {
  
  // Format data for Recharts comparisons
  const data = MODEL_PERFORMANCE_METRICS.map(m => ({
    name: m.model.split(" (")[0], // short name
    MAE: parseFloat(m.mae),
    RMSE: parseFloat(m.rmse),
    R2: parseFloat(m.r2) // trims '%' automatically on parseFloat
  }));

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Model Performance & Evaluation</h2>
          <p className="text-slate-400 text-sm mt-1">
            Comparative performance of base, ensemble, and hybrid modeling pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wide">
          <AlertCircle size={14} />
          DEMO RESULTS
        </div>
      </div>

      {/* Model Performance Table */}
      <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2.5">
          <BarChart3 size={16} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Predictive Error Metrics Benchmarking</h3>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 font-bold uppercase border-b border-white/5">
                <th className="px-6 py-3.5">Model Configuration</th>
                <th className="px-6 py-3.5">MAE (Mean Abs. Error)</th>
                <th className="px-6 py-3.5">RMSE (Root Mean Sq. Error)</th>
                <th className="px-6 py-3.5">R² (Coeff. of Determination)</th>
                <th className="px-6 py-3.5">MAPE (Mean Abs. Pct. Error)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MODEL_PERFORMANCE_METRICS.map((row, idx) => {
                const isProposed = row.model.includes("Proposed");
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors hover:bg-white/5 ${
                      isProposed ? 'bg-indigo-600/10 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      {isProposed && <Award size={14} className="text-indigo-400 flex-shrink-0" />}
                      <span>{row.model}</span>
                    </td>
                    <td className="px-6 py-4 font-mono">₹{row.mae} Lakhs</td>
                    <td className="px-6 py-4 font-mono">₹{row.rmse} Lakhs</td>
                    <td className="px-6 py-4 font-mono text-indigo-400 font-bold">{row.r2}</td>
                    <td className="px-6 py-4 font-mono">{row.mape}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* R-Squared comparison */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Accuracy Comparison (R² %)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} interval={0} />
                <YAxis domain={[70, 95]} stroke="#666" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'R² Accuracy']}
                />
                <Bar dataKey="R2" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error metrics bar */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Root Mean Squared Error (RMSE)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} interval={0} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  itemStyle={{ color: '#ec4899', fontSize: '12px' }}
                  formatter={(value) => [`₹${value} Lakhs`, 'RMSE']}
                />
                <Bar dataKey="RMSE" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Experimental Summary Note */}
      <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20 text-xs text-slate-400 leading-relaxed">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Evaluation Summary</h4>
        <p>
          The comparative grid validates that the proposed **Hybrid XGBoost** model achieves an R² coefficient of **92.3%**, outperforming the standard Hedonic baseline by **17.5%** and the standalone XGBoost by **5.9%**. This demonstrates that mapping nonlinear residuals from a reliable linear estimator minimizes optimization variance and suppresses local error spikes, yielding a Root Mean Squared Error (RMSE) of just **₹3.92 Lakhs**.
        </p>
      </div>

    </div>
  );
}
