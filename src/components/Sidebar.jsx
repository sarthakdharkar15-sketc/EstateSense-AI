import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  Cpu, 
  Map, 
  Workflow, 
  BarChart3, 
  Fingerprint, 
  Database, 
  FlaskConical, 
  BookOpen, 
  Info,
  LogOut,
  Shield,
  X,
  Scale,
  FileText
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', name: 'Predict Price', icon: Cpu },
  { id: 'compare', name: 'Compare Properties', icon: Scale },
  { id: 'spatial', name: 'Spatial Analysis', icon: Map },
  { id: 'architecture', name: 'Model Architecture', icon: Workflow },
  { id: 'performance', name: 'Model Performance', icon: BarChart3 },
  { id: 'explainable', name: 'Explainable AI', icon: Fingerprint },
  { id: 'experiments', name: 'Experiments', icon: FlaskConical },
  { id: 'research', name: 'Research', icon: BookOpen },
  { id: 'report', name: 'System Report', icon: FileText },
  { id: 'admin', name: 'Admin Panel', icon: Shield, adminOnly: true }
];

export default function Sidebar({ currentPage, setCurrentPage, isOpen, onClose, currentUser, onLogout }) {
  const handleNav = (id) => {
    setCurrentPage(id);
    if (onClose) onClose(); // close mobile drawer
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity duration-200"
        >
          <img src="/logo.png" alt="EstateSense AI Logo" className="h-14 w-auto object-contain brightness-110" />
          <div className="flex flex-col ml-1">
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight leading-none">EstateSense</h1>
            <p className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase mt-0.5">AI Platform</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
        {MENU_ITEMS.filter(item => !item.adminOnly || (currentUser && currentUser.role === 'Administrator')).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group text-left ios-pressable cursor-pointer ${
                isActive 
                  ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <Icon 
                size={16} 
                className={`transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      {currentUser && (
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-600/20 shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-semibold text-xs rounded-xl border border-rose-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Footer info */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20 text-center">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Hedonic + XGBoost Framework
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
