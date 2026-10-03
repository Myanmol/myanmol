import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Edit3,
  Building,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Party, PartyType, BalanceType } from '../types';
import { getTodayISO } from '../utils/formatters';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyToEdit?: Party | null;
  onSaveParty: (party: Party) => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  isOpen,
  onClose,
  partyToEdit,
  onSaveParty,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(partyToEdit);

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [site, setSite] = useState<string>('');
  const [type, setType] = useState<PartyType>('customer');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [openingBalanceType, setOpeningBalanceType] = useState<BalanceType>('receivable');
  const [notes, setNotes] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');

  useEffect(() => {
    if (partyToEdit) {
      setName(partyToEdit.name || '');
      setPhone(partyToEdit.phone || '');
      setAddress(partyToEdit.address || '');
      setSite(partyToEdit.site || '');
      setType(partyToEdit.type || 'customer');
      setOpeningBalance(String(partyToEdit.openingBalance || 0));
      setOpeningBalanceType(partyToEdit.openingBalanceType || 'receivable');
      setNotes(partyToEdit.notes || '');
      setGstin(partyToEdit.gstin || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setSite('');
      setType('customer');
      setOpeningBalance('0');
      setOpeningBalanceType('receivable');
      setNotes('');
      setGstin('');
    }
  }, [partyToEdit, isOpen]);

  // Adjust default opening balance type when type changes
  const handleTypeChange = (newType: PartyType) => {
    setType(newType);
    if (!partyToEdit) {
      if (newType === 'customer') {
        setOpeningBalanceType('receivable');
      } else if (newType === 'supplier') {
        setOpeningBalanceType('payable');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter party name');
      return;
    }

    const opBalNum = parseFloat(openingBalance) || 0;

    const partyData: Party = {
      id: partyToEdit ? partyToEdit.id : `party_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      site: site.trim(),
      type,
      openingBalance: Math.abs(opBalNum),
      openingBalanceType,
      createdAt: partyToEdit ? partyToEdit.createdAt : getTodayISO(),
      notes: notes.trim(),
      gstin: gstin.trim(),
    };

    onSaveParty(partyData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEditing ? 'Edit Party Details' : 'Add New Party'}
              </h3>
              <p className="text-xs text-indigo-100">
                Customer, Supplier, or Both with real-time running ledger
              </p>
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
          {/* Party Type Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-xs">
              Party Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('customer')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  type === 'customer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Customer (Buyer)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('supplier')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  type === 'supplier'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Supplier (Vendor)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('both')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  type === 'both'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Party Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400" /> Party / Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Infrastructure Ltd"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-xs sm:text-sm"
            />
          </div>

          {/* Phone & Default Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Default Site / Project
              </label>
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Skyline Towers Site 4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Billing / Office Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 18, Commercial Hub, Sector 62"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          {/* Opening Balance & Type */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Opening Balance Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Opening Balance Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Balance Type (Dr / Cr)
                </label>
                <select
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as BalanceType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
                >
                  <option value="receivable">To Receive / Receivable (Dr - They owe us)</option>
                  <option value="payable">To Pay / Payable (Cr - We owe them)</option>
                </select>
              </div>
            </div>
          </div>

          {/* GSTIN & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1 text-xs flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> GSTIN / Tax ID (Optional)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1 text-xs">
                Internal Remarks / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 15-day credit limit"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
              />
            </div>
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
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle className="w-4 h-4" /> {isEditing ? 'Update Party' : 'Create Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
