import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Building,
  Calendar,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  Cloud,
  ExternalLink,
} from 'lucide-react';
import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
  CompanyProfile,
} from '../types';
import { calculateAllPartyBalancesAsOfDate } from '../utils/ledger';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  exportPartyLedgerPDF,
  exportAllPartiesSummaryPDF,
  getPartyLedgerPDFBlob,
  getAllPartiesSummaryPDFBlob,
} from '../utils/pdfExport';
import {
  exportPartyLedgerExcel,
  exportAllPartiesSummaryExcel,
  exportSalesRegisterExcel,
  exportExpensesExcel,
  getPartyLedgerExcelBlob,
  getAllPartiesSummaryExcelBlob,
} from '../utils/excelExport';
import { getAccessToken } from '../utils/firebaseAuth';
import { getOrCreateFinLedgerFolder, uploadFileToDrive } from '../utils/googleDrive';

interface ReportsViewProps {
  company: CompanyProfile;
  parties: Party[];
  sales: SaleBill[];
  purchases: PurchaseBill[];
  receipts: Receipt[];
  payments: Payment[];
  expenses: Expense[];
  balanceAsOfDate: string;
  onOpenGoogleDrive: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  company,
  parties,
  sales,
  purchases,
  receipts,
  payments,
  expenses,
  balanceAsOfDate,
  onOpenGoogleDrive,
}) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    parties.length > 0 ? parties[0].id : ''
  );
  const [reportAsOfDate, setReportAsOfDate] = useState<string>(balanceAsOfDate);
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // 1. Party Ledger Local Exports
  const handleExportPartyPDF = () => {
    if (!selectedParty) return;
    exportPartyLedgerPDF(
      company,
      selectedParty,
      sales,
      receipts,
      purchases,
      payments,
      reportAsOfDate,
      reportStartDate || undefined
    );
    showStatus(`Downloaded PDF Ledger for ${selectedParty.name}`);
  };

  const handleExportPartyExcel = () => {
    if (!selectedParty) return;
    exportPartyLedgerExcel(
      company,
      selectedParty,
      sales,
      receipts,
      purchases,
      payments,
      reportAsOfDate,
      reportStartDate || undefined
    );
    showStatus(`Downloaded Excel Ledger (.xlsx) for ${selectedParty.name}`);
  };

  // 1b. Party Ledger Save to Google Drive
  const handleSavePartyPDFToDrive = async () => {
    if (!selectedParty) return;
    const token = await getAccessToken();
    if (!token) {
      onOpenGoogleDrive();
      return;
    }

    setIsUploadingToDrive(true);
    try {
      const folderId = await getOrCreateFinLedgerFolder(token);
      const { blob, fileName } = getPartyLedgerPDFBlob(
        company,
        selectedParty,
        sales,
        receipts,
        purchases,
        payments,
        reportAsOfDate,
        reportStartDate || undefined
      );

      await uploadFileToDrive(token, fileName, 'application/pdf', blob, folderId);
      showStatus(`Saved "${fileName}" to Google Drive (FinLedger folder)!`);
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      alert('Failed to save to Google Drive: ' + err.message);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleSavePartyExcelToDrive = async () => {
    if (!selectedParty) return;
    const token = await getAccessToken();
    if (!token) {
      onOpenGoogleDrive();
      return;
    }

    setIsUploadingToDrive(true);
    try {
      const folderId = await getOrCreateFinLedgerFolder(token);
      const { blob, fileName } = getPartyLedgerExcelBlob(
        company,
        selectedParty,
        sales,
        receipts,
        purchases,
        payments,
        reportAsOfDate,
        reportStartDate || undefined
      );

      await uploadFileToDrive(
        token,
        fileName,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        blob,
        folderId
      );
      showStatus(`Saved "${fileName}" to Google Drive (FinLedger folder)!`);
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      alert('Failed to save to Google Drive: ' + err.message);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // 2. All Parties Summary Exports
  const summaries = calculateAllPartyBalancesAsOfDate(
    parties,
    sales,
    receipts,
    purchases,
    payments,
    reportAsOfDate
  );

  const handleExportAllPDF = () => {
    exportAllPartiesSummaryPDF(company, summaries, reportAsOfDate);
    showStatus(`Downloaded All Parties Balance Sheet (PDF) as of ${formatDate(reportAsOfDate)}`);
  };

  const handleExportAllExcel = () => {
    exportAllPartiesSummaryExcel(company, summaries, reportAsOfDate);
    showStatus(`Downloaded All Parties Balance Sheet (Excel) as of ${formatDate(reportAsOfDate)}`);
  };

  const handleSaveAllPDFToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      onOpenGoogleDrive();
      return;
    }

    setIsUploadingToDrive(true);
    try {
      const folderId = await getOrCreateFinLedgerFolder(token);
      const { blob, fileName } = getAllPartiesSummaryPDFBlob(company, summaries, reportAsOfDate);
      await uploadFileToDrive(token, fileName, 'application/pdf', blob, folderId);
      showStatus(`Saved Balance Sheet PDF to Google Drive!`);
    } catch (err: any) {
      alert('Failed to save to Google Drive: ' + err.message);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // 3. Sales Register Export
  const handleExportSalesExcel = () => {
    exportSalesRegisterExcel(company, sales, reportAsOfDate);
    showStatus(`Downloaded Sales Register (.xlsx) with item level details`);
  };

  // 4. Expenses Register Export
  const handleExportExpensesExcel = () => {
    exportExpensesExcel(company, expenses, reportAsOfDate);
    showStatus(`Downloaded Expenses Register (.xlsx)`);
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-5 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Accounting Reports & Cloud Vault</h2>
              <p className="text-xs text-slate-300">
                Export party ledger statements and balance sheets in PDF & Excel formats or sync to Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onOpenGoogleDrive}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Cloud className="w-4 h-4 text-indigo-300" />
            <span>Google Drive Vault</span>
          </button>
        </div>

        {/* Global as-of date selector for reports */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">Calculate Balances As Of:</span>
            <input
              type="date"
              value={reportAsOfDate}
              onChange={(e) => {
                if (e.target.value) setReportAsOfDate(e.target.value);
              }}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-300 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTION 1: Party-wise Detailed Ledger Statement (CRITICAL REQUIREMENT) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              1. Party Ledger Statement by Name
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            PDF & Excel (.xlsx)
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Select any customer or supplier to generate complete itemized running ledger statement with bill numbers, line items, debit, credit, and closing balance.
        </p>

        {/* Party Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Choose Party / Client *</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-medium"
          >
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type.toUpperCase()}) {p.site ? `· ${p.site}` : ''} - {p.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Party Summary Card */}
        {selectedParty && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-900 text-sm">{selectedParty.name}</div>
              <div className="text-slate-500 mt-0.5">{selectedParty.phone || 'No phone'}</div>
              <div className="text-slate-500">{selectedParty.address || 'No address'}</div>
            </div>
            <div>
              <div className="text-slate-500">
                Site: <strong className="text-slate-800">{selectedParty.site || 'Default'}</strong>
              </div>
              <div className="text-slate-500 mt-0.5">
                Initial Opening: <strong>₹{selectedParty.openingBalance} ({selectedParty.openingBalanceType})</strong>
              </div>
            </div>
          </div>
        )}

        {/* Local Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportPartyPDF}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileDown className="w-4 h-4" /> Download Statement (PDF)
          </button>

          <button
            onClick={handleExportPartyExcel}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Statement (Excel .xlsx)
          </button>
        </div>

        {/* Google Drive Upload Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            Cloud Storage:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePartyPDFToDrive}
              disabled={isUploadingToDrive}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" /> Save PDF to Drive
            </button>
            <button
              onClick={handleSavePartyExcelToDrive}
              disabled={isUploadingToDrive}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Save Excel to Drive
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: All Parties Balance Sheet & Outstanding Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              2. All Parties Outstanding Balance Sheet
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Real-Time as of {formatDate(reportAsOfDate)}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Summary of all customer receivables (Dr) and supplier payables (Cr) calculated dynamically up to the specified date.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExportAllPDF}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileDown className="w-4 h-4" /> All Parties Balance Sheet (PDF)
          </button>

          <button
            onClick={handleExportAllExcel}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" /> All Parties Balance Sheet (Excel)
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleSaveAllPDFToDrive}
            disabled={isUploadingToDrive}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-500" /> Save Balance Sheet (PDF) to Google Drive
          </button>
        </div>
      </div>

      {/* SECTION 3: Sales Register & Item Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              3. Sales Bills & Items Register
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700">
            {sales.length} Bills Total
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Detailed item-level register with Bill #, Customer Name, Phone, Delivery Site, Item Name, Quantity, Unit, Rate, Amount, Operator, and Notes.
        </p>

        <button
          onClick={handleExportSalesExcel}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download Sales Register (Excel .xlsx)
        </button>
      </div>

      {/* SECTION 4: Expenses Register */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">
              4. Business Expenses Register
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-700">
            {expenses.length} Records
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Direct operational expenses (fuel, labor wages, machinery maintenance, office) with category analysis and payment modes.
        </p>

        <button
          onClick={handleExportExpensesExcel}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
        >
          <FileSpreadsheet className="w-4 h-4 text-rose-600" /> Download Expenses Register (Excel .xlsx)
        </button>
      </div>
    </div>
  );
};
