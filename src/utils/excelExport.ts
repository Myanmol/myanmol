import * as XLSX from 'xlsx';
import {
  Party,
  CompanyProfile,
  PartyBalanceSummary,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
} from '../types';
import { generatePartyLedgerStatement } from './ledger';
import { formatDate } from './formatters';

export function buildPartyLedgerWorkbook(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  asOfDate: string,
  startDate?: string
): { workbook: XLSX.WorkBook; fileName: string } {
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
    startDate,
    asOfDate
  );

  const aoaData: any[][] = [
    [company.name],
    [`${company.address} | Phone: ${company.phone} ${company.gstin ? `| GSTIN: ${company.gstin}` : ''}`],
    ['PARTY ACCOUNT LEDGER STATEMENT'],
    [''],
    ['Party Name:', party.name, '', 'Statement Date:', formatDate(asOfDate)],
    ['Contact Phone:', party.phone || '-', '', 'Period:', startDate ? `${formatDate(startDate)} to ${formatDate(asOfDate)}` : 'All Time History'],
    ['Address:', party.address || '-', '', 'Site Location:', party.site || '-'],
    ['Party Type:', party.type.toUpperCase(), '', 'Status:', closingStatus === 'receivable' ? 'Receivable (Dr)' : closingStatus === 'payable' ? 'Payable (Cr)' : 'Settled'],
    ['Closing Balance:', closingBalance, '', 'Net Position:', `${closingStatus === 'receivable' ? 'You will Receive' : closingStatus === 'payable' ? 'You have to Pay' : 'Settled'}`],
    [''],
    [
      'Date',
      'Voucher Type',
      'Voucher / Bill No',
      'Particulars',
      'Site / Project',
      'Debit (Dr)',
      'Credit (Cr)',
      'Running Balance',
      'Balance Type',
      'Recorded By',
      'Notes',
    ],
    // Opening balance row
    [
      openingBalanceRow.date,
      'OPENING BALANCE',
      openingBalanceRow.voucherNo,
      openingBalanceRow.particulars,
      party.site || '-',
      openingBalanceRow.debit,
      openingBalanceRow.credit,
      openingBalanceRow.runningBalance,
      openingBalanceRow.balanceType.toUpperCase(),
      'System',
      openingBalanceRow.note || '',
    ],
  ];

  entries.forEach((entry) => {
    aoaData.push([
      entry.date,
      entry.type.toUpperCase(),
      entry.voucherNo,
      entry.particulars,
      entry.site || '-',
      entry.debit,
      entry.credit,
      entry.runningBalance,
      entry.balanceType.toUpperCase(),
      entry.recordedBy || 'Operator',
      entry.note || '',
    ]);
  });

  aoaData.push(['']);
  aoaData.push([
    'TOTALS',
    '',
    '',
    'Period Total Transactions',
    '',
    totalDebit,
    totalCredit,
    closingBalance,
    closingStatus.toUpperCase(),
    '',
    '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 45 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Party Ledger');

  const partySales = sales.filter((s) => s.partyId === party.id && s.date <= asOfDate);
  if (partySales.length > 0) {
    const salesRows: any[][] = [
      ['SALES BILLS REGISTER FOR ' + party.name],
      ['Bill No', 'Date', 'Site', 'Item Name', 'Quantity', 'Unit', 'Rate', 'Amount', 'Bill Total', 'Recorded By', 'Note'],
    ];

    partySales.forEach((s) => {
      if (s.items && s.items.length > 0) {
        s.items.forEach((item, idx) => {
          salesRows.push([
            idx === 0 ? s.billNo : '',
            idx === 0 ? s.date : '',
            idx === 0 ? s.site : '',
            item.itemName,
            item.quantity,
            item.unit,
            item.rate,
            item.amount,
            idx === 0 ? s.totalAmount : '',
            idx === 0 ? s.recordedBy?.userName : '',
            idx === 0 ? (s.note || '') : '',
          ]);
        });
      } else {
        salesRows.push([
          s.billNo,
          s.date,
          s.site,
          'Sale Bill',
          1,
          '-',
          s.totalAmount,
          s.totalAmount,
          s.totalAmount,
          s.recordedBy?.userName,
          s.note || '',
        ]);
      }
    });

    const salesSheet = XLSX.utils.aoa_to_sheet(salesRows);
    salesSheet['!cols'] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 24 },
      { wch: 28 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Bills');
  }

  const safePartyName = party.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `ledger_${safePartyName}_${asOfDate}.xlsx`;
  return { workbook, fileName };
}

export function exportPartyLedgerExcel(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  asOfDate: string,
  startDate?: string
) {
  const { workbook, fileName } = buildPartyLedgerWorkbook(
    company,
    party,
    sales,
    receipts,
    purchases,
    payments,
    asOfDate,
    startDate
  );
  XLSX.writeFile(workbook, fileName);
}

export function getPartyLedgerExcelBlob(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  asOfDate: string,
  startDate?: string
): { blob: Blob; fileName: string } {
  const { workbook, fileName } = buildPartyLedgerWorkbook(
    company,
    party,
    sales,
    receipts,
    purchases,
    payments,
    asOfDate,
    startDate
  );
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return { blob, fileName };
}

export function buildAllPartiesSummaryWorkbook(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
): { workbook: XLSX.WorkBook; fileName: string } {
  const aoaData: any[][] = [
    [company.name],
    [`${company.address} | Phone: ${company.phone}`],
    ['ALL PARTIES REAL-TIME BALANCE SHEET REPORT'],
    [`Calculated Real-Time as of Date: ${formatDate(asOfDate)}`],
    [''],
    [
      '#',
      'Party Name',
      'Type',
      'Phone',
      'Address',
      'Default Site',
      'Opening Balance',
      'Opening Type',
      'Total Sales',
      'Total Receipts',
      'Total Purchases',
      'Total Payments',
      'Net Balance as of Date',
      'Dr / Cr',
      'Status',
      'Transactions Count',
      'Last Transaction Date',
    ],
  ];

  let grandReceivable = 0;
  let grandPayable = 0;

  summaries.forEach((s, idx) => {
    if (s.netBalance > 0) grandReceivable += s.netBalance;
    if (s.netBalance < 0) grandPayable += Math.abs(s.netBalance);

    aoaData.push([
      idx + 1,
      s.party.name,
      s.party.type.toUpperCase(),
      s.party.phone || '-',
      s.party.address || '-',
      s.party.site || '-',
      s.openingBalance,
      s.openingBalanceType.toUpperCase(),
      s.totalSales,
      s.totalReceipts,
      s.totalPurchases,
      s.totalPayments,
      s.netBalance,
      s.balanceStatus === 'receivable' ? 'Dr' : s.balanceStatus === 'payable' ? 'Cr' : '-',
      s.balanceStatus === 'receivable'
        ? 'You will Receive'
        : s.balanceStatus === 'payable'
        ? 'You have to Pay'
        : 'Settled',
      s.transactionCount,
      s.lastTransactionDate ? formatDate(s.lastTransactionDate) : '-',
    ]);
  });

  aoaData.push(['']);
  aoaData.push([
    'TOTALS',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `Receivable: ${grandReceivable} | Payable: ${grandPayable}`,
    '',
    `Net: ${grandReceivable - grandPayable}`,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
    { wch: 25 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 10 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parties Balance Sheet');
  const fileName = `all_parties_balance_as_of_${asOfDate}.xlsx`;
  return { workbook, fileName };
}

export function exportAllPartiesSummaryExcel(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
) {
  const { workbook, fileName } = buildAllPartiesSummaryWorkbook(company, summaries, asOfDate);
  XLSX.writeFile(workbook, fileName);
}

export function getAllPartiesSummaryExcelBlob(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
): { blob: Blob; fileName: string } {
  const { workbook, fileName } = buildAllPartiesSummaryWorkbook(company, summaries, asOfDate);
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return { blob, fileName };
}

export function exportSalesRegisterExcel(
  company: CompanyProfile,
  sales: SaleBill[],
  asOfDate: string
) {
  const aoaData: any[][] = [
    [company.name],
    ['SALES BILLS REGISTER'],
    [`Period up to: ${formatDate(asOfDate)}`],
    [''],
    [
      'Bill No',
      'Date',
      'Party Name',
      'Phone',
      'Site / Delivery Location',
      'Address',
      'Item Name',
      'Quantity',
      'Unit',
      'Rate',
      'Amount',
      'Bill Total',
      'Recorded By',
      'Note',
    ],
  ];

  sales.forEach((s) => {
    if (s.items && s.items.length > 0) {
      s.items.forEach((item, idx) => {
        aoaData.push([
          idx === 0 ? s.billNo : '',
          idx === 0 ? s.date : '',
          idx === 0 ? s.partyName : '',
          idx === 0 ? s.phone : '',
          idx === 0 ? s.site : '',
          idx === 0 ? s.address : '',
          item.itemName,
          item.quantity,
          item.unit,
          item.rate,
          item.amount,
          idx === 0 ? s.totalAmount : '',
          idx === 0 ? s.recordedBy?.userName : '',
          idx === 0 ? (s.note || '') : '',
        ]);
      });
    } else {
      aoaData.push([
        s.billNo,
        s.date,
        s.partyName,
        s.phone,
        s.site,
        s.address,
        'Item',
        1,
        '-',
        s.totalAmount,
        s.totalAmount,
        s.totalAmount,
        s.recordedBy?.userName,
        s.note || '',
      ]);
    }
  });

  const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 13 },
    { wch: 28 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 28 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Register');
  XLSX.writeFile(workbook, `sales_register_${asOfDate}.xlsx`);
}

export function exportExpensesExcel(
  company: CompanyProfile,
  expenses: Expense[],
  asOfDate: string
) {
  const aoaData: any[][] = [
    [company.name],
    ['BUSINESS EXPENSES REGISTER'],
    [`Up to: ${formatDate(asOfDate)}`],
    [''],
    [
      'Voucher No',
      'Date',
      'Category',
      'Paid To / Beneficiary',
      'Amount',
      'Payment Mode',
      'Site / Unit',
      'Recorded By',
      'Notes',
    ],
  ];

  let totalExp = 0;
  expenses.forEach((e) => {
    totalExp += e.amount;
    aoaData.push([
      e.voucherNo,
      e.date,
      e.category,
      e.paidTo,
      e.amount,
      e.paymentMode,
      e.site || '-',
      e.recordedBy?.userName || '-',
      e.note || '',
    ]);
  });

  aoaData.push(['']);
  aoaData.push(['TOTAL EXPENSES', '', '', '', totalExp]);

  const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 14 },
    { wch: 25 },
    { wch: 28 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  XLSX.writeFile(workbook, `expenses_register_${asOfDate}.xlsx`);
}
