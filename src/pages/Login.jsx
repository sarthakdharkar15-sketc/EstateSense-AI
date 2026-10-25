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
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Login({ onLogin, triggerToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
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
      acceptTerms: false
    });
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDemoFill = () => {
    setIsLogin(true);
    setFormData({
      name: '',
      email: 'demo@housepredict.ai',
      password: 'password123',
      confirmPassword: '',
      acceptTerms: false
    });
    triggerToast("Demo credentials filled! Clicking login...", "success");
    // Trigger submission shortly after to simulate a single click experience
    setTimeout(() => {
      document.getElementById('login-form-submit-btn')?.click();
    }, 600);
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
        setError('Please enter your name.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!formData.acceptTerms) {
        setError('You must accept the terms & conditions.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const user = await apiService.login(formData.email, formData.password);
        triggerToast(`Welcome back, ${user.name}!`, 'success');
        onLogin(user);
      } else {
        const user = await apiService.register(formData.name, formData.email, formData.password);
        triggerToast('Registration successful! You can now log in.', 'success');
        setIsLogin(true);
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
    // Simulate reset API call
    setTimeout(() => {
      setResetLoading(false);
      setForgotPasswordOpen(false);
      triggerToast(`Password reset link sent to ${resetEmail}!`, 'success');
      setResetEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#08080a]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="EstateSense AI Logo" className="h-32 md:h-36 w-auto mb-3 animate-bounce-subtle brightness-110" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-sans tracking-tight mb-2">
            EstateSense AI
          </h1>
          <p className="text-slate-400 mt-1 text-xs font-light tracking-wide uppercase">
            AI-Driven Spatial House Price Prediction & Analytics
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel rounded-2xl border border-white/5 shadow-2xl p-8 relative">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl mb-8 border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-200 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                  placeholder="demo@housepredict.ai"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
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
                  className="w-full pl-10 pr-10 py-3 glass-input text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 glass-input text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3 py-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-offset-2"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-400 leading-normal">
                  I accept the{' '}
                  <a href="#terms" className="text-indigo-400 hover:underline">Terms of Service</a> and{' '}
                  <a href="#privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="login-form-submit-btn"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 hover:shadow-indigo-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isLogin ? 'Signing In...' : 'Registering...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Or Connect With</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => triggerToast('Google Auth Simulation', 'info')}
                className="py-2.5 px-4 bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => triggerToast('GitHub Auth Simulation', 'info')}
                className="py-2.5 px-4 bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                GitHub
              </button>
              <button
                type="button"
                onClick={() => triggerToast('SSO Auth Simulation', 'info')}
                className="py-2.5 px-4 bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                SSO
              </button>
            </div>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div 
          onClick={handleDemoFill}
          className="mt-6 glass-panel border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl p-4 cursor-pointer group transition-all shadow-xl shadow-indigo-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Developer Demo Mode</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Click here to auto-fill Administrator details</p>
              </div>
            </div>
            <div className="text-[11px] text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-semibold">
              <span>Quick Login</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-white/10 rounded-2xl p-6 relative">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              Reset Password
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter your email address and we'll send you a simulation link to reset your password.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-xs"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for unique login animations */}
      <style>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s infinite ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>
    </div>
  );
}
