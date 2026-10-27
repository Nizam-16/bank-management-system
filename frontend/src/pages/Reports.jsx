import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  AlertOctagon,
  Printer,
  Download,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Search,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('STATEMENT'); // 'STATEMENT' | 'BRANCHES' | 'DEFAULTERS'
  const [accounts, setAccounts] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Report States
  const [statementData, setStatementData] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [defaulters, setDefaulters] = useState([]);
  const [defaultersLoading, setDefaultersLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await api.get('/accounts');
        if (res.success && res.data?.length > 0) {
          setAccounts(res.data);
          setSelectedAcc(res.data[0].account_number);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAccounts();
  }, []);

  // Fetch statement when tab or filters change
  const fetchStatement = async () => {
    if (!selectedAcc) return;
    setStatementLoading(true);
    try {
      const res = await api.get(`/reports/statements/${selectedAcc}?year=${selectedYear}&month=${selectedMonth}`);
      if (res.success) {
        setStatementData(res.data);
      }
    } catch (err) {
      toast.error('Failed to generate monthly statement: ' + err.message);
    } finally {
      setStatementLoading(false);
    }
  };

  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await api.get('/reports/branches');
      if (res.success) {
        setBranches(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load branch metrics: ' + err.message);
    } finally {
      setBranchesLoading(false);
    }
  };

  const fetchDefaulters = async () => {
    setDefaultersLoading(true);
    try {
      const res = await api.get('/reports/defaulters');
      if (res.success) {
        setDefaulters(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load loan defaulters: ' + err.message);
    } finally {
      setDefaultersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'STATEMENT') {
      fetchStatement();
    } else if (activeTab === 'BRANCHES') {
      fetchBranches();
    } else if (activeTab === 'DEFAULTERS') {
      fetchDefaulters();
    }
  }, [activeTab, selectedAcc, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Executive Reports & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generated via PL/SQL package <code className="font-mono text-brand-600 dark:text-brand-400">PKG_REPORT</code> using SYS_REFCURSOR and BULK COLLECT
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('STATEMENT')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'STATEMENT'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Monthly Account Statement
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'BRANCHES'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-500" /> Branch Performance (BULK COLLECT)
        </button>

        <button
          onClick={() => setActiveTab('DEFAULTERS')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'DEFAULTERS'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-rose-500" /> Loan Defaulters Risk Audit
        </button>
      </div>

      {/* TAB 1: MONTHLY STATEMENT */}
      {activeTab === 'STATEMENT' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account Number
                </label>
                <select
                  value={selectedAcc}
                  onChange={(e) => setSelectedAcc(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                >
                  {accounts.map((a) => (
                    <option key={a.account_id} value={a.account_number}>
                      {a.account_number} ({a.account_type}) - {a.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Statement Period
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <Printer className="w-4 h-4" /> Print Formal Statement
            </button>
          </div>

          {/* Statement Presentation Container */}
          {statementLoading ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : !statementData?.account ? (
            <EmptyState title="Select an account to render statement" />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-6 sm:p-10 space-y-8">
              {/* Bank Statement Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
                    APEX BANK CORPORATION
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Branch: {statementData.account.branch_name} • IFSC: {statementData.account.ifsc_code}
                  </div>
                  <div className="text-xs text-slate-400">Official Monthly Account Ledger</div>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xs text-slate-400">Statement Period</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Status: ACTIVE LEDGER</div>
                </div>
              </div>

              {/* Account Holder Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Account Beneficiary</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {statementData.account.customer_name}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Customer ID: {statementData.account.customer_number}
                  </div>
                  <div className="text-slate-500 mt-0.5">{statementData.account.address}, {statementData.account.city}</div>
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Account Details</span>
                  <div className="font-mono font-bold text-sm text-brand-600 dark:text-brand-400 mt-0.5">
                    {statementData.account.account_number}
                  </div>
                  <div className="text-slate-500 mt-0.5 font-medium">Category: {statementData.account.account_type}</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                    Current Balance: ${Number(statementData.account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Transactions in Period */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Account Activity Ledger ({statementData.transactions.length} items)
                </h4>

                {statementData.transactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No transactions occurred on this account during {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Reference</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Channel</th>
                          <th className="py-3 px-4 text-right">Debit ($)</th>
                          <th className="py-3 px-4 text-right">Credit ($)</th>
                          <th className="py-3 px-4 text-right">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {statementData.transactions.map((t) => {
                          const isCredit = ['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT'].includes(t.transaction_type);
                          return (
                            <tr key={t.transaction_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                {t.created_at ? t.created_at.slice(0, 10) : '—'}
                              </td>
                              <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">
                                {t.reference_number}
                              </td>
                              <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-200">
                                {t.description}
                              </td>
                              <td className="py-3 px-4 font-sans text-slate-500">
                                {t.channel}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                                {!isCredit ? `$${Number(t.amount).toFixed(2)}` : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {isCredit ? `$${Number(t.amount).toFixed(2)}` : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                                ${Number(t.balance_after).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRANCH PERFORMANCE (BULK COLLECT) */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart comparing branches */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Branch Deposit vs Loan Exposure
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Aggregated in Oracle PL/SQL package <code className="font-mono">PKG_REPORT.get_branch_performance</code> using BULK COLLECT
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branches} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis dataKey="branch_name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val) => [`$${val.toLocaleString()}`]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_deposits" name="Total Deposits" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="total_loan_volume" name="Disbursed Loans" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Highlights */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                PL/SQL BULK COLLECT
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rather than executing multiple roundtrips, Oracle PL/SQL fetches multiple rows simultaneously into collections via <code className="font-mono text-brand-600">BULK COLLECT INTO</code>, dramatically speeding up institutional analytics.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Branches:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{branches.length} Hubs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total System Deposits:</span>
                  <span className="font-bold text-brand-600 font-mono">
                    ${branches.reduce((sum, b) => sum + (b.total_deposits || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Disbursed Credit:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ${branches.reduce((sum, b) => sum + (b.total_loan_volume || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Branch Code</th>
                    <th className="py-3 px-5">Branch Name</th>
                    <th className="py-3 px-5">Location</th>
                    <th className="py-3 px-5">Active Accounts</th>
                    <th className="py-3 px-5">Deposit Volume</th>
                    <th className="py-3 px-5">Loans Disbursed</th>
                    <th className="py-3 px-5">Loan Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200 text-xs">
                  {branches.map((b) => (
                    <tr key={b.branch_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-5 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {b.branch_code}
                      </td>
                      <td className="py-3 px-5 font-bold text-slate-900 dark:text-white">
                        {b.branch_name}
                      </td>
                      <td className="py-3 px-5 text-slate-500">
                        {b.city}
                      </td>
                      <td className="py-3 px-5 font-mono">{b.total_accounts} accounts</td>
                      <td className="py-3 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${Number(b.total_deposits).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-5 font-mono">{b.total_loans} loans</td>
                      <td className="py-3 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ${Number(b.total_loan_volume).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOAN DEFAULTERS */}
      {activeTab === 'DEFAULTERS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Credit Risk & Overdue Facilities
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computed via <code className="font-mono">PKG_REPORT.get_loan_defaulters</code>: loans with overdue installments &gt; 30 days
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold border border-rose-200 dark:border-rose-800">
                {defaulters.length} Facilities Flagged
              </span>
            </div>

            {defaultersLoading ? (
              <div className="p-6">
                <TableSkeleton rows={4} cols={6} />
              </div>
            ) : defaulters.length === 0 ? (
              <EmptyState
                title="Zero credit defaulters"
                description="All active loan facilities are currently compliant with scheduled installments."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Loan Ref</th>
                      <th className="py-3.5 px-5">Applicant</th>
                      <th className="py-3.5 px-5">Facility Type</th>
                      <th className="py-3.5 px-5">Principal</th>
                      <th className="py-3.5 px-5">Remaining Balance</th>
                      <th className="py-3.5 px-5">Days Overdue</th>
                      <th className="py-3.5 px-5">Contact Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                    {defaulters.map((d) => (
                      <tr key={d.loan_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-5 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {d.loan_reference}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                          {d.customer_name}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {d.loan_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                          ${Number(d.principal_amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-rose-600 dark:text-rose-400">
                          ${Number(d.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-5 font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800">
                            {d.days_overdue} days
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 space-y-0.5">
                          <div>{d.phone}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{d.email}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
