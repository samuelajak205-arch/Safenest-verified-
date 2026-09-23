import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  ExternalLink,
  ChevronRight,
  Eye,
  MessageSquare,
  HardDrive,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LandlordApplication } from '../../types';

export const ApplicationReview: React.FC = () => {
  const store = useSafeNestStore();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');

  // Decision state
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Incomplete title documents or unverified NIN');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);
  const [requestedInfoNotes, setRequestedInfoNotes] = useState('');

  const selectedApp = store.applications.find((a) => a.id === selectedAppId);

  const filteredApplications = store.applications.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const handleApprove = (appId: string) => {
    store.approveApplication(appId, adminNotes || 'Approved by compliance officer. KYC verified.');
    setSelectedAppId(null);
  };

  const handleReject = () => {
    if (!selectedAppId) return;
    store.rejectApplication(selectedAppId, rejectionReason);
    setIsRejectModalOpen(false);
    setSelectedAppId(null);
  };

  const handleRequestInfo = () => {
    if (!selectedAppId || !requestedInfoNotes.trim()) return;
    store.requestMoreInfoApplication(selectedAppId, requestedInfoNotes);
    setIsRequestInfoModalOpen(false);
    setSelectedAppId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Landlord KYC & Application Vetting</h1>
            <p className="text-xs text-slate-500">
              Verify Uganda National ID (NIN), URA TIN, and title deeds before granting landlord status.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'submitted', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === item.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications List */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Applications ({filteredApplications.length})
          </h2>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
            {filteredApplications.map((app) => {
              const isSelected = selectedAppId === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setAdminNotes(app.adminNotes || '');
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border border-emerald-300'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{app.fullName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {app.businessName ? `${app.businessName} · ` : ''}
                        {app.propertyCount} properties
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : app.status === 'action_required'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>NIN: {app.nationalIdNumber}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Application Dossier */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedApp.fullName}</h2>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md uppercase ${
                        selectedApp.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedApp.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedApp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Application ID: #{selectedApp.id} · Submitted {new Date(selectedApp.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setIsRequestInfoModalOpen(true)}
                    className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200"
                  >
                    Request Info
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
                  >
                    Approve & Verify Landlord
                  </button>
                </div>
              </div>

              {/* Dossier Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Contact & Personal</h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedApp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedApp.email}</span>
                    </div>
                    <div>Address: <strong>{selectedApp.physicalAddress}</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Government & Business Registry</h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div>Uganda NIN: <strong className="font-mono text-emerald-800">{selectedApp.nationalIdNumber}</strong></div>
                    <div>URA TIN: <strong className="font-mono">{selectedApp.taxId || 'Not provided'}</strong></div>
                    <div>Business Entity: <strong>{selectedApp.businessName || 'Individual Landlord'}</strong></div>
                    <div>Portfolio Size: <strong>{selectedApp.propertyCount} Units</strong></div>
                  </div>
                </div>
              </div>

              {/* Uploaded Verification Documents */}
              <div>
                {(() => {
                  const docList: { id: string; type: string; name: string; url: string }[] = Array.isArray(
                    selectedApp.documents
                  )
                    ? selectedApp.documents
                    : Object.entries(selectedApp.documents || {})
                        .filter(([k, v]) => typeof v === 'string' && (v as string).startsWith('http'))
                        .map(([k, v]) => ({
                          id: k,
                          type: k.replace('Url', ''),
                          name: k.replace('Url', '').replace(/([A-Z])/g, ' $1').trim(),
                          url: v as string,
                        }));

                  return (
                    <>
                      <h4 className="text-xs font-bold text-slate-900 uppercase mb-3">
                        KYC Verification Documents ({docList.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {docList.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  {doc.type.replace('_', ' ')}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{doc.name}</h5>
                            </div>

                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center justify-center gap-1 py-1 px-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-[11px] font-semibold"
                            >
                              <Eye className="w-3 h-3" />
                              Inspect Document
                            </a>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Internal Admin Compliance Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Internal Verification Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Cross-referenced NIN with Uganda National Identification and Registration Authority (NIRA). Title deed validated."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No Application Selected</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select an applicant from the list on the left to review their identity and property credentials.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-rose-700 text-sm">Reject Landlord Application</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {isRequestInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-amber-800 text-sm">Request Additional Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions for Applicant *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please upload a clearer photo of your Uganda National ID card front and back."
                value={requestedInfoNotes}
                onChange={(e) => setRequestedInfoNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRequestInfoModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInfo}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl"
              >
                Send Request to Landlord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
