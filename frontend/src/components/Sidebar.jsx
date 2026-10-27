import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Landmark,
  ReceiptText,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TELLER', 'LOAN_OFFICER', 'MANAGER', 'CUSTOMER'] },
    { id: 'customers', name: 'Customers', icon: Users, roles: ['ADMIN', 'TELLER', 'MANAGER'] },
    { id: 'accounts', name: 'Accounts', icon: CreditCard, roles: ['ADMIN', 'TELLER', 'MANAGER', 'CUSTOMER'] },
    { id: 'operations', name: 'Deposit & Transfer', icon: ArrowLeftRight, roles: ['ADMIN', 'TELLER', 'MANAGER', 'CUSTOMER'] },
    { id: 'loans', name: 'Loans & EMI', icon: Landmark, roles: ['ADMIN', 'TELLER', 'LOAN_OFFICER', 'MANAGER', 'CUSTOMER'] },
    { id: 'transactions', name: 'Transactions', icon: ReceiptText, roles: ['ADMIN', 'TELLER', 'MANAGER', 'CUSTOMER'] },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN', 'TELLER', 'MANAGER', 'LOAN_OFFICER'] },
    { id: 'audit', name: 'Audit Trail', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER'] },
  ];

  const allowedNav = navigation.filter(item => !user || item.roles.includes(user.role));

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel with Deep Navy Styling */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-navy-800 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800/80 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-glow shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                  Apex Bank
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    21c
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Oracle PL/SQL Core</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {!isCollapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Technology Footnote */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs">
            <div className="flex items-center gap-1.5 text-brand-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PL/SQL Autonomous Logic</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Business rules, triggers & cursors executed directly in Oracle Database XE.
            </p>
          </div>
        )}

        {/* User Profile Card & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0 border border-slate-600">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || 'Authorized Staff'}
                  </span>
                  <span className="text-[10px] text-brand-400 font-mono">
                    {user?.role || 'SYSTEM'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
