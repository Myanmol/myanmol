import React from 'react';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  FileSpreadsheet,
  Plus,
  Settings,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'parties' | 'transactions' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  partiesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
  partiesCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around relative">
        {/* Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        {/* Parties */}
        <button
          onClick={() => onTabChange('parties')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'parties' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Parties</span>
          {partiesCount > 0 && (
            <span className="absolute top-1 right-3 text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {partiesCount}
            </span>
          )}
        </button>

        {/* Center Prominent Quick Add Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300"
            aria-label="Add Transaction or Party"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Transactions */}
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'transactions' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Entries</span>
        </button>

        {/* Reports & PDF/Excel */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'reports' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Reports</span>
        </button>
      </div>
    </nav>
  );
};
