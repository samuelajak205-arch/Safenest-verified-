import React, { useState } from 'react';
import {
  User,
  FileText,
  CreditCard,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Users,
  Share2,
  Mail,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { ShareModal } from '../common/ShareModal';

interface UserProfileViewProps {
  onNavigateToApplications: () => void;
  onNavigateToInbox: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToChangePassword: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onNavigateToApplications,
  onNavigateToInbox,
  onNavigateToEditProfile,
  onNavigateToChangePassword,
}) => {
  const store = useSafeNestStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteFriends = async () => {
    const text = 'Join SafeNest Uganda to find 100% physically verified rentals without agent fraud!';
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invite Friends to SafeNest',
          text,
          url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Invite failed', err);
        }
      }
    } else {
      setShowInviteModal(true);
    }
  };

  const menuItems = [
    {
      id: 'gmail-hub',
      title: 'Gmail Message Center',
      subtitle: 'Read/Write official tenant correspondence',
      icon: Mail,
      action: () => window.dispatchEvent(new CustomEvent('safenest-navigate', { detail: 'gmail' })),
    },
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Personal info, budget & preferences',
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
      id: 'applications',
      title: 'My Applications',
      subtitle: `${store.rentalApplications.filter((a) => a.tenantId === store.currentUser.id || a.tenantEmail === store.currentUser.email).length} submitted`,
      icon: FileText,
      action: onNavigateToApplications,
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      subtitle: 'Share SafeNest and earn verification credit',
      icon: Users,
      action: handleInviteFriends,
    },
    {
      id: 'documents',
      title: 'Documents',
      subtitle: 'NIN, Employment letter & Payslips',
      icon: ShieldCheck,
      action: () => setActiveModal('documents'),
    },
    {
      id: 'payments',
      title: 'Payment History',
      subtitle: 'Rent receipts & MoMo confirmations',
      icon: CreditCard,
      action: () => setActiveModal('payments'),
    },
    {
      id: 'community',
      title: 'Building Chat',
      subtitle: 'Kololo Hill community forum',
      icon: Building2,
      action: onNavigateToInbox,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Notifications & security',
      icon: Settings,
      action: () => setActiveModal('settings'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Kampala SafeNest helpline',
      icon: HelpCircle,
      action: () => setActiveModal('help'),
    },
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <img
            src={store.currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
            alt={store.currentUser.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">{store.currentUser.fullName}</h2>
          <p className="text-xs text-slate-500">{store.currentUser.email}</p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            <span>Tenant</span>
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

        {/* Logout button (red text) */}
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
              <p className="text-[11px] text-red-400">Sign out of SafeNest</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-300" />
        </button>
      </div>

      {/* Generic Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 capitalize">{activeModal.replace('_', ' ')}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              {activeModal === 'documents' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800">Uganda National ID (NIN)</p>
                    <p className="text-[11px] text-emerald-600 font-medium">✓ Verified: CM92014728X4KA</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800">Employment Verification</p>
                    <p className="text-[11px] text-emerald-600 font-medium">✓ MTN Uganda Ltd (HQ)</p>
                  </div>
                </div>
              )}

              {activeModal === 'payments' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Rent - Sept 2026</span>
                      <span className="text-emerald-600 font-bold">UGX 2,800,000</span>
                    </div>
                    <p className="text-[11px] text-slate-400">MTN MoMo Ref: MM260901-8812</p>
                  </div>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="space-y-2">
                  <p>SafeNest Kampala Support Line:</p>
                  <p className="font-bold text-emerald-700 text-sm">+256 701 445 000</p>
                  <p className="text-slate-500">Available Monday - Saturday, 8:00 AM - 6:00 PM EAT.</p>
                </div>
              )}

              {activeModal === 'settings' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>SMS Rent Notifications</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  </label>
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>WhatsApp Inspection Reminders</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  </label>
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
      {showInviteModal && (
        <ShareModal
          title="Invite Friends to SafeNest"
          text="Join SafeNest Uganda to find 100% physically verified rentals without agent fraud!"
          url={window.location.origin}
          imageUrl="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600"
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};
