import React, { useState } from 'react';
import { Fingerprint, Info, ShieldCheck, Sparkles } from 'lucide-react';

const SCENARIOS = [
  {
    id: "scen-01",
    name: "Luxury Indiranagar Penthouse",
    description: "Large super area on high floor index, fully furnished, premium center locality.",
    baseValue: 55.0,
    finalValue: 124.5,
    shaps: [
      { feature: "Property Area (sq.ft.)", val: 32.40, reason: "Area of 2,800 sqft is far above the dataset median of 1,500 sqft." },
      { feature: "Location (Indiranagar)", val: 18.50, reason: "Indiranagar commands a premium base rate multiplier." },
      { feature: "Furnishing Status", val: 8.50, reason: "Fully furnished status adds capital asset premiums." },
      { feature: "Bedrooms Count (4 BHK)", val: 7.20, reason: "Extra luxury suite bedrooms increase OLS structural weights." },
      { feature: "Floor Index (15th)", val: 4.80, reason: "Higher level positioning captures positive landscape valuation." },
      { feature: "Property Age (2 years)", val: -1.90, reason: "Slight depreciation due to early years of occupancy." }
    ],
    summary: "The price is heavily driven upwards by the massive area (+₹32.4L) and premium Indiranagar location (+₹18.5L). Minimal negative depreciation applies because of its new construction age."
  },
  {
    id: "scen-02",
    name: "Old Suburban Whitefield Villa",
    description: "Large land plot with aging building structure, situated in secondary tech belt.",
    baseValue: 55.0,
    finalValue: 62.8,
    shaps: [
      { feature: "Property Area (sq.ft.)", val: 24.10, reason: "Extensive Villa size (3,200 sqft) adds structural base value." },
      { feature: "Distance from Center (17.5 km)", val: -11.20, reason: "Suburban location penalizes general commute accessibility." },
      { feature: "Property Age (18 years)", val: -9.80, reason: "Heavy age depreciation on building materials." },
      { feature: "Location (Whitefield)", val: -3.50, reason: "Whitefield has lower relative unit rate bounds than core center." },
      { feature: "Bedrooms Count (3 BHK)", val: 5.20, reason: "BHK layout conforms to comfortable family structures." },
      { feature: "ML Non-linear Interaction", val: 3.00, reason: "XGBoost captures residual land-value appreciation." }
    ],
    summary: "While the large structural size adds strong positive value (+₹24.1L), the long distance to the city core (-₹11.2L) and heavy age depreciation (-₹9.8L) suppress the final market price."
  },
  {
    id: "scen-03",
    name: "HSR Layout Budget Apartment",
    description: "Compact 1 BHK unfurnished flat with excellent road access.",
    baseValue: 55.0,
    finalValue: 41.5,
    shaps: [
      { feature: "Property Area (sq.ft.)", val: -12.40, reason: "Compact size of 850 sqft is below the baseline mean." },
      { feature: "Bedrooms Count (1 BHK)", val: -4.50, reason: "Single bedroom layout represents minimal structural capacity." },
      { feature: "Furnishing Status (Unfurnished)", val: -3.00, reason: "Lack of furnishings demands buyer fit-out capital." },
      { feature: "Location (HSR Layout)", val: 4.80, reason: "HSR Layout represents a highly desirable commercial startup hub." },
      { feature: "Distance from Center (8.5 km)", val: 1.60, reason: "Favorable proximity to workplace corridors." }
    ],
    summary: "Its compact size (-₹12.4L) and single bedroom layout scale the valuation below the dataset base value, though its location inside HSR Layout provides a minor buffer (+₹4.8L)."
  }
];

export default function ExplainableAI() {
  const [selectedScen, setSelectedScen] = useState(SCENARIOS[0]);
  const [explainMode, setExplainMode] = useState('technical'); // 'technical' | 'simple' | 'eli5'

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white tracking-tight">Model Interpretability (SHAP)</h2>
          <p className="text-slate-400 text-sm mt-1">
            SHAP (Shapley Additive exPlanations) attribute contributions show how each input shifts predictions from the baseline.
          </p>
        </div>

        {/* Explanation Mode Toggle Switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl shrink-0">
          {[
            { id: 'technical', label: 'Technical' },
            { id: 'simple', label: 'Simple' },
            { id: 'eli5', label: 'Explain Like I\'m 5 👶' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setExplainMode(mode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                explainMode === mode.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* SHAP Concept Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20 md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Shapley Values & AI Transparency</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In standard machine learning, algorithms compute highly accurate outputs by forming billions of tree splits or tensor activations. However, this creates a **black box** where it is impossible to explain *why* a specific property valuation was generated.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            **SHAP** solves this by applying game theory to machine learning. It models features as players in a cooperative coalition, where each feature's contribution represents its marginal effect on the output. By mapping these additive credits, we achieve complete prediction-level explainability:
          </p>
          <div className="font-mono text-[10px] py-2 px-3 bg-slate-950 border border-white/5 rounded-lg text-slate-300 w-fit">
            Prediction (f(x)) = Base Value (E[f(x)]) + &sum; SHAP_Feature_i
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-400" size={16} />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Features Explained</h4>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-400">
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Global base rates</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Structural size effects</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Spatial distance degradation</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Non-linear boosting residuals</li>
          </ul>
        </div>
      </div>

      {/* Interactive Scenario Section */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-950/20 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Interactive SHAP Playground</h3>
          <p className="text-[11px] text-slate-500 mt-1">Select a pre-trained property profile to inspect local feature attribution values.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-3">
          {SCENARIOS.map(scen => (
            <button
              key={scen.id}
              onClick={() => setSelectedScen(scen)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedScen.id === scen.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {scen.name}
            </button>
          ))}
        </div>

        {/* Selected Scenario details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Metadata & Description (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Property Profile</span>
                <h4 className="text-sm font-bold text-slate-200 mt-0.5">{selectedScen.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedScen.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Baseline Expectation</span>
                  <span className="text-sm font-mono font-bold text-slate-300">₹{selectedScen.baseValue.toFixed(1)}L</span>
                </div>
                <div>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase block">Predicted Value</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">₹{selectedScen.finalValue.toFixed(1)}L</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/10 flex gap-2">
              <Sparkles className="text-indigo-400 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-slate-400 leading-normal">
                {selectedScen.summary}
              </p>
            </div>
          </div>

          {/* Right: SHAP Bar Chart Waterfall / Simple / ELI5 View (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {explainMode === 'technical' && 'Technical SHAP Attribution Breakdown'}
              {explainMode === 'simple' && 'Simple Plain-Language Explanation'}
              {explainMode === 'eli5' && 'Explain Like I\'m 5 Mode 👶'}
            </h4>
            
            {explainMode === 'technical' && (
              <div className="space-y-3">
                {selectedScen.shaps.map((shap, index) => {
                  const isPositive = shap.val >= 0;
                  const absVal = Math.abs(shap.val);
                  const widthPct = Math.min(100, (absVal / 35) * 100);

                  return (
                    <div key={index} className="space-y-1 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                          {shap.feature}
                        </span>
                        <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : '-'}${(absVal).toFixed(2)} Lakhs
                        </span>
                      </div>

                      <div className="h-6 flex items-center relative">
                        <div className="absolute left-1/2 h-full w-[1px] bg-slate-800 z-10"></div>
                        
                        {isPositive ? (
                          <div className="absolute left-1/2 h-full flex items-center" style={{ width: `${widthPct / 2}%` }}>
                            <div className="h-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-r text-[8px] font-bold text-emerald-400 flex items-center px-1.5 whitespace-nowrap overflow-hidden">
                              +{absVal.toFixed(1)}L
                            </div>
                          </div>
                        ) : (
                          <div className="absolute right-1/2 h-full flex items-center justify-end" style={{ width: `${widthPct / 2}%` }}>
                            <div className="h-3.5 bg-rose-500/15 border border-rose-500/35 rounded-l text-[8px] font-bold text-rose-400 flex items-center px-1.5 whitespace-nowrap overflow-hidden">
                              -{absVal.toFixed(1)}L
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-[9px] text-slate-500 pl-2 border-l border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                        {shap.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {explainMode === 'simple' && (
              <div className="space-y-3 font-sans text-xs">
                {selectedScen.shaps.map((shap, index) => {
                  const isPositive = shap.val >= 0;
                  return (
                    <div key={index} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200">{shap.feature}</span>
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? 'Increases Value (+₹' : 'Reduces Value (-₹'}{Math.abs(shap.val).toFixed(1)}L)
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{shap.reason}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {explainMode === 'eli5' && (
              <div className="space-y-3 font-sans text-xs">
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
                  <p className="font-bold text-indigo-300">How the AI thinks about this house:</p>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-base">🏠</span>
                      <span><strong>Bigger house = more space</strong>, so the model estimates a higher value.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base">📍</span>
                      <span><strong>Better location = higher estimated value</strong> because people want to live close to city centers!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base">🛋️</span>
                      <span><strong>Fully furnished = ready to live in</strong>, which adds extra value strength.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-base">🕐</span>
                      <span><strong>Older property = may reduce value</strong> over time due to building wear.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-2 text-[10px] text-slate-500 items-center pt-2">
              <Info size={12} className="text-slate-600 flex-shrink-0" />
              <span>SHAP metrics show isolated feature attribution values for a single prediction and do not imply market-wide causality.</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
