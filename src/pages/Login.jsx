import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  LockKeyhole, 
  KeyRound,
  Sparkles,
  Shield,
  UserCheck,
  Compass,
  Cpu
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Login({ onLogin, triggerToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    acceptTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Clean errors when switching modes
  useEffect(() => {
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      acceptTerms: true
    });
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Instant 1-Click Role Login Handlers
  const handleQuickLogin = async (roleType) => {
    setError('');
    setLoading(true);
    const targetEmail = roleType === 'admin' ? 'admin@estatesense.ai' : 'user@estatesense.ai';
    const targetPass = roleType === 'admin' ? 'admin123' : 'user123';
    
    try {
      const user = await apiService.login(targetEmail, targetPass);
      triggerToast(`Signed in as ${user.name} (${user.role})!`, 'success');
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Authentication error');
      triggerToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest Explorer',
      email: 'guest@estatesense.ai',
      role: 'User',
      token: 'guest-session'
    };
    triggerToast('Browsing in Guest Mode (User Permissions)', 'info');
    onLogin(guestUser);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const user = await apiService.login(formData.email, formData.password);
        triggerToast(`Welcome back, ${user.name}! (${user.role})`, 'success');
        onLogin(user);
      } else {
        const user = await apiService.register(formData.name, formData.email, formData.password, formData.role);
        triggerToast(`Account created as ${user.role}! Auto-signing in...`, 'success');
        onLogin(user);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      triggerToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) {
      triggerToast('Please enter a valid email address.', 'error');
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotPasswordOpen(false);
      triggerToast(`Password reset link dispatched to ${resetEmail}!`, 'success');
      setResetEmail('');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3.5 sm:px-6 py-8 sm:py-12 relative overflow-hidden bg-[#08080a]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* App Logo & Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3 justify-center mb-3">
            <img src="/logo.png" alt="EstateSense AI Logo" className="h-10 sm:h-12 w-auto object-contain brightness-110" />
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                EstateSense <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">
                Spatial Valuation Engine
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-light max-w-sm">
            Sign in to access property pricing models, spatial analytics, and explainable AI insights.
          </p>
        </div>

        {/* 1-CLICK QUICK ROLE LOGIN CARDS (User vs Admin) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-400" />
              <span>One-Click Demo Roles</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Viva & Presentation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Admin Role Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/80 shadow-lg shadow-indigo-950/30 text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between min-h-[96px] ios-pressable"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Shield size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Administrator
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">admin@estatesense.ai</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Full Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                Admin Panel • Retraining • System Latency
              </p>
            </button>

            {/* Standard User Role Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              disabled={loading}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/80 shadow-lg shadow-emerald-950/30 text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between min-h-[96px] ios-pressable"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Regular User
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">user@estatesense.ai</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  User Role
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                Valuation • GIS Maps • Compare Properties
              </p>
            </button>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 relative">
          
          {/* Tab Selector */}
          <div className="flex p-1 bg-white/[0.04] rounded-xl mb-6 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                isLogin 
                  ? 'bg-white/15 text-white shadow-sm border border-white/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                !isLogin 
                  ? 'bg-white/15 text-white shadow-sm border border-white/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                </div>

                {/* Account Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Assign Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'User' }))}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.role === 'User'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <User size={13} />
                      <span>User / Analyst</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'Administrator' }))}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.role === 'Administrator'
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Shield size={13} />
                      <span>Administrator</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder={isLogin ? "admin@estatesense.ai or user@estatesense.ai" : "you@company.com"}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Registration only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 ios-pressable"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to EstateSense' : 'Register & Enter Platform'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Guest Mode Link */}
          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer ios-pressable"
            >
              <Compass size={13} className="text-emerald-400" />
              <span>Continue as Guest (Explore without credentials)</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Simulation Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-white/10 bg-slate-900/95 rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Password Recovery</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-light">
              Enter your email address and we'll simulate sending a reset link.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Simulation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
