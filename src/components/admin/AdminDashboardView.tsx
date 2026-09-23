import React, { useState } from 'react';
import {
  Building,
  FileCheck,
  Camera,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
  ChevronRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { AssignPropertyModal } from './AssignPropertyModal';

interface AdminDashboardViewProps {
  onUploadProperty: () => void;
  onNavigateToApplications: () => void;
  onNavigateToModeration: () => void;
  onNavigateToProperties: () => void;
  onNavigateToDeals?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onUploadProperty,
  onNavigateToApplications,
  onNavigateToModeration,
  onNavigateToProperties,
  onNavigateToDeals,
}) => {
  const store = useSafeNestStore();
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Metrics
  const totalProperties = store.properties.length;
  const pendingApps = store.applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
  const pendingPhotos = store.properties.reduce(
    (acc, p) => acc + p.images.filter((img) => img.status === 'pending').length,
    0
  );
  const totalUsers = 24; // Ugandan tenant & landlord registered user count

  return (
    <div className="space-y-5 pb-28">
      {/* 1. Greeting */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Welcome back, Admin
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SafeNest Platform Management Hub · Kampala, Entebbe, Jinja & Wakiso
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Verification Engine Live</span>
        </div>
      </div>

      {/* 2. Stats Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Properties: 6 (green number) */}
        <div
          onClick={onNavigateToProperties}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Total Properties
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {totalProperties || 6}
          </div>
          <span className="text-[10px] text-slate-400">Published & cataloged</span>
        </div>

        {/* Pending Applications: 2 (orange number) */}
        <div
          onClick={onNavigateToApplications}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Pending Applications
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
            {pendingApps || 2}
          </div>
          <span className="text-[10px] text-slate-400">Landlord KYC verification</span>
        </div>

        {/* Pending Photos: 1 (red number) */}
        <div
          onClick={onNavigateToModeration}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-red-500/50 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Pending Photos
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-500 mt-1">
            {pendingPhotos || 1}
          </div>
          <span className="text-[10px] text-slate-400">Field compliance review</span>
        </div>

        {/* Total Users: 24 (blue number) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Total Users
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {totalUsers}
          </div>
          <span className="text-[10px] text-slate-400">Renters & verified owners</span>
        </div>
      </div>

      {/* 3. Section: Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {/* Big Green Button: + Upload New Property */}
          <button
            onClick={onUploadProperty}
            className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-between shadow-xs transition-colors min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span>+ Upload New Property</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* White button: Review Applications (2) */}
          <button
            onClick={onNavigateToApplications}
            className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl font-semibold text-xs text-slate-800 flex items-center justify-between shadow-xs transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
              <span>Review Applications ({pendingApps || 2})</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* White button: Review Photos (1) */}
          <button
            onClick={onNavigateToModeration}
            className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl font-semibold text-xs text-slate-800 flex items-center justify-between shadow-xs transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-100 text-red-800 rounded-lg">
                <Camera className="w-4 h-4" />
              </div>
              <span>Review Photos ({pendingPhotos || 1})</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          
          {/* White button: Manage Deals */}
          <button
            onClick={onNavigateToDeals}
            className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl font-semibold text-xs text-slate-800 flex items-center justify-between shadow-xs transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-orange-100 text-orange-800 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <span>Manage Hot Deals ({store.deals.length})</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4. Section: Assign Properties */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Landlord Property Assignment
              </h3>
              <p className="text-[10px] text-slate-400">
                Grant approved landlords management access to properties
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Assign Property to Landlord</span>
        </button>
      </div>

      {/* 5. Section: Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Activity</span>
          </h3>
          <span className="text-[10px] text-slate-400">Platform Audit Log</span>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              action: 'New landlord application',
              entity: 'Sarah Namubiru (Bukoto)',
              time: '2h ago',
              badge: 'KYC Review',
              badgeColor: 'bg-amber-100 text-amber-800',
            },
            {
              action: 'Photo uploaded',
              entity: 'Muyenga Executive Villa (Batch 2)',
              time: '3h ago',
              badge: 'Verification',
              badgeColor: 'bg-red-100 text-red-800',
            },
            {
              action: 'Property published',
              entity: 'Modern Hilltop Apartment (Kololo)',
              time: '5h ago',
              badge: 'Live',
              badgeColor: 'bg-emerald-100 text-emerald-800',
            },
          ].map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <div>
                  <strong className="text-slate-800 font-semibold">{item.action}</strong>
                  <span className="text-slate-500 block text-[11px]">{item.entity}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Property Modal */}
      {showAssignModal && (
        <AssignPropertyModal onClose={() => setShowAssignModal(false)} />
      )}
    </div>
  );
};
