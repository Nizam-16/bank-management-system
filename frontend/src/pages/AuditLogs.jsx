import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const toast = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tableFilter) params.append('tableName', tableFilter);
      if (actionFilter) params.append('actionType', actionFilter);
      if (search) params.append('entityId', search);
      params.append('limit', '100');

      const res = await api.get(`/audit?${params.toString()}`);
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load audit trail: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [tableFilter, actionFilter]);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.entity_id.toLowerCase().includes(s) ||
      (l.description && l.description.toLowerCase().includes(s)) ||
      l.changed_by.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Security & Database Trigger Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable compliance events auto-captured at database level by triggers <code className="font-mono text-brand-600 dark:text-brand-400">TRG_AUDIT_ACCOUNTS</code>, <code className="font-mono text-brand-600 dark:text-brand-400">TRG_AUDIT_TRANSACTIONS</code>, and <code className="font-mono text-brand-600 dark:text-brand-400">TRG_AUDIT_LOANS</code>
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Trail
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by entity ID (e.g. ACC-NYC01-003001, TXN-...), memo, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Table filter */}
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Database Tables</option>
            <option value="ACCOUNTS">ACCOUNTS</option>
            <option value="TRANSACTIONS">TRANSACTIONS</option>
            <option value="LOANS">LOANS</option>
            <option value="LOAN_PAYMENTS">LOAN_PAYMENTS</option>
            <option value="CUSTOMERS">CUSTOMERS</option>
            <option value="SECURITY">SECURITY</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All DML Actions</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="PROCEDURE_EXEC">PROCEDURE_EXEC</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit entries found"
            description="No database mutation events match your current filter settings."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0">
                <tr>
                  <th className="py-3.5 px-5">Audit ID</th>
                  <th className="py-3.5 px-5">Table Mutated</th>
                  <th className="py-3.5 px-5">DML Action</th>
                  <th className="py-3.5 px-5">Entity Key</th>
                  <th className="py-3.5 px-5">Description & Payload</th>
                  <th className="py-3.5 px-5">Authorized User</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200 text-xs">
                {filteredLogs.map((l) => (
                  <tr key={l.audit_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-mono text-slate-400 font-semibold">
                      #{l.audit_id}
                    </td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {l.table_name}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.action_type === 'INSERT'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : l.action_type === 'UPDATE'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : l.action_type === 'DELETE'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                      }`}>
                        {l.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {l.entity_id}
                    </td>
                    <td className="py-3 px-5 text-slate-700 dark:text-slate-300 max-w-md">
                      {l.description}
                    </td>
                    <td className="py-3 px-5 text-slate-500 font-mono text-[11px]">
                      {l.changed_by}
                    </td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {l.changed_at ? new Date(l.changed_at).toLocaleString() : '—'}
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
