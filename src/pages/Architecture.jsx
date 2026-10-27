import React from 'react';
import { ArrowDown, Cpu, Network, ShieldCheck, Database, Compass, CheckCircle, Download } from 'lucide-react';
import { downloadDiagramsReport } from '../services/reportDownloader';

const STEPS = [
  {
    id: "01",
    title: "Property Dataset",
    description: "Multi-sourced residential transactions record including physical sizes, structures, and timestamps.",
    details: "Inputs: Area, BHK, Bath, Age, Floor Index, Parking Slots.",
    icon: Database
  },
  {
    id: "02",
    title: "Data Preprocessing",
    description: "Outlier filtering using Isolation Forest, missing value imputation, and categorical label coding.",
    details: "Actions: Log-scaling of area sizes, normalizations, and scaling.",
    icon: Compass
  },
  {
    id: "03",
    title: "Feature Engineering",
    description: "Creating structural density factors, room-size ratios, and age-depreciation brackets.",
    details: "Features: Area-per-bed, age-squared, bath-to-bed ratios.",
    icon: Cpu
  },
  {
    id: "04",
    title: "Spatial Feature Extraction",
    description: "Extracting geographical coordinates and calculating distance boundaries from the commercial center.",
    details: "Variables: Lat/Lng centroids, Radial Distance to MG Road (km).",
    icon: Network
  },
  {
    id: "05",
    title: "Hedonic Regression (OLS)",
    description: "Training a linear Ordinary Least Squares (OLS) estimator to fit standard macroeconomic pricing parameters.",
    details: "Baseline: Predicts global linear price prior based on size/location.",
    formula: "P_linear = β_0 + Σ(β_i * X_i) + ε",
    icon: ShieldCheck
  },
  {
    id: "06",
    title: "Residual Calculation",
    description: "Extracting the unexplained pricing variance (errors) from the linear baseline model.",
    details: "Goal: Identifies nonlinear pricing patterns missed by regression.",
    formula: "Residual = Actual Price - P_linear",
    highlight: true,
    icon: Cpu
  },
  {
    id: "07",
    title: "XGBoost Residual Learner",
    description: "Training an Extreme Gradient Boosting regressor on the linear residuals using spatial and non-linear interactions.",
    details: "Objective: Fits structural noise and spatial coordinates.",
    formula: "Res_pred = XGBoost(X_spatial, X_structural)",
    icon: Network
  },
  {
    id: "08",
    title: "Hybrid Prediction Synthesis",
    description: "Combining the linear baseline regression prediction with the nonlinear residual correction factor.",
    details: "Outcome: Stabilized general trends + localized corrections.",
    formula: "P_final = P_linear + Res_pred",
    highlight: true,
    icon: ShieldCheck
  },
  {
    id: "09",
    title: "SHAP Explainability",
    description: "Applying Shapley additive explanations (SHAP) to decompose local feature weights for model transparency.",
    details: "Logic: Assigns positive/negative price credits to inputs.",
    formula: "Φ_i(x) = Σ [MC_i(S)] / M",
    icon: Compass
  },
  {
    id: "10",
    title: "Final Explainable Prediction",
    description: "Generating highly accurate property valuation estimations backed by local mathematical explanations.",
    details: "Delivery: Output Price + Conf. Interval + SHAP plots.",
    icon: CheckCircle
  }
];

export default function Architecture() {
  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white tracking-tight">Proposed Hybrid Model Architecture</h2>
          <p className="text-slate-400 text-sm mt-1">
            A dual-stage model chaining Hedonic Regression and Extreme Gradient Boosting for transparent, accurate property predictions.
          </p>
        </div>
        <button 
          onClick={downloadDiagramsReport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download size={15} />
          <span>Download Report (MD)</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Theoretical Rationale</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard ML models (like XGBoost or Neural Networks) yield high predictive accuracy but act as &ldquo;black boxes&rdquo; and can overfit small sample areas. On the other hand, traditional Hedonic pricing models (OLS) are stable and fully interpretable but fail to capture nonlinear attributes (like the compounding effect of property age and density) or spatial micro-climates.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
            Our framework solves this gap using **Residual Learning**: the linear OLS model acts as a reliable structural prior, while a tree-boosted XGBoost corrector models the remaining spatial and structural error residuals.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Mathematical Formulations</h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Stage 1: Linear Prior</span>
              <p className="text-slate-200 mt-1">y_base = &beta;_0 + &sum; &beta;_j x_j</p>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Stage 2: ML Residual Tuning</span>
              <p className="text-indigo-400 mt-1">r_i = y_actual - y_base</p>
              <p className="text-slate-400 mt-0.5">y_residual = XGBoostRegressor(x)</p>
            </div>
            <div className="p-2.5 rounded bg-indigo-600/10 border border-indigo-500/20">
              <span className="text-[10px] text-indigo-400 uppercase block font-sans">Stage 3: Hybrid Aggregation</span>
              <p className="text-white mt-1">y_final = y_base + y_residual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline/Flowchart */}
      <div className="relative max-w-2xl mx-auto py-4 space-y-6">
        {/* Central timeline line */}
        <div className="absolute left-[34px] top-4 bottom-4 w-[2px] bg-slate-800 hidden md:block"></div>

        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          
          return (
            <div key={index} className="relative flex flex-col md:flex-row gap-6 items-start">
              {/* Step indicator circle */}
              <div className="z-10 flex-shrink-0 w-12 h-12 rounded-full border border-white/10 bg-slate-900 shadow-xl flex items-center justify-center text-xs font-bold text-indigo-400 glow-purple">
                {step.id}
              </div>

              {/* Step content card */}
              <div className={`flex-1 w-full glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/10 ${
                step.highlight ? 'border-indigo-500/30 bg-indigo-950/5 shadow-lg shadow-indigo-500/5' : ''
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-200">{step.title}</h3>
                  <StepIcon size={16} className={step.highlight ? 'text-indigo-400' : 'text-slate-500'} />
                </div>
                
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.description}
                </p>
                
                <p className="text-[10px] text-slate-500 mt-1.5 italic font-medium">
                  {step.details}
                </p>

                {step.formula && (
                  <div className="mt-3 py-1.5 px-3 rounded-lg bg-slate-950 border border-white/5 font-mono text-[10px] text-indigo-300 w-fit">
                    {step.formula}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
