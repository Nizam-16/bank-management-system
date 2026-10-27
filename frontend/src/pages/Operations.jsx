import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Operations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('TRANSFER'); // 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form Fields
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('ONLINE');

  // Confirmation modal & execution state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  const toast = useToast();

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await api.get('/accounts?status=ACTIVE');
      if (res.success) {
        setAccounts(res.data || []);
        if (res.data?.length > 0) {
          setSourceAccount(res.data[0].account_number);
          if (res.data.length > 1) {
            setDestinationAccount(res.data[1].account_number);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const selectedSrcAcc = accounts.find(a => a.account_number === sourceAccount);
  const selectedDestAcc = accounts.find(a => a.account_number === destinationAccount);

  // Validation rules
  const numAmount = Number(amount);
  const isValidAmount = numAmount > 0;
  const isInsufficient =
    (activeTab === 'WITHDRAW' || activeTab === 'TRANSFER') &&
    selectedSrcAcc &&
    numAmount > selectedSrcAcc.balance;
  const isSameAccount = activeTab === 'TRANSFER' && sourceAccount === destinationAccount;

  const canSubmit =
    isValidAmount &&
    !isInsufficient &&
    !isSameAccount &&
    sourceAccount &&
    (activeTab !== 'TRANSFER' || destinationAccount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsConfirmOpen(true);
  };

  const handleExecuteOperation = async () => {
    setProcessing(true);
    try {
      let res;
      if (activeTab === 'DEPOSIT') {
        res = await api.post('/transactions/deposit', {
          accountNumber: sourceAccount,
          amount: numAmount,
          channel,
          description: description || 'Counter Deposit'
        });
      } else if (activeTab === 'WITHDRAW') {
        res = await api.post('/transactions/withdraw', {
          accountNumber: sourceAccount,
          amount: numAmount,
          channel,
          description: description || 'ATM Cash Withdrawal'
        });
      } else if (activeTab === 'TRANSFER') {
        res = await api.post('/transactions/transfer', {
          sourceAccount,
          destinationAccount,
          amount: numAmount,
          channel,
          description: description || 'Online Peer Transfer'
        });
      }

      if (res.success) {
        toast.success(res.data.message || 'Operation executed successfully!');
        setLastReceipt({
          ...res.data,
          type: activeTab,
          amount: numAmount,
          sourceAccount,
          destinationAccount: activeTab === 'TRANSFER' ? destinationAccount : null,
          channel,
          timestamp: new Date().toLocaleString()
        });
        setIsConfirmOpen(false);
        setAmount('');
        setDescription('');
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.message);
      setIsConfirmOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Financial Operations Console
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Atomic transactions handled by PL/SQL package <code className="font-mono text-brand-600 dark:text-brand-400">PKG_TRANSACTION</code> with SAVEPOINT rollback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('TRANSFER'); setLastReceipt(null); }}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'TRANSFER'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Fund Transfer
        </button>

        <button
          onClick={() => { setActiveTab('DEPOSIT'); setLastReceipt(null); }}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'DEPOSIT'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> Cash Deposit
        </button>

        <button
          onClick={() => { setActiveTab('WITHDRAW'); setLastReceipt(null); }}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'WITHDRAW'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-500" /> Cash Withdrawal
        </button>
      </div>

      {/* Main Form or Receipt Card */}
      {lastReceipt ? (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-8 shadow-soft text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Transaction Completed Successfully
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              ${Number(lastReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lastReceipt.message}
            </p>
          </div>

          {/* Receipt Breakdown Box */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Reference Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{lastReceipt.reference_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">#{lastReceipt.transaction_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Source Account</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{lastReceipt.sourceAccount}</span>
            </div>
            {lastReceipt.destinationAccount && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Beneficiary Account</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{lastReceipt.destinationAccount}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Channel & Timestamp</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{lastReceipt.channel} • {lastReceipt.timestamp}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
              <span className="text-slate-600 dark:text-slate-400">Updated Balance</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                ${Number(lastReceipt.new_balance || lastReceipt.source_new_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setLastReceipt(null)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Perform Another Operation
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Selector Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Account */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  {activeTab === 'DEPOSIT' ? 'Target Account *' : 'Source Account *'}
                </label>
                <select
                  required
                  value={sourceAccount}
                  onChange={(e) => setSourceAccount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.account_id} value={a.account_number}>
                      {a.account_number} ({a.account_type}) - ${Number(a.balance).toLocaleString()}
                    </option>
                  ))}
                </select>

                {/* Available Balance Pill */}
                {selectedSrcAcc && (
                  <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Available Ledger Balance:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${Number(selectedSrcAcc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Destination Account (Only for Fund Transfer) */}
              {activeTab === 'TRANSFER' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Beneficiary Account *
                  </label>
                  <select
                    required
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white ${
                      isSameAccount ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {accounts.map((a) => (
                      <option key={a.account_id} value={a.account_number}>
                        {a.account_number} ({a.account_type}) - {a.customer_name || `Cust #${a.customer_id}`}
                      </option>
                    ))}
                  </select>

                  {isSameAccount ? (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      PL/SQL Exception: Source and destination cannot be identical (ORA-20005)
                    </div>
                  ) : selectedDestAcc ? (
                    <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Beneficiary Holder:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedDestAcc.customer_name || 'Verified Customer'}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Amount and Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Transaction Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono ${
                      isInsufficient
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-brand-500'
                    }`}
                  />
                </div>

                {isInsufficient && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    PL/SQL Exception: Insufficient funds (ORA-20001)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Transaction Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                >
                  <option value="ONLINE">Online Portal (Web/API)</option>
                  <option value="ATM">Automated Teller Machine (ATM)</option>
                  <option value="BRANCH">Physical Branch Counter</option>
                  <option value="MOBILE">Mobile Banking</option>
                </select>
              </div>
            </div>

            {/* Description / Memo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Transaction Description / Memo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Invoice Payment, Travel Reimbursement..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected by Oracle ACID Transaction Isolation</span>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Confirmation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteOperation}
        title={`Confirm ${activeTab === 'TRANSFER' ? 'Fund Transfer' : activeTab === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}`}
        message="Please verify transaction details before committing to the Oracle PL/SQL ledger."
        confirmText="Confirm & Post Transaction"
        isLoading={processing}
        previewDetails={{
          'Operation Type': activeTab,
          'Source Account': sourceAccount,
          ...(activeTab === 'TRANSFER' ? { 'Beneficiary Account': destinationAccount } : {}),
          'Transaction Amount': `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          'Channel': channel,
          'Transaction Fee': '$0.00 (Zero Fee Institutional)',
          'Estimated Balance After': selectedSrcAcc
            ? `$${Number(
                activeTab === 'DEPOSIT'
                  ? selectedSrcAcc.balance + numAmount
                  : selectedSrcAcc.balance - numAmount
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : '—'
        }}
      />
    </div>
  );
}
