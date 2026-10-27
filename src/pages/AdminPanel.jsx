import React, { useState, useEffect } from 'react';
import { crossValidateModel } from '../services/api';
import { 
  Users, 
  Settings, 
  Activity, 
  Trash2, 
  UserCheck, 
  Server, 
  Gauge, 
  Zap, 
  RefreshCw, 
  Play, 
  CheckCircle,
  Database,
  Cpu,
  BarChart,
  Shield
} from 'lucide-react';

export default function AdminPanel({ uploadedDataset }) {
  const dataset = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  const [activeTab, setActiveTab] = useState('settings');
  
  // API Latency State
  const [latency, setLatency] = useState(() => {
    const saved = localStorage.getItem('house_predict_latency');
    return saved !== null ? parseInt(saved) : 1200;
  });

  // User Accounts State
  const [users, setUsers] = useState([]);
  
  // Retraining State
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [modelStats, setModelStats] = useState(() => {
    const saved = localStorage.getItem('house_predict_model_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    if (dataset.length > 5) {
      try {
        const cv = crossValidateModel(dataset);
        return { r2: cv.r2, rmse: cv.rmse, mae: cv.mae, epochs: 150 };
      } catch (e) {}
    }
    return { r2: 0.845, rmse: 4.82, mae: 3.12, epochs: 150 };
  });

  // Load registered users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const registered = JSON.parse(localStorage.getItem('house_predict_users') || '[]');
    // Add default admin demo user for view consistency
    const demoAdmin = { name: 'Demo Admin', email: 'demo@housepredict.ai', role: 'Administrator', token: 'mock-jwt-token-demo' };
    setUsers([demoAdmin, ...registered]);
  };

  const handleLatencyChange = (e) => {
    const val = parseInt(e.target.value);
    setLatency(val);
    localStorage.setItem('house_predict_latency', val.toString());
  };

  const toggleUserRole = (email) => {
    if (email.toLowerCase() === 'demo@housepredict.ai') return; // Cannot edit demo admin
    const registered = JSON.parse(localStorage.getItem('house_predict_users') || '[]');
    const updated = registered.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, role: u.role === 'Administrator' ? 'Member' : 'Administrator' };
      }
      return u;
    });
    localStorage.setItem('house_predict_users', JSON.stringify(updated));
    loadUsers();
  };

  const deleteUser = (email) => {
    if (email.toLowerCase() === 'demo@housepredict.ai') return; // Cannot delete demo admin
    const registered = JSON.parse(localStorage.getItem('house_predict_users') || '[]');
    const updated = registered.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('house_predict_users', JSON.stringify(updated));
    loadUsers();
  };

  // Model Retraining Simulation
  const handleRetrain = () => {
    if (isRetraining) return;
    setIsRetraining(true);
    setRetrainProgress(0);
    
    const isCustom = dataset.length > 0;
    const initialLogs = isCustom 
      ? [`[INFO] Starting Custom Model training pipeline...`, `[INFO] Loading custom uploaded dataset (N = ${dataset.length} properties)...`]
      : ['[INFO] Starting XGBoost + Hedonic Model training pipeline...', '[INFO] Loading spatial property dataset (N = 10,000)...'];
      
    setTrainingLogs(initialLogs);

    const interval = setInterval(() => {
      setRetrainProgress(prev => {
        const next = prev + 10;
        
        // Push training logs dynamically
        if (next === 20) {
          setTrainingLogs(l => [...l, isCustom 
            ? '[INFO] Custom Data: Preprocessing coordinates & calculating distance ratios...' 
            : '[INFO] Preprocessing coordinates & calculating distance ratios...'
          ]);
        }
        if (next === 40) {
          if (isCustom) {
            const cv = crossValidateModel(dataset);
            setTrainingLogs(l => [...l, `[TRAIN] Fitting Hedonic OLS Baseline... (Est. R² = ${(cv.r2 * 0.9).toFixed(3)})`]);
          } else {
            setTrainingLogs(l => [...l, '[TRAIN] Running Hedonic Baseline OLS Regressor... (R² = 0.72)']);
          }
        }
        if (next === 60) {
          setTrainingLogs(l => [...l, isCustom 
            ? '[TRAIN] Building KNN-based Residual corrector for non-linear interactions...' 
            : '[TRAIN] Training XGBoost Corrector for non-linear residual mapping...'
          ]);
        }
        if (next === 80) {
          setTrainingLogs(l => [...l, '[VALIDATE] Cross-validation completed. Computing MAE and RMSE metrics...']);
        }
        if (next === 90) {
          setTrainingLogs(l => [...l, isCustom 
            ? '[OPTIMIZE] Compiling neighborhood configurations & caching weights...' 
            : '[OPTIMIZE] Pruning hyperparameter trees & writing weights...'
          ]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRetraining(false);
            
            let newStats;
            if (isCustom) {
              const cv = crossValidateModel(dataset);
              newStats = {
                r2: cv.r2,
                rmse: cv.rmse,
                mae: cv.mae,
                epochs: modelStats.epochs + 50
              };
            } else {
              newStats = {
                r2: parseFloat((0.85 + Math.random() * 0.03).toFixed(4)),
                rmse: parseFloat((4.2 + Math.random() * 0.5).toFixed(2)),
                mae: parseFloat((2.8 + Math.random() * 0.3).toFixed(2)),
                epochs: modelStats.epochs + 50
              };
            }
            
            setModelStats(newStats);
            localStorage.setItem('house_predict_model_stats', JSON.stringify(newStats));
            setTrainingLogs(l => [...l, `[SUCCESS] Model retrained successfully! New Evaluation: R² = ${newStats.r2}, RMSE = ${newStats.rmse}`]);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 400);
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="text-indigo-400" size={24} />
            Administrator Control Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure system latency settings, manage user accounts, and simulate machine learning model retraining.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 sm:gap-6 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'settings' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={15} />
          Simulation Settings
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={15} />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('mlops')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'mlops' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={15} />
          ML Operations (MLOps)
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Latency card */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Gauge size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">API Latency Simulation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control mock database query and model evaluation delay times.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Response Latency</span>
                  <span className="text-lg font-bold text-indigo-400">{latency} ms</span>
                </div>
                
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={latency}
                  onChange={handleLatencyChange}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-950 border border-white/5"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>100ms (Immediate)</span>
                  <span>2.5s (Simulated Network)</span>
                  <span>5.0s (Slow Connection)</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex gap-3 text-xs text-slate-400 leading-normal">
                <Server size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  This value overrides the default internal timers. Changing the slider instantly impacts predictions, search, and page loading latency across all tabs.
                </p>
              </div>
            </div>

            {/* Status card */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-white/5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Emulator Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">FastAPI Server</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wide">Mock Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">Model Pipeline</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wide">Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">Authentication</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[9px] uppercase tracking-wide">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">Database Size</span>
                    <span className="font-semibold text-slate-200">
                      {dataset.length > 0 
                        ? `${dataset.length} rows (Custom CSV)` 
                        : "10,000 rows"
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                <Zap size={12} className="text-indigo-400" />
                <span>Running fully local in browser cache.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-panel rounded-xl border border-white/5 bg-slate-950/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Accounts</h3>
              <span className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full font-bold">
                {users.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/40">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {users.map(u => {
                    const isDemo = u.email.toLowerCase() === 'demo@housepredict.ai';
                    return (
                      <tr key={u.email} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-200">{u.name}</td>
                        <td className="px-6 py-4 text-slate-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                            u.role === 'Administrator' 
                              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25' 
                              : 'bg-slate-900 text-slate-400'
                          }`}>
                            {u.role || 'Member'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleUserRole(u.email)}
                              disabled={isDemo}
                              title="Toggle admin role"
                              className={`p-1.5 rounded-lg border transition-all text-slate-400 hover:text-white hover:bg-indigo-600/10 hover:border-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              <UserCheck size={14} />
                            </button>
                            <button
                              onClick={() => deleteUser(u.email)}
                              disabled={isDemo}
                              title="Delete user"
                              className={`p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mlops' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* retraining controls */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Model Evaluation Metrics</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Parameters computed during last model iteration.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">R² Coefficient</span>
                  <p className="text-xl font-bold text-white mt-1">{(modelStats.r2 * 100).toFixed(2)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">RMSE (Error Rate)</span>
                  <p className="text-xl font-bold text-white mt-1">₹{modelStats.rmse}L</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">MAE (Avg Deviation)</span>
                  <p className="text-xl font-bold text-white mt-1">₹{modelStats.mae}L</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Training Epochs</span>
                  <p className="text-xl font-bold text-white mt-1">{modelStats.epochs}</p>
                </div>
              </div>

              <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 hover:shadow-indigo-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {isRetraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Retraining... {retrainProgress}%</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Trigger Model Retrain</span>
                  </>
                )}
              </button>
            </div>

            {/* training console */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-white/5 flex flex-col h-[400px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pipeline Output Console</h3>
                </div>
                <span className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-mono">
                  {isRetraining ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              {/* Progress bar */}
              {isRetraining && (
                <div className="w-full bg-slate-950 border border-white/5 h-1.5 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
                    style={{ width: `${retrainProgress}%` }}
                  />
                </div>
              )}

              {/* Terminal Logs container */}
              <div className="flex-1 bg-slate-950/80 rounded-lg border border-white/5 p-4 font-mono text-[10px] text-indigo-300 overflow-y-auto space-y-2 select-text scrollbar-thin">
                {trainingLogs.length === 0 ? (
                  <p className="text-slate-600 italic">No operations triggered. Console idle.</p>
                ) : (
                  trainingLogs.map((log, index) => {
                    const isSuccess = log.includes('[SUCCESS]');
                    return (
                      <p key={index} className={isSuccess ? 'text-emerald-400 font-bold' : ''}>
                        {log}
                      </p>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
