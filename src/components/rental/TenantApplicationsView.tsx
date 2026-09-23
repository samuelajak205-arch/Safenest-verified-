import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ScrollText,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { RentalApplication, RentalApplicationStatus } from '../../types';

interface TenantApplicationsViewProps {
  onBrowseProperties?: () => void;
  onOpenLeaseHub?: (leaseId?: string) => void;
}

export const TenantApplicationsView: React.FC<TenantApplicationsViewProps> = ({
  onBrowseProperties,
  onOpenLeaseHub,
}) => {
  const store = useSafeNestStore();
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);

  const myApplications = store.rentalApplications.filter(
    (app) => app.tenantId === store.currentUser.id || app.tenantEmail === store.currentUser.email
  );

  const getStatusBadge = (status: RentalApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Submitted · Pending Landlord Review
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Landlord Reviewing Dossier
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved · Preparing Lease
          </span>
        );
      case 'lease_created':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <ScrollText className="w-3 h-3" /> Digital Lease Ready to Sign
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Application Declined
          </span>
        );
      case 'withdrawn':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Withdrawn
          </span>
        );
      default:
        return null;
    }
  };

  const handleWithdraw = (appId: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      store.withdrawRentalApplication(appId);
      if (selectedApp?.id === appId) {
        const updated = store.rentalApplications.find((a) => a.id === appId);
        if (updated) setSelectedApp(updated);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            My Tenancy Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time landlord review status, verification checks, and digital lease readiness for your rental applications.
          </p>
        </div>

        {onBrowseProperties && (
          <button
            onClick={onBrowseProperties}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Building2 className="w-4 h-4" />
            Browse More Rentals
          </button>
        )}
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Rental Applications Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Find a verified property in Kampala, Entebbe, or Jinja and apply directly using SafeNest's standard tenancy form.
            </p>
          </div>
          {onBrowseProperties && (
            <button
              onClick={onBrowseProperties}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Explore Verified Properties
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications list */}
          <div className="lg:col-span-6 space-y-3">
            {myApplications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.propertyImage}
                        alt={app.propertyTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{app.propertyTitle}</h4>
                        <p className="text-xs text-slate-500">
                          UGX {app.rentAmount?.toLocaleString() || '0'} / mo · {app.propertyCity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>{getStatusBadge(app.status)}</div>
                    <span className="text-[11px] text-slate-400">
                      Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>

                  {app.status === 'lease_created' && onOpenLeaseHub && (
                    <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">
                        🎉 Lease generated! Ready for your signature.
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLeaseHub();
                        }}
                        className="text-xs font-bold px-3 py-1 bg-purple-600 text-white rounded-lg shadow-xs hover:bg-purple-700"
                      >
                        Sign Lease
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6">
            {selectedApp ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-4">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.propertyTitle}</h3>
                    <p className="text-xs text-slate-500">{selectedApp.propertyAddress}</p>
                    <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
                  </div>

                  {selectedApp.status === 'submitted' && (
                    <button
                      onClick={() => handleWithdraw(selectedApp.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Withdraw
                    </button>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Application Milestone Progress
                  </span>
                  <div className="space-y-2.5 pl-2 border-l-2 border-slate-200 text-xs">
                    <div className="relative pl-4">
                      <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span className="font-bold text-slate-800">Application Submitted</span>
                      <span className="text-slate-400 block text-[11px]">
                        {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString() : ''}
                      </span>
                    </div>

                    <div className="relative pl-4">
                      <div
                        className={`absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full ${
                          selectedApp.status !== 'submitted' ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      />
                      <span
                        className={`font-bold ${
                          selectedApp.status !== 'submitted' ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        Landlord Dossier Review
                      </span>
                      {selectedApp.reviewedAt && (
                        <span className="text-slate-400 block text-[11px]">
                          Reviewed by {selectedApp.reviewedBy} at {selectedApp.reviewedAt ? new Date(selectedApp.reviewedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </div>

                    <div className="relative pl-4">
                      <div
                        className={`absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full ${
                          selectedApp.status === 'approved' || selectedApp.status === 'lease_created'
                            ? 'bg-emerald-600'
                            : selectedApp.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span
                        className={`font-bold ${
                          selectedApp.status === 'approved' || selectedApp.status === 'lease_created'
                            ? 'text-emerald-700'
                            : selectedApp.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {selectedApp.status === 'rejected' ? 'Application Declined' : 'Decision & Tenancy Approval'}
                      </span>
                      {selectedApp.rejectionReason && (
                        <span className="text-red-500 block text-[11px] mt-0.5">
                          Reason: {selectedApp.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submitted Application Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Your Submitted Dossier
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">National ID (NIN)</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedApp.personalInfo.nationalIdNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly Income</span>
                      <span className="font-bold text-slate-800">
                        UGX {selectedApp.employmentInfo?.monthlyIncome ? Number(selectedApp.employmentInfo.monthlyIncome).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Employer</span>
                      <span className="text-slate-800">{selectedApp.employmentInfo.employerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Move-in Date</span>
                      <span className="text-slate-800">{selectedApp.preferences.moveInDate}</span>
                    </div>
                  </div>
                </div>

                {/* Landlord Contact Info */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Property Landlord</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{selectedApp.landlordName}</span>
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>

                {/* Action button if ready */}
                {selectedApp.status === 'lease_created' && onOpenLeaseHub && (
                  <button
                    onClick={() => onOpenLeaseHub()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-sm text-xs flex items-center justify-center gap-2"
                  >
                    <ScrollText className="w-4 h-4" />
                    Open Digital Lease Agreement
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">Select an Application</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click on an application from the list to view milestone progress and lease actions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
