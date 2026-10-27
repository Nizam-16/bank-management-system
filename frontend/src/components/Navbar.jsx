import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Calculator,
  UserCheck,
  ChevronDown,
  Check,
  Shield,
  Briefcase,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenMobileMenu, onOpenEmiCalculator, onSearchChange, searchTerm }) {
  const { user, quickDemoLogin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const roleMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { id: 'ADMIN', name: 'System Administrator', icon: Shield, email: 'admin@bank.com' },
    { id: 'TELLER', name: 'Branch Teller Counter', icon: Briefcase, email: 'teller@bank.com' },
    { id: 'LOAN_OFFICER', name: 'Senior Loan Officer', icon: UserCheck, email: 'loan@bank.com' },
    { id: 'CUSTOMER', name: 'Customer Banking Portal', icon: User, email: 'customer@bank.com' },
  ];

  const notifications = [
    { id: 1, title: 'Oracle Trigger TRG_AUDIT_ACCOUNTS', desc: 'Auto-logged new account opening in AUDIT_LOG', time: '5m ago' },
    { id: 2, title: 'Loan Disbursement Completed', desc: 'Disbursed $25,000 to ACC-NYC01-003027 via PKG_LOAN', time: '1h ago' },
    { id: 3, title: 'Database Check Passed', desc: 'Integrity rule balance >= 0 verified for 35 accounts', time: '3h ago' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 glass-header flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search accounts, transactions, customers or loans..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Navbar Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Role:</span> {user?.role || 'Switch Role'}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role Profile
              </div>
              {roles.map((r) => {
                const isCurrent = user?.role === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      quickDemoLogin(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs ${
                      isCurrent ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 opacity-75" />
                      <div>
                        <div>{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.email}</div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* EMI Calculator Quick Launcher */}
        <button
          onClick={onOpenEmiCalculator}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Open Loan EMI Calculator"
        >
          <Calculator className="w-5 h-5 text-indigo-500" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="System notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-950 animate-pulse"></span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Oracle System Events
                </span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
