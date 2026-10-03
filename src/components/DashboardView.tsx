import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  FileText,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Calendar,
  Users,
  Building,
  Phone,
  MessageCircle,
} from 'lucide-react';
import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
  CompanyProfile,
  FinancialTransaction,
} from '../types';
import { calculateAllPartyBalancesAsOfDate } from '../utils/ledger';
import { formatCurrency, formatDate, getTodayISO } from '../utils/formatters';

interface DashboardViewProps {
  company: CompanyProfile;
  parties: Party[];
  sales: SaleBill[];
  purchases: PurchaseBill[];
  receipts: Receipt[];
  payments: Payment[];
  expenses: Expense[];
  balanceAsOfDate: string;
  onDateChange: (date: string) => void;
  onOpenQuickAdd: () => void;
  onSelectAction: (
    action: 'sale' | 'purchase' | 'receipt' | 'payment' | 'expense' | 'party'
  ) => void;
  onSelectParty: (party: Party) => void;
  onViewTransaction: (tx: FinancialTransaction) => void;
  onViewAllParties: () => void;
  onViewAllTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  parties,
  sales,
  purchases,
  receipts,
  payments,
  expenses,
  balanceAsOfDate,
  onDateChange,
  onOpenQuickAdd,
  onSelectAction,
  onSelectParty,
  onViewTransaction,
  onViewAllParties,
  onViewAllTransactions,
}) => {
  // Calculate real-time balances for all parties as of balanceAsOfDate
  const partySummaries = calculateAllPartyBalancesAsOfDate(
    parties,
    sales,
    receipts,
    purchases,
    payments,
    balanceAsOfDate
  );

  let totalReceivable = 0;
  let totalPayable = 0;

  partySummaries.forEach((s) => {
    if (s.netBalance > 0) totalReceivable += s.netBalance;
    if (s.netBalance < 0) totalPayable += Math.abs(s.netBalance);
  });

  const netPosition = totalReceivable - totalPayable;

  // Filter sales and receipts up to balanceAsOfDate
  const filteredSales = sales.filter((s) => s.date <= balanceAsOfDate);
  const totalSalesAmount = filteredSales.reduce((a, b) => a + b.totalAmount, 0);

  const filteredPurchases = purchases.filter((p) => p.date <= balanceAsOfDate);
  const totalPurchasesAmount = filteredPurchases.reduce((a, b) => a + b.totalAmount, 0);

  const filteredExpenses = expenses.filter((e) => e.date <= balanceAsOfDate);
  const totalExpensesAmount = filteredExpenses.reduce((a, b) => a + b.amount, 0);

  // Top parties with largest balances
  const topReceivables = [...partySummaries]
    .filter((s) => s.balanceStatus === 'receivable')
    .sort((a, b) => b.netBalance - a.netBalance)
    .slice(0, 4);

  const topPayables = [...partySummaries]
    .filter((s) => s.balanceStatus === 'payable')
    .sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance))
    .slice(0, 4);

  // Recent transactions
  const allTxs: FinancialTransaction[] = [
    ...sales,
    ...purchases,
    ...receipts,
    ...payments,
    ...expenses,
  ]
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    })
    .slice(0, 6);

  const today = getTodayISO();

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-28">
      {/* Quick As-Of Date Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">
            Real-Time Balances As Of:
          </span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            {formatDate(balanceAsOfDate)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onDateChange(today)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              balanceAsOfDate === today
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              onDateChange(d.toISOString().slice(0, 10));
            }}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Yesterday
          </button>
        </div>
      </div>

      {/* Hero Financial Summary Cards as of Date */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Receivable */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 rounded-2xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              To Receive (Dr)
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-amber-700 truncate">
            {formatCurrency(totalReceivable)}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-1 font-medium">
            From {topReceivables.length} customers
          </div>
        </div>

        {/* Total Payable */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 rounded-2xl border border-rose-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
              To Pay (Cr)
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-rose-700 truncate">
            {formatCurrency(totalPayable)}
          </div>
          <div className="text-[10px] text-rose-800/80 mt-1 font-medium">
            To {topPayables.length} suppliers
          </div>
        </div>

        {/* Net Outstanding Position */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white p-4 rounded-2xl border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              Net Position
            </span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div
            className={`text-lg sm:text-2xl font-black font-mono truncate ${
              netPosition >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(netPosition)}
          </div>
          <div className="text-[10px] text-indigo-800/80 mt-1 font-medium">
            {netPosition >= 0 ? 'Net positive cash surplus' : 'Net liabilities over dues'}
          </div>
        </div>
      </div>

      {/* Quick Transaction Action Buttons */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
            Record New Transaction
          </span>
          <span className="text-[11px] text-slate-400">1-Tap Direct Entry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onSelectAction('sale')}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left transition-all active:scale-98 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">+ Sale Bill</div>
              <div className="text-[10px] text-emerald-600">Customer Bill</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('receipt')}
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-left transition-all active:scale-98 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">+ Receipt</div>
              <div className="text-[10px] text-blue-600">Payment In</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('purchase')}
            className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-left transition-all active:scale-98 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">+ Purchase</div>
              <div className="text-[10px] text-rose-600">Supplier Bill</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('payment')}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-left transition-all active:scale-98 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">+ Payment</div>
              <div className="text-[10px] text-amber-600">Payment Out</div>
            </div>
          </button>
        </div>
      </div>

      {/* Top Customer Dues (Receivables) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Highest Outstanding Dues</h3>
          </div>
          <button
            onClick={onViewAllParties}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            <span>All ({parties.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {partySummaries.slice(0, 5).map((summary) => {
            const isReceivable = summary.balanceStatus === 'receivable';
            const isPayable = summary.balanceStatus === 'payable';

            return (
              <div
                key={summary.partyId}
                onClick={() => onSelectParty(summary.party)}
                className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 truncate">
                    <span>{summary.party.name}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        summary.party.type === 'customer'
                          ? 'bg-emerald-50 text-emerald-700'
                          : summary.party.type === 'supplier'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {summary.party.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    {summary.party.site && <span className="truncate">Site: {summary.party.site}</span>}
                    {summary.party.phone && <span>· {summary.party.phone}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-bold text-xs sm:text-sm ${
                      isReceivable
                        ? 'text-amber-700'
                        : isPayable
                        ? 'text-rose-700'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(summary.netBalance)}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {isReceivable ? 'To Receive (Dr)' : isPayable ? 'To Pay (Cr)' : 'Settled'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Transactions</h3>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {allTxs.map((tx) => {
            const isSale = tx.type === 'sale';
            const isPurchase = tx.type === 'purchase';
            const isReceipt = tx.type === 'receipt';
            const isPayment = tx.type === 'payment';

            const name = 'partyName' in tx ? tx.partyName : tx.paidTo;
            const voucherNo =
              'billNo' in tx ? tx.billNo : 'receiptNo' in tx ? tx.receiptNo : tx.voucherNo;
            const amt = 'totalAmount' in tx ? tx.totalAmount : tx.amount;

            return (
              <div
                key={tx.id}
                onClick={() => onViewTransaction(tx)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                      <FileText className="w-4 h-4" />
                    ) : isPurchase ? (
                      <ShoppingCart className="w-4 h-4" />
                    ) : isReceipt ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : isPayment ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-medium text-slate-600">{voucherNo}</span>
                      <span>· {formatDate(tx.date)}</span>
                      {tx.recordedBy && <span>· By: {tx.recordedBy.userName}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-900">
                    {formatCurrency(amt)}
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
