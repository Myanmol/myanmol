import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  Building,
  MapPin,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Edit3,
  Calendar,
} from 'lucide-react';
import {
  Party,
  SaleBill,
  PurchaseBill,
  Receipt,
  Payment,
  CompanyProfile,
} from '../types';
import { calculateAllPartyBalancesAsOfDate } from '../utils/ledger';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PartiesViewProps {
  company: CompanyProfile;
  parties: Party[];
  sales: SaleBill[];
  purchases: PurchaseBill[];
  receipts: Receipt[];
  payments: Payment[];
  balanceAsOfDate: string;
  onSelectParty: (party: Party) => void;
  onEditParty: (party: Party) => void;
  onAddParty: () => void;
}

export const PartiesView: React.FC<PartiesViewProps> = ({
  company,
  parties,
  sales,
  purchases,
  receipts,
  payments,
  balanceAsOfDate,
  onSelectParty,
  onEditParty,
  onAddParty,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'customer' | 'supplier' | 'receivable' | 'payable'
  >('all');

  // Compute live balances as of balanceAsOfDate
  const partySummaries = calculateAllPartyBalancesAsOfDate(
    parties,
    sales,
    receipts,
    purchases,
    payments,
    balanceAsOfDate
  );

  // Filter parties
  const filteredSummaries = partySummaries.filter((s) => {
    // Type filter
    if (filterType === 'customer' && s.party.type !== 'customer' && s.party.type !== 'both') {
      return false;
    }
    if (filterType === 'supplier' && s.party.type !== 'supplier' && s.party.type !== 'both') {
      return false;
    }
    if (filterType === 'receivable' && s.balanceStatus !== 'receivable') {
      return false;
    }
    if (filterType === 'payable' && s.balanceStatus !== 'payable') {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.party.name.toLowerCase().includes(q);
      const matchPhone = (s.party.phone || '').toLowerCase().includes(q);
      const matchSite = (s.party.site || '').toLowerCase().includes(q);
      const matchAddress = (s.party.address || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchSite || matchAddress;
    }

    return true;
  });

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-28">
      {/* Top Controls: Search & Add Party */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search party by name, phone, site..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <button
          onClick={onAddParty}
          className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Party</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filterType === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Parties ({parties.length})
        </button>

        <button
          onClick={() => setFilterType('customer')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filterType === 'customer'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Customers
        </button>

        <button
          onClick={() => setFilterType('supplier')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filterType === 'supplier'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Suppliers
        </button>

        <button
          onClick={() => setFilterType('receivable')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filterType === 'receivable'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          To Receive (Dr)
        </button>

        <button
          onClick={() => setFilterType('payable')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
            filterType === 'payable'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          To Pay (Cr)
        </button>
      </div>

      {/* Date Notice */}
      <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
        <span>Showing real-time balances as of: <strong>{formatDate(balanceAsOfDate)}</strong></span>
        <span>{filteredSummaries.length} found</span>
      </div>

      {/* Parties List */}
      <div className="space-y-2.5">
        {filteredSummaries.map((summary) => {
          const isReceivable = summary.balanceStatus === 'receivable';
          const isPayable = summary.balanceStatus === 'payable';

          return (
            <div
              key={summary.partyId}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden group"
            >
              <div
                onClick={() => onSelectParty(summary.party)}
                className="p-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {summary.party.name}
                      </h4>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 ${
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

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      {summary.party.phone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" /> {summary.party.phone}
                        </span>
                      )}
                      {summary.party.site && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" /> {summary.party.site}
                        </span>
                      )}
                      {summary.party.address && (
                        <span className="text-slate-400 hidden sm:inline">
                          · {summary.party.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real-time Balance as of Date */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-black font-mono ${
                        isReceivable
                          ? 'text-amber-700'
                          : isPayable
                          ? 'text-rose-700'
                          : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(summary.netBalance)}
                    </div>
                    <div className="text-[10px] font-bold tracking-tight">
                      {isReceivable ? (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          You will Receive (Dr)
                        </span>
                      ) : isPayable ? (
                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          You have to Pay (Cr)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Settled (0.00)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {summary.party.phone && (
                    <>
                      <a
                        href={`tel:${summary.party.phone.replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${summary.party.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => onEditParty(summary.party)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <button
                  onClick={() => onSelectParty(summary.party)}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs"
                >
                  <span>View Full Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredSummaries.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Building className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-semibold text-slate-600">No parties found matching criteria</div>
            <p className="text-xs">Try adjusting your search query or filter tags</p>
          </div>
        )}
      </div>
    </div>
  );
};
