import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  DollarSign,
  Calculator,
  Search,
  Filter,
  Eye,
  Loader2,
  FileText
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Loans({ onOpenEmiCalculator }) {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [repayModal, setRepayModal] = useState({ open: false, loan: null, amount: '', sourceAcc: '' });
  const [approveModal, setApproveModal] = useState({ open: false, loan: null, action: 'APPROVED', remarks: '' });
  const [scheduleModal, setScheduleModal] = useState({ open: false, loan: null, schedule: [], loading: false });
  const [submitting, setSubmitting] = useState(false);

  // Apply Form State
  const [applyForm, setApplyForm] = useState({
    customerId: '',
    accountNumber: '',
    loanType: 'PERSONAL',
    principal: 15000,
    termMonths: 24,
    interestRate: 8.5
  });

  const toast = useToast();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'CUSTOMER'
        ? `/loans?customerId=${user.customer_id}`
        : `/loans${statusFilter ? `?status=${statusFilter}` : ''}`;

      const res = await api.get(endpoint);
      if (res.success) {
        setLoans(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load loans: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [accRes, custRes] = await Promise.all([
        api.get('/accounts?status=ACTIVE'),
        user?.role !== 'CUSTOMER' ? api.get('/customers') : Promise.resolve({ data: [] })
      ]);
      if (accRes.success) setAccounts(accRes.data || []);
      if (custRes.success) setCustomers(custRes.data || []);
      if (accRes.data?.length > 0 && !applyForm.accountNumber) {
        setApplyForm(prev => ({
          ...prev,
          accountNumber: accRes.data[0].account_number,
          customerId: user?.role === 'CUSTOMER' ? user.customer_id : accRes.data[0].customer_id
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  useEffect(() => {
    fetchSupportData();
  }, []);

  // Quick EMI preview in Apply Form
  const previewEmi = (() => {
    const P = Number(applyForm.principal);
    const r = (Number(applyForm.interestRate) / 100) / 12;
    const n = Number(applyForm.termMonths);
    if (P <= 0 || n <= 0 || r === 0) return 0;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi * 100) / 100;
  })();

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...applyForm,
        customerId: user?.role === 'CUSTOMER' ? user.customer_id : applyForm.customerId
      };
      const res = await api.post('/loans/apply', payload);
      if (res.success) {
        toast.success(`Loan application ${res.data.loan_reference} submitted. Monthly EMI: $${res.data.emi_amount}`);
        setIsApplyModalOpen(false);
        fetchLoans();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLoan = async () => {
    if (!approveModal.loan) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/loans/${approveModal.loan.loan_id}/approve`, {
        action: approveModal.action,
        remarks: approveModal.remarks || 'Reviewed by Credit Committee'
      });
      if (res.success) {
        toast.success(res.data.message);
        setApproveModal({ open: false, loan: null, action: 'APPROVED', remarks: '' });
        fetchLoans();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayEmi = async (e) => {
    e.preventDefault();
    if (!repayModal.loan) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/loans/${repayModal.loan.loan_id}/pay-emi`, {
        paymentAmount: Number(repayModal.amount),
        sourceAccount: repayModal.sourceAcc,
        paymentMethod: 'ONLINE'
      });
      if (res.success) {
        toast.success(res.data.message);
        setRepayModal({ open: false, loan: null, amount: '', sourceAcc: '' });
        fetchLoans();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSchedule = async (loan) => {
    setScheduleModal({ open: true, loan, schedule: [], loading: true });
    try {
      const res = await api.get(`/loans/${loan.loan_id}/schedule`);
      if (res.success) {
        setScheduleModal({ open: true, loan, schedule: res.data || [], loading: false });
      }
    } catch (err) {
      toast.error(err.message);
      setScheduleModal({ open: false, loan: null, schedule: [], loading: false });
    }
  };

  const filteredLoans = loans.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.loan_reference.toLowerCase().includes(s) ||
      (l.customer_name && l.customer_name.toLowerCase().includes(s)) ||
      l.loan_type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Loan Facilities & Credit Lifecycle
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Oracle PL/SQL package <code className="font-mono text-brand-600 dark:text-brand-400">PKG_LOAN</code> with auto amortization and balance reduction
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenEmiCalculator}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <Calculator className="w-4 h-4 text-brand-600" /> EMI Calculator
          </button>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:ring-brand-500"
          >
            <Plus className="w-4 h-4" /> Apply for Loan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by loan reference, applicant name, facility type..."
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
            <option value="">All Loan Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved (Awaiting Disbursement)</option>
            <option value="DISBURSED">Disbursed (Active)</option>
            <option value="CLOSED">Closed / Fully Repaid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : filteredLoans.length === 0 ? (
          <EmptyState
            title="No loan facilities found"
            description="There are currently no loans matching your criteria."
            actionLabel="Apply for Loan"
            onAction={() => setIsApplyModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0">
                <tr>
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">Applicant</th>
                  <th className="py-3.5 px-5">Facility Type</th>
                  <th className="py-3.5 px-5">Principal</th>
                  <th className="py-3.5 px-5">Monthly EMI</th>
                  <th className="py-3.5 px-5">Remaining Balance</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {filteredLoans.map((l) => (
                  <tr key={l.loan_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {l.loan_reference}
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {l.customer_name || `Customer #${l.customer_id}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.account_number}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {l.loan_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${Number(l.principal_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      ${Number(l.emi_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      ${Number(l.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Schedule */}
                        <button
                          onClick={() => handleViewSchedule(l)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Repayment Schedule"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Approve/Reject Button (Officers / Admins only) */}
                        {user?.role !== 'CUSTOMER' && l.status === 'PENDING' && (
                          <button
                            onClick={() => setApproveModal({ open: true, loan: l, action: 'APPROVED', remarks: '' })}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        {/* Pay EMI Button (For disbursed loans) */}
                        {l.status === 'DISBURSED' && (
                          <button
                            onClick={() => setRepayModal({
                              open: true,
                              loan: l,
                              amount: String(l.emi_amount),
                              sourceAcc: accounts[0]?.account_number || l.account_number
                            })}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                          >
                            Pay EMI
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Loan Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit New Loan Application"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleApplyLoan} className="space-y-4 text-xs">
          {user?.role !== 'CUSTOMER' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Applicant Customer *
              </label>
              <select
                required
                value={applyForm.customerId}
                onChange={(e) => setApplyForm({ ...applyForm, customerId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.first_name} {c.last_name} ({c.customer_number}) - {c.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Linked Account (For Disbursement) *
              </label>
              <select
                required
                value={applyForm.accountNumber}
                onChange={(e) => setApplyForm({ ...applyForm, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.account_id} value={a.account_number}>
                    {a.account_number} (${Number(a.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credit Facility Type *
              </label>
              <select
                value={applyForm.loanType}
                onChange={(e) => setApplyForm({ ...applyForm, loanType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                <option value="PERSONAL">Personal Credit Loan</option>
                <option value="HOME">Residential Home Mortgage</option>
                <option value="AUTO">Automotive Vehicle Loan</option>
                <option value="BUSINESS">Commercial Business Credit</option>
                <option value="EDUCATION">Higher Education Loan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Principal Amount ($) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                required
                value={applyForm.principal}
                onChange={(e) => setApplyForm({ ...applyForm, principal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tenure (Months) *
              </label>
              <input
                type="number"
                min="6"
                max="360"
                step="6"
                required
                value={applyForm.termMonths}
                onChange={(e) => setApplyForm({ ...applyForm, termMonths: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Rate (%) *
              </label>
              <input
                type="number"
                min="1"
                max="25"
                step="0.25"
                required
                value={applyForm.interestRate}
                onChange={(e) => setApplyForm({ ...applyForm, interestRate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Real-time EMI Preview Box */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Computed Monthly EMI
              </span>
              <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                ${previewEmi.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Repayment
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                ${Math.round(previewEmi * Number(applyForm.termMonths)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
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
              Submit Application (PKG_LOAN.apply_loan)
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay EMI Modal */}
      <Modal
        isOpen={repayModal.open}
        onClose={() => setRepayModal({ open: false, loan: null, amount: '', sourceAcc: '' })}
        title={`Pay EMI Installment: ${repayModal.loan?.loan_reference}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePayEmi} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ${Number(repayModal.loan?.remaining_balance || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Monthly Standard EMI:</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                ${Number(repayModal.loan?.emi_amount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Source Account (Debited) *
            </label>
            <select
              required
              value={repayModal.sourceAcc}
              onChange={(e) => setRepayModal({ ...repayModal, sourceAcc: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_number}>
                  {a.account_number} (${Number(a.balance).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Repayment Amount ($) *
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              max={repayModal.loan?.remaining_balance}
              required
              value={repayModal.amount}
              onChange={(e) => setRepayModal({ ...repayModal, amount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRepayModal({ open: false, loan: null, amount: '', sourceAcc: '' })}
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
              Process Repayment (PKG_LOAN.pay_emi)
            </button>
          </div>
        </form>
      </Modal>

      {/* Approve / Reject Modal */}
      <ConfirmModal
        isOpen={approveModal.open}
        onClose={() => setApproveModal({ open: false, loan: null, action: 'APPROVED', remarks: '' })}
        onConfirm={handleApproveLoan}
        title="Approve Loan Application"
        message={`Approve loan ${approveModal.loan?.loan_reference} of $${Number(approveModal.loan?.principal_amount).toLocaleString()}? Upon approval, funds will be immediately disbursed into account ${approveModal.loan?.account_number} by procedure PKG_LOAN.approve_loan.`}
        confirmText="Approve & Disburse Funds"
        isLoading={submitting}
        previewDetails={
          approveModal.loan
            ? {
                'Loan Reference': approveModal.loan.loan_reference,
                'Principal Amount': `$${Number(approveModal.loan.principal_amount).toLocaleString()}`,
                'Calculated EMI': `$${Number(approveModal.loan.emi_amount).toLocaleString()}`,
                'Applicant': approveModal.loan.customer_name || 'N/A'
              }
            : null
        }
      />

      {/* Repayment Schedule Drawer Modal */}
      <Modal
        isOpen={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, loan: null, schedule: [], loading: false })}
        title={`Repayment Schedule: ${scheduleModal.loan?.loan_reference}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          {scheduleModal.loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : scheduleModal.schedule.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No installment payments recorded yet for this facility.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount Paid</th>
                    <th className="py-2.5 px-3">Principal</th>
                    <th className="py-2.5 px-3">Interest</th>
                    <th className="py-2.5 px-3">Remaining</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {scheduleModal.schedule.map((s) => (
                    <tr key={s.payment_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold">{s.payment_number}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.payment_date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${Number(s.amount_paid).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-emerald-600">${Number(s.principal_paid).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-amber-600">${Number(s.interest_paid).toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold">${Number(s.balance_remaining).toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <Badge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setScheduleModal({ open: false, loan: null, schedule: [], loading: false })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
