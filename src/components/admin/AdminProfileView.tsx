import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Activity,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';

interface AdminProfileViewProps {
  onNavigateToEditProfile: () => void;
  onNavigateToChangePassword: () => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  onNavigateToEditProfile,
  onNavigateToChangePassword,
}) => {
  const store = useSafeNestStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Personal info, brand styling & support contacts',
      icon: User,
      action: onNavigateToEditProfile,
    },
    {
      id: 'change-password',
      title: 'Change Password',
      subtitle: 'Update your security credentials',
      icon: Settings,
      action: onNavigateToChangePassword,
    },
    {
      id: 'settings',
      title: 'Account Settings',
      subtitle: 'Platform parameters & security credentials',
      icon: Settings,
      action: () => setActiveModal('settings'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'KYC & photo upload alerts',
      icon: Bell,
      action: () => setActiveModal('notifications'),
    },
    {
      id: 'activity',
      title: 'Activity Log',
      subtitle: 'Immutable audit trail of admin actions',
      icon: Activity,
      action: () => setActiveModal('activity'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Documentation & developer guidelines',
      icon: HelpCircle,
      action: () => setActiveModal('help'),
    },
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col items-center text-center space-y-3">
        {/* Avatar (circular, 80px) */}
        <div className="relative">
          <img
            src={store.currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
            alt="David Kato"
            className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Name: "Admin" (David Kato) & Email */}
        <div>
          <h2 className="text-base font-bold text-slate-900">David Kato (Admin)</h2>
          <p className="text-xs text-slate-500">admin.kato@safenest.ug</p>

          {/* Role badge: "Super Admin" (green) */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Super Admin</span>
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left min-h-[56px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          );
        })}

        {/* Logout (red text) */}
        <button
          onClick={() => {
            store.logoutUser();
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600">Logout</h4>
              <p className="text-[11px] text-red-400">Sign out of SafeNest Admin</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-300" />
        </button>
      </div>

      {/* ADMIN SETTINGS (only visible to admin) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Admin Settings</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Configure platform preferences & testing modes</p>
        </div>

        <div className="space-y-3">
          {/* App Settings */}
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="font-bold text-slate-700">App Settings</span>
            <span className="text-[10px] text-slate-400 font-medium">Auto-moderation active</span>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="font-bold text-slate-700">Branding</span>
            <span className="text-[10px] text-slate-400 font-medium">SafeNest Uganda Theme</span>
          </div>

          {/* Developer Mode Toggle */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-slate-800">Developer Mode</span>
                <span className="text-[10px] text-slate-400">Reveal role-switching docks and menus for live testing</span>
              </div>
              <button
                onClick={() => {
                  store.setDeveloperMode(!store.developerMode);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  store.developerMode ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={store.developerMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    store.developerMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Developer Mode dropdown if toggled ON */}
            {store.developerMode && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-100 text-left">
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 font-bold leading-relaxed">
                  ⚠️ This is for testing only. Regular users and landlords will not see this menu.
                </div>
                
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Switch active test role:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { role: 'super_admin' as const, label: 'Super Admin (David Kato)' },
                      { role: 'landlord' as const, label: 'Landlord (Grace Nakimera)' },
                      { role: 'user' as const, label: 'Tenant (Brian Mukasa)' },
                    ].map((item) => {
                      const isActive = store.currentUser.role === item.role;
                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            store.switchRole(item.role);
                            alert(`✓ Switched role context to: ${item.label}`);
                            window.location.reload();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors min-h-[38px] ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal dialogs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 capitalize">{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              {activeModal === 'activity' && (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {store.activityLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                      <p className="font-bold text-slate-800">{log.action}</p>
                      <p className="text-slate-500">{log.details}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'notifications' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="font-bold text-amber-900">2 Landlord KYC Applications</p>
                    <p className="text-[11px] text-amber-700">Waiting for NIN & deed confirmation</p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-xl border border-red-200">
                    <p className="font-bold text-red-900">1 Photo In Verification Queue</p>
                    <p className="text-[11px] text-red-700">Field compliance review</p>
                  </div>
                </div>
              )}

              {activeModal === 'settings' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>Auto-flag duplicate property GPS</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  </label>
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>Require two-factor for landlord approval</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  </label>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">SafeNest Uganda Operations Manual</p>
                  <p className="text-slate-500">
                    All landlords must submit a verified NIN and verifiable deed before listing assignment.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
