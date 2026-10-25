import React from 'react';
import { Monitor, Server, Brain, Eye, Milestone } from 'lucide-react';

const TECHS = [
  {
    category: "Frontend Viewport",
    icon: Monitor,
    color: "text-indigo-400 bg-indigo-600/10 border-indigo-500/20",
    items: ["React.js (v18)", "Vite App Packager", "Tailwind CSS v4", "Recharts Visualizer", "React-Leaflet / Leaflet GIS"]
  },
  {
    category: "ML Compute Engine",
    icon: Brain,
    color: "text-purple-400 bg-purple-600/10 border-purple-500/20",
    items: ["Scikit-learn (Linear Regression)", "XGBoost Regressor", "Pandas DataFrame", "NumPy Numerical Arrays"]
  },
  {
    category: "Explainable AI (XAI)",
    icon: Eye,
    color: "text-pink-400 bg-pink-600/10 border-pink-500/20",
    items: ["SHAP (SHapley Additive exPlanations)", "Kernel & Tree Explainer wrappers", "Local force layout parameters", "Global summary projections"]
  },
  {
    category: "Backend Services",
    icon: Server,
    color: "text-emerald-400 bg-emerald-600/10 border-emerald-500/20",
    items: ["Python 3.10+", "FastAPI (Async endpoints)", "Uvicorn ASGI runner", "CORS policy validation"]
  }
];

export default function About() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col text-center py-6">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">House Price Prediction Project</h2>
        <p className="text-indigo-400 text-sm font-semibold tracking-wider uppercase mt-1.5">
          Explainable Hybrid Machine Learning Framework
        </p>
      </div>

      {/* Main Contribution Statement */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Proposed Contribution</h3>
        
        <blockquote className="text-sm font-medium text-slate-200 italic leading-relaxed">
          &ldquo;An explainable hybrid framework combining Hedonic Regression with nonlinear residual learning and spatial features for house price prediction.&rdquo;
        </blockquote>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          This system proposes a dual-stage architecture where linear macroeconomic coefficients are modeled via Ordinary Least Squares regression, and complex structural/geographical errors are corrected via XGBoost trees. This method preserves linear regression baseline interpretability while matching the accuracy of fully black-box model variants.
        </p>
      </div>

      {/* Project Metadata Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Project Type</span>
          <span className="text-xs font-bold text-slate-200 mt-1 block">University Minor / Research Project</span>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Target Domain</span>
          <span className="text-xs font-bold text-slate-200 mt-1 block">Urban Real-Estate GIS Forecasting</span>
        </div>
      </div>

      {/* Tech Stack Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Milestone size={14} className="text-indigo-400" />
          Technology stack details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECHS.map((tech, idx) => {
            const TechIcon = tech.icon;
            
            return (
              <div 
                key={idx} 
                className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/10 space-y-4"
              >
                {/* Header item */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${tech.color}`}>
                    <TechIcon size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{tech.category}</h4>
                </div>

                {/* Bullet items list */}
                <ul className="space-y-2 text-[11px] text-slate-400 pl-1 font-medium">
                  {tech.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
