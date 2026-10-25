import React from 'react';
import { BookOpen, Target, HelpCircle, ArrowRight, Download } from 'lucide-react';
import { downloadDiagramsReport } from '../services/reportDownloader';

const OBJECTIVES = [
  "Develop an interpretable baseline Hedonic Regression model.",
  "Develop an XGBoost residual-learning corrector model.",
  "Synthesize both models into a unified hybrid architecture.",
  "Extract and incorporate spatial GIS features (latitude, longitude, radial distance).",
  "Perform comparative model benchmark evaluations.",
  "Integrate local and global SHAP Explainable AI explanations.",
  "Develop an interactive web-based prediction dashboard."
];

const RQS = [
  {
    id: "RQ1",
    question: "How does hybrid residual learning compare with standalone statistical and machine learning house price prediction models?",
    context: "Hypothesis: Combining linear baselines with gradient-boosted error residuals yields lower error bounds than OLS or XGBoost in isolation."
  },
  {
    id: "RQ2",
    question: "Does incorporating spatial information (coordinates and radial center distance) improve prediction accuracy?",
    context: "Hypothesis: Distance metrics serve as strong spatial proxies, smoothing local valuation gradients."
  },
  {
    id: "RQ3",
    question: "Can residual learning capture nonlinear structural patterns missed by traditional Hedonic Regression?",
    context: "Hypothesis: XGBoost trees successfully model structural cross-interactions, such as age and density compounding effects."
  },
  {
    id: "RQ4",
    question: "Which features contribute most to individual house price predictions?",
    context: "Hypothesis: Size is dominant, but neighborhood premiums and distance parameters determine local micro-climates."
  }
];

export default function Research() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white tracking-tight">Academic Research & Methodology</h2>
          <p className="text-slate-400 text-sm mt-1">
            University research framework evaluating explainable hybrid pipelines for urban property valuation.
          </p>
        </div>
        <button 
          onClick={downloadDiagramsReport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download size={15} />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Section 1: Research Gap */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-950/10 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <BookOpen size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Research Gap Analysis</h3>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Existing house price prediction frameworks commonly utilize either traditional statistical regression models (like Ordinary Least Squares) or standalone complex machine learning algorithms (such as Random Forests, XGBoost, or deep neural networks).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="p-4 rounded-lg bg-slate-950 border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Traditional Models (OLS)</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Highly interpretable and stable, but fail to capture non-linear relationships or complex spatial interactions between variables.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Machine Learning (XGBoost)</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Captures complex, non-linear patterns and interactions, but functions as a black-box model and is prone to spatial overfitting.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-2">
          Our proposed framework bridges this gap by merging the **Interpretability** of Hedonic baseline priors, the **Nonlinear Learning** capability of tree boosters, **Spatial GIS factors**, and local **SHAP Explainability** into one cohesive pipeline.
        </p>
      </div>

      {/* Section 2: Objectives */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-950/10 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <Target size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Project Objectives</h3>
        </div>

        <ul className="space-y-3">
          {OBJECTIVES.map((obj, index) => (
            <li key={index} className="flex gap-3 text-xs text-slate-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                {index + 1}
              </span>
              <span className="mt-0.5 leading-normal">{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: Research Questions */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-950/10 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <HelpCircle size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Research Questions & Hypotheses</h3>
        </div>

        <div className="space-y-5">
          {RQS.map((rq, index) => (
            <div key={index} className="space-y-2 border-l-2 border-indigo-500/20 pl-4 py-0.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{rq.id}</span>
              <h4 className="text-xs font-bold text-slate-200 leading-snug">{rq.question}</h4>
              <p className="text-[10px] text-slate-500 italic mt-1 leading-normal">
                {rq.context}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
