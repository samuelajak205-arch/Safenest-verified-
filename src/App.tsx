/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher';
import { BottomBar } from './components/common/BottomBar';
import { PropertyDetailModal } from './components/browse/PropertyDetailModal';
import { PropertyUploadForm } from './components/properties/PropertyUploadForm';
import { GoogleDriveHub } from './components/drive/GoogleDriveHub';
import { GmailHub } from './components/gmail/GmailHub';
import { ManualRentLedgerView } from './components/rental/ManualRentLedgerView';
import { InspectionChecklistView } from './components/rental/InspectionChecklistView';
import { LeaseManagementHub } from './components/rental/LeaseManagementHub';
import { TenantApplicationsView } from './components/rental/TenantApplicationsView';
import { SettingsView } from './components/settings/SettingsView';
import { NotificationsInboxView } from './components/notifications/NotificationsInboxView';
import { AuthView } from './components/auth/AuthView';

// User Views
import { UserBrowseView } from './components/user/UserBrowseView';
import { UserLeasesView } from './components/user/UserLeasesView';
import { UserSavedView } from './components/user/UserSavedView';
import { UserInboxView } from './components/user/UserInboxView';
import { UserProfileView } from './components/user/UserProfileView';
import { DealsGridView } from './components/deals/DealsGridView';

// Landlord Views
import { LandlordDashboardView } from './components/landlord/LandlordDashboardView';
import { LandlordPropertiesView } from './components/landlord/LandlordPropertiesView';
import { LandlordApplicationsView } from './components/landlord/LandlordApplicationsView';
import { LandlordMessagesView } from './components/landlord/LandlordMessagesView';
import { LandlordProfileView } from './components/landlord/LandlordProfileView';

// Admin Views
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminPropertiesView } from './components/admin/AdminPropertiesView';
import { AdminApplicationsView } from './components/admin/AdminApplicationsView';
import { AdminModerationView } from './components/admin/AdminModerationView';
import { AdminProfileView } from './components/admin/AdminProfileView';
import { AdminDealsManagementView } from './components/admin/AdminDealsManagementView';
import { AdminInquiriesView } from './components/admin/AdminInquiriesView';

// Profile Views
import { EditProfileView } from './components/profile/EditProfileView';
import { ChangePasswordView } from './components/profile/ChangePasswordView';

import { useSafeNestStore } from './lib/store';
import { Property, RentalApplication } from './types';
import { Building2 } from 'lucide-react';

export default function App() {
  const store = useSafeNestStore();

  // Navigation State defaults to 'browse' for User, 'landlord' for Landlord, 'admin' for Admin
  const [currentView, setCurrentView] = useState<string>(() => {
    if (store.currentUser.role === 'super_admin') return 'admin';
    if (store.currentUser.role === 'landlord') return 'landlord';
    return 'browse';
  });

  React.useEffect(() => {
    const handleGlobalNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleNavigate(customEvent.detail);
      }
    };
    window.addEventListener('safenest-navigate', handleGlobalNav);
    return () => window.removeEventListener('safenest-navigate', handleGlobalNav);
  }, []);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [applicationToDraftLease, setApplicationToDraftLease] = useState<RentalApplication | null>(null);

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view);
    if (data?.property) {
      setSelectedProperty(data.property);
    }
    if (data?.application) {
      setApplicationToDraftLease(data.application);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!store.isLoggedIn) {
    return (
      <AuthView
        onLoginSuccess={(role) => {
          handleNavigate(
            role === 'super_admin' ? 'admin' : role === 'landlord' ? 'landlord' : 'browse'
          );
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. Header with Role-Tailored Controls */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* 2. Main Scroll Region (Mobile-First 480px Centered Container) */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-4 pb-20">
          
          {/* ================= ACCOUNT 3: USER (TENANT) VIEWS ================= */}
          {(currentView === 'browse' || currentView === 'detail') && (
            <UserBrowseView
              onSelectProperty={(property) => setSelectedProperty(property)}
              onOpenLeases={() => handleNavigate('user-leases')}
              onNavigateToDeals={() => handleNavigate('deals')}
            />
          )}

          {currentView === 'deals' && (
            <DealsGridView />
          )}

          {(currentView === 'user-leases' || currentView === 'leases') && (
            <UserLeasesView onBrowseRentals={() => handleNavigate('browse')} />
          )}

          {(currentView === 'user-saved' || currentView === 'favorites') && (
            <UserSavedView
              onSelectProperty={(property) => setSelectedProperty(property)}
              onBrowseRentals={() => handleNavigate('browse')}
            />
          )}

          {(currentView === 'user-inbox' || currentView === 'inquiries') && (
            <UserInboxView onBrowseRentals={() => handleNavigate('browse')} />
          )}

          {(currentView === 'user-profile' || (currentView === 'profile' && store.currentUser.role === 'user')) && (
            <UserProfileView
              onNavigateToApplications={() => handleNavigate('tenant_applications')}
              onNavigateToInbox={() => handleNavigate('user-inbox')}
              onNavigateToEditProfile={() => handleNavigate('profile-edit')}
              onNavigateToChangePassword={() => handleNavigate('change-password')}
            />
          )}

          {/* ================= ACCOUNT 2: LANDLORD VIEWS ================= */}
          {(currentView === 'landlord' || currentView === 'landlord-dashboard') && (
            <LandlordDashboardView
              onNavigateToProperties={() => handleNavigate('landlord-properties')}
              onNavigateToApplications={() => handleNavigate('landlord-applications')}
              onNavigateToMessages={() => handleNavigate('landlord-messages')}
            />
          )}

          {currentView === 'landlord-properties' && (
            <LandlordPropertiesView
              onSelectProperty={(property) => setSelectedProperty(property)}
            />
          )}

          {currentView === 'landlord-applications' && (
            <LandlordApplicationsView
              onCreateLease={(app) => {
                setApplicationToDraftLease(app);
                handleNavigate('leases');
              }}
            />
          )}

          {currentView === 'landlord-messages' && <LandlordMessagesView />}

          {(currentView === 'landlord-profile' || (currentView === 'profile' && store.currentUser.role === 'landlord')) && (
            <LandlordProfileView
              onNavigateToLeases={() => handleNavigate('leases')}
              onNavigateToRentHistory={() => handleNavigate('rent_ledger')}
              onNavigateToEditProfile={() => handleNavigate('profile-edit')}
              onNavigateToChangePassword={() => handleNavigate('change-password')}
            />
          )}

          {/* ================= ACCOUNT 1: ADMIN VIEWS ================= */}
          {(currentView === 'admin' || currentView === 'admin-dashboard') && (
            <AdminDashboardView
              onUploadProperty={() => handleNavigate('upload-property')}
              onNavigateToApplications={() => handleNavigate('admin-applications')}
              onNavigateToModeration={() => handleNavigate('admin-moderation')}
              onNavigateToProperties={() => handleNavigate('admin-properties')}
              onNavigateToDeals={() => handleNavigate('admin-deals')}
            />
          )}

          {currentView === 'admin-properties' && (
            <AdminPropertiesView
              onUploadProperty={() => handleNavigate('upload-property')}
              onSelectProperty={(property) => setSelectedProperty(property)}
            />
          )}

          {currentView === 'admin-applications' && <AdminApplicationsView />}

          {(currentView === 'admin-moderation' || currentView === 'moderation') && (
            <AdminModerationView />
          )}

          {(currentView === 'admin-profile' || (currentView === 'profile' && store.currentUser.role === 'super_admin')) && (
            <AdminProfileView
              onNavigateToEditProfile={() => handleNavigate('profile-edit')}
              onNavigateToChangePassword={() => handleNavigate('change-password')}
            />
          )}

          {currentView === 'admin-deals' && (
            <AdminDealsManagementView />
          )}

          {currentView === 'admin-inquiries' && (
            <AdminInquiriesView />
          )}

          {currentView === 'profile-edit' && (
            <EditProfileView onBack={() => handleNavigate('profile')} />
          )}

          {currentView === 'change-password' && (
            <ChangePasswordView onBack={() => handleNavigate('profile')} />
          )}

          {/* ================= SECONDARY / SPECIALIZED FLOWS ================= */}
          {currentView === 'upload-property' && (
            <PropertyUploadForm
              onSuccess={() => handleNavigate(store.currentUser.role === 'super_admin' ? 'admin-properties' : 'landlord')}
              onCancel={() => handleNavigate(store.currentUser.role === 'super_admin' ? 'admin' : 'landlord')}
            />
          )}

          {currentView === 'tenant_applications' && (
            <TenantApplicationsView
              onBrowseRentals={() => handleNavigate('browse')}
              onViewProperty={(propertyId) => {
                const p = store.properties.find((prop) => prop.id === propertyId);
                if (p) setSelectedProperty(p);
              }}
            />
          )}

          {currentView === 'rent_ledger' && (
            <ManualRentLedgerView onOpenLeases={() => handleNavigate('leases')} />
          )}

          {currentView === 'inspections' && (
            <InspectionChecklistView onOpenLeases={() => handleNavigate('leases')} />
          )}

          {currentView === 'drive' && <GoogleDriveHub />}

          {currentView === 'gmail' && <GmailHub />}

          {(currentView === 'settings' || currentView === 'admin-settings' || currentView === 'landlord-settings' || currentView === 'user-settings') && (
            <SettingsView onNavigate={handleNavigate} onOpenBecomeLandlord={() => {}} />
          )}

          {currentView === 'notifications' && (
            <NotificationsInboxView />
          )}
        </div>
      </main>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onContactLandlordSuccess={() => {}}
          onApplicationSuccess={() => {
            handleNavigate('tenant_applications');
          }}
        />
      )}

      {/* Bottom Navigation Bar (5 tabs per role) */}
      <BottomBar currentView={currentView} onNavigate={handleNavigate} />

      {/* Developer Persona Switcher Dock (Only activated when ?dev=1 or localStorage flag) */}
      <DevRoleSwitcher currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}
