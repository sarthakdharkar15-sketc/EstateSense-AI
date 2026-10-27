import React, { useState, useEffect } from 'react';
import { crossValidateModel } from '../services/api';
import { analyticsService } from '../services/analyticsService';
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
  Shield,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Download,
  AlertCircle,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function AdminPanel({ uploadedDataset, currentUser }) {
  const dataset = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  const [activeTab, setActiveTab] = useState('revenue');
  
  // Real-Time Analytics & Revenue State
  const [auditLogs, setAuditLogs] = useState(() => analyticsService.getAuditLogs());
  const [revenueData, setRevenueData] = useState(() => analyticsService.getRevenueAnalytics());
  const [activityFilter, setActivityFilter] = useState('ALL');

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

  // Live Audit Update Listener
  useEffect(() => {
    const refreshData = () => {
      setAuditLogs(analyticsService.getAuditLogs());
      setRevenueData(analyticsService.getRevenueAnalytics());
    };

    window.addEventListener('estatesense_audit_update', refreshData);
    const interval = setInterval(refreshData, 4000); // Poll every 4s for fresh data

    return () => {
      window.removeEventListener('estatesense_audit_update', refreshData);
      clearInterval(interval);
    };
  }, []);

  // Load registered users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const registered = JSON.parse(localStorage.getItem('house_predict_users') || '[]');
    const defaultAccounts = [
      { name: 'System Administrator', email: 'admin@estatesense.ai', role: 'Administrator', token: 'mock-jwt-admin' },
      { name: 'Rahul Sharma', email: 'user@estatesense.ai', role: 'User', token: 'mock-jwt-user' }
    ];
    // Combine unique by email
    const all = [...defaultAccounts];
    registered.forEach(r => {
      if (!all.some(a => a.email.toLowerCase() === r.email.toLowerCase())) {
        all.push(r);
      }
    });
    setUsers(all);
  };

  const handleLatencyChange = (e) => {
    const val = parseInt(e.target.value);
    setLatency(val);
    localStorage.setItem('house_predict_latency', val.toString());
  };

  const toggleUserRole = (email) => {
    if (email.toLowerCase() === 'admin@estatesense.ai') return; // Cannot edit superadmin
    const registered = JSON.parse(localStorage.getItem('house_predict_users') || '[]');
    const updated = registered.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, role: u.role === 'Administrator' ? 'User' : 'Administrator' };
      }
      return u;
    });
    localStorage.setItem('house_predict_users', JSON.stringify(updated));
    loadUsers();
  };

  const deleteUser = (email) => {
    if (email.toLowerCase() === 'admin@estatesense.ai') return;
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
      ? [`[INIT] Starting model retraining with ${dataset.length} uploaded records...`]
      : ['[INIT] Fetching default Bengaluru 10,000 dataset...'];
    
    setTrainingLogs(initialLogs);

    const steps = [
      { p: 15, msg: 'Preprocessing spatial & hedonic features...' },
      { p: 35, msg: 'Calibrating OLS baseline coefficient matrices...' },
      { p: 55, msg: 'Executing XGBoost non-linear residual regression (150 trees)...' },
      { p: 75, msg: 'Computing 5-fold cross-validation metrics...' },
      { p: 90, msg: 'Generating updated SHAP global value weights...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setRetrainProgress(steps[currentStep].p);
        setTrainingLogs(l => [...l, `[PROGRESS] ${steps[currentStep].msg}`]);
      } else {
        clearInterval(interval);
        setRetrainProgress(100);
        
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
        setIsRetraining(false);

        // Log this retraining to audit trail
        analyticsService.logEvent({
          user: currentUser,
          type: 'ADMIN',
          action: 'ML Model Retraining Executed',
          details: `Model updated: R²=${newStats.r2}, RMSE=₹${newStats.rmse}L (${newStats.epochs} Epochs)`
        });
      }
    }, 500);
  };

  // Filtered Activity Logs
  const filteredLogs = auditLogs.filter(log => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'LOGIN') return log.type === 'LOGIN';
    if (activityFilter === 'DATASET') return log.type === 'DATASET';
    if (activityFilter === 'PREDICTION') return log.type === 'PREDICTION';
    if (activityFilter === 'REVENUE') return (log.revenue || 0) > 0;
    return true;
  });

  // Export audit trail to CSV
  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'User Name', 'User Email', 'Role', 'Event Type', 'Action', 'Details', 'Revenue (INR)', 'Status'];
    const rows = auditLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.userName || ''}"`,
      `"${l.userEmail || ''}"`,
      `"${l.role || ''}"`,
      `"${l.type || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.revenue || 0,
      `"${l.status || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EstateSense_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield size={13} className="text-emerald-400" />
            <span>Executive Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Administrator Portal
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-light">
            Live telemetry monitoring user sessions, dataset usage, real-time platform revenue monetization, and MLOps retraining pipelines.
          </p>
        </div>

        {/* Live System Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-emerald-300">Live Telemetry Connected</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-6 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'revenue' 
              ? 'text-emerald-400 border-b-2 border-emerald-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign size={15} />
          <span>Platform Revenue & Monetization</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={15} />
          <span>Live User & Dataset Audit ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={15} />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mlops')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'mlops' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={15} />
          <span>MLOps Retraining</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={15} />
          <span>Simulation Settings</span>
        </button>
      </div>

      {/* TAB 1: PLATFORM REVENUE & MONETIZATION */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          
          {/* Top Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Gross Revenue */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-950 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  ₹{revenueData.totalRevenue.toLocaleString('en-IN')}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
                  <TrendingUp size={13} />
                  <span>+24.6% vs last cycle</span>
                </div>
              </div>
            </div>

            {/* Today's Earnings */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/40 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  ₹{revenueData.todayRevenue.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  From live user API calls & PDF exports
                </p>
              </div>
            </div>

            {/* Total Paid Transactions */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/40 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Transactions</span>
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <Zap size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  {revenueData.totalTransactions.toLocaleString()}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Average ₹{revenueData.avgTransactionValue.toFixed(2)} / query
                </p>
              </div>
            </div>

            {/* Active Subscribed Entities */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/40 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Broker / Enterprise Tiers</span>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  42 Entities
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  ₹4,999 / mo Enterprise API access
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Streams Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">API Predictions (₹49/call)</span>
              <p className="text-lg font-bold text-emerald-300 font-mono">
                ₹{revenueData.breakdown.predictions.toLocaleString('en-IN')}
              </p>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-400 h-full w-[22%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Spatial GIS Scans (₹99/call)</span>
              <p className="text-lg font-bold text-indigo-300 font-mono">
                ₹{revenueData.breakdown.spatial.toLocaleString('en-IN')}
              </p>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-400 h-full w-[14%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">PDF Certificates (₹199/pdf)</span>
              <p className="text-lg font-bold text-cyan-300 font-mono">
                ₹{revenueData.breakdown.reports.toLocaleString('en-IN')}
              </p>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-cyan-400 h-full w-[18%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Enterprise Retainers</span>
              <p className="text-lg font-bold text-purple-300 font-mono">
                ₹{revenueData.breakdown.subscriptions.toLocaleString('en-IN')}
              </p>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-purple-400 h-full w-[46%]" />
              </div>
            </div>
          </div>

          {/* Recent Revenue Transactions Table */}
          <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950/40 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/30">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Real-Time Monetization Transaction Stream</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-light">
                  Direct live ledger of fees collected from user valuation queries, GIS deep scans, and reports.
                </p>
              </div>

              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
                Live Ledger Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Service / Action</th>
                    <th className="px-5 py-3">Details</th>
                    <th className="px-5 py-3 text-right">Fee Accrued</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {revenueData.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                        No transactions recorded yet. Run a prediction to see live billing!
                      </td>
                    </tr>
                  ) : (
                    revenueData.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-5 py-3.5 font-sans font-semibold text-white whitespace-nowrap">
                          {tx.userName}
                          <span className="block text-[10px] text-slate-500 font-mono font-normal">{tx.userEmail}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                            {tx.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-sans text-slate-300 text-xs max-w-xs truncate">
                          {tx.details}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                          +₹{tx.revenue}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Settled
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE USER ACTIVITY & DATASET TELEMETRY AUDIT */}
      {activeTab === 'activity' && (
        <div className="space-y-4 sm:space-y-6">
          
          {/* Controls Bar: Filter Chips & Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/10 bg-slate-950/60">
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter size={12} />
                <span>Filter:</span>
              </span>

              {['ALL', 'LOGIN', 'DATASET', 'PREDICTION', 'REVENUE'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setActivityFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activityFilter === tag
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tag === 'ALL' ? 'All Activities' : tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportAuditCSV}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export Audit CSV</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Clear all audit activity logs?")) {
                    analyticsService.clearAllLogs();
                  }
                }}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                title="Clear audit trail"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Live Activity Stream Table */}
          <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950/40 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 bg-slate-950/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" />
                  <span>Real-Time Audit Trail ({filteredLogs.length} Events)</span>
                </h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  Logged entries include User Logins, Custom Dataset Actions, Predictions, and Exports.
                </p>
              </div>

              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                Auto-updates every 4s
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">User & Role</th>
                    <th className="px-5 py-3">Event Category</th>
                    <th className="px-5 py-3">Action Performed</th>
                    <th className="px-5 py-3">Dataset / Query Details</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                        No activity found for selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isLogin = log.type === 'LOGIN';
                      const isDataset = log.type === 'DATASET';
                      const isPrediction = log.type === 'PREDICTION';
                      const isReport = log.type === 'REPORT';

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            <span className="block text-[9px] text-slate-600 font-mono">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                                {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-semibold text-white text-xs block">{log.userName}</span>
                                <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                                  log.role === 'Administrator' 
                                    ? 'bg-indigo-500/20 text-indigo-300' 
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {log.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isLogin ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                              isDataset ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                              isPrediction ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                              isReport ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                              'bg-white/5 text-slate-300 border-white/10'
                            }`}>
                              {log.type}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-slate-200 whitespace-nowrap">
                            {log.action}
                          </td>

                          <td className="px-5 py-3.5 text-slate-300 text-xs font-mono">
                            {log.details}
                          </td>

                          <td className="px-5 py-3.5 text-right font-mono font-bold whitespace-nowrap">
                            {log.revenue > 0 ? (
                              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                +₹{log.revenue}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950/40 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Registered Accounts & Access Control</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Toggle Administrator privilege or remove user access.</p>
            </div>
            <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-bold font-mono">
              {users.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/40">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-right">Permission Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {users.map(u => {
                  const isSuperAdmin = u.email.toLowerCase() === 'admin@estatesense.ai';
                  const isAdmin = u.role === 'Administrator';

                  return (
                    <tr key={u.email} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {u.name}
                        {isSuperAdmin && (
                          <span className="ml-2 text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                            SUPERADMIN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border ${
                          isAdmin 
                            ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/25' 
                            : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/25'
                        }`}>
                          {u.role || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleUserRole(u.email)}
                            disabled={isSuperAdmin}
                            title="Toggle Admin / User role"
                            className="p-1.5 rounded-lg border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-600/10 text-slate-400 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <UserCheck size={14} />
                          </button>
                          <button
                            onClick={() => deleteUser(u.email)}
                            disabled={isSuperAdmin}
                            title="Delete user"
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
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

      {/* TAB 4: MLOPS RETRAINING */}
      {activeTab === 'mlops' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Retraining Controls */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cpu size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Model Evaluation Metrics</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-light">Parameters computed during last model iteration.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">R² Coefficient</span>
                <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{(modelStats.r2 * 100).toFixed(2)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">RMSE (Error Rate)</span>
                <p className="text-xl font-bold text-white mt-1 font-mono">₹{modelStats.rmse}L</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">MAE (Avg Deviation)</span>
                <p className="text-xl font-bold text-white mt-1 font-mono">₹{modelStats.mae}L</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Training Epochs</span>
                <p className="text-xl font-bold text-white mt-1 font-mono">{modelStats.epochs}</p>
              </div>
            </div>

            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 hover:shadow-indigo-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {isRetraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Retraining ML Pipeline... {retrainProgress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Trigger Hybrid Model Retraining</span>
                </>
              )}
            </button>
          </div>

          {/* Training Console */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 flex flex-col h-[400px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isRetraining ? 'bg-emerald-400 animate-ping' : 'bg-indigo-500'}`} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pipeline Output Console</h3>
              </div>
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${isRetraining ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                {isRetraining ? 'ACTIVE RETRAINING' : 'IDLE READY'}
              </span>
            </div>

            {/* Progress bar */}
            {isRetraining && (
              <div className="w-full bg-slate-950 border border-white/5 h-2 rounded-full mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${retrainProgress}%` }}
                />
              </div>
            )}

            {/* Terminal Logs container */}
            <div className="flex-1 bg-slate-950/90 rounded-xl border border-white/5 p-4 font-mono text-[10.5px] text-indigo-300 overflow-y-auto space-y-2 select-text scrollbar-thin">
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

      {/* TAB 5: SIMULATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Latency card */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Gauge size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">API Latency Simulation</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-light">Control mock database query and model evaluation delay times.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-semibold uppercase">Response Latency</span>
                <span className="text-xl font-bold text-indigo-400 font-mono">{latency} ms</span>
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

              <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                <span>100ms (Immediate)</span>
                <span>2.5s (Simulated Network)</span>
                <span>5.0s (Slow Connection)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-xs text-slate-400 leading-normal">
              <Server size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <p>
                This value overrides default internal timers. Changing this slider instantly impacts predictions, searches, and page loading latency across all tabs.
              </p>
            </div>
          </div>

          {/* Status card */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Emulator System Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">FastAPI Model Server</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wide border border-emerald-500/20">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Spatial GIS Engine</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wide border border-emerald-500/20">Ready</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Authentication & RBAC</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-[9px] uppercase tracking-wide border border-indigo-500/20">Enforced</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-400">Active Database Source</span>
                  <span className="font-semibold text-slate-200 font-mono text-xs">
                    {dataset.length > 0 
                      ? `${dataset.length} rows (Custom CSV)` 
                      : "10,000 records (Bengaluru Master)"
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
              <Zap size={13} className="text-emerald-400" />
              <span>Telemetry running fully in local browser memory.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
