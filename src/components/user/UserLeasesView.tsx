import React, { useState } from 'react';
import {
  FileSignature,
  Calendar,
  Wrench,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  Send,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LeaseAgreement } from '../../types';

interface UserLeasesViewProps {
  onBrowseRentals: () => void;
}

export const UserLeasesView: React.FC<UserLeasesViewProps> = ({ onBrowseRentals }) => {
  const store = useSafeNestStore();
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState<LeaseAgreement | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<LeaseAgreement | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);

  // User's active or historic leases
  const userLeases = store.leases.filter(
    (l) => l.tenantId === store.currentUser.id || l.tenantEmail === store.currentUser.email
  );

  const handleSendMaintenance = (lease: LeaseAgreement) => {
    if (!maintenanceNotes.trim()) return;
    store.submitInquiry({
      propertyId: lease.propertyId,
      propertyTitle: `🛠️ Maintenance: ${lease.propertyTitle}`,
      propertyImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
      userId: store.currentUser.id,
      landlordId: lease.landlordId,
      name: store.currentUser.fullName,
      email: store.currentUser.email,
      phone: store.currentUser.phone || '+256 700 000 000',
      message: `[Maintenance Request]: ${maintenanceNotes}`,
      preferredContact: 'in_app',
    });
    setMaintenanceSuccess(true);
    setTimeout(() => {
      setMaintenanceSuccess(false);
      setShowMaintenanceModal(null);
      setMaintenanceNotes('');
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">My Leases</h1>
          <p className="text-xs text-slate-500">
            Digital contracts, rent schedules, and maintenance requests
          </p>
        </div>
      </div>

      {userLeases.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileSignature className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">No active leases yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Once you apply for a verified rental and sign your lease, your digital tenancy documents will appear here.
            </p>
          </div>
          <button
            onClick={onBrowseRentals}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs min-h-[44px]"
          >
            Browse Verified Properties
          </button>
        </div>
      ) : (
        /* Lease Cards */
        <div className="space-y-4">
          {userLeases.map((lease) => (
            <div
              key={lease.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-shadow space-y-3.5"
            >
              {/* Header row with status badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {lease.status === 'active' ? 'Active Lease' : lease.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">#{lease.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {lease.propertyTitle}
                  </h3>
                  <p className="text-xs text-slate-500">{lease.propertyAddress}, {lease.propertyCity}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-600">
                    UGX {lease.monthlyRent?.toLocaleString() || '0'}
                  </div>
                  <span className="text-[10px] text-slate-400">per month</span>
                </div>
              </div>

              {/* Lease Dates */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">Commencement</span>
                  <strong className="text-slate-800 font-semibold">{lease.startDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">Expiration</span>
                  <strong className="text-slate-800 font-semibold">{lease.endDate}</strong>
                </div>
              </div>

              {/* Action Buttons: View Lease | Rent Calendar | Maintenance */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedLease(lease)}
                  className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>View Lease</span>
                </button>

                <button
                  onClick={() => setShowCalendarModal(lease)}
                  className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Rent Calendar</span>
                </button>

                <button
                  onClick={() => setShowMaintenanceModal(lease)}
                  className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Lease Modal */}
      {selectedLease && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Digital Tenancy Agreement</h3>
              </div>
              <button
                onClick={() => setSelectedLease(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">{selectedLease.propertyTitle}</p>
                <p className="text-slate-500">{selectedLease.propertyAddress}, {selectedLease.propertyCity}</p>
                <p><strong>Landlord:</strong> {selectedLease.landlordName} ({selectedLease.landlordPhone || 'Verified'})</p>
                <p><strong>Tenant:</strong> {selectedLease.tenantName}</p>
                <p><strong>Monthly Rent:</strong> UGX {selectedLease.monthlyRent?.toLocaleString() || '0'}</p>
                <p><strong>Security Deposit:</strong> UGX {selectedLease.securityDeposit?.toLocaleString() || '0'}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Clauses & Regulations</h4>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[11px] leading-relaxed">
                  <p><strong>Quiet Hours:</strong> {selectedLease.terms?.quietHours || '10:00 PM - 6:00 AM'}</p>
                  <p><strong>Pet Policy:</strong> {selectedLease.terms?.petPolicy || 'Prior written consent required'}</p>
                  <p><strong>Maintenance:</strong> {selectedLease.terms?.maintenanceResponsibilities}</p>
                  <p><strong>Subletting:</strong> {selectedLease.terms?.sublettingPolicy || 'Strictly forbidden'}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px]">
                  <span className="text-emerald-800 font-bold block">Landlord Signature</span>
                  <span className="text-emerald-700 text-[10px]">{selectedLease.landlordSignature?.signatureData || 'Verified'}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px]">
                  <span className="text-emerald-800 font-bold block">Tenant Signature</span>
                  <span className="text-emerald-700 text-[10px]">{selectedLease.tenantSignature?.signatureData || 'Signed'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedLease(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rent Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Rent Payment Calendar</h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Monthly rent of <strong>UGX {showCalendarModal.monthlyRent?.toLocaleString() || '0'}</strong> is due on the <strong>{showCalendarModal.paymentDueDate || 1}st of each month</strong>.
              </p>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {[
                  { month: 'September 2026', status: 'Paid', color: 'text-emerald-600 bg-emerald-50' },
                  { month: 'October 2026', status: 'Upcoming (Oct 1)', color: 'text-amber-600 bg-amber-50' },
                  { month: 'November 2026', status: 'Scheduled (Nov 1)', color: 'text-slate-500 bg-slate-50' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                    <span className="font-semibold text-slate-800">{item.month}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCalendarModal(null)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Request Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Request Maintenance</h3>
              </div>
              <button
                onClick={() => setShowMaintenanceModal(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {maintenanceSuccess ? (
              <div className="py-6 text-center text-emerald-600 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-xs">Request Sent to Landlord</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Describe the issue at <strong>{showMaintenanceModal.propertyTitle}</strong> (e.g., plumbing, electrical, lock repair):
                </p>
                <textarea
                  rows={3}
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder="e.g. Master bathroom water heater is tripping the circuit breaker."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMaintenanceModal(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendMaintenance(showMaintenanceModal)}
                    className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
