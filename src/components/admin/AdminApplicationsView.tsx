import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  Building,
  X,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LandlordApplication } from '../../types';

export const AdminApplicationsView: React.FC = () => {
  const store = useSafeNestStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<LandlordApplication | null>(null);

  const pendingApps = store.applications.filter((a) => a.status === 'submitted' || a.status === 'under_review');
  const approvedApps = store.applications.filter((a) => a.status === 'approved');
  const rejectedApps = store.applications.filter((a) => a.status === 'rejected');

  const displayedApps =
    activeTab === 'pending'
      ? pendingApps
      : activeTab === 'approved'
      ? approvedApps
      : rejectedApps;

  const handleApprove = (appId: string) => {
    store.approveApplication(appId, 'Admin verified Uganda NIN and ownership title deed.');
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, status: 'approved' });
    }
  };

  const handleReject = (appId: string) => {
    store.rejectApplication(appId, 'Property deed could not be reconciled with Ministry of Lands registry.');
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, status: 'rejected' });
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Landlord Applications</h1>
          <p className="text-xs text-slate-500">
            NIN and property title deed verification for Uganda landlords
          </p>
        </div>
      </div>

      {/* Tabs: Pending (2) | Approved | Rejected */}
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

      {/* Application Cards List */}
      <div className="space-y-3">
        {displayedApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
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
                    {app.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{app.fullName}</h3>
                    <p className="text-xs text-slate-500">{app.physicalAddress || 'Kampala, Uganda'}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Document count & NIN badge */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                <span>NIN: <strong>{app.nationalIdNumber}</strong></span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {Array.isArray(app.documents) ? app.documents.length : 2} verified documents
                </span>
              </div>

              {/* Review green button */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Review Application</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal (with Approve and Reject buttons) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Landlord KYC Verification</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <p><strong>Full Legal Name:</strong> {selectedApp.fullName}</p>
                <p><strong>Uganda NIN:</strong> {selectedApp.nationalIdNumber}</p>
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                <p><strong>Physical Address:</strong> {selectedApp.physicalAddress || 'Kampala, Uganda'}</p>
                <p><strong>Property Locations:</strong> {selectedApp.propertyLocations || 'Kampala & Wakiso'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Submitted Documents ({Array.isArray(selectedApp.documents) ? selectedApp.documents.length : 2})</h4>
                <div className="space-y-1.5">
                  {(Array.isArray(selectedApp.documents) ? selectedApp.documents : [
                    { id: '1', name: 'National Identification Card (NIN)', status: 'verified' },
                    { id: '2', name: 'Kampala Mailo Land Title Deed', status: 'verified' }
                  ]).map((doc: any) => (
                    <div key={doc.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-800 text-[11px]">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        {doc.status || 'verified'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions: Approve & Reject */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                {(selectedApp.status === 'submitted' || selectedApp.status === 'under_review') ? (
                  <>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      className="flex-1 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-xl text-xs min-h-[44px] flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs min-h-[44px] flex items-center justify-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Landlord</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs min-h-[44px]"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
