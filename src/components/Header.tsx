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
  onOpenGoogleDrive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  activeUser,
  balanceAsOfDate,
  onDateChange,
  onOpenUserSwitcher,
  onOpenCompanySettings,
  onOpenGoogleDrive,
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
              <span className="truncate max-w-[150px] sm:max-w-xs">{company.name}</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">Pro</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
              {company.phone || 'Multi-User Ledger & Billing'}
            </p>
          </div>
        </button>

        {/* Right Action Icons: Google Drive + User Switcher */}
        <div className="flex items-center gap-2">
          {/* Google Drive Button */}
          <button
            onClick={onOpenGoogleDrive}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors text-xs font-semibold"
            title="Google Drive Cloud Vault & Backups"
          >
            <svg className="w-4 h-4" viewBox="0 0 87.3 78" fill="none">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
              <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#EA4335"/>
              <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.85 0H34.45c-1.65 0-3.2.4-4.55 1.2z" fill="#00832D"/>
              <path d="m59.8 53-13.75-23.8-13.75 23.8h5.85L43.65 43.5 49.15 53z" fill="#2684FC"/>
              <path d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
            </svg>
            <span className="hidden sm:inline">Drive</span>
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
