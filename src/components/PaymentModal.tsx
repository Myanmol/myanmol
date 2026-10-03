import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  Building,
  Calendar,
  Hash,
  User,
  CheckCircle,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { Party, Payment, PaymentMode, AppUser } from '../types';
import { getTodayISO } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  activeUser: AppUser;
  onSavePayment: (payment: Payment) => void;
  defaultDate?: string;
  preSelectedPartyId?: string;
}

const PAYMENT_MODES: PaymentMode[] = [
  'Bank Transfer (NEFT/RTGS)',
  'Cash',
  'UPI / GPay / PhonePe',
  'Cheque',
  'Other',
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  parties,
  activeUser,
  onSavePayment,
  defaultDate,
  preSelectedPartyId,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(defaultDate || getTodayISO());
  const [voucherNo, setVoucherNo] = useState<string>(() => `PAY-${Date.now().toString().slice(-4)}`);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(preSelectedPartyId || '');
  const [partyName, setPartyName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer (NEFT/RTGS)');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [site, setSite] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (selectedPartyId) {
      const p = parties.find((x) => x.id === selectedPartyId);
      if (p) {
        setPartyName(p.name);
        setSite(p.site || '');
      }
    }
  }, [selectedPartyId, parties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (!partyName.trim()) {
      alert('Please enter or select a supplier name');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      type: 'payment',
      voucherNo: voucherNo.trim(),
      date,
      partyId: selectedPartyId || `custom_party_${Date.now()}`,
      partyName: partyName.trim(),
      amount: numericAmount,
      paymentMode,
      referenceNo: referenceNo.trim(),
      site: site.trim(),
      note: note.trim(),
      recordedBy: {
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
      },
      createdAt: new Date().toISOString(),
    };

    onSavePayment(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Payment Made (Supplier)</h3>
              <p className="text-xs text-amber-100">Outward payment to vendor (Debits party / clears payable)</p>
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
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Recording Operator:
            </span>
            <span className="font-bold">{activeUser.name} ({activeUser.role})</span>
          </div>

          {/* Row 1: Date & Voucher No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Payment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Payment Voucher # *
              </label>
              <input
                type="text"
                required
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="e.g. PAY-2026-031"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-medium text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-600" /> Paid To (Supplier / Vendor) *
            </label>

            {parties.length > 0 && (
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
              >
                <option value="">-- Choose Existing Supplier or Type Below --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type.toUpperCase()}) {p.site ? `· ${p.site}` : ''}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Supplier / Vendor Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 text-xs"
            />
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-xs">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-amber-700 bg-white focus:ring-2 focus:ring-amber-500"
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

          {/* Reference & Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1 text-xs">
                Reference / Cheque / UTR No.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. Cheque #441209 or RTGS Ref"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Plant / Yard Site
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Kiln Coal Yard"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">
              Remarks / Narration
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Clear invoice #889"
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
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle className="w-4 h-4" /> Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
