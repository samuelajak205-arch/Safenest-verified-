import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  Calendar,
  Briefcase,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  Eye,
  ArrowRight,
  ExternalLink,
  DollarSign,
  ScrollText,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { RentalApplication, RentalApplicationStatus } from '../../types';

interface LandlordRentalApplicationsViewProps {
  onOpenLeaseWizard?: (application: RentalApplication) => void;
}

export const LandlordRentalApplicationsView: React.FC<LandlordRentalApplicationsViewProps> = ({
  onOpenLeaseWizard,
}) => {
  const store = useSafeNestStore();
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  // Filter based on role: landlords see apps for their properties, admins see all
  const apps = store.rentalApplications.filter((app) => {
    if (store.currentUser.role === 'landlord') {
      return app.landlordId === store.currentUser.id || app.landlordName.includes('Kato');
    }
    return true;
  });

  const filteredApps = apps.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      app.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo.nationalIdNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: apps.length,
    submitted: apps.filter((a) => a.status === 'submitted').length,
    underReview: apps.filter((a) => a.status === 'under_review').length,
    approved: apps.filter((a) => a.status === 'approved' || a.status === 'lease_created').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  const getStatusBadge = (status: RentalApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> New Submission
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Under Review
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'lease_created':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <ScrollText className="w-3 h-3" /> Lease Generated
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Declined
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

  const handleUpdateStatus = (status: RentalApplicationStatus) => {
    if (!selectedApp) return;
    store.updateRentalApplicationStatus(
      selectedApp.id,
      status,
      actionNotes || undefined,
      rejectionReason || undefined
    );
    // Refresh selectedApp in place
    const updated = store.rentalApplications.find((a) => a.id === selectedApp.id);
    if (updated) setSelectedApp(updated);
    setActionNotes('');
    setShowRejectModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Tenancy Applications & Dossier Screening
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming tenant applications, verify Uganda NINs, assess income eligibility, and generate digital leases.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs">
            <span className="text-slate-400">Total:</span>{' '}
            <strong className="text-slate-800 font-bold">{stats.total}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-blue-600">Pending Review:</span>{' '}
            <strong className="text-blue-800 font-bold">{stats.submitted + stats.underReview}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-emerald-600">Approved:</span>{' '}
            <strong className="text-emerald-800 font-bold">{stats.approved}</strong>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant, property, or NIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'submitted', label: 'New' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'lease_created', label: 'Lease Created' },
            { id: 'rejected', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          {filteredApps.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No applications match filter</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting a different status or clear search</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              const rentRatio = (app.employmentInfo.monthlyIncome / app.rentAmount).toFixed(1);
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                        {app.tenantName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{app.tenantName}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">NIN: {app.personalInfo.nationalIdNumber}</span>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Property</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{app.propertyTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Income vs Rent</span>
                      <span className="font-semibold text-emerald-700">
                        {rentRatio}x (UGX {(app.employmentInfo.monthlyIncome / 1000000).toFixed(1)}M / mo)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Move-in Date</span>
                      <span className="text-slate-700">{app.preferences.moveInDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Applied Date</span>
                      <span className="text-slate-700">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Application Details Dossier */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
              {/* Dossier Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.tenantName}</h3>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applying for: <strong>{selectedApp.propertyTitle}</strong> · UGX{' '}
                    {selectedApp.rentAmount?.toLocaleString() || '0'} / mo
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedApp.status === 'submitted' && (
                    <button
                      onClick={() => handleUpdateStatus('under_review')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                    >
                      Mark Under Review
                    </button>
                  )}
                  {(selectedApp.status === 'submitted' || selectedApp.status === 'under_review') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('approved')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        Approve Tenant
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'approved' && onOpenLeaseWizard && (
                    <button
                      onClick={() => onOpenLeaseWizard(selectedApp)}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                      Draft Lease Agreement
                    </button>
                  )}
                </div>
              </div>

              {/* Dossier Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Status Notice if any */}
                {selectedApp.adminNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Reviewer Note ({selectedApp.reviewedBy}):</span>
                      <p className="mt-0.5">{selectedApp.adminNotes}</p>
                    </div>
                  </div>
                )}

                {selectedApp.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
                    <span className="font-bold">Decline Reason:</span> {selectedApp.rejectionReason}
                  </div>
                )}

                {/* Section 1: Identity & Contact */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Uganda Identity & Contact Verification
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">National ID (NIN)</span>
                      <span className="font-mono font-bold text-slate-800">{selectedApp.personalInfo.nationalIdNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone (WhatsApp)</span>
                      <span className="font-semibold text-slate-800">{selectedApp.tenantPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email</span>
                      <span className="font-semibold text-slate-800">{selectedApp.tenantEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Current Residence</span>
                      <span className="text-slate-700">{selectedApp.personalInfo.currentAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                      <span className="text-slate-700">{selectedApp.personalInfo.dob}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Next of Kin</span>
                      <span className="text-slate-700">
                        {selectedApp.personalInfo.nextOfKinName} ({selectedApp.personalInfo.nextOfKinPhone})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Financial Assessment */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Income & Affordability Assessment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] font-semibold text-emerald-700 block">Verified Net Income</span>
                      <span className="text-base font-bold text-emerald-950 font-mono">
                        UGX {selectedApp.employmentInfo?.monthlyIncome?.toLocaleString() || '0'}
                      </span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Per month</span>
                    </div>

                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl">
                      <span className="text-[10px] font-semibold text-blue-700 block">Rent Coverage Ratio</span>
                      <span className="text-base font-bold text-blue-950">
                        {(selectedApp.employmentInfo.monthlyIncome / selectedApp.rentAmount).toFixed(1)}x
                      </span>
                      <span className="text-[10px] text-blue-600 block mt-0.5">Recommended &gt; 2.5x</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] font-semibold text-slate-600 block">Current Employer</span>
                      <span className="text-xs font-bold text-slate-800 block line-clamp-1">
                        {selectedApp.employmentInfo.employerName}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {selectedApp.employmentInfo.jobTitle} ({selectedApp.employmentInfo.durationYears} yrs)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Rental History & References */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    Rental History & Character References
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Previous Landlord</span>
                        <span className="font-semibold text-slate-800">
                          {selectedApp.rentalHistory.previousLandlordName} ({selectedApp.rentalHistory.previousLandlordPhone})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Reason for Moving</span>
                        <span className="text-slate-700">{selectedApp.rentalHistory.reasonForMoving}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">References</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedApp.references.map((r, i) => (
                          <div key={i} className="p-2 bg-white rounded-xl border border-slate-200/60">
                            <span className="font-bold text-slate-800 block">{r.name}</span>
                            <span className="text-[11px] text-slate-500">
                              {r.relationship} · {r.phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Attached Verification Documents */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Supporting Documents ({selectedApp.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {doc.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">Select an Application</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Choose a tenancy application from the left panel to inspect the full applicant dossier, verify Uganda NIN, and issue leases.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Decline Application</h3>
                <p className="text-xs text-slate-500">Applicant: {selectedApp.tenantName}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Decline</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl mb-2"
              >
                <option value="">Select standard reason...</option>
                <option value="Property already reserved by earlier applicant">Property already reserved by earlier applicant</option>
                <option value="Income-to-rent ratio does not meet landlord threshold">Income-to-rent ratio does not meet landlord threshold</option>
                <option value="Incomplete documentation or NIN verification issue">Incomplete documentation or NIN verification issue</option>
                <option value="Move-in timeline incompatible with current tenancy">Move-in timeline incompatible with current tenancy</option>
                <option value="Pet policy incompatibility">Pet policy incompatibility</option>
              </select>

              <textarea
                placeholder="Additional notes to tenant..."
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason}
                onClick={() => handleUpdateStatus('rejected')}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
