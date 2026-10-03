import React, { useState } from 'react';
import {
  ArrowLeft,
  FileDown,
  FileSpreadsheet,
  Plus,
  Phone,
  MessageCircle,
  Building,
  MapPin,
  Calendar,
  Edit3,
  CreditCard,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  CompanyProfile,
  FinancialTransaction,
} from '../types';
import { generatePartyLedgerStatement } from '../utils/ledger';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportPartyLedgerPDF, getPartyLedgerPDFBlob } from '../utils/pdfExport';
import { exportPartyLedgerExcel } from '../utils/excelExport';
import { getAccessToken } from '../utils/firebaseAuth';
import { getOrCreateFinLedgerFolder, uploadFileToDrive } from '../utils/googleDrive';

interface PartyLedgerViewProps {
  party: Party;
  company: CompanyProfile;
  sales: SaleBill[];
  receipts: Receipt[];
  purchases: PurchaseBill[];
  payments: Payment[];
  balanceAsOfDate: string;
  onBack: () => void;
  onEditParty: (party: Party) => void;
  onAddSale: (partyId: string) => void;
  onAddReceipt: (partyId: string) => void;
  onAddPurchase: (partyId: string) => void;
  onAddPayment: (partyId: string) => void;
  onViewTransaction: (tx: FinancialTransaction) => void;
  onOpenGoogleDrive: () => void;
}

export const PartyLedgerView: React.FC<PartyLedgerViewProps> = ({
  party,
  company,
  sales,
  receipts,
  purchases,
  payments,
  balanceAsOfDate,
  onBack,
  onEditParty,
  onAddSale,
  onAddReceipt,
  onAddPurchase,
  onAddPayment,
  onViewTransaction,
  onOpenGoogleDrive,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [cutoffDate, setCutoffDate] = useState<string>(balanceAsOfDate);

  // Generate running ledger statement
  const {
    entries,
    openingBalanceRow,
    totalDebit,
    totalCredit,
    closingBalance,
    closingStatus,
  } = generatePartyLedgerStatement(
    party,
    sales,
    receipts,
    purchases,
    payments,
    dateFilter === 'custom' && startDate ? startDate : undefined,
    cutoffDate
  );

  const handleExportPDF = () => {
    exportPartyLedgerPDF(
      company,
      party,
      sales,
      receipts,
      purchases,
      payments,
      cutoffDate,
      dateFilter === 'custom' && startDate ? startDate : undefined
    );
  };

  const handleExportExcel = () => {
    exportPartyLedgerExcel(
      company,
      party,
      sales,
      receipts,
      purchases,
      payments,
      cutoffDate,
      dateFilter === 'custom' && startDate ? startDate : undefined
    );
  };

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveNotification, setDriveNotification] = useState<string | null>(null);

  const handleSaveToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      onOpenGoogleDrive();
      return;
    }

    setIsSavingToDrive(true);
    try {
      const folderId = await getOrCreateFinLedgerFolder(token);
      const { blob, fileName } = getPartyLedgerPDFBlob(
        company,
        party,
        sales,
        receipts,
        purchases,
        payments,
        cutoffDate,
        dateFilter === 'custom' && startDate ? startDate : undefined
      );

      await uploadFileToDrive(token, fileName, 'application/pdf', blob, folderId);
      setDriveNotification(`Statement saved to Google Drive (FinLedger Accounting folder)!`);
      setTimeout(() => setDriveNotification(null), 4000);
    } catch (err: any) {
      console.error('Drive save error:', err);
      alert('Failed to save to Google Drive: ' + err.message);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleCall = () => {
    if (party.phone) {
      window.location.href = `tel:${party.phone.replace(/[^0-9+]/g, '')}`;
    }
  };

  const handleWhatsApp = () => {
    if (party.phone) {
      const cleanPhone = party.phone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(
        `Hello ${party.name},\nRegarding your ledger balance with ${company.name} as of ${formatDate(
          cutoffDate
        )}: Outstanding balance is ${formatCurrency(closingBalance)} (${
          closingStatus === 'receivable' ? 'Receivable' : 'Payable'
        }). Please verify.`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-slate-900 text-white px-4 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Parties</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download PDF Ledger"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            title="Upload Statement to Google Drive"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" fill="none">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
              <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
              <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.85 0H34.45c-1.65 0-3.2.4-4.55 1.2z" fill="#00832D"/>
              <path d="m59.8 53-13.75-23.8-13.75 23.8h5.85L43.65 43.5 49.15 53z" fill="#2684FC"/>
              <path d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
            </svg>
            <span className="hidden sm:inline">{isSavingToDrive ? 'Saving...' : 'Drive'}</span>
          </button>
          <button
            onClick={() => onEditParty(party)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Edit Party Info"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {driveNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{driveNotification}</span>
            <button
              onClick={onOpenGoogleDrive}
              className="text-indigo-600 underline font-bold ml-2"
            >
              View Drive Files
            </button>
          </div>
        )}
        {/* Party Profile Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{party.name}</h2>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    party.type === 'customer'
                      ? 'bg-emerald-100 text-emerald-800'
                      : party.type === 'supplier'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {party.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {party.phone && (
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-slate-400" /> {party.phone}
                  </span>
                )}
                {party.site && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {party.site}
                  </span>
                )}
                {party.address && (
                  <span className="text-slate-500 hidden sm:inline">
                    · {party.address}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2">
              {party.phone && (
                <>
                  <button
                    onClick={handleCall}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Call Party"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title="Send WhatsApp Balance Notice"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Real-Time Balance Hero Card */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`sm:col-span-2 p-4 rounded-xl border flex items-center justify-between ${
                closingStatus === 'receivable'
                  ? 'bg-amber-500/10 border-amber-300/40 text-amber-900'
                  : closingStatus === 'payable'
                  ? 'bg-rose-500/10 border-rose-300/40 text-rose-900'
                  : 'bg-emerald-500/10 border-emerald-300/40 text-emerald-900'
              }`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                  {closingStatus === 'receivable'
                    ? 'Total Balance Due (Receivable / Dr)'
                    : closingStatus === 'payable'
                    ? 'Total Balance Due (Payable / Cr)'
                    : 'Account Settled'}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                  {formatCurrency(closingBalance)}
                </div>
                <div className="text-[11px] font-medium opacity-80 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Real-time balance as of {formatDate(cutoffDate)}</span>
                </div>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  closingStatus === 'receivable'
                    ? 'bg-amber-500 text-white'
                    : closingStatus === 'payable'
                    ? 'bg-rose-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {closingStatus === 'receivable' ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
            </div>

            {/* Quick action buttons for this party */}
            <div className="grid grid-cols-2 gap-2">
              {party.type === 'customer' || party.type === 'both' ? (
                <>
                  <button
                    onClick={() => onAddSale(party.id)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Sale Bill</span>
                  </button>
                  <button
                    onClick={() => onAddReceipt(party.id)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>+ Receipt</span>
                  </button>
                </>
              ) : null}

              {party.type === 'supplier' || party.type === 'both' ? (
                <>
                  <button
                    onClick={() => onAddPurchase(party.id)}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Purchase</span>
                  </button>
                  <button
                    onClick={() => onAddPayment(party.id)}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>+ Payment</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Date Filter & Cutoff Selector Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Calculate Balance Up To:</span>
            <input
              type="date"
              value={cutoffDate}
              onChange={(e) => {
                if (e.target.value) setCutoffDate(e.target.value);
              }}
              className="px-2 py-1 border border-slate-300 rounded-md font-mono text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
            >
              <FileDown className="w-3.5 h-3.5" /> PDF Statement
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleExportExcel}
              className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Statement
            </button>
          </div>
        </div>

        {/* Running Ledger Timeline / Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Running Ledger Statement ({entries.length + 1} records)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Debit (Dr) = Owed to you  ·  Credit (Cr) = Received / Payable
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Particulars & Items</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Running Balance</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Opening Balance Row */}
                <tr className="bg-slate-50/70 font-medium">
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {formatDate(openingBalanceRow.date)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                      OPENING
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">OP-BAL</td>
                  <td className="py-3 px-3 text-slate-700">Initial Opening Balance</td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-amber-700">
                    {openingBalanceRow.debit > 0 ? formatCurrency(openingBalanceRow.debit) : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-rose-700">
                    {openingBalanceRow.credit > 0 ? formatCurrency(openingBalanceRow.credit) : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(openingBalanceRow.runningBalance)}{' '}
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {openingBalanceRow.balanceType === 'receivable'
                        ? 'Dr'
                        : openingBalanceRow.balanceType === 'payable'
                        ? 'Cr'
                        : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">-</td>
                </tr>

                {/* Ledger Entries */}
                {entries.map((entry) => {
                  const isSale = entry.type === 'sale';
                  const isPurchase = entry.type === 'purchase';
                  const isReceipt = entry.type === 'receipt';
                  const isPayment = entry.type === 'payment';

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => entry.rawTransaction && onViewTransaction(entry.rawTransaction)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {entry.voucherNo}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {entry.particulars}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {entry.site && (
                            <span className="flex items-center gap-0.5 text-slate-500">
                              <MapPin className="w-2.5 h-2.5 text-indigo-500" /> {entry.site}
                            </span>
                          )}
                          {entry.recordedBy && <span>· By: {entry.recordedBy}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-emerald-700 whitespace-nowrap">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-blue-700 whitespace-nowrap">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(entry.runningBalance)}{' '}
                        <span
                          className={`text-[10px] font-semibold ${
                            entry.balanceType === 'receivable'
                              ? 'text-amber-700'
                              : entry.balanceType === 'payable'
                              ? 'text-rose-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {entry.balanceType === 'receivable'
                            ? 'Dr'
                            : entry.balanceType === 'payable'
                            ? 'Cr'
                            : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <ChevronRight className="w-4 h-4 text-slate-400 mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statement Footer Totals */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-700">
            <div className="space-x-4">
              <span>Total Debits (Dr): <strong className="text-emerald-700">{formatCurrency(totalDebit)}</strong></span>
              <span>Total Credits (Cr): <strong className="text-blue-700">{formatCurrency(totalCredit)}</strong></span>
            </div>
            <div className="text-right">
              <span>Closing Balance as of {formatDate(cutoffDate)}: </span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {formatCurrency(closingBalance)}{' '}
                <span className="text-xs text-indigo-700">
                  ({closingStatus === 'receivable' ? 'Receivable / Dr' : closingStatus === 'payable' ? 'Payable / Cr' : 'Settled'})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
