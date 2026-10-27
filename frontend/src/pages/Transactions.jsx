import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export default function Transactions({ initialSearchTerm = '' }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState('');
  const [channel, setChannel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState(initialSearchTerm);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toast = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (accountNumber) params.append('accountNumber', accountNumber);
      if (type) params.append('type', type);
      if (channel) params.append('channel', channel);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '200');

      const res = await api.get(`/transactions/history?${params.toString()}`);
      if (res.success) {
        setTransactions(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load transaction ledger: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountNumber, type, channel, startDate, endDate]);

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.reference_number.toLowerCase().includes(s) ||
      t.account_number.toLowerCase().includes(s) ||
      (t.customer_name && t.customer_name.toLowerCase().includes(s)) ||
      (t.description && t.description.toLowerCase().includes(s))
    );
  });

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export Functionality
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.warning('No transactions available to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Reference Number',
      'Account Number',
      'Customer Name',
      'Type',
      'Amount',
      'Balance After',
      'Channel',
      'Description',
      'Status',
      'Timestamp'
    ];

    const rows = filteredTransactions.map((t) => [
      t.transaction_id,
      t.reference_number,
      t.account_number,
      `"${t.customer_name || ''}"`,
      t.transaction_type,
      t.amount,
      t.balance_after,
      t.channel,
      `"${t.description || ''}"`,
      t.status,
      t.created_at
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_bank_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            General Ledger & Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit records queried via REF CURSOR from Oracle PL/SQL package <code className="font-mono text-brand-600 dark:text-brand-400">PKG_TRANSACTION</code>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
            title="Print Ledger"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-500"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, account, customer or memo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER_IN">Transfer In</option>
              <option value="TRANSFER_OUT">Transfer Out</option>
              <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
              <option value="LOAN_REPAYMENT">Loan EMI Repayment</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Channels</option>
              <option value="ONLINE">Online Portal</option>
              <option value="ATM">ATM Counter</option>
              <option value="BRANCH">Branch Counter</option>
              <option value="MOBILE">Mobile App</option>
              <option value="SYSTEM">System Auto</option>
            </select>

            {/* Date Pickers */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : paginatedData.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="No transaction records match the selected filters or date range."
            actionLabel="Reset Filters"
            onAction={() => {
              setAccountNumber('');
              setType('');
              setChannel('');
              setStartDate('');
              setEndDate('');
              setSearch('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0">
                <tr>
                  <th className="py-3.5 px-5">Ref Number</th>
                  <th className="py-3.5 px-5">Account & Holder</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Balance After</th>
                  <th className="py-3.5 px-5">Channel</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {paginatedData.map((t) => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {t.reference_number}
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono">
                        {t.account_number}
                      </div>
                      <div className="text-[10px] text-slate-400">{t.customer_name || 'Account Holder'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge status={t.transaction_type} />
                    </td>
                    <td className={`py-3.5 px-5 text-xs font-mono font-bold ${
                      ['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT'].includes(t.transaction_type)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT'].includes(t.transaction_type) ? '+' : '-'}
                      ${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                      ${Number(t.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {t.channel}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {t.description || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
