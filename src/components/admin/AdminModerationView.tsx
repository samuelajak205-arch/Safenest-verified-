import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileCheck,
  FileText,
  User,
  Phone,
  Mail,
  Building,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useSafeNestStore } from '../../lib/store';
import { LandlordApplication } from '../../types';

interface ModerationPhotoItem {
  id: string;
  photoUrl: string;
  photoType: string;
  propertyId: string;
  propertyTitle: string;
  landlordName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
}

export const AdminModerationView: React.FC = () => {
  const store = useSafeNestStore();
  const [mainTab, setMainTab] = useState<'photos' | 'applications'>('photos');
  const [selectedPhoto, setSelectedPhoto] = useState<ModerationPhotoItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<LandlordApplication | null>(null);
  const [appSubFilter, setAppSubFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Extract photos
  const allPhotos: ModerationPhotoItem[] = store.properties.flatMap((prop) =>
    prop.images.map((img) => ({
      id: img.id,
      photoUrl: img.url,
      photoType: 'Listing',
      propertyId: prop.id,
      propertyTitle: prop.title,
      landlordName: prop.landlordName || 'Verified Landlord',
      status: img.status,
      reviewedAt: img.reviewedAt,
    }))
  );

  const pendingPhotos = allPhotos.filter((p) => p.status === 'pending');
  const auditedPhotos = allPhotos.filter((p) => p.status !== 'pending');

  // Applications
  const pendingApps = store.applications.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  );
  const approvedApps = store.applications.filter((a) => a.status === 'approved');
  const rejectedApps = store.applications.filter((a) => a.status === 'rejected');

  const displayedApps =
    appSubFilter === 'pending'
      ? pendingApps
      : appSubFilter === 'approved'
      ? approvedApps
      : rejectedApps;

  const handleApprovePhoto = (item: ModerationPhotoItem) => {
    store.moderatePhoto(
      item.propertyId,
      item.id,
      'approve',
      undefined,
      'Admin verified authentic real-world Uganda property photo.'
    );
    if (selectedPhoto) setSelectedPhoto(null);
  };

  const handleRejectPhoto = (item: ModerationPhotoItem) => {
    store.moderatePhoto(
      item.propertyId,
      item.id,
      'reject',
      'Blurry/Low quality',
      'Photo failed SafeNest anti-stock verification.'
    );
    if (selectedPhoto) setSelectedPhoto(null);
  };

  const handleApproveApp = (appId: string) => {
    store.approveApplication(appId, 'Admin verified Uganda NIN and ownership title deed.');
    if (selectedApp) setSelectedApp({ ...selectedApp, status: 'approved' });
  };

  const handleRejectApp = (appId: string) => {
    store.rejectApplication(appId, 'Deed records could not be verified with lands registry.');
    if (selectedApp) setSelectedApp({ ...selectedApp, status: 'rejected' });
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900">Moderation & Verification</h1>
          <p className="text-xs text-slate-500">
            Audit property photography authenticity & landlord KYC documents
          </p>
        </div>
      </div>

      {/* Main Tabs: Pending Photos / Landlord Applications */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
        <button
          onClick={() => setMainTab('photos')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            mainTab === 'photos'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Pending Photos</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              pendingPhotos.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {pendingPhotos.length}
          </span>
        </button>

        <button
          onClick={() => setMainTab('applications')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            mainTab === 'applications'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>Landlord Applications</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              pendingApps.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {pendingApps.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING PHOTOS QUEUE */}
      {mainTab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900">
              Photos Review Queue ({pendingPhotos.length})
            </h2>
            <span className="text-[11px] text-slate-500">Anti-Stock Image Filter Active</span>
          </div>

          {pendingPhotos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">All photos audited!</p>
              <p className="text-xs">No pending photos currently waiting for verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingPhotos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={item.photoUrl}
                      alt={item.propertyTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                      {item.photoType}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {item.propertyTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500">Landlord: {item.landlordName}</p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRejectPhoto(item)}
                        className="flex-1 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-bold text-xs flex items-center justify-center gap-1 min-h-[40px]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprovePhoto(item)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 min-h-[40px] shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Audited Photos */}
          {auditedPhotos.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Recently Audited Photos ({auditedPhotos.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {auditedPhotos.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden p-1.5 flex items-center gap-2"
                  >
                    <img
                      src={item.photoUrl}
                      alt="Audited"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="min-w-0">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-700 truncate mt-0.5">
                        {item.propertyTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LANDLORD APPLICATIONS QUEUE */}
      {mainTab === 'applications' && (
        <div className="space-y-4">
          {/* Subfilter: Pending / Approved / Rejected */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'pending', label: 'Pending', count: pendingApps.length },
              { id: 'approved', label: 'Approved', count: approvedApps.length },
              { id: 'rejected', label: 'Rejected', count: rejectedApps.length },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setAppSubFilter(sub.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  appSubFilter === sub.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sub.label}</span>
                <span className="text-[10px] opacity-80">({sub.count})</span>
              </button>
            ))}
          </div>

          {/* Applications list */}
          <div className="space-y-3">
            {displayedApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No applications in this category</p>
              </div>
            ) : (
              displayedApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm border border-emerald-200">
                        {app.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">{app.fullName}</h3>
                        <p className="text-[11px] text-slate-500">
                          {app.physicalAddress || 'Kampala, Uganda'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400">NIN: </span>
                      <span className="font-bold text-slate-800">{app.nationalIdNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone: </span>
                      <span>{app.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 min-h-[40px] flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Dossier & Deeds</span>
                    </button>

                    {app.status !== 'approved' && (
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 min-h-[40px] shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dossier Inspection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Landlord Verification Dossier
              </span>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">{selectedApp.fullName}</h3>
              <p className="text-xs text-slate-500">{selectedApp.email}</p>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Uganda NIN:</span>
                <span className="font-bold text-emerald-700">{selectedApp.nationalIdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physical Address:</span>
                <span>{selectedApp.physicalAddress || 'Plot 14, Kololo, Kampala'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Property Locations:</span>
                <span>{selectedApp.propertyLocations || 'Kampala & Wakiso'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application Date:</span>
                <span>{new Date(selectedApp.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Submitted Deeds & Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Submitted Verification Documents</h4>
              <div className="space-y-1.5">
                {[
                  { name: 'Uganda National Identification Card (NIN)', status: 'Authentic' },
                  { name: 'Mailo Land Title Registry Deed Certificate', status: 'Verified' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">{doc.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approve / Reject Controls */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleRejectApp(selectedApp.id);
                  setSelectedApp(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100"
              >
                Reject Application
              </button>
              <button
                onClick={() => {
                  handleApproveApp(selectedApp.id);
                  setSelectedApp(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm"
              >
                Approve as Landlord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
