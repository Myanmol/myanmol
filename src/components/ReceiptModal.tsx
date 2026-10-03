import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  Building,
  Calendar,
  Hash,
  User,
  CheckCircle,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { Party, Receipt, PaymentMode, AppUser } from '../types';
import { formatCurrency, getTodayISO } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  activeUser: AppUser;
  onSaveReceipt: (receipt: Receipt) => void;
  defaultDate?: string;
  preSelectedPartyId?: string;
}

const PAYMENT_MODES: PaymentMode[] = [
  'UPI / GPay / PhonePe',
  'Cash',
  'Bank Transfer (NEFT/RTGS)',
  'Cheque',
  'Other',
];

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  parties,
  activeUser,
  onSaveReceipt,
  defaultDate,
  preSelectedPartyId,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(defaultDate || getTodayISO());
  const [receiptNo, setReceiptNo] = useState<string>(() => `REC-${Date.now().toString().slice(-4)}`);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(preSelectedPartyId || '');
  const [partyName, setPartyName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI / GPay / PhonePe');
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
      alert('Please enter or select a customer name');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid received amount');
      return;
    }

    const receipt: Receipt = {
      id: `rec_${Date.now()}`,
      type: 'receipt',
      receiptNo: receiptNo.trim(),
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

    onSaveReceipt(receipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Payment Received (Receipt)</h3>
              <p className="text-xs text-blue-100">Customer money inward (Credits party ledger / reduces dues)</p>
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
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Recording Operator:
            </span>
            <span className="font-bold">{activeUser.name} ({activeUser.role})</span>
          </div>

          {/* Row 1: Date & Receipt No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Receipt Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Receipt No. *
              </label>
              <input
                type="text"
                required
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="e.g. REC-2026-051"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-medium text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" /> Received From (Customer) *
            </label>

            {parties.length > 0 && (
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
              >
                <option value="">-- Choose Existing Party or Type Below --</option>
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
              placeholder="Party / Customer Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 text-xs"
            />
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-xs">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-blue-700 bg-white focus:ring-2 focus:ring-blue-500"
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
                Reference / UTR / Cheque No.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. UTR-49102847 or Cheque #2041"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Site / Project Tag
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Skyline Heights Tower B"
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
              placeholder="e.g. Part payment against invoice #101"
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
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle className="w-4 h-4" /> Save Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
