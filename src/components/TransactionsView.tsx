import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Trash2,
  Calendar,
  User,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import {
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
  FinancialTransaction,
  AppUser,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionsViewProps {
  sales: SaleBill[];
  purchases: PurchaseBill[];
  receipts: Receipt[];
  payments: Payment[];
  expenses: Expense[];
  users: AppUser[];
  onViewTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string, type: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  sales,
  purchases,
  receipts,
  payments,
  expenses,
  users,
  onViewTransaction,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'sale' | 'purchase' | 'receipt' | 'payment' | 'expense'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Combine all transactions
  const allTxs: FinancialTransaction[] = [
    ...sales,
    ...purchases,
    ...receipts,
    ...payments,
    ...expenses,
  ].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  // Filter
  const filteredTxs = allTxs.filter((tx) => {
    // Type tab
    if (activeTab !== 'all' && tx.type !== activeTab) {
      return false;
    }

    // User filter
    if (filterUser !== 'all' && tx.recordedBy?.userId !== filterUser) {
      return false;
    }

    // Date range
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const party = 'partyName' in tx ? tx.partyName.toLowerCase() : '';
      const paidTo = 'paidTo' in tx ? tx.paidTo.toLowerCase() : '';
      const voucherNo = (
        'billNo' in tx ? tx.billNo : 'receiptNo' in tx ? tx.receiptNo : tx.voucherNo
      ).toLowerCase();
      const site = ('site' in tx && tx.site ? tx.site : '').toLowerCase();
      const note = (tx.note || '').toLowerCase();

      // Check items if sale or purchase
      const itemsMatch =
        'items' in tx &&
        tx.items.some((i) => i.itemName.toLowerCase().includes(q));

      return (
        party.includes(q) ||
        paidTo.includes(q) ||
        voucherNo.includes(q) ||
        site.includes(q) ||
        note.includes(q) ||
        itemsMatch
      );
    }

    return true;
  });

  const totalFilteredAmount = filteredTxs.reduce((acc, tx) => {
    const amt = 'totalAmount' in tx ? tx.totalAmount : tx.amount;
    return acc + amt;
  }, 0);

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-28">
      {/* Top Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by bill #, party, site, material item..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        {/* Date and User Filter Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Operators</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[11px]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-700 font-mono text-[11px] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[11px]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-700 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {(startDate || endDate || filterUser !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilterUser('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Entries ({allTxs.length})
        </button>

        <button
          onClick={() => setActiveTab('sale')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'sale'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sales Bills ({sales.length})
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'receipt'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Receipts ({receipts.length})
        </button>

        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'purchase'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Purchases ({purchases.length})
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'payment'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Payments ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('expense')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            activeTab === 'expense'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Expenses ({expenses.length})
        </button>
      </div>

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>Showing {filteredTxs.length} records</span>
        <span>
          Sum Total: <strong className="text-slate-900 font-mono">{formatCurrency(totalFilteredAmount)}</strong>
        </span>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTxs.map((tx) => {
          const isSale = tx.type === 'sale';
          const isPurchase = tx.type === 'purchase';
          const isReceipt = tx.type === 'receipt';
          const isPayment = tx.type === 'payment';
          const isExpense = tx.type === 'expense';

          const name = 'partyName' in tx ? tx.partyName : tx.paidTo;
          const voucherNo =
            'billNo' in tx ? tx.billNo : 'receiptNo' in tx ? tx.receiptNo : tx.voucherNo;
          const amt = 'totalAmount' in tx ? tx.totalAmount : tx.amount;

          // Item snippet
          const itemSummary =
            'items' in tx && tx.items.length > 0
              ? tx.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')
              : 'category' in tx
              ? tx.category
              : 'paymentMode' in tx
              ? `Mode: ${tx.paymentMode}`
              : '';

          return (
            <div
              key={tx.id}
              onClick={() => onViewTransaction(tx)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 p-3.5 cursor-pointer transition-all hover:bg-slate-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSale
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPurchase
                        ? 'bg-rose-100 text-rose-700'
                        : isReceipt
                        ? 'bg-blue-100 text-blue-700'
                        : isPayment
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isSale ? (
                      <FileText className="w-5 h-5" />
                    ) : isPurchase ? (
                      <ShoppingCart className="w-5 h-5" />
                    ) : isReceipt ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isPayment ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {name}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          isSale
                            ? 'bg-emerald-50 text-emerald-700'
                            : isPurchase
                            ? 'bg-rose-50 text-rose-700'
                            : isReceipt
                            ? 'bg-blue-50 text-blue-700'
                            : isPayment
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {itemSummary}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                      <span className="font-mono font-medium text-slate-600">
                        #{voucherNo}
                      </span>
                      <span>{formatDate(tx.date)}</span>
                      {'site' in tx && tx.site && (
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <MapPin className="w-2.5 h-2.5 text-indigo-500" /> {tx.site}
                        </span>
                      )}
                      {tx.recordedBy && (
                        <span className="text-indigo-600 font-medium">
                          By: {tx.recordedBy.userName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <div
                    className={`font-mono font-black text-sm sm:text-base ${
                      isSale
                        ? 'text-emerald-700'
                        : isPurchase
                        ? 'text-rose-700'
                        : isReceipt
                        ? 'text-blue-700'
                        : isPayment
                        ? 'text-amber-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {formatCurrency(amt)}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete this ${tx.type} entry (${voucherNo})?`)) {
                        onDeleteTransaction(tx.id, tx.type);
                      }
                    }}
                    className="mt-2 text-slate-300 hover:text-rose-600 p-1 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTxs.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-semibold text-slate-600">No transactions recorded</div>
            <p className="text-xs">Use the '+' button to record sales, purchases, or payments</p>
          </div>
        )}
      </div>
    </div>
  );
};
