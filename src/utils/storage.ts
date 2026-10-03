import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
  AppUser,
  CompanyProfile,
} from '../types';
import { getTodayISO } from './formatters';

const STORAGE_KEY_PREFIX = 'finledger_app_';

export const INITIAL_COMPANY: CompanyProfile = {
  name: 'Anmol Bricks & Infra Industries',
  tagline: 'Clay & Fly Ash Bricks, Cement & Construction Material',
  phone: '+91 98765 43210',
  address: 'Plot No. 42, Industrial Area, Phase II, Highway Road',
  gstin: '07AAAAA0000A1Z5',
  currencySymbol: '₹',
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user_1',
    name: 'Anmol Sharma',
    role: 'Admin / Owner',
    avatarColor: 'bg-indigo-600',
    phone: '9876543210',
  },
  {
    id: 'user_2',
    name: 'Sunil Kumar',
    role: 'Billing Desk',
    avatarColor: 'bg-emerald-600',
    phone: '9812345678',
  },
  {
    id: 'user_3',
    name: 'Ramesh Patel',
    role: 'Site Supervisor',
    avatarColor: 'bg-amber-600',
    phone: '9823456789',
  },
  {
    id: 'user_4',
    name: 'Anita Verma',
    role: 'Accountant',
    avatarColor: 'bg-rose-600',
    phone: '9834567890',
  },
];

export const INITIAL_PARTIES: Party[] = [
  {
    id: 'party_1',
    name: 'Shri Ram Construction Ltd',
    phone: '+91 98765 11223',
    address: 'Sector 62, Commercial Hub, Noida',
    site: 'Skyline Heights - Tower B Site',
    type: 'customer',
    openingBalance: 45000,
    openingBalanceType: 'receivable',
    createdAt: '2026-09-01',
    notes: 'Major residential contractor; 15-day credit period',
    gstin: '07AAACS1234F1Z8',
  },
  {
    id: 'party_2',
    name: 'Apex Infrastructure & Developers',
    phone: '+91 98112 33445',
    address: 'Plot 18, Express Highway Road, Greater Noida',
    site: 'Green Valley Villas Site 4',
    type: 'customer',
    openingBalance: 20000,
    openingBalanceType: 'receivable',
    createdAt: '2026-09-10',
    notes: 'Bulk order client for red clay bricks',
    gstin: '07AABCA5678H1Z2',
  },
  {
    id: 'party_3',
    name: 'Jindal Coal & Mineral Traders',
    phone: '+91 98990 44556',
    address: 'Mandi Yard, Railway Siding Road',
    site: 'Kiln Plant Coal Yard',
    type: 'supplier',
    openingBalance: 60000,
    openingBalanceType: 'payable',
    createdAt: '2026-09-05',
    notes: 'Steam coal supplier for brick kiln firing',
    gstin: '07AACDJ9012K1Z9',
  },
  {
    id: 'party_4',
    name: 'UltraTech & ACC Cement Depot',
    phone: '+91 97115 66778',
    address: 'Godown 12, Transport Nagar',
    site: 'Main Raw Material Shed',
    type: 'supplier',
    openingBalance: 35000,
    openingBalanceType: 'payable',
    createdAt: '2026-09-08',
    notes: 'PPC & OPC 50kg Cement bags supply',
    gstin: '07AAACU3456L1Z4',
  },
  {
    id: 'party_5',
    name: 'Rajesh Builders & Materials',
    phone: '+91 99554 77889',
    address: 'Near Old Bus Stand, Ring Road',
    site: 'Smart City Hospital Project',
    type: 'both',
    openingBalance: 12500,
    openingBalanceType: 'receivable',
    createdAt: '2026-09-15',
    notes: 'Buys finished bricks, supplies river sand and gravel',
    gstin: '07AABPR7890M1Z1',
  },
];

export const INITIAL_SALES: SaleBill[] = [
  {
    id: 'sale_1',
    type: 'sale',
    billNo: 'INV-2026-101',
    date: '2026-09-25',
    partyId: 'party_1',
    partyName: 'Shri Ram Construction Ltd',
    phone: '+91 98765 11223',
    address: 'Sector 62, Commercial Hub, Noida',
    site: 'Skyline Heights - Tower B Site',
    items: [
      {
        id: 'item_1_1',
        itemName: 'Red Clay Bricks (Class 1)',
        quantity: 12000,
        unit: 'Pcs',
        rate: 8.5,
        amount: 102000,
      },
      {
        id: 'item_1_2',
        itemName: 'Transport & Unloading Charges',
        quantity: 2,
        unit: 'Trips',
        rate: 3500,
        amount: 7000,
      },
    ],
    totalAmount: 109000,
    note: 'Delivered in 2 dumper trucks; received by Supervisor Manoj',
    recordedBy: {
      userId: 'user_2',
      userName: 'Sunil Kumar',
      userRole: 'Billing Desk',
    },
    createdAt: '2026-09-25T10:30:00Z',
  },
  {
    id: 'sale_2',
    type: 'sale',
    billNo: 'INV-2026-102',
    date: '2026-09-28',
    partyId: 'party_2',
    partyName: 'Apex Infrastructure & Developers',
    phone: '+91 98112 33445',
    address: 'Plot 18, Express Highway Road, Greater Noida',
    site: 'Green Valley Villas Site 4',
    items: [
      {
        id: 'item_2_1',
        itemName: 'Fly Ash Bricks (Machine Made)',
        quantity: 15000,
        unit: 'Pcs',
        rate: 6.2,
        amount: 93000,
      },
    ],
    totalAmount: 93000,
    note: 'First lot for boundary and foundation work',
    recordedBy: {
      userId: 'user_1',
      userName: 'Anmol Sharma',
      userRole: 'Admin / Owner',
    },
    createdAt: '2026-09-28T14:15:00Z',
  },
  {
    id: 'sale_3',
    type: 'sale',
    billNo: 'INV-2026-103',
    date: '2026-10-02',
    partyId: 'party_1',
    partyName: 'Shri Ram Construction Ltd',
    phone: '+91 98765 11223',
    address: 'Sector 62, Commercial Hub, Noida',
    site: 'Skyline Heights - Tower B Site',
    items: [
      {
        id: 'item_3_1',
        itemName: 'Red Clay Bricks (Class 1)',
        quantity: 8000,
        unit: 'Pcs',
        rate: 8.5,
        amount: 68000,
      },
    ],
    totalAmount: 68000,
    note: 'Direct dispatch from Kiln #2',
    recordedBy: {
      userId: 'user_3',
      userName: 'Ramesh Patel',
      userRole: 'Site Supervisor',
    },
    createdAt: '2026-10-02T11:00:00Z',
  },
  {
    id: 'sale_4',
    type: 'sale',
    billNo: 'INV-2026-104',
    date: '2026-10-03',
    partyId: 'party_5',
    partyName: 'Rajesh Builders & Materials',
    phone: '+91 99554 77889',
    address: 'Near Old Bus Stand, Ring Road',
    site: 'Smart City Hospital Project',
    items: [
      {
        id: 'item_4_1',
        itemName: 'Interlocking Paver Blocks (80mm)',
        quantity: 1200,
        unit: 'Sq.ft',
        rate: 38,
        amount: 45600,
      },
    ],
    totalAmount: 45600,
    note: 'Heavy duty pavers for ambulance bay',
    recordedBy: {
      userId: 'user_2',
      userName: 'Sunil Kumar',
      userRole: 'Billing Desk',
    },
    createdAt: '2026-10-03T09:20:00Z',
  },
];

export const INITIAL_PURCHASES: PurchaseBill[] = [
  {
    id: 'pur_1',
    type: 'purchase',
    billNo: 'JND-COAL-889',
    date: '2026-09-22',
    partyId: 'party_3',
    partyName: 'Jindal Coal & Mineral Traders',
    phone: '+91 98990 44556',
    address: 'Mandi Yard, Railway Siding Road',
    site: 'Kiln Plant Coal Yard',
    items: [
      {
        id: 'pitem_1_1',
        itemName: 'Raniganj Boiler Grade Coal',
        quantity: 28.5,
        unit: 'Ton',
        rate: 7200,
        amount: 205200,
      },
    ],
    totalAmount: 205200,
    note: 'Weighbridge slip #4401 attached. Moisture verified 4%.',
    recordedBy: {
      userId: 'user_1',
      userName: 'Anmol Sharma',
      userRole: 'Admin / Owner',
    },
    createdAt: '2026-09-22T16:00:00Z',
  },
  {
    id: 'pur_2',
    type: 'purchase',
    billNo: 'UT-CEM-4421',
    date: '2026-09-29',
    partyId: 'party_4',
    partyName: 'UltraTech & ACC Cement Depot',
    phone: '+91 97115 66778',
    address: 'Godown 12, Transport Nagar',
    site: 'Main Raw Material Shed',
    items: [
      {
        id: 'pitem_2_1',
        itemName: 'UltraTech PPC Cement 50kg Bags',
        quantity: 400,
        unit: 'Bags',
        rate: 360,
        amount: 144000,
      },
    ],
    totalAmount: 144000,
    note: 'Batch 2026-W38 for Fly Ash Brick plant mixing',
    recordedBy: {
      userId: 'user_4',
      userName: 'Anita Verma',
      userRole: 'Accountant',
    },
    createdAt: '2026-09-29T11:45:00Z',
  },
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec_1',
    type: 'receipt',
    receiptNo: 'REC-2026-051',
    date: '2026-09-27',
    partyId: 'party_1',
    partyName: 'Shri Ram Construction Ltd',
    amount: 80000,
    paymentMode: 'Bank Transfer (NEFT/RTGS)',
    referenceNo: 'HDFC-NEFT-88492019',
    site: 'Skyline Heights - Tower B Site',
    note: 'Part payment towards opening balance & invoice INV-2026-101',
    recordedBy: {
      userId: 'user_4',
      userName: 'Anita Verma',
      userRole: 'Accountant',
    },
    createdAt: '2026-09-27T15:30:00Z',
  },
  {
    id: 'rec_2',
    type: 'receipt',
    receiptNo: 'REC-2026-052',
    date: '2026-10-01',
    partyId: 'party_2',
    partyName: 'Apex Infrastructure & Developers',
    amount: 50000,
    paymentMode: 'UPI / GPay / PhonePe',
    referenceNo: 'UPI-42849201847',
    site: 'Green Valley Villas Site 4',
    note: 'Advance on Fly ash bricks delivery',
    recordedBy: {
      userId: 'user_2',
      userName: 'Sunil Kumar',
      userRole: 'Billing Desk',
    },
    createdAt: '2026-10-01T12:10:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_1',
    type: 'payment',
    voucherNo: 'PAY-2026-031',
    date: '2026-09-26',
    partyId: 'party_3',
    partyName: 'Jindal Coal & Mineral Traders',
    amount: 100000,
    paymentMode: 'Bank Transfer (NEFT/RTGS)',
    referenceNo: 'SBI-RTGS-99201844',
    site: 'Kiln Plant Coal Yard',
    note: 'RTGS clearance against coal supply bill JND-COAL-889',
    recordedBy: {
      userId: 'user_4',
      userName: 'Anita Verma',
      userRole: 'Accountant',
    },
    createdAt: '2026-09-26T17:00:00Z',
  },
  {
    id: 'pay_2',
    type: 'payment',
    voucherNo: 'PAY-2026-032',
    date: '2026-10-02',
    partyId: 'party_4',
    partyName: 'UltraTech & ACC Cement Depot',
    amount: 75000,
    paymentMode: 'Cheque',
    referenceNo: 'CHQ #441209 (HDFC Bank)',
    site: 'Main Raw Material Shed',
    note: 'Account payee cheque cleared',
    recordedBy: {
      userId: 'user_1',
      userName: 'Anmol Sharma',
      userRole: 'Admin / Owner',
    },
    createdAt: '2026-10-02T16:30:00Z',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    type: 'expense',
    voucherNo: 'EXP-2026-081',
    date: '2026-09-26',
    category: 'Fuel & Transport',
    paidTo: 'Bharat Petroleum Highway Station',
    amount: 14500,
    paymentMode: 'UPI / GPay / PhonePe',
    site: 'Tractor & JCB Fleet',
    note: 'Diesel 160 Litres for JCB & tractor earthmoving',
    recordedBy: {
      userId: 'user_3',
      userName: 'Ramesh Patel',
      userRole: 'Site Supervisor',
    },
    createdAt: '2026-09-26T08:30:00Z',
  },
  {
    id: 'exp_2',
    type: 'expense',
    voucherNo: 'EXP-2026-082',
    date: '2026-09-30',
    category: 'Labor & Wages',
    paidTo: 'Kiln Labor Sirdar (Weekly Payout)',
    amount: 38000,
    paymentMode: 'Cash',
    site: 'Kiln Plant #1 & #2',
    note: 'Raw brick molding & stacking wages for 14 workers',
    recordedBy: {
      userId: 'user_1',
      userName: 'Anmol Sharma',
      userRole: 'Admin / Owner',
    },
    createdAt: '2026-09-30T19:00:00Z',
  },
  {
    id: 'exp_3',
    type: 'expense',
    voucherNo: 'EXP-2026-083',
    date: '2026-10-02',
    category: 'Machinery Maintenance',
    paidTo: 'Sharma Hydraulic & Welding Works',
    amount: 6800,
    paymentMode: 'Cash',
    site: 'Fly Ash Brick Press Unit',
    note: 'Hydraulic piston seal replacement and grease oil',
    recordedBy: {
      userId: 'user_3',
      userName: 'Ramesh Patel',
      userRole: 'Site Supervisor',
    },
    createdAt: '2026-10-02T14:40:00Z',
  },
];

export interface AppStateData {
  company: CompanyProfile;
  users: AppUser[];
  activeUserId: string;
  parties: Party[];
  sales: SaleBill[];
  purchases: PurchaseBill[];
  receipts: Receipt[];
  payments: Payment[];
  expenses: Expense[];
  balanceAsOfDate: string; // The active date filter for real-time balances
}

export function loadAppState(): AppStateData {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_v1`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        company: parsed.company || INITIAL_COMPANY,
        users: parsed.users || INITIAL_USERS,
        activeUserId: parsed.activeUserId || INITIAL_USERS[0].id,
        parties: parsed.parties || INITIAL_PARTIES,
        sales: parsed.sales || INITIAL_SALES,
        purchases: parsed.purchases || INITIAL_PURCHASES,
        receipts: parsed.receipts || INITIAL_RECEIPTS,
        payments: parsed.payments || INITIAL_PAYMENTS,
        expenses: parsed.expenses || INITIAL_EXPENSES,
        balanceAsOfDate: parsed.balanceAsOfDate || getTodayISO(),
      };
    }
  } catch (err) {
    console.warn('Failed to load stored state, initializing with defaults', err);
  }

  return {
    company: INITIAL_COMPANY,
    users: INITIAL_USERS,
    activeUserId: INITIAL_USERS[0].id,
    parties: INITIAL_PARTIES,
    sales: INITIAL_SALES,
    purchases: INITIAL_PURCHASES,
    receipts: INITIAL_RECEIPTS,
    payments: INITIAL_PAYMENTS,
    expenses: INITIAL_EXPENSES,
    balanceAsOfDate: getTodayISO(),
  };
}

export function saveAppState(state: AppStateData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}state_v1`, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function resetAppState(): AppStateData {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}state_v1`);
  const initial = loadAppState();
  saveAppState(initial);
  return initial;
}
