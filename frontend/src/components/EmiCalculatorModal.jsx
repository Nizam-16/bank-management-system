import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { Calculator, DollarSign, Calendar, Percent } from 'lucide-react';

export default function EmiCalculatorModal({ isOpen, onClose }) {
  const [principal, setPrincipal] = useState(25000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [tenureMonths, setTenureMonths] = useState(36);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const P = Number(principal);
    const r = (Number(interestRate) / 100) / 12;
    const n = Number(tenureMonths);

    if (P <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };
    if (r === 0) {
      const e = P / n;
      return { emi: Math.round(e * 100) / 100, totalInterest: 0, totalPayable: P };
    }

    const calculatedEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const payable = calculatedEmi * n;
    const interest = payable - P;

    return {
      emi: Math.round(calculatedEmi * 100) / 100,
      totalInterest: Math.round(interest * 100) / 100,
      totalPayable: Math.round(payable * 100) / 100
    };
  }, [principal, interestRate, tenureMonths]);

  const principalRatio = totalPayable > 0 ? (principal / totalPayable) * 100 : 100;
  const interestRatio = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loan EMI & Amortization Calculator" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Sliders and Controls */}
        <div className="space-y-4">
          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-600" /> Loan Principal Amount
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">${Number(principal).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-600" /> Annual Interest Rate (%)
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" /> Loan Tenure (Months)
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{tenureMonths} months ({Math.round(tenureMonths / 12 * 10) / 10} yrs)</span>
            </div>
            <input
              type="range"
              min="6"
              max="240"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Highlighted Results Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-brand-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-indigo-100 dark:border-slate-700 text-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Monthly Equated Installment (EMI)
          </span>
          <div className="mt-1 text-4xl font-extrabold text-brand-600 dark:text-brand-400">
            ${emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Calculated via standard PL/SQL package PKG_LOAN.calculate_emi
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-indigo-100/80 dark:border-slate-700/80">
            <div className="text-left">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Interest Payable</span>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Repayment</span>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="mt-4">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${principalRatio}%` }}
                className="bg-brand-600 dark:bg-brand-500 transition-all duration-300"
                title={`Principal: ${Math.round(principalRatio)}%`}
              />
              <div
                style={{ width: `${interestRatio}%` }}
                className="bg-amber-500 transition-all duration-300"
                title={`Interest: ${Math.round(interestRatio)}%`}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-600 inline-block"></span> Principal ({Math.round(principalRatio)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Interest ({Math.round(interestRatio)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
