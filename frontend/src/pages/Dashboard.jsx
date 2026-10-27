import React, { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  PlusCircle,
  Clock,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const DONUT_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  // 30-day activity trend dummy data mapped with realistic curve
  const chartData = [
    { date: 'Oct 01', volume: 32000, txns: 12 },
    { date: 'Oct 05', volume: 68000, txns: 24 },
    { date: 'Oct 10', volume: 154000, txns: 35 },
    { date: 'Oct 15', volume: 92000, txns: 29 },
    { date: 'Oct 20', volume: 185000, txns: 48 },
    { date: 'Oct 25', volume: 240000, txns: 62 },
    { date: 'Today', volume: 295000, txns: 78 }
  ];

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashRes, txnsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/transactions/history?limit=7')
        ]);

        if (dashRes.success) {
          setMetrics(dashRes.data.metrics);
          setDistribution(dashRes.data.distribution || []);
        }

        if (txnsRes.success) {
          setRecentTxns(txnsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Glassmorphism Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-800 via-indigo-950 to-navy-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Oracle 21c PL/SQL Engine • Enterprise Operational Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              System running seamlessly. All debits, credits, and interest calculations are verified by database packages.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('operations')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-105"
            >
              <ArrowLeftRight className="w-4 h-4" /> Transfer Funds
            </button>
            <button
              onClick={() => onNavigate('operations')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Deposit / Withdraw
            </button>
            <button
              onClick={() => onNavigate('loans')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <Landmark className="w-4 h-4 text-indigo-400" /> Loan Module
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Deposit Volume"
            value={`$${(metrics?.total_deposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Wallet}
            trend={14.8}
            trendLabel="30-day liquidity growth"
            color="indigo"
          />
          <StatCard
            title="Active Customers"
            value={metrics?.total_customers || 25}
            icon={Users}
            trend={8.2}
            trendLabel="KYC verified accounts"
            color="emerald"
          />
          <StatCard
            title="Active Loan Facilities"
            value={metrics?.active_loans || 10}
            icon={Landmark}
            trend={4.5}
            trendLabel="Disbursed portfolio"
            color="amber"
          />
          <StatCard
            title="Today's Transactions"
            value={metrics?.today_transactions || 12}
            icon={ArrowUpRight}
            trend={18.3}
            trendLabel="Real-time ledger events"
            color="sky"
          />
        </div>
      )}

      {/* Charts Section: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Area / Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Transaction Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deposit and transfer velocity tracked via TRANSACTIONS ledger
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span> Volume ($)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Types Donut Chart (1 Col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Account Portfolio Split
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution across savings, current, business and term deposits
            </p>
          </div>

          <div className="h-56 w-full my-auto flex items-center justify-center">
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="count"
                    nameKey="account_type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val} Accounts ($${item.payload.total_balance.toLocaleString()})`,
                      item.payload.account_type
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading distribution...</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {distribution.slice(0, 4).map((d, idx) => (
              <div key={d.account_type} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                  ></span>
                  {d.account_type}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {d.count} ({Math.round(d.total_balance / 1000)}k)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Financial Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live events posted through PKG_TRANSACTION stored procedures
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            View All Ledger <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : recentTxns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Reference</th>
                  <th className="py-3 px-5">Account</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Balance After</th>
                  <th className="py-3 px-5">Channel</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {recentTxns.map((t) => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                      {t.reference_number}
                    </td>
                    <td className="py-3 px-5 text-xs font-mono">{t.account_number}</td>
                    <td className="py-3 px-5">
                      <Badge status={t.transaction_type} />
                    </td>
                    <td className={`py-3 px-5 font-semibold text-xs ${
                      ['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT'].includes(t.transaction_type)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT'].includes(t.transaction_type) ? '+' : '-'}
                      ${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      ${Number(t.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {t.channel}
                    </td>
                    <td className="py-3 px-5">
                      <Badge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
