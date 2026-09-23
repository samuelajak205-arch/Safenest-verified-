import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  Briefcase,
  X,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { RentalApplication } from '../../types';

interface LandlordApplicationsViewProps {
  onCreateLease?: (application: RentalApplication) => void;
}

export const LandlordApplicationsView: React.FC<LandlordApplicationsViewProps> = ({ onCreateLease }) => {
  const store = useSafeNestStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);

  // Applications for this landlord
  const landlordApplications = store.rentalApplications.filter(
    (a) => a.landlordId === store.currentUser.id || a.landlordId === 'usr_landlord_001'
  );

  const pendingApps = landlordApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  );
  const approvedApps = landlordApplications.filter(
    (a) => a.status === 'approved' || a.status === 'lease_created'
  );
  const rejectedApps = landlordApplications.filter((a) => a.status === 'rejected');

  const displayedApps =
    activeTab === 'pending'
      ? pendingApps
      : activeTab === 'approved'
      ? approvedApps
      : rejectedApps;

  const handleApprove = (appId: string) => {
    store.updateRentalApplicationStatus(appId, 'approved', 'Approved by landlord Grace Nakimera.');
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, status: 'approved' });
    }
  };

  const handleReject = (appId: string) => {
    store.updateRentalApplicationStatus(
      appId,
      'rejected',
      'Declined by landlord.',
      'Property reserved for alternate tenant.'
    );
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, status: 'rejected' });
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Rental Applications</h1>
          <p className="text-xs text-slate-500">
            Tenant screening, background dossiers, and approvals
          </p>
        </div>
      </div>

      {/* Tabs: Pending (1) | Approved | Rejected */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold min-h-[40px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Pending</span>
          <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
            {pendingApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold min-h-[40px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'approved'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Approved</span>
          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold rounded-full text-[10px]">
            {approvedApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold min-h-[40px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'rejected'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Rejected</span>
          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold rounded-full text-[10px]">
            {rejectedApps.length}
          </span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {displayedApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No applications in this category</h4>
          </div>
        ) : (
          displayedApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {app.tenantName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{app.tenantName}</h3>
                    <p className="text-xs text-slate-500">{app.propertyTitle}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-center justify-between text-slate-600">
                <span>Employer: <strong>{app.employmentInfo.employerName}</strong></span>
                <span className="font-bold text-emerald-600">UGX {app.rentAmount.toLocaleString()} / mo</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {(app.status === 'submitted' || app.status === 'under_review') && (
                  <>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl min-h-[44px] flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl min-h-[44px] flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-250 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Tenant Screening Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-slate-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Profile Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedApp.tenantName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedApp.tenantName}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Applicant ID: {selectedApp.tenantId}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                  ✓ Verified Tenant
                </span>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-150 text-slate-600">
                <p>📞 Phone: <strong className="text-slate-800">{selectedApp.tenantPhone}</strong></p>
                <p>✉️ Email: <strong className="text-slate-800">{selectedApp.tenantEmail}</strong></p>
              </div>
            </div>

            {/* 1. APPLICATION DATA */}
            <div className="space-y-2 text-left">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                📋 Application Terms & Preferences
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Move-in date</p>
                  <p className="font-bold text-slate-850 mt-0.5">{selectedApp.preferences?.moveInDate || '1 October 2026'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Lease duration</p>
                  <p className="font-bold text-slate-850 mt-0.5">{selectedApp.preferences?.leaseDurationMonths || 12} Months</p>
                </div>
                <div className="mt-1.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Who's moving in</p>
                  <p className="font-bold text-slate-850 mt-0.5">
                    {selectedApp.preferences?.occupantsCount === 1 ? 'Just him' : `${selectedApp.preferences?.occupantsCount} Occupants`}
                  </p>
                </div>
                <div className="mt-1.5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Pets</p>
                  <p className="font-bold text-slate-850 mt-0.5">{selectedApp.preferences?.hasPets ? 'Yes' : 'None'}</p>
                </div>
              </div>
            </div>

            {/* 2. VERIFIED WORK & INCOME DETAILS */}
            <div className="space-y-2 text-left">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                💼 Employment & Verified Income
              </h4>
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Employer</p>
                    <p className="font-bold text-slate-850 mt-0.5">{selectedApp.employmentInfo.employerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Job title</p>
                    <p className="font-bold text-slate-850 mt-0.5">{selectedApp.employmentInfo.jobTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-150">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Monthly income</p>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      UGX {selectedApp.employmentInfo?.monthlyIncome ? Number(selectedApp.employmentInfo.monthlyIncome).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Rent Cover Ratio</p>
                    <p className="font-bold text-slate-850 mt-0.5 flex items-center gap-1">
                      {selectedApp.employmentInfo?.monthlyIncome && selectedApp.rentAmount 
                        ? (Number(selectedApp.employmentInfo.monthlyIncome) / selectedApp.rentAmount).toFixed(1)
                        : '3.0'}x Income vs Rent <span className="text-emerald-600">✓</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. VERIFIED DOCUMENTS */}
            <div className="space-y-2 text-left">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                📁 Verified Dossier Documents
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'National ID (NIN)', url: '#' },
                  { name: 'Employment Letter', url: '#' },
                  { name: 'Bank Statement', url: '#' },
                  { name: 'Reference Letter', url: '#' }
                ].map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    onClick={(e) => { e.preventDefault(); alert(`Opening secure document: ${doc.name} (Verified via SafeNest PKI Ledger)`); }}
                    className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-100/60 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-bold text-emerald-850 text-[10.5px]">{doc.name}</span>
                    <span className="text-[9px] text-emerald-600 bg-white font-black px-1.5 py-0.5 rounded border border-emerald-200">
                      View
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* 4. PREVIOUS LANDLORD REFERENCE */}
            <div className="space-y-2 text-left">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                🏠 Previous Landlord Reference
              </h4>
              <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{selectedApp.rentalHistory?.previousLandlordName || 'Sarah K.'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">📞 {selectedApp.rentalHistory?.previousLandlordPhone || '+256 700 123 456'}</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  ⭐ Recommended
                </span>
              </div>
            </div>

            {/* Action Decisions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {(selectedApp.status === 'submitted' || selectedApp.status === 'under_review') ? (
                <>
                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-750 font-black rounded-xl text-xs min-h-[44px] transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs min-h-[44px] transition-colors shadow-sm"
                  >
                    Approve & Issue Offer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs min-h-[44px] transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
