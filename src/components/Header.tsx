import React from 'react';
import { Calendar, User, ChevronDown, Building2, Clock, Users } from 'lucide-react';
import { CompanyProfile, AppUser } from '../types';
import { formatDate } from '../utils/formatters';

interface HeaderProps {
  company: CompanyProfile;
  activeUser: AppUser;
  balanceAsOfDate: string;
  onDateChange: (date: string) => void;
  onOpenUserSwitcher: () => void;
  onOpenCompanySettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  activeUser,
  balanceAsOfDate,
  onDateChange,
  onOpenUserSwitcher,
  onOpenCompanySettings,
}) => {
  const isToday = balanceAsOfDate === new Date().toISOString().slice(0, 10);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      {/* Top Branding & Active User Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={onOpenCompanySettings}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/30 transition-colors">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
              <span className="truncate max-w-[180px] sm:max-w-xs">{company.name}</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">Pro</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {company.phone || 'Multi-User Ledger & Billing'}
            </p>
          </div>
        </button>

        {/* User Switcher Pill */}
        <button
          onClick={onOpenUserSwitcher}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-left"
          title="Switch Active Operator / User"
        >
          <div className={`w-6 h-6 rounded-full ${activeUser.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
            {activeUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-semibold text-slate-200">{activeUser.name}</div>
            <div className="text-[10px] text-indigo-300">{activeUser.role}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Date-Specific Balance Bar (CRITICAL REQUIREMENT: Balances as of any date) */}
      <div className="px-4 py-2 bg-slate-950/80 flex items-center justify-between text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium hidden xs:inline">Balances As Of:</span>
          <span className="text-slate-300 font-medium xs:hidden">As Of:</span>
          <span className="font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {formatDate(balanceAsOfDate)} {isToday ? '(Today)' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="date-picker-input"
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded cursor-pointer transition-colors border border-indigo-500/20"
          >
            <Clock className="w-3 h-3" />
            <span>Change Date</span>
            <input
              id="date-picker-input"
              type="date"
              value={balanceAsOfDate}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(e.target.value);
                }
              }}
              className="sr-only"
            />
          </label>

          {!isToday && (
            <button
              onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
              className="text-[11px] text-slate-400 hover:text-white underline decoration-slate-600 transition-colors"
            >
              Reset to Today
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
