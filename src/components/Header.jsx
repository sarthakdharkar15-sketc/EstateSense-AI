import React, { useState } from 'react';
import { 
  Menu, 
  Home,
  BookOpen, 
  AlertCircle, 
  LogOut, 
  ChevronDown,
  LayoutDashboard, 
  Cpu, 
  Map, 
  Workflow, 
  BarChart3, 
  Fingerprint, 
  Database, 
  FlaskConical, 
  Shield,
  Info,
  FileText
} from 'lucide-react';

const PAGE_NAMES = {
  home: 'Project Overview & Methodology',
  dashboard: 'Research Dashboard',
  predict: 'Interactive Price Predictor',
  spatial: 'Spatial Intelligence & GIS Map',
  architecture: 'Hybrid Model Pipeline',
  performance: 'Evaluation & Benchmarks',
  explainable: 'Model Interpretability (SHAP)',
  dataset: 'Dataset Schema & Explorer',
  experiments: 'Training Logs & Experiments',
  research: 'Academic Outline',
  admin: 'Admin Panel'
};

const PRIMARY_ITEMS = [
  { id: 'home', name: 'Home', icon: Home },
  { id: 'predict', name: 'Predict Price', icon: Cpu },
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'performance', name: 'Model Performance', icon: BarChart3 }
];

const DROPDOWN_ITEMS = [
  { id: 'spatial', name: 'Spatial Analysis', icon: Map },
  { id: 'architecture', name: 'Model Architecture', icon: Workflow },
  { id: 'explainable', name: 'Explainable AI', icon: Fingerprint },
  { id: 'experiments', name: 'Experiments', icon: FlaskConical },
  { id: 'research', name: 'Research', icon: BookOpen },
  { id: 'report', name: 'System Report', icon: FileText },
  { id: 'admin', name: 'Admin Panel', icon: Shield, adminOnly: true }
];

export default function Header({ currentPage, setCurrentPage, onMenuOpen, currentUser, onLogout, aiMode, setAiMode }) {
  const pageTitle = PAGE_NAMES[currentPage] || 'House Price Prediction';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isDropdownActive = DROPDOWN_ITEMS.some(item => item.id === currentPage);

  return (
    <header className="sticky top-0 z-20 w-full bg-[#08080a]/80 backdrop-blur-2xl border-b border-white/[0.08] px-6 py-2.5 transition-colors">
      <div className="w-full flex items-center justify-between gap-6">
        {/* Left-aligned brand container */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button
            onClick={onMenuOpen}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none ios-pressable"
          >
            <Menu size={18} />
          </button>

          {/* Brand Logo & Name */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity ios-pressable"
          >
            <img src="/logo.png" alt="EstateSense AI Logo" className="h-9 md:h-10 w-auto object-contain brightness-110" />
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-none">EstateSense</h1>
              <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">AI Engine</p>
            </div>
          </div>
        </div>

        {/* Center side: Desktop Horizontal Nav links in Apple Capsule Style */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-full backdrop-blur-xl">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ios-pressable ${
                  isActive 
                    ? 'bg-white/15 text-white border border-white/10 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ios-pressable ${
                isDropdownActive 
                  ? 'bg-white/15 text-white border border-white/10 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <span>More</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMoreOpen(false)} />
                
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-slate-950/95 border border-white/[0.09] shadow-2xl backdrop-blur-2xl p-1.5 z-30 animate-ios-fade-scale">
                  {DROPDOWN_ITEMS.filter(item => !item.adminOnly || (currentUser && currentUser.role === 'Administrator')).map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMoreOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ios-pressable ${
                          isActive 
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right side: User Profile Pill */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all focus:outline-none ios-pressable"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden xl:inline-block max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  
                  <div className="absolute right-0 top-10 mt-1 w-56 rounded-2xl bg-slate-950/95 border border-white/[0.09] shadow-2xl backdrop-blur-2xl p-2 z-20 animate-ios-fade-scale">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        {currentUser.role || 'Member'}
                      </span>
                    </div>
                    
                    <hr className="border-white/[0.06] my-1" />
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-medium transition-colors text-left ios-pressable"
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
