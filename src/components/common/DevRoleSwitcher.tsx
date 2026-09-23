import React, { useState, useEffect } from 'react';
import { useSafeNestStore } from '../../lib/store';
import { UserRole } from '../../types';
import { RotateCcw, Wrench, X, Check, ShieldAlert } from 'lucide-react';

interface DevRoleSwitcherProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
}

export const DevRoleSwitcher: React.FC<DevRoleSwitcherProps> = ({ currentView, onNavigate }) => {
  const store = useSafeNestStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // If not in dev mode, do NOT render
  if (!store.developerMode) {
    return null;
  }

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full KYC & moderation' },
    { role: 'landlord', label: 'Landlord', desc: 'Listing & lease management' },
    { role: 'user', label: 'Tenant', desc: 'Browse, apply & chat' },
    { role: 'applicant', label: 'Applicant', desc: 'Pending landlord review' },
  ];

  return (
    <>
      {/* Floating Developer Dock in bottom-left corner */}
      <div className="fixed bottom-20 sm:bottom-4 left-4 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 rounded-full shadow-lg text-xs font-mono font-medium backdrop-blur-md transition-all hover:scale-105 min-h-[44px]"
            title="Open Developer Persona Switcher (?dev=1)"
            aria-label="Open Developer Persona Switcher"
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">DEV MODE:</span>
            <span className="capitalize font-bold text-white">
              {store.currentUser.role.replace('_', ' ')}
            </span>
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl w-80 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Dev Role Switcher
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Close Developer Dock"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Switch test personas to preview permissions and role-based workflows:
            </p>

            {/* Role List */}
            <div className="space-y-1.5 mb-4">
              {roles.map(({ role, label, desc }) => {
                const isActive = store.currentUser.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      store.switchRole(role);
                      if (role === 'super_admin' && (currentView === 'landlord' || currentView === 'applicant-status')) {
                        onNavigate('admin');
                      } else if (role === 'landlord' && currentView === 'admin') {
                        onNavigate('landlord');
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{label}</span>
                        {isActive && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[10px] block ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reset Data with Confirmation */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-medium transition-colors border border-slate-700 min-h-[44px]"
                aria-label="Reset demo sample data"
                title="Reset all demo listings, applications, and leases to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('safenest_dev_mode');
                  store.setDeveloperMode(false);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline px-2 py-1"
                title="Hide Dev Switcher until toggled in settings"
              >
                Hide Dev Dock
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="font-bold text-sm text-white">Reset Sample Data?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore all verified properties, sample tenancy applications, and inspection logs to their initial default test state.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  store.resetData();
                  setShowResetConfirm(false);
                  onNavigate('browse');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold min-h-[44px]"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
