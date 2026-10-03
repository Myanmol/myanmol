import React from 'react';
import {
  FileText,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  UserPlus,
  X,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action: 'sale' | 'purchase' | 'receipt' | 'payment' | 'expense' | 'party'
  ) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'sale' as const,
      title: 'Sales Bill (Invoice)',
      subtitle: 'Date, Bill No, Party, Site, Items, Qty, Rate',
      icon: FileText,
      color: 'bg-emerald-500 text-white',
      badge: 'You Will Receive (Dr)',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'purchase' as const,
      title: 'Purchase Bill Entry',
      subtitle: 'Supplier Bill No, Items, Qty, Rate, Yard/Site',
      icon: ShoppingCart,
      color: 'bg-rose-500 text-white',
      badge: 'You Have To Pay (Cr)',
      badgeColor: 'bg-rose-50 text-rose-700',
    },
    {
      id: 'receipt' as const,
      title: 'Payment Received (Receipt)',
      subtitle: 'Customer Inward Cash, UPI, Bank Transfer',
      icon: ArrowDownLeft,
      color: 'bg-blue-600 text-white',
      badge: 'Reduces Receivable (Cr)',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'payment' as const,
      title: 'Payment Made (Voucher)',
      subtitle: 'Outward payment to vendor / supplier',
      icon: ArrowUpRight,
      color: 'bg-amber-600 text-white',
      badge: 'Reduces Payable (Dr)',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'expense' as const,
      title: 'Business Expense',
      subtitle: 'Fuel, Labor, Maintenance, Office, Misc',
      icon: TrendingDown,
      color: 'bg-slate-700 text-white',
      badge: 'Operational Outflow',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'party' as const,
      title: 'Add New Party',
      subtitle: 'Customer, Supplier, Opening Balance, Site',
      icon: UserPlus,
      color: 'bg-indigo-600 text-white',
      badge: 'Directory & Ledger',
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">New Entry / Record</h3>
            <p className="text-xs text-slate-500">Choose transaction or entity type to record</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 divide-y divide-slate-100 overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all flex items-center gap-3.5 group"
              >
                <div className={`w-11 h-11 rounded-xl ${act.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {act.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${act.badgeColor}`}>
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{act.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
