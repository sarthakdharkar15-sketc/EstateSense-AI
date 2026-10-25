import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Compass,
  Activity
} from 'lucide-react';

export default function LocationInsightCard({ locationData, overallAvgRate = 0 }) {
  if (!locationData) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-950/60 h-full flex flex-col items-center justify-center text-center space-y-3">
        <MapPin size={32} className="text-slate-500 animate-bounce" />
        <div className="text-sm font-bold text-slate-300">Select a Location</div>
        <p className="text-xs text-slate-500 max-w-xs">
          Choose a location from the dropdown or click a marker on the map to explore location dynamics.
        </p>
      </div>
    );
  }

  const { name, avgRate, medianRate, count, diffPercent, impactClass, minPriceLakhs, maxPriceLakhs, avgPriceLakhs } = locationData;

  const isAboveAverage = diffPercent >= 0;

  // Impact classification styling
  let impactBadgeColor = "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
  if (impactClass === 'High') {
    impactBadgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
  } else if (impactClass === 'Low') {
    impactBadgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
  }

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-slate-950/80 shadow-2xl backdrop-blur-xl space-y-6 flex flex-col justify-between h-full">
      
      {/* Card Header: Location Name & Impact Badge */}
      <div className="space-y-3 border-b border-white/10 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Building2 size={13} className="text-emerald-400" />
            <span>Selected Location Analysis</span>
          </span>
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono border ${impactBadgeColor}`}>
            {impactClass} Impact Zone
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>{name}</span>
        </h3>
      </div>

      {/* Grid of Key Dataset Metrics (Requirement 3 & 6) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Average Price per Sq.Ft. */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Price / sq.ft.</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            ₹{avgRate.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">Dataset Avg: ₹{overallAvgRate.toLocaleString('en-IN')}</span>
        </div>

        {/* Median Price per Sq.Ft. */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Median Price / sq.ft.</span>
          <div className="text-xl font-extrabold text-indigo-300 font-mono">
            ₹{medianRate.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">Robust Midpoint</span>
        </div>

        {/* Properties in Dataset */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Properties in Dataset</span>
          <div className="text-xl font-extrabold text-slate-100 font-mono">
            {count}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">Sample Size</span>
        </div>

        {/* Relative to Dataset Average */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">vs Dataset Average</span>
          <div className={`text-xl font-extrabold font-mono flex items-center gap-1 ${isAboveAverage ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isAboveAverage ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{isAboveAverage ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`}</span>
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">
            {isAboveAverage ? 'Above Baseline' : 'Below Baseline'}
          </span>
        </div>

      </div>

      {/* Requirement 4: Visually Attractive Explanation Flow */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
          <Sparkles size={12} className="text-emerald-400" />
          <span>How Location Affects Value</span>
        </span>

        {/* Step Flow Diagram */}
        <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl space-y-2">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1 text-[9px] font-mono text-center font-bold">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Location</div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Accessibility</div>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Demand</div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Features</div>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Price/sqft</div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">Est. Value</div>
          </div>

          {/* Dynamic Explanation Text Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
            <p>
              Properties in <strong className="text-white font-bold">{name}</strong> have an average price of{' '}
              <strong className="text-emerald-400 font-mono">₹{avgRate.toLocaleString('en-IN')}/sq.ft.</strong>, which is{' '}
              <strong className={isAboveAverage ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                {Math.abs(diffPercent).toFixed(1)}% {isAboveAverage ? 'above' : 'below'}
              </strong>{' '}
              the overall dataset average (₹{overallAvgRate.toLocaleString('en-IN')}/sq.ft.).
            </p>
            {avgPriceLakhs > 0 && (
              <p className="text-[11px] text-slate-400 pt-1 font-mono">
                Typical property price range in dataset: ₹{minPriceLakhs?.toFixed(1)}L – ₹{maxPriceLakhs?.toFixed(1)}L (Avg: ₹{avgPriceLakhs?.toFixed(1)}L).
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
