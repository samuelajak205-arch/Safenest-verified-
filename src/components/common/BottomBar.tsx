import React from 'react';
import {
  Home,
  Building2,
  Users,
  ShieldAlert,
  Settings,
  FileCheck,
  MessageSquare,
  Search,
  Heart,
  FileText,
  Flame,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';

interface BottomBarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ currentView, onNavigate }) => {
  const store = useSafeNestStore();
  const role = store.currentUser.role;

  // Real-time counts for badges (only show when count > 0)
  const savedCount = store.favorites.length;
  const pendingPhotosCount = store.properties.reduce(
    (acc, p) => acc + p.images.filter((img) => img.status === 'pending').length,
    0
  );
  const pendingLandlordApps = store.applications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const pendingRentalAppsCount = store.rentalApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const pendingInquiriesCount = store.inquiries.filter(
    (i) => i.status === 'new' || i.status === 'reviewing'
  ).length;

  let tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    isActive: boolean;
  }> = [];

  if (role === 'super_admin') {
    // =========================================
    // ACCOUNT 1: ADMIN BOTTOM NAV (5 tabs):
    // [Home] [Properties] [Gatekeeper] [Deals] [Profile]
    // =========================================

    tabs = [
      {
        id: 'admin-home',
        label: 'Home',
        icon: Home,
        isActive: currentView === 'admin-home' || currentView === 'admin' || currentView === 'admin-dashboard',
      },
      {
        id: 'admin-properties',
        label: 'Properties',
        icon: Building2,
        isActive: currentView === 'admin-properties' || currentView === 'admin-applications' || currentView === 'admin-moderate',
      },
      {
        id: 'admin-inquiries',
        label: 'Gatekeeper',
        icon: ShieldAlert,
        badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : undefined,
        isActive: currentView === 'admin-inquiries',
      },
      {
        id: 'admin-deals',
        label: 'Deals',
        icon: Flame,
        isActive: currentView === 'admin-deals',
      },
      {
        id: 'settings',
        label: 'Profile',
        icon: Settings,
        isActive: currentView === 'settings' || currentView === 'admin-settings' || currentView === 'admin-profile',
      },
    ];
  } else if (role === 'landlord') {
    // =========================================
    // ACCOUNT 2: LANDLORD BOTTOM NAV (5 tabs):
    // [Home] [Properties] [Applications] [Messages] [Profile]
    // =========================================
    tabs = [
      {
        id: 'landlord-home',
        label: 'Home',
        icon: Home,
        isActive: currentView === 'landlord-home' || currentView === 'landlord' || currentView === 'landlord-dashboard',
      },
      {
        id: 'landlord-properties',
        label: 'Properties',
        icon: Building2,
        isActive: currentView === 'landlord-properties',
      },
      {
        id: 'landlord-applications',
        label: 'Applications',
        icon: FileCheck,
        badge: pendingRentalAppsCount > 0 ? pendingRentalAppsCount : undefined,
        isActive: currentView === 'landlord-applications',
      },
      {
        id: 'landlord-messages',
        label: 'Messages',
        icon: MessageSquare,
        badge: 2,
        isActive: currentView === 'landlord-messages',
      },
      {
        id: 'settings',
        label: 'Profile',
        icon: Settings,
        isActive: currentView === 'settings' || currentView === 'landlord-settings' || currentView === 'landlord-profile',
      },
    ];
  } else {
    // =========================================
    // ACCOUNT 3: USER (TENANT) BOTTOM NAV (5 tabs):
    // [Home] [Deals] [Saved] [Inbox] [Profile]
    // =========================================
    tabs = [
      {
        id: 'user-browse',
        label: 'Home',
        icon: Home,
        isActive: currentView === 'user-browse' || currentView === 'browse',
      },
      {
        id: 'deals',
        label: 'Deals',
        icon: Flame,
        isActive: currentView === 'deals',
      },
      {
        id: 'user-saved',
        label: 'Saved',
        icon: Heart,
        badge: savedCount > 0 ? savedCount : undefined,
        isActive: currentView === 'user-saved' || currentView === 'saved',
      },
      {
        id: 'user-inbox',
        label: 'Inbox',
        icon: MessageSquare,
        badge: 2,
        isActive: currentView === 'user-inbox' || currentView === 'inbox',
      },
      {
        id: 'settings',
        label: 'Profile',
        icon: Settings,
        isActive: currentView === 'settings' || currentView === 'user-settings' || currentView === 'user-profile' || currentView === 'user-applications',
      },
    ];
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl safe-area-bottom h-16"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 h-full">
        <div className="flex items-center justify-around h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all relative ${
                  tab.isActive
                    ? 'text-emerald-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label={tab.label}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform duration-200 ${
                      tab.isActive ? 'scale-110' : ''
                    }`}
                  />
                  {/* Badge only when count > 0 */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs leading-none">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight mt-1 leading-none">
                  {tab.label}
                </span>

                {/* Active Indicator bar */}
                {tab.isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
