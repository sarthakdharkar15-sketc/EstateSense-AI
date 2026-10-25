import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Label,
  BarChart, Bar, Legend
} from 'recharts';
import { 
  Database, IndianRupee, Trophy, Percent, Milestone, HelpCircle,
  Building2, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Dashboard({ onNavigateToPredict, uploadedDataset }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDashboardPropId, setSelectedDashboardPropId] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const perfData = await apiService.getModelPerformance(uploadedDataset);
        const dataSummary = await apiService.getDatasetSummary("", 1, 100000, uploadedDataset);
        
        setMetrics({
          performance: perfData.comparison,
          importance: perfData.globalFeatureImportance,
          properties: dataSummary.properties,
          stats: dataSummary.stats
        });

        if (Array.isArray(uploadedDataset) && uploadedDataset.length > 0) {
          setSelectedDashboardPropId(uploadedDataset[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [uploadedDataset]);

  // Calculate dynamic Price Distribution histogram based on actual dataset price range
  const priceDistData = useMemo(() => {
    if (!metrics || !metrics.properties || metrics.properties.length === 0) return [];
    
    const prices = metrics.properties.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
    if (prices.length === 0) return [];

    const minP = Math.floor(Math.min(...prices));
    const maxP = Math.ceil(Math.max(...prices));
    
    if (minP === maxP) {
      return [{ range: `₹${minP}L`, properties: prices.length }];
    }

    const numBins = 6;
    const binSize = (maxP - minP) / numBins;
    const bins = Array(numBins).fill(0).map((_, i) => {
      const lower = Math.round(minP + i * binSize);
      const upper = Math.round(minP + (i + 1) * binSize);
      return {
        range: `₹${lower}-${upper}L`,
        properties: 0
      };
    });

    prices.forEach(p => {
      let binIdx = Math.floor((p - minP) / binSize);
      if (binIdx >= numBins) binIdx = numBins - 1;
      if (binIdx < 0) binIdx = 0;
      bins[binIdx].properties++;
    });

    return bins;
  }, [metrics]);

  // Scatter data (Memoized & capped at 1,000 points to prevent SVG rendering lag)
  const scatterData = useMemo(() => {
    if (!metrics || !metrics.properties) return [];
    let dataPoints = metrics.properties;
    if (dataPoints.length > 1000) {
      const step = Math.ceil(dataPoints.length / 1000);
      const sampled = [];
      for (let i = 0; i < dataPoints.length; i += step) {
        sampled.push(dataPoints[i]);
      }
      dataPoints = sampled;
    }
    return dataPoints.map(p => ({
      area: p.area,
      price: p.price,
      location: p.location
    }));
  }, [metrics]);

  // Model comparison bar data (Memoized)
  const modelBarData = useMemo(() => {
    if (!metrics || !metrics.performance) return [];
    return metrics.performance.map(m => ({
      name: m.model ? m.model.split(" (")[0] : '', // Short name
      MAE: parseFloat(m.mae),
      RMSE: parseFloat(m.rmse),
      R2: parseFloat(m.r2)
    }));
  }, [metrics]);

  if (loading || !metrics) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-white/5 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl border border-white/5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-xl border border-white/5"></div>
          <div className="h-80 bg-white/5 rounded-xl border border-white/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Intro Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">House Price Prediction</h2>
          <p className="text-slate-400 text-sm mt-1">
            Explainable Hybrid Machine Learning (Hedonic OLS + XGBoost Residuals)
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onNavigateToPredict}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Predict New House Price
          </button>
        </div>
      </div>

      {/* Warning/Disclaimer bar */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs ${
        uploadedDataset && uploadedDataset.length > 0
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
          : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
      }`}>
        <HelpCircle size={16} className="flex-shrink-0" />
        <p>
          {uploadedDataset && uploadedDataset.length > 0 ? (
            <>
              <strong>Custom Model Active:</strong> Dashboard updated automatically derived from your uploaded dataset of <strong>{uploadedDataset.length} properties</strong>.
            </>
          ) : (
            <>
              <strong>Research Integrity Check:</strong> The metrics below represent pre-trained test baseline evaluations and property simulations. All values are labeled as <strong>DEMO DATA</strong>.
            </>
          )}
        </p>
      </div>

      {/* Active Dataset Trained Model Quick Action */}
      {Array.isArray(uploadedDataset) && uploadedDataset.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-950/60 to-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Custom Model Trained ({uploadedDataset.length} Properties)</h4>
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  ML Pipeline Fitted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                The ML model has been trained on your custom dataset. Use the single property prediction form to evaluate any property.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToPredict}
            className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Predict Property Price</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      {(() => {
        const isCustom = Array.isArray(uploadedDataset) && uploadedDataset.length > 0;
        const tagText = isCustom ? "Active DB" : "Demo";
        const bestModelMetrics = metrics.performance[metrics.performance.length - 1] || {
          model: "Hybrid XGBoost",
          r2: "92.3%",
          rmse: "3.92"
        };

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1 */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Properties</span>
                <Database className="text-indigo-400" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {metrics.stats.totalRecords.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold px-1.5 py-0.5 rounded bg-white/5">
                  {isCustom ? "Custom" : "Dataset"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {isCustom ? "Loaded from CSV upload" : "Mapped from registries"}
              </p>
            </div>

            {/* KPI 2 */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Price</span>
                <IndianRupee className="text-indigo-400" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  ₹{metrics.stats.avgPrice}L
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">
                  {tagText}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Average of {metrics.stats.demoRecords} {isCustom ? "uploaded rows" : "simulation rows"}
              </p>
            </div>

            {/* KPI 3 */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Model</span>
                <Trophy className="text-indigo-400" size={18} />
              </div>
              <div className="mt-4">
                <span className="text-[13px] font-bold tracking-tight text-white block truncate">
                  {bestModelMetrics.model}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">baseline corrected</p>
            </div>

            {/* KPI 4 */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model R²</span>
                <Percent className="text-indigo-400" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {bestModelMetrics.r2}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">
                  {tagText}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Variance explained</p>
            </div>

            {/* KPI 5 */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RMSE</span>
                <Milestone className="text-indigo-400" size={18} />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  ₹{bestModelMetrics.rmse}L
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">
                  {tagText}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Error margin on residual</p>
            </div>
          </div>
        );
      })()}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Price Distribution */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Price Distribution (Simulation)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="range" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }} 
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="properties" name="Properties" stroke="#6366f1" fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Price vs Area */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Price vs Property Area</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" dataKey="area" name="Area" unit=" sqft" stroke="#666" fontSize={11} />
                <YAxis type="number" dataKey="price" name="Price" unit="L" stroke="#666" fontSize={11} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value, name) => [value, name === 'price' ? 'Price (₹ Lakhs)' : 'Area (sqft)']}
                />
                <Scatter name="Properties" data={scatterData} fill="#818cf8" shape="circle" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Model Performance Comparison */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Model Performance (MAE vs RMSE)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} interval={0} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Bar dataKey="MAE" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Global SHAP Feature Importance */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Global Feature Importance (SHAP)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metrics.importance}
                margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={9} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  itemStyle={{ color: '#a78bfa', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Importance']}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
