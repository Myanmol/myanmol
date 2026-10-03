import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Party,
  CompanyProfile,
  PartyBalanceSummary,
  SaleBill,
  PurchaseBill,
} from '../types';
import { generatePartyLedgerStatement } from './ledger';
import { formatCurrency, formatDate } from './formatters';

export function buildPartyLedgerPDFDoc(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: any[],
  purchases: PurchaseBill[],
  payments: any[],
  asOfDate: string,
  startDate?: string
): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

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

  // 1. Header background banner
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 42, 210, 42);

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(company.name.toUpperCase(), 14, 15);

  // Company Tagline / Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(company.tagline || 'Building Materials & Trade Solutions', 14, 21);
  doc.text(`Address: ${company.address}  ·  Phone: ${company.phone}`, 14, 27);
  if (company.gstin) {
    doc.text(`GSTIN / Reg No: ${company.gstin}`, 14, 33);
  }

  // Right Side Header Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('PARTY STATEMENT', 196, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Statement Date: ${formatDate(asOfDate)}`, 196, 22, { align: 'right' });
  if (startDate) {
    doc.text(`From: ${formatDate(startDate)} to ${formatDate(asOfDate)}`, 196, 28, { align: 'right' });
  } else {
    doc.text('Complete Historical Ledger', 196, 28, { align: 'right' });
  }

  // 2. Party Details Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 48, 182, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(party.name, 19, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${party.phone || '-'}`, 19, 62);
  doc.text(`Address: ${party.address || '-'}`, 19, 68);
  if (party.site) {
    doc.text(`Project / Site: ${party.site}`, 19, 74);
  }

  // Right side of Party box: Closing Balance Callout
  const balLabel =
    closingStatus === 'receivable'
      ? 'TOTAL RECEIVABLE (DR)'
      : closingStatus === 'payable'
      ? 'TOTAL PAYABLE (CR)'
      : 'BALANCE SETTLED';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(balLabel, 191, 56, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (closingStatus === 'receivable') {
    doc.setTextColor(217, 119, 6);
  } else if (closingStatus === 'payable') {
    doc.setTextColor(225, 29, 72);
  } else {
    doc.setTextColor(16, 185, 129);
  }
  doc.text(formatCurrency(closingBalance), 191, 64, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`As of ${formatDate(asOfDate)}`, 191, 70, { align: 'right' });

  // 3. Table Rows
  const tableRows: any[] = [];

  tableRows.push([
    formatDate(openingBalanceRow.date),
    'OPENING',
    '-',
    openingBalanceRow.particulars,
    openingBalanceRow.debit > 0 ? formatCurrency(openingBalanceRow.debit) : '-',
    openingBalanceRow.credit > 0 ? formatCurrency(openingBalanceRow.credit) : '-',
    `${formatCurrency(openingBalanceRow.runningBalance)} ${
      openingBalanceRow.balanceType === 'receivable' ? 'Dr' : openingBalanceRow.balanceType === 'payable' ? 'Cr' : ''
    }`,
  ]);

  entries.forEach((entry) => {
    const typeLabel =
      entry.type === 'sale'
        ? 'SALE BILL'
        : entry.type === 'purchase'
        ? 'PURCHASE'
        : entry.type === 'receipt'
        ? 'RECEIPT'
        : entry.type === 'payment'
        ? 'PAYMENT'
        : entry.type.toUpperCase();

    const desc = `${entry.particulars}${entry.site ? ` [Site: ${entry.site}]` : ''}${
      entry.note ? ` (${entry.note})` : ''
    }`;

    tableRows.push([
      formatDate(entry.date),
      typeLabel,
      entry.voucherNo,
      desc,
      entry.debit > 0 ? formatCurrency(entry.debit) : '-',
      entry.credit > 0 ? formatCurrency(entry.credit) : '-',
      `${formatCurrency(entry.runningBalance)} ${
        entry.balanceType === 'receivable' ? 'Dr' : entry.balanceType === 'payable' ? 'Cr' : ''
      }`,
    ]);
  });

  autoTable(doc, {
    startY: 84,
    head: [['Date', 'Type', 'Voucher #', 'Particulars / Items', 'Debit (Dr)', 'Credit (Cr)', 'Balance']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 24 },
      3: { cellWidth: 62 },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 220;

  if (finalY < 250) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY, 182, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text(`Total Period Debits: ${formatCurrency(totalDebit)}`, 20, finalY + 6);
    doc.text(`Total Period Credits: ${formatCurrency(totalCredit)}`, 20, finalY + 12);

    doc.setFontSize(9.5);
    doc.text(
      `Closing Balance as of ${formatDate(asOfDate)}:  ${formatCurrency(closingBalance)} (${
        closingStatus === 'receivable' ? 'You will Receive / Dr' : closingStatus === 'payable' ? 'You have to Pay / Cr' : 'Settled'
      })`,
      100,
      finalY + 9
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer generated ledger statement.', 14, finalY + 28);
    doc.text('Authorized Signatory & Stamp', 196, finalY + 28, { align: 'right' });
  }

  const safePartyName = party.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `ledger_${safePartyName}_${asOfDate}.pdf`;

  return { doc, fileName };
}

export function exportPartyLedgerPDF(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: any[],
  purchases: PurchaseBill[],
  payments: any[],
  asOfDate: string,
  startDate?: string
) {
  const { doc, fileName } = buildPartyLedgerPDFDoc(
    company,
    party,
    sales,
    receipts,
    purchases,
    payments,
    asOfDate,
    startDate
  );
  doc.save(fileName);
}

export function getPartyLedgerPDFBlob(
  company: CompanyProfile,
  party: Party,
  sales: SaleBill[],
  receipts: any[],
  purchases: PurchaseBill[],
  payments: any[],
  asOfDate: string,
  startDate?: string
): { blob: Blob; fileName: string } {
  const { doc, fileName } = buildPartyLedgerPDFDoc(
    company,
    party,
    sales,
    receipts,
    purchases,
    payments,
    asOfDate,
    startDate
  );
  const blob = doc.output('blob');
  return { blob, fileName };
}

export function buildAllPartiesSummaryPDFDoc(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 297, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 34, 297, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(company.name.toUpperCase(), 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`${company.address}  ·  Phone: ${company.phone}`, 14, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('ALL PARTIES OUTSTANDING BALANCE SHEET', 283, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Balances Calculated as of: ${formatDate(asOfDate)}`, 283, 22, { align: 'right' });

  let grandReceivable = 0;
  let grandPayable = 0;

  const tableRows = summaries.map((s, idx) => {
    if (s.netBalance > 0) grandReceivable += s.netBalance;
    if (s.netBalance < 0) grandPayable += Math.abs(s.netBalance);

    return [
      idx + 1,
      s.party.name,
      s.party.type.toUpperCase(),
      s.party.phone || '-',
      s.party.site || s.party.address || '-',
      s.totalSales > 0 ? formatCurrency(s.totalSales) : '-',
      s.totalReceipts > 0 ? formatCurrency(s.totalReceipts) : '-',
      s.totalPurchases > 0 ? formatCurrency(s.totalPurchases) : '-',
      s.totalPayments > 0 ? formatCurrency(s.totalPayments) : '-',
      `${formatCurrency(s.netBalance)} ${
        s.balanceStatus === 'receivable' ? 'Dr' : s.balanceStatus === 'payable' ? 'Cr' : ''
      }`,
      s.balanceStatus === 'receivable'
        ? 'To Receive'
        : s.balanceStatus === 'payable'
        ? 'To Pay'
        : 'Settled',
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [
      [
        '#',
        'Party Name',
        'Type',
        'Phone',
        'Site / Address',
        'Sales (₹)',
        'Receipts (₹)',
        'Purchases (₹)',
        'Payments (₹)',
        'Net Balance',
        'Status',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 45 },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 22, halign: 'right' },
      9: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 23, halign: 'center' },
    },
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 170;
  if (finalY < 190) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY, 269, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `TOTAL RECEIVABLE (You will get):  ${formatCurrency(grandReceivable)}`,
      20,
      finalY + 9
    );
    doc.text(
      `TOTAL PAYABLE (You have to pay):  ${formatCurrency(grandPayable)}`,
      130,
      finalY + 9
    );
    doc.text(
      `NET POSITION:  ${formatCurrency(grandReceivable - grandPayable)}`,
      230,
      finalY + 9
    );
  }

  const fileName = `party_balances_summary_${asOfDate}.pdf`;
  return { doc, fileName };
}

export function exportAllPartiesSummaryPDF(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
) {
  const { doc, fileName } = buildAllPartiesSummaryPDFDoc(company, summaries, asOfDate);
  doc.save(fileName);
}

export function getAllPartiesSummaryPDFBlob(
  company: CompanyProfile,
  summaries: PartyBalanceSummary[],
  asOfDate: string
): { blob: Blob; fileName: string } {
  const { doc, fileName } = buildAllPartiesSummaryPDFDoc(company, summaries, asOfDate);
  const blob = doc.output('blob');
  return { blob, fileName };
}
