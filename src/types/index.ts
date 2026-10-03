export type PartyType = 'customer' | 'supplier' | 'both';

export type BalanceType = 'receivable' | 'payable'; // receivable = Dr (customer owes us), payable = Cr (we owe supplier)

export type PaymentMode = 'Cash' | 'UPI / GPay / PhonePe' | 'Bank Transfer (NEFT/RTGS)' | 'Cheque' | 'Other';

export interface AppUser {
  id: string;
  name: string;
  role: 'Admin / Owner' | 'Billing Desk' | 'Sales Manager' | 'Site Supervisor' | 'Accountant';
  avatarColor: string;
  phone?: string;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  address: string;
  site?: string; // Default delivery/project site
  type: PartyType;
  openingBalance: number; // positive number
  openingBalanceType: BalanceType;
  createdAt: string; // ISO date string YYYY-MM-DD
  notes?: string;
  gstin?: string;
}

export interface BillItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string; // Pcs, Ton, Bags, Brass, Sq.ft, Meters, Kgs, Nos, Trips, Trucks
  rate: number;
  amount: number; // qty * rate
}

export interface SaleBill {
  id: string;
  type: 'sale';
  billNo: string;
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  phone: string;
  address: string;
  site: string; // Delivery site / project
  items: BillItem[];
  totalAmount: number;
  note?: string;
  recordedBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  createdAt: string;
}

export interface PurchaseBill {
  id: string;
  type: 'purchase';
  billNo: string; // Supplier Bill / Invoice No
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  phone: string;
  address: string;
  site: string; // Receiving yard / plant / site
  items: BillItem[];
  totalAmount: number;
  note?: string;
  recordedBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  createdAt: string;
}

export interface Receipt {
  id: string;
  type: 'receipt';
  receiptNo: string;
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNo?: string; // Cheque No / UTR / Transaction ID
  site?: string;
  note?: string;
  recordedBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  type: 'payment';
  voucherNo: string;
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNo?: string;
  site?: string;
  note?: string;
  recordedBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  createdAt: string;
}

export type ExpenseCategory =
  | 'Fuel & Transport'
  | 'Labor & Wages'
  | 'Raw Materials & Minerals'
  | 'Electricity & Utilities'
  | 'Machinery Maintenance'
  | 'Office & Admin'
  | 'Tea & Refreshments'
  | 'Rent & Taxes'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  type: 'expense';
  voucherNo: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  paidTo: string; // Beneficiary or vendor
  amount: number;
  paymentMode: PaymentMode;
  site?: string;
  note?: string;
  recordedBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
  createdAt: string;
}

export type FinancialTransaction = SaleBill | PurchaseBill | Receipt | Payment | Expense;

// Ledger entry representation for running statement
export interface LedgerEntry {
  id: string;
  date: string;
  type: 'opening' | 'sale' | 'purchase' | 'receipt' | 'payment';
  voucherNo: string;
  particulars: string;
  site?: string;
  debit: number;  // Dr (+) amount party owes us
  credit: number; // Cr (-) amount we received or owe party
  runningBalance: number; // positive = Receivable (Dr), negative = Payable (Cr)
  balanceType: BalanceType | 'settled';
  note?: string;
  recordedBy?: string;
  rawTransaction?: FinancialTransaction;
}

export interface PartyBalanceSummary {
  partyId: string;
  party: Party;
  openingBalance: number;
  openingBalanceType: BalanceType;
  totalSales: number;
  totalReceipts: number;
  totalPurchases: number;
  totalPayments: number;
  netBalance: number; // positive = receivable (Dr), negative = payable (Cr), 0 = settled
  balanceStatus: 'receivable' | 'payable' | 'settled';
  lastTransactionDate?: string;
  transactionCount: number;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  gstin?: string;
  currencySymbol: string;
}
