import React, { useState } from 'react';
import {
  User,
  Lock,
  Key,
  Bell,
  Mail,
  Globe,
  DollarSign,
  HelpCircle,
  MessageCircle,
  LogOut,
  ChevronRight,
  Shield,
  Building2,
  Smartphone,
  Palette,
  Image as ImageIcon,
  Users,
  UserPlus,
  FileSpreadsheet,
  Database,
  Trash2,
  AlertTriangle,
  FileText,
  Briefcase,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { UserRole } from '../../types';

interface SettingsViewProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenBecomeLandlord?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  onOpenBecomeLandlord,
}) => {
  const store = useSafeNestStore();
  const currentUser = store.currentUser;
  const role = currentUser.role;

  // Toggle states
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Landlord specific toggles
  const [newAppAlerts, setNewAppAlerts] = useState(true);
  const [newInquiryAlerts, setNewInquiryAlerts] = useState(true);
  const [rentReminders, setRentReminders] = useState(true);

  // User specific toggles
  const [propertyAlerts, setPropertyAlerts] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App settings state (Admin)
  const [appName, setAppName] = useState('SafeNest');
  const [supportEmail, setSupportEmail] = useState('admin.kato@safenest.ug');
  const [supportPhone, setSupportPhone] = useState('+256 700 123 456');
  const [primaryColor, setPrimaryColor] = useState('#059669');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Title,Rent,Location,Status\n' +
      store.properties
        .map((p) => `"${p.id}","${p.title}","${p.rentAmount}","${p.address}","${p.status}"`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `safenest_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Platform properties data exported to CSV successfully!');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset demo data? All test changes will be re-initialized.')) {
      localStorage.clear();
      showToast('SafeNest demo data restored to defaults.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleClearCache = () => {
    showToast('Application image & session cache purged successfully.');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of SafeNest?')) {
      store.switchRole('user');
      onNavigate('user-browse');
      showToast('Logged out successfully.');
    }
  };

  return (
    <div className="space-y-5 pb-32 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
      {/* Settings Top Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900">Settings</h1>
        <span className="text-xs text-slate-500">
          Account & App Preferences
        </span>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-900 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <img
          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
          alt={currentUser.fullName}
          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shrink-0 bg-slate-100"
        />

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-slate-900 truncate">
            {currentUser.fullName}
          </h2>
          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>

          <div className="mt-1.5 flex items-center gap-2">
            {role === 'super_admin' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                SUPER ADMIN
              </span>
            ) : role === 'landlord' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300">
                VERIFIED LANDLORD
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
                USER / TENANT
              </span>
            )}
            <span className="text-[10px] text-slate-400">{currentUser.phone}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN-ONLY: APP SETTINGS */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            APP SETTINGS (Admin-Only)
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">App Name</span>
              </div>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="text-xs font-semibold text-right text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg focus:outline-hidden focus:border-emerald-600 max-w-[140px]"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Support Email</span>
              </div>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="text-xs font-semibold text-right text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg focus:outline-hidden focus:border-emerald-600 max-w-[180px]"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Support Phone</span>
              </div>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="text-xs font-semibold text-right text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg focus:outline-hidden focus:border-emerald-600 max-w-[140px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADMIN-ONLY: BRANDING */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            BRANDING (Admin-Only)
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Primary Color</span>
                  <span className="text-[10px] text-slate-400">{primaryColor}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['#059669', '#0284c7', '#7c3aed', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPrimaryColor(c);
                      showToast(`Primary theme updated to ${c}`);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      primaryColor === c ? 'border-slate-900 scale-110 shadow-xs' : 'border-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">App Logo</span>
                  <span className="text-[10px] text-slate-400">SafeNest SVG / PNG Icon</span>
                </div>
              </div>
              <button
                onClick={() => showToast('Logo upload dialog ready for production asset.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN-ONLY: TEAM */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            TEAM MANAGEMENT
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <button
              onClick={() => onNavigate('admin-users')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Manage Admins & Moderators</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => showToast('Co-admin invitation sent to verified email.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Add Co-Admin</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN-ONLY: DATA */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            DATA & BACKUPS
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <button
              onClick={handleExportCSV}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Export Data (CSV)</span>
                  <span className="text-[10px] text-slate-400">Download complete properties catalog</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => showToast('Cloud database snapshot stored securely.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Backup Database</span>
                  <span className="text-[10px] text-slate-400">Create instant cloud snapshot</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LANDLORD-ONLY: BUSINESS INFO */}
      {/* ========================================================================= */}
      {role === 'landlord' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            BUSINESS INFORMATION
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Business Name</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {currentUser.companyName || 'Nakimera Prime Residences Ltd'}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Uganda TIN</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">1004829103</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Contact Phone</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">{currentUser.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. USER-ONLY: BECOME A LANDLORD */}
      {/* ========================================================================= */}
      {role === 'user' && (
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
          <div className="space-y-1 max-w-[70%]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-extrabold text-sm">Become a Landlord</h3>
            </div>
            <p className="text-xs text-emerald-100">
              Own rental properties in Uganda? Apply for verification to list and manage leases.
            </p>
          </div>
          <button
            onClick={() => {
              if (onOpenBecomeLandlord) onOpenBecomeLandlord();
              else showToast('Opening Landlord Application verification form...');
            }}
            className="px-4 py-2.5 bg-white text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
          >
            Apply
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DOCUMENTS (LANDLORD & USER) */}
      {/* ========================================================================= */}
      {(role === 'landlord' || role === 'user') && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            DOCUMENTS
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {role === 'landlord' ? (
              <>
                <button
                  onClick={() => showToast('Accessing active tenant lease agreements...')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">My Lease Agreements (3)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => showToast('Opening verified title deeds & NIN credentials...')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Verification Documents (NIN & Deed)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => showToast('Your Uganda National ID (NIN) is verified on file.')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Uploaded National ID (NIN)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </button>

                <button
                  onClick={() => showToast('Showing 1 active rental tenancy history.')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Rental History & Tenancy Record</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. COMMON: ACCOUNT */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          ACCOUNT
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          <button
            onClick={() => setActiveModal('edit-profile')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Edit Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal('change-password')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Two-Factor Authentication</span>
                <span className="text-[10px] text-slate-400">SMS / Authenticator app verification</span>
              </div>
            </div>
            <button
              onClick={() => {
                const nextVal = !twoFactorAuth;
                setTwoFactorAuth(nextVal);
                showToast(`Two-Factor Authentication ${nextVal ? 'ENABLED' : 'DISABLED'}`);
              }}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                twoFactorAuth ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {twoFactorAuth ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. NOTIFICATIONS PREFERENCES SCREEN (PART 3 & 5) */}
      {/* ========================================================================= */}
      {(() => {
        const userPrefs = store.getUserPreferences(currentUser.id);
        
        const togglePref = (key: keyof typeof userPrefs) => {
          const updatedVal = !userPrefs[key];
          store.updateUserPreferences(currentUser.id, { [key]: updatedVal });
          showToast(`Preference updated: ${String(key)} is now ${updatedVal ? 'ENABLED' : 'DISABLED'}`);
        };

        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                NOTIFICATIONS SYSTEMS
              </h3>
              <p className="text-[10px] text-slate-400 px-1">Configure active channels and quiet hours to prevent midnight disturbances.</p>
            </div>

            {/* CHANNEL TOGGLES */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Push Notifications</span>
                    <span className="text-[10px] text-slate-400">Direct real-time device banners</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePref('pushEnabled')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                    userPrefs.pushEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.pushEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Email Alerts</span>
                    <span className="text-[10px] text-slate-400">Periodic summaries and receipts</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePref('emailEnabled')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                    userPrefs.emailEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.emailEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">WhatsApp Alerts</span>
                    <span className="text-[10px] text-slate-400">Critical lease & rent invoices directly</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePref('whatsappEnabled')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                    userPrefs.whatsappEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.whatsappEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* PIPELINE CONSTRAINTS (QUIET HOURS & CAP) */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                DELIVERY RULES (QUIET HOURS & CAP)
              </h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs p-3.5 space-y-3.5">
              {/* Daily Cap */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Daily Frequency Cap</span>
                  <span className="text-xs font-black text-emerald-700">{userPrefs.dailyLimit} per day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={userPrefs.dailyLimit}
                  onChange={(e) => {
                    const limit = parseInt(e.target.value);
                    store.updateUserPreferences(currentUser.id, { dailyLimit: limit });
                  }}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[9px] text-slate-400 block">Limits standard alert load to avoid noise. Emergency broadcasts bypass.</span>
              </div>

              {/* Quiet Hours Switch */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Quiet Hours</span>
                  <span className="text-[10px] text-slate-400 block">Do not disturb during sleep window</span>
                </div>
                <button
                  onClick={() => togglePref('quietHoursEnabled')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                    userPrefs.quietHoursEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.quietHoursEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Quiet Hours Range selectors */}
              {userPrefs.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">DND Start Time</label>
                    <select
                      value={userPrefs.quietHoursStart}
                      onChange={(e) => store.updateUserPreferences(currentUser.id, { quietHoursStart: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-hidden"
                    >
                      {['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">DND End Time</label>
                    <select
                      value={userPrefs.quietHoursEnd}
                      onChange={(e) => store.updateUserPreferences(currentUser.id, { quietHoursEnd: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-hidden"
                    >
                      {['06:00', '07:00', '08:00', '09:00', '10:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* CATEGORIES PREFERENCES */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                ALERT CATEGORIES
              </h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {/* Category: Emergency */}
              <div className="p-3.5 flex items-center justify-between bg-red-50/40">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="text-xs font-black text-red-900 block">🚨 Emergency Broadcasts</span>
                    <span className="text-[10px] text-red-600 font-medium">Critical safety announcements</span>
                  </div>
                </div>
                <span className="text-[10px] text-red-800 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full font-black uppercase">
                  MANDATORY
                </span>
              </div>

              {/* Category: Property Matches */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Property Alerts</span>
                  <span className="text-[10px] text-slate-400 block">New rental matches in your saved searches</span>
                </div>
                <button
                  onClick={() => togglePref('propertyAlerts')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.propertyAlerts ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.propertyAlerts ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Price Drops */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Price Drop Warnings</span>
                  <span className="text-[10px] text-slate-400 block">When saved listings reduce their rent</span>
                </div>
                <button
                  onClick={() => togglePref('priceDrops')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.priceDrops ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.priceDrops ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Hot Deals */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Hot Deals Updates</span>
                  <span className="text-[10px] text-slate-400 block">Newly posted community marketplace sales</span>
                </div>
                <button
                  onClick={() => togglePref('hotDeals')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.hotDeals ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.hotDeals ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Application Updates */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Application Updates</span>
                  <span className="text-[10px] text-slate-400 block">Submissions, reviews, approvals, or rejections</span>
                </div>
                <button
                  onClick={() => togglePref('applicationUpdates')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.applicationUpdates ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.applicationUpdates ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Inspection Reminders */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Inspection Reminders</span>
                  <span className="text-[10px] text-slate-400 block">Scheduled walk-through notifications</span>
                </div>
                <button
                  onClick={() => togglePref('inspectionReminders')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.inspectionReminders ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.inspectionReminders ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Rent & Invoices */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rent & Invoice Reminders</span>
                  <span className="text-[10px] text-slate-400 block">Automatic billing invoices and receipt confirmations</span>
                </div>
                <button
                  onClick={() => togglePref('rentReminders')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.rentReminders ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.rentReminders ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Lease Agreements */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Lease Signings & Contracts</span>
                  <span className="text-[10px] text-slate-400 block">Lease drafting, expiring, or renewal notifications</span>
                </div>
                <button
                  onClick={() => togglePref('leaseUpdates')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.leaseUpdates ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.leaseUpdates ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Category: Community Broadcasts */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Community Broadcasts</span>
                  <span className="text-[10px] text-slate-400 block">Landlord announcements and neighborhood updates</span>
                </div>
                <button
                  onClick={() => togglePref('announcements')}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    userPrefs.announcements ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {userPrefs.announcements ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 11. PREFERENCES */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          PREFERENCES
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Language</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              English (Uganda) <ChevronRight className="w-4 h-4 text-slate-400" />
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Currency</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              UGX (Uganda Shilling) <ChevronRight className="w-4 h-4 text-slate-400" />
            </span>
          </div>

          {role === 'landlord' && (
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Time Zone</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">Africa/Kampala (EAT)</span>
            </div>
          )}

          {role === 'user' && (
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Search Radius</span>
              </div>
              <span className="text-xs font-semibold text-slate-600">Within 15 km</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. SUPPORT */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          SUPPORT & HELP
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          <button
            onClick={() => showToast('Connecting to SafeNest Knowledge Base...')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Help Center & FAQ</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => showToast('Opening Kampala Support WhatsApp (+256 700 123 456)...')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Contact SafeNest Team</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 13. ADMIN-ONLY: DANGER ZONE */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            DANGER ZONE (Admin-Only)
          </h3>
          <div className="bg-white rounded-2xl border border-red-200 divide-y divide-red-100 shadow-xs overflow-hidden">
            <button
              onClick={handleClearCache}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-500" />
                <div>
                  <span className="text-xs font-bold text-red-700 block">Clear Cache</span>
                  <span className="text-[10px] text-red-400">Purge local temporary data</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>

            <button
              onClick={handleResetData}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <span className="text-xs font-bold text-red-700 block">Reset Demo Data</span>
                  <span className="text-[10px] text-red-400">Restore factory sample properties & accounts</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. LOGOUT BUTTON (red text) */}
      {/* ========================================================================= */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[48px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Edit Profile</span>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={currentUser.fullName}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  defaultValue={currentUser.phone}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Profile information updated.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'change-password' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Change Password</span>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Password updated securely.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
