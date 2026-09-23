import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  FileSignature,
  Clock,
  DollarSign,
  ChevronRight,
  Send,
  MessageSquare,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { SendAnnouncementModal } from './SendAnnouncementModal';
import { Inquiry } from '../../types';
import { ChatModal } from '../common/ChatModal';

interface LandlordDashboardViewProps {
  onNavigateToProperties: () => void;
  onNavigateToApplications: () => void;
  onNavigateToMessages: () => void;
}

export const LandlordDashboardView: React.FC<LandlordDashboardViewProps> = ({
  onNavigateToProperties,
  onNavigateToApplications,
  onNavigateToMessages,
}) => {
  const store = useSafeNestStore();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Landlord's data
  const myProperties = store.properties.filter(
    (p) => p.landlordId === store.currentUser.id || p.landlordId === 'usr_landlord_001'
  );
  const myLeases = store.leases.filter(
    (l) => l.landlordId === store.currentUser.id || l.landlordId === 'usr_landlord_001'
  );
  const pendingApps = store.rentalApplications.filter(
    (a) =>
      (a.landlordId === store.currentUser.id || a.landlordId === 'usr_landlord_001') &&
      (a.status === 'submitted' || a.status === 'under_review')
  );

  // Inquiries for Grace Nakimera
  const recentInquiries = store.inquiries.filter(
    (i) => i.landlordId === store.currentUser.id || i.landlordId === 'usr_landlord_001'
  );

  return (
    <div className="space-y-5 pb-28">
      {/* 1. Header Greeting & Verified Badge */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Welcome, {store.currentUser.fullName || 'Grace Nakimera'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SafeNest Landlord Management Console · Kampala & Entebbe
          </p>
        </div>

        {/* Green Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Landlord</span>
        </div>
      </div>

      {/* 2. Stats Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stat 1: My Properties: 3 (green) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            My Properties
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {myProperties.length || 3}
          </div>
          <span className="text-[10px] text-slate-400">Assigned by admin</span>
        </div>

        {/* Stat 2: Active Leases: 2 (blue) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Active Leases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {myLeases.filter((l) => l.status === 'active').length || 2}
          </div>
          <span className="text-[10px] text-slate-400">Verified contracts</span>
        </div>

        {/* Stat 3: Pending Applications: 1 (orange) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Pending Applications
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
            {pendingApps.length || 1}
          </div>
          <span className="text-[10px] text-slate-400">Requires review</span>
        </div>

        {/* Stat 4: Monthly Rent: UGX 2,400,000 (green) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Monthly Rent
          </span>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 mt-1 truncate">
            UGX 2,400,000
          </div>
          <span className="text-[10px] text-slate-400">Projected portfolio</span>
        </div>
      </div>

      {/* 3. Section: Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={onNavigateToProperties}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs text-left flex items-center justify-between min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">View Properties</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onNavigateToApplications}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs text-left flex items-center justify-between min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Review Applications ({pendingApps.length || 1})
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs text-left flex items-center justify-between min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Send Announcement</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4. Section: Rent Tracker - This Month */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Rent Tracker · This Month
              </h3>
              <p className="text-[10px] text-slate-400">September 2026 Collection Cycle</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">UGX 2,400,000</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          <div className="bg-emerald-600 h-2.5 rounded-l-full" style={{ width: '75%' }} />
          <div className="bg-amber-500 h-2.5 rounded-r-full" style={{ width: '25%' }} />
        </div>

        {/* Received vs Pending metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Received</span>
              <span className="text-emerald-700 text-[10px]">3 of 4 units paid</span>
            </div>
            <strong className="text-emerald-700 font-bold text-xs sm:text-sm">
              UGX 1,800,000
            </strong>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending</span>
              <span className="text-amber-700 text-[10px]">Due Sept 15</span>
            </div>
            <strong className="text-amber-600 font-bold text-xs sm:text-sm">
              UGX 600,000
            </strong>
          </div>
        </div>
      </div>

      {/* 5. Section: Recent Inquiries */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Recent Inquiries</h3>
          </div>
          <button
            onClick={onNavigateToMessages}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentInquiries.slice(0, 3).map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => setSelectedInquiry(inquiry)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                  {inquiry.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{inquiry.name}</h4>
                  <p className="text-[11px] text-slate-600 italic line-clamp-1">
                    "{inquiry.message}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400">Tap to reply</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <SendAnnouncementModal onClose={() => setShowAnnouncementModal(false)} />
      )}

      {/* Reply Chat Modal */}
      {selectedInquiry && (
        <ChatModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </div>
  );
};
