import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EmiCalculatorModal from './components/EmiCalculatorModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import Operations from './pages/Operations';
import Loans from './pages/Loans';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmiCalcOpen, setIsEmiCalcOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Apex Bank Financial Console...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenEmiCalculator={() => setIsEmiCalcOpen(true)}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
          {currentTab === 'customers' && <Customers />}
          {currentTab === 'accounts' && <Accounts />}
          {currentTab === 'operations' && <Operations />}
          {currentTab === 'loans' && <Loans onOpenEmiCalculator={() => setIsEmiCalcOpen(true)} />}
          {currentTab === 'transactions' && <Transactions initialSearchTerm={searchTerm} />}
          {currentTab === 'reports' && <Reports />}
          {currentTab === 'audit' && <AuditLogs />}
        </main>
      </div>

      {/* Global EMI Calculator Modal */}
      <EmiCalculatorModal
        isOpen={isEmiCalcOpen}
        onClose={() => setIsEmiCalcOpen(false)}
      />
    </div>
  );
}
