import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Building,
  MapPin,
  Phone,
  Calendar,
  Hash,
  User,
  CheckCircle,
} from 'lucide-react';
import { Party, PurchaseBill, BillItem, AppUser } from '../types';
import { formatCurrency, getTodayISO } from '../utils/formatters';

interface PurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  activeUser: AppUser;
  onSavePurchase: (purchase: PurchaseBill) => void;
  defaultDate?: string;
  preSelectedPartyId?: string;
}

const COMMON_UNITS = ['Ton', 'Bags', 'Trucks', 'Trips', 'Pcs', 'Brass', 'Ltrs', 'Kgs', 'Meters'];

const SUGGESTED_PURCHASE_ITEMS = [
  'Steam Boiler Coal (Raniganj)',
  'Pet Coke Fuel',
  'PPC Cement 50kg Bags',
  'OPC 53 Grade Cement',
  'Raw River Sand / Quarry Dust',
  'Fly Ash (Thermal Power Plant)',
  'Hydraulic Oil & Lubricants',
  'Fire Clay & Refractory Bricks',
];

export const PurchaseBillModal: React.FC<PurchaseBillModalProps> = ({
  isOpen,
  onClose,
  parties,
  activeUser,
  onSavePurchase,
  defaultDate,
  preSelectedPartyId,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(defaultDate || getTodayISO());
  const [billNo, setBillNo] = useState<string>(() => `PUR-${Date.now().toString().slice(-4)}`);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(preSelectedPartyId || '');
  const [partyName, setPartyName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [site, setSite] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'pitem_1',
      itemName: 'Steam Boiler Coal (Raniganj)',
      quantity: 25,
      unit: 'Ton',
      rate: 7200,
      amount: 180000,
    },
  ]);

  useEffect(() => {
    if (selectedPartyId) {
      const p = parties.find((x) => x.id === selectedPartyId);
      if (p) {
        setPartyName(p.name);
        setAddress(p.address || '');
        setSite(p.site || 'Kiln Plant Yard');
        setPhone(p.phone || '');
      }
    }
  }, [selectedPartyId, parties]);

  const totalAmount = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const r = field === 'rate' ? parseFloat(value) || 0 : item.rate;
      item.amount = Math.round(q * r * 100) / 100;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `pitem_${Date.now()}`,
        itemName: '',
        quantity: 1,
        unit: 'Ton',
        rate: 5000,
        amount: 5000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyName.trim()) {
      alert('Please enter or select a supplier name');
      return;
    }

    if (!billNo.trim()) {
      alert('Please enter a supplier invoice/bill number');
      return;
    }

    if (items.length === 0 || totalAmount <= 0) {
      alert('Please add at least one item with valid quantity and rate');
      return;
    }

    const purchaseBill: PurchaseBill = {
      id: `pur_${Date.now()}`,
      type: 'purchase',
      billNo: billNo.trim(),
      date,
      partyId: selectedPartyId || `custom_supp_${Date.now()}`,
      partyName: partyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      site: site.trim() || 'Kiln Plant Receiving Yard',
      items,
      totalAmount,
      note: note.trim(),
      recordedBy: {
        userId: activeUser.id,
        userName: activeUser.name,
        userRole: activeUser.role,
      },
      createdAt: new Date().toISOString(),
    };

    onSavePurchase(purchaseBill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Purchase Bill Entry</h3>
              <p className="text-xs text-rose-100">Credits supplier ledger (Payable / To Pay)</p>
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
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-rose-600" />
              Recording Operator:
            </span>
            <span className="font-bold">{activeUser.name} ({activeUser.role})</span>
          </div>

          {/* Row 1: Date & Bill No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Bill Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Supplier Invoice / Bill # *
              </label>
              <input
                type="text"
                required
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                placeholder="e.g. JND-COAL-901"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono font-medium text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Row 2: Supplier Selection & Details */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-rose-600" /> Supplier / Vendor Details *
              </label>
              {parties.length > 0 && (
                <span className="text-[11px] text-slate-500">Auto-fill from saved supplier</span>
              )}
            </div>

            {parties.length > 0 && (
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
              >
                <option value="">-- Choose Existing Supplier or Type Below --</option>
                {parties
                  .filter((p) => p.type === 'supplier' || p.type === 'both')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.site ? `(${p.site})` : ''} - {p.phone}
                    </option>
                  ))}
              </select>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-medium text-slate-600 text-[11px] mb-0.5">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Jindal Coal & Mineral Traders"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 text-[11px] mb-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Supplier Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98990 00000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 text-[11px] mb-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" /> Receiving Yard / Plant Site
                </label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="e.g. Kiln Coal Yard / Depot"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 text-[11px] mb-0.5">
                  Supplier Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Mandi Yard, Railway Siding"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs sm:text-sm">
                Purchased Raw Materials / Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Item #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Item / Material Name *
                    </label>
                    <input
                      type="text"
                      required
                      list={`pur-items-list-${index}`}
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      placeholder="e.g. Steam Boiler Coal"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                    />
                    <datalist id={`pur-items-list-${index}`}>
                      {SUGGESTED_PURCHASE_ITEMS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Qty *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-xs text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Rate (₹) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        value={item.rate || ''}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-xs text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Amount (₹)
                      </label>
                      <div className="w-full px-2 py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 text-right truncate">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note / Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Weighbridge Slip / Delivery Challan / Notes
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Weighbridge Slip #4410, Verified moisture 3.5%"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          {/* Total Bar */}
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-rose-800">Total Purchase Bill</div>
              <div className="text-xs text-rose-600">{items.length} item(s) total</div>
            </div>
            <div className="text-xl font-bold font-mono text-rose-700">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          {/* Submit Buttons */}
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
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle className="w-4 h-4" /> Save Purchase Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
