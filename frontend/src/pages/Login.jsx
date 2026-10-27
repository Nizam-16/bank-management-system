import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Shield, User, ArrowRight, Lock, Mail, Loader2, Sparkles, Database } from 'lucide-react';

export default function Login() {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setDemoLoading(role);
    try {
      await quickDemoLogin(role);
    } catch (err) {
      // handled by toast
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      {/* Left Hero Section (Fintech / Branding) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-800 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Apex Bank
              <span className="text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Enterprise 21c
              </span>
            </h1>
            <p className="text-xs text-slate-400">Oracle Database PL/SQL Financial Engine</p>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-brand-400" />
            <span>Zero JS business logic • 100% Autonomous PL/SQL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Institutional banking operations, engineered for high reliability.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every transaction, deposit, loan schedule, and audit event is executed inside compiled
            Oracle Database packages with row locks, SAVEPOINT rollback, and ACID compliance.
          </p>

          {/* PL/SQL Highlights Badge list */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>PKG_ACCOUNT & PKG_TRANSACTION</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-brand-400"></span>
              <span>PKG_LOAN & PKG_REPORT</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>SYS_REFCURSOR & BULK COLLECT</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Automated Audit Triggers</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Apex Bank Corporation. Powered by Oracle Database XE 21c.
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign in to Bank Portal
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter your corporate credentials or use one-click demo login below.
            </p>
          </div>

          {/* Quick Demo Sign-In Buttons */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Fast Role Switchers (One-Click)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Password: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                disabled={!!demoLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                {demoLoading === 'ADMIN' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-brand-600" />}
                Admin Portal
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('TELLER')}
                disabled={!!demoLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                {demoLoading === 'TELLER' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Landmark className="w-3.5 h-3.5 text-emerald-600" />}
                Teller Counter
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('LOAN_OFFICER')}
                disabled={!!demoLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                {demoLoading === 'LOAN_OFFICER' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                Loan Officer
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER')}
                disabled={!!demoLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                {demoLoading === 'CUSTOMER' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5 text-purple-600" />}
                Customer View
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-[#F8FAFC] dark:bg-slate-950 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider absolute">
              Or sign in manually
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bank.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign in to Apex Bank <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
