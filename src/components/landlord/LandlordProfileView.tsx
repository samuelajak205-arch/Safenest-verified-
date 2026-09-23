import React, { useState } from 'react';
import {
  User,
  FileText,
  FileSignature,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Users,
  Share2
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { ShareModal } from '../common/ShareModal';

interface LandlordProfileViewProps {
  onNavigateToLeases: () => void;
  onNavigateToRentHistory: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToChangePassword: () => void;
}

export const LandlordProfileView: React.FC<LandlordProfileViewProps> = ({
  onNavigateToLeases,
  onNavigateToRentHistory,
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
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Business profiles & payout methods',
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
      id: 'docs',
      title: 'My Documents',
      subtitle: 'Landlord compliance & title verification',
      icon: FileText,
      action: () => setActiveModal('docs'),
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      subtitle: 'Invite other landlords and tenants to SafeNest',
      icon: Users,
      action: handleInviteFriends,
    },
    {
      id: 'leases',
      title: 'Lease Agreements',
      subtitle: `${store.leases.filter((l) => l.landlordId === store.currentUser.id || l.landlordId === 'usr_landlord_001').length} active agreements`,
      icon: FileSignature,
      action: onNavigateToLeases,
    },
    {
      id: 'history',
      title: 'Rent History',
      subtitle: 'Monthly ledger & receipt audit',
      icon: DollarSign,
      action: onNavigateToRentHistory,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Account preferences & notifications',
      icon: Settings,
      action: () => setActiveModal('settings'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'SafeNest landlord partner desk',
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
            src={store.currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'}
            alt={store.currentUser.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">{store.currentUser.fullName || 'Grace Nakimera'}</h2>
          <p className="text-xs text-slate-500">{store.currentUser.email || 'grace.nakimera@gmail.com'}</p>
          
          <div className="mt-2 flex items-center justify-center gap-2">
            {/* Role badge: "Landlord" (blue) */}
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              Landlord
            </span>
            {/* Verified badge (green) */}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </span>
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
              <p className="text-[11px] text-red-400">Sign out of SafeNest Landlord Console</p>
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
              <h3 className="font-bold text-sm text-slate-900 capitalize">{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              {activeModal === 'docs' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="font-semibold text-emerald-800">Uganda National ID (NIN)</p>
                    <p className="text-[11px] text-emerald-700">Verified by Admin David Kato</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="font-semibold text-emerald-800">URA TIN Number</p>
                    <p className="text-[11px] text-emerald-700">1002938471 · Verified</p>
                  </div>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="space-y-2">
                  <p>SafeNest Landlord Partnership Line:</p>
                  <p className="font-bold text-emerald-700 text-sm">+256 772 334 112</p>
                  <p className="text-slate-500">Dedicated desk for tenancy compliance and dispute mediation.</p>
                </div>
              )}

              {activeModal === 'settings' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>Email application alerts</span>
                    <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  </label>
                  <label className="flex items-center justify-between text-xs py-1">
                    <span>SMS rent payment alerts</span>
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
