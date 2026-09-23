import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Save,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { UserRole } from '../../types';

export const ProfileView: React.FC = () => {
  const store = useSafeNestStore();

  const [fullName, setFullName] = useState(store.currentUser.fullName);
  const [phone, setPhone] = useState(store.currentUser.phone);
  const [nationalIdNumber, setNationalIdNumber] = useState(store.currentUser.nationalIdNumber || '');
  const [companyName, setCompanyName] = useState(store.currentUser.companyName || '');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUserProfile({
      fullName,
      phone,
      nationalIdNumber,
      companyName,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={store.currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
              alt={store.currentUser.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{store.currentUser.fullName}</h1>
                {store.currentUser.isVerified && (
                  <span title="SafeNest Verified">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 capitalize">
                Role: <strong>{store.currentUser.role.replace('_', ' ')}</strong> · SafeNest Uganda
              </p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">Switch Test Persona:</span>
            <div className="flex gap-1">
              {(['super_admin', 'landlord', 'user', 'applicant'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => store.switchRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    store.currentUser.role === r
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {savedMessage && (
          <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile information successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={store.currentUser.email}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Uganda National ID (NIN)
              </label>
              <input
                type="text"
                placeholder="CM..."
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>
          </div>

          {(store.currentUser.role === 'landlord' || store.currentUser.role === 'super_admin') && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Property Agency / Business Name
              </label>
              <input
                type="text"
                placeholder="e.g. Uganda Prime Estates Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Google Drive Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Google Drive Tenancy Vault</h3>
            <p className="text-xs text-slate-500">
              {store.googleAccessToken
                ? `Connected to ${store.googleUserEmail}`
                : 'Connect to sync rental lease dockets & property documents'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            store.googleAccessToken ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {store.googleAccessToken ? 'Active' : 'Unlinked'}
        </span>
      </div>
    </div>
  );
};
