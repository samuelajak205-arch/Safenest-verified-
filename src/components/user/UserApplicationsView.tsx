import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Calendar,
  Eye,
  X,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { RentalApplication, RentalApplicationStatus } from '../../types';

interface UserApplicationsViewProps {
  onBrowse: () => void;
}

export const UserApplicationsView: React.FC<UserApplicationsViewProps> = ({ onBrowse }) => {
  const store = useSafeNestStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);

  // My rental applications
  const myApplications = store.rentalApplications.filter(
    (app) => app.tenantId === store.currentUser.id || app.tenantEmail === store.currentUser.email
  );

  const pendingApps = myApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  );
  const approvedApps = myApplications.filter(
    (a) => a.status === 'approved' || a.status === 'lease_created'
  );
  const rejectedApps = myApplications.filter((a) => a.status === 'rejected');

  const displayedApps =
    activeTab === 'pending'
      ? pendingApps
      : activeTab === 'approved'
      ? approvedApps
      : activeTab === 'rejected'
      ? rejectedApps
      : myApplications;

  const getStatusBadge = (status: RentalApplicationStatus) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'approved':
      case 'lease_created':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Rental Applications</h1>
          <p className="text-xs text-slate-500">
            Track status of your apartment and home rental submissions
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {[
          { id: 'all', label: 'All', count: myApplications.length },
          { id: 'pending', label: 'Pending', count: pendingApps.length },
          { id: 'approved', label: 'Approved', count: approvedApps.length },
          { id: 'rejected', label: 'Rejected', count: rejectedApps.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 rounded-lg text-center font-bold transition-all min-h-[38px] flex items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {displayedApps.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">No applications found</p>
              <p className="text-[11px] mt-0.5">Explore available verified properties across Uganda</p>
            </div>
            <button
              onClick={onBrowse}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Properties</span>
            </button>
          </div>
        ) : (
          displayedApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {app.propertyTitle}
                  </h3>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    UGX {app.rentAmount ? Number(app.rentAmount).toLocaleString() : '0'} / mo
                  </p>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Move-in: {app.preferences?.moveInDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Duration: <strong>{app.preferences?.leaseDurationMonths} Months</strong></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Summary
              </span>
              <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedApp.propertyTitle}
                </h3>
              </div>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                Rent: UGX {selectedApp.rentAmount ? Number(selectedApp.rentAmount).toLocaleString() : '0'} / mo
              </p>
              <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{selectedApp.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Move-in Date:</span>
                <span className="font-semibold text-slate-800">{selectedApp.preferences?.moveInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stay Duration:</span>
                <span className="font-semibold text-slate-800">
                  {selectedApp.preferences?.leaseDurationMonths} Months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Occupants:</span>
                <span className="font-semibold text-slate-800">{selectedApp.preferences?.occupantsCount}</span>
              </div>
            </div>

            {selectedApp.adminNotes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                  Admin Note
                </span>
                <p className="text-slate-700">{selectedApp.adminNotes}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedApp(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
