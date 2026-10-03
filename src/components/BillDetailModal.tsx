import React from 'react';
import {
  X,
  Printer,
  Calendar,
  Building,
  MapPin,
  Phone,
  User,
  Hash,
  CreditCard,
  FileText,
  Clock,
} from 'lucide-react';
import { FinancialTransaction, CompanyProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
  company: CompanyProfile;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  company,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSale = transaction.type === 'sale';
  const isPurchase = transaction.type === 'purchase';
  const isReceipt = transaction.type === 'receipt';
  const isPayment = transaction.type === 'payment';
  const isExpense = transaction.type === 'expense';

  const title = isSale
    ? 'Tax Invoice / Sales Bill'
    : isPurchase
    ? 'Purchase Bill / Inward Voucher'
    : isReceipt
    ? 'Payment Receipt Voucher'
    : isPayment
    ? 'Payment Voucher'
    : 'Expense Voucher';

  const voucherNo =
    'billNo' in transaction
      ? transaction.billNo
      : 'receiptNo' in transaction
      ? transaction.receiptNo
      : 'voucherNo' in transaction
      ? transaction.voucherNo
      : '-';

  const amount =
    'totalAmount' in transaction
      ? transaction.totalAmount
      : 'amount' in transaction
      ? transaction.amount
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:m-0 print:max-w-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Company Banner */}
          <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{company.name}</h2>
              <p className="text-xs text-slate-500">{company.tagline}</p>
              <p className="text-xs text-slate-600 mt-1">{company.address}</p>
              <p className="text-xs text-slate-600">Phone: {company.phone}</p>
              {company.gstin && (
                <p className="text-[11px] font-mono font-medium text-slate-500 mt-0.5">
                  GSTIN: {company.gstin}
                </p>
              )}
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                  isSale
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPurchase
                    ? 'bg-rose-100 text-rose-800'
                    : isReceipt
                    ? 'bg-blue-100 text-blue-800'
                    : isPayment
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {title}
              </span>
              <div className="text-sm font-bold font-mono text-slate-900 mt-1.5">
                #{voucherNo}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> {formatDate(transaction.date)}
              </div>
            </div>
          </div>

          {/* Party or Beneficiary Card */}
          {('partyName' in transaction || 'paidTo' in transaction) && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {isExpense ? 'Paid To / Beneficiary' : 'Party Details'}
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {'partyName' in transaction ? transaction.partyName : transaction.paidTo}
                </div>
                {'phone' in transaction && transaction.phone && (
                  <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {transaction.phone}
                  </div>
                )}
                {'address' in transaction && transaction.address && (
                  <div className="text-slate-600 mt-0.5">{transaction.address}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Site / Project & Details
                </span>
                {'site' in transaction && transaction.site && (
                  <div className="text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {transaction.site}
                  </div>
                )}
                {'paymentMode' in transaction && (
                  <div className="text-slate-700 flex items-center gap-1 mt-1">
                    <CreditCard className="w-3 h-3 text-slate-400" /> Mode: {transaction.paymentMode}
                  </div>
                )}
                {'referenceNo' in transaction && transaction.referenceNo && (
                  <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                    Ref / UTR: {transaction.referenceNo}
                  </div>
                )}
                {isExpense && 'category' in transaction && (
                  <div className="text-slate-700 font-medium mt-1">
                    Category: {transaction.category}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Line Items for Sales & Purchases */}
          {'items' in transaction && transaction.items && transaction.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                Items Particulars
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transaction.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.itemName}</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Amount Callout */}
          <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
            <span className="font-bold text-slate-700">Total Voucher Value</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">
              {formatCurrency(amount)}
            </span>
          </div>

          {/* Remarks */}
          {transaction.note && (
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 text-xs">
              <span className="font-bold text-amber-900">Remarks / Note:</span>
              <p className="text-amber-800 mt-0.5">{transaction.note}</p>
            </div>
          )}

          {/* Recorded By Operator & Timestamp */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Recorded By: <strong className="text-slate-700">{transaction.recordedBy?.userName}</strong> ({transaction.recordedBy?.userRole})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
