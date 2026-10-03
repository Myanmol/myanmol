import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Shield,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { AppUser } from '../types';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  onAddUser: (user: AppUser) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetData: () => void;
}

const ROLES: AppUser['role'][] = [
  'Admin / Owner',
  'Billing Desk',
  'Sales Manager',
  'Site Supervisor',
  'Accountant',
];

const COLORS = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-cyan-600',
];

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onAddUser,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppUser['role']>('Billing Desk');
  const [newUserPhone, setNewUserPhone] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole,
      avatarColor: randomColor,
      phone: newUserPhone.trim(),
    };

    onAddUser(newUser);
    onSelectUser(newUser.id);
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserPhone('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Switch Operator / User</h3>
              <p className="text-xs text-slate-400">Multiple users can record and track entries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* User List */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 text-xs block">Active Operators & Team</label>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {users.map((u) => {
                const isActive = u.id === activeUserId;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u.id);
                      onClose();
                    }}
                    className={`w-full p-3 flex items-center justify-between transition-colors text-left ${
                      isActive ? 'bg-indigo-50/80' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${u.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{u.name}</span>
                          {isActive && (
                            <span className="text-[10px] bg-indigo-600 text-white font-semibold px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px]">{u.role}</div>
                      </div>
                    </div>

                    {isActive && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add New User */}
          {!isAddingUser ? (
            <button
              onClick={() => setIsAddingUser(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/60 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Team Member / Operator
            </button>
          ) : (
            <form onSubmit={handleCreateUser} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs">New Operator Profile</div>
              <div>
                <label className="block text-slate-600 text-[11px] mb-0.5">Operator Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as AppUser['role'])}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="98765..."
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="flex-1 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Save Operator
                </button>
              </div>
            </form>
          )}

          {/* Backup, Restore & Reset Section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label className="font-bold text-slate-800 text-xs block">Data Backup & Sync</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Backup (JSON)
              </button>
              <label className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" /> Restore File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial sample demo data with brick business records?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-1.5 text-[11px] text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Sample Business Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
