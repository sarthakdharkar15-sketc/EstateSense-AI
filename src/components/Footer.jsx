import React from 'react';
import { 
  Building2, 
  Cpu, 
  LayoutDashboard, 
  Scale, 
  Map, 
  Fingerprint, 
  Database, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  Activity
} from 'lucide-react';

export default function Footer({ setCurrentPage, uploadedDataset }) {
  const isCustomActive = Array.isArray(uploadedDataset) && uploadedDataset.length > 0;

  return (
    <footer className="w-full bg-[#08080a]/80 backdrop-blur-2xl border-t border-white/[0.08] text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => setCurrentPage && setCurrentPage('home')}
              className="flex items-center gap-3 cursor-pointer group w-fit ios-pressable"
            >
              <img src="/logo.png" alt="EstateSense AI Logo" className="h-9 w-auto object-contain brightness-110 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">EstateSense AI</h3>
                <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Hybrid Valuation Engine</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Hedonic Linear Regression + XGBoost Non-Linear Residual Corrector architecture for accurate, explainable property valuation.
            </p>

            {/* Live Model Status Badge in iOS Capsule */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Model v2.4 Active • {isCustomActive ? `Custom DB (${uploadedDataset.length} rows)` : 'Baseline Loaded'}</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Core Modules</span>
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('home')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Home / Overview</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('predict')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold"
                >
                  <Cpu size={12} className="text-indigo-400" />
                  <span>Predict Price</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('dashboard')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard size={12} className="text-slate-500" />
                  <span>Research Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('compare')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale size={12} className="text-slate-500" />
                  <span>Compare Properties</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Analytics & Explainability */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity size={13} className="text-indigo-400" />
              <span>Analytics & GIS</span>
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('spatial')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Map size={12} className="text-slate-500" />
                  <span>Spatial GIS Intelligence</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('explainable')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Fingerprint size={12} className="text-slate-500" />
                  <span>Explainable AI (SHAP)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('dataset')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Database size={12} className="text-slate-500" />
                  <span>Dataset Explorer</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('architecture')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Model Architecture</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Key Features & ML Specs */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">ML Tech Specs</h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Hedonic Base Rates</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>XGBoost Non-Linear Corrector</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>SHAP Waterfall Interpretation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Interactive Leaflet Map</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} EstateSense AI. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <button 
              onClick={() => setCurrentPage && setCurrentPage('research')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileText size={12} />
              <span>Research Whitepaper</span>
            </button>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>FastAPI Simulation</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
