import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Lock,
  Unlock,
  XCircle,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
  User
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: '', account: null, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: 'SAVINGS',
    initialDeposit: 1000,
    branchId: 1,
    currency: 'USD'
  });

  const toast = useToast();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'CUSTOMER'
        ? `/accounts/customer/${user.customer_id}`
        : `/accounts${statusFilter ? `?status=${statusFilter}` : ''}`;

      const res = await api.get(endpoint);
      if (res.success) {
        setAccounts(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    if (user?.role !== 'CUSTOMER') {
      try {
        const res = await api.get('/customers');
        if (res.success) {
          setCustomers(res.data || []);
          if (res.data?.length > 0 && !formData.customerId) {
            setFormData(prev => ({ ...prev, customerId: res.data[0].customer_id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCustomersList();
  }, [statusFilter]);

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        customerId: user?.role === 'CUSTOMER' ? user.customer_id : formData.customerId
      };

      const res = await api.post('/accounts/open', payload);
      if (res.success) {
        toast.success(`Account ${res.data.account_no} successfully opened with $${formData.initialDeposit}!`);
        setIsOpenModalActive(false);
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccountAction = async () => {
    const { type, account, reason } = actionModal;
    if (!account) return;

    setSubmitting(true);
    try {
      let res;
      if (type === 'FREEZE') {
        res = await api.put(`/accounts/${account.account_number}/freeze`, { reason: reason || 'Administrative hold' });
        toast.warning(`Account ${account.account_number} has been FROZEN.`);
      } else if (type === 'ACTIVATE') {
        res = await api.put(`/accounts/${account.account_number}/activate`, {});
        toast.success(`Account ${account.account_number} reactivated successfully.`);
      } else if (type === 'CLOSE') {
        res = await api.put(`/accounts/${account.account_number}/close`, { reason: reason || 'Customer request' });
        toast.info(`Account ${account.account_number} closed.`);
      }

      setActionModal({ open: false, type: '', account: null, reason: '' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.account_number.toLowerCase().includes(s) ||
      (a.customer_name && a.customer_name.toLowerCase().includes(s)) ||
      a.account_type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Bank Account Ledgers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Managed via PKG_ACCOUNT procedures with strict balance constraints (balance &ge; 0)
          </p>
        </div>

        {user?.role !== 'CUSTOMER' && (
          <button
            onClick={() => setIsOpenModalActive(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-500"
          >
            <Plus className="w-4 h-4" /> Open New Account
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by account number, holder name, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="FROZEN">Frozen</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <EmptyState
            title="No bank accounts found"
            description="No accounts match your query or filter criteria."
            actionLabel={user?.role !== 'CUSTOMER' ? 'Open Account' : undefined}
            onAction={() => setIsOpenModalActive(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0">
                <tr>
                  <th className="py-3.5 px-5">Account Number</th>
                  <th className="py-3.5 px-5">Holder Name</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Available Balance</th>
                  <th className="py-3.5 px-5">Interest</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Opened</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {filteredAccounts.map((a) => (
                  <tr key={a.account_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {a.account_number}
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {a.customer_name || `Customer #${a.customer_id}`}
                      </div>
                      <div className="text-[10px] text-slate-400">{a.branch_name || 'Wall Street HQ'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {a.account_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ${Number(a.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {a.interest_rate}%
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge status={a.status} />
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {a.opened_date ? a.opened_date.slice(0, 10) : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {user?.role !== 'CUSTOMER' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'ACTIVE' && (
                            <button
                              onClick={() => setActionModal({ open: true, type: 'FREEZE', account: a, reason: '' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Freeze Account (PKG_ACCOUNT.freeze_account)"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                          {a.status === 'FROZEN' && (
                            <button
                              onClick={() => setActionModal({ open: true, type: 'ACTIVATE', account: a, reason: '' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Reactivate Account (PKG_ACCOUNT.activate_account)"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                          {a.status !== 'CLOSED' && (
                            <button
                              onClick={() => setActionModal({ open: true, type: 'CLOSE', account: a, reason: '' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Close Account (PKG_ACCOUNT.close_account)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={isOpenModalActive}
        onClose={() => setIsOpenModalActive(false)}
        title="Open New Bank Ledger Account"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleOpenAccount} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Beneficiary Customer *
            </label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name} ({c.customer_number}) - {c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Type *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                <option value="SAVINGS">Savings Account (3.5% APR)</option>
                <option value="CURRENT">Current Account (0.5% APR)</option>
                <option value="BUSINESS">Business Enterprise (1.25% APR)</option>
                <option value="SALARY">Salary Account (4.0% APR)</option>
                <option value="FIXED_DEPOSIT">Fixed Term Deposit (6.5% APR)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Location *
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                <option value={1}>NYC01 - Wall Street Financial Hub</option>
                <option value={2}>SFO02 - Silicon Valley Branch</option>
                <option value={3}>CHI03 - Midwest Commercial Center</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Deposit Amount ($) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.initialDeposit}
                onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 text-[11px] text-slate-600 dark:text-slate-300">
            Account number will be auto-generated in format <code className="font-mono text-brand-600 dark:text-brand-400">ACC-[BRANCH]-XXXXXX</code> by Oracle Sequence <code className="font-mono">SEQ_ACCOUNT_ID</code>.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOpenModalActive(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: '', account: null, reason: '' })}
        onConfirm={handleAccountAction}
        title={
          actionModal.type === 'FREEZE'
            ? 'Freeze Bank Account'
            : actionModal.type === 'ACTIVATE'
            ? 'Reactivate Account'
            : 'Close Account'
        }
        message={
          actionModal.type === 'FREEZE'
            ? `Are you sure you want to freeze account ${actionModal.account?.account_number}? Debits and withdrawals will be blocked immediately.`
            : actionModal.type === 'ACTIVATE'
            ? `Reactivate account ${actionModal.account?.account_number} to restore normal transaction operations?`
            : `Close account ${actionModal.account?.account_number}? Note: Account must have an exact zero balance ($0.00) according to PL/SQL rule ORA-20012.`
        }
        confirmText={actionModal.type === 'CLOSE' ? 'Close Account' : actionModal.type === 'FREEZE' ? 'Freeze Account' : 'Reactivate'}
        isDestructive={actionModal.type === 'CLOSE' || actionModal.type === 'FREEZE'}
        isLoading={submitting}
        previewDetails={
          actionModal.account
            ? {
                'Account Number': actionModal.account.account_number,
                'Current Balance': `$${Number(actionModal.account.balance).toLocaleString()}`,
                'Account Holder': actionModal.account.customer_name || 'N/A',
                'Status': actionModal.account.status
              }
            : null
        }
      />
    </div>
  );
}
