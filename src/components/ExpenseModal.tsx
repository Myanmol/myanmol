import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  Calendar,
  Hash,
  User,
  CheckCircle,
  CreditCard,
  Tag,
  MapPin,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMode, AppUser } from '../types';
import { getTodayISO } from '../utils/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: AppUser;
  onSaveExpense: (expense: Expense) => void;
  defaultDate?: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Fuel & Transport',
  'Labor & Wages',
  'Raw Materials & Minerals',
  'Electricity & Utilities',
  'Machinery Maintenance',
  'Office & Admin',
  'Tea & Refreshments',
  'Rent & Taxes',
  'Miscellaneous',
];

const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI / GPay / PhonePe',
  'Bank Transfer (NEFT/RTGS)',
  'Cheque',
  'Other',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onSaveExpense,
  defaultDate,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(defaultDate || getTodayISO());
  const [voucherNo, setVoucherNo] = useState<string>(() => `EXP-${Date.now().toString().slice(-4)}`);
  const [category, setCategory] = useState<ExpenseCategory>('Fuel & Transport');
  const [paidTo, setPaidTo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [site, setSite] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (!paidTo.trim()) {
      alert('Please enter who was paid / beneficiary / reason');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    const expense: Expense = {
      id: `exp_${Date.now()}`,
      type: 'expense',
      voucherNo: voucherNo.trim(),
      date,
      category,
      paidTo: paidTo.trim(),
      amount: numericAmount,
      paymentMode,
      site: site.trim(),
      note: note.trim(),
      recordedBy: {
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
      },
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Business Expense Entry</h3>
              <p className="text-xs text-slate-300">Record direct operational expenses and wages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {/* Operator Tag */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-600" />
              Recording Operator:
            </span>
            <span className="font-bold">{activeUser.name} ({activeUser.role})</span>
          </div>

          {/* Row 1: Date & Voucher No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-800 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Voucher No. *
              </label>
              <input
                type="text"
                required
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="e.g. EXP-2026-081"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 font-mono font-medium text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Category & Beneficiary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Paid To / Beneficiary *
              </label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Bharat Petroleum / Labor Sirdar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-xs">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Site / Plant */}
          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Plant Unit / Vehicle / Site
            </label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="e.g. Kiln Plant Unit #2 or Tractor Fleet"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">
              Remarks / Bill / Description
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Diesel 120 Liters bill attached"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md shadow-slate-800/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle className="w-4 h-4" /> Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
