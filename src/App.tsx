import React, { useState, useEffect } from 'react';
import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  Expense,
  FinancialTransaction,
  AppUser,
  CompanyProfile,
} from './types';
import {
  loadAppState,
  saveAppState,
  resetAppState,
  AppStateData,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { PartiesView } from './components/PartiesView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { PartyLedgerView } from './components/PartyLedgerView';
import { QuickAddModal } from './components/QuickAddModal';
import { SaleBillModal } from './components/SaleBillModal';
import { PurchaseBillModal } from './components/PurchaseBillModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentModal } from './components/PaymentModal';
import { ExpenseModal } from './components/ExpenseModal';
import { PartyModal } from './components/PartyModal';
import { BillDetailModal } from './components/BillDetailModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { CompanyModal } from './components/CompanyModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';

export default function App() {
  const [state, setState] = useState<AppStateData>(() => loadAppState());

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // Modal States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [partyToEdit, setPartyToEdit] = useState<Party | null>(null);
  const [preSelectedPartyId, setPreSelectedPartyId] = useState<string | undefined>(undefined);

  const [inspectingTransaction, setInspectingTransaction] = useState<FinancialTransaction | null>(null);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  // Synchronize state with persistent localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Active user lookup
  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) || state.users[0];

  // Handlers for real-time As-Of Date Change
  const handleDateChange = (newDate: string) => {
    setState((prev) => ({
      ...prev,
      balanceAsOfDate: newDate,
    }));
  };

  // Quick Action Handler
  const handleSelectQuickAction = (
    action: 'sale' | 'purchase' | 'receipt' | 'payment' | 'expense' | 'party'
  ) => {
    setPreSelectedPartyId(undefined);
    if (action === 'sale') setIsSaleModalOpen(true);
    if (action === 'purchase') setIsPurchaseModalOpen(true);
    if (action === 'receipt') setIsReceiptModalOpen(true);
    if (action === 'payment') setIsPaymentModalOpen(true);
    if (action === 'expense') setIsExpenseModalOpen(true);
    if (action === 'party') {
      setPartyToEdit(null);
      setIsPartyModalOpen(true);
    }
  };

  // Transaction Save Handlers
  const handleSaveSale = (sale: SaleBill) => {
    setState((prev) => ({
      ...prev,
      sales: [sale, ...prev.sales],
    }));
  };

  const handleSavePurchase = (purchase: PurchaseBill) => {
    setState((prev) => ({
      ...prev,
      purchases: [purchase, ...prev.purchases],
    }));
  };

  const handleSaveReceipt = (receipt: Receipt) => {
    setState((prev) => ({
      ...prev,
      receipts: [receipt, ...prev.receipts],
    }));
  };

  const handleSavePayment = (payment: Payment) => {
    setState((prev) => ({
      ...prev,
      payments: [payment, ...prev.payments],
    }));
  };

  const handleSaveExpense = (expense: Expense) => {
    setState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
  };

  // Party Save Handler (Add & Edit)
  const handleSaveParty = (party: Party) => {
    setState((prev) => {
      const exists = prev.parties.some((p) => p.id === party.id);
      if (exists) {
        return {
          ...prev,
          parties: prev.parties.map((p) => (p.id === party.id ? party : p)),
        };
      }
      return {
        ...prev,
        parties: [...prev.parties, party],
      };
    });

    if (selectedParty && selectedParty.id === party.id) {
      setSelectedParty(party);
    }
  };

  const handleEditParty = (party: Party) => {
    setPartyToEdit(party);
    setIsPartyModalOpen(true);
  };

  // Delete transaction handler
  const handleDeleteTransaction = (id: string, type: string) => {
    setState((prev) => {
      if (type === 'sale') {
        return { ...prev, sales: prev.sales.filter((s) => s.id !== id) };
      }
      if (type === 'purchase') {
        return { ...prev, purchases: prev.purchases.filter((p) => p.id !== id) };
      }
      if (type === 'receipt') {
        return { ...prev, receipts: prev.receipts.filter((r) => r.id !== id) };
      }
      if (type === 'payment') {
        return { ...prev, payments: prev.payments.filter((p) => p.id !== id) };
      }
      if (type === 'expense') {
        return { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) };
      }
      return prev;
    });
  };

  // Data Export & Import Handlers
  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finledger_backup_${state.balanceAsOfDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.parties && parsed.sales) {
          setState(parsed);
          alert('Backup data successfully restored!');
        } else {
          alert('Invalid backup format');
        }
      } catch (err) {
        alert('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    const fresh = resetAppState();
    setState(fresh);
    setSelectedParty(null);
  };

  // Helper to open specific transaction from party ledger view
  const handleAddSaleForParty = (partyId: string) => {
    setPreSelectedPartyId(partyId);
    setIsSaleModalOpen(true);
  };

  const handleAddReceiptForParty = (partyId: string) => {
    setPreSelectedPartyId(partyId);
    setIsReceiptModalOpen(true);
  };

  const handleAddPurchaseForParty = (partyId: string) => {
    setPreSelectedPartyId(partyId);
    setIsPurchaseModalOpen(true);
  };

  const handleAddPaymentForParty = (partyId: string) => {
    setPreSelectedPartyId(partyId);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        company={state.company}
        activeUser={activeUser}
        balanceAsOfDate={state.balanceAsOfDate}
        onDateChange={handleDateChange}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        onOpenCompanySettings={() => setIsCompanyModalOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedParty ? (
          /* Party Detailed Running Ledger View */
          <PartyLedgerView
            party={selectedParty}
            company={state.company}
            sales={state.sales}
            receipts={state.receipts}
            purchases={state.purchases}
            payments={state.payments}
            balanceAsOfDate={state.balanceAsOfDate}
            onBack={() => setSelectedParty(null)}
            onEditParty={handleEditParty}
            onAddSale={handleAddSaleForParty}
            onAddReceipt={handleAddReceiptForParty}
            onAddPurchase={handleAddPurchaseForParty}
            onAddPayment={handleAddPaymentForParty}
            onViewTransaction={(tx) => setInspectingTransaction(tx)}
            onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            company={state.company}
            parties={state.parties}
            sales={state.sales}
            purchases={state.purchases}
            receipts={state.receipts}
            payments={state.payments}
            expenses={state.expenses}
            balanceAsOfDate={state.balanceAsOfDate}
            onDateChange={handleDateChange}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectAction={handleSelectQuickAction}
            onSelectParty={(p) => setSelectedParty(p)}
            onViewTransaction={(tx) => setInspectingTransaction(tx)}
            onViewAllParties={() => setActiveTab('parties')}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        ) : activeTab === 'parties' ? (
          <PartiesView
            company={state.company}
            parties={state.parties}
            sales={state.sales}
            purchases={state.purchases}
            receipts={state.receipts}
            payments={state.payments}
            balanceAsOfDate={state.balanceAsOfDate}
            onSelectParty={(p) => setSelectedParty(p)}
            onEditParty={handleEditParty}
            onAddParty={() => {
              setPartyToEdit(null);
              setIsPartyModalOpen(true);
            }}
          />
        ) : activeTab === 'transactions' ? (
          <TransactionsView
            sales={state.sales}
            purchases={state.purchases}
            receipts={state.receipts}
            payments={state.payments}
            expenses={state.expenses}
            users={state.users}
            onViewTransaction={(tx) => setInspectingTransaction(tx)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : activeTab === 'reports' ? (
          <ReportsView
            company={state.company}
            parties={state.parties}
            sales={state.sales}
            purchases={state.purchases}
            receipts={state.receipts}
            payments={state.payments}
            expenses={state.expenses}
            balanceAsOfDate={state.balanceAsOfDate}
            onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
          />
        ) : null}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedParty(null);
          setActiveTab(tab);
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        partiesCount={state.parties.length}
      />

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      <SaleBillModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setPreSelectedPartyId(undefined);
        }}
        parties={state.parties}
        activeUser={activeUser}
        onSaveSale={handleSaveSale}
        defaultDate={state.balanceAsOfDate}
        preSelectedPartyId={preSelectedPartyId}
      />

      <PurchaseBillModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setPreSelectedPartyId(undefined);
        }}
        parties={state.parties}
        activeUser={activeUser}
        onSavePurchase={handleSavePurchase}
        defaultDate={state.balanceAsOfDate}
        preSelectedPartyId={preSelectedPartyId}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setPreSelectedPartyId(undefined);
        }}
        parties={state.parties}
        activeUser={activeUser}
        onSaveReceipt={handleSaveReceipt}
        defaultDate={state.balanceAsOfDate}
        preSelectedPartyId={preSelectedPartyId}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPreSelectedPartyId(undefined);
        }}
        parties={state.parties}
        activeUser={activeUser}
        onSavePayment={handleSavePayment}
        defaultDate={state.balanceAsOfDate}
        preSelectedPartyId={preSelectedPartyId}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        activeUser={activeUser}
        onSaveExpense={handleSaveExpense}
        defaultDate={state.balanceAsOfDate}
      />

      <PartyModal
        isOpen={isPartyModalOpen}
        onClose={() => {
          setIsPartyModalOpen(false);
          setPartyToEdit(null);
        }}
        partyToEdit={partyToEdit}
        onSaveParty={handleSaveParty}
      />

      <BillDetailModal
        isOpen={Boolean(inspectingTransaction)}
        onClose={() => setInspectingTransaction(null)}
        transaction={inspectingTransaction}
        company={state.company}
      />

      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        users={state.users}
        activeUserId={state.activeUserId}
        onSelectUser={(userId) =>
          setState((prev) => ({ ...prev, activeUserId: userId }))
        }
        onAddUser={(user) =>
          setState((prev) => ({ ...prev, users: [...prev.users, user] }))
        }
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={state.company}
        onSaveCompany={(company) =>
          setState((prev) => ({ ...prev, company }))
        }
      />

      {/* Google Drive Cloud Vault Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        currentState={state}
        onRestoreState={(newState) => setState(newState)}
      />
    </div>
  );
}
