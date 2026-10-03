import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  PartyBalanceSummary,
  LedgerEntry,
  FinancialTransaction,
} from '../types';

/**
 * Calculates the real-time balance of a single party as of a specific date (YYYY-MM-DD).
 *
 * Dr (Debit / Positive) = Receivable (Party owes us money)
 * Cr (Credit / Negative) = Payable (We owe party money)
 */
export function calculatePartyBalanceAsOfDate(
  party: Party,
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  asOfDate: string
): PartyBalanceSummary {
  // 1. Initial Opening Balance
  let netBalance = 0;
  if (party.openingBalance > 0) {
    if (party.openingBalanceType === 'receivable') {
      netBalance += party.openingBalance;
    } else {
      netBalance -= party.openingBalance;
    }
  }

  // 2. Filter transactions up to asOfDate
  const partySales = sales.filter(
    (s) => s.partyId === party.id && s.date <= asOfDate
  );
  const partyReceipts = receipts.filter(
    (r) => r.partyId === party.id && r.date <= asOfDate
  );
  const partyPurchases = purchases.filter(
    (p) => p.partyId === party.id && p.date <= asOfDate
  );
  const partyPayments = payments.filter(
    (p) => p.partyId === party.id && p.date <= asOfDate
  );

  const totalSales = partySales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalReceipts = partyReceipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalPurchases = partyPurchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPayments = partyPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Sales increase receivable (+), Receipts decrease receivable (-)
  // Purchases increase payable (-), Payments decrease payable (+)
  netBalance += totalSales;
  netBalance -= totalReceipts;
  netBalance -= totalPurchases;
  netBalance += totalPayments;

  // Find last transaction date up to asOfDate
  const allDates = [
    ...partySales.map((s) => s.date),
    ...partyReceipts.map((r) => r.date),
    ...partyPurchases.map((p) => p.date),
    ...partyPayments.map((p) => p.date),
  ].sort();

  const lastTransactionDate = allDates.length > 0 ? allDates[allDates.length - 1] : undefined;
  const transactionCount = partySales.length + partyReceipts.length + partyPurchases.length + partyPayments.length;

  // Floating point round to 2 decimals
  netBalance = Math.round(netBalance * 100) / 100;

  let balanceStatus: 'receivable' | 'payable' | 'settled' = 'settled';
  if (netBalance > 0.01) {
    balanceStatus = 'receivable';
  } else if (netBalance < -0.01) {
    balanceStatus = 'payable';
  } else {
    netBalance = 0;
    balanceStatus = 'settled';
  }

  return {
    partyId: party.id,
    party,
    openingBalance: party.openingBalance,
    openingBalanceType: party.openingBalanceType,
    totalSales,
    totalReceipts,
    totalPurchases,
    totalPayments,
    netBalance,
    balanceStatus,
    lastTransactionDate,
    transactionCount,
  };
}

/**
 * Calculates real-time balances for all parties as of a specific date.
 */
export function calculateAllPartyBalancesAsOfDate(
  parties: Party[],
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  asOfDate: string
): PartyBalanceSummary[] {
  return parties.map((party) =>
    calculatePartyBalanceAsOfDate(party, sales, receipts, purchases, payments, asOfDate)
  );
}

/**
 * Generates an itemized chronological running ledger statement for a party.
 */
export function generatePartyLedgerStatement(
  party: Party,
  sales: SaleBill[],
  receipts: Receipt[],
  purchases: PurchaseBill[],
  payments: Payment[],
  startDate?: string,
  endDate?: string
): {
  entries: LedgerEntry[];
  openingBalanceRow: LedgerEntry;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingStatus: 'receivable' | 'payable' | 'settled';
} {
  // Collect all transactions for this party
  const partySales = sales.filter((s) => s.partyId === party.id);
  const partyReceipts = receipts.filter((r) => r.partyId === party.id);
  const partyPurchases = purchases.filter((p) => p.partyId === party.id);
  const partyPayments = payments.filter((p) => p.partyId === party.id);

  // Group all raw events
  interface RawEvent {
    id: string;
    date: string;
    type: 'sale' | 'purchase' | 'receipt' | 'payment';
    voucherNo: string;
    particulars: string;
    site?: string;
    debit: number;
    credit: number;
    note?: string;
    recordedBy?: string;
    createdAt: string;
    rawTransaction: FinancialTransaction;
  }

  const rawEvents: RawEvent[] = [];

  partySales.forEach((s) => {
    const itemSummary = s.items && s.items.length > 0
      ? s.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit || 'pcs'} @ ₹${i.rate})`).join(', ')
      : 'Sales Bill';
    rawEvents.push({
      id: s.id,
      date: s.date,
      type: 'sale',
      voucherNo: s.billNo || 'BILL',
      particulars: itemSummary,
      site: s.site,
      debit: s.totalAmount, // Dr
      credit: 0,
      note: s.note,
      recordedBy: s.recordedBy?.userName,
      createdAt: s.createdAt || s.date,
      rawTransaction: s,
    });
  });

  partyReceipts.forEach((r) => {
    rawEvents.push({
      id: r.id,
      date: r.date,
      type: 'receipt',
      voucherNo: r.receiptNo || 'REC',
      particulars: `Payment Received (${r.paymentMode}${r.referenceNo ? ` · Ref: ${r.referenceNo}` : ''})`,
      site: r.site,
      debit: 0,
      credit: r.amount, // Cr
      note: r.note,
      recordedBy: r.recordedBy?.userName,
      createdAt: r.createdAt || r.date,
      rawTransaction: r,
    });
  });

  partyPurchases.forEach((p) => {
    const itemSummary = p.items && p.items.length > 0
      ? p.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit || 'pcs'} @ ₹${i.rate})`).join(', ')
      : 'Purchase Bill';
    rawEvents.push({
      id: p.id,
      date: p.date,
      type: 'purchase',
      voucherNo: p.billNo || 'PUR-BILL',
      particulars: itemSummary,
      site: p.site,
      debit: 0,
      credit: p.totalAmount, // Cr
      note: p.note,
      recordedBy: p.recordedBy?.userName,
      createdAt: p.createdAt || p.date,
      rawTransaction: p,
    });
  });

  partyPayments.forEach((p) => {
    rawEvents.push({
      id: p.id,
      date: p.date,
      type: 'payment',
      voucherNo: p.voucherNo || 'PAY',
      particulars: `Payment Made (${p.paymentMode}${p.referenceNo ? ` · Ref: ${p.referenceNo}` : ''})`,
      site: p.site,
      debit: p.amount, // Dr
      credit: 0,
      note: p.note,
      recordedBy: p.recordedBy?.userName,
      createdAt: p.createdAt || p.date,
      rawTransaction: p,
    });
  });

  // Sort chronologically
  rawEvents.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  // Calculate opening balance before startDate if startDate is provided
  let runningBal = 0;
  if (party.openingBalance > 0) {
    runningBal = party.openingBalanceType === 'receivable' ? party.openingBalance : -party.openingBalance;
  }

  // Transactions before startDate contribute to adjusted opening balance
  let periodEvents = rawEvents;
  if (startDate) {
    const priorEvents = rawEvents.filter((e) => e.date < startDate);
    priorEvents.forEach((e) => {
      runningBal += e.debit;
      runningBal -= e.credit;
    });
    periodEvents = rawEvents.filter((e) => e.date >= startDate);
  }

  if (endDate) {
    periodEvents = periodEvents.filter((e) => e.date <= endDate);
  }

  const openingBalanceRow: LedgerEntry = {
    id: `opening-${party.id}`,
    date: startDate || party.createdAt || 'Initial',
    type: 'opening',
    voucherNo: 'OP-BAL',
    particulars: 'Opening Balance',
    debit: runningBal > 0 ? runningBal : 0,
    credit: runningBal < 0 ? Math.abs(runningBal) : 0,
    runningBalance: Math.round(runningBal * 100) / 100,
    balanceType: runningBal > 0.01 ? 'receivable' : runningBal < -0.01 ? 'payable' : 'settled',
    note: party.notes,
  };

  let totalDebit = 0;
  let totalCredit = 0;

  const entries: LedgerEntry[] = periodEvents.map((evt) => {
    runningBal += evt.debit;
    runningBal -= evt.credit;
    totalDebit += evt.debit;
    totalCredit += evt.credit;

    const roundedBal = Math.round(runningBal * 100) / 100;
    const balanceType: 'receivable' | 'payable' | 'settled' =
      roundedBal > 0.01 ? 'receivable' : roundedBal < -0.01 ? 'payable' : 'settled';

    return {
      id: evt.id,
      date: evt.date,
      type: evt.type,
      voucherNo: evt.voucherNo,
      particulars: evt.particulars,
      site: evt.site,
      debit: evt.debit,
      credit: evt.credit,
      runningBalance: roundedBal,
      balanceType,
      note: evt.note,
      recordedBy: evt.recordedBy,
      rawTransaction: evt.rawTransaction,
    };
  });

  const finalBal = Math.round(runningBal * 100) / 100;
  const closingStatus: 'receivable' | 'payable' | 'settled' =
    finalBal > 0.01 ? 'receivable' : finalBal < -0.01 ? 'payable' : 'settled';

  return {
    entries,
    openingBalanceRow,
    totalDebit,
    totalCredit,
    closingBalance: finalBal,
    closingStatus,
  };
}
