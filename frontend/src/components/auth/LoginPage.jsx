import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Server,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLayout, ROLES, DEMO_USERS } from '../../context/LayoutContext';

/**
 * Enterprise University Management System (UMS) - Authentication Page
 * 
 * Features:
 * - Secure credential submission form (Username/Email & Password)
 * - Password visibility toggle
 * - Prominent 1-click Demo Account Quick-Fill cards for Admin, Faculty, and Student
 * - Real-time Dark / Light theme toggle
 * - Informative institutional footer and MSSQL cluster health verification
 */
export const LoginPage = () => {
  const { login, theme, toggleTheme } = useLayout();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      login(demoUser.username, demoUser.password);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              Western University
            </span>
            <span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              UMS / SIS
            </span>
          </div>
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center gap-2 text-xs font-semibold"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Authentication Center Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Sign In Card (5 cols on lg) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Institutional Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your university credentials to access the academic management portal.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Username or Institutional Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or admin@western.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('For password resets, please contact the Western IT Helpdesk at ext. 4400 or use the Demo Quick-Fill options on the right.');
                    }}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-Bit SSL • Microsoft SQL Server Authenticated
              </span>
            </div>
          </div>

          {/* Right Column: Predefined Accounts & Quick-Fill Demo (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-sm font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                  Test Credentials & Quick Fill
                </h2>
              </div>
              <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                Click any profile below to automatically populate the username & password and log in immediately.
              </p>
            </div>

            {/* Quick Demo Accounts List */}
            <div className="space-y-3">
              {DEMO_USERS.map((usr) => (
                <div
                  key={usr.id}
                  onClick={() => handleQuickLogin(usr)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500/60 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={usr.avatar}
                      alt={usr.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-sky-500 transition-all flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {usr.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30">
                          {usr.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Username: <strong className="text-slate-700 dark:text-slate-200">{usr.username}</strong> • Pass: <strong className="text-slate-700 dark:text-slate-200">{usr.password}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition-colors flex-shrink-0"
                    title={`Log in as ${usr.name}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-500" />
                MSSQL 2022 Instance:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY / LISTENING</span>
            </div>
          </div>

        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>© 2026 Western University • Academic Information System</p>
        <p className="font-mono text-[11px]">Academic Term: Fall 2026 • Build v1.0.4</p>
      </footer>

    </div>
  );
};
